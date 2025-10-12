"""
Database configuration and session management
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models.ticket_models import Base
import os

# Database URL - SQLite for development, PostgreSQL for production
db_path = os.path.join(os.path.dirname(__file__), "..", "data", "tickets.db")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{db_path}")

# Create engine with appropriate settings
engine_args = {}
if "sqlite" in DATABASE_URL:
    engine_args["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_args)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
    print("✅ Database initialized successfully")

def get_db():
    """Dependency for getting DB session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
