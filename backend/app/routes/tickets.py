"""
Ticket management API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import logging
import asyncio

from ..database import get_db
from ..services.email_service import email_service
from ..services.sms_service import sms_service
from ..models.ticket_models import (
    Ticket,
    TicketStatus,
    TicketPriority,
    TicketCategory,
    TicketSource,
)
from pydantic import BaseModel

router = APIRouter()
logger = logging.getLogger(__name__)

# Pydantic models for request/response
class TicketCreate(BaseModel):
    title: str
    description: str
    requester_email: str
    requester_name: Optional[str] = None
    requester_phone: Optional[str] = None
    category: Optional[str] = "general"
    priority: Optional[str] = "medium"

def serialize_ticket(ticket: Ticket) -> dict:
    """Convert Ticket model into JSON-serializable dict."""
    if ticket.assigned_agent:
        assigned_to = ticket.assigned_agent.full_name or ticket.assigned_agent.username
    elif ticket.assigned_agent_id:
        assigned_to = str(ticket.assigned_agent_id)
    else:
        assigned_to = None

    return {
        "id": ticket.id,
        "ticket_number": ticket.ticket_number,
        "title": ticket.title,
        "description": ticket.description,
        "category": ticket.category.value if ticket.category else None,
        "priority": ticket.priority.value if ticket.priority else None,
        "status": ticket.status.value if ticket.status else None,
        "source": ticket.source.value if ticket.source else None,
        "assigned_team_id": ticket.assigned_team_id,
        "assigned_to": assigned_to,
        "requester_name": ticket.requester_name,
        "requester_email": ticket.requester_email,
        "requester_phone": ticket.requester_phone,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
        "updated_at": ticket.updated_at.isoformat() if ticket.updated_at else None,
    }


def _to_status_enum(value: str) -> TicketStatus:
    if value is None:
        raise ValueError("status value is None")
    upper_value = value.upper()
    try:
        return TicketStatus[upper_value]
    except KeyError:
        return TicketStatus(value.lower())


def _to_priority_enum(value: str) -> TicketPriority:
    if value is None:
        raise ValueError("priority value is None")
    upper_value = value.upper()
    try:
        return TicketPriority[upper_value]
    except KeyError:
        return TicketPriority(value.lower())


def _to_category_enum(value: str) -> TicketCategory:
    if value is None:
        raise ValueError("category value is None")
    upper_value = value.upper()
    try:
        return TicketCategory[upper_value]
    except KeyError:
        return TicketCategory(value.lower())

@router.get("/debug")
async def debug_endpoint():
    """Debug endpoint to test if routes are working"""
    return {"message": "Debug endpoint working", "timestamp": datetime.utcnow().isoformat()}

@router.post("/debug")
async def debug_post_endpoint(data: dict):
    """Debug POST endpoint"""
    return {
        "message": "Debug POST endpoint working",
        "received_data": data,
        "timestamp": datetime.utcnow().isoformat()
    }
async def list_tickets(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List tickets with enums serialized to primitives"""

    query = db.query(Ticket)

    if status:
        try:
            status_enum = _to_status_enum(status)
            query = query.filter(Ticket.status == status_enum)
        except Exception:
            logger.warning("Invalid status filter received: %s", status)
    if priority:
        try:
            priority_enum = _to_priority_enum(priority)
            query = query.filter(Ticket.priority == priority_enum)
        except Exception:
            logger.warning("Invalid priority filter received: %s", priority)

    tickets = (
        query.order_by(Ticket.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [serialize_ticket(ticket) for ticket in tickets]

@router.get("/{ticket_id}")
async def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Get ticket details by ID"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return serialize_ticket(ticket)

@router.post("/", status_code=201)
async def create_ticket(ticket_data: TicketCreate, db: Session = Depends(get_db)):
    """Create a new ticket manually"""
    try:
        logger.info(f"Starting ticket creation for: {ticket_data.title}")
        
        from ..services.classification_service import classification_service
        from ..services.routing_service import routing_service
        
        # Generate ticket number
        import uuid
        ticket_number = f"TKT-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        logger.info(f"Generated ticket number: {ticket_number}")
        
        # Create ticket
        ticket = Ticket(
            ticket_number=ticket_number,
            title=ticket_data.title,
            description=ticket_data.description,
            requester_email=ticket_data.requester_email,
            requester_name=ticket_data.requester_name,
            requester_phone=ticket_data.requester_phone,
            source=TicketSource.WEB_FORM,
        )
        logger.info(f"Ticket object created: {ticket.ticket_number}")
        
        # Seed defaults from request payload
        initial_category = ticket_data.category
        initial_priority = ticket_data.priority
        logger.info(f"Initial category: {initial_category}, priority: {initial_priority}")

        try:
            ticket.category = _to_category_enum(initial_category or TicketCategory.GENERAL.value)
            logger.info(f"Set category to: {ticket.category}")
        except Exception as e:
            logger.warning(f"Failed to set category {initial_category}: {e}")
            ticket.category = TicketCategory.GENERAL

        try:
            ticket.priority = _to_priority_enum(initial_priority or TicketPriority.MEDIUM.value)
            logger.info(f"Set priority to: {ticket.priority}")
        except Exception as e:
            logger.warning(f"Failed to set priority {initial_priority}: {e}")
            ticket.priority = TicketPriority.MEDIUM

        # Classify
        classification = None
        try:
            logger.info("Starting classification...")
            classification = classification_service.classify_ticket(
                title=ticket.title,
                description=ticket.description,
                source="api"
            )
            logger.info(f"Classification result: {classification}")
        except Exception as e:
            logger.warning(f"Classification service failed: {e}")

        # Apply classification overrides
        if classification:
            category_value = classification.get("category")
            priority_value = classification.get("priority")

            if category_value:
                try:
                    ticket.category = _to_category_enum(category_value)
                    logger.info(f"Classification overrode category to: {ticket.category}")
                except Exception:
                    logger.warning("Unexpected classification category: %s", category_value)

            if priority_value:
                try:
                    ticket.priority = _to_priority_enum(priority_value)
                    logger.info(f"Classification overrode priority to: {ticket.priority}")
                except Exception:
                    logger.warning("Unexpected classification priority: %s", priority_value)

            ticket.ai_classification_confidence = classification.get("confidence", 0.0)
        
        # Route to team
        try:
            logger.info("Starting routing...")
            team = routing_service.route_ticket(db, ticket, classification)
            if team:
                ticket.assigned_team_id = team.id
                logger.info(f"Routed to team: {team.id}")
            else:
                logger.info("No team assigned")
        except Exception as e:
            logger.warning(f"Routing service failed: {e}")
        
        # Save
        try:
            logger.info("Saving ticket to database...")
            db.add(ticket)
            db.commit()
            db.refresh(ticket)
            logger.info(f"Ticket saved successfully: {ticket.ticket_number}")
        except Exception as e:
            logger.error(f"Database save failed: {e}")
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to save ticket: {str(e)}")
        
        # Send notification (non-blocking)
        try:
            logger.info("Sending notification...")
            asyncio.create_task(
                email_service.send_ticket_created(
                    ticket.ticket_number,
                    ticket.requester_email,
                    ticket.title
                )
            )
            logger.info("Notification sent")
        except Exception as e:
            logger.warning(f"Failed to send email notification: {e}")
        
        logger.info(f"Ticket creation completed, returning: {ticket.ticket_number}")
        result = serialize_ticket(ticket)
        logger.info(f"Serialized result: {result}")
        return result
        
    except Exception as e:
        # Catch any unhandled exceptions and return error details for debugging
        logger.error(f"Unhandled exception in ticket creation: {e}", exc_info=True)
        return {
            "error": "Ticket creation failed",
            "exception_type": type(e).__name__,
            "exception_message": str(e),
            "ticket_data": {
                "title": ticket_data.title,
                "description": ticket_data.description,
                "requester_email": ticket_data.requester_email,
                "category": ticket_data.category,
                "priority": ticket_data.priority
            }
        }

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
    
    try:
        new_status_enum = _to_status_enum(status)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid status value")

    old_status = ticket.status.value if ticket.status else None
    ticket.status = new_status_enum
    ticket.updated_at = datetime.utcnow()
    
    if ticket.status in [TicketStatus.RESOLVED, TicketStatus.CLOSED]:
        ticket.resolved_at = datetime.utcnow()
    
    db.commit()
    
    # Send notification for status update
    asyncio.create_task(
        email_service.send_ticket_updated(
            ticket.ticket_number,
            ticket.requester_email,
            ticket.status.value
        )
    )
    
    return {
        "success": True,
        "old_status": old_status,
        "new_status": ticket.status.value,
    }

@router.delete("/{ticket_id}")
async def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Delete a ticket"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    db.delete(ticket)
    db.commit()
    
    return {"success": True, "message": "Ticket deleted"}
