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
