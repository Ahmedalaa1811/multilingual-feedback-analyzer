from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    text_original = Column(String)
    text_translated = Column(String)
    sentiment = Column(String)
    language = Column(String)
    product = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())