import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { print } from 'graphql'
import { ClientError, GraphQLClient } from 'graphql-request'
import { baseUrl } from './base-url'
import extractXsrfFromCookie from './extract-xsrf-from-cookie'

// Helper: Check if a value is a File or File[]
function isFileValue(value: unknown): value is File | File[] {
  if (typeof File === 'undefined')
    return false
  if (value instanceof File)
    return true
  if (Array.isArray(value) && value.length > 0) {
    return value.every(v => v instanceof File)
  }
  return false
}

// Helper: Set a nested value in an object using dot notation
function setNestedValue(obj: Record<string, any>, path: string, value: any) {
  const keys = path.split('.')
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {}
    }
    current = current[key]
  }

  current[keys[keys.length - 1]] = value
}

// Helper: Recursively find all file fields in variables
function findFiles(variables: Record<string, any>, prefix = '') {
  const fileMap: Record<string, File | File[]> = {}

  for (const key in variables) {
    const value = variables[key]
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (isFileValue(value)) {
      fileMap[fullKey] = value
    }
    else if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      // Recursively search nested objects
      const nestedFiles = findFiles(value, fullKey)
      Object.assign(fileMap, nestedFiles)
    }
  }

  return fileMap
}

async function refreshCsrfToken() {
  try {
    await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
      credentials: 'include',
      method: 'GET',
    })
    if (typeof document !== 'undefined') {
      const cookie = document.cookie
      return extractXsrfFromCookie(cookie) || ''
    }
  }
  catch (error) {
    console.error('Failed to refresh CSRF token:', error)
  }
  return ''
}

export interface GraphQLClientOptions {
  token?: string
}

export async function graphqlClient({ token }: GraphQLClientOptions = {}) {
  let xsrfToken = ''
  if (typeof document !== 'undefined') {
    const cookie = document.cookie
    xsrfToken = extractXsrfFromCookie(cookie) || ''
  }

  const client = new GraphQLClient(`${baseUrl}/arsi`, {
    credentials: 'include',
  })
  client.setHeaders({
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(xsrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) } : {}),
  })

  // Unified request method
  // async function request<T = any, V extends object = Record<string, any>>(
  //   options: { document: DocumentNode, variables?: V }, // Single options object
  // ): Promise<T> {
  async function request<TResult, TVariables extends object>(
    options: { document: TypedDocumentNode<TResult, TVariables>, variables?: TVariables },
  ) {
    const { document, variables } = options // Destructure inside
    const fileFields = variables
      ? findFiles(variables as Record<string, any>)
      : {}
    const hasFiles = Object.keys(fileFields).length > 0

    // If no files, use normal request
    if (!hasFiles) {
      try {
        return await client.request<TResult, TVariables>(document, variables)
      }
      catch (error) {
        // CSRF retry logic
        if (error instanceof ClientError && error?.response?.status === 419) {
          const newToken = await refreshCsrfToken()
          if (newToken) {
            client.setHeader('X-XSRF-TOKEN', decodeURIComponent(newToken))
            // Pass the whole options object
            return client.request<TResult, TVariables>(document, variables)
          }
        }
        throw error
      }
    }

    // --- File upload logic (GraphQL multipart request spec) ---
    const mutationAsString = print(document)
    const formData = new FormData()
    const variablesCopy = { ...variables } as Record<string, any>
    const map: Record<string, string[]> = {}
    let fileIndex = 0

    // Build map and append files
    for (const field in fileFields) {
      const value = fileFields[field]
      if (Array.isArray(value)) {
        // Multiple files for this field
        setNestedValue(variablesCopy, field, value.map(() => null))
        value.forEach((file, idx) => {
          map[fileIndex.toString()] = [`variables.${field}.${idx}`]
          formData.append(fileIndex.toString(), file)
          fileIndex++
        })
      }
      else {
        // Single file
        setNestedValue(variablesCopy, field, null)
        map[fileIndex.toString()] = [`variables.${field}`]
        formData.append(fileIndex.toString(), value)
        fileIndex++
      }
    }

    formData.append(
      'operations',
      JSON.stringify({ query: mutationAsString, variables: variablesCopy }),
    )
    formData.append('map', JSON.stringify(map))

    // Prepare headers
    const headers: Record<string, string> = {}
    if (token)
      headers.Authorization = `Bearer ${token}`
    if (xsrfToken)
      headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken)

    // Send the multipart request
    const doFetch = async () => {
      const res = await fetch(`${baseUrl}/arsi`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
        headers,
      })
      if (!res.ok) {
        if (res.status === 419) {
          throw new ClientError(
            {
              status: res.status,
              response: res,
              request: {
                query: mutationAsString,
                variables: variablesCopy,
                headers,
              },
            },
            { query: mutationAsString, variables: variablesCopy },
          )
        }
        throw new Error(`GraphQL upload failed: ${res.status}`)
      }
      const json = await res.json()
      if (json.errors) {
        throw new ClientError(
          {
            status: res.status,
            response: res,
            request: {
              query: mutationAsString,
              variables: variablesCopy,
              headers,
            },
          },
          { query: mutationAsString, variables: variablesCopy },
        )
      }
      return json.data as TResult
    }

    try {
      return await doFetch()
    }
    catch (error) {
      // CSRF retry logic for uploads
      if (error instanceof ClientError && error?.response?.status === 419) {
        const newToken = await refreshCsrfToken()
        if (newToken) {
          headers['X-XSRF-TOKEN'] = decodeURIComponent(newToken)
          return doFetch()
        }
      }
      throw error
    }
  }

  return { request }
}
