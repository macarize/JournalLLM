from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import Bot, JournalEntry, BotComment
from services.bot_service import (
    update_user_vector_store,
    generate_bot_comment
)

comment_router = APIRouter()

class CommentRequest(BaseModel):
    user_id: int
    journal_id: int

@comment_router.post("/journal_comment")
def create_journal_comments(request: CommentRequest, db: Session = Depends(get_db)):
    bots = db.query(Bot).filter(Bot.user_id == request.user_id).all()
    if not bots:
        return {"message": "No bots found for user.", "comments": []}

    journal = db.query(JournalEntry).filter(
        JournalEntry.id == request.journal_id,
        JournalEntry.user_id == request.user_id
    ).first()
    if not journal:
        return {"error": "Journal not found for this user."}

    current_journal_text = journal.content

    new_comments = []
    for bot in bots:
        comment_text = generate_bot_comment(
            user_id=request.user_id,
            bot_prompt=bot.bot_prompt,
            new_journal_text=current_journal_text,
            exclude_journal_id=journal.id
        )
        bot_comment = BotComment(
            user_id=request.user_id,
            journal_id=request.journal_id,
            bot_id=bot.id,
            comment=comment_text,
            bot_name=bot.bot_name
        )
        db.add(bot_comment)
        db.commit()
        db.refresh(bot_comment)

        new_comments.append({
            "bot_name": bot.bot_name,
            "bot_id": bot.id,
            "comment_id": bot_comment.id,
            "comment": comment_text
        })

    return {"message": "Comments generated", "comments": new_comments}

@comment_router.delete("/{user_id}/comment/{comment_id}")
def delete_bot_comment(user_id: int, comment_id: int, db: Session = Depends(get_db)):
    comment = db.query(BotComment).filter(
        BotComment.id == comment_id,
        BotComment.user_id == user_id
    ).first()

    if not comment:
        return {"error": "Comment not found or does not belong to this user."}

    db.delete(comment)
    db.commit()
    return {"message": f"Comment {comment_id} deleted."}
