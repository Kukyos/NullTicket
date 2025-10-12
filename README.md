# NullTicket - Unified Intelligent Ticketing System

## Overview
NullTicket is an AI-powered unified ticketing system that integrates multiple ticket sources (chatbot, email, GLPI, Solman) into a single intelligent platform with automated classification, self-service resolution, and smart routing.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│           UNIFIED TICKET INGESTION LAYER                    │
├─────────────┬──────────────┬──────────────┬─────────────────┤
│  NullChat   │    Email     │    GLPI      │    Solman       │
│  Chatbot    │ SMTP/IMAP    │     API      │      API        │
└─────────────┴──────────────┴──────────────┴─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│         AI-POWERED PROCESSING ENGINE (LLaMA 3.1)            │
├─────────────┬──────────────┬──────────────┬─────────────────┤
│ Ticket      │ Self-Service │   KB         │  Intent         │
│ Classification│ Resolution │ Suggestions  │  Detection      │
└─────────────┴──────────────┴──────────────┴─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           INTELLIGENT ROUTING SYSTEM                         │
├─────────────┬──────────────┬──────────────────────────────┤
│ Priority    │  Rule-Based  │  Historical Pattern          │
│  Scoring    │    Matrix    │     Learning                 │
└─────────────┴──────────────┴──────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              ADMIN DASHBOARD & ANALYTICS                     │
├─────────────┬──────────────┬──────────────┬─────────────────┤
│  Ticket     │  Analytics   │      KB      │   Routing       │
│ Management  │  Dashboard   │  Management  │ Configuration   │
└─────────────┴──────────────┴──────────────┴─────────────────┘
```

## Features

### 1. Unified Ticket Ingestion
- **Chatbot Integration**: Direct integration with NullChat for real-time ticket creation
- **Email Ingestion**: Automatic email parsing and ticket creation via SMTP/IMAP
- **External Systems**: API integration with GLPI, Solman, and other ticketing platforms
- **Source Tracking**: Maintains ticket origin for reporting and analytics

### 2. AI-Powered Automation
- **Automatic Classification**: LLaMA 3.1 8B categorizes tickets (Network, Hardware, Software, HR, etc.)
- **Self-Service Resolution**: RAG-based knowledge base provides instant answers
- **Intent Detection**: Understands user intent for better routing
- **Smart Suggestions**: Analyzes ticket trends to suggest new KB articles

### 3. Intelligent Routing
- **Priority Scoring**: AI analyzes urgency indicators ("critical", "down", "urgent")
- **Rule-Based Matrix**: Configurable routing rules (Category → Team)
- **Historical Learning**: Routes based on past resolution patterns
- **Load Balancing**: Distributes tickets evenly across team members

### 4. Admin Dashboard
- **Real-time Monitoring**: Live ticket status updates
- **Analytics**: Ticket volume, resolution time, satisfaction metrics
- **KB Management**: Upload documents, manage articles, view suggestions
- **Routing Config**: Visual rule builder for ticket routing

### 5. Communication & Notifications
- **Email Alerts**: Automatic notifications on ticket events
- **SMS Integration**: Critical ticket updates via SMS
- **Status Updates**: Real-time status tracking for users
- **Escalation Alerts**: Automatic escalation for SLA breaches

## Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **ORM**: SQLAlchemy
- **AI Engine**: Groq API (LLaMA 3.1 8B Instant)
- **Translation**: Google Translate API
- **Email**: imaplib, smtplib
- **Authentication**: JWT

### Frontend (Admin Panel)
- **Framework**: React 18 + Vite
- **UI Library**: Material-UI / Ant Design
- **State Management**: React Context / Zustand
- **Charts**: Recharts / Chart.js
- **Forms**: React Hook Form

### External Integrations
- **Email**: IMAP/SMTP for email ingestion
- **SMS**: Twilio / AWS SNS
- **GLPI**: REST API integration
- **Solman**: SAP API integration

## Quick Start

### Prerequisites
```powershell
# Python 3.11+
python --version

# Node.js 18+
node --version
```

### Installation

1. **Clone and Setup Backend**
```powershell
cd ticketing-system\backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. **Configure Environment**
```powershell
# Create .env file in backend directory
cp .env.example .env

# Edit .env with your API keys:
# GROQ_API_KEY=your_groq_key
# EMAIL_HOST=imap.gmail.com
# EMAIL_USER=support@company.com
# EMAIL_PASS=your_password
# SMS_API_KEY=your_twilio_key
```

3. **Initialize Database**
```powershell
python -m app.database
```

