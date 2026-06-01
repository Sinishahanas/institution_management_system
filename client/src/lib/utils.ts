import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * @purpose
 * - Merge multiple class names into a single string.
 * - Combines several class names or conditional objects into a single string.
 * - Uses `clsx` for conditional class handling and `twMerge` to merge Tailwind CSS classes properly.
 * - Ensures there are no duplicate or conflicting Tailwind classes.
 *
 * @param {...ClassValue[]} inputs - One or more class values (strings, arrays, or objects) to be combined.
 * @returns {string} A single string with all classes merged and deduplicated according to Tailwind CSS rules.
 * @throws {TypeError} Throws if any of the inputs are not valid class values (e.g., not string, array, or object).
 * @sideEffects None. This function does not modify external state.
 *
 * @example
 * cn('bg-red-500', 'text-white', { 'font-bold': true });
 * // Returns: "bg-red-500 text-white font-bold"
 *
 * @example
 * cn('px-4', ['py-2', 'px-2']);
 * // Returns: "px-2 py-2" (px-4 overridden by px-2 according to Tailwind rules)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}


/**
 * @purpose
 * - Format a number as a currency string.
 * - Converts a number into a currency-like string with exactly two decimal places.
 * - Uses `Intl.NumberFormat` for locale-aware formatting (en-AE). Useful for displaying amounts consistently.
 *
 * @param {number} amount - The numeric amount to format.
 * @returns {string} Currency formatted string.
 * @throws {TypeError} If the provided amount is not a valid number.
 * @sideEffects None.
 * 
 * @example
 * formatCurrency(1234.5) // "1,234.50"
 * 
 * @example
 * formatCurrency(1000000);
 * // Returns: "1,000,000.00"
 *
 * @example
 * formatCurrency(-99.9);
 * // Returns: "-99.90"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * @purpose
 * - Generate initials from a name.
 * - Takes a full name string and returns uppercase initials.
 * - Splits the name by spaces, extracts the first letter of each part, and joins them.
 * - Handles empty or undefined names gracefully.
 *
 * @param {string} [name] - The full name from which to extract initials.
 * @returns {string} Uppercase initials, or empty string if name not provided.
 * @throws {TypeError} Throws if `name` is provided but is not a string.
 * @sideEffects None. This function does not modify external state.
 *
 * @example
 * getInitials('Mary Paul') // "MP"
 */
export function getInitials(name?: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
}


/**
 * @purpose
 * - Convert 24-hour time to 12-hour format.
 * - Useful for displaying human-readable time in UIs.
 *
 * @param {string} time - Time string in 24-hour format ("HH:mm").
 * @returns {string} Time string in 12-hour format (e.g., "06:30 PM").
 * @throws {TypeError} Throws if `time` is not a valid string in "HH:mm" format.
 * @throws {RangeError} Throws if the hour or minute values are out of valid range (0-23 for hours, 0-59 for minutes).
 * @sideEffects None. This function does not modify external state.
 *
 * @example
 * formatTimeTo12Hour("14:30");
 * // Returns: "02:30 PM"
 *
 * @example
 * formatTimeTo12Hour("09:05");
 * // Returns: "09:05 AM"
 *
 * @example
 * formatTimeTo12Hour("00:00");
 * // Returns: "12:00 AM"
 *
 * @example
 * formatTimeTo12Hour("12:00");
 * // Returns: "12:00 PM"
 */
export function formatTimeTo12Hour(time: string): string {
  const [hour, minute] = time.split(":");
  const date = new Date();
  date.setHours(parseInt(hour));
  date.setMinutes(parseInt(minute));
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}


/**
 * @purpose Capitalize the first letter of a string.
 *
 * @param {string} str - Input string to capitalize.
 * @returns {string} String with first letter capitalized.
 * @throws {TypeError} Throws if `str` is not a string.
 * @sideEffects None. This function does not modify external state.
 *
 * @example
 * capitalizeFirstLetter("hello");
 * // Returns: "Hello"
 *
 * @example
 * capitalizeFirstLetter("");
 * // Returns: "-"
 *
 */
