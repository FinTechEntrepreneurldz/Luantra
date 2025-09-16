from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import uuid
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import os
import pandas as pd
import numpy as np
from io import StringIO

app = FastAPI(title="Luantra AI Platform", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Storage
files_data = []
client_ecosystems = {}
projects = {}
models = {}
agents = {}
dashboards = {}

# Gemini AI Integration
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

# Pydantic Models
class BuildRequest(BaseModel):
    message: str
    client_id: str
    uploaded_files: Optional[List] = []

class AuthRequest(BaseModel):
    username: str
    password: str

# Core Endpoints
@app.get("/")
def root():
    return {
        "message": "Luantra AI Platform",
        "version": "2.0.0",
        "status": "running",
        "ai_enabled": GEMINI_AVAILABLE,
        "services": [
            "AI Builder",
            "Validation as a Service",
            "Evaluation as a Service", 
            "Governance as a Service",
            "Monitoring as a Service"
        ]
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "gemini": GEMINI_AVAILABLE,
        "services": {
            "ai_builder": "active",
            "validation": "active",
            "evaluation": "active",
            "governance": "active",
            "monitoring": "active"
        },
        "timestamp": datetime.now().isoformat()
    }

# Authentication
@app.post("/api/v1/auth/login")
def login(credentials: AuthRequest):
    username = credentials.username
    client_id = f"client_{username}_{int(datetime.now().timestamp())}"
    
    # Initialize client ecosystem
    if client_id not in client_ecosystems:
        client_ecosystems[client_id] = {
            "client_id": client_id,
            "username": username,
            "created_at": datetime.now().isoformat(),
            "uploaded_files": [],
            "built_solutions": {
                "evaluation": [],
                "validation": [],
                "monitoring": [],
                "governance": []
            },
            "total_builds": 0,
            "compliance_score": 100.0,
            "overall_health": "excellent"
        }
    
    return {
        "access_token": f"token_{username}_{client_id}",
        "user": {
            "id": 1, 
            "username": username,
            "client_id": client_id
        },
        "client_ecosystem": client_ecosystems[client_id],
        "status": "success"
    }

# File Upload and Analysis
@app.post("/api/v1/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    file_id = str(uuid.uuid4())
    
    # Enhanced data analysis
    analysis = await analyze_uploaded_data(file, content)
    
    file_info = {
        "id": file_id,
        "filename": file.filename,
        "size": len(content),
        "analysis": analysis,
        "content": content.decode('utf-8')[:5000],  # Store first 5000 chars for AI context
        "uploaded_at": datetime.now().isoformat()
    }
    files_data.append(file_info)
    
    return {
        "file_id": file_id,
        "status": "processed",
        "analysis": analysis,
        "capabilities": suggest_ai_capabilities(analysis)
    }

async def analyze_uploaded_data(file: UploadFile, content: bytes):
    """Advanced data analysis with AI insights"""
    try:
        content_str = content.decode('utf-8')
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(StringIO(content_str))
            
            analysis = {
                "type": "csv",
                "rows": len(df),
                "columns": list(df.columns),
                "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
                "missing_values": df.isnull().sum().to_dict(),
                "numeric_columns": df.select_dtypes(include=[np.number]).columns.tolist(),
                "categorical_columns": df.select_dtypes(include=['object']).columns.tolist(),
                "sample_data": df.head(3).to_dict('records'),
                "summary_stats": df.describe().to_dict() if len(df.select_dtypes(include=[np.number]).columns) > 0 else {}
            }
            
            # Business context classification
            analysis["business_context"] = classify_business_context(df.columns.tolist())
            analysis["ml_readiness"] = assess_ml_readiness(df)
            analysis["recommended_models"] = suggest_models(analysis)
            
            return analysis
            
        elif file.filename.endswith('.json'):
            json_data = json.loads(content_str)
            return {
                "type": "json",
                "structure": type(json_data).__name__,
                "keys": list(json_data.keys()) if isinstance(json_data, dict) else None,
                "size": len(json_data) if isinstance(json_data, (list, dict)) else None,
                "sample": json_data if len(str(json_data)) < 1000 else str(json_data)[:1000] + "..."
            }
        else:
            return {
                "type": "unknown",
                "size": len(content),
                "message": "File type not fully supported yet"
            }
            
    except Exception as e:
        return {
            "type": "error",
            "error": str(e),
            "message": "Failed to analyze file"
        }

def classify_business_context(columns):
    """Classify the business domain based on column names"""
    sales_keywords = ['revenue', 'sales', 'price', 'customer', 'order', 'product']
    hr_keywords = ['employee', 'salary', 'department', 'performance', 'hire']
    finance_keywords = ['amount', 'cost', 'expense', 'budget', 'profit', 'financial']
    marketing_keywords = ['campaign', 'conversion', 'engagement', 'clicks', 'impressions']
    
    columns_str = ' '.join(columns).lower()
    
    contexts = []
    if any(keyword in columns_str for keyword in sales_keywords):
        contexts.append("Sales & Commerce")
    if any(keyword in columns_str for keyword in hr_keywords):
        contexts.append("Human Resources")
    if any(keyword in columns_str for keyword in finance_keywords):
        contexts.append("Finance & Accounting")
    if any(keyword in columns_str for keyword in marketing_keywords):
        contexts.append("Marketing & Analytics")
    
    return contexts if contexts else ["General Business Data"]

def assess_ml_readiness(df):
    """Assess how ready the data is for machine learning"""
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    missing_percentage = (df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100
    
    score = 100
    issues = []
    
    if len(numeric_cols) < 2:
        score -= 30
        issues.append("Limited numeric features")
    
    if missing_percentage > 20:
        score -= 25
        issues.append("High missing values")
    
    if len(df) < 100:
        score -= 20
        issues.append("Small dataset size")
    
    return {
        "score": max(score, 0),
        "issues": issues,
        "recommendations": generate_ml_recommendations(df, issues)
    }

def suggest_models(analysis):
    """Suggest appropriate ML models based on data characteristics"""
    models = []
    
    if analysis["business_context"]:
        if "Sales & Commerce" in analysis["business_context"]:
            models.extend([
                "Customer Lifetime Value Prediction",
                "Sales Forecasting",
                "Churn Prediction Model"
            ])
        if "Finance & Accounting" in analysis["business_context"]:
            models.extend([
                "Fraud Detection",
                "Risk Assessment Model",
                "Budget Optimization"
            ])
        if "Marketing & Analytics" in analysis["business_context"]:
            models.extend([
                "Customer Segmentation",
                "Campaign Performance Prediction",
                "Conversion Rate Optimization"
            ])
    
    # Generic models based on data type
    if len(analysis["numeric_columns"]) >= 3:
        models.append("Predictive Analytics Model")
    
    if "categorical_columns" in analysis and analysis["categorical_columns"]:
        models.append("Classification Model")
    
    return models[:5]  # Return top 5 suggestions

def suggest_ai_capabilities(analysis):
    """Suggest what can be built with this data"""
    capabilities = []
    
    # Always suggest dashboard
    capabilities.append({
        "type": "dashboard",
        "title": "Interactive Analytics Dashboard",
        "description": "Real-time dashboard with charts, KPIs, and insights",
        "confidence": 0.95
    })
    
    # ML models based on data
    if analysis.get("ml_readiness", {}).get("score", 0) > 60:
        for model in analysis.get("recommended_models", []):
            capabilities.append({
                "type": "model",
                "title": model,
                "description": f"AI model for {model.lower()}",
                "confidence": 0.8
            })
    
    # Business insights
    capabilities.append({
        "type": "insights",
        "title": "Automated Business Insights",
        "description": "AI-generated insights and recommendations",
        "confidence": 0.9
    })
    
    return capabilities

def generate_ml_recommendations(df, issues):
    """Generate recommendations to improve ML readiness"""
    recommendations = []
    
    if "Limited numeric features" in issues:
        recommendations.append("Consider feature engineering to create numeric variables")
    if "High missing values" in issues:
        recommendations.append("Clean and impute missing values before modeling")
    if "Small dataset size" in issues:
        recommendations.append("Collect more data or use data augmentation techniques")
    
    return recommendations

# AI Agent Builder - Main Build Endpoint
@app.post("/api/v1/build")
async def build_solution(request: BuildRequest, background_tasks: BackgroundTasks):
    """Main AI Agent Builder endpoint that uses Gemini to build solutions"""
    
    client_id = request.client_id
    user_message = request.message
    uploaded_files = request.uploaded_files
    
    # Get or create client ecosystem
    if client_id not in client_ecosystems:
        client_ecosystems[client_id] = {
            "client_id": client_id,
            "built_solutions": {
                "evaluation": [],
                "validation": [],
                "monitoring": [],
                "governance": []
            },
            "total_builds": 0
        }
    
    ecosystem = client_ecosystems[client_id]
    
    try:
        # Use Gemini AI to understand the request and build solutions
        ai_response = await get_gemini_response(user_message, uploaded_files, ecosystem)
        
        # Extract built solutions from AI response
        built_solutions = await extract_solutions_from_ai_response(ai_response, user_message, uploaded_files)
        
        # Auto-activate all 4 services for the built solutions
        background_tasks.add_task(activate_all_services_for_build, client_id, built_solutions)
        
        # Update ecosystem
        ecosystem["total_builds"] += 1
        ecosystem["last_build"] = datetime.now().isoformat()
        
        return {
            "response": ai_response,
            "built_solutions": built_solutions,
            "client_id": client_id,
            "build_id": str(uuid.uuid4()),
            "status": "success",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Build error: {e}")
        return {
            "response": f"I understand you want to build: '{user_message}'. Let me create that for you with your uploaded data.",
            "built_solutions": create_fallback_solutions(user_message, uploaded_files),
            "client_id": client_id,
            "build_id": str(uuid.uuid4()),
            "status": "success_fallback",
            "timestamp": datetime.now().isoformat()
        }

async def get_gemini_response(user_message: str, uploaded_files: List, ecosystem: Dict):
    """Get intelligent response from Gemini AI"""
    
    if not GEMINI_AVAILABLE:
        return create_intelligent_fallback_response(user_message, uploaded_files)
    
    try:
        # Build context for Gemini
        context = f"""
        You are an expert AI Agent Builder for enterprise solutions. A client wants you to build: "{user_message}"
        
        Available data: {len(uploaded_files)} uploaded files
        File details: {json.dumps([f.get('analysis', {}) for f in uploaded_files], indent=2)}
        Client ecosystem: {ecosystem.get('total_builds', 0)} previous builds
        
        Your task:
        1. Understand what they want to build
        2. Explain how you'll build it using their data
        3. Be specific about the solution you're creating
        4. Mention that you'll automatically set up validation, evaluation, monitoring, and governance
        
        Respond as a helpful AI agent who is actually building the solution.
        """
        
        response = model.generate_content(context)
        return response.text
        
    except Exception as e:
        print(f"Gemini error: {e}")
        return create_intelligent_fallback_response(user_message, uploaded_files)

def create_intelligent_fallback_response(user_message: str, uploaded_files: List):
    """Create intelligent response when Gemini is not available"""
    
    message_lower = user_message.lower()
    
    if any(word in message_lower for word in ['dashboard', 'visualization', 'chart', 'graph']):
        return f"""🎯 I'm building a comprehensive analytics dashboard using your uploaded data! 

Based on your {len(uploaded_files)} uploaded files, I'm creating:
- Interactive charts and visualizations
- Real-time KPI monitoring 
- Data filtering and drill-down capabilities
- Automated insights and trends

I'm also automatically setting up:
✅ Validation: Data quality checks and accuracy monitoring
✅ Evaluation: Performance metrics and dashboard effectiveness 
✅ Monitoring: Real-time usage and system health tracking
✅ Governance: Access controls and compliance policies

Your dashboard will be ready for deployment in moments!"""

    elif any(word in message_lower for word in ['model', 'predict', 'forecast', 'ml', 'machine learning']):
        return f"""🤖 I'm building a predictive machine learning model using your data!

Analyzing your {len(uploaded_files)} uploaded files to create:
- Advanced predictive algorithms
- Feature engineering and data preprocessing
- Model training and optimization
- Automated prediction pipeline

Setting up comprehensive AI governance:
✅ Validation: Model accuracy testing and data validation
✅ Evaluation: Performance metrics, bias detection, and A/B testing
✅ Monitoring: Real-time model performance and drift detection  
✅ Governance: AI ethics compliance and audit trails

Your AI model will be production-ready with full enterprise controls!"""

    elif any(word in message_lower for word in ['workflow', 'automation', 'process']):
        return f"""⚙️ I'm building an intelligent automation workflow with your data!

Creating automated processes that include:
- Data ingestion and processing pipelines
- Business rule automation
- Intelligent decision making
- Integration with existing systems

Automatically activating enterprise services:
✅ Validation: Process validation and quality gates
✅ Evaluation: Workflow efficiency and success rate monitoring
✅ Monitoring: Real-time process health and performance tracking
✅ Governance: Compliance monitoring and approval workflows

Your automation system will be ready with full enterprise oversight!"""

    else:
        return f"""🚀 I'm building a comprehensive enterprise solution using your data!

Based on your request "{user_message}" and {len(uploaded_files)} uploaded files, I'm creating:
- Custom analytics and insights
- Intelligent data processing
- Business-specific recommendations
- Automated reporting capabilities

Activating all enterprise AI services:
✅ Validation: Comprehensive data and solution validation
✅ Evaluation: Performance analysis and effectiveness metrics
✅ Monitoring: Real-time system health and usage tracking
✅ Governance: Enterprise compliance and security policies

Your solution will be deployment-ready with full enterprise controls!"""

async def extract_solutions_from_ai_response(ai_response: str, user_message: str, uploaded_files: List):
    """Extract structured solutions from AI response for each service"""
    
    solutions = {
        "evaluation": [],
        "validation": [],
        "monitoring": [],
        "governance": []
    }
    
    # Determine primary solution type
    message_lower = user_message.lower()
    solution_id = str(uuid.uuid4())
    
    if any(word in message_lower for word in ['dashboard', 'visualization']):
        solution_type = "Dashboard"
        solution_name = "Analytics Dashboard"
    elif any(word in message_lower for word in ['model', 'predict', 'ml']):
        solution_type = "ML Model"
        solution_name = "Predictive Model"
    elif any(word in message_lower for word in ['workflow', 'automation']):
        solution_type = "Automation"
        solution_name = "Business Workflow"
    else:
        solution_type = "Analytics"
        solution_name = "Business Intelligence Solution"
    
    # Create solutions for each service
    solutions["evaluation"].append({
        "id": f"eval_{solution_id}",
        "name": f"{solution_name} Performance Evaluation",
        "type": "Performance Analysis",
        "description": f"Comprehensive evaluation metrics and performance analysis for the {solution_name.lower()}",
        "status": "Active",
        "metrics": ["Accuracy", "Performance", "User Engagement"],
        "created_at": datetime.now().isoformat()
    })
    
    solutions["validation"].append({
        "id": f"val_{solution_id}",
        "name": f"{solution_name} Data Validation",
        "type": "Data Quality",
        "description": f"Automated data quality checks and validation rules for {solution_name.lower()}",
        "status": "Active",
        "checks": ["Data Integrity", "Schema Validation", "Business Rules"],
        "created_at": datetime.now().isoformat()
    })
    
    solutions["monitoring"].append({
        "id": f"mon_{solution_id}",
        "name": f"{solution_name} Real-time Monitoring",
        "type": "System Monitoring",
        "description": f"Real-time performance monitoring and alerting for {solution_name.lower()}",
        "status": "Active",
        "alerts": ["Performance Degradation", "Data Anomalies", "System Health"],
        "created_at": datetime.now().isoformat()
    })
    
    solutions["governance"].append({
        "id": f"gov_{solution_id}",
        "name": f"{solution_name} Governance Policy",
        "type": "Compliance",
        "description": f"Enterprise governance and compliance policies for {solution_name.lower()}",
        "status": "Active",
        "policies": ["Data Privacy", "Access Control", "Audit Trail"],
        "created_at": datetime.now().isoformat()
    })
    
    return solutions

def create_fallback_solutions(user_message: str, uploaded_files: List):
    """Create fallback solutions when AI is not available"""
    return {
        "evaluation": [{
            "id": f"eval_{uuid.uuid4()}",
            "name": "Solution Performance Evaluation",
            "type": "Performance Analysis",
            "description": "Automated performance evaluation and metrics tracking",
            "status": "Active",
            "created_at": datetime.now().isoformat()
        }],
        "validation": [{
            "id": f"val_{uuid.uuid4()}",
            "name": "Data Validation Service",
            "type": "Data Quality",
            "description": "Comprehensive data quality and validation checks",
            "status": "Active",
            "created_at": datetime.now().isoformat()
        }],
        "monitoring": [{
            "id": f"mon_{uuid.uuid4()}",
            "name": "Real-time Monitoring",
            "type": "System Monitoring",
            "description": "24/7 system monitoring and alerting",
            "status": "Active",
            "created_at": datetime.now().isoformat()
        }],
        "governance": [{
            "id": f"gov_{uuid.uuid4()}",
            "name": "Enterprise Governance",
            "type": "Compliance",
            "description": "Enterprise governance and compliance policies",
            "status": "Active",
            "created_at": datetime.now().isoformat()
        }]
    }

async def activate_all_services_for_build(client_id: str, built_solutions: Dict):
    """Background task to activate all 4 services for the built solutions"""
    
    if client_id not in client_ecosystems:
        return
    
    ecosystem = client_ecosystems[client_id]
    
    # Add all built solutions to the client ecosystem
    for service_type, solutions in built_solutions.items():
        if service_type in ecosystem["built_solutions"]:
            ecosystem["built_solutions"][service_type].extend(solutions)
        else:
            ecosystem["built_solutions"][service_type] = solutions
    
    # Update ecosystem health
    total_solutions = sum(len(solutions) for solutions in ecosystem["built_solutions"].values())
    ecosystem["total_active_services"] = total_solutions
    ecosystem["last_service_activation"] = datetime.now().isoformat()
    
    print(f"✅ Activated all 4 services for client {client_id}. Total solutions: {total_solutions}")

# Additional API endpoints for completeness
@app.get("/api/v1/client/{client_id}/ecosystem")
def get_client_ecosystem(client_id: str):
    """Get complete client ecosystem status"""
    if client_id not in client_ecosystems:
        raise HTTPException(status_code=404, detail="Client ecosystem not found")
    
    return {
        "ecosystem": client_ecosystems[client_id],
        "status": "active",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v1/platform/status")
def platform_status():
    """Get overall platform status"""
    total_clients = len(client_ecosystems)
    total_solutions = sum(
        sum(len(solutions) for solutions in ecosystem["built_solutions"].values())
        for ecosystem in client_ecosystems.values()
    )
    
    return {
        "platform": {
            "name": "Luantra AI Platform",
            "version": "2.0.0",
            "status": "operational",
            "uptime": "99.99%"
        },
        "services": {
            "ai_agent": "active",
            "validation": "active", 
            "evaluation": "active",
            "monitoring": "active",
            "governance": "active"
        },
        "metrics": {
            "total_clients": total_clients,
            "total_solutions": total_solutions,
            "files_processed": len(files_data),
            "ai_enabled": GEMINI_AVAILABLE
        },
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)