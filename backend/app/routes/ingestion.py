"""
Ticket ingestion endpoints from various sources
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime
import uuid

from ..database import get_db
from ..models.ticket_models import Ticket, TicketSource
from ..services.classification_service import classification_service
from ..services.routing_service import routing_service
from ..services.chat_service import chat_service
from ..config import settings

router = APIRouter()

# Request models
class ChatbotTicketRequest(BaseModel):
    conversation_id: int
    session_id: str
    requester_email: EmailStr = "anonymous@system.com"
    additional_context: Optional[str] = None

class EmailTicketRequest(BaseModel):
    subject: str
    body: str
    from_email: EmailStr
    from_name: Optional[str] = None

class ExternalTicketRequest(BaseModel):
    external_id: str
    title: str
    description: str
    requester_email: EmailStr
    source: str  # glpi or solman
    priority: Optional[str] = None
    category: Optional[str] = None

class ChatMessage(BaseModel):
    message: str
    context: Optional[List[Dict]] = None

@router.post("/chatbot")
async def ingest_from_chatbot(
    request: ChatbotTicketRequest,
    db: Session = Depends(get_db)
):
    """
    Create ticket from NullChat chatbot conversation
    """
    # Note: This assumes NullChat database is accessible
    # In production, you'd either share the database or make an API call
    
    # For now, create ticket with provided info
    ticket_number = f"TKT-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
    
    ticket = Ticket(
        ticket_number=ticket_number,
        title=f"Chat Query - Session {request.session_id[:8]}",
        description=f"User requested support via chatbot.\nSession ID: {request.session_id}\nConversation ID: {request.conversation_id}",
        source=TicketSource.CHAT,
        source_reference=str(request.conversation_id),
        requester_email=request.requester_email
    )
    
    # Classify
    classification = classification_service.classify_ticket(
        title=ticket.title,
        description=ticket.description + (f"\n\nContext: {request.additional_context}" if request.additional_context else ""),
        source="chat"
    )
    
    ticket.category = classification.get("category", "general")
    ticket.priority = classification.get("priority", "medium")
    ticket.ai_classification_confidence = classification.get("confidence", 0.0)
    
    # Route
    team = routing_service.route_ticket(db, ticket, classification)
    if team:
        ticket.assigned_team_id = team.id
        routing_service.update_team_load(db, team.id, increment=1)
    
    # Set SLA
    from datetime import timedelta
    sla_minutes = settings.get_sla_deadline_minutes(ticket.priority.value)
    ticket.sla_deadline = datetime.utcnow() + timedelta(minutes=sla_minutes)
    
    # Save
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    return {
        "success": True,
        "ticket_number": ticket.ticket_number,
        "ticket_id": ticket.id,
        "assigned_team": team.name if team else "Unassigned",
        "priority": ticket.priority.value,
        "category": ticket.category.value
    }

@router.post("/email")
async def ingest_from_email(
    request: EmailTicketRequest,
    db: Session = Depends(get_db)
):
    """
    Create ticket from email
    """
    ticket_number = f"TKT-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
    
    ticket = Ticket(
        ticket_number=ticket_number,
        title=request.subject[:200],  # Limit title length
        description=request.body,
        source=TicketSource.EMAIL,
        requester_email=request.from_email,
        requester_name=request.from_name
    )
    
    # Classify
    classification = classification_service.classify_ticket(
        title=ticket.title,
        description=ticket.description,
        source="email"
    )
    
    ticket.category = classification.get("category", "general")
    ticket.priority = classification.get("priority", "medium")
    ticket.ai_classification_confidence = classification.get("confidence", 0.0)
    
    # Route
    team = routing_service.route_ticket(db, ticket, classification)
    if team:
        ticket.assigned_team_id = team.id
        routing_service.update_team_load(db, team.id, increment=1)
    
    # Set SLA
    from datetime import timedelta
    sla_minutes = settings.get_sla_deadline_minutes(ticket.priority.value)
    ticket.sla_deadline = datetime.utcnow() + timedelta(minutes=sla_minutes)
    
    # Save
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    return {
        "success": True,
        "ticket_number": ticket.ticket_number,
        "ticket_id": ticket.id
    }

@router.post("/glpi")
async def ingest_from_glpi(
    request: ExternalTicketRequest,
    db: Session = Depends(get_db)
):
    """
    Create ticket from GLPI webhook
    """
    if not settings.GLPI_ENABLED:
        raise HTTPException(status_code=503, detail="GLPI integration is not enabled")
    
    # Check if already exists
    existing = db.query(Ticket).filter(
        Ticket.source == TicketSource.GLPI,
        Ticket.source_reference == request.external_id
    ).first()
    
    if existing:
        return {"success": True, "ticket_number": existing.ticket_number, "message": "Ticket already exists"}
    
    ticket_number = f"TKT-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
    
    ticket = Ticket(
        ticket_number=ticket_number,
        title=request.title,
        description=request.description,
        source=TicketSource.GLPI,
        source_reference=request.external_id,
        requester_email=request.requester_email
    )
    
    # Use provided classification or AI classify
    if request.category and request.priority:
        ticket.category = request.category
        ticket.priority = request.priority
    else:
        classification = classification_service.classify_ticket(
            title=ticket.title,
            description=ticket.description,
            source="glpi"
        )
        ticket.category = classification.get("category", "general")
        ticket.priority = classification.get("priority", "medium")
    
    # Route
    classification = {"category": ticket.category, "priority": ticket.priority}
    team = routing_service.route_ticket(db, ticket, classification)
    if team:
        ticket.assigned_team_id = team.id
    
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    return {"success": True, "ticket_number": ticket.ticket_number}

@router.post("/solman")
async def ingest_from_solman(
    request: ExternalTicketRequest,
    db: Session = Depends(get_db)
):
    """
    Create ticket from SAP Solman webhook
    """
    if not settings.SOLMAN_ENABLED:
        raise HTTPException(status_code=503, detail="Solman integration is not enabled")
    
    # Similar to GLPI ingestion
    existing = db.query(Ticket).filter(
        Ticket.source == TicketSource.SOLMAN,
        Ticket.source_reference == request.external_id
    ).first()
    
    if existing:
        return {"success": True, "ticket_number": existing.ticket_number, "message": "Ticket already exists"}
    
    ticket_number = f"TKT-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
    
    ticket = Ticket(
        ticket_number=ticket_number,
        title=request.title,
        description=request.description,
        source=TicketSource.SOLMAN,
        source_reference=request.external_id,
        requester_email=request.requester_email
    )
    
    if request.category and request.priority:
        ticket.category = request.category
        ticket.priority = request.priority
    else:
        classification = classification_service.classify_ticket(
            title=ticket.title,
            description=ticket.description,
            source="solman"
        )
        ticket.category = classification.get("category", "general")
        ticket.priority = classification.get("priority", "medium")
    
    classification = {"category": ticket.category, "priority": ticket.priority}
    team = routing_service.route_ticket(db, ticket, classification)
    if team:
        ticket.assigned_team_id = team.id
    
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    return {"success": True, "ticket_number": ticket.ticket_number}

@router.post("/chat")
async def chat_with_ai(request: ChatMessage):
    """
    Chat with AI assistant for IT support
    """
    response = chat_service.chat(request.message, request.context)
    return {"response": response, "success": True}

@router.get("/sync/status")
async def get_sync_status(db: Session = Depends(get_db)):
    """
    Get synchronization status of external systems
    """
    from ..models.ticket_models import ExternalSystemConfig
    
    systems = db.query(ExternalSystemConfig).all()
    
    return {
        "systems": [
            {
                "name": system.system_name,
                "type": system.system_type.value,
                "enabled": system.sync_enabled,
                "last_sync": system.last_sync_at,
                "status": system.last_sync_status
            }
            for system in systems
        ]
    }
