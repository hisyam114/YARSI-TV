# 🚀 Google Drive Integration - Quick Start Guide

## ⏱️ Time to Complete: 5-10 minutes

This is a **quick checklist** to get Google Drive folder creation working. Follow these steps in order.

---

## ✅ Checklist

### Step 1: Open Google Apps Script (2 minutes)
- [ ] Open your Google Spreadsheet: https://docs.google.com/spreadsheets/d/1ZXfS1FQJqBidwg4kuJ7ODQ4HkdUZhInJpmis3bDCDw4
- [ ] Click **Extensions** → **Apps Script**
- [ ] You should see your existing code in `Code.gs`

### Step 2: Update the Script Code (2 minutes)
Choose ONE option:

**Option A: Replace Everything (Easiest)**
- [ ] Select ALL code in `Code.gs` (Ctrl+A)
- [ ] Delete it
- [ ] Open `YARSI-TV-Google-Apps-Script.gs` from this project
- [ ] Copy ALL the code
- [ ] Paste into `Code.gs`
- [ ] Click **Save** (Ctrl+S)

**Option B: Add Only New Function (If you want to keep your code)**
- [ ] Find this line in your `doPost()` function: `const action = data.action;`
- [ ] Add this right after it:
  ```javascript
  if (action === 'createFolder') {
    return handleCreateFolder(data);
  }
  ```
- [ ] Scroll to the bottom of your script
- [ ] Add this complete function:
  ```javascript
  function handleCreateFolder(data) {
    try {
      const folderName = data.folderName;
      const parentFolderId = data.parentFolderId;
      const parentFolder = DriveApp.getFolderById(parentFolderId);
      const newFolder = parentFolder.createFolder(folderName);
      const folderLink = newFolder.getUrl();
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        folderLink: folderLink,
        folderId: newFolder.getId()
      })).setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: error.message
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  ```
- [ ] Click **Save** (Ctrl+S)

### Step 3: Add Drive Permissions (2 minutes) ⚠️ CRITICAL!
- [ ] Click **⚙️ Project Settings** (left sidebar)
- [ ] Scroll down and check ☑️ **"Show 'appsscript.json' manifest file in editor"**
- [ ] Click **Editor** (left sidebar)
- [ ] Click on `appsscript.json` file
- [ ] Replace ALL content with this:
  ```json
  {
    "timeZone": "Asia/Bangkok",
    "dependencies": {},
    "exceptionLogging": "STACKDRIVER",
    "runtimeVersion": "V8",
    "oauthScopes": [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file"
    ],
    "webapp": {
      "executeAs": "USER_DEPLOYING",
      "access": "ANYONE_ANONYMOUS"
    }
  }
  ```
- [ ] Click **Save** (Ctrl+S)

### Step 4: Reauthorize the Script (2 minutes)
- [ ] In Apps Script, click the **Run** button (▶️)
- [ ] A popup appears: **"Authorization required"**
- [ ] Click **Review Permissions**
- [ ] Select your Google account
- [ ] You may see: **"Google hasn't verified this app"**
  - [ ] Click **Advanced**
  - [ ] Click **Go to [Project Name] (unsafe)**
- [ ] Click **Allow**
- [ ] Wait for "Execution completed" message

### Step 5: Deploy (1 minute)
- [ ] Click **Deploy** → **Manage deployments**
- [ ] If you see an existing deployment:
  - [ ] Click **Edit** (✏️)
  - [ ] Click **Version**: New version
  - [ ] Click **Deploy**
  - [ ] Click **Done**
- [ ] If no deployment exists:
  - [ ] Click **New deployment**
  - [ ] Click ⚙️ next to "Select type"
  - [ ] Choose **Web app**
  - [ ] Set **Execute as**: Me
  - [ ] Set **Who has access**: Anyone
  - [ ] Click **Deploy**
  - [ ] Copy the URL (you already have this)
  - [ ] Click **Done**

---

## �� Test It (2 minutes)

### Test 1: Create a Schedule
1. Go to your YARSI TV admin dashboard
2. Click **"Tambah Jadwal"**
3. Fill in form with test program name: **"Test Drive Folder"**
4. Click **"SIMPAN JADWAL"**
5. Open browser console (F12)
6. Look for these logs:
   - ✅ `[Drive] Creating folder: Test Drive Folder`
   - ✅ `[Drive] SUCCESS - Folder created: [URL]`

### Test 2: Check Google Drive
1. Open: https://drive.google.com/drive/folders/1Mvm5sJvB3opXOQWSADkugminbC1oF8HK
2. You should see a new folder: **"Test Drive Folder"**

### Test 3: Check Spreadsheet
1. Open your Schedules sheet
2. Find the new schedule row
3. The `Drive_Link` column should have a URL

### Test 4: View in Dashboard
1. In admin dashboard, click the test schedule event
2. You should see a green **"Google Drive"** section
3. Click **"Open Folder in Google Drive →"** to verify

---

## 🐛 If Something Goes Wrong

### Error: "Permission denied" or "Anda tidak memiliki izin"
**Solution**: You skipped Step 3 or Step 4
- Go back to Step 3 and verify `appsscript.json` has Drive scopes
- Go back to Step 4 and run the script to reauthorize
- Grant Drive permissions when prompted

### No folder created, no error
**Solution**: Check browser console (F12)
- Look for error messages
- Verify script URL matches your deployment
- Try refreshing the page

### Drive_Link column is empty
**Solution**: 
- Check if `Drive_Link` column exists in Schedules sheet
- If not, add it manually as a new column header
- Column name must be exactly: `Drive_Link`

### Folder created but link not saved to spreadsheet
**Solution**:
- Check browser console for API errors
- Verify Schedules sheet has `Drive_Link` column
- Try creating another schedule

---

## ✨ What You Just Enabled

✅ Automatic folder creation when you create a schedule  
✅ Folder named after the program name  
✅ Folder link automatically saved to spreadsheet  
✅ Beautiful Drive link display in event details  
✅ One-click access to Google Drive folder  
✅ Schedule saves even if folder creation fails (fallback)  

---

## 📞 Need Help?

If you're stuck:
1. Check the **Troubleshooting** section in `GOOGLE_APPS_SCRIPT_SETUP.md`
2. Open Apps Script → **View** → **Logs** to see detailed errors
3. Verify all permissions are granted
4. Make sure you have access to the parent Drive folder

---

## 🎯 Next Steps

After this works:
- Create schedules normally - folders will be created automatically
- Share folders with team members as needed
- Use the Drive link to organize schedule-related files
- Consider adding subfolders for different content types

**You're all set! ��**
