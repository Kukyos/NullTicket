"""
Configuration management for NullTicket system
"""
import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings:
    """Application settings"""
    
    # Application
    APP_NAME: str = "NullTicket - Unified Ticketing System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./data/tickets.db")
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    
    # AI Services
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    AI_MODEL: str = "llama-3.1-8b-instant"
    
    # Email Configuration
    EMAIL_ENABLED: bool = os.getenv("EMAIL_ENABLED", "True").lower() == "true"
    EMAIL_HOST: str = os.getenv("EMAIL_HOST", "imap.gmail.com")
    EMAIL_PORT: int = int(os.getenv("EMAIL_PORT", "993"))
    EMAIL_USER: str = os.getenv("EMAIL_USER", "")
    EMAIL_PASSWORD: str = os.getenv("EMAIL_PASSWORD", "")
    EMAIL_CHECK_INTERVAL: int = int(os.getenv("EMAIL_CHECK_INTERVAL", "60"))  # seconds
    
    # SMTP for sending emails
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", EMAIL_USER)
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", EMAIL_PASSWORD)
    
    # SMS Configuration (Twilio)
    SMS_ENABLED: bool = os.getenv("SMS_ENABLED", "False").lower() == "true"
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_PHONE_NUMBER: str = os.getenv("TWILIO_PHONE_NUMBER", "")
    
    # External Systems
    # GLPI
    GLPI_ENABLED: bool = os.getenv("GLPI_ENABLED", "False").lower() == "true"
    GLPI_API_URL: str = os.getenv("GLPI_API_URL", "")
    GLPI_API_KEY: str = os.getenv("GLPI_API_KEY", "")
    GLPI_SYNC_INTERVAL: int = int(os.getenv("GLPI_SYNC_INTERVAL", "300"))  # 5 minutes
    
    # SAP Solman
    SOLMAN_ENABLED: bool = os.getenv("SOLMAN_ENABLED", "False").lower() == "true"
    SOLMAN_API_URL: str = os.getenv("SOLMAN_API_URL", "")
    SOLMAN_USERNAME: str = os.getenv("SOLMAN_USERNAME", "")
    SOLMAN_PASSWORD: str = os.getenv("SOLMAN_PASSWORD", "")
    SOLMAN_SYNC_INTERVAL: int = int(os.getenv("SOLMAN_SYNC_INTERVAL", "300"))
    
    # NullChat Integration
    NULLCHAT_API_URL: str = os.getenv("NULLCHAT_API_URL", "http://localhost:8000")
    
    # File Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./data/uploads")
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))
    
    # SLA Configuration (in minutes)
    SLA_CRITICAL: int = 60  # 1 hour
    SLA_URGENT: int = 240  # 4 hours
    SLA_HIGH: int = 480  # 8 hours
    SLA_MEDIUM: int = 1440  # 24 hours
    SLA_LOW: int = 2880  # 48 hours
    
    # Auto-classification thresholds
    CLASSIFICATION_CONFIDENCE_THRESHOLD: float = 0.7
    SELF_SERVICE_CONFIDENCE_THRESHOLD: float = 0.8
    
    # Background Tasks
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ]
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    def get_sla_deadline_minutes(self, priority: str) -> int:
        """Get SLA deadline based on priority"""
        sla_map = {
            "critical": self.SLA_CRITICAL,
            "urgent": self.SLA_URGENT,
            "high": self.SLA_HIGH,
            "medium": self.SLA_MEDIUM,
            "low": self.SLA_LOW,
        }
        return sla_map.get(priority.lower(), self.SLA_MEDIUM)

# Global settings instance
settings = Settings()
