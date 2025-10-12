"""
Pydantic models for API requests and responses
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# ============================================================================
# ENUMS (matching database enums)
# ============================================================================

class TicketSource(str, Enum):
    CHAT = "chat"
    EMAIL = "email"
    GLPI = "glpi"
    SOLMAN = "solman"
    WEB_FORM = "web_form"
    API = "api"

class TicketStatus(str, Enum):
    NEW = "new"
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    PENDING_USER = "pending_user"
    PENDING_VENDOR = "pending_vendor"
    RESOLVED = "resolved"
    CLOSED = "closed"
    REOPENED = "reopened"

class TicketPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
    URGENT = "urgent"

class TicketCategory(str, Enum):
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
# API REQUEST/RESPONSE MODELS
# ============================================================================

class TicketCreate(BaseModel):
    """Request model for creating a new ticket"""
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    category: Optional[TicketCategory] = TicketCategory.GENERAL
    priority: Optional[TicketPriority] = TicketPriority.MEDIUM
    source: Optional[TicketSource] = TicketSource.WEB_FORM
    requester_name: Optional[str] = None
    requester_email: Optional[EmailStr] = None
    requester_phone: Optional[str] = None
    tags: Optional[List[str]] = []
    custom_fields: Optional[Dict[str, Any]] = {}

class TicketUpdate(BaseModel):
    """Request model for updating a ticket"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    category: Optional[TicketCategory] = None
    priority: Optional[TicketPriority] = None
    status: Optional[TicketStatus] = None
    assigned_team_id: Optional[int] = None
    assigned_agent_id: Optional[int] = None
    resolution: Optional[str] = None
    tags: Optional[List[str]] = None
    custom_fields: Optional[Dict[str, Any]] = None

class TicketResponse(BaseModel):
    """Response model for ticket data"""
    id: int
    ticket_number: str
    title: str
    description: str
    source: TicketSource
    source_reference: Optional[str]
    category: TicketCategory
    priority: TicketPriority
    status: TicketStatus
    assigned_team_id: Optional[int]
    assigned_agent_id: Optional[int]
    requester_name: Optional[str]
    requester_email: Optional[str]
    requester_phone: Optional[str]
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]
    closed_at: Optional[datetime]
    sla_deadline: Optional[datetime]
    sla_breached: bool
    ai_classification_confidence: float
    auto_resolved: bool
    resolution: Optional[str]
    resolution_time_minutes: Optional[int]
    satisfaction_rating: Optional[int]
    feedback_comment: Optional[str]
    escalation_level: int
    escalated_at: Optional[datetime]
    tags: List[str]
    custom_fields: Dict[str, Any]

    class Config:
        from_attributes = True

class TicketListResponse(BaseModel):
    """Response model for ticket list"""
    tickets: List[TicketResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# ============================================================================
# CHATBOT INTEGRATION MODELS
# ============================================================================

class ChatbotMessage(BaseModel):
    """Request model for chatbot message ingestion"""
    message: str = Field(..., min_length=1)
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    language: Optional[str] = "en"
    context: Optional[Dict[str, Any]] = {}

class ChatbotResponse(BaseModel):
    """Response model for chatbot message processing"""
    ticket_id: Optional[str] = None
    message: str
    auto_resolved: bool = False
    kb_article_id: Optional[int] = None
    confidence: float = 0.0

# ============================================================================
# EMAIL INGESTION MODELS
# ============================================================================

class EmailIngestionRequest(BaseModel):
    """Request model for email ingestion"""
    subject: str
    body: str
    sender_email: EmailStr
    sender_name: Optional[str] = None
    attachments: Optional[List[Dict[str, Any]]] = []
    message_id: Optional[str] = None
    thread_id: Optional[str] = None

class EmailIngestionResponse(BaseModel):
    """Response model for email ingestion"""
    ticket_id: str
    message: str
    auto_classified: bool = False

# ============================================================================
# ANALYTICS MODELS
# ============================================================================

class DashboardStats(BaseModel):
    """Dashboard statistics response"""
    total_tickets: int
    open_tickets: int
    resolved_tickets: int
    avg_resolution_time: float
    sla_compliance: float
    tickets_by_source: Dict[str, int]
    tickets_by_priority: Dict[str, int]
    tickets_by_status: Dict[str, int]

class AnalyticsResponse(BaseModel):
    """General analytics response"""
    period: str
    metrics: DashboardStats
    trends: Dict[str, List[Dict[str, Any]]]

# ============================================================================
# WEBHOOK MODELS
# ============================================================================

class GLPIWebhook(BaseModel):
    """GLPI webhook payload"""
    ticket_id: str
    title: str
    content: str
    category: Optional[str] = None
    priority: Optional[int] = None
    requester_email: Optional[EmailStr] = None
    requester_name: Optional[str] = None
    attachments: Optional[List[Dict[str, Any]]] = []

class SolmanWebhook(BaseModel):
    """SAP Solman webhook payload"""
    incident_id: str
    short_description: str
    long_description: str
    category: Optional[str] = None
    priority: Optional[str] = None
    reporter_email: Optional[EmailStr] = None
    reporter_name: Optional[str] = None
    attachments: Optional[List[Dict[str, Any]]] = []

class WebhookResponse(BaseModel):
    """Response for webhook processing"""
    success: bool
    ticket_id: str
    message: str
    external_ticket_id: str

# ============================================================================
# ADMIN MODELS
# ============================================================================

class TeamCreate(BaseModel):
    """Request model for creating a team"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    email: EmailStr
    max_capacity: Optional[int] = 50
    specialization: Optional[List[str]] = []

class TeamResponse(BaseModel):
    """Response model for team data"""
    id: int
    name: str
    description: Optional[str]
    email: str
    max_capacity: int
    current_load: int
    specialization: List[str]
    is_active: bool
    created_at: datetime

class RoutingRuleCreate(BaseModel):
    """Request model for creating a routing rule"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    category: Optional[TicketCategory] = None
    keywords: Optional[List[str]] = []
    priority_min: Optional[TicketPriority] = None
    source: Optional[TicketSource] = None
    assigned_team_id: int
    confidence_threshold: Optional[float] = 0.7
    order_priority: Optional[int] = 100

class RoutingRuleResponse(BaseModel):
    """Response model for routing rule data"""
    id: int
    name: str
    description: Optional[str]
    category: Optional[TicketCategory]
    keywords: List[str]
    priority_min: Optional[TicketPriority]
    source: Optional[TicketSource]
    assigned_team_id: int
    confidence_threshold: float
    is_active: bool
    order_priority: int
    created_at: datetime
    updated_at: datetime

# ============================================================================
# UTILITY MODELS
# ============================================================================

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    timestamp: datetime
    version: str
    services: Dict[str, Any]

class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    message: str
    timestamp: datetime
    details: Optional[Dict[str, Any]] = None