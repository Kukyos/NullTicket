"""
Main FastAPI application for NullTicket unified ticketing system
"""
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from datetime import datetime
import logging

from .config import settings
from .database import init_db, get_db
from .routes import tickets, ingestion, analytics, admin

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Unified intelligent ticketing system with AI-powered automation",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database and services on startup"""
    logger.info("🚀 Starting NullTicket System...")
    init_db()
    logger.info("✅ Database initialized")
    logger.info(f"📊 Running on: {settings.DATABASE_URL}")
    logger.info(f"🤖 AI Model: {settings.AI_MODEL}")
    logger.info(f"✉️ Email ingestion: {'Enabled' if settings.EMAIL_ENABLED else 'Disabled'}")
    logger.info(f"🔌 GLPI integration: {'Enabled' if settings.GLPI_ENABLED else 'Disabled'}")
    logger.info(f"🔌 Solman integration: {'Enabled' if settings.SOLMAN_ENABLED else 'Disabled'}")
    
    # Start notification service
    from .services.notification_service import notification_service
    await notification_service.start_background_tasks()
    logger.info("🔔 Notification service started")

# Include routers
app.include_router(tickets.router, prefix="/api/tickets", tags=["Tickets"])
app.include_router(ingestion.router, prefix="/api/ingest", tags=["Ingestion"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

# Import and include knowledge base router
from .routes import kb
app.include_router(kb.router, prefix="/api/kb", tags=["Knowledge Base"])

# Import and include webhooks router
from .routes import webhooks
app.include_router(webhooks.router, prefix="/api/webhooks", tags=["Webhooks"])

@app.get("/", response_class=HTMLResponse)
async def root():
    """Root endpoint with system information"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{settings.APP_NAME}</title>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 900px;
                margin: 40px auto;
                padding: 0 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #fff;
            }}
            .container {{
                background: rgba(255, 255, 255, 0.95);
                padding: 40px;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                color: #333;
            }}
            h1 {{
                margin: 0 0 10px 0;
                font-size: 2.5rem;
                color: #667eea;
            }}
            .version {{
                color: #888;
                font-size: 0.9rem;
                margin-bottom: 30px;
            }}
            .grid {{
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }}
            .card {{
                background: #f8f9fa;
                padding: 20px;
                border-radius: 12px;
                border-left: 4px solid #667eea;
            }}
            .card h3 {{
                margin: 0 0 10px 0;
                font-size: 1.1rem;
                color: #667eea;
            }}
            .card p {{
                margin: 5px 0;
                color: #666;
                font-size: 0.9rem;
            }}
            .status {{
                display: inline-block;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 0.85rem;
                font-weight: 600;
            }}
            .status.active {{
                background: #d4edda;
                color: #155724;
            }}
            .status.inactive {{
                background: #f8d7da;
                color: #721c24;
            }}
            .links {{
                margin-top: 30px;
                padding-top: 30px;
                border-top: 2px solid #e0e0e0;
            }}
            .links a {{
                display: inline-block;
                margin: 10px 10px 10px 0;
                padding: 12px 24px;
                background: #667eea;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                transition: transform 0.2s;
            }}
            .links a:hover {{
                transform: translateY(-2px);
                background: #5568d3;
            }}
            .footer {{
                margin-top: 30px;
                text-align: center;
                color: #888;
                font-size: 0.85rem;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎫 {settings.APP_NAME}</h1>
            <div class="version">Version {settings.APP_VERSION}</div>
            
            <p style="font-size: 1.1rem; color: #555; line-height: 1.6;">
                Unified intelligent ticketing system with AI-powered classification, 
                smart routing, and multi-source integration.
            </p>
            
            <div class="grid">
                <div class="card">
                    <h3>📧 Email Ingestion</h3>
                    <p><span class="status {'active' if settings.EMAIL_ENABLED else 'inactive'}">
                        {'Active' if settings.EMAIL_ENABLED else 'Inactive'}
                    </span></p>
                    <p>Automatic ticket creation from emails</p>
                </div>
                
                <div class="card">
                    <h3>🤖 AI Classification</h3>
                    <p><span class="status {'active' if settings.GROQ_API_KEY else 'inactive'}">
                        {'Active' if settings.GROQ_API_KEY else 'Inactive'}
                    </span></p>
                    <p>Model: {settings.AI_MODEL}</p>
                </div>
                
                <div class="card">
                    <h3>🔌 GLPI Integration</h3>
                    <p><span class="status {'active' if settings.GLPI_ENABLED else 'inactive'}">
                        {'Active' if settings.GLPI_ENABLED else 'Inactive'}
                    </span></p>
                    <p>External ticketing system sync</p>
                </div>
                
                <div class="card">
                    <h3>🔌 Solman Integration</h3>
                    <p><span class="status {'active' if settings.SOLMAN_ENABLED else 'inactive'}">
                        {'Active' if settings.SOLMAN_ENABLED else 'Inactive'}
                    </span></p>
                    <p>SAP Solution Manager sync</p>
                </div>
            </div>
            
            <div class="links">
                <a href="/docs">📚 API Documentation (Swagger)</a>
                <a href="/redoc">📖 ReDoc</a>
                <a href="/api/analytics/dashboard">📊 Dashboard Metrics</a>
            </div>
            
            <div class="footer">
                <p>Built for SIH 2025 | Powered by FastAPI, LLaMA 3.1, and ❤️</p>
                <p>Server Time: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
            </div>
        </div>
    </body>
    </html>
    """

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": settings.APP_VERSION,
        "services": {
            "database": "ok",
            "email": settings.EMAIL_ENABLED,
            "ai": bool(settings.GROQ_API_KEY),
            "glpi": settings.GLPI_ENABLED,
            "solman": settings.SOLMAN_ENABLED
        }
    }

@app.get("/health/database")
async def database_health(db = Depends(get_db)):
    """Check database connectivity"""
    try:
        # Simple query to test connection
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        return {"status": "connected", "timestamp": datetime.utcnow()}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database connection failed: {str(e)}")

@app.get("/health/ai")
async def ai_health():
    """Check AI service availability"""
    if not settings.GROQ_API_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured")
    
    # Test classification service
    from .services.classification_service import classification_service
    try:
        result = classification_service._fallback_classification(
            "Test ticket",
            "This is a test"
        )
        return {
            "status": "available",
            "model": settings.AI_MODEL,
            "fallback_working": True
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"AI service error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )
