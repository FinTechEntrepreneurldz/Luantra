from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Luantra Backend API")

# CRITICAL: Add CORS middleware FIRST
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    username: str
    password: str

@app.get("/")
def root():
    return {"message": "Luantra Backend", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": "2025-09-15"}

@app.post("/api/v1/auth/login")
def login(credentials: LoginRequest):
    return {
        "access_token": f"token_{credentials.username}",
        "user": {"id": 1, "username": credentials.username, "email": f"{credentials.username}@example.com"},
        "status": "success"
    }
