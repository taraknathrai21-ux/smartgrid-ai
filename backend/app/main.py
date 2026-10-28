from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import forecast, upload

app = FastAPI(
    title="SmartGrid AI - Microgrid Management System",
    description="Backend API for HackSphere 3.0 Smart Energy Microgrid Challenge. Evaluates 24-hour demand forecasts, switching rules, and critical overload alerts.",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forecast.router)
app.include_router(upload.router)

@app.get("/")
def root():
    return {
        "project": "SmartGrid AI",
        "hackathon": "HackSphere 3.0",
        "challenge": "Smart Energy Microgrid Challenge",
        "status": "Online",
        "docs_url": "/docs",
        "disclaimer": "Using labelled mock prediction data. AI Model and Zoho Catalyst endpoints are mocked/pending connection."
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "mode": "simulation",
        "rules_active": True,
        "switching_threshold_kw": 160.0,
        "peak_window": "18:00 - 22:00",
        "overload_threshold_kw": 200.0
    }
