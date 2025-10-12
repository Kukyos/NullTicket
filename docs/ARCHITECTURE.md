# NullTicket System Architecture

## 📐 Visual System Architecture

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                  UNIFIED TICKET INGESTION LAYER                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
           │                  │                  │                 │
    ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
    │  NullChat   │   │    Email    │   │    GLPI     │   │   Solman    │
    │   Widget    │   │   Polling   │   │  Webhook    │   │  Webhook    │
    │   (React)   │   │ (IMAP/SMTP) │   │   (REST)    │   │   (REST)    │
    └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
           │                  │                  │                 │
           └──────────────────┴──────────────────┴─────────────────┘
                                    │
                  ┌─────────────────▼──────────────────┐
                  │    FastAPI Backend (Port 8000)     │
                  │  POST /api/ingest/chatbot          │
                  │  POST /api/ingest/email            │
                  │  POST /api/ingest/glpi             │
                  │  POST /api/ingest/solman           │
                  └─────────────────┬──────────────────┘
                                    │
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━▼━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃              AI-POWERED PROCESSING ENGINE (LLaMA 3.1)              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
    ┌───────────────┬────────────────┬──────────────┬────────────────┐
    │               │                │              │                │
┌───▼────────┐ ┌───▼──────┐ ┌──────▼─────┐ ┌──────▼──────┐ ┌──────▼────┐
│ Ticket     │ │ Priority │ │ Keywords   │ │ Intent      │ │ Team      │
│ Category   │ │ Scoring  │ │ Extraction │ │ Detection   │ │ Suggestion│
│            │ │          │ │            │ │             │ │           │
│ network    │ │ critical │ │ [vpn,      │ │ User can't  │ │ Network   │
│ hardware   │ │ urgent   │ │  error,    │ │ access VPN  │ │ Team      │
│ software   │ │ high     │ │  remote]   │ │ from home   │ │           │
│ ...        │ │ medium   │ │            │ │             │ │           │
│ (13 types) │ │ low      │ │            │ │             │ │           │
└────────────┘ └──────────┘ └────────────┘ └─────────────┘ └───────────┘
                                    │
                  ┌─────────────────▼──────────────────┐
                  │  Classified Ticket + Confidence    │
                  │  {category: vpn, priority: high,   │
                  │   confidence: 0.92, keywords: [...]}│
                  └─────────────────┬──────────────────┘
                                    │
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━▼━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                 INTELLIGENT ROUTING SYSTEM                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
           │                  │                  │                  │
    ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐   ┌───────▼──────┐
    │ Strategy 1  │   │ Strategy 2  │   │ Strategy 3  │   │ Strategy 4   │
    │ Rule-Based  │   │   Team      │   │ Historical  │   │     Load     │
    │  Matching   │   │Specialization│   │  Patterns   │   │  Balancing   │
    │             │   │             │   │             │   │              │
    │ IF category │   │ Network Team│   │ Last 20     │   │ Network: 45/50│
    │ = vpn AND   │   │ specializes │   │ VPN tickets │   │ Identity: 30/50│
    │ keywords    │   │ in [vpn,    │   │ resolved by │   │ → Choose     │
    │ match...    │   │ network]    │   │ Network Team│   │ Identity Team│
    └─────────────┘   └─────────────┘   └─────────────┘   └──────────────┘
           │                  │                  │                  │
           └──────────────────┴──────────────────┴──────────────────┘
                                    │
                  ┌─────────────────▼──────────────────┐
                  │   Assigned to: Network Team        │
                  │   SLA Deadline: 4 hours            │
                  │   Priority Score: 8/10             │
                  └─────────────────┬──────────────────┘
                                    │
                                    ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                      DATABASE (SQLite/PostgreSQL)                   ┃
