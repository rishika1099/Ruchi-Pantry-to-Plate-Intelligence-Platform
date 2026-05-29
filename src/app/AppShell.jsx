import { NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store.jsx'
import AuthModal from './AuthModal.jsx'
import './app.css'

const NAV = [
  { to: '/app', end: true, icon: '🏠', label: 'Dashboard' },
  { to: '/app/discover', icon: '🎬', label: 'Discover' },
  { to: '/app/pantry', icon: '🧺', label: 'Pantry' },
  { to: '/app/cookbook', icon: '📖', label: 'Cookbook' },
  { to: '/app/health', icon: '❤️', label: 'Health' },
]

export default function AppShell() {
  const { state, auth } = useStore()
  const loc = useLocation()

  const signedIn = Boolean(auth.user)
  // Guests never show a cached profile name (e.g. a stale name from a previous
  // session). Only a signed-in account resolves to a real name.
  const displayName = signedIn
    ? (state.profile.name || auth.user?.email?.split('@')[0] || 'Guest')
    : (auth.configured ? 'Guest' : (state.profile.name || 'Guest'))

  return (
    <div className="shell">
      <div className="shell-bg" />

      <aside className="side">
        <Link to="/" className="side-brand">
          Ruchi <span>రుచి</span>
        </Link>
        <nav className="side-nav">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) => isActive ? 'side-link active' : 'side-link'}>
              <span className="side-ic">{n.icon}</span>{n.label}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <div className="side-profile">
            <div className="side-avatar">{displayName[0]?.toUpperCase()}</div>
            <div>
              <strong>{displayName}</strong>
              <span>{signedIn ? 'Synced account' : auth.configured ? 'Guest · not synced' : `${state.profile.diet} diet`}</span>
            </div>
          </div>
          {auth.configured && (
            signedIn
              ? <button className="side-auth" onClick={() => auth.signOut()}>Sign out</button>
              : <button className="side-auth" onClick={() => auth.openPrompt()}>Sign in</button>
          )}
          <Link to="/" className="side-exit">← Landing</Link>
        </div>
      </aside>

      <AuthModal open={auth.promptOpen} onClose={() => auth.closePrompt()} />

      {/* mobile tab bar */}
      <nav className="tabbar">
        {NAV.map(n => (
          <NavLink key={n.to} to={n.to} end={n.end}
            className={({ isActive }) => isActive ? 'tab active' : 'tab'}>
            <span>{n.icon}</span><i>{n.label}</i>
          </NavLink>
        ))}
      </nav>

      <main className="main">
        <motion.div
          key={loc.pathname}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
