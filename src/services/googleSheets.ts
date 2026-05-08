import Papa from 'papaparse';
import { getCachedData, setCachedData, invalidateCache, CACHE_KEYS } from '../utils/cache';

export interface ScheduleItem {
  Schedule_ID: string;
  Program_Name: string;
  Date: string;
  Start_Time: string;
  End_Time: string;
  Location: string;
  PIC: string;
  Status: string;
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

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1ZXfS1FQJqBidwg4kuJ7ODQ4HkdUZhInJpmis3bDCDw4/export?format=csv&gid=0';
const USERS_CSV_URL = 'https://docs.google.com/spreadsheets/d/1ZXfS1FQJqBidwg4kuJ7ODQ4HkdUZhInJpmis3bDCDw4/gviz/tq?tqx=out:csv&sheet=Users';
const EQUIPMENT_CSV_URL = 'https://docs.google.com/spreadsheets/d/1ZXfS1FQJqBidwg4kuJ7ODQ4HkdUZhInJpmis3bDCDw4/gviz/tq?tqx=out:csv&sheet=Master_Equipment';
const BLOG_CSV_URL = 'https://docs.google.com/spreadsheets/d/1ZXfS1FQJqBidwg4kuJ7ODQ4HkdUZhInJpmis3bDCDw4/gviz/tq?tqx=out:csv&sheet=Articles';

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
 * Fetch blog articles with caching
 */
export const fetchBlogData = async (): Promise<BlogArticle[]> => {
  // Check cache first
  const cached = getCachedData<BlogArticle[]>(CACHE_KEYS.BLOGS);
  if (cached) {
    console.log('[Cache] Using cached blog data');
    return cached;
  }

  return new Promise((resolve, reject) => {
    Papa.parse(BLOG_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as BlogArticle[];
        // Cache the fetched data
        setCachedData(CACHE_KEYS.BLOGS, data);
        console.log('[Cache] Cached blog data');
        resolve(data);
      },
      error: (error: Error) => {
        console.error("Error fetching Blog data:", error);
        reject(error);
      }
    });
  });
};

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw-E6Po3wQ-HGaPlTfucFwH3LX-t7kDSuk1DMK-M5YrOgTYJJbwB-It72J5cT6dNAXx/exec";

/**
 * Execute API call to update spreadsheet data
 * Automatically invalidates the relevant cache when data is updated
 */
export const executeApi = async (sheetName: string, action: string, record: any) => {
  try {
    const session = localStorage.getItem('yarsi_user');
    const username = session ? JSON.parse(session).name : 'System';

    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ sheetName, action, record, username }),
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

