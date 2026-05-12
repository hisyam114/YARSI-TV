// Automatically configured with your YARSI-TV Google Sheet ID!
const SPREADSHEET_ID = "1ZXfS1FQJqBidwg4kuJ7ODQ4HkdUZhInJpmis3bDCDw4";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    // Handle folder creation for schedules
    if (action === 'createFolder') {
      return handleCreateFolder(data);
    }

    const sheetName = data.sheetName; // 'Users', 'Schedules', 'Master_Equipment', 'Articles', 'Data_Penggunaan_Alat'
    const record = data.record; // Object representing the row data
    const username = data.username; // Who performed the action
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
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: error.message})).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle Google Drive folder creation
function handleCreateFolder(data) {
  try {
    const folderName = data.folderName;
    const parentFolderId = data.parentFolderId;
    
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
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Allow browser CORS checks
function doOptions(e) {
  return ContentService.createTextOutput().setMimeType(ContentService.MimeType.JSON);
}