// 🔒 SECURE VERSION - YARSI TV Google Apps Script with API Key Authentication
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
 * Simple rate limiting - max 20 requests per minute per IP
 * @param {string} ip - User IP address
 * @returns {boolean} - True if allowed
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 20; // Increased for normal usage
  
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
    if (!data[field]) {
      return null;
    }
  }
  
  // Sanitize string inputs (basic XSS prevention)
  const sanitized = JSON.parse(JSON.stringify(data)); // Deep clone
  if (sanitized.record && typeof sanitized.record === 'object') {
    for (const key in sanitized.record) {
      if (typeof sanitized.record[key] === 'string') {
        // Remove potentially dangerous characters but keep normal punctuation
        sanitized.record[key] = sanitized.record[key]
          .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
          .replace(/<[^>]+>/g, '') // Remove HTML tags
          .substring(0, 1000); // Limit length
      }
    }
  }
  
  return sanitized;
}

function doPost(e) {
  try {
    // Get client IP (approximation)
    const ip = e.parameter?.ip_override || 'unknown';
    
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
      console.error("Unauthorized access attempt from IP:", ip);
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
    
    // Check if folder already exists
    const existingFolders = parentFolder.getFoldersByName(folderName);
    if (existingFolders.hasNext()) {
      // Folder already exists, return existing folder
      const existingFolder = existingFolders.next();
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        folderLink: existingFolder.getUrl(),
        folderId: existingFolder.getId(),
        message: "Folder already exists"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
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

// Allow browser CORS checks
function doOptions(e) {
  return ContentService.createTextOutput().setMimeType(ContentService.MimeType.JSON);
}
