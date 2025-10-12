"""
Extended database models for NullTicket unified ticketing system
Integrates with existing NullChat models
"""
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Boolean, Float, 
    ForeignKey, Enum, JSON
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from pydantic import BaseModel, Field
from typing import Optional, List

Base = declarative_base()

# ============================================================================
# ENUMS
# ============================================================================

class TicketSource(enum.Enum):
    """Source of ticket creation"""
    CHAT = "chat"
    EMAIL = "email"
    GLPI = "glpi"
    SOLMAN = "solman"
    WEB_FORM = "web_form"
    API = "api"

class TicketStatus(enum.Enum):
    """Ticket status lifecycle"""
    NEW = "new"
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    PENDING_USER = "pending_user"
    PENDING_VENDOR = "pending_vendor"
    RESOLVED = "resolved"
    CLOSED = "closed"
    REOPENED = "reopened"

class TicketPriority(enum.Enum):
    """Ticket priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
    URGENT = "urgent"

class TicketCategory(enum.Enum):
    """Ticket categories for classification"""
    NETWORK = "network"
    HARDWARE = "hardware"
    SOFTWARE = "software"
    PASSWORD_RESET = "password_reset"
    ACCESS_REQUEST = "access_request"
    SAP_ERROR = "sap_error"
    PRINTER = "printer"
    EMAIL = "email"
    VPN = "vpn"
    HR_QUERY = "hr_query"
    FINANCE = "finance"
    GENERAL = "general"
    OTHER = "other"

# ============================================================================
# PYDANTIC MODELS (API)
# ============================================================================

class Priority(str, enum.Enum):
    """Pydantic-compatible priority enum"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
    URGENT = "urgent"

class Status(str, enum.Enum):
    """Pydantic-compatible status enum"""
    NEW = "new"
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    PENDING_USER = "pending_user"
    PENDING_VENDOR = "pending_vendor"
    RESOLVED = "resolved"
    CLOSED = "closed"
    REOPENED = "reopened"

class TicketCreate(BaseModel):
    """Request model for creating tickets"""
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    category: Optional[str] = "general"
    priority: Priority = Priority.MEDIUM
    source: str = "web_form"
    requester_email: Optional[str] = None
    requester_name: Optional[str] = None
    requester_phone: Optional[str] = None
    assigned_to: Optional[str] = None
    external_id: Optional[str] = None
    tags: Optional[List[str]] = []

class TicketUpdate(BaseModel):
    """Request model for updating tickets"""
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[Priority] = None
    status: Optional[Status] = None
    assigned_to: Optional[str] = None
    resolution: Optional[str] = None
    tags: Optional[List[str]] = None

class TicketResponse(BaseModel):
    """Response model for tickets"""
    id: str
    ticket_number: str
    title: str
    description: str
    category: str
    priority: str
    status: str
    source: str
    requester_email: Optional[str]
    requester_name: Optional[str]
    assigned_to: Optional[str]
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]
    sla_deadline: Optional[datetime]
    tags: List[str] = []

# ============================================================================
# CORE TICKET MODEL
# ============================================================================

# ============================================================================
# ENUMS
# ============================================================================

class TicketSource(enum.Enum):
    """Source of ticket creation"""
    CHAT = "chat"
    EMAIL = "email"
    GLPI = "glpi"
    SOLMAN = "solman"
    WEB_FORM = "web_form"
    API = "api"

class TicketStatus(enum.Enum):
    """Ticket status lifecycle"""
    NEW = "new"
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    PENDING_USER = "pending_user"
    PENDING_VENDOR = "pending_vendor"
    RESOLVED = "resolved"
    CLOSED = "closed"
    REOPENED = "reopened"