┣━━━━━━━━━━━━━━━┳━━━━━━━━━━━━┳━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━┫
┃   tickets     ┃   teams    ┃ routing_rules┃  knowledge_articles  ┃
┃               ┃            ┃             ┃                      ┃
┃ • id          ┃ • id       ┃ • id        ┃ • id                 ┃
┃ • ticket_num  ┃ • name     ┃ • category  ┃ • title              ┃
┃ • title       ┃ • email    ┃ • keywords  ┃ • content            ┃
┃ • description ┃ • capacity ┃ • team_id   ┃ • category           ┃
┃ • source      ┃ • load     ┃ • priority  ┃ • helpful_count      ┃
┃ • category    ┃ • special. ┃ • active    ┃ • resolution_count   ┃
┃ • priority    ┃            ┃             ┃                      ┃
┃ • status      ┃            ┃             ┃                      ┃
┃ • assigned_to ┃            ┃             ┃                      ┃
┃ • sla_deadline┃            ┃             ┃                      ┃
┃ • resolution  ┃            ┃             ┃                      ┃
┃ • satisfaction┃            ┃             ┃                      ┃
┗━━━━━━━━━━━━━━━┻━━━━━━━━━━━━┻━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━┛
                                    │
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━▼━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃               ADMIN DASHBOARD & ANALYTICS (React)                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
    ┌───────────────┬────────────────┬──────────────┬────────────────┐
    │               │                │              │                │
┌───▼────────┐ ┌───▼──────┐ ┌──────▼─────┐ ┌──────▼──────┐ ┌──────▼────┐
│ Dashboard  │ │  Ticket  │ │ Analytics  │ │  Routing    │ │    KB     │
│  Overview  │ │Management│ │  & Reports │ │Configuration│ │Management │
│            │ │          │ │            │ │             │ │           │
│ • Total    │ │ • List   │ │ • Trends   │ │ • Rules     │ │ • Articles│
│   Tickets  │ │ • Details│ │ • Teams    │ │ • Test      │ │ • Suggest.│
│ • Today    │ │ • Assign │ │ • Satisf.  │ │ • Priority  │ │ • Upload  │
│ • Status   │ │ • Resolve│ │ • SLA      │ │ • History   │ │ • Search  │
│ • Charts   │ │ • Comment│ │ • Export   │ │             │ │           │
└────────────┘ └──────────┘ └────────────┘ └─────────────┘ └───────────┘
                                    │
                  ┌─────────────────▼──────────────────┐
                  │   Notifications & Alerts           │
                  │  • Email (SMTP)                    │
                  │  • SMS (Twilio)                    │
                  │  • Real-time updates (WebSocket)   │
                  └────────────────────────────────────┘
```

---

## 🔄 Data Flow Example: VPN Issue Ticket

```
Step 1: User Interaction
┌────────────────────────────────────────────────┐
│ User: "I can't connect to VPN from home"      │
│ NullChat Bot: "Let me help you..."            │
│ Bot: "I'm creating a support ticket for you"  │
└───────────────────┬────────────────────────────┘
                    │
                    ▼
Step 2: Ticket Creation
┌────────────────────────────────────────────────┐
│ POST /api/ingest/chatbot                       │
│ {                                              │
│   conversation_id: 123,                        │
│   session_id: "sess-xyz",                      │
│   requester_email: "user@company.com"          │
│ }                                              │
└───────────────────┬────────────────────────────┘
                    │
                    ▼
Step 3: AI Classification
┌────────────────────────────────────────────────┐
│ LLaMA 3.1 8B Analysis                          │
│ Input: "Can't connect to VPN from home"       │
│                                                │
│ AI Response:                                   │
│ {                                              │
│   category: "vpn",                             │
│   priority: "high",                            │
│   confidence: 0.92,                            │
│   keywords: ["vpn", "connection", "remote"],   │
│   suggested_team: "Network Team",              │
│   requires_immediate_attention: true           │
│ }                                              │
└───────────────────┬────────────────────────────┘
                    │
                    ▼
Step 4: Intelligent Routing
┌────────────────────────────────────────────────┐
│ Routing Engine Decision                        │
│                                                │
│ ✓ Rule Match: vpn → Network Team              │
│ ✓ Team Specialization: Network Team has VPN   │
│ ✓ Historical Pattern: 95% VPN → Network Team  │
│ ✓ Capacity Check: Network Team 45/50 (OK)     │
│                                                │
│ Decision: Assign to Network Team               │
│ SLA Deadline: 4 hours (high priority)         │
└───────────────────┬────────────────────────────┘
                    │
                    ▼
