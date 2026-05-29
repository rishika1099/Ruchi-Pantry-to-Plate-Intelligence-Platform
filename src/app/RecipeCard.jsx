import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../lib/store.jsx'

export function RecipeCard({ recipe, onOpen, index = 0 }) {
  const { hasRecipe, saveRecipe, removeRecipe } = useStore()
  const saved = hasRecipe(recipe.id)
  return (
    <motion.div
      className="rcard"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      onClick={() => onOpen?.(recipe)}
    >
      <div className="rcard-emoji">{recipe.emoji}</div>
      <div className="rcard-body">
        <div className="rcard-meta">
          <span>{recipe.cuisine}</span>·<span>{recipe.minutes} min</span>·<span>{recipe.difficulty}</span>
        </div>
        <h3 className="rcard-title">{recipe.title}</h3>
        <div className="rcard-nums">
          <span className="rcard-cal">{recipe.calories} cal</span>
          <span className="rcard-mac">P {recipe.macros?.protein}g · C {recipe.macros?.carbs}g · F {recipe.macros?.fat}g</span>
        </div>
        {typeof recipe.matched === 'number' && (
          <div className="rcard-match">✓ {recipe.matched} of your ingredients</div>
        )}
        <div className="rcard-tags">
          {(recipe.tags || []).slice(0, 3).map(t => <span key={t} className="chip">{t}</span>)}
        </div>
      </div>
      <button
        className={saved ? 'rcard-save saved' : 'rcard-save'}
        onClick={(e) => { e.stopPropagation(); saved ? removeRecipe(recipe.id) : saveRecipe(recipe) }}
        title={saved ? 'Remove from cookbook' : 'Save to cookbook'}
      >
        {saved ? '★' : '☆'}
      </button>
    </motion.div>
  )
}

export function RecipeModal({ recipe, onClose }) {
  const { hasRecipe, saveRecipe, removeRecipe, logMeal, auth } = useStore()
  return (
    <AnimatePresence>
      {recipe && (
        <motion.div className="modal-backdrop"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}>
          <motion.div className="modal"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={e => e.stopPropagation()}>
            <button className="modal-x" onClick={onClose}>✕</button>
            <div className="modal-head">
              <div className="modal-emoji">{recipe.emoji}</div>
              <div>
                <div className="modal-meta">{recipe.cuisine} · {recipe.minutes} min · {recipe.difficulty} · {recipe.servings} servings</div>
                <h2 className="modal-title">{recipe.title}</h2>
                <div className="modal-tags">
                  {(recipe.tags || []).map(t => <span key={t} className="chip">{t}</span>)}
                </div>
              </div>
            </div>

            <div className="modal-macros">
              <div className="mm"><span>{recipe.calories}</span><i>calories</i></div>
              <div className="mm"><span>{recipe.macros?.protein}g</span><i>protein</i></div>
              <div className="mm"><span>{recipe.macros?.carbs}g</span><i>carbs</i></div>
              <div className="mm"><span>{recipe.macros?.fat}g</span><i>fat</i></div>
            </div>

            {recipe.note && <p className="modal-note">{recipe.note}</p>}

            <div className="modal-cols">
              <div>
                <h4 className="modal-h">Ingredients</h4>
                <ul className="modal-ing">
                  {recipe.ingredients?.map((it, i) => <li key={i}>{it}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="modal-h">Method</h4>
                <ol className="modal-steps">
                  {recipe.steps?.map((it, i) => <li key={i}>{it}</li>)}
                </ol>
              </div>
            </div>

            <div className="modal-actions">
              {hasRecipe(recipe.id)
                ? <button className="btn-soft" onClick={() => removeRecipe(recipe.id)}>★ Saved · Remove</button>
                : <button className="btn-soft" onClick={() => saveRecipe(recipe)}>☆ Save to Cookbook</button>}
              <button className="btn-fill" onClick={() => { if (logMeal(recipe)) onClose() }}>+ Log this meal</button>
            </div>
            {auth.needsAuth && (
              <button className="save-hint" onClick={() => auth.openPrompt()}>🔒 Sign in to save recipes and log meals</button>
            )}
            {recipe.source && <div className="modal-source">Source: {recipe.source}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
