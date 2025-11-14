/**
 * Date utilities for handling Argentina timezone (America/Argentina/Buenos_Aires)
 * and formatting dates in dd/MM/yyyy format throughout the application
 */

const ARGENTINA_TIMEZONE = 'America/Argentina/Buenos_Aires';
const ARGENTINA_LOCALE = 'es-AR';

/**
 * Format a date to dd/MM/yyyy format using Argentina timezone
 * @param date - Date string, Date object, or null/undefined
 * @returns Formatted date string or empty string if invalid
 */
export function formatDateAR(date: string | Date | null | undefined): string {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return '';

    return new Intl.DateTimeFormat(ARGENTINA_LOCALE, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: ARGENTINA_TIMEZONE
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Format a date to dd/MM/yyyy HH:mm format using Argentina timezone
 * @param date - Date string, Date object, or null/undefined
 * @returns Formatted datetime string or empty string if invalid
 */
export function formatDateTimeAR(date: string | Date | null | undefined): string {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return '';

    return new Intl.DateTimeFormat(ARGENTINA_LOCALE, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: ARGENTINA_TIMEZONE
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '';
  }
}

/**
 * Convert a date string from dd/MM/yyyy to yyyy-MM-dd (for input[type="date"])
 * @param dateStr - Date in dd/MM/yyyy format
 * @returns Date in yyyy-MM-dd format or empty string
 */
export function toInputDateFormat(dateStr: string | null | undefined): string {
  if (!dateStr) return '';

  // If already in yyyy-MM-dd format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // If in dd/MM/yyyy format, convert to yyyy-MM-dd
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  }

  // Try to parse as ISO date and convert
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (error) {
    console.error('Error converting to input date format:', error);
  }

  return '';
}

/**
 * Convert a date from input[type="date"] (yyyy-MM-dd) to ISO string for API
 * @param inputDate - Date in yyyy-MM-dd format
 * @returns ISO date string for API consumption
 */
export function fromInputDateFormat(inputDate: string | null | undefined): string {
  if (!inputDate) return '';

  try {
    // Create date at midnight in Argentina timezone
    const [year, month, day] = inputDate.split('-').map(Number);
    const date = new Date(year, month - 1, day, 0, 0, 0, 0);

    return date.toISOString();
  } catch (error) {
    console.error('Error converting from input date format:', error);
    return '';
  }
}

/**
 * Get current date in Argentina timezone formatted as yyyy-MM-dd (for input defaults)
 * @returns Current date in yyyy-MM-dd format
 */
export function getCurrentDateAR(): string {
  const now = new Date();

  // Get components in Argentina timezone
  const formatter = new Intl.DateTimeFormat(ARGENTINA_LOCALE, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: ARGENTINA_TIMEZONE
  });

  const parts = formatter.formatToParts(now);
  const day = parts.find(p => p.type === 'day')?.value || '01';
  const month = parts.find(p => p.type === 'month')?.value || '01';
  const year = parts.find(p => p.type === 'year')?.value || '2024';

  return `${year}-${month}-${day}`;
}

/**
 * Get a date placeholder in dd/MM/yyyy format
 * @returns Placeholder string for date inputs
 */
export function getDatePlaceholder(): string {
  return 'dd/mm/aaaa';
}

/**
 * Validate if a date string is in dd/MM/yyyy format
 * @param dateStr - Date string to validate
 * @returns True if valid format
 */
export function isValidDateFormatAR(dateStr: string): boolean {
  if (!dateStr) return false;

  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateStr.match(regex);

  if (!match) return false;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false;

  // Check if day is valid for the month
  const date = new Date(year, month - 1, day);
  return date.getMonth() === month - 1 && date.getDate() === day;
}

/**
 * Format a time to HH:mm format using Argentina timezone
 * @param date - Date string, Date object, or null/undefined
 * @returns Formatted time string or empty string if invalid
 */
export function formatTimeAR(date: string | Date | null | undefined): string {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return '';

    return new Intl.DateTimeFormat(ARGENTINA_LOCALE, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: ARGENTINA_TIMEZONE,
      hour12: false
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
}

/**
 * Get the number of days between a date and today
 * @param date - Date to compare
 * @returns Number of days (positive for past dates)
 */
export function getDaysAgo(date: string | Date | null | undefined): number {
  if (!date) return 0;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return 0;

    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    return diffInDays;
  } catch (error) {
    console.error('Error calculating days ago:', error);
    return 0;
  }
}

/**
 * Format a relative date (e.g., "hace 2 días", "en 3 horas")
 * @param date - Date to compare
 * @returns Relative time string in Spanish
 */
export function formatRelativeDateAR(date: string | Date | null | undefined): string {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return '';

    const now = new Date();
    const diffInMs = dateObj.getTime() - now.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (Math.abs(diffInSeconds) < 60) {
      return 'ahora';
    } else if (Math.abs(diffInMinutes) < 60) {
      const minutes = Math.abs(diffInMinutes);
      return diffInMinutes > 0
        ? `en ${minutes} minuto${minutes !== 1 ? 's' : ''}`
        : `hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    } else if (Math.abs(diffInHours) < 24) {
      const hours = Math.abs(diffInHours);
      return diffInHours > 0
        ? `en ${hours} hora${hours !== 1 ? 's' : ''}`
        : `hace ${hours} hora${hours !== 1 ? 's' : ''}`;
    } else if (Math.abs(diffInDays) < 7) {
      const days = Math.abs(diffInDays);
      return diffInDays > 0
        ? `en ${days} día${days !== 1 ? 's' : ''}`
        : `hace ${days} día${days !== 1 ? 's' : ''}`;
    } else {
      return formatDateAR(dateObj);
    }
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return '';
  }
}
