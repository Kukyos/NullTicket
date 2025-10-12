# NullTicket - Quick Start Guide

## 🚀 5-Minute Setup

### Prerequisites
- Python 3.11 or higher
- Node.js 18+ (for admin panel)
- Git

### Step 1: Setup Backend

```powershell
# Navigate to backend directory
cd ticketing-system\backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create .env file from template
cp .env.example .env
```

### Step 2: Configure Environment

Edit `.env` file with your details:

**Minimum Required Configuration:**
```env
# Get free API key from https://console.groq.com
GROQ_API_KEY=gsk_your_actual_groq_api_key_here

# Database (SQLite for development)
DATABASE_URL=sqlite:///./data/tickets.db

# JWT Secret (generate random string)
JWT_SECRET=your-super-secret-jwt-key-12345
```

**Optional Email Integration:**
```env
EMAIL_ENABLED=True
EMAIL_HOST=imap.gmail.com
EMAIL_USER=your-support@gmail.com
EMAIL_PASSWORD=your-app-specific-password

SMTP_HOST=smtp.gmail.com
SMTP_USER=your-support@gmail.com
SMTP_PASSWORD=your-app-specific-password
```

### Step 3: Initialize Database

```powershell
# Create data directory
mkdir data

# Initialize database
python -c "from app.database import init_db; init_db()"
```

### Step 4: Start Backend Server

