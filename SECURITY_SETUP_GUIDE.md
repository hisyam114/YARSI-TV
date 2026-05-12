# 🔒 Security Setup Guide - YARSI TV

## ⚡ Quick Setup (15 minutes)

This guide will help you implement API key authentication and other security improvements.

---

## 📋 What You'll Do

1. Generate a secure API key
2. Configure Google Apps Script with the key
3. Configure frontend with the key
4. Test everything works
5. Deploy securely

---

## Step 1: Generate Your API Key (2 minutes)

### Option A: Use Browser Console (Recommended)

1. Open your browser (Chrome/Edge/Firefox)
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Paste this code and press Enter:

```javascript
const generateAPIKey = () => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

console.log('Your API Key:', generateAPIKey());
```

5. **Copy the generated key** - you'll need it in the next steps!

Example output:
```
Your API Key: a3f5c8e2b1d4f6a7c9b0e1d2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3
```

### Option B: Use Online Generator

Visit: https://www.random.org/strings/?num=1&len=64&digits=on&loweralpha=on&unique=on&format=plain

**⚠️ IMPORTANT**: Save this key securely! You'll need it for both backend and frontend.

---

## Step 2: Configure Google Apps Script (5 minutes)

### A. Update the Script Code

1. Open your Google Spreadsheet
2. Go to **Extensions** → **Apps Script**
3. In your project folder, open **`YARSI-TV-Google-Apps-Script-SECURE.gs`**
4. Copy **ALL** the code
5. Go back to Apps Script editor
6. Select all code in `Code.gs` (Ctrl+A)
7. Paste the new secure code
8. Click **Save** (Ctrl+S)

### B. Set the API Key in Script Properties

1. In Apps Script, click **⚙️ Project Settings** (left sidebar)
2. Scroll down to **Script Properties**
3. Click **Add script property**
4. Enter:
   - **Property**: `API_KEY`
   - **Value**: [Paste your generated API key from Step 1]
5. Click **Save script properties**

### C. Reauthorize and Deploy

1. Click **Run** (▶️) button at the top
2. Click **Review Permissions**
3. Select your Google account
4. Click **Advanced** → **Go to [Project] (unsafe)**
5. Click **Allow**
6. Go to **Deploy** → **Manage deployments**
7. Click **Edit** (✏️) on your deployment
8. Click **Version**: **New version**
9. Click **Deploy**
10. Click **Done**

---

## Step 3: Configure Frontend (5 minutes)

### A. Create Environment File

1. In your project root, you'll see `.env.example`
2. Create a new file named `.env.local` (in the same folder)
3. Copy this content into `.env.local`:

```env
# YARSI TV Environment Variables
# ⚠️ NEVER commit this file to git!

# 🔑 API Key - MUST match the one in Google Apps Script
VITE_API_KEY=paste-your-api-key-here

# Google Spreadsheet ID
VITE_SPREADSHEET_ID=1ZXfS1FQJqBidwg4kuJ7ODQ4HkdUZhInJpmis3bDCDw4

# Google Apps Script URL
VITE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbw-E6Po3wQ-HGaPlTfucFwH3LX-t7kDSuk1DMK-M5YrOgTYJJbwB-It72J5cT6dNAXx/exec

# Google Drive Parent Folder ID
VITE_DRIVE_PARENT_FOLDER_ID=1Mvm5sJvB3opXOQWSADkugminbC1oF8HK

# Session Timeout (24 hours in milliseconds)
VITE_SESSION_TIMEOUT=86400000
```

4. Replace `paste-your-api-key-here` with your actual API key from Step 1
5. Save the file

### B. Verify .gitignore

The `.gitignore` file has been updated to exclude `.env.local` from git. This prevents accidentally committing your API key.

---

## Step 4: Test Everything (3 minutes)

### A. Restart Development Server

1. Stop your current dev server (Ctrl+C in terminal)
2. Run: `npm run dev`
3. Open the app in your browser

### B. Test Login

1. Go to `/login`
2. Login with your credentials
3. Should work normally

### C. Test Schedule Creation

1. Go to Admin Dashboard
2. Click **"Tambah Jadwal"**
3. Fill in the form
4. Click **"SIMPAN JADWAL"**
5. Check browser console (F12):
   - Should see: `[Drive] SUCCESS - Folder created`
   - Should NOT see: `API_KEY not configured`
   - Should NOT see: `Unauthorized: Invalid or missing API key`

