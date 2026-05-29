import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store.jsx'
import { recipesFromPantry } from '../lib/ai.js'
import { RecipeCard, RecipeModal } from './RecipeCard.jsx'

const QUICK = ['eggs', 'chicken', 'rice', 'pasta', 'tomatoes', 'spinach', 'cheese', 'onion', 'garlic', 'mushrooms']

export default function Pantry() {
  const { state, addPantry, removePantry } = useStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState(null)
  const [open, setOpen] = useState(null)

  function add(e) {
    e?.preventDefault()
    let added = false
    input.split(',').forEach(p => { if (addPantry(p)) added = true })
    if (added) setInput('')
  }

  async function cook() {
    setLoading(true); setMatches(null)
    try {
      setMatches(await recipesFromPantry(state.pantry))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen">
      <header className="scr-head">
        <div>
          <p className="scr-eyebrow">Pantry-to-Plate Engine</p>
          <h1 className="scr-title">Pantry</h1>
        </div>
        <button className="btn-fill" onClick={cook} disabled={loading || !state.pantry.length}>
          {loading ? 'Finding…' : '🍳 What can I cook?'}
        </button>
      </header>

      <p className="scr-lede">Tell Ruchi what you have. It surfaces recipes you can make right now, ranked by what’s already in your kitchen.</p>

      <form className="pantry-add" onSubmit={add}>
        <input placeholder="Add ingredients (comma separated)…"
          value={input} onChange={e => setInput(e.target.value)} />
        <button className="btn-soft">Add</button>
      </form>
      <div className="pantry-quick">
        {QUICK.filter(q => !state.pantry.includes(q)).map(q => (
          <button key={q} className="chip add" onClick={() => addPantry(q)}>+ {q}</button>
        ))}
      </div>

      <div className="pantry-list">
        {state.pantry.length === 0 && <p className="empty">Your pantry is empty. Add a few items above.</p>}
        {state.pantry.map(p => (
          <motion.span key={p} layout className="pantry-chip"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            {p}
            <button onClick={() => removePantry(p)}>✕</button>
          </motion.span>
        ))}
      </div>

      {loading && (
        <div className="disc-loading"><div className="disc-spinner" /><p className="muted">Matching recipes to your pantry…</p></div>
      )}

      {matches && !loading && (
        <section className="dash-sec">
          <div className="dash-sec-head"><h2>You can make {matches.length} dishes</h2></div>
          <div className="rgrid">
            {matches.map((r, i) => <RecipeCard key={r.id} recipe={r} index={i} onOpen={setOpen} />)}
          </div>
        </section>
      )}

      <RecipeModal recipe={open} onClose={() => setOpen(null)} />
    </div>
  )
}
