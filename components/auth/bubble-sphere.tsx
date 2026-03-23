"use client"

import { useEffect, useRef, useCallback } from "react"

interface Bubble {
  lx: number
  ly: number
  r: number
  depth: number
  baseAlpha: number
  hoverAmt: number
  popProgress: number
  popped: boolean
  phase: number
  shimmerSpeed: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  decay: number
  size: number
  bright: number
}

const P = {
  outline: { r: 0, g: 80, b: 60 },
  glow: { r: 45, g: 200, b: 120 },
  pop: { r: 120, g: 255, b: 160 },
  highlight: { r: 30, g: 160, b: 100 },
}

const rgb = (c: { r: number; g: number; b: number }, a = 1) =>
  `rgba(${c.r},${c.g},${c.b},${a})`

export function BubbleSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef({
    bubbles: [] as Bubble[],
    particles: [] as Particle[],
    mouse: { x: -999, y: -999 },
    w: 0,
    h: 0,
    cx: 0,
    cy: 0,
    t: 0,
    cursorGlow: 0,
    running: true,
    animId: 0,
  })

  const buildSphere = useCallback(() => {
    const s = stateRef.current
    s.bubbles = []
    const SPHERE_R = Math.min(s.w, s.h) * 0.42
    const BUBBLE_R = SPHERE_R * 0.095
    const GAP = BUBBLE_R * 0.08
    const step = BUBBLE_R * 2 + GAP
    const range = Math.ceil(SPHERE_R / step) + 1

    const candidates: { lx: number; ly: number }[] = []
    for (let ix = -range; ix <= range; ix++) {
      for (let iy = -range; iy <= range; iy++) {
        const ox = (iy % 2) * step * 0.5
        const x = ix * step + ox
        const y = iy * step * 0.866
        if (Math.sqrt(x * x + y * y) + BUBBLE_R * 0.7 <= SPHERE_R) {
          candidates.push({ lx: x, ly: y })
        }
      }
    }

    candidates.forEach((c) => {
      const distNorm = Math.sqrt(c.lx * c.lx + c.ly * c.ly) / SPHERE_R
      const z = Math.sqrt(Math.max(0, 1 - distNorm * distNorm))
      const r = BUBBLE_R * (0.82 + z * 0.26)
      s.bubbles.push({
        lx: c.lx,
        ly: c.ly,
        r,
        depth: z,
        baseAlpha: 0.12 + z * 0.18,
        hoverAmt: 0,
        popProgress: -1,
        popped: false,
        phase: Math.random() * Math.PI * 2,
        shimmerSpeed: 0.4 + Math.random() * 0.6,
      })
    })
    s.bubbles.sort((a, b) => a.depth - b.depth)
  }, [])

  const spawnParticles = useCallback((x: number, y: number, r: number, depth: number) => {
    const s = stateRef.current
    const count = 8 + Math.floor(depth * 8)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4
      const speed = (1 + Math.random() * 2.5) * (r / 14)
      s.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.03 + Math.random() * 0.03,
        size: 1.5 + Math.random() * 2.5,
        bright: depth,
      })
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const s = stateRef.current
    s.running = true

    const resize = () => {
      const rect = container.getBoundingClientRect()
      s.w = canvas.width = rect.width
      s.h = canvas.height = rect.height
      s.cx = s.w / 2
      s.cy = s.h / 2
      buildSphere()
    }

    const drawCursor = (x: number, y: number, near: boolean) => {
      s.cursorGlow += (near ? 1 : -1) * 0.08
      s.cursorGlow = Math.max(0, Math.min(1, s.cursorGlow))
      const r = 8 + s.cursorGlow * 6
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5)
      g.addColorStop(0, rgb(P.glow, 0.55 + s.cursorGlow * 0.35))
      g.addColorStop(0.4, rgb(P.glow, 0.15 + s.cursorGlow * 0.15))
      g.addColorStop(1, rgb(P.glow, 0))
      ctx.beginPath()
      ctx.arc(x, y, r * 2.5, 0, Math.PI * 2)
      ctx.fillStyle = g
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x, y, r * 0.35, 0, Math.PI * 2)
      ctx.fillStyle = rgb(P.glow, 0.9)
      ctx.fill()
    }

    const draw = () => {
      if (!s.running) return
      s.animId = requestAnimationFrame(draw)
      s.t += 0.016
      ctx.clearRect(0, 0, s.w, s.h)

      let nearAny = false

      s.bubbles.forEach((b) => {
        if (b.popped) return
        const bx = s.cx + b.lx
        const by = s.cy + b.ly
        const dx = s.mouse.x - bx
        const dy = s.mouse.y - by
        const dist = Math.sqrt(dx * dx + dy * dy)
        const proximity = Math.max(0, 1 - dist / (b.r * 3.5))
        const targetHover = proximity > 0.1 ? Math.pow(proximity, 1.2) : 0
        b.hoverAmt += (targetHover - b.hoverAmt) * 0.12
        if (b.hoverAmt > 0.05) nearAny = true

        if (b.hoverAmt > 0.85 && b.popProgress < 0 && !b.popped) {
          b.popProgress = 0
          spawnParticles(s.cx + b.lx, s.cy + b.ly, b.r, b.depth)
        }

        const shimmer = Math.sin(s.t * b.shimmerSpeed + b.phase) * 0.5 + 0.5
        const shimmerAlpha = b.baseAlpha + shimmer * 0.04

        if (b.popProgress >= 0) {
          b.popProgress += 0.065
          if (b.popProgress < 1) {
            const p = b.popProgress
            const alpha = (1 - p) * (0.6 + b.depth * 0.4)
            ctx.save()
            ctx.translate(bx, by)
            ctx.scale(1 + p * 0.5, 1 + p * 0.5)
            ctx.beginPath()
            ctx.arc(0, 0, b.r, 0, Math.PI * 2)
            ctx.strokeStyle = rgb(P.pop, alpha)
            ctx.lineWidth = 1.5 * (1 - p)
            ctx.stroke()
            const pg = ctx.createRadialGradient(0, 0, 0, 0, 0, b.r)
            pg.addColorStop(0, rgb(P.pop, alpha * 0.4))
            pg.addColorStop(1, rgb(P.pop, 0))
            ctx.beginPath()
            ctx.arc(0, 0, b.r, 0, Math.PI * 2)
            ctx.fillStyle = pg
            ctx.fill()
            ctx.restore()
          } else {
            b.popped = true
          }
          return
        }

        const hover = b.hoverAmt
        const fillGrad = ctx.createRadialGradient(
          bx - b.r * 0.3,
          by - b.r * 0.3,
          0,
          bx,
          by,
          b.r
        )
        if (hover > 0.05) {
          fillGrad.addColorStop(0, rgb(P.highlight, 0.18 + hover * 0.32))
          fillGrad.addColorStop(0.5, rgb(P.highlight, 0.04 + hover * 0.12))
          fillGrad.addColorStop(1, rgb(P.outline, 0))
        } else {
          fillGrad.addColorStop(0, `rgba(0,30,18,${shimmerAlpha * 0.8})`)
          fillGrad.addColorStop(1, "rgba(0,0,0,0)")
        }
        ctx.beginPath()
        ctx.arc(bx, by, b.r, 0, Math.PI * 2)
        ctx.fillStyle = fillGrad
        ctx.fill()

        const oAlpha =
          (shimmerAlpha + hover * 0.55) * (0.5 + b.depth * 0.4) + hover * 0.5
        ctx.beginPath()
        ctx.arc(bx, by, b.r, 0, Math.PI * 2)
        ctx.strokeStyle =
          hover > 0.1
            ? rgb(P.glow, 0.3 + hover * 0.65)
            : rgb(P.outline, oAlpha)
        ctx.lineWidth = 0.8 + hover * 1.4
        ctx.stroke()

        if (b.depth > 0.3 || hover > 0.2) {
          ctx.beginPath()
          ctx.arc(
            bx - b.r * 0.28,
            by - b.r * 0.28,
            b.r * 0.32,
            Math.PI * 0.9,
            Math.PI * 1.9
          )
          ctx.strokeStyle = rgb(
            P.glow,
            0.06 + b.depth * 0.08 + hover * 0.25
          )
          ctx.lineWidth = 1.2 + hover
          ctx.stroke()
        }

        if (hover > 0.15) {
          const hg = ctx.createRadialGradient(
            bx,
            by,
            b.r * 0.8,
            bx,
            by,
            b.r * 2.4
          )
          hg.addColorStop(0, rgb(P.glow, hover * 0.22))
          hg.addColorStop(1, rgb(P.glow, 0))
          ctx.beginPath()
          ctx.arc(bx, by, b.r * 2.4, 0, Math.PI * 2)
          ctx.fillStyle = hg
          ctx.fill()
        }
      })

      s.particles = s.particles.filter((p) => p.life > 0)
      s.particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.04
        p.vx *= 0.96
        p.life -= p.decay
        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(0, p.size * p.life), 0, Math.PI * 2)
        ctx.fillStyle = rgb(P.glow, p.life * (0.5 + p.bright * 0.5))
        ctx.fill()
      })

      if (s.mouse.x > 0 && s.mouse.x < s.w) {
        drawCursor(s.mouse.x, s.mouse.y, nearAny)
      }
    }

    resize()

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      s.mouse.x = e.clientX - rect.left
      s.mouse.y = e.clientY - rect.top
    }
    const onMouseLeave = () => {
      s.mouse.x = -999
      s.mouse.y = -999
    }
    const onTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      s.mouse.x = e.touches[0].clientX - rect.left
      s.mouse.y = e.touches[0].clientY - rect.top
    }

    container.addEventListener("mousemove", onMouseMove)
    container.addEventListener("mouseleave", onMouseLeave)
    canvas.addEventListener("touchmove", onTouchMove, { passive: true })

    const ro = new ResizeObserver(() => resize())
    ro.observe(container)

    // Respawn popped bubbles
    const respawnInterval = setInterval(() => {
      const popped = s.bubbles.filter((b) => b.popped)
      if (!popped.length) return
      const b = popped[Math.floor(Math.random() * popped.length)]
      b.popped = false
      b.popProgress = -1
      b.hoverAmt = 0
      b.phase = Math.random() * Math.PI * 2
    }, 800)

    draw()

    return () => {
      s.running = false
      cancelAnimationFrame(s.animId)
      clearInterval(respawnInterval)
      container.removeEventListener("mousemove", onMouseMove)
      container.removeEventListener("mouseleave", onMouseLeave)
      canvas.removeEventListener("touchmove", onTouchMove)
      ro.disconnect()
    }
  }, [buildSphere, spawnParticles])

  return (
    <div ref={containerRef} className="relative size-full cursor-none">
      <canvas ref={canvasRef} className="absolute inset-0 block size-full" />
      {/* Right-edge fade so card panel looks grounded */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[rgba(27,61,39,0.55)]" />
    </div>
  )
}
