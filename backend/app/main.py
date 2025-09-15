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
    return {
        "components": [
            {"id": "dashboard", "name": "Analytics Dashboard"},
            {"id": "ml_model", "name": "ML Model Trainer"}
        ]
    }
