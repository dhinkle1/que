from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import QuizRequest, QuizResponse, Question, BookMetadata, HistoryEntry
from .tasks import generate_quiz
from typing import List
import datetime
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory history store
history_db: List[HistoryEntry] = []

@app.get("/api/books", response_model=List[BookMetadata])
async def search_books(q: str):
    """
    Search books via Google Books API and return metadata.
    """
    params = {"q": q}
    resp = requests.get("https://www.googleapis.com/books/v1/volumes", params=params)
    if resp.status_code != 200:
        raise HTTPException(status_code=500, detail="Error fetching books from Google Books API")
    data = resp.json()
    results: List[BookMetadata] = []
    for item in data.get("items", []):
        info = item.get("volumeInfo", {})
        bm = BookMetadata(
            title=info.get("title", ""),
            authors=info.get("authors", []),
            google_books_id=item.get("id", ""),
            description=info.get("description"),
        )
        results.append(bm)
    return results

@app.post("/api/quiz", response_model=QuizResponse)
async def create_quiz(request: QuizRequest):
    """
    Generate a quiz based on book, difficulty, and number of questions.
    """
    questions = generate_quiz(request)
    return QuizResponse(questions=questions)

@app.post("/api/history", response_model=HistoryEntry)
async def save_history(entry: HistoryEntry):
    """
    Save a completed quiz to history and return stored entry with timestamp.
    """
    entry_data = entry.dict()
    entry_data["timestamp"] = datetime.datetime.utcnow().isoformat()
    stored = HistoryEntry(**entry_data)
    history_db.append(stored)
    return stored

@app.get("/api/history", response_model=List[HistoryEntry])
async def get_history():
    """
    Retrieve quiz history.
    """
    return history_db
