"""
Ticket management API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models.ticket_models import Ticket, TicketStatus, TicketPriority
from pydantic import BaseModel

router = APIRouter()

# Pydantic models for request/response
class TicketCreate(BaseModel):
    title: str
    description: str
    requester_email: str
    requester_name: Optional[str] = None
    requester_phone: Optional[str] = None

class TicketResponse(BaseModel):
    id: int
    ticket_number: str
    title: str
    status: str
    priority: str
    category: str
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[TicketResponse])
async def list_tickets(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all tickets with pagination and filters"""
    query = db.query(Ticket)
    
    if status:
        query = query.filter(Ticket.status == status)
    if priority:
        query = query.filter(Ticket.priority == priority)
    
    tickets = query.order_by(Ticket.created_at.desc()).offset(skip).limit(limit).all()
    return tickets

@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Get ticket details by ID"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.post("/", response_model=TicketResponse)
async def create_ticket(ticket_data: TicketCreate, db: Session = Depends(get_db)):
    """Create a new ticket manually"""
    from ..services.classification_service import classification_service
    from ..services.routing_service import routing_service
    
    # Generate ticket number
    import uuid
    ticket_number = f"TKT-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
    
    # Create ticket
    ticket = Ticket(
        ticket_number=ticket_number,
        title=ticket_data.title,
        description=ticket_data.description,
        requester_email=ticket_data.requester_email,
        requester_name=ticket_data.requester_name,
        requester_phone=ticket_data.requester_phone,
    )
    
    # Classify
    classification = classification_service.classify_ticket(
        title=ticket.title,
        description=ticket.description,
        source="api"
    )
    
    # Apply classification
    ticket.category = classification.get("category", "general")
    ticket.priority = classification.get("priority", "medium")
    ticket.ai_classification_confidence = classification.get("confidence", 0.0)
    
    # Route to team
    team = routing_service.route_ticket(db, ticket, classification)
    if team:
        ticket.assigned_team_id = team.id
    
    # Save
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    return ticket

@router.put("/{ticket_id}/status")
async def update_ticket_status(
    ticket_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    """Update ticket status"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    old_status = ticket.status.value
    ticket.status = status
    ticket.updated_at = datetime.utcnow()
    
    if status in ["resolved", "closed"]:
        ticket.resolved_at = datetime.utcnow()
    
    db.commit()
    
    return {"success": True, "old_status": old_status, "new_status": status}

@router.delete("/{ticket_id}")
async def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Delete a ticket"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    db.delete(ticket)
    db.commit()
    
    return {"success": True, "message": "Ticket deleted"}
