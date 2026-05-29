import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { SAMPLE_RECIPES, SAMPLE_PANTRY, STARTER_GOAL } from './sample.js'
import { supabase, isSupabaseConfigured } from './supabase.js'

const KEY = 'ruchi-state-v1'

const todayKey = () => new Date().toISOString().slice(0, 10)

const initial = () => ({
  cookbook: SAMPLE_RECIPES,
  pantry: SAMPLE_PANTRY,
  goal: STARTER_GOAL,
  log: {}, // { 'YYYY-MM-DD': [ {id, title, calories, macros, emoji} ] }
  profile: { name: 'Guest', diet: 'Balanced', restrictions: [] },
})

// Only these keys are synced to the cloud; everything else is derived.
const SYNC_KEYS = ['cookbook', 'pantry', 'goal', 'log', 'profile']

function pickSynced(state) {
  const out = {}
  for (const k of SYNC_KEYS) out[k] = state[k]
  return out
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return initial()
    return { ...initial(), ...JSON.parse(raw) }
  } catch {
    return initial()
  }
}

const StoreCtx = createContext(null)

export function StoreProvider({ children }) {
  const [state, setState] = useState(load)
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured)
  const [authPrompt, setAuthPrompt] = useState(false)

  // Saving requires an account when auth is configured. Guests can browse and
  // generate freely, but persisting actions opens the sign-in prompt instead.
  const needsAuth = () => isSupabaseConfigured && !user
  const guard = () => {
    if (needsAuth()) { setAuthPrompt(true); return false }
    return true
  }

  // Guards so the debounced cloud push does not fire during the initial
  // login hydration (which would clobber remote data with local state).
  const hydrating = useRef(false)
  const saveTimer = useRef(null)

  // Always cache to localStorage so guests (and offline reloads) keep data.
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignore */ }
  }, [state])

  // ---- Supabase auth lifecycle -------------------------------------------
  useEffect(() => {
    if (!isSupabaseConfigured) return
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setUser(data.session?.user ?? null)
      setAuthReady(true)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  // On login, pull the cloud row. If it is empty (first login), seed it from
  // whatever is currently local so the user keeps the recipes they saved as a
  // guest. Otherwise the cloud copy wins.
  useEffect(() => {
    if (!isSupabaseConfigured || !user) return
    let active = true
    hydrating.current = true

    ;(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('data')
        .eq('id', user.id)
        .maybeSingle()

      if (!active) return

      // Resolve a display name from the account: signup name, else email prefix.
      const accountName = user.user_metadata?.name?.trim() || user.email?.split('@')[0] || 'Guest'

      if (!error && data?.data && Object.keys(data.data).length) {
        setState(s => ({
          ...initial(),
          ...data.data,
          profile: {
            ...s.profile,
            ...data.data.profile,
            name: data.data.profile?.name?.trim() || accountName,
          },
        }))
      } else {
        // No cloud data yet: adopt the account name, then push local state up.
        const seeded = { ...state, profile: { ...state.profile, name: accountName } }
        setState(seeded)
        await supabase.from('profiles').upsert({
          id: user.id,
          data: pickSynced(seeded),
          updated_at: new Date().toISOString(),
        })
      }
      // Let one render settle before re-enabling cloud writes.
      setTimeout(() => { hydrating.current = false }, 0)
    })()

    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Debounced cloud push whenever synced state changes (logged-in only).
  useEffect(() => {
    if (!isSupabaseConfigured || !user || hydrating.current) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      supabase.from('profiles').upsert({
        id: user.id,
        data: pickSynced(state),
        updated_at: new Date().toISOString(),
      }).then(() => {}, () => {})
    }, 800)
    return () => clearTimeout(saveTimer.current)
  }, [state, user])

  const api = {
    state,

    // auth
    auth: {
      user,
      ready: authReady,
      configured: isSupabaseConfigured,
      needsAuth: needsAuth(),
      promptOpen: authPrompt,
      openPrompt: () => setAuthPrompt(true),
      closePrompt: () => setAuthPrompt(false),
      async signUp(email, password, name) {
        if (!isSupabaseConfigured) throw new Error('Auth is not configured.')
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        })
        if (error) throw error
        if (name) setState(s => ({ ...s, profile: { ...s.profile, name } }))
        if (data.session) setAuthPrompt(false)
        return data
      },
      async signIn(email, password) {
        if (!isSupabaseConfigured) throw new Error('Auth is not configured.')
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setAuthPrompt(false)
        return data
      },
      async signOut() {
        if (!isSupabaseConfigured) return
        await supabase.auth.signOut()
        // Reset to a fresh guest state so the next visitor does not see the
        // signed-out user's cached data.
        setState(initial())
      },
    },

    // cookbook
    saveRecipe(recipe) {
      if (!guard()) return false
      setState(s => {
        if (s.cookbook.some(r => r.id === recipe.id)) return s
        return { ...s, cookbook: [recipe, ...s.cookbook] }
      })
      return true
    },
    removeRecipe(id) {
      if (!guard()) return false
      setState(s => ({ ...s, cookbook: s.cookbook.filter(r => r.id !== id) }))
      return true
    },
    hasRecipe(id) {
      return state.cookbook.some(r => r.id === id)
    },

    // pantry
    addPantry(item) {
      if (!guard()) return false
      const v = item.trim().toLowerCase()
      if (!v) return false
      setState(s => s.pantry.includes(v) ? s : { ...s, pantry: [...s.pantry, v] })
      return true
    },
    removePantry(item) {
      if (!guard()) return false
      setState(s => ({ ...s, pantry: s.pantry.filter(p => p !== item) }))
      return true
    },

    // health log
    logMeal(recipe) {
      if (!guard()) return false
      const d = todayKey()
      const entry = {
        id: recipe.id + '-' + Date.now(),
        title: recipe.title,
        emoji: recipe.emoji || '🍽️',
        calories: recipe.calories || 0,
        macros: recipe.macros || { protein: 0, carbs: 0, fat: 0 },
        at: Date.now(),
      }
      setState(s => ({ ...s, log: { ...s.log, [d]: [...(s.log[d] || []), entry] } }))
      return true
    },
    removeLog(entryId) {
      if (!guard()) return false
      const d = todayKey()
      setState(s => ({ ...s, log: { ...s.log, [d]: (s.log[d] || []).filter(e => e.id !== entryId) } }))
      return true
    },
    setGoal(goal) {
      if (!guard()) return false
      setState(s => ({ ...s, goal: { ...s.goal, ...goal } }))
      return true
    },
    setProfile(profile) {
      if (!guard()) return false
      setState(s => ({ ...s, profile: { ...s.profile, ...profile } }))
      return true
    },
    todayLog() {
      return state.log[todayKey()] || []
    },
    todayTotals() {
      const entries = state.log[todayKey()] || []
      return entries.reduce((acc, e) => ({
        calories: acc.calories + (e.calories || 0),
        protein: acc.protein + (e.macros?.protein || 0),
        carbs: acc.carbs + (e.macros?.carbs || 0),
        fat: acc.fat + (e.macros?.fat || 0),
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
    },
  }

  return <StoreCtx.Provider value={api}>{children}</StoreCtx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
