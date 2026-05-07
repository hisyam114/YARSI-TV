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

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1ZXfS1FQJqBidwg4kuJ7ODQ4HkdUZhInJpmis3bDCDw4/export?format=csv&gid=0';

export const fetchScheduleData = async (): Promise<ScheduleItem[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(SHEET_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // results.data contains the array of objects mapping to the CSV headers
        resolve(results.data as ScheduleItem[]);
      },
      error: (error: Error) => {
        console.error("Error fetching Google Sheets data:", error);
        reject(error);
      }
    });
  });
};
