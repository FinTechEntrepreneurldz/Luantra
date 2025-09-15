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
