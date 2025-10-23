/**
 * Formats a number as Indian Rupee (INR) currency
 *
 * @param value - The numeric value to format as currency
 * @param numberOfFractionDigits - Optional number of decimal places to display (defaults to 2)
 * @returns A formatted currency string in Indian Rupee format (e.g., "₹1,234.56")
 *
 * @example
 * parseCurrency(1234.56) // Returns "₹1,234.56"
 * parseCurrency(1234.567, 0) // Returns "₹1,234"
 */
export function parseCurrency(value: number, numberOfFractionDigits?: number) {
  const format = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: numberOfFractionDigits ?? 2,
  })

  return format.format((value))
}

/**
 * Formats a number using Indian numbering system
 *
 * @param value - The numeric value to format
 * @returns A formatted number string with Indian-style thousand separators (e.g., "1,23,456")
 *
 * @example
 * formatIndianNumber(123456) // Returns "1,23,456"
 */
export function formatIndianNumber(value: number) {
  return new Intl.NumberFormat('en-IN').format(value)
}
