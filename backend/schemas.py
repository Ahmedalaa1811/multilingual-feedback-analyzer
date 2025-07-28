from pydantic import BaseModel
from datetime import datetime

class FeedbackResponse(BaseModel):
    id: int
    text_original: str
    text_translated: str
    sentiment: str
    language: str
    product: str
    created_at: datetime

    class Config:
        orm_mode = True