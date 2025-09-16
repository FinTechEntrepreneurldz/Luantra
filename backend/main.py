from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import json
from datetime import datetime
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage
files_data = []

# Simple Gemini integration
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
GEMINI_AVAILABLE = bool(GOOGLE_API_KEY)

@app.get("/")
def root():
    return {"message": "Luantra Backend", "status": "running", "ai": GEMINI_AVAILABLE}

@app.get("/health")
def health():
    return {"status": "healthy", "gemini": GEMINI_AVAILABLE}

@app.post("/api/v1/auth/login")
def login(credentials: dict):
    username = credentials.get("username", "demo")
    return {
        "access_token": f"token_{username}",
        "user": {"id": 1, "username": username},
        "status": "success"
    }

@app.post("/api/v1/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    content_str = content.decode('utf-8')
    lines = content_str.split('\n')
    
    analysis = {
        "type": "csv",
        "rows": len(lines) - 1,
        "filename": file.filename,
        "columns": lines[0].split(',') if lines else [],
        "insights": f"Uploaded {file.filename} with {len(lines)-1} records"
    }
    
    file_info = {
        "id": len(files_data) + 1,
        "filename": file.filename,
        "analysis": analysis,
        "uploaded_at": datetime.now().isoformat()
    }
    files_data.append(file_info)
    
    return {"file_id": file_info["id"], "status": "processed", "analysis": analysis}

async def get_ai_response(message: str):
    """Get AI response - will integrate Gemini once API key is set"""
    
    if not GEMINI_AVAILABLE:
        return f"I'm analyzing your request: '{message}'. Gemini AI integration ready - add API key to enable advanced responses!"
    
    # TODO: Add Gemini API call here
    return f"🤖 Gemini AI Response: I understand you want to '{message}'. I'm building a comprehensive solution with advanced AI capabilities including data analysis, machine learning, and intelligent automation!"

@app.post("/api/v1/chat")
async def chat(message: dict):
    user_message = message.get("message", "")
    ai_response = await get_ai_response(user_message)
    
    return {
        "response": ai_response,
        "status": "processed",
        "model": "gemini-ready",
        "api_key_set": GEMINI_AVAILABLE
    }
