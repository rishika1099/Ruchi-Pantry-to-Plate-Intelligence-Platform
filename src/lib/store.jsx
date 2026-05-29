import { createContext, useContext, useEffect, useState } from 'react'
import { SAMPLE_RECIPES, SAMPLE_PANTRY, STARTER_GOAL } from './sample.js'

const KEY = 'ruchi-state-v1'

const todayKey = () => new Date().toISOString().slice(0, 10)

const initial = () => ({
  cookbook: SAMPLE_RECIPES,
  pantry: SAMPLE_PANTRY,
  goal: STARTER_GOAL,
  log: {}, // { 'YYYY-MM-DD': [ {id, title, calories, macros, emoji} ] }
  profile: { name: 'Rishika', diet: 'Balanced', restrictions: [] },
})

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

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignore */ }
  }, [state])

  const api = {
    state,

    // cookbook
    saveRecipe(recipe) {
      setState(s => {
        if (s.cookbook.some(r => r.id === recipe.id)) return s
        return { ...s, cookbook: [recipe, ...s.cookbook] }
      })
    },
    removeRecipe(id) {
      setState(s => ({ ...s, cookbook: s.cookbook.filter(r => r.id !== id) }))
    },
    hasRecipe(id) {
      return state.cookbook.some(r => r.id === id)
    },

    // pantry
    addPantry(item) {
      const v = item.trim().toLowerCase()
      if (!v) return
      setState(s => s.pantry.includes(v) ? s : { ...s, pantry: [...s.pantry, v] })
    },
    removePantry(item) {
      setState(s => ({ ...s, pantry: s.pantry.filter(p => p !== item) }))
    },

    // health log
    logMeal(recipe) {
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
    },
    removeLog(entryId) {
      const d = todayKey()
      setState(s => ({ ...s, log: { ...s.log, [d]: (s.log[d] || []).filter(e => e.id !== entryId) } }))
    },
    setGoal(goal) {
      setState(s => ({ ...s, goal: { ...s.goal, ...goal } }))
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

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
