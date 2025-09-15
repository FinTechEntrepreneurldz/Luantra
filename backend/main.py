from fastapi import FastAPI

app = FastAPI()

# Storage
users_store = []

@app.get("/")
def root():
    return {"status": "working", "message": "Luantra Backend"}

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

@app.post("/api/v1/chat")
def chat_message(message_data: dict):
    user_message = message_data.get("message", "").lower()
    
    if "dashboard" in user_message:
        response = "I'll create an analytics dashboard with your data."
    elif "model" in user_message:
        response = "I'll train a machine learning model with your data."
    else:
        response = "I'm your AI assistant for building enterprise solutions."
    
    return {"response": response, "status": "processed"}

from fastapi import UploadFile, File, HTTPException
import csv
import io
import json

files_store = []

@app.post("/api/v1/upload")
async def upload_file(file: UploadFile = File(...)):
    if file.size > 10_000_000:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large")
    
    content = await file.read()
    analysis = {"type": "unknown", "size": len(content), "error": None}
    
    try:
        if file.content_type == "text/csv":
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
        elif file.content_type == "application/json":
            json_data = json.loads(content.decode('utf-8'))
            analysis = {
                "type": "json",
                "structure": type(json_data).__name__,
                "keys": list(json_data.keys()) if isinstance(json_data, dict) else None,
                "insights": f"JSON object with {len(json_data)} properties" if isinstance(json_data, dict) else "JSON array"
            }
    except Exception as e:
        analysis["error"] = str(e)
    
    file_record = {
        "id": len(files_store) + 1,
        "filename": file.filename,
        "size": len(content),
        "analysis": analysis,
        "uploaded_at": "2025-09-15T03:00:00Z"
    }
    files_store.append(file_record)
    
    return {"file_id": file_record["id"], "status": "processed", "analysis": analysis}

@app.get("/api/v1/files")
def list_files():
    return {"files": files_store, "total": len(files_store)}

@app.get("/api/v1/files/{file_id}")
def get_file(file_id: int):
    file_record = next((f for f in files_store if f["id"] == file_id), None)
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    return file_record

from fastapi import UploadFile, File, HTTPException
import csv
import io
import json

files_store = []

@app.post("/api/v1/upload")
async def upload_file(file: UploadFile = File(...)):
    if file.size > 10_000_000:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large")
    
    content = await file.read()
    analysis = {"type": "unknown", "size": len(content), "error": None}
    
    try:
        if file.content_type == "text/csv":
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
        elif file.content_type == "application/json":
            json_data = json.loads(content.decode('utf-8'))
            analysis = {
                "type": "json",
                "structure": type(json_data).__name__,
                "keys": list(json_data.keys()) if isinstance(json_data, dict) else None,
                "insights": f"JSON object with {len(json_data)} properties" if isinstance(json_data, dict) else "JSON array"
            }
    except Exception as e:
        analysis["error"] = str(e)
    
    file_record = {
        "id": len(files_store) + 1,
        "filename": file.filename,
        "size": len(content),
        "analysis": analysis,
        "uploaded_at": "2025-09-15T03:00:00Z"
    }
    files_store.append(file_record)
    
    return {"file_id": file_record["id"], "status": "processed", "analysis": analysis}

@app.get("/api/v1/files")
def list_files():
    return {"files": files_store, "total": len(files_store)}

@app.get("/api/v1/files/{file_id}")
def get_file(file_id: int):
    file_record = next((f for f in files_store if f["id"] == file_id), None)
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    return file_record

from fastapi import UploadFile, File, HTTPException
import csv
import io
import json

files_store = []

@app.post("/api/v1/upload")
async def upload_file(file: UploadFile = File(...)):
    if file.size and file.size > 10_000_000:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large")
    
    content = await file.read()
    analysis = {"type": "unknown", "size": len(content), "error": None}
    
    try:
        if file.content_type == "text/csv":
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
        elif file.content_type == "application/json":
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
        "uploaded_at": "2025-09-15T03:00:00Z"
    }
    files_store.append(file_record)
    
    return {"file_id": file_record["id"], "status": "processed", "analysis": analysis}

@app.get("/api/v1/files")
def list_files():
    return {"files": files_store, "total": len(files_store)}

@app.get("/api/v1/files/{file_id}")
def get_file(file_id: int):
    file_record = next((f for f in files_store if f["id"] == file_id), None)
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    return file_record
