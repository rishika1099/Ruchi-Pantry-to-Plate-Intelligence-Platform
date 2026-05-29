import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store.jsx'

function Bar({ label, value, goal, color }) {
  const pct = Math.min(100, Math.round((value / goal) * 100))
  return (
    <div className="hbar">
      <div className="hbar-top"><span>{label}</span><strong>{value} / {goal}g</strong></div>
      <div className="hbar-track">
        <motion.i style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} />
      </div>
    </div>
  )
}

export default function Health() {
  const { state, todayLog, todayTotals, removeLog, setGoal, auth } = useStore()
  const t = todayTotals()
  const g = state.goal
  const log = todayLog()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(g)

  function save() {
    const ok = setGoal({
      calories: Number(draft.calories) || g.calories,
      protein: Number(draft.protein) || g.protein,
      carbs: Number(draft.carbs) || g.carbs,
      fat: Number(draft.fat) || g.fat,
    })
    if (ok) setEditing(false)
  }

  return (
    <div className="screen">
      <header className="scr-head">
        <div>
          <p className="scr-eyebrow">Personalised Health & Diet Coach</p>
          <h1 className="scr-title">Health</h1>
        </div>
        <button className="btn-soft" onClick={() => { setDraft(g); setEditing(v => !v) }}>
          {editing ? 'Cancel' : '⚙ Edit goals'}
        </button>
      </header>

      {auth.needsAuth && (
        <button className="save-hint" onClick={() => auth.openPrompt()}>🔒 Sign in to save your goals and meal log</button>
      )}

      {editing && (
        <div className="goal-edit">
          {['calories', 'protein', 'carbs', 'fat'].map(k => (
            <label key={k}>
              {k}
              <input type="number" value={draft[k]} onChange={e => setDraft(d => ({ ...d, [k]: e.target.value }))} />
            </label>
          ))}
          <button className="btn-fill" onClick={save}>Save goals</button>
        </div>
      )}

      <div className="health-top">
        <div className="health-cal">
          <span className="dash-cal-l">Calories today</span>
          <div className="dash-cal-big"><strong>{t.calories.toLocaleString()}</strong><span>/ {g.calories.toLocaleString()}</span></div>
          <div className="dash-bar">
            <motion.i initial={{ width: 0 }} animate={{ width: `${Math.min(100, (t.calories / g.calories) * 100)}%` }} transition={{ duration: 1 }} />
          </div>
          <span className="dash-cal-sub">{Math.max(0, g.calories - t.calories).toLocaleString()} cal remaining</span>
        </div>
        <div className="health-bars">
          <Bar label="Protein" value={t.protein} goal={g.protein} color="var(--terra)" />
          <Bar label="Carbs" value={t.carbs} goal={g.carbs} color="var(--saffron)" />
          <Bar label="Fat" value={t.fat} goal={g.fat} color="var(--sage)" />
        </div>
      </div>

      <section className="dash-sec">
        <div className="dash-sec-head"><h2>Today’s log</h2></div>
        {log.length === 0 ? (
          <p className="empty">No meals logged yet. Open a recipe and tap “Log this meal”.</p>
        ) : (
          <div className="log-list">
            {log.map(e => (
              <motion.div key={e.id} className="log-row" layout
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <span className="log-emoji">{e.emoji}</span>
                <div className="log-info">
                  <strong>{e.title}</strong>
                  <span>{e.calories} cal · P {e.macros.protein}g · C {e.macros.carbs}g · F {e.macros.fat}g</span>
                </div>
                <button className="log-x" onClick={() => removeLog(e.id)}>✕</button>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
