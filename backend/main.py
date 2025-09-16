from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import json
from datetime import datetime
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage
files_data = []

# Gemini integration
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
GEMINI_AVAILABLE = False

if GOOGLE_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GOOGLE_API_KEY)
        model = genai.GenerativeModel('gemini-pro')
        GEMINI_AVAILABLE = True
        print("✅ Gemini AI initialized successfully")
    except Exception as e:
        print(f"❌ Gemini initialization failed: {e}")

@app.get("/")
def root():
    return {"message": "Luantra Backend", "status": "running", "ai": GEMINI_AVAILABLE}

@app.get("/health")
def health():
    return {"status": "healthy", "gemini": GEMINI_AVAILABLE}

@app.post("/api/v1/auth/login")
def login(credentials: dict):
    username = credentials.get("username", "demo")
    return {
        "access_token": f"token_{username}",
        "user": {"id": 1, "username": username},
        "status": "success"
    }

@app.post("/api/v1/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    content_str = content.decode('utf-8')
    lines = content_str.split('\n')
    
    analysis = {
        "type": "csv",
        "rows": len(lines) - 1,
        "filename": file.filename,
        "columns": lines[0].split(',') if lines else [],
        "preview": lines[:3] if lines else [],
        "insights": f"Uploaded {file.filename} with {len(lines)-1} records"
    }
    
    file_info = {
        "id": len(files_data) + 1,
        "filename": file.filename,
        "analysis": analysis,
        "content": content_str[:1000],  # First 1000 chars for AI context
        "uploaded_at": datetime.now().isoformat()
    }
    files_data.append(file_info)
    
    return {"file_id": file_info["id"], "status": "processed", "analysis": analysis}

async def get_gemini_response(user_message: str):
    """Get real response from Gemini AI"""
    
    if not GEMINI_AVAILABLE:
        return "Gemini AI not available. Using fallback response for your request."
    
    try:
        # Build context about uploaded files
        context = ""
        if files_data:
            context = f"\nContext: User has uploaded {len(files_data)} files:\n"
            for file in files_data[-2:]:  # Last 2 files
                context += f"- {file['filename']}: {file['analysis']['rows']} rows, columns: {file['analysis']['columns']}\n"
                context += f"  Data preview: {file['content'][:300]}...\n"
        
        # Create comprehensive prompt
        prompt = f"""You are Luantra AI, an expert enterprise AI assistant that builds business solutions. 

Your capabilities:
- Build interactive dashboards and data visualizations
- Train machine learning models (classification, regression, clustering)  
- Create automation workflows and business processes
- Develop real-time analytics platforms
- Process and analyze data files
- Design enterprise-grade solutions

{context}

User request: {user_message}

Provide a detailed, professional response about what you'll build. Be specific about features, technologies, and expected outcomes. Sound confident and technical."""

        # Get response from Gemini
        response = model.generate_content(prompt)
        
        if response and response.text:
            return response.text.strip()
        else:
            return "I'm processing your request and building a comprehensive solution!"
            
    except Exception as e:
        print(f"Gemini error: {e}")
        return f"I'm analyzing your request to {user_message.lower()} and designing an optimal solution with advanced AI capabilities!"

@app.post("/api/v1/chat")
async def chat(message: dict):
    user_message = message.get("message", "")
    
    # Get real AI response
    ai_response = await get_gemini_response(user_message)
    
    return {
        "response": ai_response,
        "status": "processed",
        "timestamp": datetime.now().isoformat(),
        "model": "gemini-pro" if GEMINI_AVAILABLE else "fallback",
        "context_files": len(files_data)
    }
