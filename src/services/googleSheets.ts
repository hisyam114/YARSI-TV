import Papa from 'papaparse';

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

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1ZXfS1FQJqBidwg4kuJ7ODQ4HkdUZhInJpmis3bDCDw4/export?format=csv&gid=0';
const USERS_CSV_URL = 'https://docs.google.com/spreadsheets/d/1ZXfS1FQJqBidwg4kuJ7ODQ4HkdUZhInJpmis3bDCDw4/gviz/tq?tqx=out:csv&sheet=Users';
const EQUIPMENT_CSV_URL = 'https://docs.google.com/spreadsheets/d/1ZXfS1FQJqBidwg4kuJ7ODQ4HkdUZhInJpmis3bDCDw4/gviz/tq?tqx=out:csv&sheet=Master_Equipment';

export const fetchScheduleData = async (): Promise<ScheduleItem[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(SHEET_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as ScheduleItem[]);
      },
      error: (error: Error) => {
        console.error("Error fetching Google Sheets data:", error);
        reject(error);
      }
    });
  });
};

export const fetchUsersData = async (): Promise<UserItem[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(USERS_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as UserItem[]);
      },
      error: (error: Error) => {
        console.error("Error fetching Users data:", error);
        reject(error);
      }
    });
  });
};

export const fetchEquipmentData = async (): Promise<EquipmentItem[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(EQUIPMENT_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as EquipmentItem[]);
      },
      error: (error: Error) => {
        console.error("Error fetching Equipment data:", error);
        reject(error);
      }
    });
  });
};

