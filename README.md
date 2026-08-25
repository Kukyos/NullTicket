# NullTicket — POWERGRID Helpdesk

**A unified, AI-routed ticketing system that ingests support requests from a
chatbot, email, GLPI and Solman into one queue — then classifies and routes them
without a human triaging first.**

Built on top of [NullChat](https://github.com/Kukyos/NullChat), extending a
multilingual support chatbot into a full helpdesk backend.

![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)

---

## Why

Support tickets arrive through four different channels and land in four
different places. Someone has to read each one, guess a category, guess a
priority, and forward it to the right team. NullTicket collapses that into a
single ingestion path with an LLM doing the first pass.

## What it does

**Unified ingestion** — dedicated endpoints for chatbot, email, GLPI webhook and
Solman webhook. Every ticket carries its source.

**AI classification** — LLaMA 3.1 (via Groq) assigns one of 13 categories and one
of 5 priority levels, with a confidence score and extracted keywords. Falls back
to keyword matching when the model is unavailable.

**Intelligent routing** — a 4-strategy engine: explicit rules, learned patterns,
team load balancing, and category/keyword matching.

**Admin dashboard** — ticket management, team assignment, knowledge base, and
external-system integration status.

Backed by 13 database models covering tickets, teams, routing rules, knowledge
base articles and external system links.

## Run it

Requires Python 3.11+, Node.js 18+, and a free [Groq API key](https://console.groq.com).

**Backend:**

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env        # add GROQ_API_KEY
uvicorn app.main:app --reload
```

**Frontend** (Next.js, at the repo root):

```bash
npm install
npm run dev
```

> Note: `frontend/` contains a second copy of the same Next.js app. The root one
> is the one wired up for deployment — `frontend/` can be ignored.

On Windows, `start_all.bat` launches both.

Minimum config is `GROQ_API_KEY` plus `DATABASE_URL` — SQLite works for
development; see [`migrate_to_postgres.py`](backend/migrate_to_postgres.py) for
the Postgres path.

## Docs

- [QUICKSTART.md](QUICKSTART.md) — setup walkthrough (note: its paths predate a repo reorg; use the commands above)
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) — full architecture and feature breakdown
- [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) — everything else
- [backend/GMAIL_SMTP_SETUP.md](backend/GMAIL_SMTP_SETUP.md) — email ingestion setup

## Stack

Next.js 15 · React 19 · Tailwind · Radix UI · FastAPI · SQLAlchemy · Groq (LLaMA 3.1) · SQLite/Postgres
