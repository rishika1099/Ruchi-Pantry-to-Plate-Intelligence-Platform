import { motion } from 'framer-motion'

const RECIPES = [
  { e: '🥗', name: 'Greek Quinoa Bowl', meta: '420 cal · 22g protein · 25 min' },
  { e: '🍳', name: 'Veggie Egg Scramble', meta: '310 cal · 18g protein · 10 min' },
  { e: '🍜', name: 'Miso Ramen (Light)', meta: '380 cal · 15g protein · 20 min' },
]

const MACROS = [
  { e: '💪', label: 'Protein', val: '38 / 120g', pct: 32 },
  { e: '🌾', label: 'Carbs', val: '82 / 220g', pct: 37 },
  { e: '🥑', label: 'Fat', val: '22 / 65g', pct: 34 },
]

export default function Phone() {
  return (
    <motion.div
      className="phone"
      initial={{ opacity: 0, y: 40, rotateX: 12 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="phone-float">
        <div className="phone-frame">
          <div className="phone-notch" />
          <div className="phone-screen">
            <div className="ph-head">
              <div className="ph-greet">Good morning<strong>Maya 👋</strong></div>
              <div className="ph-avatar">M</div>
            </div>

            <div className="ph-goal">
              <span className="ph-goal-l">Today’s Goal</span>
              <span className="ph-goal-v">1,840 cal</span>
              <span className="ph-goal-s">648 consumed · 1,192 remaining</span>
              <div className="ph-bar"><motion.i
                initial={{ width: 0 }} whileInView={{ width: '35%' }}
                viewport={{ once: true }} transition={{ duration: 1.1, delay: 0.4 }}
              /></div>
            </div>

            <div className="ph-macros">
              {MACROS.map((m, i) => (
                <div className="ph-macro" key={m.label}>
                  <span className="ph-macro-e">{m.e}</span>
                  <span className="ph-macro-lab">{m.label}</span>
                  <span className="ph-macro-val">{m.val}</span>
                  <div className="ph-macro-track"><motion.i
                    initial={{ width: 0 }} whileInView={{ width: `${m.pct}%` }}
                    viewport={{ once: true }} transition={{ duration: 1, delay: 0.5 + i * 0.12 }}
                  /></div>
                </div>
              ))}
            </div>

            <span className="ph-sub">Suggested for you</span>
            {RECIPES.map((r, i) => (
              <motion.div className="ph-rec" key={r.name}
                initial={{ opacity: 0, x: 14 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.6 + i * 0.12 }}
              >
                <span className="ph-rec-e">{r.e}</span>
                <div>
                  <div className="ph-rec-name">{r.name}</div>
                  <div className="ph-rec-meta">{r.meta}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="phone-glow" />
        </div>
      </div>
    </motion.div>
  )
}
