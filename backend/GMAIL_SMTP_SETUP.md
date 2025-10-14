# Gmail SMTP Setup for POWERGRID Helpdesk

## 📧 Email Notifications Setup

This guide will help you set up Gmail SMTP for sending ticket resolution notifications.

## Step 1: Enable 2-Factor Authentication

1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Enable 2-Factor Authentication if not already enabled

## Step 2: Generate App Password

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Sign in with your POWERGRID Gmail account
3. Select "Mail" as the app
4. Select "Other (custom name)" and enter "POWERGRID Helpdesk"
5. Click "Generate"
6. **Copy the 16-character password** (ignore spaces)

## Step 3: Configure Environment Variables

Add these to your Railway environment variables:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-powergrid-email@powergrid.in
SMTP_PASSWORD=your-16-character-app-password
```

## Step 4: Test Email Service

Run the test script to verify everything works:

```bash
cd backend
python test_email.py
```

Enter your test email address when prompted.

## Step 5: Verify in Production

Once deployed, resolve a test ticket in the admin panel and check if the email is received.

## 📋 Gmail SMTP Settings

- **SMTP Server:** smtp.gmail.com
- **Port:** 587 (TLS) or 465 (SSL)
- **Authentication:** Required
- **Security:** TLS recommended

## 🔧 Troubleshooting

### Common Issues:

1. **"Authentication failed"**
   - Make sure you're using an App Password, not your regular password
   - Verify 2FA is enabled on your Google account

2. **"Less secure app blocked"**
   - Use App Passwords instead of allowing less secure apps

3. **Emails going to spam**
   - Add the POWERGRID email to your contacts
   - Check spam folder initially

4. **Rate limits**
   - Gmail allows ~500 emails per day for free accounts
   - Consider upgrading to Google Workspace for higher limits

## 📞 Support

If you encounter issues:
1. Check Railway logs for error messages
2. Verify environment variables are set correctly
3. Test with the provided test script
4. Contact POWERGRID IT support for Gmail account issues

---

**Note:** For production use with high volume, consider using a dedicated email service like SendGrid, Mailgun, or Amazon SES for better deliverability and higher sending limits.