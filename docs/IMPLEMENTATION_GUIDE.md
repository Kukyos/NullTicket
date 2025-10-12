# NullTicket System - Implementation Guide & Architecture

## 🎯 Project Understanding Summary

### What We Have: NullChat Chatbot
I've thoroughly analyzed the **NullChat** project. Here's what exists:

#### **Current System Components:**

1. **AI-Powered Chatbot**
   - FastAPI backend with Groq (LLaMA 3.1 8B Instant)
   - Multilingual support (8+ languages with Google Translate)
   - React chat widget with voice mode
   - SQLite database with conversation tracking
   - Feedback system (thumbs up/down)
   - Admin forwarding capability

2. **Key Features:**
   - Session management
   - Intent detection and response generation
   - Romanized Hindi support for better translation
   - College information knowledge base
   - Conversation history with feedback tracking

3. **Database Schema:**
   - `conversations`: User chats with AI responses
   - `documents`: PDF knowledge base (planned)
   - `document_chunks`: RAG implementation (planned)
   - `admin_overrides`: Custom Q&A patterns

---

## 🚀 What We're Building: NullTicket

A **unified intelligent ticketing system** that integrates:
- The existing NullChat chatbot
- Email ticketing (SMTP/IMAP)
- External systems (GLPI, Solman)
- AI-powered automation
- Smart routing
- Admin dashboard

---

## 📐 System Architecture

### **1. Unified Ticket Ingestion Layer**

```
┌─────────────────────────────────────────────────────────────┐
│                 TICKET SOURCES                               │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  NullChat    │    Email     │    GLPI      │    Solman      │
│  Widget      │ Ingestion    │  API Sync    │   API Sync     │
└──────────────┴──────────────┴──────────────┴────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│          TICKET INGESTION API (FastAPI)                      │
│  POST /api/ingest/chatbot   - From NullChat                 │
│  POST /api/ingest/email     - Email parser                  │
│  POST /api/ingest/glpi      - GLPI webhook                  │
│  POST /api/ingest/solman    - Solman webhook                │
└─────────────────────────────────────────────────────────────┘
```

**Implementation:**
- ✅ Database models created (`Ticket`, `TicketSource`, `ExternalSystemConfig`)
- 🔄 API endpoints (next step)
- 📧 Email polling service (background task)
- 🔌 External API integrations

---

### **2. AI-Powered Processing Engine**

```
┌─────────────────────────────────────────────────────────────┐
│              AI PROCESSING (LLaMA 3.1 8B)                    │
├──────────────┬──────────────┬──────────────┬────────────────┤
│ Classification│ Self-Service│      KB      │    Intent      │
│  (Category +  │  Resolution │  Suggestions │  Extraction    │
│   Priority)   │   via RAG   │   (Trends)   │                │
└──────────────┴──────────────┴──────────────┴────────────────┘
```

**Implementation:**
- ✅ Classification Service (`classification_service.py`)
  - Categorizes tickets (network, hardware, software, etc.)
  - Assigns priority (critical, urgent, high, medium, low)
  - Extracts keywords and suggests teams
  - Confidence scoring
  - Fallback keyword-based classification

**How It Works:**
```python
classification = classification_service.classify_ticket(
    title="VPN not connecting",
    description="I can't connect to VPN from home. Getting error 403",
    source="email"
)

# Returns:
{
  "category": "vpn",
  "priority": "high",
  "confidence": 0.92,
  "reasoning": "VPN connection issue affecting remote work",
  "keywords": ["vpn", "connection", "error", "remote"],
  "suggested_team": "Network Team",
  "requires_immediate_attention": true,
  "self_service_possible": false
}
```

---

### **3. Intelligent Routing System**

```
┌─────────────────────────────────────────────────────────────┐
│           MULTI-STRATEGY ROUTING ENGINE                      │
├──────────────┬──────────────┬──────────────┬────────────────┤
│ Rule-Based   │  Historical  │ Load Balance │   Priority     │
│   Matching   │   Patterns   │   (Capacity) │    Scoring     │
└──────────────┴──────────────┴──────────────┴────────────────┘
```

