import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import Base, engine
from routers.user_router import user_router
from routers.journal_router import journal_router
from routers.bot_router import bot_router
from routers.comment_router import comment_router
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI()

Base.metadata.create_all(bind=engine)

origins = [
    "http://localhost:3000",
    "http://34.28.109.2:3000", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,   
    allow_credentials=True,   
    allow_methods=["*"],  
    allow_headers=["*"],  
)

class CustomCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS, PUT, DELETE"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response

app.add_middleware(CustomCORSMiddleware)

@app.options("/{path:path}")
async def options_handler(path: str, request: Request):
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
        "Access-Control-Allow-Headers": "*"
    }
    return JSONResponse(status_code=200, content={"message": "CORS preflight OK"}, headers=headers)

@app.get("/")
def root():
    return {"message": "FastAPI is running successfully 🎉"}

app.include_router(user_router, prefix="/users", tags=["Users"])
app.include_router(journal_router, prefix="/journals", tags=["Journals"])
app.include_router(bot_router, prefix="/bots", tags=["Bots"])
app.include_router(comment_router, prefix="/comments", tags=["Comments"])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
