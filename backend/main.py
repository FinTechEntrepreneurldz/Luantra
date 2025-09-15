from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Luantra Backend", "status": "operational"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/api/v1/canvas/components")
def components():
    return {"components": [{"id": "dashboard", "name": "Dashboard"}]}
# Testing automatic deployment Sun Sep 14 21:57:47 EDT 2025

from typing import Dict

# In-memory user storage (will connect to database later)
users_db = {}

@app.post("/api/v1/auth/login")
def login(credentials: Dict[str, str]):
    username = credentials.get("username")
    password = credentials.get("password")
    
    if not username or not password:
        return {"error": "Username and password required"}
    
    # Create or get user
    user_id = len(users_db) + 1
    user = {
        "id": user_id,
        "username": username,
        "email": f"{username}@example.com",
        "created_at": "2025-09-15T01:00:00Z"
    }
    users_db[user_id] = user
    
    return {
        "access_token": f"token_{user_id}",
        "user": user,
        "message": "Login successful"
    }

@app.get("/api/v1/users")
def get_users():
    return {"users": list(users_db.values()), "total": len(users_db)}

from fastapi import UploadFile, File
import csv
import io
import json

# File storage
files_db = {}

@app.post("/api/v1/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    
    # Analyze the uploaded file
    analysis = {"type": "unknown", "error": None}
    
    try:
        if file.content_type == "text/csv":
            csv_content = content.decode('utf-8')
            reader = csv.DictReader(io.StringIO(csv_content))
            rows = list(reader)
            analysis = {
                "type": "csv",
                "rows": len(rows),
                "columns": list(rows[0].keys()) if rows else [],
                "sample_data": rows[:3],
                "insights": f"Found {len(rows)} records with {len(rows[0].keys()) if rows else 0} columns"
            }
        elif file.content_type == "application/json":
            json_content = json.loads(content.decode('utf-8'))
            analysis = {
                "type": "json",
                "structure": type(json_content).__name__,
                "keys": list(json_content.keys()) if isinstance(json_content, dict) else None,
                "insights": f"JSON object with {len(json_content)} items" if isinstance(json_content, dict) else "JSON array"
            }
    except Exception as e:
        analysis["error"] = str(e)
    
    # Store file record
    file_id = len(files_db) + 1
    file_record = {
        "id": file_id,
        "filename": file.filename,
        "size": len(content),
        "type": file.content_type,
        "analysis": analysis,
        "uploaded_at": "2025-09-15T02:00:00Z"
    }
    files_db[file_id] = file_record
    
    return {
        "file_id": file_id,
        "status": "processed",
        "analysis": analysis,
        "recommendations": generate_recommendations(analysis)
    }

@app.get("/api/v1/files")
def list_files():
    return {"files": list(files_db.values()), "total": len(files_db)}

@app.get("/api/v1/files/{file_id}")
def get_file_analysis(file_id: int):
    if file_id not in files_db:
        return {"error": "File not found"}
    return files_db[file_id]

def generate_recommendations(analysis):
    recommendations = []
    if analysis["type"] == "csv":
        recommendations.extend([
            "Build predictive models with this dataset",
            "Create interactive dashboards",
            "Set up automated data quality monitoring"
        ])
    elif analysis["type"] == "json":
        recommendations.extend([
            "Transform into structured analytics",
            "Create API endpoints for this data"
        ])
    else:
        recommendations.append("Upload CSV or JSON for detailed analysis")
    return recommendations

from fastapi import WebSocket, WebSocketDisconnect
import asyncio

# WebSocket manager
class ChatManager:
    def __init__(self):
        self.connections = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.connections[client_id] = websocket
        return len(self.connections)
    
    def disconnect(self, client_id: str):
        if client_id in self.connections:
            del self.connections[client_id]
    
    async def send_message(self, message: dict, client_id: str):
        if client_id in self.connections:
            await self.connections[client_id].send_text(json.dumps(message))

chat_manager = ChatManager()

@app.websocket("/ws/{client_id}")
async def websocket_chat(websocket: WebSocket, client_id: str):
    connection_count = await chat_manager.connect(websocket, client_id)
    
    # Welcome message
    await chat_manager.send_message({
        "type": "system",
        "message": f"Welcome to Luantra AI! You're client #{connection_count}. I can help you build dashboards, analyze data, train ML models, and deploy AI solutions. What would you like to create?",
        "timestamp": "2025-09-15T02:00:00Z"
    }, client_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            user_message = json.loads(data)
            
            # Process message and generate AI response
            response = await process_ai_chat(user_message.get("message", ""))
            
            await chat_manager.send_message({
                "type": "ai",
                "message": response["text"],
                "actions": response["actions"],
                "timestamp": "2025-09-15T02:00:00Z"
            }, client_id)
            
    except WebSocketDisconnect:
        chat_manager.disconnect(client_id)

async def process_ai_chat(message: str):
    await asyncio.sleep(1)  # Simulate AI processing
    
    message_lower = message.lower()
    
    if "dashboard" in message_lower or "visualize" in message_lower:
        return {
            "text": "I'll create an analytics dashboard with your data. Upload a CSV file and I'll build interactive charts, KPIs, and real-time monitoring for you.",
            "actions": ["upload_data", "create_dashboard", "configure_alerts"]
        }
    elif "model" in message_lower or "predict" in message_lower:
        return {
            "text": "I'll train a machine learning model for you. Upload your dataset and I'll automatically select the best algorithm, train the model, and deploy it for predictions.",
            "actions": ["upload_training_data", "train_model", "deploy_api"]
        }
    elif "upload" in message_lower or "data" in message_lower:
        return {
            "text": "Upload your data files (CSV, JSON, Excel) and I'll analyze them automatically. I'll provide insights, detect patterns, and recommend next steps.",
            "actions": ["file_upload", "data_analysis", "generate_insights"]
        }
    else:
        return {
            "text": f"I'm your AI assistant for enterprise solutions. I can analyze data, build dashboards, train ML models, and create complete AI systems. Try saying 'help me build a dashboard' or 'analyze my data'.",
            "actions": ["show_examples", "upload_demo_data"]
        }

@app.get("/api/v1/chat/status")
def chat_status():
    return {
        "active_connections": len(chat_manager.connections),
        "websocket_url": "wss://luantra-backend-563717330741.us-central1.run.app/ws/{client_id}",
        "status": "operational"
    }
