import { useEffect, useRef, useState } from 'react'

/**
 * Tweens a number toward its target on every change and re-renders at ~24 fps.
 * Used everywhere a value ticks so the UI never jumps.
 */
export default function AnimatedNumber({
  value,
  decimals = 1,
  duration = 700,
  prefix = '',
  suffix = '',
  className = '',
}) {
  const [display, setDisplay] = useState(value ?? 0)
  const fromRef = useRef(value ?? 0)
  const rafRef = useRef(0)

  useEffect(() => {
    const from = fromRef.current
    const to = Number(value ?? 0)
    if (from === to) return
    const t0 = performance.now()
    const factor = 10 ** decimals

    const step = (now) => {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - (1 - p) ** 3 // easeOutCubic
      const next = Math.round((from + (to - from) * eased) * factor) / factor
      setDisplay(next)
      fromRef.current = next
      if (p < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, decimals, duration])

  return (
    <span className={className}>
      {prefix}
      {Number(display).toFixed(decimals)}
      {suffix}
    </span>
  )
}
