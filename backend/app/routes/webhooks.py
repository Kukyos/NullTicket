"""Webhook handlers for GLPI and SAP Solman integrations."""
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, Dict, Any
import hashlib
import hmac
import logging

from app.models.ticket_models import TicketCreate, Priority, Status
from app.services.classification_service import classify_ticket
from app.services.routing_service import routing_service
from app.database import get_db
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)
router = APIRouter()


class GLPIWebhook(BaseModel):
    """GLPI webhook payload."""
    ticket_id: str
    title: str
    content: str
    category: Optional[str] = None
    priority: Optional[int] = None
    requester_email: Optional[str] = None


class SolmanWebhook(BaseModel):
    """SAP Solman webhook payload."""
    incident_id: str
    short_description: str
    long_description: str
    category: Optional[str] = None
    priority: Optional[str] = None
    reporter_email: Optional[str] = None


def verify_glpi_signature(payload: str, signature: str, secret: str) -> bool:
    """Verify GLPI webhook signature."""
    expected_signature = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected_signature)


@router.post("/glpi")
async def glpi_webhook(
    webhook_data: GLPIWebhook,
    x_glpi_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Handle GLPI webhook for ticket ingestion.
    
    GLPI Configuration:
    1. Enable webhook plugin in GLPI
    2. Set webhook URL: https://your-domain.com/api/ingest/glpi
    3. Configure authentication with shared secret
    4. Set trigger: On ticket creation/update
    """
    try:
        # Verify webhook signature (optional but recommended)
        # if x_glpi_signature:
        #     if not verify_glpi_signature(webhook_data.json(), x_glpi_signature, GLPI_SECRET):
        #         raise HTTPException(status_code=401, detail="Invalid signature")

        # Map GLPI priority to our system
        priority_map = {
            1: Priority.LOW,
            2: Priority.LOW,
            3: Priority.MEDIUM,
            4: Priority.HIGH,
            5: Priority.CRITICAL,
        }
        
        # Create ticket in our system
        ticket_data = TicketCreate(
            title=webhook_data.title,
            description=webhook_data.content,
            category=webhook_data.category or "General",
            priority=priority_map.get(webhook_data.priority or 3, Priority.MEDIUM),
            source="glpi",
            requester_email=webhook_data.requester_email,
            external_id=webhook_data.ticket_id
        )

        # Classify and route
        classification = await classify_ticket(
            ticket_data.title,
            ticket_data.description
        )
        
        ticket_data.category = classification.get("category", ticket_data.category)
        ticket_data.priority = Priority(classification.get("priority", ticket_data.priority.value))
        
        # Save to database first
        from app.models.ticket_models import Ticket
        db_ticket = Ticket(**ticket_data.dict())
        db.add(db_ticket)
        db.commit()
        db.refresh(db_ticket)
        
        # Now route the saved ticket
        assigned_team = routing_service.route_ticket(db, db_ticket, classification)
        if assigned_team:
            db_ticket.assigned_team_id = assigned_team.id
            db.commit()
            db.refresh(db_ticket)

        logger.info(f"GLPI ticket ingested: {db_ticket.id}")
        
        return {
            "success": True,
            "ticket_id": db_ticket.id,
            "message": "Ticket ingested from GLPI"
        }

    except Exception as e:
        logger.error(f"GLPI webhook error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/solman")
async def solman_webhook(
    webhook_data: SolmanWebhook,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Handle SAP Solman webhook for ticket ingestion.
    
    SAP Solman Configuration:
    1. Configure outbound notification in Solman
    2. Set endpoint URL: https://your-domain.com/api/ingest/solman
    3. Configure basic auth or API key
    4. Set trigger: On incident creation
    """
    try:
        # Verify authorization (implement your auth logic)
        # if not authorization or not authorization.startswith("Bearer "):
        #     raise HTTPException(status_code=401, detail="Unauthorized")

        # Map Solman priority to our system
        priority_map = {
            "1 - Very High": Priority.CRITICAL,
            "2 - High": Priority.HIGH,
            "3 - Medium": Priority.MEDIUM,
            "4 - Low": Priority.LOW,
        }
        
        # Create ticket in our system
        ticket_data = TicketCreate(
            title=webhook_data.short_description,
            description=webhook_data.long_description,
            category=webhook_data.category or "SAP",
            priority=priority_map.get(webhook_data.priority or "3 - Medium", Priority.MEDIUM),
            source="solman",
            requester_email=webhook_data.reporter_email,
            external_id=webhook_data.incident_id
        )

        # Classify and route
        classification = await classify_ticket(
            ticket_data.title,
            ticket_data.description
        )
        
        ticket_data.category = classification.get("category", ticket_data.category)
        ticket_data.priority = Priority(classification.get("priority", ticket_data.priority.value))
        
        # Save to database first
        from app.models.ticket_models import Ticket
        db_ticket = Ticket(**ticket_data.dict())
        db.add(db_ticket)
        db.commit()
        db.refresh(db_ticket)
        
        # Now route the saved ticket
        assigned_team = routing_service.route_ticket(db, db_ticket, classification)
        if assigned_team:
            db_ticket.assigned_team_id = assigned_team.id
            db.commit()
            db.refresh(db_ticket)

        logger.info(f"Solman ticket ingested: {db_ticket.id}")
        
        return {
            "success": True,
            "ticket_id": db_ticket.id,
            "message": "Ticket ingested from SAP Solman"
        }

    except Exception as e:
        logger.error(f"Solman webhook error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/test")
async def test_webhooks():
    """Test endpoint to verify webhook configuration."""
    return {
        "glpi_endpoint": "/api/ingest/glpi",
        "solman_endpoint": "/api/ingest/solman",
        "status": "ready",
        "message": "Webhook endpoints are configured and ready"
    }
