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
