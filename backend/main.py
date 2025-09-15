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