**Implementation:**
- ✅ Routing Service (`routing_service.py`)
  - **Strategy 1:** Rule-based matching (category + keywords → team)
  - **Strategy 2:** Category-based routing (team specialization)
  - **Strategy 3:** Historical pattern learning (past successful resolutions)
  - **Strategy 4:** Load balancing (distribute evenly)
  - **Fallback:** Default team

**Routing Logic:**
1. Check routing rules (exact match on category + keywords)
2. Check team specializations
3. Analyze historical data (which team resolved similar tickets best)
4. Balance load across teams
5. Fallback to "General Support"

**Priority Scoring:**
- Analyzes urgency keywords ("critical", "down", "can't work")
- Considers scope ("all users" = higher priority)
- AI classification input
- Outputs score 1-10 for SLA calculation

---

### **4. Database Schema**

#### **Core Tables:**

**tickets**
```sql
- id, ticket_number (TKT-2024-00001)
- title, description, source (chat/email/glpi/solman)
- category (network/hardware/software/...)
- priority (low/medium/high/urgent/critical)
- status (new/open/in_progress/resolved/closed)
- assigned_team_id, assigned_agent_id
- created_by_user_id, requester_name, requester_email
- created_at, resolved_at, closed_at
- sla_deadline, sla_breached
- ai_classification_confidence, auto_resolved
- resolution, resolution_time_minutes
- satisfaction_rating, feedback_comment
- escalation_level, tags, custom_fields
```

**teams**
```sql
- id, name, description, email
- max_capacity, current_load
- specialization (["network", "vpn", "firewall"])
- is_active
```

**routing_rules**
```sql
- id, name, description
- category, keywords, priority_min, source
- assigned_team_id
- confidence_threshold, is_active, order_priority
```

**knowledge_articles**
```sql
- id, title, content, summary
- category, tags, keywords
- view_count, helpful_count, resolution_count
- created_by_id, language
```

**kb_suggestions**
```sql
- id, suggested_title, ticket_pattern
- frequency_count, sample_ticket_ids
- category, keywords, suggested_content
- status (pending/approved/rejected/created)
```

**ticket_history**
```sql
- Audit trail of all ticket changes
- Who changed what, when
```

**external_systems**
```sql
- Configuration for GLPI, Solman integrations
- API credentials, sync intervals, field mappings
```

---

## 🔌 Integration Points

### **1. NullChat Integration**

**Scenario:** User asks chatbot a question, can't be answered → Create ticket

```javascript
// In NullChat frontend (App.jsx)
const handleForwardToTicket = async (conversationId) => {
  const response = await fetch(`http://localhost:8000/api/ingest/chatbot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: 'chat',
      conversation_id: conversationId,
      session_id: sessionId,
      requester_email: userEmail || 'anonymous@system.com'
    })
  });
  
  if (response.ok) {
    const ticket = await response.json();
    showMessage(`Ticket #${ticket.ticket_number} created. Support team will contact you soon.`);
  }
};
```

**Backend Endpoint:**
```python
@app.post("/api/ingest/chatbot")
async def ingest_from_chatbot(request: ChatbotTicketRequest, db: Session = Depends(get_db)):
    # 1. Get conversation from NullChat database
    conversation = db.query(Conversation).filter(
        Conversation.id == request.conversation_id
    ).first()
    
    # 2. Create ticket
    ticket = Ticket(
        title=conversation.user_message[:100],
        description=f"User Query: {conversation.user_message}\n\nBot Response: {conversation.bot_response}",
        source=TicketSource.CHAT,
        source_reference=str(conversation.id),
        requester_email=request.requester_email
    )
    
    # 3. Classify with AI
    classification = classification_service.classify_ticket(
        title=ticket.title,
        description=ticket.description,
        source="chat"
    )
    
    # 4. Assign category and priority
    ticket.category = classification['category']
    ticket.priority = classification['priority']
    ticket.ai_classification_confidence = classification['confidence']
    
    # 5. Route to team
    team = routing_service.route_ticket(db, ticket, classification)
    if team:
        ticket.assigned_team_id = team.id
        routing_service.update_team_load(db, team.id, increment=1)
    
    # 6. Set SLA deadline
    from datetime import datetime, timedelta
    sla_minutes = settings.get_sla_deadline_minutes(ticket.priority.value)
    ticket.sla_deadline = datetime.utcnow() + timedelta(minutes=sla_minutes)
    
    # 7. Save to database
    db.add(ticket)
    db.commit()
    
    # 8. Send notifications
    await notification_service.send_ticket_created_notification(ticket)
    
    return {"ticket_number": ticket.ticket_number, "status": "created"}
