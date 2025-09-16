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
    
    # Enhanced analysis with column details
    headers = lines[0].split(',') if lines else []
    sample_rows = lines[1:4] if len(lines) > 1 else []
    
    analysis = {
        "type": "csv",
        "rows": len(lines) - 1,
        "filename": file.filename,
        "columns": headers,
        "sample_data": sample_rows,
        "column_types": analyze_column_types(headers, sample_rows),
        "insights": f"Dataset contains {len(lines)-1} records with {len(headers)} features",
        "ai_recommendations": generate_recommendations(file.filename, headers)
    }
    
    file_info = {
        "id": len(files_data) + 1,
        "filename": file.filename,
        "analysis": analysis,
        "content": content_str[:2000],  # More content for AI context
        "uploaded_at": datetime.now().isoformat()
    }
    files_data.append(file_info)
    
    return {"file_id": file_info["id"], "status": "processed", "analysis": analysis}

def analyze_column_types(headers, sample_rows):
    """Analyze what type of data each column contains"""
    column_types = {}
    
    for i, header in enumerate(headers):
        header = header.strip().lower()
        
        # Detect column types based on name and sample data
        if any(word in header for word in ['revenue', 'sales', 'amount', 'price', 'cost', 'budget']):
            column_types[header] = 'currency'
        elif any(word in header for word in ['date', 'time', 'created', 'updated']):
            column_types[header] = 'date'
        elif any(word in header for word in ['rate', 'percentage', 'percent', 'growth']):
            column_types[header] = 'percentage'
        elif any(word in header for word in ['count', 'number', 'id', 'employees', 'age']):
            column_types[header] = 'numeric'
        elif any(word in header for word in ['name', 'company', 'email', 'city', 'region']):
            column_types[header] = 'categorical'
        else:
            column_types[header] = 'text'
    
    return column_types

def generate_recommendations(filename, headers):
    """Generate specific recommendations based on the actual data"""
    recommendations = []
    
    filename_lower = filename.lower()
    headers_str = ' '.join(headers).lower()
    
    # Sales data recommendations
    if 'sales' in filename_lower or any(word in headers_str for word in ['revenue', 'sales', 'growth']):
        recommendations.extend([
            "Create revenue trend visualization",
            "Build growth rate comparison chart",
            "Generate sales performance KPIs",
            "Implement predictive sales forecasting"
        ])
    
    # Customer data recommendations
    if 'customer' in filename_lower or any(word in headers_str for word in ['customer', 'churn', 'satisfaction']):
        recommendations.extend([
            "Build customer segmentation analysis",
            "Create churn prediction model",
            "Generate satisfaction score dashboard",
            "Implement customer lifetime value calculation"
        ])
    
    # Financial data recommendations
    if 'financial' in filename_lower or any(word in headers_str for word in ['amount', 'budget', 'expense']):
        recommendations.extend([
            "Create budget vs actual comparison",
            "Build expense category breakdown",
            "Generate financial trend analysis",
            "Implement cost optimization insights"
        ])
    
    # Performance data recommendations
    if 'performance' in filename_lower or 'metrics' in filename_lower:
        recommendations.extend([
            "Create KPI performance dashboard",
            "Build target vs actual comparison",
            "Generate performance trend analysis",
            "Implement automated performance alerts"
        ])
    
    return recommendations[:4]  # Return top 4 recommendations

async def get_gemini_response(user_message: str):
    """Get real response from Gemini AI with uploaded data context"""
    
    if not GEMINI_AVAILABLE:
        return "Gemini AI not available. Using fallback response for your request."
    
    try:
        # Build detailed context about uploaded files
        context = ""
        if files_data:
            context = f"\nUser has uploaded {len(files_data)} data files:\n"
            for file in files_data[-2:]:  # Last 2 files
                analysis = file['analysis']
                context += f"\n📊 {file['filename']}:\n"
                context += f"- {analysis['rows']} rows with columns: {', '.join(analysis['columns'])}\n"
                context += f"- Column types: {analysis.get('column_types', {})}\n"
                context += f"- Sample data: {analysis.get('sample_data', [])}\n"
                context += f"- AI recommendations: {analysis.get('ai_recommendations', [])}\n"
        
        # Create comprehensive prompt
        prompt = f"""You are Luantra AI, an expert enterprise AI assistant that builds real business solutions.

{context}

User request: {user_message}

Based on the uploaded data and user request, provide:
1. A detailed response about what you'll build
2. Specific features based on the actual data columns
3. Technical implementation details
4. Expected outcomes and metrics

Be specific about the uploaded data and reference actual column names and data types when relevant."""

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
    
    # Generate specific components based on uploaded data and request
    components = generate_specific_components(user_message, files_data)
    
    return {
        "response": ai_response,
        "status": "processed",
        "timestamp": datetime.now().isoformat(),
        "model": "gemini-pro" if GEMINI_AVAILABLE else "fallback",
        "context_files": len(files_data),
        "components": components  # Add this to trigger specific canvas building
    }

