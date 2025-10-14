#!/usr/bin/env python3
"""
Debug email sending issue
"""
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.services.email_service import email_service

async def debug_email():
    """Debug the email sending issue"""
    print("🔍 Debugging Email Service")
    print("=" * 50)

    print(f"SMTP Host: {email_service.smtp_host}")
    print(f"SMTP Port: {email_service.smtp_port}")
    print(f"SMTP User: {email_service.smtp_user}")
    print(f"SMTP Password: {'*' * len(email_service.smtp_password) if email_service.smtp_password else 'None'}")
    print(f"From Email: {email_service.from_email}")
    print(f"Enabled: {email_service.enabled}")
    print()

    # Test the send_ticket_resolution method directly
    print("📧 Testing send_ticket_resolution method...")
    try:
        result = await email_service.send_ticket_resolution(
            ticket_id="TKT-TEST-001",
            email="cleochariaofficial@gmail.com",
            title="Test Ticket - VPN Connection Issue",
            category="network",
            resolution_message="This is a test resolution message."
        )
        print(f"✅ Method returned: {result}")
    except Exception as e:
        print(f"❌ Error in send_ticket_resolution: {e}")
        import traceback
        print("\nFull traceback:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_email())