```

---

### **2. Email Integration**

**Background Task (Celery):**
```python
@celery_app.task
def poll_emails():
    """Poll email inbox every 60 seconds"""
    import imaplib
    import email
    from email.header import decode_header
    
    mail = imaplib.IMAP4_SSL(settings.EMAIL_HOST)
    mail.login(settings.EMAIL_USER, settings.EMAIL_PASSWORD)
    mail.select('inbox')
    
    # Search for unread emails
    status, messages = mail.search(None, 'UNSEEN')
    
    for num in messages[0].split():
        # Fetch email
        status, msg_data = mail.fetch(num, '(RFC822)')
        
        for response_part in msg_data:
            if isinstance(response_part, tuple):
                msg = email.message_from_bytes(response_part[1])
                
                # Extract subject and body
                subject = decode_header(msg["Subject"])[0][0]
                from_email = msg.get("From")
                
                # Get body
                body = ""
                if msg.is_multipart():
                    for part in msg.walk():
                        if part.get_content_type() == "text/plain":
                            body = part.get_payload(decode=True).decode()
                            break
                else:
                    body = msg.get_payload(decode=True).decode()
                
                # Create ticket
                create_ticket_from_email(
                    subject=subject,
                    body=body,
                    from_email=from_email
                )
                
                # Mark as read
                mail.store(num, '+FLAGS', '\\Seen')
    
    mail.close()
    mail.logout()
```

---

### **3. GLPI Integration**

```python
async def sync_glpi_tickets():
    """Sync tickets from GLPI"""
    if not settings.GLPI_ENABLED:
        return
    
    headers = {
        "Authorization": f"user_token {settings.GLPI_API_KEY}",
        "App-Token": settings.GLPI_APP_TOKEN
    }
    
    # Get new tickets since last sync
    response = requests.get(
        f"{settings.GLPI_API_URL}/Ticket",
        headers=headers,
        params={"is_deleted": 0, "status": "new"}
    )
    
    if response.status_code == 200:
        glpi_tickets = response.json()
        
        for glpi_ticket in glpi_tickets:
            # Check if already synced
            exists = db.query(TicketSync).filter(
                TicketSync.external_ticket_id == str(glpi_ticket['id']),
                TicketSync.external_system_id == glpi_system.id
            ).first()
            
            if not exists:
                # Create ticket in our system
                ticket = Ticket(
                    title=glpi_ticket['name'],
                    description=glpi_ticket['content'],
                    source=TicketSource.GLPI,
                    source_reference=str(glpi_ticket['id']),
                    requester_email=glpi_ticket.get('user_email', 'unknown@glpi.com')
                )
                
                # Classify and route
                # ... (same logic as chatbot integration)
                
                # Create sync record
                sync = TicketSync(
                    ticket_id=ticket.id,
                    external_system_id=glpi_system.id,
                    external_ticket_id=str(glpi_ticket['id'])
                )
                db.add(sync)
                db.commit()
