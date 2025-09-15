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
