import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useSpring } from 'framer-motion'
import Background from './Background.jsx'
import Phone from './Phone.jsx'
import { PILLARS, INTEGRATIONS, DAY, STATS, TECH, PHASES, MONEY } from './content.js'
import './Landing.css'

const NAV = [
  ['Pillars', 'pillars'],
  ['Ecosystem', 'ecosystem'],
  ['A Day', 'journey'],
  ['Market', 'market'],
  ['Tech', 'tech'],
  ['Roadmap', 'roadmap'],
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
          <span className="ping" /> Concept Proposal · March 2026
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
          An AI-powered food intelligence platform that transforms how people discover,
          prepare, and relate to the food they eat, from pantry to plate to peak health.
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
          {[['3', 'Core Pillars'], ['7', 'Integrations'], ['$220B', 'Market Size'], ['∞', 'Recipes']].map(([n, l]) => (
            <div className="hstat" key={l}>
              <span className="hstat-n">{n}</span>
              <span className="hstat-l">{l}</span>
            </div>
          ))}
        </motion.div>

        <div className="scroll-cue"><span>Scroll</span><i /></div>
      </header>

      {/* EXECUTIVE SUMMARY */}
      <section id="summary" className="wrap">
        <SectionHead
          label="01 · Executive Summary"
          title={<>One intelligent home for<br /><em>everything food.</em></>}
        />
        <div className="summary-grid">
          <Reveal className="summary-lead" i={1}>
            <p>
              Ruchi is an AI-first mobile application that unifies three of the most common
              pain points modern eaters face: discovering new recipes, knowing what to cook
              with what’s on hand, and staying consistent with health and nutrition goals.
            </p>
            <p>
              By combining computer vision, large language models, nutritional databases,
              and a deeply personalised health engine, Ruchi meets people wherever they are:
              watching a food video, standing at the fridge, or planning a week of eating well.
            </p>
          </Reveal>
          <Reveal className="insight-card" i={2}>
            <span className="insight-tag">The core insight</span>
            <p>
              Food apps today are fragmented: recipe apps, calorie trackers, grocery apps,
              and health apps all live in silos. <strong>Ruchi collapses these into one
              intelligent, interconnected experience.</strong>
            </p>
            <div className="why-now">
              <span className="insight-tag">Why now</span>
              <p>
                Affordable AI vision, on-device ML, and rising demand for personalised health
                create a rare window. Competitors are too generic, too niche, or too shallow.
                Ruchi is the first to deeply integrate every dimension of food intelligence.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="rule" />

      {/* PILLARS */}
      <section id="pillars" className="wrap">
        <SectionHead
          center
          label="02 · Core Product Pillars"
          title={<>Three Pillars of<br /><em>Intelligent Eating</em></>}
          desc="Each pillar works on its own; together they create compounding value, bringing AI vision, nutritional science, and personalised coaching into one seamless flow."
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

      {/* ECOSYSTEM */}
      <section id="ecosystem" className="wrap soft">
        <SectionHead
          label="03 · Integration Ecosystem"
          title={<>Connecting the dots into<br /><em>one living platform</em></>}
          desc="Ruchi does not exist in isolation. A carefully chosen set of integrations embeds it into the daily rhythms of users’ lives."
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

      {/* JOURNEY */}
      <section id="journey" className="wrap">
        <div className="journey-grid">
          <div>
            <SectionHead
              label="04 · User Experience"
              title={<>A Day in the Life<br /><em>with Ruchi</em></>}
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
          <span className="eyebrow">Design Philosophy</span>
          <p className="philo-lead">
            Ruchi is conceived as a <em>visually exceptional</em> product: fluid, physics-based
            micro-animations on every screen. Ingredient cards that spring into view, recipe
            steps that slide with natural momentum, a dashboard that animates progress with
            satisfying feedback.
          </p>
          <p className="philo-sub">
            Onboarding feels more like a short film than a form. The pantry scanner overlays
            ingredients in real time. The cookbook is a living, scrollable gallery, never a
            static list. Ruchi should feel as good to use as the food it helps you cook tastes to eat.
          </p>
        </Reveal>
      </section>

      <div className="rule" />

      {/* MARKET */}
      <section id="market" className="wrap">
        <SectionHead
          label="05 · Market Opportunity"
          title={<>A massive,<br /><em>growing market</em></>}
          desc="Ruchi sits at the convergence of food-tech, digital health, and AI consumer apps, each large alone, together a generational opportunity."
        />
        <div className="stats-grid">
          {STATS.map((s, i) => (
            <Reveal key={s.label} className="stat" i={i % 3}>
              <span className="stat-n">{s.num}</span>
              <span className="stat-l">{s.label}</span>
            </Reveal>
          ))}
        </div>
        <Reveal className="landscape" i={1}>
          <span className="eyebrow">Competitive Landscape</span>
          <p>
            Existing solutions are fragmented. MyFitnessPal tracks calories but offers no
            recipe discovery or AI planning. Yummly offers recipes but no health integration.
            TikTok and Instagram surface great food content with no structured extraction.
            <strong> Ruchi is the only proposed solution connecting all three layers into one
            coherent experience</strong>, built integration-first from day one, where legacy
            incumbents are structurally locked out.
          </p>
        </Reveal>
      </section>

      <div className="rule" />

      {/* TECH */}
      <section id="tech" className="wrap soft">
        <SectionHead
          label="06 · Technology Overview"
          title={<>Built for scale<br /><em>& intelligence</em></>}
          desc="Architected to be scalable, intelligent, and privacy-respecting from the ground up."
        />
        <div className="tech-grid">
          {TECH.map((g, i) => (
            <Reveal key={g.group} className="tech-card" i={i % 2}>
              <h4 className="tech-group">{g.group}</h4>
              <ul>{g.items.map(it => <li key={it}>{it}</li>)}</ul>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="rule" />

      {/* ROADMAP */}
      <section id="roadmap" className="wrap">
        <SectionHead
          label="07 · Go-to-Market Roadmap"
          title={<>Roadmap to launch</>}
          desc="A phased rollout that validates core assumptions early and layers value as the user base grows."
        />
        <div className="road-grid">
          {PHASES.map((p, i) => (
            <Reveal key={p.phase} className="road-card" i={i}>
              <div className="road-head">
                <span className="road-phase">{p.phase}</span>
                <span className="road-months">{p.months}</span>
              </div>
              <h4 className="road-title">{p.title}</h4>
              <ul>{p.items.map(it => <li key={it}>{it}</li>)}</ul>
            </Reveal>
          ))}
        </div>

        <Reveal className="money" i={1}>
          <span className="eyebrow">Monetisation Strategy</span>
          <ul className="money-list">
            {MONEY.map(m => <li key={m}>{m}</li>)}
          </ul>
        </Reveal>
      </section>

      <div className="rule" />

      {/* VISION */}
      <section id="vision" className="vision">
        <div className="vision-glow" />
        <Reveal className="vision-inner">
          <span className="eyebrow">08 · The Big Picture</span>
          <h2 className="vision-title">
            Food is the foundation<br />of <span className="grad">everything.</span>
          </h2>
          <p className="vision-sub">
            Ruchi is not just a recipe app. It is an intelligent food companion that meets
            people at the intersection of culture, curiosity, and health: something people
            genuinely love to open every day, because it makes cooking, eating, and living
            healthier feel effortless and exciting.
          </p>
          <p className="vision-close">
            The vision is ambitious by design: a level of craft in AI, personalisation, and
            interaction that goes beyond anything the food-app space has seen. We believe
            Antigravity is the right partner to bring it to life.
          </p>
          <div className="hero-cta">
            <Link to="/app" className="btn btn-primary">Launch the App →</Link>
            <a href="#top" className="btn btn-ghost">Back to Top</a>
          </div>
        </Reveal>
      </section>

      <footer className="foot">
        <span className="foot-brand">Ruchi <span className="brand-sub">రుచి</span></span>
        <span className="foot-text">Concept Proposal · Prepared for Antigravity · March 2026 · Confidential</span>
        <span className="foot-text">Concept by Rishika</span>
      </footer>
    </div>
  )
}