Step 5: Database Storage
┌────────────────────────────────────────────────┐
│ Ticket #TKT-20240112-A3F5                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ Title: VPN connection issue                    │
│ Source: Chat                                   │
│ Category: VPN                                  │
│ Priority: High                                 │
│ Status: New → Open                             │
│ Assigned: Network Team                         │
│ SLA Deadline: Today 18:00                      │
│ Created: 14:00                                 │
└───────────────────┬────────────────────────────┘
                    │
                    ▼
Step 6: Notification
┌────────────────────────────────────────────────┐
│ ✉️ Email to: network@company.com              │
│ Subject: New Ticket #TKT-20240112-A3F5        │
│ Priority: HIGH                                 │
│ SLA: 4 hours                                   │
│                                                │
│ 📱 SMS to: Network Team Lead                  │
│ "High priority VPN ticket assigned"           │
└───────────────────┬────────────────────────────┘
                    │
                    ▼
Step 7: Agent Action
┌────────────────────────────────────────────────┐
│ Agent (John) from Network Team:                │
│                                                │
│ 14:30 - Views ticket in dashboard              │
│ 14:35 - Updates status to "In Progress"       │
│ 14:45 - Adds comment: "Checking VPN logs"     │
│ 15:15 - Resolves ticket with solution         │
│ 15:16 - Status: Resolved                       │
│ Resolution time: 75 minutes                    │
└───────────────────┬────────────────────────────┘
                    │
                    ▼
Step 8: User Feedback
┌────────────────────────────────────────────────┐
│ ✉️ Email to: user@company.com                 │
│ Subject: Your ticket has been resolved         │
│                                                │
│ "Your VPN issue has been fixed.               │
│  Please rate your experience: ⭐⭐⭐⭐⭐"      │
│                                                │
│ User clicks: 5 stars                           │
└───────────────────┬────────────────────────────┘
                    │
                    ▼
