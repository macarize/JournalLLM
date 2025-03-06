from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.hash import bcrypt

from database import get_db
from models import User

user_router = APIRouter()

class UserCreate(BaseModel):
    username: str
    password: str

@user_router.post("/signup")
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        return {"error": "Username already taken"}

    hashed_password = bcrypt.hash(user_data.password)
    user = User(username=user_data.username, password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User created", "user_id": user.id}

@user_router.post("/login")
def login(user_data: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_data.username).first()
    if not user or not bcrypt.verify(user_data.password, user.password):
        return {"error": "Invalid credentials"}
    return {"message": "Login successful", "user_id": user.id}

@user_router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).get(user_id)
    if user:
        db.delete(user)
        db.commit()
        return {"message": f"User {user_id} deleted"}
    return {"error": "User not found"}
