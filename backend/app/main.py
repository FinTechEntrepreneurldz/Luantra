from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, Optional
import json
from datetime import datetime
import uuid
import os

app = FastAPI(
    title="Luantra Backend API",
    version="1.0.0",
    description="Enterprise AI Platform Backend"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://luantra.com", "https://www.luantra.com", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (will replace with database later)
users_db = {}
projects_db = {}
files_db = {}

@app.get("/")
def read_root():
    return {"message": "Luantra Backend API", "status": "running", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "luantra-backend",
        "version": "1.0.0"
    }

# Authentication
@app.post("/api/v1/auth/login")
def login(credentials: Dict[str, str]):
    username = credentials.get("username")
    password = credentials.get("password")
    
    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password required")
    
    # Simple user creation/login
    user_id = len(users_db) + 1
    user = {
        "id": user_id,
        "username": username,
        "email": f"{username}@example.com",
        "created_at": datetime.utcnow().isoformat()
    }
    users_db[user_id] = user
    
    session_id = f"session_{user_id}_{int(datetime.utcnow().timestamp())}"
    
    return {
        "access_token": session_id,
        "token_type": "bearer",
        "user": user
    }

# Projects
@app.post("/api/v1/projects")
def create_project(project_data: Dict[str, Any]):
    project_id = len(projects_db) + 1
    project = {
        "id": project_id,
        "name": project_data["name"],
        "description": project_data.get("description", ""),
        "user_id": project_data.get("user_id", 1),
        "config": project_data.get("config", {}),
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    }
    projects_db[project_id] = project
    return project

@app.get("/api/v1/projects/{project_id}")
def get_project(project_id: int):
    project = projects_db.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

# File upload
@app.post("/api/v1/upload")
async def upload_file(file: UploadFile = File(...), project_id: Optional[int] = None):
    content = await file.read()
    
    file_id = len(files_db) + 1
    file_record = {
        "file_id": file_id,
        "filename": file.filename,
        "content_type": file.content_type,
        "file_size": len(content),
        "project_id": project_id,
        "status": "uploaded",
        "created_at": datetime.utcnow().isoformat()
    }
    files_db[file_id] = file_record
    
    return file_record

# Metrics
@app.get("/api/v1/metrics/realtime")
def get_metrics():
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "metrics": {
            "models_deployed": "23",
            "platform_uptime": "99.97",
            "enterprise_clients": "156",
            "active_users": str(len(users_db)),
            "total_projects": str(len(projects_db)),
            "files_uploaded": str(len(files_db))
        },
        "status": "live"
    }

@app.get("/api/v1/status")
def get_status():
    return {
        "service": "luantra-backend",
        "status": "operational",
        "users": len(users_db),
        "projects": len(projects_db),
        "files": len(files_db)
    }