export function capitalizeFirstLetter(str: string): string {
  if (!str) return "-";
  return str.charAt(0).toUpperCase() + str.slice(1);
}


/**
 * @purpose 
 * - Truncate text to a maximum length.
 * - Shortens a string to the specified max length.
 * - Adds "..." at the end if the text exceeds the limit.
 * - Useful for UI previews, cards, or tooltips.
 *
 * @param {string} text - Text string to truncate.
 * @param {number} maxLength - Maximum allowed length.
 * @returns {string} The original text if its length is less than or equal to `maxLength`,
 *                   otherwise a truncated version followed by "...".
 * @throws {TypeError} Throws if `text` is not a string.
 * @throws {RangeError} Throws if `maxLength` is negative.
 * @sideEffects None. This function does not modify external state.
 *
 * @example
 * truncateText("Hello World", 5) 
 * // Returns: "Hello..."
 * 
 * @example
 * truncateText("Short text", 20);
 * // Returns: "Short text"
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}


/**
 * @purpose 
 * - Calculate age from date of birth. 
 * - Computes the age in years based on a given birth date.
 *
 * @param {Date} dateOfBirth - Birth date to calculate the age from.
 * @returns {number} Age in years.
 * @throws {Error} Throws if `dateOfBirth` is not a valid Date.
 * @sideEffects None. This function does not modify external state.
 *
 * @example
 * calculateAge(new Date('2000-01-01')) // 24 (depending on current year)
 * 
 * @example
 * calculateAge(new Date()) // 0
 * 
 * @example
 * calculateAge(new Date('200-01-51')) // Error: Invalid dateOfBirth provided.
 */
export function calculateAge(dateOfBirth: Date): number {
  if (!(dateOfBirth instanceof Date) || Number.isNaN(dateOfBirth.getTime())) {
    throw new Error("Invalid dateOfBirth provided.");
  }

  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDifference = today.getMonth() - dateOfBirth.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
}


/**
 * @purpose
 * - Returns Tailwind CSS color classes for a status.
 * - Maps a status string (active, pending, paid, etc.) to corresponding Tailwind background and text classes.
 * - Useful for badges, labels, or status indicators in UI components.
 *
 * @param {string} [status] - Status string.
 * @returns {{bg: string, text: string}} Object with Tailwind classes.
 * @throws {TypeError} Throws if `status` is not a string.
 * @sideEffects None.
 *
 * @example
 * getStatusColor("active") 
 * // Returns: { bg: "bg-green-100", text: "text-green-800" }
 * 
 * @example
 * getStatusColor('unknown');
 * // Returns: { bg: 'bg-gray-100', text: 'text-gray-800' }
 *
 * @example
 * getStatusColor();
 * // Returns: { bg: 'bg-gray-100', text: 'text-gray-800' }
 */
