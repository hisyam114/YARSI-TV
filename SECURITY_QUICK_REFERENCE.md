# 🔒 Security Quick Reference Card

## 🚀 Quick Setup (Copy-Paste Ready)

### 1. Generate API Key (Browser Console)
```javascript
const generateAPIKey = () => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};
console.log('Your API Key:', generateAPIKey());
```

### 2. Google Apps Script Setup
1. Extensions → Apps Script
2. Replace code with `YARSI-TV-Google-Apps-Script-SECURE.gs`
3. Project Settings → Script Properties → Add:
   - Property: `API_KEY`
   - Value: [your generated key]
4. Run → Review Permissions → Allow
5. Deploy → Manage deployments → Edit → New version → Deploy

### 3. Frontend Setup
Create `.env.local` in project root:
```env
VITE_API_KEY=your-generated-api-key-here
VITE_SPREADSHEET_ID=1ZXfS1FQJqBidwg4kuJ7ODQ4HkdUZhInJpmis3bDCDw4
VITE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbw-E6Po3wQ-HGaPlTfucFwH3LX-t7kDSuk1DMK-M5YrOgTYJJbwB-It72J5cT6dNAXx/exec
VITE_DRIVE_PARENT_FOLDER_ID=1Mvm5sJvB3opXOQWSADkugminbC1oF8HK
VITE_SESSION_TIMEOUT=86400000
```

### 4. Test
```bash
npm run dev
```
- Login → Create Schedule → Check Drive folder created
- No console errors about API key

---

## 🔐 Security Features Enabled

| Feature | Status | Description |
|---------|--------|-------------|
| API Key Auth | ✅ | Only authorized requests processed |
| Rate Limiting | ✅ | 20 requests/minute per IP |
| Input Validation | ✅ | All inputs sanitized |
| XSS Prevention | ✅ | HTML/script tags removed |
| Path Traversal | ✅ | Folder names validated |
| Password Hashing | ✅ | bcryptjs with salt rounds |
| Session Timeout | ✅ | 24-hour expiration |
| Env Variables | ✅ | Secrets not in code |

---

## 🚨 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| "Unauthorized: Invalid API key" | Keys don't match - check both places |
| "API_KEY not configured" | Create `.env.local` and restart server |
| "Rate limit exceeded" | Wait 1 minute, normal protection |
| Features not working | Verify API key set in both places |

---

## 📁 Important Files

| File | Purpose | Commit to Git? |
|------|---------|----------------|
| `.env.local` | Your API key & config | ❌ NO |
| `.env.example` | Template for others | ✅ YES |
| `YARSI-TV-Google-Apps-Script-SECURE.gs` | Secure backend | ✅ YES |
| `src/services/googleSheets.ts` | Updated with auth | ✅ YES |

---

## 🔄 Key Rotation (Every 3-6 months)

1. Generate new key (browser console)
2. Update Apps Script Properties
3. Update `.env.local`
4. Restart: `npm run dev`
5. Test everything works

---

## ✅ Security Checklist

Before deploying:
- [ ] API key set in Apps Script Properties
- [ ] API key set in `.env.local`
- [ ] Both keys match exactly
- [ ] `.env.local` NOT in git
- [ ] All features tested and working
- [ ] No console errors
- [ ] Drive folder creation works

---

## 📞 Quick Help

**Can't login?**
- Check if API key is configured
- Restart dev server
- Clear browser cache

**Drive folder not created?**
- Check console for errors
- Verify API key in request
- Check Apps Script logs

**"Unauthorized" error?**
- Keys must match exactly
- No spaces or quotes in key
- Restart server after changes

---

## 🎯 What's Protected Now

✅ Spreadsheet write operations  
✅ Google Drive folder creation  
✅ User authentication  
✅ Schedule management  
✅ Equipment management  
✅ Article management  
✅ Equipment usage forms  

---

**Setup Time**: ~15 minutes  
**Security Level**: Production-ready  
**Last Updated**: May 12, 2026
