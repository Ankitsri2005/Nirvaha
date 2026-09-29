import { useMemo } from 'react'
import { cx } from '../lib/format'

/** Tiny inline trend line. No axes, no gridlines - it sits inside a card. */
export default function Sparkline({ values, color = '#22D3EE', w = 52, h = 22, fill = true }) {
  const { pts, area } = useMemo(() => {
    if (!values?.length) return { pts: '', area: '' }
    const min = Math.min(...values)
    const max = Math.max(...values)
    const span = max - min || 1
    const p = values.map((v, i) => {
      const x = values.length === 1 ? w / 2 : (i / (values.length - 1)) * w
      const y = h - ((v - min) / span) * (h - 4) - 2
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    return { pts: p.join(' '), area: `0,${h} ${p.join(' ')} ${w},${h}` }
  }, [values, w, h])

  if (!pts) return <div style={{ width: w, height: h }} />

  const gid = `sg-${color.replace('#', '')}`
  return (
    <svg width={w} height={h} className={cx('overflow-visible')} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <polygon points={area} fill={`url(#${gid})`} />}
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 3px ${color}77)` }}
      />
    </svg>
  )
}
