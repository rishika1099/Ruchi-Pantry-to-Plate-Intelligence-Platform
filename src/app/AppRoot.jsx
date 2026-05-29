import { Routes, Route } from 'react-router-dom'
import { StoreProvider } from '../lib/store.jsx'
import AppShell from './AppShell.jsx'
import RequireAuth from './RequireAuth.jsx'
import Dashboard from './Dashboard.jsx'
import Discover from './Discover.jsx'
import Pantry from './Pantry.jsx'
import Cookbook from './Cookbook.jsx'
import Health from './Health.jsx'

// Everything below /app lives in this lazily-loaded chunk: the store (and
// Supabase), the shell, and all screens. The public landing page never
// downloads any of it. Routes here are relative to the parent "/app/*".
export default function AppRoot() {
  return (
    <StoreProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="discover" element={<Discover />} />
          <Route path="pantry" element={<RequireAuth><Pantry /></RequireAuth>} />
          <Route path="cookbook" element={<RequireAuth><Cookbook /></RequireAuth>} />
          <Route path="health" element={<RequireAuth><Health /></RequireAuth>} />
        </Route>
      </Routes>
    </StoreProvider>
  )
}
