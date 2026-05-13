import Papa from 'papaparse';
import { getCachedData, setCachedData, invalidateCache, CACHE_KEYS } from '../utils/cache';
import { getSession } from '../utils/auth';

// 🔐 Security: API Key from environment variables
const API_KEY = import.meta.env.VITE_API_KEY || '';

// �� Security: Script URL from environment variables
const SCRIPT_URL = import.meta.env.VITE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbw-E6Po3wQ-HGaPlTfucFwH3LX-t7kDSuk1DMK-M5YrOgTYJJbwB-It72J5cT6dNAXx/exec";

// 🔐 Security: Spreadsheet ID from environment
const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID || '1ZXfS1FQJqBidwg4kuJ7ODQ4HkdUZhInJpmis3bDCDw4';

// 🔐 Security: Drive parent folder from environment
const DRIVE_PARENT_FOLDER_ID = import.meta.env.VITE_DRIVE_PARENT_FOLDER_ID || '1Mvm5sJvB3opXOQWSADkugminbC1oF8HK';

// 🔓 PUBLIC CSV URLs - Only for public read (landing page, login)
// These sheets are intentionally public for functionality
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/export?format=csv&gid=0';
const USERS_CSV_URL = 'https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/gviz/tq?tqx=out:csv&sheet=Users';

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

/**
 * 🔐 SECURITY: Check if user is authenticated before making WRITE API calls
 * Public reads (schedule, users, blog) don't require auth
 * Writes (create/update/delete) require auth
 */
const requireAuth = (): boolean => {
  const session = getSession();
  if (!session) {
    console.error('[Security] Unauthorized: No valid session');
    return false;
  }
  return true;
};

/**
 * 🔐 SECURITY: Validate input data before sending to API
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
 * 🔐 Fetch schedule data - PUBLIC ACCESS (landing page needs this)
 * Uses public CSV for landing page display
 */
