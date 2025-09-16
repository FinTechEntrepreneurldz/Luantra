from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import csv
import io
import json
from datetime import datetime

app = FastAPI(title="Luantra Backend API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demo
files_store = []
users_db = {}

class LoginRequest(BaseModel):
    username: str
    password: str

@app.get("/")
def root():
    return {"message": "Luantra Backend", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/v1/auth/login")
def login(credentials: LoginRequest):
    return {
        "access_token": f"token_{credentials.username}",
        "user": {"id": 1, "username": credentials.username, "email": f"{credentials.username}@example.com"},
        "status": "success"
    }

@app.post("/api/v1/upload")
async def upload_file(file: UploadFile = File(...)):
    if file.size and file.size > 10_000_000:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large")
    
    content = await file.read()
    analysis = {"type": "unknown", "size": len(content), "error": None}
    
    try:
        if file.content_type == "text/csv" or file.filename.endswith('.csv'):
            csv_content = content.decode('utf-8')
            reader = csv.DictReader(io.StringIO(csv_content))
            rows = list(reader)
            analysis = {
                "type": "csv",
                "rows": len(rows),
                "columns": list(rows[0].keys()) if rows else [],
                "sample": rows[:3] if rows else [],
                "insights": f"Found {len(rows)} records with {len(rows[0].keys()) if rows else 0} columns",
                "recommendations": [
                    "Build predictive models with this dataset",
                    "Create interactive dashboards", 
                    "Set up automated monitoring"
                ]
            }
        elif file.content_type == "application/json" or file.filename.endswith('.json'):
            json_data = json.loads(content.decode('utf-8'))
            analysis = {
                "type": "json",
                "structure": type(json_data).__name__,
                "keys": list(json_data.keys()) if isinstance(json_data, dict) else None,
                "insights": f"JSON with {len(json_data)} items" if isinstance(json_data, dict) else "JSON array"
            }
    except Exception as e:
        analysis["error"] = str(e)
    
    file_record = {
        "id": len(files_store) + 1,
        "filename": file.filename,
        "size": len(content),
        "analysis": analysis,
        "uploaded_at": datetime.now().isoformat()
    }
    files_store.append(file_record)
    
    return {"file_id": file_record["id"], "status": "processed", "analysis": analysis}

@app.get("/api/v1/files")
def list_files():
    return {"files": files_store, "total": len(files_store)}

@app.post("/api/v1/chat")
def chat(message: dict):
    user_message = message.get("message", "").lower()
    
    if "dashboard" in user_message or "analytics" in user_message:
        response = "I'll create an analytics dashboard for you! Upload a CSV file and I'll build interactive visualizations and KPIs."
    elif "model" in user_message or "predict" in user_message:
        response = "I'll train a machine learning model with your data. Upload your dataset and I'll handle feature engineering and model selection automatically."
    elif "upload" in user_message or "data" in user_message:
        response = "Upload your CSV or JSON files and I'll analyze them, providing insights and recommendations for next steps."
    else:
        response = "I'm your AI assistant for building enterprise solutions. I can create dashboards, train ML models, and process data. What would you like to build?"
    
    return {"response": response, "status": "processed"}
