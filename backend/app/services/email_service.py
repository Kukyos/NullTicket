"""Email notification service with SMTP and IMAP support."""
import os
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_user = os.getenv('SMTP_USER', '')
        self.smtp_password = os.getenv('SMTP_PASSWORD', '')
        self.from_email = os.getenv('FROM_EMAIL', self.smtp_user)
        self.enabled = bool(self.smtp_user and self.smtp_password)

    async def send_email(
        self,
        to_addresses: List[str],
        subject: str,
        body: str,
        html_body: Optional[str] = None
    ) -> bool:
        """Send email notification."""
        if not self.enabled:
            logger.warning("Email service not configured")
            return False

        try:
            message = MIMEMultipart('alternative')
            message['From'] = self.from_email
            message['To'] = ', '.join(to_addresses)
            message['Subject'] = subject

            # Add plain text and HTML parts
            message.attach(MIMEText(body, 'plain'))
            if html_body:
                message.attach(MIMEText(html_body, 'html'))

            # Send email
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_user,
                password=self.smtp_password,
                start_tls=True,
            )
            logger.info(f"Email sent successfully to {to_addresses}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False

    async def send_ticket_created(self, ticket_id: str, email: str, title: str):
        """Send ticket creation notification."""
        subject = f"Ticket Created: {ticket_id}"
        body = f"""
Your support ticket has been created successfully.

Ticket ID: {ticket_id}
Subject: {title}

Our team will review your request and respond shortly.

Thank you,
NullTicket Support Team
"""
        html_body = f"""
<html>
<body style="font-family: Arial, sans-serif; color: #333;">
    <h2 style="color: #2563eb;">Ticket Created</h2>
    <p>Your support ticket has been created successfully.</p>
    <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Ticket ID:</strong> {ticket_id}</p>
        <p><strong>Subject:</strong> {title}</p>
    </div>
    <p>Our team will review your request and respond shortly.</p>
    <p style="color: #666; font-size: 14px;">Thank you,<br>NullTicket Support Team</p>
</body>
</html>
"""
        await self.send_email([email], subject, body, html_body)

    async def send_ticket_updated(self, ticket_id: str, email: str, status: str):
        """Send ticket update notification."""
        subject = f"Ticket Updated: {ticket_id}"
        body = f"""
Your support ticket has been updated.

Ticket ID: {ticket_id}
New Status: {status}

Thank you,
NullTicket Support Team
"""
        html_body = f"""
<html>
<body style="font-family: Arial, sans-serif; color: #333;">
    <h2 style="color: #2563eb;">Ticket Updated</h2>
    <p>Your support ticket has been updated.</p>
    <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Ticket ID:</strong> {ticket_id}</p>
        <p><strong>New Status:</strong> <span style="color: #059669;">{status}</span></p>
    </div>
    <p style="color: #666; font-size: 14px;">Thank you,<br>NullTicket Support Team</p>
</body>
</html>
"""
        await self.send_email([email], subject, body, html_body)

    async def send_sla_alert(self, ticket_id: str, team_email: str):
        """Send SLA breach alert."""
        subject = f"⚠️ SLA Alert: {ticket_id}"
        body = f"""
URGENT: SLA breach risk detected

Ticket ID: {ticket_id}

This ticket is approaching its SLA deadline. Please prioritize.

NullTicket Alert System
"""
        html_body = f"""
<html>
<body style="font-family: Arial, sans-serif; color: #333;">
    <h2 style="color: #dc2626;">⚠️ SLA Alert</h2>
    <p><strong>URGENT:</strong> SLA breach risk detected</p>
    <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
        <p><strong>Ticket ID:</strong> {ticket_id}</p>
        <p style="color: #dc2626;"><strong>Action Required:</strong> This ticket is approaching its SLA deadline.</p>
    </div>
    <p>Please prioritize this ticket immediately.</p>
    <p style="color: #666; font-size: 14px;">NullTicket Alert System</p>
</body>
</html>
"""
        await self.send_email([team_email], subject, body, html_body)


# Global instance
email_service = EmailService()
