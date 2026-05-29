import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/store.jsx'
import { RecipeCard, RecipeModal } from './RecipeCard.jsx'

export default function Cookbook() {
  const { state } = useStore()
  const [open, setOpen] = useState(null)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('All')

  const cuisines = useMemo(
    () => ['All', ...new Set(state.cookbook.map(r => r.cuisine).filter(Boolean))],
    [state.cookbook]
  )

  const list = state.cookbook.filter(r => {
    const okC = filter === 'All' || r.cuisine === filter
    const okQ = !q || r.title.toLowerCase().includes(q.toLowerCase())
    return okC && okQ
  })

  return (
    <div className="screen">
      <header className="scr-head">
        <div>
          <p className="scr-eyebrow">Your saved recipes</p>
          <h1 className="scr-title">Cookbook</h1>
        </div>
        <Link to="/app/discover" className="btn-fill">+ Add recipe</Link>
      </header>

      <div className="cb-controls">
        <input className="cb-search" placeholder="Search recipes…" value={q} onChange={e => setQ(e.target.value)} />
        <div className="cb-filters">
          {cuisines.map(c => (
            <button key={c} className={c === filter ? 'chip filter active' : 'chip filter'} onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="empty-state">
          <span>📖</span>
          <p>No recipes here yet.</p>
          <Link to="/app/discover" className="btn-fill">Extract your first recipe</Link>
        </div>
      ) : (
        <div className="rgrid">
          {list.map((r, i) => <RecipeCard key={r.id} recipe={r} index={i} onOpen={setOpen} />)}
        </div>
      )}

      <RecipeModal recipe={open} onClose={() => setOpen(null)} />
    </div>
  )
}
