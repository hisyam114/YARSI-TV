import Papa from 'papaparse';
import { getCachedData, setCachedData, invalidateCache, CACHE_KEYS } from '../utils/cache';

// 🔐 Security: API Key from environment variables
const API_KEY = import.meta.env.VITE_API_KEY || '';

export interface ScheduleItem {
  Schedule_ID: string;
  Program_Name: string;
  Date: string;
  DayName?: string;
  Start_Time: string;
  End_Time: string;
  Location: string;
  PIC: string;
  Status: string;
  Drive_Link?: string;
}

export interface UserItem {
  Username: string;
  Password?: string;
  Role: string;
  Name: string;
}

export interface EquipmentItem {
  Equipment_ID: string;
  Category: string;
  Item_Name: string;
  Condition: string;
  Bought_Date: string;
  Notes: string;
}

export interface BlogArticle {
  Article_ID: string;
  Title: string;
  Category: string;
  Author: string;
  Published_Date: string;
  Summary: string;
  Content: string;
  Image_URL: string;
  Read_Time: string;
}

export interface EquipmentUsageRecord {
  ID?: string;
  NOMOR_SURAT: string;
  NAMA_PIC: string;
  TANGGAL: string;
  KEGIATAN: string;
  NAMA_KEGIATAN: string;
  DETAIL_ALAT: string;
  CREATED_AT?: string;
}

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1ZXfS1FQJqBidwg4kuJ7ODQ4HkdUZhInJpmis3bDCDw4/export?format=csv&gid=0';
const USERS_CSV_URL = 'https://docs.google.com/spreadsheets/d/1ZXfS1FQJqBidwg4kuJ7ODQ4HkdUZhInJpmis3bDCDw4/gviz/tq?tqx=out:csv&sheet=Users';
const EQUIPMENT_CSV_URL = 'https://docs.google.com/spreadsheets/d/1ZXfS1FQJqBidwg4kuJ7ODQ4HkdUZhInJpmis3bDCDw4/gviz/tq?tqx=out:csv&sheet=Master_Equipment';
const BLOG_CSV_URL = 'https://docs.google.com/spreadsheets/d/1ZXfS1FQJqBidwg4kuJ7ODQ4HkdUZhInJpmis3bDCDw4/gviz/tq?tqx=out:csv&sheet=Articles';
const EQUIPMENT_USAGE_CSV_URL = 'https://docs.google.com/spreadsheets/d/1ZXfS1FQJqBidwg4kuJ7ODQ4HkdUZhInJpmis3bDCDw4/gviz/tq?tqx=out:csv&sheet=Data_Penggunaan_Alat';

/**
 * Fetch schedule data with caching
 * Returns cached data if available, otherwise fetches from Google Sheets
 */
export const fetchScheduleData = async (): Promise<ScheduleItem[]> => {
  // Check cache first
  const cached = getCachedData<ScheduleItem[]>(CACHE_KEYS.SCHEDULE);
  if (cached) {
    console.log('[Cache] Using cached schedule data');
    return cached;
  }

  return new Promise((resolve, reject) => {
    Papa.parse(SHEET_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as ScheduleItem[];
        // Cache the fetched data
        setCachedData(CACHE_KEYS.SCHEDULE, data);
        console.log('[Cache] Cached schedule data');
        resolve(data);
      },
      error: (error: Error) => {
        console.error("Error fetching Google Sheets data:", error);
        reject(error);
      }
    });
  });
};

/**
 * Fetch users data with caching
 */
export const fetchUsersData = async (): Promise<UserItem[]> => {
  // Check cache first
  const cached = getCachedData<UserItem[]>(CACHE_KEYS.USERS);
  if (cached) {
    console.log('[Cache] Using cached users data');
    return cached;
  }

  return new Promise((resolve, reject) => {
    Papa.parse(USERS_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as UserItem[];
        // Cache the fetched data
        setCachedData(CACHE_KEYS.USERS, data);
        console.log('[Cache] Cached users data');
        resolve(data);
      },
      error: (error: Error) => {
        console.error("Error fetching Users data:", error);
        reject(error);
      }
    });
  });
};

/**
 * Fetch equipment data with caching
 */
export const fetchEquipmentData = async (): Promise<EquipmentItem[]> => {
  // Check cache first
  const cached = getCachedData<EquipmentItem[]>(CACHE_KEYS.EQUIPMENT);
  if (cached) {
    console.log('[Cache] Using cached equipment data');
    return cached;
  }

  return new Promise((resolve, reject) => {
    Papa.parse(EQUIPMENT_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as EquipmentItem[];
        // Cache the fetched data
        setCachedData(CACHE_KEYS.EQUIPMENT, data);
        console.log('[Cache] Cached equipment data');
        resolve(data);
      },
      error: (error: Error) => {
        console.error("Error fetching Equipment data:", error);
        reject(error);
      }
    });
  });
};

/**
 * Fetch blog articles - always fetches fresh data (no caching)
 * This ensures we always get the latest articles from the spreadsheet
 */
export const fetchBlogData = async (): Promise<BlogArticle[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(BLOG_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as BlogArticle[];
        console.log('[Blog] Raw data from spreadsheet:', results.data);
        console.log('[Blog] Column headers:', results.meta?.fields);
        console.log('[Blog] Fetched', data.length, 'articles from spreadsheet');
        
        // Filter out empty rows
        const filteredData = data.filter(item => item.Title || item.Article_ID);
        console.log('[Blog] After filtering:', filteredData.length, 'articles');
        
        resolve(filteredData);
      },
      error: (error: Error) => {
        console.error("Error fetching Blog data:", error);
        reject(error);
      }
    });
  });
};

/**
 * Fetch equipment usage records from Data_Penggunaan_Alat sheet
 */
