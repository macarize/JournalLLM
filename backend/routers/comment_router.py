from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import Bot, JournalEntry
from services.bot_service import update_vector_store, generate_bot_comment

comment_router = APIRouter()

class CommentRequest(BaseModel):
    user_id: int
    new_journal_text: str

@comment_router.post("/")
def get_bot_comments(request: CommentRequest, db: Session = Depends(get_db)):
    # Get all bots for the user
    bots = db.query(Bot).filter(Bot.user_id == request.user_id).all()

    # Get all past journals for the user
    user_journals = db.query(JournalEntry).filter(JournalEntry.user_id == request.user_id).all()

    # Update the vector store with user's journals (simple approach)
    update_vector_store(user_journals)

    # Generate response from each bot
    responses = []
    for bot in bots:
        comment = generate_bot_comment(bot.bot_prompt, request.new_journal_text)
        responses.append({
            "bot_name": bot.bot_name,
            "comment": comment
        })

    return {"comments": responses}
