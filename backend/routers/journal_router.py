from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import JournalEntry

journal_router = APIRouter()

class JournalCreate(BaseModel):
    user_id: int
    content: str

@journal_router.post("/")
def create_journal(entry: JournalCreate, db: Session = Depends(get_db)):
    new_entry = JournalEntry(user_id=entry.user_id, content=entry.content)
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return {"message": "Journal entry created", "entry_id": new_entry.id}

@journal_router.get("/{user_id}")
def get_journals(user_id: int, db: Session = Depends(get_db)):
    entries = db.query(JournalEntry).filter(JournalEntry.user_id == user_id).all()
    return {
        "journals": [
            {"id": e.id, "content": e.content}
            for e in entries
        ]
    }
