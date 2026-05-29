/* eslint-disable react-refresh/only-export-components -- entry module, not a fast-refresh boundary */
import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Landing from './landing/Landing.jsx'

// The entire authenticated app (store, Supabase, shell, screens, AI client) is
// split into one lazily-loaded chunk so the public landing page stays light.
const AppRoot = lazy(() => import('./app/AppRoot.jsx'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/app/*"
          element={
            <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
              <AppRoot />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
