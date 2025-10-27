import { createCookieSessionStorage } from 'react-router'

interface SessionData {
  role: string
  token: string
}

interface SessionFlashData {
  error: string
  successMessage: string
}

const { commitSession, destroySession, getSession }
  = createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      httpOnly: true,
      name: import.meta.env.VITE_SESSION_COOKIE_NAME,
      path: '/',
      secrets: [import.meta.env.VITE_SESSION_SECRET],
      secure: process.env.NODE_ENV === 'production',
    },
  })

export { commitSession, destroySession, getSession }