### D. Test Google Drive

1. Open your Google Drive folder
2. Verify the new folder was created
3. Check the spreadsheet - `Drive_Link` column should have the URL

### E. Test Other Features

- Create/edit equipment
- Create/edit articles
- Generate equipment usage form PDF
- All should work normally

---

## Step 5: Security Verification Checklist

- [ ] API key is set in Google Apps Script Properties
- [ ] API key is set in `.env.local`
- [ ] Both keys match exactly
- [ ] `.env.local` is in `.gitignore`
- [ ] `.env.local` is NOT committed to git
- [ ] All features work (login, schedules, equipment, articles)
- [ ] Google Drive folder creation works
- [ ] No console errors about missing API key

---

## 🔐 What's Now Secured

### ✅ Backend (Google Apps Script)
- **API Key Authentication** - Only requests with valid key are processed
- **Rate Limiting** - Max 20 requests per minute per IP
- **Input Validation** - All inputs are validated and sanitized
- **XSS Prevention** - HTML/script tags are removed
- **Path Traversal Prevention** - Folder names are validated
- **Generic Error Messages** - Internal errors not exposed to users

### ✅ Frontend
- **Environment Variables** - Sensitive data not hardcoded
- **Input Validation** - Data validated before sending
- **API Key Protection** - Key stored in .env.local (not in git)
- **Session Timeout** - 24-hour session expiration

---

## 🚨 Security Best Practices

### DO ✅
- Keep your API key secret
- Use different keys for dev/staging/production
- Rotate API key every 3-6 months
- Monitor Apps Script logs regularly
- Backup your spreadsheet regularly
- Use HTTPS only (already done)

### DON'T ❌
- Never commit `.env.local` to git
- Never share your API key publicly
- Never hardcode API key in source code
- Never use the same key across projects
- Never expose API key in client-side code (it's in .env)

---

## 🔄 How to Rotate API Key (Every 3-6 months)

1. Generate a new API key (Step 1)
2. Update Google Apps Script Properties with new key
3. Update `.env.local` with new key
4. Restart dev server
5. Test everything works
6. Deploy to production
7. Delete old key from everywhere

---

## 🐛 Troubleshooting

### Error: "Unauthorized: Invalid or missing API key"

**Solution**:
- Check that API key in `.env.local` matches Google Apps Script Properties
- Make sure you restarted dev server after creating `.env.local`
- Verify the key has no extra spaces or quotes

### Error: "API_KEY not configured"

**Solution**:
- Make sure `.env.local` exists in project root
- Check that the key is named exactly `VITE_API_KEY`
- Restart dev server

### Error: "Rate limit exceeded"

**Solution**:
- Wait 1 minute and try again
- This is normal protection against abuse
- If it happens often, increase `maxRequests` in Apps Script

### Features stopped working after security update

**Solution**:
- Check browser console for errors
- Verify API key is set correctly in both places
- Make sure you deployed the new Apps Script version
- Clear browser cache and reload

---

## 📊 Monitoring & Logs

### Check Apps Script Logs

1. Open Apps Script editor
2. Click **Executions** (left sidebar)
3. View recent executions and any errors
4. Look for unauthorized access attempts

### Check Activity Log in Spreadsheet

1. Open your spreadsheet
2. Go to **Activity_Log** sheet
3. Review all operations performed
4. Monitor for suspicious activity

---

## 🎯 Next Level Security (Optional)

For production deployment, consider:

1. **Move to proper backend** - Node.js + Express + MongoDB
2. **Add CORS restrictions** - Limit to your domain only
3. **Implement JWT tokens** - For better session management
4. **Add request signing** - Prevent replay attacks
5. **Use HTTPS everywhere** - Already done with Google Apps Script
6. **Add audit logging** - Track all security events
7. **Regular security audits** - Monthly reviews

---

## 📞 Need Help?

If you encounter issues:

1. Check the **Troubleshooting** section above
2. Review browser console for errors (F12)
3. Check Apps Script execution logs
4. Verify all steps were completed
5. Make sure API keys match exactly

---

## ✨ You're All Set!

Your YARSI TV application now has:
- ✅ API key authentication
- ✅ Rate limiting
- ✅ Input validation
- ✅ XSS prevention
- ✅ Secure configuration management
- ✅ Google Drive integration (secure)

**The app is now much more secure and ready for production use!** 🎉

---

**Last Updated**: May 12, 2026