```

---

## 📊 Admin Dashboard Features

### **Dashboard Overview**
- Total tickets (today/week/month)
- Open vs Resolved tickets
- Average resolution time
- Satisfaction ratings
- SLA compliance %
- Top categories pie chart
- Team workload bar chart

### **Ticket Management**
- List all tickets (filterable, searchable)
- View ticket details
- Assign to team/agent
- Add comments
- Change status
- Resolve/Close tickets
- View history timeline

### **Analytics**
- Ticket volume trends
- Category distribution
- Source breakdown (chat/email/GLPI/Solman)
- Team performance metrics
- Resolution time averages
- Satisfaction trends

### **Routing Configuration**
- Visual rule builder
- Drag-and-drop priority ordering
- Test routing logic
- View routing suggestions

### **Knowledge Base Management**
- Upload documents
- Create articles
- Review AI suggestions
- View article effectiveness

---

## 🚦 Next Steps - Implementation Checklist

### **Phase 1: Core Backend (Current)**
- [x] Database models
- [x] Classification service
- [x] Routing service
- [ ] API endpoints for ticket CRUD
- [ ] Ingestion endpoints
- [ ] Authentication & authorization

### **Phase 2: Integrations**
- [ ] Email polling service
- [ ] GLPI API integration
- [ ] Solman API integration
- [ ] NullChat integration
- [ ] Notification service (email/SMS)

### **Phase 3: Admin Dashboard**
- [ ] React admin panel setup
- [ ] Ticket list & details pages
- [ ] Analytics dashboard
- [ ] Routing configuration UI
- [ ] KB management UI

### **Phase 4: Advanced Features**
- [ ] Knowledge base suggestions (AI)
- [ ] Self-service resolution
- [ ] Escalation automation
- [ ] SLA monitoring & alerts
- [ ] Historical pattern analysis

### **Phase 5: Deployment**
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Production database (PostgreSQL)
- [ ] Monitoring & logging
- [ ] Documentation

---

## 💻 Development Commands

### **Setup**
```powershell
# Backend
cd ticketing-system\backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Initialize database
python -c "from app.database import init_db; init_db()"

# Run server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### **Admin Panel**
```powershell
cd ticketing-system\admin-panel
npm install
npm run dev
```

---

## 🎓 Key Concepts Explained

### **1. Why Unified Ingestion?**
Instead of managing separate systems (email, GLPI, chatbot), everything flows into ONE central ticket database. Benefits:
- Single source of truth
- Consistent reporting
- Unified user experience
- Easier automation

### **2. How Does AI Classification Work?**
- LLaMA 3.1 8B reads ticket title + description
- Trained to recognize patterns (keywords, context, urgency)
- Returns structured JSON with category, priority, confidence
- Falls back to keyword matching if AI fails
- Improves over time with feedback

### **3. What is Smart Routing?**
Multi-layered approach:
1. **Rules**: If category=network AND keywords contain "vpn" → Network Team
2. **History**: Network Team resolved 50 VPN tickets with 4.5★ rating → Route there again
3. **Load**: Network Team at 80% capacity → Route to Backup Team
4. **Default**: No match → General Support

### **4. Self-Service Resolution**
When ticket is created:
1. Search knowledge base for similar issues
2. If high-confidence match found → Provide instant answer
3. Auto-close ticket OR ask user "Did this help?"
4. If not helpful → Route to human agent

### **5. Knowledge Base Suggestions**
System analyzes tickets:
- "Password reset" asked 50 times this month
- No KB article exists
- Auto-generates suggestion: "Create article: How to Reset Password"
- Admin reviews and approves
- Article added to KB for self-service

---

## 📚 Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **SQLAlchemy**: https://docs.sqlalchemy.org
- **Groq AI**: https://console.groq.com
- **Material-UI**: https://mui.com
- **Celery**: https://docs.celeryq.dev

---

## 🤝 Support

For questions during development:
1. Check this documentation
2. Review existing NullChat code
3. Test API endpoints in Swagger (http://localhost:8000/docs)
4. Check logs in `logs/` directory

**Remember**: This system integrates with NullChat, doesn't replace it. The chatbot continues to work independently, but now unsolvable queries become tracked tickets!
