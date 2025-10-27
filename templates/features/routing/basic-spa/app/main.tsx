import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import Home from '~/routes/home'
import './app.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
