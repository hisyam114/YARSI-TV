// Shared date utilities used across LandingPage, AdminDashboard, etc.

/**
 * Safely parse a time string like "8:00:00", "08:00", "9:30:00" → "08:00", "08:00", "09:30"
 */
const parseTimePart = (timeStr?: string): string => {
  if (!timeStr) return '00:00';
  const parts = timeStr.trim().split(':');
  if (parts.length >= 2) {
    const hh = parts[0].padStart(2, '0');
    const mm = parts[1].padStart(2, '0');
    return `${hh}:${mm}`;
  }
  return '00:00';
};

/**
 * Parse a date string from Google Sheets CSV.
 * Handles: DD/MM/YYYY, D/M/YYYY, YYYY-MM-DD, DD-MM-YYYY
 * Also handles time strings like "8:00", "08:00", "08:00:00", "9:30:00"
 */
export const parseSheetDate = (dateStr?: string, timeStr?: string): Date => {
  if (!dateStr) return new Date(0);

  const raw = dateStr.trim();
  let isoDate = raw;

  // DD/MM/YYYY or D/M/YYYY (slash-separated, day first)
  const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, dd, mm, yyyy] = slashMatch;
    isoDate = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }

  // DD-MM-YYYY or D-M-YYYY (dash-separated, day first, year last — NOT ISO)
  const dashDMYMatch = raw.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dashDMYMatch) {
    const [, dd, mm, yyyy] = dashDMYMatch;
    isoDate = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }
  // YYYY-MM-DD is already ISO — keep as-is

  const timePart = parseTimePart(timeStr);
  const result = new Date(`${isoDate}T${timePart}`);
  return isNaN(result.getTime()) ? new Date(0) : result;
};

/**
 * Normalize any supported date format to YYYY-MM-DD for string comparisons.
 */
export const normalizeDateToISO = (dateStr?: string): string => {
  if (!dateStr) return '';
  const d = parseSheetDate(dateStr);
  if (d.getTime() === 0) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Format any supported date string to DD/MM/YYYY for display.
 */
export const formatDateToDDMMYYYY = (dateStr?: string): string => {
  if (!dateStr) return '';
  const d = parseSheetDate(dateStr);
  if (d.getTime() === 0) return dateStr;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};
