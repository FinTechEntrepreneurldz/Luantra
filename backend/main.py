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

from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.sql import func
from datetime import datetime

# Database setup
DATABASE_URL = "postgresql://luantra_user:luantra_secure_2024@34.45.208.83:5432/luantra"

try:
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
    
    # User model
    class User(Base):
        __tablename__ = "users"
        id = Column(Integer, primary_key=True, index=True)
        username = Column(String(50), unique=True, index=True)
        email = Column(String(100))
        created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    DATABASE_CONNECTED = True
except Exception as e:
    print(f"Database connection failed: {e}")
    DATABASE_CONNECTED = False

@app.get("/api/v1/database/status") 
def database_status():
    return {"connected": DATABASE_CONNECTED, "url": "Cloud SQL PostgreSQL"}

from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.sql import func
from datetime import datetime

# Database setup
DATABASE_URL = "postgresql://luantra_user:luantra_secure_2024@34.45.208.83:5432/luantra"

try:
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
    
    # User model
    class User(Base):
        __tablename__ = "users"
        id = Column(Integer, primary_key=True, index=True)
        username = Column(String(50), unique=True, index=True)
        email = Column(String(100))
        created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    DATABASE_CONNECTED = True
except Exception as e:
    print(f"Database connection failed: {e}")
    DATABASE_CONNECTED = False

@app.get("/api/v1/database/status") 
def database_status():
    return {"connected": DATABASE_CONNECTED, "url": "Cloud SQL PostgreSQL"}

@app.post("/api/v1/users")
def create_user(user_data: dict):
    if not DATABASE_CONNECTED:
        return {"error": "Database not connected"}
    
    db = SessionLocal()
    try:
        user = User(
            username=user_data["username"],
            email=user_data.get("email", f"{user_data['username']}@example.com")
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return {"id": user.id, "username": user.username, "email": user.email}
    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()

@app.get("/api/v1/users")
def list_users():
    if not DATABASE_CONNECTED:
        return {"users": [], "error": "Database not connected"}
    
    db = SessionLocal()
    try:
        users = db.query(User).all()
        return {"users": [{"id": u.id, "username": u.username, "email": u.email} for u in users]}
    finally:
        db.close()
