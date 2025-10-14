#!/usr/bin/env python3
"""
Test script for Gmail SMTP email service
Run this to verify email notifications work
"""
import asyncio
import os
from dotenv import load_dotenv
import aiosmtplib
from email.mime.text import MIMEText

# Load environment variables
load_dotenv()

from app.services.email_service import email_service

async def test_email_service():
    """Test the email service with a simple notification"""
    print("🧪 Testing Gmail SMTP Email Service")
    print("=" * 50)

    # Check configuration
    print(f"SMTP Host: {email_service.smtp_host}")
    print(f"SMTP Port: {email_service.smtp_port}")
    print(f"SMTP User: {email_service.smtp_user}")
    print(f"Email Service Enabled: {email_service.enabled}")
    print()

    if not email_service.enabled:
        print("❌ Email service is not enabled!")
        print("Please set SMTP_USER and SMTP_PASSWORD environment variables")
        return

    # Test basic SMTP connection first
    print("🔌 Testing SMTP connection...")
    try:
        # Create a simple test message
        test_message = MIMEText("Test connection")
        test_message['From'] = email_service.smtp_user
        test_message['To'] = email_service.smtp_user
        test_message['Subject'] = "SMTP Test"

        # Try to send a test message to self
        await aiosmtplib.send(
            test_message,
            hostname=email_service.smtp_host,
            port=email_service.smtp_port,
            username=email_service.smtp_user,
            password=email_service.smtp_password,
            use_tls=True,
        )
        print("✅ SMTP connection and authentication successful!")
    except Exception as e:
        print(f"❌ SMTP connection failed: {e}")
        print("\n🔧 Troubleshooting steps:")
        print("1. Verify your Gmail App Password is correct")
        print("2. Enable 2-Factor Authentication on your Gmail account")
        print("3. Generate a new App Password from Google Account settings")
        print("4. Make sure the App Password has no spaces")
        print("5. Check if Gmail has security restrictions on your account")
        print("6. Try regenerating the App Password")
        return

    # Test email
    test_email = input("Enter test email address: ").strip()
    if not test_email:
        print("❌ No email address provided")
        return

    print(f"📧 Sending test email to: {test_email}")

    try:
        success = await email_service.send_ticket_resolution(
            ticket_id="TKT-TEST-001",
            email=test_email,
            title="Test Ticket - VPN Connection Issue",
            category="network",
            resolution_message="This is a test resolution message.\n\nThe VPN connection issue has been resolved by:\n1. Resetting your VPN credentials\n2. Updating the VPN client software\n3. Verifying network connectivity\n\nPlease try connecting again. If you still experience issues, please create a new ticket."
        )

        if success:
            print("✅ Test email sent successfully!")
            print("📬 Check your inbox for the POWERGRID ticket resolution email")
        else:
            print("❌ Failed to send test email")
            print("Check your SMTP credentials and Gmail app password")

    except Exception as e:
        print(f"❌ Error sending email: {e}")
        print("Make sure your Gmail app password is correct")
        import traceback
        print("\nFull traceback:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_email_service())