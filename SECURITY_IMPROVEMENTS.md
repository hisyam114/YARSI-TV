# 🔒 Security Improvements for YARSI TV Project

## Current Security Status
- ✅ Password hashing with bcryptjs implemented
- ✅ Session management with timeout
- ✅ Role-based access control (Manager-only features)
- ✅ Google Drive integration working
- ❌ Exposed Google Apps Script URL in frontend
- ❌ No API key authentication
- ❌ No input validation/sanitization
- ❌ No rate limiting

## 🛡️ Recommended Security Enhancements

### 1. API Key Authentication for Google Apps Script
**Problem**: Anyone with the script URL can send data to your spreadsheet
**Solution**: Add API key verification to all requests

### 2. Environment Variables for Sensitive Data
**Problem**: Spreadsheet ID and other configs hardcoded
**Solution**: Use Properties Service for secure storage

### 3. Input Validation & Sanitization
**Problem**: No validation of incoming data
**Solution**: Validate all inputs before processing

### 4. Rate Limiting
**Problem**: No protection against abuse
**Solution**: Implement simple rate limiting

### 5. CORS Restrictions
**Problem**: Currently allows any origin
**Solution**: Restrict to your domain only

---

## 🔧 Implementation Guide

### Step 1: Update Google Apps Script with API Key Auth

Replace your `YARSI-TV-Google-Apps-Script.gs` with this enhanced version:

