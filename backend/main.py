from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware 
from routers import user, chapter, story, qa, period_tracker, chemist_locater
from database import Base, engine
import os
from fastapi.staticfiles import StaticFiles

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sakhi Offline Backend", version="0.1")


origins = [
    "http://localhost:3000",  # React default
    "http://localhost:5173",  # Vite default
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,             
    allow_credentials=True,           
    allow_methods=["*"],               
    allow_headers=["*"],               
)

if not os.path.exists("static"):
    os.makedirs("static")

app.mount("/static", StaticFiles(directory="static"), name="static")

# Routers
app.include_router(user.router, prefix="/user", tags=["User"])
app.include_router(chapter.router, prefix="/chapter", tags=["chapter"])
app.include_router(story.router, prefix="/story", tags=["Story"])
app.include_router(qa.router, prefix="/qa", tags=["QA"])
app.include_router(chemist_locater.router, prefix="/chem", tags=["chem"])
app.include_router(period_tracker.router, prefix="/periods", tags=["periods"])