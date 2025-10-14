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
        self.smtp_port = int(os.getenv('SMTP_PORT', '465'))  # Changed to 465 for SSL
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
                use_tls=True,  # Changed from start_tls to use_tls for SSL
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

    async def send_ticket_resolution(self, ticket_id: str, email: str, title: str, category: str, resolution_message: str):
        """Send ticket resolution notification."""
        subject = f"✅ Ticket Resolved: {ticket_id}"
        body = f"""
Your ticket has been resolved!

Ticket Number: {ticket_id}
Title: {title}
Category: {category}

Resolution Details:
{resolution_message}

If you have any further questions or need additional assistance, please don't hesitate to create a new ticket.

Thank you for using POWERGRID Helpdesk!
"""

        html_body = f"""
<html>
<body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; background: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">🎯 POWERGRID</h1>
            <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 14px;">Smart Helpdesk System</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
                <h2 style="color: #059669; margin: 0; font-size: 24px; font-weight: bold;">Ticket Resolved</h2>
                <p style="color: #6b7280; margin: 10px 0 0 0;">Your support request has been successfully resolved</p>
            </div>

            <!-- Ticket Details -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Ticket Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-weight: 500; width: 120px;">Ticket ID:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">{ticket_id}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Title:</td>
                        <td style="padding: 8px 0; color: #1f2937;">{title}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Category:</td>
                        <td style="padding: 8px 0; color: #1f2937;">{category.replace('_', ' ').title()}</td>
                    </tr>
                </table>
            </div>

            <!-- Resolution Message -->
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #065f46; font-size: 18px;">📋 Resolution Details</h3>
                <div style="color: #065f46; line-height: 1.6; white-space: pre-line;">
                    {resolution_message}
                </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; margin: 0; font-size: 14px;">
                    If you have any further questions or need additional assistance,<br>
                    please don't hesitate to create a new ticket through our helpdesk portal.
                </p>
                <p style="color: #9ca3af; margin: 15px 0 0 0; font-size: 12px;">
                    Thank you for using POWERGRID Helpdesk System<br>
                    <strong>India's Largest Power Transmission Company</strong>
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">
                This is an automated message from POWERGRID Helpdesk System.<br>
                Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
"""
        await self.send_email([email], subject, body, html_body)


# Global instance
email_service = EmailService()
