import os
from dotenv import load_dotenv
import google.generativeai as genai
import json

# Load .env variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is missing in your .env file.")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

# Initialize Gemini model
model = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    generation_config={"temperature": 0.7}
)

# Sample prompt
feedback_text = "هذا المنتج رائع جدًا وسهل الاستخدام!"
prompt = f"""
Analyze the following customer feedback:
- Text: "{feedback_text}"

Tasks:
1. Detect the language (return ISO code like 'en', 'fr', 'ar')
2. Translate it to English
3. Analyze the sentiment (positive / negative / neutral)

Respond ONLY in this JSON format:
{{
    "language": "<ISO code>",
    "translated_text": "<English translation>",
    "sentiment": "<sentiment>"
}}
"""

try:
    response = model.generate_content(prompt)
    text = response.text.strip()

    print("\nRaw Gemini Response:\n", text)

    result = json.loads(text)
    print("\nParsed Output:")
    print("Language:", result.get("language"))
    print("Translated:", result.get("translated_text"))
    print("Sentiment:", result.get("sentiment"))

except Exception as e:
    print("❌ Error while calling Gemini:", e)
