from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)   
    content = Column(Text)
    comments = relationship("BotComment", backref="journal", cascade="all, delete")

class Bot(Base):
    __tablename__ = "bots"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    bot_name = Column(String)
    bot_prompt = Column(Text)

class BotComment(Base):
    __tablename__ = "bot_comments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    journal_id = Column(Integer, ForeignKey("journal_entries.id"))
    bot_id = Column(Integer, ForeignKey("bots.id"))
    bot_name = Column(String)
    comment = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    journal_id = Column(Integer, ForeignKey("journal_entries.id", ondelete="CASCADE"))