Step 9: Analytics Update
┌────────────────────────────────────────────────┐
│ Dashboard Metrics Updated:                     │
│                                                │
│ • Total tickets today: 46 (+1)                 │
│ • Resolved today: 38 (+1)                      │
│ • Avg resolution time: 82 min                  │
│ • Satisfaction: 4.5/5 ⭐                       │
│ • SLA compliance: 92%                          │
│                                                │
│ Pattern Detected:                              │
│ "VPN issues increased 20% this week"          │
│ Suggestion: Create KB article for VPN setup    │
└────────────────────────────────────────────────┘
```

---

## 🗂️ File Structure & Relationships

```
backend/app/
│
├── main.py                    → FastAPI application entry
│   ├── imports config.py      → Settings & environment
│   ├── imports database.py    → DB connection & session
│   ├── imports routes/*       → API endpoints
│   └── includes middleware    → CORS, logging
│
├── models/
│   └── ticket_models.py       → 13 SQLAlchemy models
│       ├── Ticket             → Core ticket entity
│       ├── Team               → Support teams
│       ├── RoutingRule        → Routing configuration
│       ├── KnowledgeArticle   → KB articles
│       ├── User               → System users
│       ├── TicketHistory      → Audit trail
│       ├── TicketComment      → Comments on tickets
│       ├── ExternalSystemConfig → GLPI/Solman setup
│       └── ...                → 5 more models
│
├── services/
│   ├── classification_service.py  → AI ticket classification
│   │   ├── classify_ticket()      → Main classification
│   │   ├── extract_intent()       → Intent detection
│   │   └── _fallback_classification() → Keyword backup
│   │
│   └── routing_service.py         → Intelligent routing
│       ├── route_ticket()         → Main routing logic
│       ├── _route_by_rules()      → Strategy 1
│       ├── _route_by_category()   → Strategy 2
│       ├── _route_by_historical_patterns() → Strategy 3
│       └── _route_by_load_balancing() → Strategy 4
│
└── routes/
    ├── tickets.py             → Ticket CRUD operations
    │   ├── GET /              → List tickets
    │   ├── GET /{id}          → Get details
    │   ├── POST /             → Create ticket
    │   ├── PUT /{id}/status   → Update status
    │   └── DELETE /{id}       → Delete ticket
    │
    ├── ingestion.py           → Multi-source ingestion
    │   ├── POST /chatbot      → From NullChat
    │   ├── POST /email        → From email
    │   ├── POST /glpi         → From GLPI
    │   ├── POST /solman       → From Solman
    │   └── GET /sync/status   → Sync monitoring
    │
    ├── analytics.py           → Reporting & metrics
    │   ├── GET /dashboard     → Overview metrics
    │   ├── GET /tickets/trend → Daily trends
    │   ├── GET /teams/performance → Team stats
    │   └── GET /satisfaction  → Rating analysis
    │
    └── admin.py               → Admin operations
        ├── GET /teams         → List teams
        ├── POST /teams        → Create team
        ├── GET /routing/rules → List rules
        └── GET /kb/articles   → List articles
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     PUBLIC ACCESS                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Anonymous User (Ticket Creation Only)           │   │
│  │  • POST /api/ingest/chatbot                      │   │
│  │  • POST /api/ingest/email                        │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│               AUTHENTICATED ACCESS (JWT)                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Regular User (Ticket Viewing)                   │   │
│  │  • GET /api/tickets/ (own tickets)               │   │
│  │  • GET /api/tickets/{id}                         │   │
│  │  • POST /api/tickets/ (create)                   │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   AGENT ACCESS (Role: Agent)             │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Support Agent (Ticket Management)               │   │
│  │  • GET /api/tickets/ (all tickets)               │   │
│  │  • PUT /api/tickets/{id}/status                  │   │
│  │  • POST /api/tickets/{id}/comments               │   │
│  │  • PUT /api/tickets/{id}/assign                  │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  ADMIN ACCESS (Role: Admin)              │
│  ┌──────────────────────────────────────────────────┐   │
│  │  System Administrator (Full Control)             │   │
│  │  • All Agent permissions                         │   │
│  │  • POST /api/admin/teams                         │   │
│  │  • POST /api/admin/routing/rules                 │   │
│  │  • GET /api/analytics/* (all metrics)            │   │
│  │  • DELETE /api/tickets/{id}                      │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 📈 Scalability Architecture

```
Current Setup (Development)
┌──────────────────────────────────┐
│   Single Server                  │
│   • FastAPI (Port 8000)          │
│   • SQLite Database              │
│   • In-memory Classification     │
│   • Handles: ~100 tickets/day    │
└──────────────────────────────────┘

Production Setup (Scalable)
┌──────────────────────────────────────────────────────────┐
│                    Load Balancer                         │
│              (Nginx / AWS ALB)                           │
└────────────┬────────────┬────────────┬──────────────────┘
             │            │            │
    ┌────────▼───┐  ┌────▼────┐  ┌────▼────┐
    │ FastAPI #1 │  │FastAPI#2│  │FastAPI#3│
    │ (Docker)   │  │(Docker) │  │(Docker) │
    └────────────┘  └─────────┘  └─────────┘
             │            │            │
             └────────────┴────────────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
    ┌────▼──────┐              ┌──────▼─────┐
    │PostgreSQL │              │   Redis    │
    │ (Primary) │              │  (Cache +  │
    │           │              │   Celery)  │
    └───────────┘              └────────────┘
         │
    ┌────▼──────┐
    │PostgreSQL │
    │ (Replica) │
    └───────────┘

Handles: 10,000+ tickets/day
```

---

**This architecture enables:**
- ✅ Multi-source ticket ingestion
- ✅ AI-powered automation
- ✅ Intelligent routing
- ✅ Real-time analytics
- ✅ Seamless scalability
- ✅ Enterprise integration

🎯 **NullTicket** - Your Complete Ticketing Solution