export const fetchEquipmentUsageData = async (): Promise<EquipmentUsageRecord[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(EQUIPMENT_USAGE_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as EquipmentUsageRecord[];
        console.log('[Equipment Usage] Fetched', data.length, 'records from spreadsheet');
        resolve(data);
      },
      error: (error: Error) => {
        console.error("Error fetching Equipment Usage data:", error);
        reject(error);
      }
    });
  });
};

const SCRIPT_URL = import.meta.env.VITE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbw-E6Po3wQ-HGaPlTfucFwH3LX-t7kDSuk1DMK-M5YrOgTYJJbwB-It72J5cT6dNAXx/exec";

/**
 * Validate input data before sending to API
 * Prevents XSS and injection attacks
 */
const validateApiInput = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  
  // Check for suspicious patterns
  const suspiciousPatterns = /<script|javascript:|onerror|onclick/gi;
  const dataStr = JSON.stringify(data);
  
  if (suspiciousPatterns.test(dataStr)) {
    console.warn('[Security] Suspicious input detected');
    return false;
  }
  
  return true;
};

/**
 * Execute API call to update spreadsheet data
 * Automatically invalidates the relevant cache when data is updated
 * 🔐 Includes API key authentication
 */
export const executeApi = async (sheetName: string, action: string, record: any) => {
  try {
    // Validate input
    if (!validateApiInput({ sheetName, action, record })) {
      console.error('API validation failed');
      return false;
    }

    // Check if API key is configured
    if (!API_KEY) {
      console.error('[Security] API_KEY not configured. Set VITE_API_KEY in .env.local');
      return false;
    }

    const session = localStorage.getItem('yarsi_user');
    const username = session ? JSON.parse(session).name : 'System';

    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ 
        sheetName, 
        action, 
        record, 
        username,
        apiKey: API_KEY // 🔐 Add API key to request
      }),
      headers: { "Content-Type": "text/plain;charset=utf-8" },
    });
    const result = await res.json();

    // If the operation was successful and it's a write operation (create/update/delete),
    // invalidate the cache so next fetch gets fresh data
    if (result.status === 'success' && ['create', 'update', 'delete'].includes(action.toLowerCase())) {
      invalidateCache();
      console.log('[Cache] Invalidated due to spreadsheet update:', sheetName, action);
    }

    return result.status === 'success';
  } catch (err) {
    console.error(`API Error on ${sheetName} [${action}]`, err);
    return false;
  }
};

/**
 * Create a folder in Google Drive and return the folder link
 * This requires a Google Apps Script endpoint that handles the folder creation
 * 🔐 Includes API key authentication and input validation
 */
export const createGoogleDriveFolder = async (folderName: string): Promise<string | null> => {
  try {
    // Check if API key is configured
    if (!API_KEY) {
      console.error('[Security] API_KEY not configured. Set VITE_API_KEY in .env.local');
      return null;
    }

    // Validate folder name to prevent path traversal
    if (folderName.includes('..') || folderName.includes('/') || folderName.includes('\\')) {
      console.error('[Security] Invalid folder name detected');
      return null;
    }

    console.log('[Drive] Creating folder:', folderName);
    
    // The Google Apps Script URL for creating folders
    const DRIVE_SCRIPT_URL = import.meta.env.VITE_SCRIPT_URL || SCRIPT_URL;
    
    console.log('[Drive] Sending request to:', DRIVE_SCRIPT_URL);
    console.log('[Drive] Request body:', JSON.stringify({ 
      action: "createFolder", 
      folderName: folderName,
      parentFolderId: "1Mvm5sJvB3opXOQWSADkugminbC1oF8HK",
      apiKey: API_KEY // 🔐 Add API key
    }));
    
    const res = await fetch(DRIVE_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ 
        action: "createFolder", 
        folderName: folderName,
        parentFolderId: "1Mvm5sJvB3opXOQWSADkugminbC1oF8HK",
        apiKey: API_KEY // �� Add API key
      }),
      headers: { "Content-Type": "text/plain;charset=utf-8" },
    });
    
    console.log('[Drive] Response status:', res.status);
    console.log('[Drive] Response headers:', res.headers);
    
    const result = await res.json();
    console.log('[Drive] Response result:', JSON.stringify(result));

    if (result.status === 'success' && result.folderLink) {
      console.log('[Drive] SUCCESS - Folder created:', result.folderLink);
      return result.folderLink;
    } else {
      console.error('[Drive] FAILED - Result:', result);
      return null;
    }
  } catch (err) {
    console.error('[Drive] ERROR creating folder:', err);
    console.error('[Drive] Error details:', err);
    return null;
  }
};

/**
 * Create schedule with Google Drive folder integration
 * Creates folder in Drive and saves schedule with the folder link
 */
export const createScheduleWithDriveFolder = async (scheduleData: ScheduleItem): Promise<boolean> => {
  try {
    // First create the Google Drive folder
    const folderLink = await createGoogleDriveFolder(scheduleData.Program_Name);
    
    if (folderLink) {
      // Add the drive link to the schedule data
      const scheduleWithDrive = {
        ...scheduleData,
        Drive_Link: folderLink
      };
      
      // Save to spreadsheet
      const success = await executeApi('Schedules', 'create', scheduleWithDrive);
      return success;
    } else {
      // If folder creation fails, still save the schedule without the link
      console.warn('[Drive] Folder creation failed, saving schedule without Drive link');
      const success = await executeApi('Schedules', 'create', scheduleData);
      return success;
    }
  } catch (err) {
    console.error('[Drive] Error in createScheduleWithDriveFolder:', err);
    // Fallback to regular schedule creation
    const success = await executeApi('Schedules', 'create', scheduleData);
    return success;
  }
};

