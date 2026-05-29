import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../lib/store.jsx'

export default function AuthModal({ open, onClose }) {
  const { auth } = useStore()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  if (!open) return null

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      if (mode === 'signup') {
        const res = await auth.signUp(email, password, name.trim())
        // Supabase returns a user but no session when email confirmation is on.
        if (!res.session) {
          setNotice('Check your inbox to confirm your email, then sign in.')
          setMode('signin')
        } else {
          onClose()
        }
      } else {
        await auth.signIn(email, password)
        onClose()
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div className="auth-overlay" onClick={onClose}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="auth-card" onClick={e => e.stopPropagation()}
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
          <div className="auth-head">
            <span className="auth-logo">Ruchi <i>రుచి</i></span>
            <h2>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
            <p>{mode === 'signup'
              ? 'Save recipes and sync your pantry across devices.'
              : 'Sign in to sync your cookbook, pantry, and health log.'}</p>
          </div>

          <form className="auth-form" onSubmit={submit}>
            {mode === 'signup' && (
              <label>
                <span>Name</span>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your name" autoComplete="name" />
              </label>
            )}
            <label>
              <span>Email</span>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com" autoComplete="email" />
            </label>
            <label>
              <span>Password</span>
              <input type="password" required minLength={6} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
            </label>

            {error && <div className="auth-error">{error}</div>}
            {notice && <div className="auth-notice">{notice}</div>}

            <button type="submit" className="auth-submit" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div className="auth-switch">
            {mode === 'signup' ? (
              <>Already have an account?{' '}
                <button onClick={() => { setMode('signin'); setError('') }}>Sign in</button></>
            ) : (
              <>New to Ruchi?{' '}
                <button onClick={() => { setMode('signup'); setError('') }}>Create an account</button></>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
