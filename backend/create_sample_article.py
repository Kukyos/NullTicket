from app.database import get_db
from app.models.ticket_models import KnowledgeArticle, TicketCategory
from datetime import datetime

db = next(get_db())

# Create a sample article
article = KnowledgeArticle(
    title='Password Reset Guide',
    content="""# Password Reset Instructions

## For Domain Passwords
1. Visit the POWERGRID Self-Service Portal: https://selfservice.powergrid.in
2. Click "Forgot Password" or "Reset Password"
3. Enter your employee ID and registered email
4. Follow the verification process
5. Create a new strong password (minimum 8 characters, include numbers and symbols)

## For Application-Specific Passwords
- **SAP/Solman**: Contact your system administrator
- **VPN**: Use domain password, reset via self-service portal
- **Email**: Same as domain password

## Important Notes
- Passwords expire every 90 days
- Do not share passwords with colleagues
- Use different passwords for different systems when possible
- Contact IT Security if you suspect unauthorized access

## Troubleshooting
- **Can't access self-service portal**: Check internet connection
- **Email not received**: Check spam/junk folder
- **Account locked**: Wait 30 minutes or contact IT support

If you continue having issues, please create a support ticket.""",
    summary='Complete guide for resetting passwords across POWERGRID systems including domain, email, VPN, and application passwords.',
    category=TicketCategory.PASSWORD_RESET,
    tags=['password', 'reset', 'login', 'security', 'domain'],
    keywords=['password', 'reset', 'forgot', 'login', 'security', 'domain', 'vpn', 'email'],
    is_active=True
)

db.add(article)
db.commit()
print('Sample article created with ID:', article.id)