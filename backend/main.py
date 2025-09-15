from fastapi import FastAPI, UploadFile, File
import csv
import io

app = FastAPI()

# In-memory storage
users_store = []
files_store = []

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

@app.post("/api/v1/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    
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
                "insights": f"Dataset with {len(rows)} records and {len(rows[0].keys()) if rows else 0} features"
            }
        except:
            analysis["type"] = "csv_error"
    
    file_record = {
        "id": len(files_store) + 1,
        "filename": file.filename,
        "size": len(content),
        "analysis": analysis
    }
    files_store.append(file_record)
    
    return {
        "file_id": file_record["id"],
        "status": "processed",
        "analysis": analysis
    }

@app.get("/api/v1/files")
def list_files():
    return {"files": files_store, "total": len(files_store)}

@app.post("/api/v1/chat")
def chat_message(message_data: dict):
    user_message = message_data.get("message", "").lower()
    
    if "dashboard" in user_message:
        response = "I'll create an analytics dashboard with your data. Upload a CSV file and I'll build interactive visualizations and KPIs."
    elif "model" in user_message or "predict" in user_message:
        response = "I'll train a machine learning model with your data. Upload your dataset and I'll handle feature engineering and model selection automatically."
    elif "upload" in user_message or "data" in user_message:
        response = "Upload your CSV or JSON files and I'll analyze them, providing insights and recommendations for next steps."
    else:
        response = "I'm your AI assistant for building enterprise solutions. I can create dashboards, train ML models, and process data. What would you like to build?"
    
    return {"response": response, "status": "processed"}
