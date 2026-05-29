import { useEffect } from 'react'
import { useStore } from '../lib/store.jsx'

// Wraps personal sections (Dashboard, Pantry, Cookbook, Health). When auth is
// configured and nobody is signed in, it blocks the section and opens the
// sign-in prompt instead. In local dev (auth not configured) it is a pass
// through so the app stays fully usable without Supabase.
export default function RequireAuth({ children }) {
  const { auth } = useStore()

  useEffect(() => {
    if (auth.needsAuth) auth.openPrompt()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.needsAuth])

  // Wait for the initial session check so signed-in users do not flash the gate
  // on reload.
  if (auth.configured && !auth.ready) {
    return (
      <div className="screen gate">
        <div className="disc-spinner" />
      </div>
    )
  }

  if (auth.needsAuth) {
    return (
      <div className="screen gate">
        <div className="gate-card">
          <div className="gate-ic">🔒</div>
          <h2>Sign in to continue</h2>
          <p>Create a free account or sign in to use your pantry, cookbook, and
            health tracker. Everything syncs securely across your devices.</p>
          <button className="btn-fill lg" onClick={() => auth.openPrompt()}>
            Sign in / Create account
          </button>
        </div>
      </div>
    )
  }

  return children
}