export function getStatusColor(status?: string): { bg: string; text: string } {
  switch (status?.toLowerCase()) {
    case 'active': return { bg: 'bg-green-100', text: 'text-green-800' };
    case 'inactive': return { bg: 'bg-neutral-100', text: 'text-neutral-800' };
    case 'partially_paid': return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
    case 'pending': return { bg: 'bg-amber-100', text: 'text-amber-800' };
    case 'paid': return { bg: 'bg-primary', text: 'text-white' };
    case 'unpaid': return { bg: 'bg-green-100', text: 'text-green-800' };
    case 'failed': return { bg: 'bg-red-100', text: 'text-red-800' };
    case 'cancelled': return { bg: 'bg-red-100', text: 'text-red-800' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-800' };
  }
}


/**
 * @purpose 
 * - Returns Tailwind CSS color classes for a category.
 * - Maps a category name (music, dance, art) to Tailwind classes for background and text.
 * - Returns gray classes for unrecognized categories.
 *
 * @param {string} category - Category name.
 * @returns {string} A string containing Tailwind CSS classes for background and text colors.
 * @throws {TypeError} Throws if `category` is not a string.
 * @sideEffects None.
 *
 * @example
 * getCategoryColor("music") 
 * // Returns: "bg-blue-100 text-blue-800"
 * 
 * @example
 * getCategoryColor('unknown');
 * // Returns: "bg-gray-100 text-gray-800"
 */
export function getCategoryColor(category: string): string {
  switch (category.toLowerCase()) {
    case 'music': return 'bg-blue-100 text-blue-800';
    case 'dance': return 'bg-orange-100 text-orange-800';
    case 'art': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}


/**
 * @purpose 
 * - Generate a unique invoice ID.
 * - Creates an invoice ID in the format `INV-YYYYMMDD-XXX`, using the current date and a random 3-digit number.
 * - Useful for generating identifiers for invoices dynamically.
 * @param {void} None.
 * @returns {string} Unique invoice ID.
 * @throws None.
 * @sideEffects None (uses Math.random to generate randomness).
 *
 * @example
 * generateInvoiceId();
 * // Returns: "INV-20251013-123" (random number will vary)
 */
export function generateInvoiceId(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${year}${month}${day}-${random}`;
}


/**
 * @purpose 
 * - Load an image as a Base64 string.
 * - Fetches an image from a URL and converts it to a Base64-encoded string.
 *
 * @param {string} url - Image URL to load.
 * @returns {Promise<string>} Base64 string representation of the image.
 * @throws {Error} Rejects the promise if the image fails to load or if the canvas context cannot be obtained.
 * @sideEffects Creates DOM Image and Canvas elements (internally).
 *
 * @example
 * loadImageAsBase64("https://example.com/image.png").then(base64 => console.log(base64));
 */
export const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas context not available");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject("Failed to load image: " + url);
    img.src = url;
  });
};


/**
 * @purpose Extract date info from an invoice number.
 *
 * @param {string} invoiceNumber - Invoice number string.
 * @returns {{year: number, month: number, monthName: string, day: number}} An object containing:
 *            - `year`: Full year as a number (e.g., 2024)
 *            - `month`: Month number (1-12)
 *            - `monthName`: Full month name (e.g., "October")
 *            - `day`: Day of the month (1-31)
 * @throws {Error} If invoice format is invalid or date parsing fails.
 * @sideEffects None.
 *
 * @example
 * extractMonth("INV-20241013-123");
 * // Returns: { year: 2024, month: 10, monthName: "October", day: 13 }
 *
 * @example
 * extractMonth("INV-19991231-001");
 * // Returns: { year: 1999, month: 12, monthName: "December", day: 31 }
 */
export function extractMonth(invoiceNumber: string) {
  const parts = invoiceNumber.split('-');
  if (parts.length < 2 || parts[1].length !== 8) {
    throw new Error('Invalid invoice format');
  }
  const datePart = parts[1];
  const year = parseInt(datePart.slice(0, 4), 10);
  const monthNumber = parseInt(datePart.slice(4, 6), 10);
  const day = parseInt(datePart.slice(6, 8), 10);
  const monthName = new Date(year, monthNumber - 1, day).toLocaleString('default', { month: 'long' });
  return { year, month: monthNumber, monthName, day };
}


/**
 * @purpose Format ISO date string to DD/MM/YYYY.
 *
 * @param {string} isoString - ISO date string.
 * @returns {string} Formatted date string in "DD/MM/YYYY" format.
 * @throws {Error} If the provided date string is invalid.
 * @sideEffects None.
 *
 * @example
 * formatDateToDDMMYYYY("2025-09-29T00:00:00Z") 
 * // Returns: "29/09/2025"
 * 
 * @example
 * formatDateToDDMMYYYY("invalid-date");
 * // Throws an error
 */
export function formatDateToDDMMYYYY(isoString: string): string {
  const date = new Date(isoString);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}