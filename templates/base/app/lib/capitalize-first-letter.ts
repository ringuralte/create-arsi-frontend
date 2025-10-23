/**
 * Capitalize the first letter of a string.
 *
 * @param str - The string value
 * @returns The string with the first letter capitalized.
 *
 * @example
 * capitalizeFirstLetter('active') // 'Active'
 */
export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
