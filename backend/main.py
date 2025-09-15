from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Luantra Backend", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/v1/canvas/components")
def get_canvas_components():
    return {"components": [{"id": "dashboard", "name": "Analytics Dashboard"}]}

@app.post("/api/v1/auth/login")
def login(credentials: dict):
    username = credentials.get("username", "demo")
    return {
        "access_token": f"token_{username}",
        "user": {"id": 1, "username": username},
        "status": "success"
    }

# Simple in-memory storage for now
users_store = []

@app.post("/api/v1/users")
def create_user(user_data: dict):
    user = {
        "id": len(users_store) + 1,
        "username": user_data["username"],
        "email": user_data.get("email", f"{user_data['username']}@example.com")
    }
    users_store.append(user)
    return user

@app.get("/api/v1/users")
def list_users():
    return {"users": users_store, "total": len(users_store)}

from fastapi import UploadFile, File
import csv
import io

# File storage
files_store = []

@app.post("/api/v1/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    
    # Basic file analysis
    analysis = {"type": "unknown", "size": len(content)}
    
    if file.content_type == "text/csv":
        try:
            csv_content = content.decode('utf-8')
            reader = csv.DictReader(io.StringIO(csv_content))
            rows = list(reader)
            analysis = {
                "type": "csv",
                "rows": len(rows),
                "columns": list(rows[0].keys()) if rows else [],
                "sample": rows[:2] if rows else []
            }
        except:
            analysis["type"] = "csv_error"
    
    # Store file record
    file_record = {
        "id": len(files_store) + 1,
        "filename": file.filename,
        "size": len(content),
        "analysis": analysis
    }
    files_store.append(file_record)
    
    return {
        "file_id": file_record["id"],
        "status": "uploaded",
        "analysis": analysis
    }

@app.get("/api/v1/files")
def list_files():
    return {"files": files_store, "total": len(files_store)}

from fastapi import UploadFile, File
import csv
import io

# File storage
files_store = []

@app.post("/api/v1/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    
    # Basic file analysis
    analysis = {"type": "unknown", "size": len(content)}
    
    if file.content_type == "text/csv":
        try:
            csv_content = content.decode('utf-8')
            reader = csv.DictReader(io.StringIO(csv_content))
            rows = list(reader)
            analysis = {
                "type": "csv",
                "rows": len(rows),
                "columns": list(rows[0].keys()) if rows else [],
                "sample": rows[:2] if rows else []
            }
        except:
            analysis["type"] = "csv_error"
    
    # Store file record
    file_record = {
        "id": len(files_store) + 1,
        "filename": file.filename,
        "size": len(content),
        "analysis": analysis
    }
    files_store.append(file_record)
    
    return {
        "file_id": file_record["id"],
        "status": "uploaded",
        "analysis": analysis
    }

@app.get("/api/v1/files")
def list_files():
    return {"files": files_store, "total": len(files_store)}

from fastapi import WebSocket, WebSocketDisconnect
import json
import asyncio

# Chat connections manager
chat_connections = {}

@app.websocket("/ws/{client_id}")
async def websocket_chat(websocket: WebSocket, client_id: str):
    await websocket.accept()
    chat_connections[client_id] = websocket
    
    # Send welcome message
    welcome = {
        "type": "system",
        "message": "Welcome to Luantra AI! I can help you build dashboards, analyze data, train ML models, and create enterprise solutions. What would you like to build?",
        "timestamp": "2025-09-15"
    }
    await websocket.send_text(json.dumps(welcome))
    
    try:
        while True:
            data = await websocket.receive_text()
            user_message = json.loads(data)
            
            # Process AI response
            response = await generate_ai_response(user_message.get("message", ""))
            
            ai_response = {
                "type": "ai",
                "message": response,
                "timestamp": "2025-09-15"
            }
            await websocket.send_text(json.dumps(ai_response))
            
    except WebSocketDisconnect:
        if client_id in chat_connections:
            del chat_connections[client_id]

async def generate_ai_response(message: str):
    await asyncio.sleep(1)  # Simulate processing
    
    message_lower = message.lower()
    
    if "dashboard" in message_lower:
        return "I'll create an analytics dashboard for you. Upload your data and I'll build interactive charts, KPIs, and real-time monitoring."
    elif "model" in message_lower or "predict" in message_lower:
        return "I'll train a machine learning model with your data. Upload your dataset and I'll select the best algorithm and deploy a prediction API."
    elif "upload" in message_lower or "data" in message_lower:
        return "Upload your data files (CSV, JSON, Excel) and I'll analyze them automatically, providing insights and recommendations."
    else:
        return "I'm your AI assistant for building enterprise solutions. I can create dashboards, train ML models, process data, and deploy complete AI systems. What would you like to build?"

@app.get("/api/v1/chat/status")
def chat_status():
    return {
        "active_connections": len(chat_connections),
        "websocket_url": f"wss://luantra-backend-563717330741.us-central1.run.app/ws/{{client_id}}",
        "status": "operational"
    }