4. **Start Backend Server**
```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

5. **Setup Admin Panel**
```powershell
cd ..\admin-panel
npm install
npm run dev
```

### URLs
- Backend API: http://127.0.0.1:8000/docs
- Admin Panel: http://localhost:5173
- NullChat Widget: http://localhost:5174 (separate deployment)

## Database Schema

### Core Tables

**tickets**
```sql
id, title, description, source (chat/email/glpi/solman), 
category, priority, status, assigned_team, assigned_agent,
created_by, created_at, updated_at, resolved_at, resolution,
sla_deadline, escalation_level, satisfaction_rating
```

**ticket_sources**
```sql
id, source_name (Chat/Email/GLPI/Solman), 
is_active, config_json, last_sync
```

**teams**
```sql
id, name, description, email, max_capacity, 
specialization, is_active
```

**routing_rules**
```sql
id, category, keywords, priority, assigned_team, 
confidence_threshold, is_active, order_priority
```

**knowledge_base_suggestions**
```sql
id, suggested_title, ticket_pattern, frequency_count,
sample_tickets, suggested_by (system/admin), status, 
created_at
```

**ticket_history**
```sql
id, ticket_id, action, old_value, new_value, 
changed_by, timestamp
```

## API Endpoints

### Ticket Management
```
POST   /api/tickets              # Create ticket
GET    /api/tickets              # List tickets (paginated)
GET    /api/tickets/{id}         # Get ticket details
PUT    /api/tickets/{id}         # Update ticket
DELETE /api/tickets/{id}         # Delete ticket
POST   /api/tickets/{id}/assign  # Assign ticket to team/agent
POST   /api/tickets/{id}/resolve # Resolve ticket
POST   /api/tickets/{id}/reopen  # Reopen ticket
```

### Ingestion
```
POST   /api/ingest/chatbot       # From NullChat
POST   /api/ingest/email         # Email webhook
POST   /api/ingest/glpi          # GLPI integration
POST   /api/ingest/solman        # Solman integration
GET    /api/ingest/sync          # Manual sync trigger
```

### Analytics
```
GET    /api/analytics/dashboard  # Dashboard metrics
GET    /api/analytics/tickets    # Ticket statistics
GET    /api/analytics/teams      # Team performance
GET    /api/analytics/satisfaction # Satisfaction scores
GET    /api/analytics/sla        # SLA compliance
```

### Routing & KB
```
GET    /api/routing/rules        # Get routing rules
POST   /api/routing/rules        # Create rule
PUT    /api/routing/rules/{id}   # Update rule
POST   /api/routing/test         # Test routing logic
GET    /api/kb/suggestions       # KB suggestions
POST   /api/kb/suggestions/{id}/approve # Approve suggestion
```

## Configuration

### Email Ingestion Config
```json
{
  "email_host": "imap.gmail.com",
  "email_port": 993,
  "email_user": "support@company.com",
  "email_password": "***",
  "check_interval_seconds": 60,
  "auto_categories": ["support", "helpdesk", "tech"]
}
```

### Routing Rules Example
```json
{
  "category": "Network Issue",
  "keywords": ["vpn", "wifi", "connection", "network"],
  "priority_high_keywords": ["down", "critical", "urgent"],
  "assigned_team": "Network Team",
  "confidence_threshold": 0.7
}
```

## Integration Examples

### NullChat Integration
```python
# In NullChat's main.py, add:
@app.post("/forward-to-ticket")
async def forward_to_ticket(req: ForwardRequest, db: Session = Depends(get_db)):
    # Create ticket in NullTicket system
    ticket_data = {
        "source": "chat",
        "description": req.message,
        "session_id": req.session_id,
        "language": req.language
    }
    response = requests.post(
        "http://localhost:8000/api/ingest/chatbot",
        json=ticket_data
    )
    return response.json()
```

### Email Ingestion (Background Task)
```python
# Runs every 60 seconds
async def poll_emails():
    mail = imaplib.IMAP4_SSL('imap.gmail.com')
    mail.login(EMAIL_USER, EMAIL_PASS)
    mail.select('inbox')
    
    _, messages = mail.search(None, 'UNSEEN')
    for num in messages[0].split():
        _, msg = mail.fetch(num, '(RFC822)')
        email_body = msg[0][1]
        # Parse and create ticket
        create_ticket_from_email(email_body)
```

## Deployment

### Production Setup
```powershell
# Backend (Docker)
docker build -t nullticket-backend .
docker run -p 8000:8000 nullticket-backend

# Admin Panel (Vercel)
cd admin-panel
vercel deploy

# Database Migration
alembic upgrade head
```

### Environment Variables
```
# Required
GROQ_API_KEY=
DATABASE_URL=
JWT_SECRET=

# Email
EMAIL_HOST=
EMAIL_USER=
EMAIL_PASS=

# SMS (optional)
TWILIO_SID=
TWILIO_TOKEN=

# External Systems (optional)
GLPI_API_URL=
GLPI_API_KEY=
SOLMAN_API_URL=
SOLMAN_API_KEY=
```

## Monitoring & Logs

### Health Checks
```
GET /health              # System health
GET /health/email        # Email ingestion status
GET /health/ai           # AI service status
GET /health/database     # Database connection
```

### Logging
- Application logs: `logs/app.log`
- Email ingestion: `logs/email_ingestion.log`
- AI processing: `logs/ai_processing.log`
- Errors: `logs/error.log`

## License
MIT License

## Contributors
- Your Team Name
- SIH 2025 Hackathon

## Support
For issues and questions:
- Email: support@nullticket.com
- GitHub: https://github.com/yourorg/nullticket
- Docs: https://docs.nullticket.com