```javascript
// Automatically configured with your YARSI-TV Google Sheet ID!
const SPREADSHEET_ID = "1ZXfS1FQJqBidwg4kuJ7ODQ4HkdUZhInJpmis3bDCDw4";

// 🔑 API KEY - SET THIS IN PROJECT PROPERTIES!
// Go to Apps Script → Project Settings → Script Properties
// Add: API_KEY = [your-secure-random-string]
const API_KEY = PropertiesService.getScriptProperties().getProperty('API_KEY') || 'default-change-me';

// Rate limiting storage (in-memory, resets on script restart)
const requestLog = {};

/**
 * Verify API key from request
 * @param {Object} data - Request data
 * @returns {boolean} - True if valid
 */
function verifyAPIKey(data) {
  const providedKey = data?.apiKey || '';
  return providedKey === API_KEY;
}

/**
 * Simple rate limiting - max 10 requests per minute per IP
 * @param {string} ip - User IP address
 * @returns {boolean} - True if allowed
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10;
  
  if (!requestLog[ip]) {
    requestLog[ip] = [];
  }
  
  // Remove old requests outside the window
  requestLog[ip] = requestLog[ip].filter(timestamp => now - timestamp < windowMs);
  
  // Check if under limit
  if (requestLog[ip].length >= maxRequests) {
    return false;
  }
  
  // Add current request
  requestLog[ip].push(now);
  return true;
}

/**
 * Validate and sanitize input data
 * @param {Object} data - Raw input data
 * @returns {Object|null} - Sanitized data or null if invalid
 */
function validateInput(data) {
  if (!data || typeof data !== 'object') return null;
  
  // Required fields based on action
  const requiredFields = {
    createFolder: ['folderName', 'parentFolderId'],
    create: ['sheetName', 'record'],
    update: ['sheetName', 'record'],
    delete: ['sheetName', 'record']
  };
  
  const action = data.action;
  if (!action || !requiredFields[action]) return null;
  
  // Check required fields
  for (const field of requiredFields[action]) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      return null;
    }
  }
  
  // Sanitize string inputs
  const sanitized = { ...data };
  if (sanitized.record && typeof sanitized.record === 'object') {
    for (const key in sanitized.record) {
      if (typeof sanitized.record[key] === 'string') {
        // Remove potentially dangerous characters
        sanitized.record[key] = sanitized.record[key]
          .replace(/[<>{}]/g, '') // Remove HTML/XML tags
          .replace(/['"]/g, '');   // Remove quotes
      }
    }
  }
  
  return sanitized;
}

function doPost(e) {
  try {
    // Get client IP (approximation)
    const ip = e.parameter.ip_override || 
               e.context.ipAddress || 
               'unknown';
    
    // Rate limiting
    if (!checkRateLimit(ip)) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Rate limit exceeded. Please try again later."
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Parse and verify request
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Invalid JSON format"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Verify API key
    if (!verifyAPIKey(data)) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Unauthorized: Invalid or missing API key"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Validate and sanitize input
    const validatedData = validateInput(data);
    if (!validatedData) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Invalid or missing required parameters"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Use validated data from now on
    const action = validatedData.action;
    
    // Handle folder creation for schedules
    if (action === 'createFolder') {
      return handleCreateFolder(validatedData);
    }

    const sheetName = validatedData.sheetName;
    const record = validatedData.record;
    const username = validatedData.username || 'System';
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const targetSheet = spreadsheet.getSheetByName(sheetName);
    if (!targetSheet) throw new Error("Sheet not found: " + sheetName);
    
    // Log Activity automatically
    const logSheet = spreadsheet.getSheetByName("Activity_Log");
    if (logSheet) {
      const logId = "LOG-" + new Date().getTime();
      const timestamp = new Date().toISOString();
      const details = `${action.toUpperCase()} on ${sheetName}: ` + JSON.stringify(record);
      logSheet.appendRow([logId, timestamp, username, action, details]);
    }
    
    // Map JSON object to array based on the sheet's actual headers
    const headers = targetSheet.getRange(1, 1, 1, targetSheet.getLastColumn()).getValues()[0];
    if (action === 'create') {
      const rowData = headers.map(header => record[header] || "");
      targetSheet.appendRow(rowData);
      return ContentService.createTextOutput(JSON.stringify({status: "success"})).setMimeType(ContentService.MimeType.JSON);
    }
    
    // For Update & Delete, determine Primary Key Column dynamically
    let primaryKeyColIndex = -1;
    let primaryKeyValue = null;
    if (sheetName === 'Users') {
      primaryKeyColIndex = headers.indexOf('Username');
      primaryKeyValue = record['Username'];
    } else if (sheetName === 'Schedules') {
      primaryKeyColIndex = headers.indexOf('Schedule_ID');
      primaryKeyValue = record['Schedule_ID'];
    } else if (sheetName === 'Master_Equipment') {
      primaryKeyColIndex = headers.indexOf('Equipment_ID');
      primaryKeyValue = record['Equipment_ID'];
    } else if (sheetName === 'Articles') {
      primaryKeyColIndex = headers.indexOf('Article_ID');
      primaryKeyValue = record['Article_ID'];
    } else if (sheetName === 'Data_Penggunaan_Alat') {
      // For equipment usage records, we'll auto-generate an ID if not provided
      primaryKeyColIndex = -1; // No primary key needed for inserts
    }
    
    if (primaryKeyColIndex !== -1 && !primaryKeyValue) {
      throw new Error("Could not determine primary key for " + sheetName);
    }
    
    const dataRange = targetSheet.getDataRange();
    const values = dataRange.getValues();
    
    // Loop to find the row to update/delete
    for (let i = 1; i < values.length; i++) {
      if (primaryKeyColIndex !== -1 && values[i][primaryKeyColIndex] === primaryKeyValue) {
        if (action === 'delete') {
          targetSheet.deleteRow(i + 1);
        } else if (action === 'update') {
          // Update columns dynamically
          for (let col = 0; col < headers.length; col++) {
            if (record[headers[col]] !== undefined) {
              targetSheet.getRange(i + 1, col + 1).setValue(record[headers[col]]);
            }
          }
        }
        return ContentService.createTextOutput(JSON.stringify({status: "success"})).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    throw new Error("Record not found for update/delete: " + primaryKeyValue);
  } catch (error) {
    // Log error for debugging (but don't expose details to client)
    console.error("API Error:", error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "An error occurred processing your request"
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle Google Drive folder creation
function handleCreateFolder(data) {
  try {
    const folderName = data.folderName;
    const parentFolderId = data.parentFolderId;
    
    // Validate folder name (prevent path traversal)
    if (folderName.includes('..') || folderName.includes('/') || folderName.includes('\\')) {
      throw new Error("Invalid folder name");
    }
    
    // Limit folder name length
    if (folderName.length > 100) {
      throw new Error("Folder name too long (max 100 characters)");
    }
    
    // Get the parent folder
    const parentFolder = DriveApp.getFolderById(parentFolderId);
    
    // Create a new folder with the program name
    const newFolder = parentFolder.createFolder(folderName);
    
    // Get the folder link
    const folderLink = newFolder.getUrl();
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      folderLink: folderLink,
      folderId: newFolder.getId()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Log error for debugging
    console.error("Folder creation error:", error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Failed to create folder"
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Allow browser CORS checks with restrictions
function doOptions(e) {
  // Optional: Restrict to specific origins
  // const allowedOrigins = ['https://your-domain.com'];
  // const origin = e.parameters.origin || '';
  // if (!allowedOrigins.includes(origin)) {
  //   return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.JSON);
  // }
  
  return ContentService.createTextOutput().setMimeType(ContentService.MimeType.JSON);
}
```

### Step 2: Set Up API Key in Google Apps Script

