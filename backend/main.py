import os
from fastapi import FastAPI

app = FastAPI()

# Storage
users_store = []

@app.get("/")
def root():
    return {"status": "working", "message": "Luantra Backend", "port": os.environ.get("PORT")}

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
        response = "I'll create an analytics dashboard with your data. I can build interactive charts, KPIs, and real-time monitoring."
    elif "model" in user_message:
        response = "I'll train a machine learning model with your data. I can handle feature engineering and model selection automatically."
    elif "upload" in user_message:
        response = "I can analyze your data files. Describe your data and I'll provide insights and recommendations."
    else:
        response = "I'm your AI assistant for building enterprise solutions. I can create dashboards, train ML models, and process data."
    
    return {"response": response, "status": "processed"}

@app.post("/api/v1/build")
def build_solution(build_request: dict):
    solution_type = build_request.get("type", "dashboard")
    return {
        "build_id": len(users_store) + 100,
        "type": solution_type,
        "status": "building",
        "progress": "25%",
        "components": ["data_connector", "visualization_engine", "analytics_core"],
        "estimated_time": "2-3 minutes"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
