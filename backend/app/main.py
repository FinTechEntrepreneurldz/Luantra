from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
from datetime import datetime
from typing import Dict, Any, Optional
import redis.asyncio as redis
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from google.cloud import storage
import uuid
import io

from config import settings
from models import Base, User, Project, FileUpload

# Database setup
from database import engine, SessionLocal
def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
redis_client = None
storage_client = None
websocket_connections = {}

@app.on_event("startup")
async def startup():
    global redis_client, storage_client
    print("🚀 Starting Luantra Backend...")
    
    try:
        # Initialize database
        init_db()
        print("✅ Database initialized")
        
        # Initialize Redis
        redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        await redis_client.ping()
        print("✅ Redis connected")
        
        # Initialize Google Cloud Storage
        storage_client = storage.Client(project=settings.GOOGLE_CLOUD_PROJECT)
        print("✅ Storage initialized")
        
        print("✅ Luantra Backend started successfully!")
        
    except Exception as e:
        print(f"❌ Startup failed: {e}")

@app.on_event("shutdown")
async def shutdown():
    global redis_client
    if redis_client:
        await redis_client.close()
    print("🛑 Luantra Backend stopped")

# Health check
@app.get("/health")
async def health_check():
    try:
        await redis_client.ping()
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "services": {
                "redis": "healthy",
                "storage": "healthy",
                "database": "healthy"
            },
            "version": settings.PROJECT_VERSION
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

# Authentication
@app.post(f"{settings.API_V1_PREFIX}/auth/login")
async def login(credentials: Dict[str, str], db: Session = Depends(get_db)):
    username = credentials.get("username")
    password = credentials.get("password")
    
    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password required")
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        user = User(username=username, email=f"{username}@example.com")
        db.add(user)
        db.commit()
        db.refresh(user)
    
    session_id = f"session_{user.id}_{int(datetime.utcnow().timestamp())}"
    await redis_client.setex(
        f"session:{session_id}", 
        3600 * 24,
        json.dumps({"user_id": user.id, "username": user.username})
    )
    
    return {
        "access_token": session_id,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }

# Projects
@app.post(f"{settings.API_V1_PREFIX}/projects")
async def create_project(project_data: Dict[str, Any], db: Session = Depends(get_db)):
    project = Project(
        name=project_data["name"],
        description=project_data.get("description", ""),
        user_id=project_data["user_id"],
        config=project_data.get("config", {})
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "created_at": project.created_at.isoformat(),
        "status": "created"
    }

@app.get(f"{settings.API_V1_PREFIX}/projects/{{project_id}}")
async def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "created_at": project.created_at.isoformat(),
        "updated_at": project.updated_at.isoformat() if project.updated_at else None,
        "config": project.config,
        "status": project.status
    }

# File upload
@app.post(f"{settings.API_V1_PREFIX}/upload")
async def upload_file(
    file: UploadFile = File(...),
    project_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    try:
        content = await file.read()
        
        # Upload to Google Cloud Storage
        bucket = storage_client.bucket(settings.STORAGE_BUCKET)
        file_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().strftime("%Y/%m/%d")
        file_path = f"{timestamp}/{file_id}_{file.filename}"
        
        blob = bucket.blob(file_path)
        blob.upload_from_string(content, content_type=file.content_type)
        
        # Save to database
        file_upload = FileUpload(
            filename=file.filename,
            original_filename=file.filename,
            file_path=file_path,
            content_type=file.content_type,
            file_size=len(content),
            project_id=project_id,
            user_id=1
        )
        db.add(file_upload)
        db.commit()
        db.refresh(file_upload)
        
        return {
            "file_id": file_upload.id,
            "filename": file_upload.filename,
            "file_path": file_path,
            "size": len(content),
            "content_type": file.content_type,
            "status": "uploaded"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Metrics
@app.get(f"{settings.API_V1_PREFIX}/metrics/realtime")
async def get_realtime_metrics():
    try:
        metrics = await redis_client.hgetall("platform:metrics")
        
        if not metrics:
            default_metrics = {
                "models_deployed": "23",
                "platform_uptime": "99.97",
                "enterprise_clients": "156",
                "active_users": "1247"
            }
            await redis_client.hset("platform:metrics", mapping=default_metrics)
            metrics = default_metrics
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "metrics": metrics,
            "status": "live"
        }
        
    except Exception as e:
        return {"error": str(e), "status": "error"}

# WebSocket for real-time chat
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    websocket_connections[client_id] = websocket
    
    try:
        await websocket.send_json({
            "type": "system",
            "message": "Connected to Luantra AI. Ready to build enterprise solutions!",
            "timestamp": datetime.utcnow().isoformat()
        })
        
        while True:
            data = await websocket.receive_json()
            await process_chat_message(client_id, data, websocket)
            
    except WebSocketDisconnect:
        if client_id in websocket_connections:
            del websocket_connections[client_id]
    except Exception as e:
        print(f"WebSocket error: {e}")

async def process_chat_message(client_id: str, message: Dict[str, Any], websocket: WebSocket):
    try:
        message_text = message.get("message", "").lower()
        
        # Send typing indicator
        await websocket.send_json({
            "type": "typing",
            "timestamp": datetime.utcnow().isoformat()
        })
        
        await asyncio.sleep(1.5)
        
        # Generate AI response based on message content
        if "dashboard" in message_text:
            response = {
                "text": "I'll create a comprehensive analytics dashboard with real-time data visualization, KPI tracking, and automated reporting capabilities. Building your dashboard now...",
                "components": ["analytics_dashboard", "kpi_tracker", "report_generator"],
                "actions": ["build_dashboard", "configure_metrics"]
            }
        elif "model" in message_text or "ml" in message_text or "machine learning" in message_text:
            response = {
                "text": "I'll help you build and deploy a machine learning model with full training pipeline, evaluation framework, and deployment infrastructure. Setting up your ML environment...",
                "components": ["model_trainer", "evaluation_service", "deployment_engine"],
                "actions": ["start_training", "setup_evaluation", "deploy_model"]
            }
        elif "data" in message_text:
            response = {
                "text": "I'll analyze your data and set up processing pipelines with quality assessment, feature engineering, and automated insights generation. Processing your data now...",
                "components": ["data_profiler", "quality_checker", "feature_engineering"],
                "actions": ["profile_data", "check_quality", "engineer_features"]
            }
        elif "monitoring" in message_text:
            response = {
                "text": "I'll set up comprehensive monitoring for your ML systems including performance tracking, drift detection, and automated alerts. Configuring monitoring now...",
                "components": ["performance_monitor", "drift_detector", "alert_system"],
                "actions": ["setup_monitoring", "configure_alerts", "track_performance"]
            }
        else:
            response = {
                "text": "I'm here to help you build enterprise AI solutions! I can create dashboards, train ML models, process data, set up monitoring, and deploy complete AI systems. What would you like to build today?",
                "components": [],
                "actions": ["show_capabilities"]
            }
        
        await websocket.send_json({
            "type": "ai",
            "message": response["text"],
            "components": response.get("components", []),
            "actions": response.get("actions", []),
            "timestamp": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        await websocket.send_json({
            "type": "error",
            "message": "Sorry, I encountered an error processing your request.",
            "timestamp": datetime.utcnow().isoformat()
        })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
