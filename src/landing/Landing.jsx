import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useSpring } from 'framer-motion'
import Background from './Background.jsx'
import Phone from './Phone.jsx'
import { PILLARS, INTEGRATIONS, DAY } from './content.js'
import './Landing.css'

const NAV = [
  ['Features', 'pillars'],
  ['How it works', 'journey'],
  ['Integrations', 'ecosystem'],
]

const fade = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
}

function Reveal({ children, className = '', i = 0, as = 'div' }) {
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      variants={fade}
      custom={i}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
    >
      {children}
    </Tag>
  )
}

function SectionHead({ label, title, desc, center }) {
  return (
    <div className={`sec-head ${center ? 'center' : ''}`}>
      <Reveal as="span" className="eyebrow">{label}</Reveal>
      <Reveal as="h2" className="sec-title" i={1}>
        {title}
      </Reveal>
      {desc && <Reveal as="p" className="sec-desc" i={2}>{desc}</Reveal>}
    </div>
  )
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const { scrollYProgress } = useScroll()
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="landing">
      <Background />
      <motion.div className="progress" style={{ scaleX: bar }} />

      {/* NAV */}
      <nav className={scrolled ? 'nav scrolled' : 'nav'}>
        <a href="#top" className="brand">
          Ruchi <span className="brand-sub">రుచి</span>
        </a>
        <ul className="nav-links">
          {NAV.map(([t, h]) => <li key={h}><a href={`#${h}`}>{t}</a></li>)}
        </ul>
        <Link to="/app" className="badge">Launch App →</Link>
      </nav>

      {/* HERO */}
      <header id="top" className="hero">
        <motion.div
          className="hero-eyebrow"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <span className="ping" /> AI food intelligence · live now
        </motion.div>

        <motion.h1 className="hero-title"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
        >
          <span className="grad">Ruchi</span>
        </motion.h1>
        <motion.p className="hero-script"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >రుచి · the taste of living well</motion.p>

        <motion.p className="hero-tag"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >Eat Smarter. Live Better. Cook More.</motion.p>

        <motion.p className="hero-desc"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75 }}
        >
          Turn any cooking video into a recipe, cook from what is already in your pantry,
          and stay on track with effortless nutrition tracking. One app, from pantry to
          plate to peak health.
        </motion.p>

        <motion.div className="hero-cta"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <Link to="/app" className="btn btn-primary">Launch the App →</Link>
          <a href="#pillars" className="btn btn-ghost">Explore Features</a>
        </motion.div>

        <motion.div className="hero-stats"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          {[['3', 'Smart tools'], ['7', 'Integrations'], ['1-tap', 'Recipe import'], ['∞', 'Recipes']].map(([n, l]) => (
            <div className="hstat" key={l}>
              <span className="hstat-n">{n}</span>
              <span className="hstat-l">{l}</span>
            </div>
          ))}
        </motion.div>

        <div className="scroll-cue"><span>Scroll</span><i /></div>
      </header>

      <div className="rule" />

      {/* PILLARS */}
      <section id="pillars" className="wrap">
        <SectionHead
          center
          label="Features"
          title={<>Three tools for<br /><em>intelligent eating</em></>}
          desc="Each works on its own; together they bring AI vision, nutritional science, and personalised coaching into one seamless flow."
        />
        <div className="pillars-grid">
          {PILLARS.map((p, i) => (
            <Reveal key={p.n} className={`pillar accent-${p.accent}`} i={i}>
              <div className="pillar-top">
                <span className="pillar-n">{p.n}</span>
                <span className={`pillar-icon ic-${p.accent}`}>{p.emoji}</span>
              </div>
              <h3 className="pillar-title">{p.title}</h3>
              <p className="pillar-desc">{p.desc}</p>
              <div className="tags">
                {p.tags.map(t => <span key={t} className={`tag t-${p.accent}`}>{t}</span>)}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="rule" />

      {/* JOURNEY */}
      <section id="journey" className="wrap">
        <div className="journey-grid">
          <div>
            <SectionHead
              label="How it works"
              title={<>A day in the life<br /><em>with Ruchi</em></>}
              desc="Every touchpoint of your day, made smarter by a fluid, intuitive experience."
            />
            <div className="timeline">
              {DAY.map((d, i) => (
                <Reveal key={d.time} className="t-step" i={i}>
                  <div className="t-dot" />
                  <div className="t-time">{d.time}<span>{d.label}</span></div>
                  <p className="t-text">{d.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
          <div className="phone-col">
            <Phone />
          </div>
        </div>

        {/* Design philosophy */}
        <Reveal className="philosophy">
          <span className="eyebrow">Designed to delight</span>
          <p className="philo-lead">
            Ruchi is built to feel <em>visually exceptional</em>: fluid, physics-based
            micro-animations on every screen. Ingredient cards that spring into view, recipe
            steps that slide with natural momentum, a dashboard that animates progress with
            satisfying feedback.
          </p>
          <p className="philo-sub">
            The cookbook is a living, scrollable gallery, never a static list. Ruchi should
            feel as good to use as the food it helps you cook tastes to eat.
          </p>
        </Reveal>
      </section>

      <div className="rule" />

      {/* ECOSYSTEM */}
      <section id="ecosystem" className="wrap soft">
        <SectionHead
          label="Integrations"
          title={<>Connected to the<br /><em>rhythms of your life</em></>}
          desc="Ruchi does not exist in isolation. A carefully chosen set of integrations embeds it into your daily routine."
        />
        <div className="eco-grid">
          {INTEGRATIONS.map((it, i) => (
            <Reveal key={it.title} className="eco-card" i={i % 4}>
              <span className="eco-icon">{it.icon}</span>
              <h4 className="eco-title">{it.title}</h4>
              <p className="eco-desc">{it.desc}</p>
              <span className="eco-ex">{it.ex}</span>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="rule" />

      {/* CTA */}
      <section id="start" className="vision">
        <div className="vision-glow" />
        <Reveal className="vision-inner">
          <span className="eyebrow">Get started</span>
          <h2 className="vision-title">
            Cook smarter,<br />starting <span className="grad">today.</span>
          </h2>
          <p className="vision-sub">
            Ruchi is an intelligent food companion that meets you at the intersection of
            culture, curiosity, and health. Save your first recipe, scan your pantry, and
            track your day in minutes.
          </p>
          <div className="hero-cta">
            <Link to="/app" className="btn btn-primary">Launch the App →</Link>
            <a href="#top" className="btn btn-ghost">Back to Top</a>
          </div>
        </Reveal>
      </section>

      <footer className="foot">
        <span className="foot-brand">Ruchi <span className="brand-sub">రుచి</span></span>
        <span className="foot-text">The taste of living well.</span>
        <span className="foot-text">Made by Rishika</span>
      </footer>
    </div>
  )
}
