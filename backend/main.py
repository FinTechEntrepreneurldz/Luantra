from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import json
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple storage
files_data = []

@app.get("/")
def root():
    return {"message": "Luantra Backend", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

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
    
    # Simple analysis
    lines = content_str.split('\n')
    analysis = {
        "type": "csv" if file.filename.endswith('.csv') else "file",
        "rows": len(lines) - 1,  # minus header
        "filename": file.filename,
        "size": len(content),
        "insights": f"Uploaded {file.filename} with {len(lines)} lines"
    }
    
    file_info = {
        "id": len(files_data) + 1,
        "filename": file.filename,
        "analysis": analysis,
        "uploaded_at": datetime.now().isoformat()
    }
    files_data.append(file_info)
    
    return {
        "file_id": file_info["id"], 
        "status": "processed", 
        "analysis": analysis
    }

@app.post("/api/v1/chat")
def chat(message: dict):
    return {
        "response": "I'm analyzing your request and building your solution!",
        "status": "processed"
    }
