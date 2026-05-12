# 🔒 YARSI TV - Complete Security Implementation Guide

**Date**: May 12, 2026  
**Version**: 1.0.0  
**Status**: Ready for Production

---

## 📋 Table of Contents

1. [Quick Start (5 minutes)](#quick-start)
2. [Detailed Setup (15 minutes)](#detailed-setup)
3. [Testing & Verification](#testing--verification)
4. [Troubleshooting](#troubleshooting)
5. [Best Practices](#best-practices)
6. [Next Steps](#next-steps)

---

## 🚀 Quick Start (5 minutes)

### Step 1: Generate API Key
Open browser console (F12) and run:
```javascript
const generateAPIKey = () => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};
console.log('�� Your API Key:', generateAPIKey());
```

### Step 2: Configure Backend
1. Open Google Spreadsheet → Extensions → Apps Script
2. Replace code with `YARSI-TV-Google-Apps-Script-SECURE.gs`
3. Project Settings → Script Properties → Add `API_KEY` = [your key]
4. Run → Review Permissions → Allow
5. Deploy → Manage deployments → Edit → New version → Deploy

### Step 3: Configure Frontend
Create `.env.local` in project root:
```env
VITE_API_KEY=your-generated-key-here
VITE_SPREADSHEET_ID=1ZXfS1FQJqBidwg4kuJ7ODQ4HkdUZhInJpmis3bDCDw4
VITE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbw-E6Po3wQ-HGaPlTfucFwH3LX-t7kDSuk1DMK-M5YrOgTYJJbwB-It72J5cT6dNAXx/exec
VITE_DRIVE_PARENT_FOLDER_ID=1Mvm5sJvB3opXOQWSADkugminbC1oF8HK
```

### Step 4: Restart & Test
```bash
npm run dev
```
- Login ✓
- Create schedule ✓
- Check Drive folder created ✓

---

## 📖 Detailed Setup (15 minutes)

### Prerequisites
- ✅ Google Drive integration working (from previous task)
- ✅ YARSI TV project running locally
- ✅ Access to Google Apps Script editor

### Phase 1: Backend Security (7 minutes)

#### 1.1 Generate Secure API Key
The API key must be:
- At least 64 characters long
- Randomly generated
- Unique to your deployment
- Never shared publicly

**Method A - Browser Console (Recommended)**:
```javascript
// Run in browser console (F12)
const generateAPIKey = () => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};
console.log('🔑 API Key:', generateAPIKey());
```

**Method B - Node.js**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 1.2 Update Google Apps Script

1. **Open Apps Script**:
   - Go to your Google Spreadsheet
   - Extensions → Apps Script

2. **Replace Code**:
   - In your project, open `YARSI-TV-Google-Apps-Script-SECURE.gs`
   - Copy ALL code (Ctrl+A, Ctrl+C)
   - In Apps Script, select all in `Code.gs` (Ctrl+A)
   - Paste new code (Ctrl+V)
   - Save (Ctrl+S)

3. **Set API Key in Script Properties**:
   - Click ⚙️ Project Settings (left sidebar)
   - Scroll to **Script Properties**
   - Click **Add script property**
   - Enter:
     - Property: `API_KEY`
     - Value: [paste your generated key]
   - Click **Save script properties**

4. **Reauthorize Script**:
   - Click **Run** (▶️) button
   - Click **Review Permissions**
   - Select your Google account
   - Click **Advanced** → **Go to [Project] (unsafe)**
   - Click **Allow**

5. **Deploy New Version**:
   - Deploy → Manage deployments
   - Click **Edit** (✏️)
   - Version: **New version**
   - Click **Deploy**
   - Click **Done**

### Phase 2: Frontend Security (5 minutes)

#### 2.1 Create Environment File

1. **Navigate to project root**:
   ```bash
   cd c:\Users\achmadhm\Documents\Github\YARSI-TV
   ```

2. **Create `.env.local`**:
   Create a new file named `.env.local` with this content:
   ```env
   # YARSI TV Environment Variables
   # ⚠️ NEVER commit this file to git!

   # API Key - Must match Google Apps Script Properties
   VITE_API_KEY=paste-your-api-key-here

   # Google Spreadsheet ID
   VITE_SPREADSHEET_ID=1ZXfS1FQJqBidwg4kuJ7ODQ4HkdUZhInJpmis3bDCDw4

   # Google Apps Script URL
   VITE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbw-E6Po3wQ-HGaPlTfucFwH3LX-t7kDSuk1DMK-M5YrOgTYJJbwB-It72J5cT6dNAXx/exec

   # Google Drive Parent Folder ID
   VITE_DRIVE_PARENT_FOLDER_ID=1Mvm5sJvB3opXOQWSADkugminbC1oF8HK

   # Session Timeout (24 hours)
   VITE_SESSION_TIMEOUT=86400000
   ```

3. **Replace placeholder**:
   - Change `paste-your-api-key-here` to your actual API key
   - Save the file

#### 2.2 Verify Git Ignore

The `.gitignore` file should include:
```
# Environment variables
.env
.env.*
!.env.example
```

This prevents accidentally committing your API key.

### Phase 3: Testing (3 minutes)

#### 3.1 Restart Development Server
```bash
# Stop current server (Ctrl+C)
# Start with new environment
npm run dev
```

#### 3.2 Test Login
1. Go to `http://localhost:5173/login`
2. Login with your credentials
3. Should redirect to admin dashboard

#### 3.3 Test Schedule Creation
1. Go to Admin Dashboard
2. Click "Tambah Jadwal"
3. Fill in the form:
   - Program Name: "Test Security Implementation"
   - Date: Any date
   - Time: Any time
   - Location: Any location
   - PIC: Any name
4. Click "SIMPAN JADWAL"
5. Open browser console (F12)
6. Check for:
   - ✅ `[Drive] SUCCESS - Folder created: [URL]`
   - ❌ Should NOT see: `API_KEY not configured`
   - ❌ Should NOT see: `Unauthorized: Invalid API key`

#### 3.4 Test Google Drive
1. Open: https://drive.google.com/drive/folders/1Mvm5sJvB3opXOQWSADkugminbC1oF8HK
2. Verify new folder "Test Security Implementation" exists
3. Open the folder to verify it's accessible

#### 3.5 Test Other Features
- ✅ Create/edit equipment
- ✅ Create/edit articles
- ✅ Generate equipment usage form
- ✅ View schedules
- ✅ View inventory

---

## ✅ Testing & Verification

### Security Features Test

#### Test 1: API Key Authentication
**Valid Key**:
- All features should work normally
- No errors in console

**Invalid Key** (temporary test):
1. Change API key in `.env.local` to "wrong-key"
2. Restart server
3. Try to create schedule
4. Should see: `Unauthorized: Invalid or missing API key`
5. Change back to correct key

#### Test 2: Rate Limiting
**Normal Usage**:
- Create multiple schedules quickly
- Should all succeed

**Excessive Requests** (optional):
1. Create more than 20 schedules in 1 minute
2. Should see: `Rate limit exceeded`
3. Wait 1 minute
4. Should work again

#### Test 3: Input Validation
**Valid Inputs**:
- Normal text in all fields
- Should work fine

**Invalid Inputs** (backend prevents):
- HTML tags like `<script>alert('xss')</script>`
- Should be removed or rejected
- No malicious code executed

#### Test 4: Session Management
**Normal Login**:
- Login should work
- Session should persist on refresh

**After 24 Hours**:
- Session should expire
- Redirect to login page

### Verification Checklist

- [ ] API key is set in Google Apps Script Properties
- [ ] API key is set in `.env.local`
- [ ] Both keys match exactly (no extra spaces)
- [ ] `.env.local` is in `.gitignore`
- [ ] `.env.local` is NOT visible in git status
- [ ] Login works correctly
- [ ] Create schedule works
- [ ] Google Drive folder is created
- [ ] Equipment management works
- [ ] Article management works
- [ ] Equipment usage form works
- [ ] No console errors about API key
- [ ] No console errors about authorization
- [ ] Activity_Log sheet records operations

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: "Unauthorized: Invalid or missing API key"

**Cause**: API keys don't match

**Solution**:
1. Check API key in Apps Script Properties
2. Check API key in `.env.local`
3. Make sure they match EXACTLY
4. No extra spaces or quotes
5. Restart dev server after changes

#### Issue: "API_KEY not configured"

**Cause**: Environment variable not loaded

**Solution**:
1. Verify `.env.local` exists in project root
2. Check file name is exactly `.env.local` (not `.env.local.txt`)
3. Verify variable name is exactly `VITE_API_KEY`
4. Restart dev server
5. If using Windows, make sure file doesn't have hidden extension

#### Issue: "Rate limit exceeded"

**Cause**: Too many requests in short time

**Solution**:
1. Wait 1 minute
2. This is normal protection
3. If needed, increase `maxRequests` in Apps Script:
   ```javascript
   const maxRequests = 50; // Increase limit
   ```

#### Issue: Features stopped working after security update

**Cause**: API key not configured or keys don't match

**Solution**:
1. Check browser console (F12) for errors
2. Verify API key in both places
3. Make sure Apps Script was deployed
4. Clear browser cache and reload
5. Try incognito mode to test

#### Issue: Google Drive folder not created

**Cause**: Multiple possible reasons

**Solution**:
1. Check console for errors
2. Verify API key is set
3. Check Apps Script execution logs
4. Verify Drive permissions are granted
5. Make sure parent folder ID is correct

### Debug Mode

Enable detailed logging by adding to Apps Script:
```javascript
console.log('Received request:', JSON.stringify(data));
console.log('API Key valid:', verifyAPIKey(data));
console.log('Rate limit check:', checkRateLimit(ip));
```

Then check **View → Logs** in Apps Script editor.

---

## 🛡️ Best Practices

### DO ✅

1. **Keep API Key Secret**
   - Never share publicly
   - Never commit to git
   - Use different keys per environment

2. **Rotate Keys Regularly**
   - Every 3-6 months
   - Immediately if compromised
   - Document rotation process

3. **Monitor Logs**
   - Check Apps Script logs weekly
   - Review Activity_Log sheet
   - Watch for unauthorized attempts

4. **Backup Regularly**
   - Export spreadsheet monthly
   - Save copies of Apps Script
   - Document configuration

5. **Use HTTPS Only**
   - Already done (Google Apps Script)
   - Never use HTTP

6. **Test Security**
   - After any changes
   - Before deploying to production
   - Periodically

### DON'T ❌

1. **Never Commit Secrets**
   - No API keys in git
   - No passwords in code
   - No spreadsheet IDs in public repos

2. **Never Share API Key**
   - Not in Slack/Teams
   - Not in email
   - Not in documentation (use .env.example)

3. **Never Use Same Key**
   - Different key for dev
   - Different key for staging
   - Different key for production

4. **Never Ignore Errors**
   - Console errors matter
   - Investigate all warnings
   - Fix issues immediately

---

## 🎯 Next Steps

### Immediate (Now)
- [ ] Complete setup using this guide
- [ ] Test all features
- [ ] Verify security works

### Short-term (This Week)
- [ ] Monitor logs for issues
- [ ] Train team on new security
- [ ] Document deployment process

### Medium-term (This Month)
- [ ] Set up monitoring alerts
- [ ] Create backup strategy
- [ ] Plan key rotation schedule

### Long-term (Production)
- [ ] Consider proper backend (Node.js)
- [ ] Add more sophisticated rate limiting
- [ ] Implement JWT tokens
- [ ] Add security headers
- [ ] Regular security audits

---

## 📊 Security Level

### Current: **Production-Ready** ✅

| Feature | Status |
|---------|--------|
| API Key Auth | ✅ Implemented |
| Rate Limiting | ✅ Implemented |
| Input Validation | ✅ Implemented |
| XSS Prevention | ✅ Implemented |
| Password Hashing | ✅ Implemented |
| Session Management | ✅ Implemented |
| Environment Variables | ✅ Implemented |

### Recommended: **Enterprise-Level** 🎯

| Feature | Status |
|---------|--------|
| Proper Backend | ⚠️ Recommended |
| JWT Tokens | ⚠️ Recommended |
| CORS Restrictions | ⚠️ Recommended |
| Database | ⚠️ Recommended |
| Security Headers | ⚠️ Recommended |

---

## 📞 Support

### Documentation
- **Setup Guide**: `SECURITY_SETUP_GUIDE.md`
- **Quick Reference**: `SECURITY_QUICK_REFERENCE.md`
- **Summary**: `SECURITY_SUMMARY.md`
- **This Guide**: `SECURITY_COMPLETE_GUIDE.md`

### Files
- **Backend**: `YARSI-TV-Google-Apps-Script-SECURE.gs`
- **Frontend**: `src/services/googleSheets.ts`
- **Config**: `.env.example`

### Getting Help
1. Check this guide first
2. Review browser console (F12)
3. Check Apps Script logs
4. Review Activity_Log sheet
5. Verify all steps completed

---

## ✨ Summary

You now have a **secure, production-ready** YARSI TV application with:

✅ **API Key Authentication** - Only authorized requests processed  
✅ **Rate Limiting** - Protection against abuse  
✅ **Input Validation** - All data sanitized  
✅ **XSS Prevention** - Malicious scripts blocked  
✅ **Password Hashing** - Secure password storage  
✅ **Session Management** - Auto-expire sessions  
✅ **Environment Variables** - Secrets protected  
✅ **Google Drive Integration** - Secure folder creation  

**Setup Time**: 15 minutes  
**Security Level**: Production-ready  
**Maintenance**: Low  

---

**Congratulations! Your YARSI TV application is now secure! 🎉**

---

**Last Updated**: May 12, 2026, 10:02 UTC  
**Version**: 1.0.0
