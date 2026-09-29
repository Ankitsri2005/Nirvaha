import { useId } from 'react'
import { cx } from '../lib/format'
import AnimatedNumber from './AnimatedNumber'

/**
 * The KPI tile on the dashboard. `tone` drives the accent rail and glow, and
 * `spark` draws a 40 px inline SVG so each tile carries its own trend.
 */
export default function StatCard({
  label,
  value,
  decimals = 0,
  suffix = '',
  prefix = '',
  unit,
  hint,
  icon: Icon,
  tone = 'info',
  spark,
  animate = true,
  className = '',
  children,
}) {
  const tones = {
    safe: { text: 'text-thermal-safe', glow: 'from-thermal-safe/18', iconBg: 'bg-thermal-safe/12', stroke: '#3DDC97' },
    warn: { text: 'text-thermal-warm', glow: 'from-thermal-warm/18', iconBg: 'bg-thermal-warm/12', stroke: '#FFC24B' },
    crit: { text: 'text-thermal-crit', glow: 'from-thermal-crit/20', iconBg: 'bg-thermal-crit/12', stroke: '#FF5C7A' },
    info: { text: 'text-glacier-300', glow: 'from-glacier-500/18', iconBg: 'bg-glacier-500/12', stroke: '#22D3EE' },
    orbit: { text: 'text-orbit-300', glow: 'from-orbit-400/18', iconBg: 'bg-orbit-400/12', stroke: '#A78BFF' },
  }
  const t = tones[tone] || tones.info

  return (
    <div className={cx('glass panel-hover group relative', className)}>
      <div className={cx('absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent opacity-70', t.glow)} />
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="label">{label}</p>
          <p className={cx('mt-2 font-mono text-[26px] font-semibold leading-none tracking-tight', t.text)}>
            {animate ? (
              <AnimatedNumber value={value} decimals={decimals} prefix={prefix} suffix={suffix} />
            ) : (
              <>
                {prefix}
                {Number(value ?? 0).toFixed(decimals)}
                {suffix}
              </>
            )}
            {unit && <span className="ml-1 text-[12px] font-medium text-cream-faint">{unit}</span>}
          </p>
          {hint && <p className="mt-2 truncate text-[11.5px] text-cream-faint">{hint}</p>}
          {children}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3">
          {Icon && (
            <span className={cx('grid h-9 w-9 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110', t.iconBg, t.text)}>
              <Icon size={17} strokeWidth={2.1} />
            </span>
          )}
          {spark?.length > 1 && <Sparkline values={spark} color={t.stroke} />}
        </div>
      </div>
    </div>
  )
}

function Sparkline({ values, color, w = 64, h = 26 }) {
  // ids are global to the document, so a fixed id would make every tile on the
  // page resolve to the first tile's gradient
  const id = `spark-${useId().replace(/:/g, '')}`
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - ((v - min) / span) * (h - 3) - 1.5
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg width={w} height={h} className="overflow-visible opacity-90">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts.join(' ')} ${w},${h}`} fill={`url(#${id})`} />
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
      />
    </svg>
  )
}
