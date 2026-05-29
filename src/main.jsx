import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Landing from './landing/Landing.jsx'
import { StoreProvider } from './lib/store.jsx'
import AppShell from './app/AppShell.jsx'
import Dashboard from './app/Dashboard.jsx'
import Discover from './app/Discover.jsx'
import Pantry from './app/Pantry.jsx'
import Cookbook from './app/Cookbook.jsx'
import Health from './app/Health.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="discover" element={<Discover />} />
            <Route path="pantry" element={<Pantry />} />
            <Route path="cookbook" element={<Cookbook />} />
            <Route path="health" element={<Health />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
)