1. In Apps Script editor, go to **Project Settings** (⚙️)
2. Click **Script Properties**
3. Add a new property:
   - **Key**: `API_KEY`
   - **Value**: Generate a secure random string (32+ characters)
   - Example: `a1B2c3D4e5F6g7H8i9J0kLmNoPqRsTuVwXyZ123456`
4. Click **Save**

### Step 3: Update Frontend to Send API Key

Update your `src/services/googleSheets.ts` to include the API key in all requests:

```typescript
// Add this near the top of the file
const API_KEY = "your-generated-api-key-here"; // Match what you set in Apps Script

// Then modify executeApi function:
export const executeApi = async (sheetName: string, action: string, record: any) => {
  try {
    const session = localStorage.getItem('yarsi_user');
    const username = session ? JSON.parse(session).name : 'System';

    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ 
        sheetName, 
        action, 
        record, 
        username,
        apiKey: API_KEY // Add API key here
      }),
      headers: { "Content-Type": "text/plain;charset=utf-8" },
    });
    // ... rest remains the same
};

// And modify createGoogleDriveFolder function:
export const createGoogleDriveFolder = async (folderName: string): Promise<string | null> => {
  try {
    // ... existing code ...
    
    const res = await fetch(DRIVE_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ 
        action: "createFolder", 
        folderName: folderName,
        parentFolderId: "1Mvm5sJvB3opXOQWSADkugminbC1oF8HK",
        apiKey: API_KEY // Add API key here
      }),
      headers: { "Content-Type": "text/plain;charset=utf-8" },
    });
    // ... rest remains the same
};
```

### Step 4: Additional Security Measures

#### A. Environment Variables for Config
Instead of hardcoding the spreadsheet ID, store it in Script Properties too:
- Add Property: `SPREADSHEET_ID` = your actual ID
- Then in code: `const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');`

#### B. Input Validation on Frontend
Add validation before sending data:
```typescript
// In your form handlers, add validation
const validateScheduleData = (data: ScheduleItem): boolean => {
  if (!data.Program_Name || data.Program_Name.trim() === '') return false;
  if (!data.Date || !/^\d{4}-\d{2}-\d{2}$/.test(data.Date)) return false;
  // Add more validations as needed
  return true;
};
```

#### C. Content Security Policy
Consider adding security headers if you ever move to a traditional backend.

#### D. Regular Key Rotation
Change your API key periodically (every 3-6 months).

---

## 📋 Implementation Checklist

### Phase 1: Backend Security (Apps Script)
- [ ] Replace Google Apps Script with enhanced version above
- [ ] Generate and set API key in Script Properties
- [ ] (Optional) Move SPREADSHEET_ID to Script Properties
- [ ] Save and deploy new version

### Phase 2: Frontend Updates
- [ ] Add API_KEY constant to googleSheets.ts
- [ ] Add apiKey field to all executeApi calls
- [ ] Add apiKey field to createGoogleDriveFolder calls
- [ ] Add input validation to form handlers
- [ ] Test all functionality still works

### Phase 3: Testing
- [ ] Test schedule creation still works
- [ ] Test Google Drive folder creation
- [ ] Test error handling (invalid API key)
- [ ] Test rate limiting (if possible to test)
- [ ] Verify no sensitive data exposed in errors

### Phase 4: Monitoring
- [ ] Check Apps Script logs periodically
- [ ] Monitor for error rates
- [ ] Consider adding usage logging to spreadsheet

---

## 🔐 Generated API Key Example

Run this in your browser console to generate a secure key:
```javascript
// Generate a secure random API key
const generateAPIKey = () => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

console.log('Your API Key:', generateAPIKey());
// Example output: "a3f5c8e2b1d4f6a7c9b0e1d2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3"
```

**Important**: Save this key securely! You'll need it for both Apps Script Properties and your frontend.

---

## ⚠️ Important Notes

1. **Never commit your API key to git** - it should be different per deployment
2. **Use different keys for different environments** (dev/staging/production)
3. **The rate limiting is basic** - for production, consider a proper backend
4. **Error messages are generic** - don't expose internal details to users
5. **Test thoroughly** after implementing - make sure nothing breaks

---

## 🎯 Next Steps After This

1. **Regular Security Audits** - Check logs monthly
2. **Consider a Proper Backend** - For production, use Node.js/Express/MongoDB
3. **Add HTTPS Everywhere** - Already done since Google Apps Script uses HTTPS
4. **Backup Strategy** - Regularly export your spreadsheet
5. **User Education** - Train admins on security best practices

---

**Your Google Drive integration is already working - these steps will make it much more secure!** 🔒

Would you like me to help you implement any specific part of these security improvements?