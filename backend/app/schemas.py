from pydantic import BaseModel
from typing import List, Optional

class QuizRequest(BaseModel):
    book_id: str
    difficulty: str
    num_questions: int

class Question(BaseModel):
    question: str
    options: List[str]
    answer_index: int
    explanation: str

class QuizResponse(BaseModel):
    questions: List[Question]

class BookMetadata(BaseModel):
    title: str
    authors: List[str]
    google_books_id: str
    description: Optional[str] = None

class HistoryEntry(BaseModel):
    book: BookMetadata
    questions: List[Question]
    responses: List[int]
    score: float
    timestamp: Optional[str] = None