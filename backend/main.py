import uvicorn
from fastapi import FastAPI
from database import Base, engine
from routers.user_router import user_router
from routers.journal_router import journal_router
from routers.bot_router import bot_router
from routers.comment_router import comment_router

app = FastAPI()

# Create DB tables on startup if they don't exist
Base.metadata.create_all(bind=engine)

# Include the routers
app.include_router(user_router, prefix="/users", tags=["Users"])
app.include_router(journal_router, prefix="/journals", tags=["Journals"])
app.include_router(bot_router, prefix="/bots", tags=["Bots"])
app.include_router(comment_router, prefix="/comments", tags=["Comments"])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
