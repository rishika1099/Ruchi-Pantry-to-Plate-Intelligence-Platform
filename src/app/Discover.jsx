import { useState } from 'react'
import { motion } from 'framer-motion'
import { recipeFromVideo } from '../lib/ai.js'
import { useStore } from '../lib/store.jsx'
import { RecipeModal } from './RecipeCard.jsx'

const STAGES = [
  'Fetching the video…',
  'Watching the frames…',
  'Identifying ingredients…',
  'Reading the technique…',
  'Writing your recipe…',
]

export default function Discover() {
  const { saveRecipe, auth } = useStore()
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState(0)
  const [result, setResult] = useState(null)
  const [open, setOpen] = useState(null)

  async function run(e) {
    e.preventDefault()
    if (!url.trim() && !notes.trim()) return
    setLoading(true); setResult(null); setStage(0)
    const timer = setInterval(() => setStage(s => Math.min(STAGES.length - 1, s + 1)), 700)
    try {
      const recipe = await recipeFromVideo(url, notes)
      setResult(recipe)
    } finally {
      clearInterval(timer)
      setLoading(false)
    }
  }

  return (
    <div className="screen">
      <header className="scr-head">
        <div>
          <p className="scr-eyebrow">Video-to-Recipe Intelligence</p>
          <h1 className="scr-title">Discover</h1>
        </div>
      </header>

      <p className="scr-lede">
        Paste a link to any cooking video (TikTok, Reels, YouTube) and Ruchi turns it into a
        structured recipe with ingredients, steps, and full nutrition.
      </p>

      <form className="disc-form" onSubmit={run}>
        <div className="disc-field">
          <label>Video URL</label>
          <input
            type="url" placeholder="https://www.youtube.com/watch?v=…"
            value={url} onChange={e => setUrl(e.target.value)}
          />
        </div>
        <div className="disc-field">
          <label>Notes / dish description <span>(optional, helps when there’s no link)</span></label>
          <textarea
            rows={3} placeholder="e.g. one-pan lemon garlic salmon with asparagus"
            value={notes} onChange={e => setNotes(e.target.value)}
          />
        </div>
        <button className="btn-fill lg" disabled={loading}>
          {loading ? 'Extracting…' : '✨ Extract Recipe'}
        </button>
      </form>

      {loading && (
        <div className="disc-loading">
          <div className="disc-spinner" />
          <div className="disc-stages">
            {STAGES.map((s, i) => (
              <motion.div key={s}
                className={i <= stage ? 'disc-stage done' : 'disc-stage'}
                animate={{ opacity: i <= stage ? 1 : 0.35 }}>
                <span>{i < stage ? '✓' : i === stage ? '◐' : '○'}</span>{s}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {result && !loading && (
        <motion.div className="disc-result"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="disc-result-top">
            <div className="disc-result-emoji">{result.emoji}</div>
            <div>
              <div className="rcard-meta"><span>{result.cuisine}</span>·<span>{result.minutes} min</span>·<span>{result.difficulty}</span></div>
              <h2 className="disc-result-title">{result.title}</h2>
            </div>
          </div>
          {result.note && <p className="modal-note">{result.note}</p>}
          <div className="disc-result-actions">
            <button className="btn-soft" onClick={() => setOpen(result)}>View full recipe</button>
            <button className="btn-fill" onClick={() => { if (saveRecipe(result)) setOpen(result) }}>★ Save to Cookbook</button>
          </div>
          {auth.needsAuth && (
            <button className="save-hint" onClick={() => auth.openPrompt()}>🔒 Sign in to save this to your cookbook</button>
          )}
        </motion.div>
      )}

      <RecipeModal recipe={open} onClose={() => setOpen(null)} />
    </div>
  )
}