```powershell
# Start development server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Server will start at: **http://127.0.0.1:8000**

Visit http://127.0.0.1:8000/docs for API documentation!

### Step 5: Test the System

#### Option A: Web Interface
Open browser: http://127.0.0.1:8000

#### Option B: Create Test Ticket via API
```powershell
# Create a test ticket
$body = @{
    title = "VPN connection not working"
    description = "I can't connect to VPN from home. Getting error 403"
    requester_email = "user@company.com"
    requester_name = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/tickets/" -Method POST -ContentType 'application/json' -Body $body
```

#### Option C: Test Chatbot Integration
```powershell
# Create ticket from chatbot
$chatbotTicket = @{
    conversation_id = 1
    session_id = "test-session-123"
    requester_email = "chat-user@company.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/ingest/chatbot" -Method POST -ContentType 'application/json' -Body $chatbotTicket
```

### Step 6: Verify AI Classification

Check the response - AI should automatically:
- ✅ Categorize the ticket (e.g., "vpn", "network")
- ✅ Assign priority (e.g., "high", "medium")
- ✅ Route to appropriate team
- ✅ Set SLA deadline

---

## 📊 Access the Dashboard

### Dashboard Metrics
```powershell
# Get dashboard overview
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/analytics/dashboard"
```

### List All Tickets
```powershell
# Get all tickets
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/tickets/"
```

---

## 🔌 Integration with NullChat

### Modify NullChat's Forward Function

In your existing NullChat project:

**File:** `NullChat/backend/app/main.py`

Add this endpoint:

```python
@app.post("/forward-to-nullticket")
async def forward_to_nullticket(req: ForwardRequest, db: Session = Depends(get_db)):
    """Forward unresolved chat to NullTicket system"""
    conversation = db.query(Conversation).filter(
        Conversation.id == req.conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Create ticket in NullTicket
    import requests
    ticket_data = {
        "conversation_id": conversation.id,
        "session_id": conversation.session_id,
        "requester_email": "chat-user@system.com",  # Get from user session
        "additional_context": req.additional_context or ""
    }
    
    try:
        response = requests.post(
            "http://127.0.0.1:8000/api/ingest/chatbot",
            json=ticket_data,
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            return {
                "success": True,
                "ticket_number": result["ticket_number"],
                "message": f"Ticket {result['ticket_number']} created successfully"
            }
    except Exception as e:
        logger.error(f"Failed to create NullTicket: {e}")
        raise HTTPException(status_code=500, detail="Failed to create ticket")
```

**Frontend Integration (App.jsx):**

```javascript
const handleForwardToTicket = async (conversationId) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/forward-to-nullticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: conversationId,
        additional_context: "User requested support escalation"
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: `✅ Support ticket ${data.ticket_number} created! Our team will contact you soon.`,
        id: Date.now()
      }]);
    }
  } catch (error) {
    console.error('Failed to create ticket:', error);
  }
};
```

---

## 🎯 Next Steps

### 1. Create Teams
```powershell
# Create a support team
$team = @{
    name = "Network Team"
    description = "Handles network, VPN, and connectivity issues"
    email = "network@company.com"
    max_capacity = 50
    specialization = @("network", "vpn", "firewall")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/admin/teams" -Method POST -ContentType 'application/json' -Body $team
```

### 2. Setup Email Ingestion (Optional)

If you enabled email in `.env`:

Background task will automatically:
- Poll your inbox every 60 seconds
- Parse incoming emails
- Create tickets automatically
- Classify and route them

### 3. Configure GLPI/Solman Integration

Enable in `.env`:
```env
GLPI_ENABLED=True
GLPI_API_URL=https://your-glpi.com/apirest.php
GLPI_API_KEY=your_api_key
```

### 4. Build Admin Dashboard

```powershell
cd ..\admin-panel

# Initialize React project (next phase)
npm create vite@latest . -- --template react
npm install
npm install @mui/material @emotion/react @emotion/styled axios recharts
npm run dev
```

---

## 📝 Testing Scenarios

### Scenario 1: High Priority Ticket
```powershell
$urgent = @{
    title = "URGENT: Server down, all users affected"
    description = "Production server is down. Critical issue affecting entire department."
    requester_email = "manager@company.com"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/tickets/" -Method POST -ContentType 'application/json' -Body $urgent

Write-Host "Ticket created: $($response.ticket_number)"
Write-Host "Priority: $($response.priority)"
Write-Host "Category: $($response.category)"
```

### Scenario 2: Multiple Tickets from Different Sources
```powershell
# Email ticket
$email = @{
    subject = "Password reset request"
    body = "I forgot my password and need to reset it"
    from_email = "user1@company.com"
    from_name = "User One"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/ingest/email" -Method POST -ContentType 'application/json' -Body $email

# Chatbot ticket
$chat = @{
    conversation_id = 100
    session_id = "sess-xyz"
    requester_email = "user2@company.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/ingest/chatbot" -Method POST -ContentType 'application/json' -Body $chat
```

### Scenario 3: Check Analytics
```powershell
# Dashboard metrics
$dashboard = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/analytics/dashboard"
Write-Host "Total Tickets: $($dashboard.totals.all_time)"
Write-Host "Today: $($dashboard.totals.today)"
Write-Host "Avg Resolution Time: $($dashboard.performance.avg_resolution_minutes) minutes"

# Ticket trend (last 7 days)
$trend = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/analytics/tickets/trend?days=7"
$trend.data | Format-Table
```

---

## 🐛 Troubleshooting

### Issue: "Import sqlalchemy could not be resolved"
**Solution:** Activate virtual environment first:
```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Issue: "GROQ_API_KEY not set"
**Solution:** 
1. Get free API key from https://console.groq.com
2. Add to `.env`: `GROQ_API_KEY=gsk_your_key_here`
3. Restart server

### Issue: "Database not found"
**Solution:**
```powershell
mkdir data
python -c "from app.database import init_db; init_db()"
```

### Issue: "Port 8000 already in use"
**Solution:** Change port in startup command:
```powershell
uvicorn app.main:app --reload --port 8001
```

### Issue: Email ingestion not working
**Solution:** 
- Gmail users: Enable "App Passwords" in Google Account settings
- Use app-specific password, not your regular password
- Check firewall allows port 993 (IMAP) and 587 (SMTP)

---

## 📚 Additional Resources

- **API Documentation:** http://127.0.0.1:8000/docs
- **Implementation Guide:** `docs/IMPLEMENTATION_GUIDE.md`
- **Project README:** `README.md`
- **Groq API Docs:** https://console.groq.com/docs
- **FastAPI Tutorial:** https://fastapi.tiangolo.com

---

## 🎓 Understanding the System

### How Ticket Classification Works
1. User creates ticket (via chat/email/API)
2. LLaMA 3.1 8B reads title + description
3. AI returns: category, priority, keywords
4. System stores classification with confidence score

### How Smart Routing Works
1. Check routing rules (exact match)
2. Check team specialization
3. Analyze historical patterns
4. Balance load across teams
5. Fallback to default team

### Ticket Lifecycle
```
NEW → OPEN → IN_PROGRESS → RESOLVED → CLOSED
         ↓
    PENDING_USER/VENDOR
```

---

## 🚢 Production Deployment (Coming Soon)

Check `docs/DEPLOYMENT.md` for:
- Docker containerization
- PostgreSQL setup
- Redis for background tasks
- Nginx reverse proxy
- SSL certificates
- Monitoring & logging

---

## 🆘 Need Help?

1. Check logs in `logs/` directory
2. Test with simple ticket first
3. Verify .env configuration
4. Check API docs: http://127.0.0.1:8000/docs
5. Review IMPLEMENTATION_GUIDE.md

**Happy Ticketing! 🎫✨**
