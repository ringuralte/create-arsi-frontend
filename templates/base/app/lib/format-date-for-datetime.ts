import { format } from 'date-fns'

/**
 * Formats a date string or Date object into a datetime string.
 *
 * @param date - The date string or Date object to format.
 * @returns The formatted datetime string in 'yyyy-MM-dd HH:mm:ss' format.
 *
 * @example
 * formatDateForDatetime('2023-01-01T00:00:00Z') // '2023-01-01 00:00:00'
 * formatDateForDatetime(new Date('2023-01-01')) // '2023-01-01 00:00:00'
 */
export function formatDateForDatetime(date: string | Date) {
  return format(date instanceof Date ? date : new Date(date), 'yyyy-MM-dd HH:mm:ss')
}
