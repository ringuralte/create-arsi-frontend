import { ClientError } from 'graphql-request'

/**
 * Parses a GraphQL error and returns a user-friendly error message.
 *
 * @param error - The error object
 * @returns The formatted error message
 */
export function parseGraphqlError(error: Error) {
  const message = 'An error occurred. Please try again later.'
  if (error instanceof ClientError) {
    return error?.response?.errors?.[0].message ?? message
  }
  else {
    return message
  }
}
