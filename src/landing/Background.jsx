import { useEffect, useRef } from 'react'

const FOODS = ['🌿', '🍋', '🫐', '🍓', '🥑', '🌾', '🍊', '🫒', '🌶️', '🥕', '🍯', '🧄']

export default function Background() {
  const canvasRef = useRef(null)
  const glowRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let W, H, raf
    const particles = []

    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const make = (scatter) => ({
      x: Math.random() * W,
      y: scatter ? Math.random() * H : H + 40,
      size: 12 + Math.random() * 16,
      vy: -(0.15 + Math.random() * 0.4),
      vx: (Math.random() - 0.5) * 0.25,
      op: 0.05 + Math.random() * 0.10,
      emoji: FOODS[(Math.random() * FOODS.length) | 0],
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.004,
    })

    for (let i = 0; i < 30; i++) particles.push(make(true))

    const tick = () => {
      ctx.clearRect(0, 0, W, H)
      for (const p of particles) {
        p.y += p.vy; p.x += p.vx; p.rot += p.vr
        if (p.y < -50) Object.assign(p, make(false))
        ctx.save()
        ctx.globalAlpha = p.op
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.font = `${p.size}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(p.emoji, 0, 0)
        ctx.restore()
      }
      raf = requestAnimationFrame(tick)
    }
    tick()

    const move = (e) => {
      if (glowRef.current) {
        glowRef.current.style.transform =
          `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`
      }
    }
    window.addEventListener('mousemove', move)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', move)
    }
  }, [])

  return (
    <>
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="grain" />
      <canvas ref={canvasRef} className="bg-canvas" />
      <div ref={glowRef} className="cursor-glow" />
    </>
  )
}
