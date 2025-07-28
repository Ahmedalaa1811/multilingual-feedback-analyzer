from fastapi import FastAPI, HTTPException, Depends, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from dotenv import load_dotenv
import os
import json
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from sqlalchemy import func

from database import SessionLocal, engine
from models import Feedback, Base
from schemas import FeedbackResponse

# ----------- ENVIRONMENT SETUP -----------
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("❌ GEMINI_API_KEY not found in environment.")

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    generation_config={"temperature": 0.7},
    safety_settings=[
        {"category": HarmCategory.HARM_CATEGORY_HARASSMENT, "threshold": HarmBlockThreshold.BLOCK_NONE},
        {"category": HarmCategory.HARM_CATEGORY_HATE_SPEECH, "threshold": HarmBlockThreshold.BLOCK_NONE},
        {"category": HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, "threshold": HarmBlockThreshold.BLOCK_NONE},
        {"category": HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, "threshold": HarmBlockThreshold.BLOCK_NONE}
    ]
)

# ----------- FASTAPI SETUP -----------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------- SCHEMAS -----------
class FeedbackInput(BaseModel):
    text: str
    product: str = "default-product"

# ----------- DB DEPENDENCY -----------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ----------- POST /api/feedback -----------
@app.post("/api/feedback")
async def submit_feedback(data: FeedbackInput, db: Session = Depends(get_db)):
    print(f"📩 Incoming data: {data}")
    prompt = f"""
You are a multilingual feedback analyzer API.

Given this customer feedback:
\"\"\"{data.text}\"\"\"

Perform:
1. Detect the language (use ISO 639-1 code only, e.g., "en", "fr", "ar").
2. Translate the feedback to English.
3. Analyze the sentiment: "positive", "neutral", or "negative".

⚠️ Respond ONLY with this valid JSON object — no explanation, no markdown:
{{
  "language": "xx",
  "translated_text": "...",
  "sentiment": "..."
}}
"""

    try:
        gemini_response = model.generate_content(prompt)
        response_text = gemini_response.text.strip()
        print("🔁 Gemini raw response:", response_text)

        if response_text.startswith("```json") or response_text.startswith("```"):
            response_text = response_text.replace("```json", "").replace("```", "").strip()

        parsed = json.loads(response_text)

    except Exception as e:
        import traceback
        print("❌ Gemini API error:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Gemini API error occurred")

    new_entry = Feedback(
        text_original=data.text,
        text_translated=parsed["translated_text"],
        sentiment=parsed["sentiment"],
        language=parsed["language"],
        product=data.product
    )

    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    print(f"✅ Inserted into DB: {new_entry.id} - {new_entry.product}")

    return {
        "id": new_entry.id,
        "original": new_entry.text_original,
        "translated": new_entry.text_translated,
        "sentiment": new_entry.sentiment,
        "language": new_entry.language,
        "product": new_entry.product
    }

# ----------- GET /api/feedback -----------
@app.get("/api/feedback", response_model=List[FeedbackResponse])
def get_feedback(
    language: Optional[str] = Query(None),
    product: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Feedback)
    if language:
        query = query.filter(Feedback.language == language)
    if product:
        query = query.filter(Feedback.product == product)
    return query.order_by(Feedback.created_at.desc()).all()

# ----------- GET /api/stats -----------
@app.get("/api/stats")
def get_feedback_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(Feedback.id)).scalar()
    
    sentiment_counts = (
        db.query(Feedback.sentiment, func.count(Feedback.id))
        .group_by(Feedback.sentiment)
        .all()
    )

    stats = {sentiment: count for sentiment, count in sentiment_counts}

    response = {
        "total": total,
        "positive": stats.get("positive", 0),
        "neutral": stats.get("neutral", 0),
        "negative": stats.get("negative", 0),
        "percent_positive": round(stats.get("positive", 0) / total * 100, 2) if total else 0.0,
        "percent_neutral": round(stats.get("neutral", 0) / total * 100, 2) if total else 0.0,
        "percent_negative": round(stats.get("negative", 0) / total * 100, 2) if total else 0.0,
    }

    return response

# ----------- GET /api/translate -----------
@app.post("/api/translate")
async def translate_text(payload: dict = Body(...)):
    text = payload.get("text")
    target_lang = payload.get("target_language", "en")  # fallback to English

    if not text:
        raise HTTPException(status_code=400, detail="Text is required")

    prompt = f"""
You are a translation API.

Translate the following text to {target_lang}:
\"\"\"{text}\"\"\"

Respond ONLY with a valid JSON like this (no explanation, no markdown):
{{
  "translated_text": "..."
}}
"""

    try:
        gemini_response = model.generate_content(prompt)
        response_text = gemini_response.text.strip()
        print("🔁 Gemini translation raw:", response_text)

        if response_text.startswith("```json") or response_text.startswith("```"):
            response_text = response_text.replace("```json", "").replace("```", "").strip()

        parsed = json.loads(response_text)

    except Exception as e:
        import traceback
        print("❌ Translation failed:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Translation failed.")

    return {
        "original": text,
        "translated_text": parsed["translated_text"],
        "target_language": target_lang
    }


# ----------- CREATE TABLES IF NOT EXISTS -----------
Base.metadata.create_all(bind=engine)
