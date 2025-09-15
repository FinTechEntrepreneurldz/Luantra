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