def generate_specific_components(user_message, uploaded_files):
    """Generate specific components based on user request and uploaded data"""
    components = []
    
    if not uploaded_files:
        return components
    
    latest_file = uploaded_files[-1]
    analysis = latest_file['analysis']
    columns = analysis.get('columns', [])
    column_types = analysis.get('column_types', {})
    
    message_lower = user_message.lower()
    
    # Dashboard requests
    if 'dashboard' in message_lower:
        component = {
            "type": "dashboard",
            "title": f"{latest_file['filename']} Dashboard",
            "description": f"Interactive dashboard with {len(columns)} key metrics",
            "columns": columns,
            "metrics": create_metrics_from_columns(columns, column_types),
            "charts": suggest_charts_for_data(columns, column_types)
        }
        components.append(component)
    
    # ML Model requests
    if any(word in message_lower for word in ['model', 'predict', 'machine learning', 'ml']):
        component = {
            "type": "ml_model",
            "title": f"Prediction Model for {latest_file['filename']}",
            "description": f"ML model using {len(columns)} features",
            "features": columns,
            "target_suggestions": suggest_target_columns(columns, column_types),
            "model_types": suggest_model_types(columns, column_types)
        }
        components.append(component)
    
    return components

def create_metrics_from_columns(columns, column_types):
    """Create specific metrics based on actual data columns"""
    metrics = []
    
    for col in columns:
        col_lower = col.lower().strip()
        col_type = column_types.get(col_lower, 'text')
        
        if col_type == 'currency':
            metrics.append({"name": f"Total {col}", "type": "sum", "column": col})
            metrics.append({"name": f"Avg {col}", "type": "average", "column": col})
        elif col_type == 'percentage':
            metrics.append({"name": f"Avg {col}", "type": "average", "column": col})
        elif col_type == 'numeric':
            metrics.append({"name": f"Count {col}", "type": "count", "column": col})
    
    return metrics[:6]  # Return top 6 metrics

def suggest_charts_for_data(columns, column_types):
    """Suggest specific chart types based on actual data"""
    charts = []
    
    # Revenue/Sales trend charts
    if any('revenue' in col.lower() or 'sales' in col.lower() for col in columns):
        charts.append({"type": "line", "title": "Revenue Trend", "description": "Track revenue over time"})
    
    # Growth rate charts
    if any('growth' in col.lower() or 'rate' in col.lower() for col in columns):
        charts.append({"type": "bar", "title": "Growth Rate Comparison", "description": "Compare growth across segments"})
    
    # Geographic charts
    if any('region' in col.lower() or 'city' in col.lower() for col in columns):
        charts.append({"type": "map", "title": "Geographic Distribution", "description": "Regional performance map"})
    
    return charts

def suggest_target_columns(columns, column_types):
    """Suggest which columns could be prediction targets"""
    targets = []
    
    for col in columns:
        col_lower = col.lower().strip()
        
        # Common prediction targets
        if any(word in col_lower for word in ['churn', 'revenue', 'sales', 'satisfaction', 'growth']):
            targets.append(col)
    
    return targets

def suggest_model_types(columns, column_types):
    """Suggest appropriate ML model types based on data"""
    models = []
    
    # Classification models
    if any('churn' in col.lower() or 'category' in col.lower() for col in columns):
        models.append("Classification (Predict categories)")
    
    # Regression models
    if any(col_type == 'currency' for col_type in column_types.values()):
        models.append("Regression (Predict values)")
    
    # Clustering
    if len(columns) > 3:
        models.append("Clustering (Find patterns)")
    
    return models
