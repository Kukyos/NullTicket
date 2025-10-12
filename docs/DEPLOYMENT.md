# 🚀 Deployment Guide

Complete deployment guide for NullTicket system.

## 📋 Prerequisites

- GitHub account
- Vercel account (frontend)
- Railway/Render account (backend)
- Groq API key
- Optional: Twilio account (SMS), SMTP credentials (email)

## 🔧 Backend Deployment (Railway)

### 1. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Connect your NullTicket repository
5. Select the `backend` folder as root

### 2. Add PostgreSQL Database

1. Click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway automatically provides `DATABASE_URL` environment variable
3. Note the connection details

### 3. Configure Environment Variables

In Railway dashboard, go to **Variables** tab and add:

```bash
# Required
GROQ_API_KEY=your_groq_api_key

# Auto-provided by Railway
DATABASE_URL=postgresql://...

# Security
JWT_SECRET=your_random_secret_key_here

# Optional: Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=your_email@gmail.com
EMAIL_ENABLED=true

# Optional: SMS (Twilio)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Integrations
GLPI_ENABLED=false
SOLMAN_ENABLED=false

# App Config
LOG_LEVEL=INFO
FRONTEND_URL=https://your-app.vercel.app
```

### 4. Deploy

1. Railway auto-deploys from `main` branch
2. View logs to ensure startup success
3. Note your backend URL: `https://your-app.railway.app`

### 5. Run Database Migration

```bash
# SSH into Railway container or run locally
python migrate_to_postgres.py
```

## 🌐 Frontend Deployment (Vercel)

### 1. Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Import your NullTicket repository
4. Select the `frontend` folder as root directory

### 2. Configure Build Settings

Vercel auto-detects Next.js. Verify:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3. Add Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables**:

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### 4. Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. Your app will be live at: `https://your-app.vercel.app`

### 5. Update Backend CORS

In Railway, update `FRONTEND_URL` environment variable:

```bash
FRONTEND_URL=https://your-app.vercel.app
```

## 🔄 Setting Up Webhooks

### GLPI Webhook Configuration

1. Install GLPI webhook plugin
2. Configure webhook URL:
   ```
   https://your-backend.railway.app/api/webhooks/glpi
   ```
3. Set trigger: **On ticket creation**
4. Optional: Add signature authentication

### SAP Solman Webhook Configuration

1. Navigate to Solman notification configuration
2. Set endpoint URL:
   ```
   https://your-backend.railway.app/api/webhooks/solman
   ```
3. Configure authentication (Bearer token or Basic Auth)
4. Set trigger: **On incident creation**

## 📧 Email Integration Setup

### Gmail Configuration

1. Enable 2FA on your Google account
2. Generate App Password:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Select **"2-Step Verification"**
   - Scroll to **"App passwords"**
   - Generate password for "Mail"
3. Use this password in `SMTP_PASSWORD` environment variable

### Email Polling (Optional)

For automatic email ticket ingestion:

```python
# Add to backend startup
from app.services.email_polling import start_email_polling
asyncio.create_task(start_email_polling())
```

## 📱 SMS Integration (Twilio)

1. Sign up at [twilio.com](https://www.twilio.com)
2. Get a phone number (trial or paid)
3. Copy credentials from Twilio Console:
   - Account SID
   - Auth Token
   - Phone Number
4. Add to environment variables

## 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS (automatic on Vercel/Railway)
- [ ] Set up CORS properly
- [ ] Rotate API keys regularly
- [ ] Enable database backups
- [ ] Set up monitoring and alerts
- [ ] Configure rate limiting (optional)

## 📊 Monitoring

### Railway Metrics

- CPU usage
- Memory usage
- Network traffic
- Build logs
- Runtime logs

### Vercel Analytics

- Function invocations
- Build logs
- Performance metrics
- Error tracking

## 🔧 Troubleshooting

### Backend Issues

**Database Connection Error:**
```bash
# Check DATABASE_URL format
postgresql://user:password@host:5432/database

# Test connection
python -c "from app.database import init_db; init_db()"
```

**AI Classification Not Working:**
```bash
# Verify GROQ_API_KEY
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer YOUR_KEY"
```

### Frontend Issues

**API Calls Failing:**
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify CORS settings in backend
- Check browser console for errors

**Build Failing:**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

## 🎯 One-Click Deploy (Future)

### Deploy to Railway Button

Add to README.md:
```markdown
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template)
```

### Deploy to Vercel Button

Add to README.md:
```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Kukyos/NullTicket/tree/main/frontend)
```

## 📝 Post-Deployment Tasks

1. **Test all endpoints**: `/health`, `/api/tickets`, `/api/ingest/chatbot`
2. **Create test ticket** via chatbot widget
3. **Verify email notifications** (if configured)
4. **Test GLPI/Solman webhooks** with mock data
5. **Set up monitoring alerts**
6. **Document custom configurations**

## 🆘 Support

For issues:
1. Check Railway/Vercel logs
2. Review environment variables
3. Test locally first
4. Check GitHub Issues

---

**Ready for Production! 🚀**
