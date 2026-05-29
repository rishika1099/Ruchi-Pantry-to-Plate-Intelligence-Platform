import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store.jsx'
import { RecipeCard, RecipeModal } from './RecipeCard.jsx'

function Ring({ value, max, label, sub, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const r = 52, c = 2 * Math.PI * r
  return (
    <div className="ring">
      <svg viewBox="0 0 120 120" className="ring-svg">
        <circle cx="60" cy="60" r={r} className="ring-bg" />
        <motion.circle cx="60" cy="60" r={r} className="ring-fg"
          style={{ stroke: color }}
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * pct) / 100 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="ring-center">
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
      <div className="ring-sub">{sub}</div>
    </div>
  )
}

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export default function Dashboard() {
  const { state, todayTotals } = useStore()
  const [open, setOpen] = useState(null)
  const t = todayTotals()
  const g = state.goal
  const remaining = Math.max(0, g.calories - t.calories)
  const suggested = state.cookbook.slice(0, 3)

  return (
    <div className="screen">
      <header className="scr-head">
        <div>
          <p className="scr-eyebrow">{greeting()}</p>
          <h1 className="scr-title">{state.profile.name} 👋</h1>
        </div>
        <Link to="/app/discover" className="btn-fill">🎬 Extract a recipe</Link>
      </header>

      <div className="dash-hero">
        <div className="dash-cal">
          <span className="dash-cal-l">Today’s energy</span>
          <div className="dash-cal-big">
            <strong>{t.calories.toLocaleString()}</strong>
            <span>/ {g.calories.toLocaleString()} cal</span>
          </div>
          <div className="dash-bar">
            <motion.i initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (t.calories / g.calories) * 100)}%` }}
              transition={{ duration: 1 }} />
          </div>
          <span className="dash-cal-sub">{remaining.toLocaleString()} cal remaining today</span>
        </div>
        <div className="dash-rings">
          <Ring value={t.protein} max={g.protein} label="protein" sub={`${t.protein} / ${g.protein}g`} color="var(--terra)" />
          <Ring value={t.carbs} max={g.carbs} label="carbs" sub={`${t.carbs} / ${g.carbs}g`} color="var(--saffron)" />
          <Ring value={t.fat} max={g.fat} label="fat" sub={`${t.fat} / ${g.fat}g`} color="var(--sage)" />
        </div>
      </div>

      <div className="dash-quick">
        <Link to="/app/pantry" className="quick-card">
          <span className="quick-ic">🧺</span>
          <strong>What can I cook?</strong>
          <span>{state.pantry.length} items in your pantry</span>
        </Link>
        <Link to="/app/discover" className="quick-card">
          <span className="quick-ic">🎬</span>
          <strong>Video → Recipe</strong>
          <span>Turn any cooking clip into steps</span>
        </Link>
        <Link to="/app/cookbook" className="quick-card">
          <span className="quick-ic">📖</span>
          <strong>My Cookbook</strong>
          <span>{state.cookbook.length} saved recipes</span>
        </Link>
      </div>

      <section className="dash-sec">
        <div className="dash-sec-head">
          <h2>Suggested for you</h2>
          <Link to="/app/cookbook" className="link-more">View all →</Link>
        </div>
        <div className="rgrid">
          {suggested.map((r, i) => <RecipeCard key={r.id} recipe={r} index={i} onOpen={setOpen} />)}
        </div>
      </section>

      <RecipeModal recipe={open} onClose={() => setOpen(null)} />
    </div>
  )
}
