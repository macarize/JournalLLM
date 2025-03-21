from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import JournalEntry, BotComment
from services.bot_service import get_vectorstore_for_user, update_user_vector_store  # or similar function

journal_router = APIRouter()

class JournalCreate(BaseModel):
    user_id: int
    title: str        
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

    user_journals = db.query(JournalEntry).filter(JournalEntry.user_id == entry.user_id).all()
    update_user_vector_store(entry.user_id, user_journals)

    return {"message": "Journal entry created", "entry_id": new_entry.id}

@journal_router.get("/{user_id}")
def get_journals(user_id: int, db: Session = Depends(get_db)):
    entries = db.query(JournalEntry).filter(JournalEntry.user_id == user_id).all()
    return {
        "journals": [
            {"id": e.id, "title": e.title}
            for e in entries
        ]
    }

@journal_router.get("/{user_id}/detail/{journal_id}")
def get_journal_detail(user_id: int, journal_id: int, db: Session = Depends(get_db)):
    journal = db.query(JournalEntry).filter(
        JournalEntry.user_id == user_id,
        JournalEntry.id == journal_id
    ).first()
    if not journal:
        return {"error": "Journal not found"}

    comments = db.query(BotComment).filter(
        BotComment.user_id == user_id,
        BotComment.journal_id == journal_id
    ).all()

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
                "created_at": c.created_at,
                "bot_name": c.bot_name
            }
            for c in comments
        ]
    }

@journal_router.delete("/{journal_id}")
def delete_journal(journal_id: int, db: Session = Depends(get_db)):
    journal = db.query(JournalEntry).filter(JournalEntry.id == journal_id).first()
    if not journal:
        return {"error": "Journal not found"}
    
    user_id = journal.user_id

    db.delete(journal)
    db.query(BotComment).filter(BotComment.journal_id == journal_id).delete()
    db.commit()

    vectorstore = get_vectorstore_for_user(user_id)
    doc_id = f"journal_{journal_id}"

    vectorstore.delete(ids=[doc_id])
    vectorstore.persist()

    return {"message": f"Journal {journal_id} deleted and Chroma embedding removed."}