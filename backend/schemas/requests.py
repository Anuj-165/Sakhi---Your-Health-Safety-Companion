# backend/schemas/requests.py
from pydantic import BaseModel

class QuestionRequest(BaseModel):
    question: str
    lang: str = "en" 
class ChapterRequest(BaseModel):
    chapter: str = None
    lang: str = "en"
