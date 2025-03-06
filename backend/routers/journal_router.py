from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import JournalEntry, BotComment

journal_router = APIRouter()

class JournalCreate(BaseModel):
    user_id: int
    title: str         # new: journal title
    content: str

@journal_router.post("/")
def create_journal(entry: JournalCreate, db: Session = Depends(get_db)):
    new_entry = JournalEntry(
        user_id=entry.user_id,
        title=entry.title,
        content=entry.content
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return {"message": "Journal entry created", "entry_id": new_entry.id}

@journal_router.get("/{user_id}")
def get_journals(user_id: int, db: Session = Depends(get_db)):
    entries = db.query(JournalEntry).filter(JournalEntry.user_id == user_id).all()
    # Return just ID + Title so user can click to see detail
    return {
        "journals": [
            {"id": e.id, "title": e.title}
            for e in entries
        ]
    }

@journal_router.get("/{user_id}/detail/{journal_id}")
def get_journal_detail(user_id: int, journal_id: int, db: Session = Depends(get_db)):
    """
    Return the specific journal content + the bot comments for that journal.
    """
    journal = db.query(JournalEntry).filter(
        JournalEntry.user_id == user_id,
        JournalEntry.id == journal_id
    ).first()
    if not journal:
        return {"error": "Journal not found"}

    # Fetch comments associated with this journal
    comments = db.query(BotComment).filter(
        BotComment.user_id == user_id,
        BotComment.journal_id == journal_id
    ).all()

    # Return the journal and all the comments
    return {
        "journal": {
            "id": journal.id,
            "title": journal.title,
            "content": journal.content
        },
        "comments": [
            {
                "id": c.id,
                "bot_id": c.bot_id,
                "comment": c.comment,
                "created_at": c.created_at
            }
            for c in comments
        ]
    }

@journal_router.delete("/{journal_id}")
def delete_journal(journal_id: int, db: Session = Depends(get_db)):
    """
    Deletes the journal with the given journal_id.
    """
    journal = db.query(JournalEntry).filter(JournalEntry.id == journal_id).first()
    if not journal:
        return {"error": "Journal not found"}

    db.delete(journal)
    db.commit()
    return {"message": f"Journal {journal_id} deleted."}