class TicketPriority(enum.Enum):
    """Ticket priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
    URGENT = "urgent"

class TicketCategory(enum.Enum):
    """Ticket categories for classification"""
    NETWORK = "network"
    HARDWARE = "hardware"
    SOFTWARE = "software"
    PASSWORD_RESET = "password_reset"
    ACCESS_REQUEST = "access_request"
    SAP_ERROR = "sap_error"
    PRINTER = "printer"
    EMAIL = "email"
    VPN = "vpn"
    HR_QUERY = "hr_query"
    FINANCE = "finance"
    GENERAL = "general"
    OTHER = "other"

# ============================================================================
# CORE TICKET MODEL
# ============================================================================

class Ticket(Base):
    """Main ticket entity"""
    __tablename__ = "tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String, unique=True, index=True)  # e.g., TKT-2024-00001
    
    # Basic Information
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    source = Column(Enum(TicketSource), default=TicketSource.WEB_FORM)
    source_reference = Column(String)  # Original ticket ID from external system
    
    # Classification
    category = Column(Enum(TicketCategory), default=TicketCategory.GENERAL)
    priority = Column(Enum(TicketPriority), default=TicketPriority.MEDIUM)
    status = Column(Enum(TicketStatus), default=TicketStatus.NEW)
    
    # Assignment
    assigned_team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    assigned_agent_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # User Information
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    requester_name = Column(String)
    requester_email = Column(String)
    requester_phone = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    
    # SLA Management
    sla_deadline = Column(DateTime, nullable=True)
    sla_breached = Column(Boolean, default=False)
    
    # AI & Automation
    ai_classification_confidence = Column(Float, default=0.0)
    auto_resolved = Column(Boolean, default=False)
    kb_article_used = Column(Integer, ForeignKey("knowledge_articles.id"), nullable=True)
    
    # Resolution
    resolution = Column(Text, nullable=True)
    resolution_time_minutes = Column(Integer, nullable=True)
    
    # Feedback
    satisfaction_rating = Column(Integer, nullable=True)  # 1-5 stars
    feedback_comment = Column(Text, nullable=True)
    
    # Escalation
    escalation_level = Column(Integer, default=0)
    escalated_at = Column(DateTime, nullable=True)
    
    # Additional metadata
    tags = Column(JSON, default=list)  # ["urgent", "vpn", "remote_user"]
    custom_fields = Column(JSON, default=dict)
    
    # Relationships
    assigned_team = relationship("Team", back_populates="tickets")
    assigned_agent = relationship("User", foreign_keys=[assigned_agent_id], back_populates="assigned_tickets")
    created_by = relationship("User", foreign_keys=[created_by_user_id], back_populates="created_tickets")
    history = relationship("TicketHistory", back_populates="ticket", cascade="all, delete-orphan")
    comments = relationship("TicketComment", back_populates="ticket", cascade="all, delete-orphan")
    attachments = relationship("TicketAttachment", back_populates="ticket", cascade="all, delete-orphan")

# ============================================================================
# TICKET HISTORY & COMMENTS
# ============================================================================

class TicketHistory(Base):
    """Audit trail for ticket changes"""
    __tablename__ = "ticket_history"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    
    action = Column(String)  # "status_changed", "assigned", "priority_changed", etc.
    field_name = Column(String)
    old_value = Column(String, nullable=True)
    new_value = Column(String, nullable=True)
    
    changed_by_id = Column(Integer, ForeignKey("users.id"))
    changed_by_name = Column(String)  # For system actions
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    ticket = relationship("Ticket", back_populates="history")
    changed_by = relationship("User")

class TicketComment(Base):
    """Comments/notes on tickets"""
    __tablename__ = "ticket_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    
    comment = Column(Text, nullable=False)
    is_internal = Column(Boolean, default=False)  # Internal notes vs public comments
    
    created_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    ticket = relationship("Ticket", back_populates="comments")
    created_by = relationship("User")

class TicketAttachment(Base):
    """File attachments for tickets"""
    __tablename__ = "ticket_attachments"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer)
    mime_type = Column(String)
    
    uploaded_by_id = Column(Integer, ForeignKey("users.id"))
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    ticket = relationship("Ticket", back_populates="attachments")
    uploaded_by = relationship("User")

# ============================================================================
# TEAMS & USERS
# ============================================================================

class Team(Base):
    """Support teams for ticket routing"""
    __tablename__ = "teams"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    email = Column(String, unique=True)
    
    # Capacity management
    max_capacity = Column(Integer, default=50)
    current_load = Column(Integer, default=0)
    
    # Specialization
    specialization = Column(JSON, default=list)  # ["network", "vpn", "firewall"]
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    tickets = relationship("Ticket", back_populates="assigned_team")
    members = relationship("User", back_populates="team")
    routing_rules = relationship("RoutingRule", back_populates="team")

class User(Base):
    """Users (employees, admins, agents)"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False)
    full_name = Column(String)
    
    # Authentication
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    is_agent = Column(Boolean, default=False)
    
    # Team membership
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    
    # Preferences
    language_preference = Column(String, default="en")
    notification_email = Column(Boolean, default=True)
    notification_sms = Column(Boolean, default=False)
    phone_number = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    team = relationship("Team", back_populates="members")
    assigned_tickets = relationship("Ticket", foreign_keys=[Ticket.assigned_agent_id], back_populates="assigned_agent")
    created_tickets = relationship("Ticket", foreign_keys=[Ticket.created_by_user_id], back_populates="created_by")

# ============================================================================
# ROUTING & AUTOMATION
# ============================================================================

