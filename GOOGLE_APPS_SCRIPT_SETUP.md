# 🚀 Google Apps Script Setup for Google Drive Integration

## 📋 Overview
This guide will help you enable Google Drive folder creation when creating schedules in YARSI TV.

## ⚠️ IMPORTANT: You Must Complete These Steps!

The Google Drive integration is **already coded** in your frontend, but it won't work until you update your Google Apps Script with the proper permissions.

---

## 🔧 Step-by-Step Setup Instructions

### Step 1: Open Your Google Apps Script

1. Open your Google Spreadsheet: https://docs.google.com/spreadsheets/d/1ZXfS1FQJqBidwg4kuJ7ODQ4HkdUZhInJpmis3bDCDw4
2. Click **Extensions** → **Apps Script**
3. You should see your existing `Code.gs` file

### Step 2: Update the Script Code

**Option A: Replace Everything (Recommended)**

1. In the Apps Script editor, select **ALL** the code in `Code.gs`
2. Delete it
3. Copy **ALL** the code from `YARSI-TV-Google-Apps-Script.gs` (in this project folder)
4. Paste it into `Code.gs`
5. Click **Save** (💾 icon or Ctrl+S)

**Option B: Add Only the New Function**

If you prefer to keep your current script and just add the folder creation:

1. Find this line in your `doPost()` function:
   ```javascript
   const action = data.action;
   ```

2. Right after that line, add:
   ```javascript
   // Handle folder creation for schedules
   if (action === 'createFolder') {
     return handleCreateFolder(data);
   }
   ```

