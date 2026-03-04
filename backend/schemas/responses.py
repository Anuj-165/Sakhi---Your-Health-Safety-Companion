# backend/schemas/responses.py
from pydantic import BaseModel
from typing import List

class QAResponse(BaseModel):
    question: str
    answer: str
    top_results: List[str]

class ChapterResponse(BaseModel):
    chapter: str
    page: int
    page_size: int
    content: List[str]
    total_pages: int

class StoryResponse(BaseModel):
    story: str
    risk: int
    risk_label: str