class RoutingRule(Base):
    """Configurable routing rules for tickets"""
    __tablename__ = "routing_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    # Matching criteria
    category = Column(Enum(TicketCategory), nullable=True)
    keywords = Column(JSON, default=list)  # ["vpn", "connection", "remote"]
    priority_min = Column(Enum(TicketPriority), nullable=True)
    source = Column(Enum(TicketSource), nullable=True)
    
    # Routing target
    assigned_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    
    # Rule configuration
    confidence_threshold = Column(Float, default=0.7)
    is_active = Column(Boolean, default=True)
    order_priority = Column(Integer, default=100)  # Lower = higher priority
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    team = relationship("Team", back_populates="routing_rules")

class KnowledgeArticle(Base):
    """Knowledge base articles for self-service"""
    __tablename__ = "knowledge_articles"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    
    # Classification
    category = Column(Enum(TicketCategory))
    tags = Column(JSON, default=list)
    keywords = Column(JSON, default=list)
    
    # Effectiveness tracking
    view_count = Column(Integer, default=0)
    helpful_count = Column(Integer, default=0)
    not_helpful_count = Column(Integer, default=0)
    resolution_count = Column(Integer, default=0)  # Tickets auto-resolved using this
    
    # Metadata
    created_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Language support
    language = Column(String, default="en")
    
    # Relationships
    created_by = relationship("User")

class KBSuggestion(Base):
    """AI-generated suggestions for new KB articles"""
    __tablename__ = "kb_suggestions"
    
    id = Column(Integer, primary_key=True, index=True)
    suggested_title = Column(String, nullable=False)
    ticket_pattern = Column(Text)  # Common pattern identified
    frequency_count = Column(Integer, default=1)
    
    # Sample tickets that match this pattern
    sample_ticket_ids = Column(JSON, default=list)
    
    # AI analysis
    category = Column(Enum(TicketCategory))
    keywords = Column(JSON, default=list)
    suggested_content = Column(Text, nullable=True)
    
    # Status
    status = Column(String, default="pending")  # pending, approved, rejected, created
    suggested_by = Column(String, default="system")  # system or admin_username
    
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    reviewed_by = relationship("User")

# ============================================================================
# EXTERNAL SYSTEM INTEGRATION
# ============================================================================

class ExternalSystemConfig(Base):
    """Configuration for external ticketing systems"""
    __tablename__ = "external_systems"
    
    id = Column(Integer, primary_key=True, index=True)
    system_name = Column(String, unique=True, nullable=False)  # GLPI, Solman, etc.
    system_type = Column(Enum(TicketSource))
    
    # Connection details
    api_url = Column(String, nullable=False)
    api_key = Column(String, nullable=True)
    auth_config = Column(JSON, default=dict)  # Flexible auth config
    
    # Sync configuration
    sync_enabled = Column(Boolean, default=True)
    sync_interval_minutes = Column(Integer, default=15)
    last_sync_at = Column(DateTime, nullable=True)
    last_sync_status = Column(String, nullable=True)
    
    # Mapping configuration
    field_mapping = Column(JSON, default=dict)  # Map external fields to our schema
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class TicketSync(Base):
    """Track sync status of tickets from external systems"""
    __tablename__ = "ticket_syncs"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    external_system_id = Column(Integer, ForeignKey("external_systems.id"), nullable=False)
    
    external_ticket_id = Column(String, nullable=False)
    last_synced_at = Column(DateTime, default=datetime.utcnow)
    sync_status = Column(String, default="success")  # success, failed, pending
    sync_error = Column(Text, nullable=True)
    
    # Relationships
    ticket = relationship("Ticket")
    external_system = relationship("ExternalSystemConfig")

# ============================================================================
# ANALYTICS & REPORTING
# ============================================================================

class TicketMetrics(Base):
    """Daily aggregated metrics for analytics"""
    __tablename__ = "ticket_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, unique=True, index=True)
    
    # Volume metrics
    total_tickets = Column(Integer, default=0)
    new_tickets = Column(Integer, default=0)
    resolved_tickets = Column(Integer, default=0)
    closed_tickets = Column(Integer, default=0)
    
    # Source breakdown
    tickets_from_chat = Column(Integer, default=0)
    tickets_from_email = Column(Integer, default=0)
    tickets_from_glpi = Column(Integer, default=0)
    tickets_from_solman = Column(Integer, default=0)
    
    # Resolution metrics
    avg_resolution_time_minutes = Column(Float, default=0.0)
    auto_resolved_count = Column(Integer, default=0)
    
    # Satisfaction
    avg_satisfaction_rating = Column(Float, default=0.0)
    total_feedback_count = Column(Integer, default=0)
    
    # SLA
    sla_met_count = Column(Integer, default=0)
    sla_breached_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
