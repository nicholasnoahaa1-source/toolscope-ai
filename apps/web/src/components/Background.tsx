import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import './Background.css'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

const PARTICLE_COUNT = 42

/**
 * Fundo tecnológico discreto: partículas leves flutuando em canvas.
 * Carregado sob demanda (React.lazy em App.tsx) para não pesar o bundle
 * inicial. Pausa completamente quando o usuário prefere menos movimento.
 */
export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || prefersReducedMotion) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let frameId = 0

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00012,
      vy: (Math.random() - 0.5) * 0.00012,
      radius: Math.random() * 1.4 + 0.4,
    }))

    function resize() {
      if (!canvas) return
      width = canvas.clientWidth
      height = canvas.clientHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function tick() {
      ctx!.clearRect(0, 0, width, height)
      for (const particle of particles) {
        particle.x += particle.vx
        particle.y += particle.vy
        if (particle.x < 0 || particle.x > 1) particle.vx *= -1
        if (particle.y < 0 || particle.y > 1) particle.vy *= -1

        ctx!.beginPath()
        ctx!.arc(particle.x * width, particle.y * height, particle.radius, 0, Math.PI * 2)
        ctx!.fillStyle = 'rgba(127, 228, 255, 0.35)'
        ctx!.fill()
      }
      frameId = requestAnimationFrame(tick)
    }

    resize()
    tick()

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
    }
  }, [prefersReducedMotion])

  return (
    <div className="background" aria-hidden="true">
      <div className="background-grid" />
      {!prefersReducedMotion && <canvas ref={canvasRef} className="background-canvas" />}
    </div>
  )
}
