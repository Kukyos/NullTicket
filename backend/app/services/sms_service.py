"""SMS notification service using Twilio."""
import os
from twilio.rest import Client
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class SMSService:
    def __init__(self):
        self.account_sid = os.getenv('TWILIO_ACCOUNT_SID', '')
        self.auth_token = os.getenv('TWILIO_AUTH_TOKEN', '')
        self.from_number = os.getenv('TWILIO_PHONE_NUMBER', '')
        self.enabled = bool(self.account_sid and self.auth_token and self.from_number)
        
        if self.enabled:
            self.client = Client(self.account_sid, self.auth_token)
        else:
            self.client = None

    async def send_sms(self, to_number: str, message: str) -> bool:
        """Send SMS notification."""
        if not self.enabled:
            logger.warning("SMS service not configured")
            return False

        try:
            self.client.messages.create(
                body=message,
                from_=self.from_number,
                to=to_number
            )
            logger.info(f"SMS sent successfully to {to_number}")
            return True
        except Exception as e:
            logger.error(f"Failed to send SMS: {e}")
            return False

    async def send_critical_alert(self, to_number: str, ticket_id: str):
        """Send critical ticket alert via SMS."""
        message = f"🚨 CRITICAL TICKET: {ticket_id} requires immediate attention. Login to NullTicket for details."
        await self.send_sms(to_number, message)

    async def send_sla_breach_alert(self, to_number: str, ticket_id: str):
        """Send SLA breach alert via SMS."""
        message = f"⚠️ SLA ALERT: {ticket_id} is approaching deadline. Please review immediately."
        await self.send_sms(to_number, message)


# Global instance
sms_service = SMSService()
