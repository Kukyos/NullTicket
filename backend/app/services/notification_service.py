"""
Notification service for handling alerts and automated notifications
"""
import asyncio
import logging
from datetime import datetime, timedelta
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import and_

from ..database import get_db
from ..models.ticket_models import Ticket, TicketStatus, Team
from ..services.email_service import email_service
from ..services.sms_service import sms_service

logger = logging.getLogger(__name__)

class NotificationService:
    """
    Handles automated notifications for tickets
    """

    def __init__(self):
        self.running = False

    async def start_background_tasks(self):
        """Start background notification tasks"""
        if self.running:
            return

        self.running = True
        logger.info("Starting notification background tasks")

        # Start SLA monitoring task
        asyncio.create_task(self._monitor_sla_alerts())

        # Start daily digest task
        asyncio.create_task(self._send_daily_digests())

    async def _monitor_sla_alerts(self):
        """Monitor tickets approaching SLA deadline"""
        while self.running:
            try:
                db = next(get_db())
                await self._check_sla_alerts(db)
                db.close()
            except Exception as e:
                logger.error(f"Error in SLA monitoring: {e}")

            # Check every 15 minutes
            await asyncio.sleep(900)

    async def _check_sla_alerts(self, db: Session):
        """Check for tickets approaching SLA deadline"""
        # Get tickets within 1 hour of SLA deadline
        alert_time = datetime.utcnow() + timedelta(hours=1)

        approaching_tickets = db.query(Ticket).filter(
            and_(
                Ticket.sla_deadline <= alert_time,
                Ticket.sla_deadline > datetime.utcnow(),
                Ticket.status.not_in([TicketStatus.RESOLVED, TicketStatus.CLOSED])
            )
        ).all()

        for ticket in approaching_tickets:
            await self._send_sla_alert(ticket)

        # Get breached tickets
        breached_tickets = db.query(Ticket).filter(
            and_(
                Ticket.sla_deadline <= datetime.utcnow(),
                Ticket.status.not_in([TicketStatus.RESOLVED, TicketStatus.CLOSED])
            )
        ).all()

        for ticket in breached_tickets:
            await self._send_sla_breach_alert(ticket)

    async def _send_sla_alert(self, ticket: Ticket):
        """Send SLA approaching alert"""
        # Get team email
        db_session = next(get_db())
        team = db_session.query(Team).filter(Team.id == ticket.assigned_team_id).first()
        db_session.close()
        
        if not team:
            return

        # Send email alert
        await email_service.send_sla_alert(ticket.ticket_number, team.email or "support@nullticket.com")

        # Send SMS if critical
        if ticket.priority.value == "critical" and ticket.requester_phone:
            await sms_service.send_sla_breach_alert(ticket.requester_phone, ticket.ticket_number)

        logger.info(f"SLA alert sent for ticket {ticket.ticket_number}")

    async def _send_sla_breach_alert(self, ticket: Ticket):
        """Send SLA breach alert"""
        # Get team email
        db_session = next(get_db())
        team = db_session.query(Team).filter(Team.id == ticket.assigned_team_id).first()
        db_session.close()
        
        if not team:
            return

        # Send urgent email
        subject = f"🚨 SLA BREACHED: {ticket.ticket_number}"
        body = f"""
CRITICAL: SLA has been breached for ticket {ticket.ticket_number}

Title: {ticket.title}
Priority: {ticket.priority.value}
Requester: {ticket.requester_email}

Immediate action required!
"""
        await email_service.send_email([team.email or "support@nullticket.com"], subject, body)

        # Send SMS alert
        if ticket.requester_phone:
            await sms_service.send_critical_alert(ticket.requester_phone, ticket.ticket_number)

        logger.warning(f"SLA breach alert sent for ticket {ticket.ticket_number}")

    async def _send_daily_digests(self):
        """Send daily team digests"""
        while self.running:
            # Wait until next day at 9 AM
            now = datetime.utcnow()
            next_run = now.replace(hour=9, minute=0, second=0, microsecond=0)
            if now >= next_run:
                next_run += timedelta(days=1)

            seconds_until_next = (next_run - now).total_seconds()
            await asyncio.sleep(seconds_until_next)

            try:
                db = next(get_db())
                await self._send_team_digests(db)
                db.close()
            except Exception as e:
                logger.error(f"Error sending daily digests: {e}")

    async def _send_team_digests(self, db: Session):
        """Send daily digest emails to teams"""
        teams = db.query(Team).all()

        for team in teams:
            # Get team's tickets from last 24 hours
            yesterday = datetime.utcnow() - timedelta(days=1)

            new_tickets = db.query(Ticket).filter(
                and_(
                    Ticket.assigned_team_id == team.id,
                    Ticket.created_at >= yesterday
                )
            ).count()

            resolved_tickets = db.query(Ticket).filter(
                and_(
                    Ticket.assigned_team_id == team.id,
                    Ticket.status.in_([TicketStatus.RESOLVED, TicketStatus.CLOSED]),
                    Ticket.resolved_at >= yesterday
                )
            ).count()

            pending_tickets = db.query(Ticket).filter(
                and_(
                    Ticket.assigned_team_id == team.id,
                    Ticket.status.not_in([TicketStatus.RESOLVED, TicketStatus.CLOSED])
                )
            ).count()

            if new_tickets > 0 or resolved_tickets > 0:
                subject = f"Daily Digest - {team.name}"
                body = f"""
Daily Team Digest for {team.name}

📊 Summary (Last 24 hours):
• New tickets: {new_tickets}
• Resolved tickets: {resolved_tickets}
• Pending tickets: {pending_tickets}

Keep up the great work!
NullTicket System
"""
                if team.email:
                    await email_service.send_email([team.email], subject, body)

    async def notify_ticket_assignment(self, ticket: Ticket, team_name: str):
        """Send notification when ticket is assigned to team"""
        subject = f"New Ticket Assigned: {ticket.ticket_number}"
        body = f"""
A new ticket has been assigned to your team.

Ticket: {ticket.ticket_number}
Title: {ticket.title}
Priority: {ticket.priority.value}
Category: {ticket.category.value}
Requester: {ticket.requester_email}

Please review and take appropriate action.
"""
        # Get team email
        db = next(get_db())
        team = db.query(Team).filter(Team.id == ticket.assigned_team_id).first()
        db.close()

        if team and team.email:
            await email_service.send_email([team.email], subject, body)

    async def notify_ticket_escalation(self, ticket: Ticket, reason: str):
        """Send escalation notification"""
        subject = f"🚨 TICKET ESCALATED: {ticket.ticket_number}"
        body = f"""
TICKET ESCALATION ALERT

Ticket: {ticket.ticket_number}
Title: {ticket.title}
Reason: {reason}
Priority: {ticket.priority.value}

Immediate attention required!
"""
        # Get team email
        db = next(get_db())
        team = db.query(Team).filter(Team.id == ticket.assigned_team_id).first()
        db.close()

        if team and team.email:
            await email_service.send_email([team.email], subject, body)


# Global instance
notification_service = NotificationService()