3. At the bottom of your script, add this complete function:
   ```javascript
   // Handle Google Drive folder creation
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

4. Click **Save** (💾 icon or Ctrl+S)

### Step 3: Add Google Drive Permissions (CRITICAL!)

This is the most important step - without this, you'll get permission errors!

1. In Apps Script editor, click **⚙️ Project Settings** (left sidebar)
2. Scroll down and check ☑️ **"Show 'appsscript.json' manifest file in editor"**
3. Go back to **Editor** (left sidebar)
4. You should now see `appsscript.json` file in the file list
5. Click on `appsscript.json`
6. Replace its content with this:

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

7. Click **Save** (💾 icon)

### Step 4: Reauthorize the Script

After adding Drive permissions, you need to grant access:

1. In the Apps Script editor, select any function from the dropdown (e.g., `doPost`)
2. Click **Run** (▶️ button)
3. A popup will appear: **"Authorization required"**
4. Click **Review Permissions**
5. Choose your Google account
6. You may see a warning: **"Google hasn't verified this app"**
   - Click **Advanced**
   - Click **Go to [Your Project Name] (unsafe)**
7. Click **Allow** to grant permissions
8. You should see "Execution completed" in the console

### Step 5: Deploy (If Needed)

If you haven't deployed yet, or need to redeploy:

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure:
   - **Description**: "YARSI TV with Drive Integration"
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
5. Click **Deploy**
6. Copy the **Web app URL** (you already have this in your frontend)
7. Click **Done**

If you already have a deployment:

1. Click **Deploy** → **Manage deployments**
2. Click **Edit** (✏️) on your current deployment
3. Click **Version**: New version
4. Click **Deploy**
5. Click **Done**

---

## ✅ Testing the Integration

### Test 1: Create a Schedule

1. Go to your YARSI TV admin dashboard
2. Click **"Tambah Jadwal"**
3. Fill in the form with a test program name (e.g., "Test Program Drive")
4. Click **"SIMPAN JADWAL"**
5. Check the browser console (F12) for logs:
   - Should see: `[Drive] Creating folder: Test Program Drive`
   - Should see: `[Drive] SUCCESS - Folder created: [URL]`

### Test 2: Check Google Drive

1. Open your Google Drive folder: https://drive.google.com/drive/folders/1Mvm5sJvB3opXOQWSADkugminbC1oF8HK
2. You should see a new folder named "Test Program Drive"

### Test 3: Check Spreadsheet

1. Open your Schedules sheet
2. Find the new schedule row
3. The `Drive_Link` column should contain the Google Drive folder URL

### Test 4: View in Dashboard

1. In admin dashboard, click on the test schedule event
2. The modal should show a green "Google Drive" section
3. Click **"Open Folder in Google Drive →"** to verify the link works

---

## 🐛 Troubleshooting

### Error: "Anda tidak memiliki izin untuk memanggil DriveApp.getFolderById"

**Solution**: You didn't complete Step 3 and Step 4 properly.
- Make sure `appsscript.json` includes the Drive scopes
- Run the script manually to reauthorize
- Grant Drive permissions when prompted

### Error: "Permission denied"

**Solution**: 
- Ensure deployment is set to "Anyone" access
- Verify you have access to the parent folder (1Mvm5sJvB3opXOQWSADkugminbC1oF8HK)
- Try opening the folder manually in your browser

### No folder created, but no error

**Solution**:
- Check browser console (F12) for detailed logs
- Verify the script URL in `googleSheets.ts` matches your deployment URL
- Make sure you deployed a new version after making changes

### Drive_Link column is empty

**Solution**:
- Check if the `Drive_Link` column exists in your Schedules sheet
- If not, add it manually as a new column header
- The column name must be exactly: `Drive_Link`

### Folder created but link not saved

**Solution**:
- Check browser console for API errors
- Verify the Schedules sheet has a `Drive_Link` column
- Try refreshing the page and checking again

---

## 📝 Important Notes

### Parent Folder
- All schedule folders will be created inside: https://drive.google.com/drive/folders/1Mvm5sJvB3opXOQWSADkugminbC1oF8HK
- Make sure you have edit access to this folder
- To change the parent folder, update `parentFolderId` in `googleSheets.ts`

### Folder Naming
- Folders are named exactly as the Program Name in the schedule
- If you create multiple schedules with the same name, multiple folders will be created
- Consider adding dates or IDs to program names for uniqueness

### Fallback Behavior
- If folder creation fails, the schedule will still be saved
- The `Drive_Link` field will be empty
- You can manually create the folder and add the link later

---

## �� What Happens When You Create a Schedule

1. User fills schedule form and clicks "SIMPAN JADWAL"
2. Frontend calls `createScheduleWithDriveFolder()`
3. Function sends request to Google Apps Script: `action: "createFolder"`
4. Apps Script creates folder in Google Drive
5. Apps Script returns folder URL
6. Frontend saves schedule with `Drive_Link` populated
7. Success message shown to user
8. Admin can click event to see Drive link in modal

---

## ✨ Features Included

✅ Auto folder creation when schedule is created  
✅ Folder named after the program name  
✅ Folder link saved to spreadsheet automatically  
✅ Beautiful Drive Link display in event details modal  
✅ One-click access to Google Drive folder  
✅ Fallback: Schedule saves even if folder creation fails  
✅ Uses same script URL - no frontend changes needed  
✅ Compatible with all existing functionality  

---

## 🆘 Still Having Issues?

If you're still experiencing problems after following all steps:

1. Check the browser console (F12) for detailed error messages
2. Check the Apps Script execution logs (View → Logs)
3. Verify all permissions are granted
4. Try creating a simple test folder manually using DriveApp in Apps Script
5. Make sure your Google account has access to both the spreadsheet and the Drive folder

## How It Works

### When Creating a Schedule:
1. Admin fills the schedule form and clicks "SIMPAN JADWAL"
2. The `createScheduleWithDriveFolder()` function is called
3. Frontend sends a request to create a folder named after the program
4. Google Apps Script creates the folder in your Drive
5. Folder link is returned to frontend
6. Schedule is saved with the `Drive_Link` column populated
7. Success message shown to user

### When Viewing Schedule Details:
1. Admin clicks on a schedule event in the dashboard
2. Modal opens showing event details
3. Google Drive section appears in a beautiful green gradient card
4. Click "Open Folder in Google Drive →" to access the folder

## Parent Folder Configuration

The folder will be created in: `https://drive.google.com/drive/folders/1Mvm5sJvB3opXOQWSADkugminbC1oF8HK`

This is configured in the frontend code:
```typescript
const parentFolderId = "1Mvm5sJvB3opXOQWSADkugminbC1oF8HK"
```

## Features Implemented

✅ Auto folder creation when schedule is created
✅ Folder named after the program name
✅ Folder link saved to spreadsheet automatically
✅ Beautiful Drive Link display in event details
✅ One-click access to Google Drive folder
✅ Fallback: Schedule saves even if folder creation fails
✅ Uses same script URL - no frontend changes needed
✅ Compatible with existing functionality

## Troubleshooting

### Error: "Permission denied"
- Ensure the script is deployed with "Anyone" access
- Check that you have access to the parent folder
- Verify the `parentFolderId` is correct

### Error: "Folder not found"
- Make sure `1Mvm5sJvB3opXOQWSADkugminbC1oF8HK` is a valid folder ID
- Verify you can access the folder manually

### Folder not showing in dashboard
- Check browser console for errors
- Verify the `Drive_Link` column exists in your Schedules sheet
- Make sure the spreadsheet has been refreshed

## Testing

1. Create a new schedule with any program name
2. Check your Google Drive - a new folder should appear
3. Check the Schedules sheet - `Drive_Link` column should have the URL
4. Click on the schedule in dashboard - Drive section should appear
