/**
 * Locale utility for handling user locale detection and number formatting/parsing
 */

/**
 * Get the user's locale from browser settings
 * Falls back to 'en-US' if unavailable
 */
export function getUserLocale(): string {
  if (typeof navigator === 'undefined') {
    return 'en-US';
  }

  // Try to get the user's preferred language
  const nav = navigator as Navigator & { userLanguage?: string };
  const userLanguage = navigator.language || nav.userLanguage;
  return userLanguage || 'en-US';
}

/**
 * Get the decimal separator for a given locale
 * @param locale - The locale to get the separator for (e.g., 'pt-BR', 'en-US')
 * @returns The decimal separator (',' or '.')
 */
export function getDecimalSeparator(locale: string = getUserLocale()): string {
  const numberWithDecimal = 1.1;
  const formatted = new Intl.NumberFormat(locale).format(numberWithDecimal);
  // The second character should be the decimal separator
  return formatted.charAt(1);
}

/**
 * Get the thousand separator for a given locale
 * @param locale - The locale to get the separator for
 * @returns The thousand separator (',' or '.' or ' ')
 */
export function getThousandSeparator(locale: string = getUserLocale()): string {
  const numberWithThousands = 1000;
  const formatted = new Intl.NumberFormat(locale).format(numberWithThousands);
  // The second character should be the thousand separator (if it exists)
  if (formatted.length === 5) {
    return formatted.charAt(1);
  }
  return ','; // Default fallback
}

/**
 * Parse a localized number string to a JavaScript number
 * Handles both comma and period as decimal separators
 *
 * @param value - The string value to parse (e.g., "1.234,56" or "1,234.56")
 * @param locale - The locale to use for parsing
 * @returns The parsed number
 */
export function parseLocalizedNumber(value: string, locale: string = getUserLocale()): number {
  if (!value || value.trim() === '') {
    return 0;
  }

  const decimalSep = getDecimalSeparator(locale);
  const thousandSep = getThousandSeparator(locale);

  // Remove all thousand separators
  let normalized = value.replace(new RegExp(`\\${thousandSep}`, 'g'), '');

  // Replace decimal separator with period (JS standard)
  if (decimalSep !== '.') {
    normalized = normalized.replace(decimalSep, '.');
  }

  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format a number according to the user's locale
 *
 * @param num - The number to format
 * @param options - Intl.NumberFormat options
 * @param locale - The locale to use for formatting
 * @returns The formatted string
 */
export function formatNumber(
  num: number,
  options: Intl.NumberFormatOptions = {},
  locale: string = getUserLocale()
): string {
  return new Intl.NumberFormat(locale, options).format(num);
}

/**
 * Format a number as currency according to the user's locale
 *
 * @param num - The number to format
 * @param currency - The currency code (e.g., 'USD', 'BRL')
 * @param decimals - Number of decimal places
 * @param locale - The locale to use for formatting
 * @returns The formatted currency string
 */
export function formatCurrency(
  num: number,
  currency: string = 'USD',
  decimals: number = 2,
  locale: string = getUserLocale()
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format a number as percentage according to the user's locale
 *
 * @param num - The number to format (0.15 = 15%)
 * @param decimals - Number of decimal places
 * @param locale - The locale to use for formatting
 * @returns The formatted percentage string
 */
export function formatPercentage(
  num: number,
  decimals: number = 2,
  locale: string = getUserLocale()
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Sanitize input value to only allow valid number characters for the user's locale
 *
 * @param value - The input value to sanitize
 * @param allowNegative - Whether to allow negative numbers
 * @param locale - The locale to use
 * @returns The sanitized value
 */
export function sanitizeNumberInput(
  value: string,
  allowNegative: boolean = false,
  locale: string = getUserLocale()
): string {
  const decimalSep = getDecimalSeparator(locale);
  const thousandSep = getThousandSeparator(locale);

  // Build regex pattern to allow only valid characters
  const negativePattern = allowNegative ? '-' : '';
  const escapedDecimal = decimalSep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedThousand = thousandSep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const pattern = new RegExp(`[^0-9${negativePattern}${escapedDecimal}${escapedThousand}]`, 'g');

  return value.replace(pattern, '');
}
