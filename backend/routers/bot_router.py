from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import Bot

bot_router = APIRouter()

class BotCreate(BaseModel):
    user_id: int
    bot_name: str
    bot_prompt: str

@bot_router.post("/")
def create_bot(bot_data: BotCreate, db: Session = Depends(get_db)):
    new_bot = Bot(
        user_id=bot_data.user_id,
        bot_name=bot_data.bot_name,
        bot_prompt=bot_data.bot_prompt
    )
    db.add(new_bot)
    db.commit()
    db.refresh(new_bot)
    return {"message": "Bot created", "bot_id": new_bot.id}

@bot_router.get("/{user_id}")
def get_bots(user_id: int, db: Session = Depends(get_db)):
    bots = db.query(Bot).filter(Bot.user_id == user_id).all()
    return {
        "bots": [
            {"id": b.id, "bot_name": b.bot_name, "bot_prompt": b.bot_prompt}
            for b in bots
        ]
    }

@bot_router.delete("/{bot_id}")
def delete_bot(bot_id: int, db: Session = Depends(get_db)):
    bot = db.query(Bot).filter(Bot.id == bot_id).first()
    if not bot:
        return {"error": "Bot not found"}

    db.delete(bot)
    db.commit()
    return {"message": f"Bot {bot_id} deleted."}