export const fetchScheduleData = async (): Promise<ScheduleItem[]> => {
  // Check cache first
  const cached = getCachedData<ScheduleItem[]>(CACHE_KEYS.SCHEDULE);
  if (cached) {
    console.log('[Cache] Using cached schedule data');
    return cached;
  }

  // 🔓 PUBLIC: Landing page needs to show schedules without login
  return new Promise((resolve, reject) => {
    Papa.parse(SHEET_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as ScheduleItem[];
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
 * 🔓 PUBLIC: Users data for login - must be accessible without session
 * Login needs to fetch users to verify credentials
 */
export const fetchUsersData = async (): Promise<UserItem[]> => {
  // Check cache first
  const cached = getCachedData<UserItem[]>(CACHE_KEYS.USERS);
  if (cached) {
    console.log('[Cache] Using cached users data');
    return cached;
  }

  // 🔓 PUBLIC: Login must work without being logged in
  return new Promise((resolve, reject) => {
    Papa.parse(USERS_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as UserItem[];
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
 * 🔐 REQUIRES AUTH: Admin only
 */
export const fetchEquipmentData = async (): Promise<EquipmentItem[]> => {
  // Check if user is authenticated
  if (!requireAuth()) {
    console.log('[Security] User not authenticated, returning empty equipment data');
    return [];
  }

  // Check cache first
  const cached = getCachedData<EquipmentItem[]>(CACHE_KEYS.EQUIPMENT);
  if (cached) {
    console.log('[Cache] Using cached equipment data');
    return cached;
  }

  return new Promise((resolve, reject) => {
    const EQUIPMENT_CSV_URL = 'https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/gviz/tq?tqx=out:csv&sheet=Master_Equipment';
    Papa.parse(EQUIPMENT_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as EquipmentItem[];
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
 * Fetch blog articles - public access for landing page
 */
export const fetchBlogData = async (): Promise<BlogArticle[]> => {
  // Always fetch fresh for blog
  const BLOG_CSV_URL = 'https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/gviz/tq?tqx=out:csv&sheet=Articles';
  return new Promise((resolve, reject) => {
    Papa.parse(BLOG_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as BlogArticle[];
        console.log('[Blog] Fetched', data.length, 'articles from spreadsheet');
        const filteredData = data.filter(item => item.Title || item.Article_ID);
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
 * Fetch equipment usage records
 * 🔐 REQUIRES AUTH: Admin only
 */
export const fetchEquipmentUsageData = async (): Promise<EquipmentUsageRecord[]> => {
  // Check if user is authenticated
  if (!requireAuth()) {
    console.log('[Security] User not authenticated, returning empty usage data');
    return [];
  }

  const EQUIPMENT_USAGE_CSV_URL = 'https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/gviz/tq?tqx=out:csv&sheet=Data_Penggunaan_Alat';
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

/**
 * Execute API call to update spreadsheet data
 * Automatically invalidates the relevant cache when data is updated
 * 🔐 Includes API key authentication and authorization
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

    // Check if user is authenticated
    if (!requireAuth()) {
      console.error('[Security] User not authenticated');
      return false;
    }

    const session = getSession();
    const username = session ? session.name : 'System';

    // 🔒 Security: Don't log request body with API key
    console.log(`[API] ${action} operation on ${sheetName} by ${username}`);

    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ 
        sheetName, 
        action, 
        record, 
        username,
        apiKey: API_KEY
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
 * 🔐 Includes API key authentication and authorization
 */
export const createGoogleDriveFolder = async (folderName: string): Promise<string | null> => {
  try {
    // Check if API key is configured
    if (!API_KEY) {
      console.error('[Security] API_KEY not configured. Set VITE_API_KEY in .env.local');
      return null;
    }

    // Check if user is authenticated
    if (!requireAuth()) {
      console.error('[Security] User not authenticated');
      return null;
    }

    // Validate folder name to prevent path traversal
    if (folderName.includes('..') || folderName.includes('/') || folderName.includes('\\\\')) {
      console.error('[Security] Invalid folder name detected');
      return null;
    }

    console.log('[Drive] Creating folder:', folderName);
    
    // 🔒 Security: Don't log API key or full request body
    console.log('[Drive] Sending request to:', SCRIPT_URL);
    
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ 
        action: "createFolder", 
        folderName: folderName,
        parentFolderId: DRIVE_PARENT_FOLDER_ID,
        apiKey: API_KEY
      }),
      headers: { "Content-Type": "text/plain;charset=utf-8" },
    });
    
    console.log('[Drive] Response status:', res.status);
    // 🔒 Security: Don't log response body to avoid exposing sensitive data
    
    const result = await res.json();

    if (result.status === 'success' && result.folderLink) {
      console.log('[Drive] SUCCESS - Folder created:', result.folderLink);
      return result.folderLink;
    } else {
      console.error('[Drive] FAILED - Result:', result.message);
      return null;
    }
  } catch (err) {
    console.error('[Drive] ERROR creating folder:', err);
    return null;
  }
};

/**
 * Create schedule with Google Drive folder integration
 */
export const createScheduleWithDriveFolder = async (scheduleData: ScheduleItem): Promise<boolean> => {
  try {
    // First create the Google Drive folder
    const folderLink = await createGoogleDriveFolder(scheduleData.Program_Name);
    
    if (folderLink) {
      const scheduleWithDrive = {
        ...scheduleData,
        Drive_Link: folderLink
      };
      
      const success = await executeApi('Schedules', 'create', scheduleWithDrive);
      return success;
    } else {
      console.warn('[Drive] Folder creation failed, saving schedule without Drive link');
      const success = await executeApi('Schedules', 'create', scheduleData);
      return success;
    }
  } catch (err) {
    console.error('[Drive] Error in createScheduleWithDriveFolder:', err);
    const success = await executeApi('Schedules', 'create', scheduleData);
    return success;
  }
};