from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.sql import func
from typing import Dict, Any, Optional
import json
from datetime import datetime
import os
import io
import csv

app = FastAPI(title="Luantra Backend API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://luantra.com", "https://www.luantra.com", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
DATABASE_URL = "postgresql://luantra_user:luantra_secure_2024@34.45.208.83:5432/luantra"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    user_id = Column(Integer)
    config = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class FileUpload(Base):
    __tablename__ = "file_uploads"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    content_type = Column(String(100))
    file_size = Column(Integer)
    analysis_result = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Create tables
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")
except Exception as e:
    print(f"Database connection failed: {e}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Luantra Backend API", "status": "running", "version": "1.0.0"}

@app.get("/health")
def health_check():
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        db_status = "healthy"
    except:
        db_status = "disconnected"
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": db_status,
        "version": "1.0.0"
    }

@app.post("/api/v1/auth/login")
def login(credentials: Dict[str, str], db: Session = Depends(get_db)):
    username = credentials.get("username")
    password = credentials.get("password")
    
    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password required")
    
    # Check if user exists
    user = db.query(User).filter(User.username == username).first()
    if not user:
        # Create new user
        user = User(username=username, email=f"{username}@example.com")
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return {
        "access_token": f"session_{user.id}_{int(datetime.utcnow().timestamp())}",
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }

@app.post("/api/v1/projects")
def create_project(project_data: Dict[str, Any], db: Session = Depends(get_db)):
    project = Project(
        name=project_data["name"],
        description=project_data.get("description", ""),
        user_id=project_data.get("user_id", 1),
        config=project_data.get("config", {})
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "created_at": project.created_at.isoformat()
    }

@app.post("/api/v1/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    
    # Analyze the file
    analysis = {"error": "Analysis not implemented yet"}
    
    if file.content_type == "text/csv":
        try:
            csv_data = content.decode('utf-8')
            reader = csv.DictReader(io.StringIO(csv_data))
            rows = list(reader)
            analysis = {
                "type": "csv",
                "rows": len(rows),
                "columns": list(rows[0].keys()) if rows else [],
                "sample_data": rows[:3] if rows else []
            }
        except Exception as e:
            analysis = {"error": f"CSV parsing failed: {str(e)}"}
    
    # Save to database
    file_record = FileUpload(
        filename=file.filename,
        content_type=file.content_type,
        file_size=len(content),
        analysis_result=analysis
    )
    db.add(file_record)
    db.commit()
    db.refresh(file_record)
    
    return {
        "file_id": file_record.id,
        "filename": file_record.filename,
        "analysis": analysis,
        "status": "processed"
    }

@app.get("/api/v1/metrics/realtime")
def get_metrics(db: Session = Depends(get_db)):
    try:
        user_count = db.query(User).count()
        project_count = db.query(Project).count()
        file_count = db.query(FileUpload).count()
    except:
        user_count = project_count = file_count = 0
    
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "metrics": {
            "active_users": str(user_count),
            "total_projects": str(project_count),
            "files_uploaded": str(file_count),
            "models_deployed": "23",
            "platform_uptime": "99.97"
        },
        "status": "live"
    }
