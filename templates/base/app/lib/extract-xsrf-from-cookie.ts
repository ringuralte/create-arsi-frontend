export default function extractXsrfFromCookie(
  cookieString: string,
): string | null {
  const cookies = cookieString.split('; ')

  let xsrfToken: string | null = null

  for (const cookie of cookies) {
    if (cookie.startsWith('XSRF-TOKEN=')) {
      xsrfToken = cookie.substring('XSRF-TOKEN='.length)
      break
    }
  }

  return xsrfToken
}
