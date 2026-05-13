import { getCachedData, setCachedData, invalidateCache, CACHE_KEYS } from '../utils/cache';
import { getSession } from '../utils/auth';

// 🔐 Security: API Key from environment variables
const API_KEY = import.meta.env.VITE_API_KEY || '';

// 🔐 Security: Script URL from environment variables
const SCRIPT_URL = import.meta.env.VITE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbw-E6Po3wQ-HGaPlTfucFwH3LX-t7kDSuk1DMK-M5YrOgTYJJbwB-It72J5cT6dNAXx/exec";

// 🔐 Security: Drive parent folder from environment
const DRIVE_PARENT_FOLDER_ID = import.meta.env.VITE_DRIVE_PARENT_FOLDER_ID || '1Mvm5sJvB3opXOQWSADkugminbC1oF8HK';

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
 * 🔐 SECURITY: Check if user is authenticated before making API calls
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
 * 🔐 SECURITY FIX: Fetch data from Google Apps Script API with authorization
 * All read operations now go through authenticated API instead of public CSV URLs
 */
const fetchFromAPI = async (sheetName: string): Promise<any[]> => {
  try {
    // Check if API key is configured
    if (!API_KEY) {
      console.error('[Security] API_KEY not configured. Set VITE_API_KEY in .env.local');
      return [];
    }

    // Check if user is authenticated
    if (!requireAuth()) {
      return [];
    }

    console.log(`[API] Fetching ${sheetName} via authenticated API`);

    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ 
        action: 'read',
        sheetName: sheetName,
        apiKey: API_KEY
      }),
      headers: { "Content-Type": "text/plain;charset=utf-8" },
    });

    const result = await res.json();

    if (result.status === 'success') {
      console.log(`[API] Retrieved ${result.count || 0} records from ${sheetName}`);
      return result.data || [];
    } else {
      console.error(`[API] Failed to fetch ${sheetName}:`, result.message);
      return [];
    }
  } catch (err) {
    console.error(`[API] Error fetching ${sheetName}:`, err);
    return [];
  }
};

/**
 * Fetch schedule data with caching via authenticated API
 * 🔐 SECURITY FIX: No longer uses public CSV URLs
 */
export const fetchScheduleData = async (): Promise<ScheduleItem[]> => {
  // Check cache first
  const cached = getCachedData<ScheduleItem[]>(CACHE_KEYS.SCHEDULE);
  if (cached) {
    console.log('[Cache] Using cached schedule data');
    return cached;
  }

  // Fetch from authenticated API
  const data = await fetchFromAPI('Schedules');
  if (data.length > 0) {
    setCachedData(CACHE_KEYS.SCHEDULE, data);
    console.log('[Cache] Cached schedule data');
  }
  
  return data;
};

/**
 * Fetch users data with caching via authenticated API
 * 🔐 SECURITY FIX: No longer uses public CSV URLs
 */
export const fetchUsersData = async (): Promise<UserItem[]> => {
  // Check cache first
  const cached = getCachedData<UserItem[]>(CACHE_KEYS.USERS);
  if (cached) {
    console.log('[Cache] Using cached users data');
    return cached;
  }

  // Fetch from authenticated API
  const data = await fetchFromAPI('Users');
  if (data.length > 0) {
    setCachedData(CACHE_KEYS.USERS, data);
    console.log('[Cache] Cached users data');
  }
  
  return data;
};

/**
 * Fetch equipment data with caching via authenticated API
 * 🔐 SECURITY FIX: No longer uses public CSV URLs
 */
export const fetchEquipmentData = async (): Promise<EquipmentItem[]> => {
  // Check cache first
  const cached = getCachedData<EquipmentItem[]>(CACHE_KEYS.EQUIPMENT);
  if (cached) {
    console.log('[Cache] Using cached equipment data');
    return cached;
  }

  // Fetch from authenticated API
  const data = await fetchFromAPI('Master_Equipment');
  if (data.length > 0) {
    setCachedData(CACHE_KEYS.EQUIPMENT, data);
    console.log('[Cache] Cached equipment data');
  }
  
  return data;
};

/**
 * Fetch blog articles via authenticated API
 * 🔐 SECURITY FIX: No longer uses public CSV URLs
 */
export const fetchBlogData = async (): Promise<BlogArticle[]> => {
  // Always fetch fresh for blog
  const data = await fetchFromAPI('Articles');
  console.log('[Blog] Fetched', data.length, 'articles via authenticated API');
  return data;
};

/**
 * Fetch equipment usage records via authenticated API
 * 🔐 SECURITY FIX: No longer uses public CSV URLs
 */
export const fetchEquipmentUsageData = async (): Promise<EquipmentUsageRecord[]> => {
  const data = await fetchFromAPI('Data_Penggunaan_Alat');
  console.log('[Equipment Usage] Fetched', data.length, 'records via authenticated API');
  return data;
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
    if (folderName.includes('..') || folderName.includes('/') || folderName.includes('\\')) {
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
