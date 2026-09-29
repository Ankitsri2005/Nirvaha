import { useMemo } from 'react'
import { Sparkles, Brain, TrendingUp } from 'lucide-react'
import { cx, clamp } from '../lib/format'
import { RISK } from '../lib/palette'
import AnimatedNumber from './AnimatedNumber'

/**
 * Model output card. Phase 5 replaces the heuristic score with the real
 * Isolation Forest + Random Forest inference served by `ml_service.py`; the UI
 * contract (probability + band) is the same.
 */
export default function SpoilageRiskCard({ device, score, batch, className = '' }) {
  const pct = Math.round((score ?? 0) * 100)
  const band = pct >= 66 ? 'High' : pct >= 33 ? 'Medium' : 'Low'
  const t = RISK[band]
  const history = useMemo(
    () => Array.from({ length: 24 }, (_, i) => clamp(0.55 - i * 0.018, 0, 1) + (score ?? 0) * 0.35),
    [score],
  )

  return (
    <div className={cx('panel relative overflow-hidden', className)}>
      <span
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-2xl transition-colors duration-700"
        style={{ background: `${t.color}22` }}
      />
      <div className="panel-head relative">
        <span className="panel-title">
          <Sparkles size={13} style={{ color: t.color }} />
          Predicted spoilage risk
        </span>
        <span className="chip border-orbit-400/35 bg-orbit-400/10 text-orbit-300">
          <Brain size={10} /> phase 5
        </span>
      </div>

      <div className="relative p-5">
        <div className="flex items-end gap-3">
          <span className="font-mono text-[42px] font-semibold leading-none tracking-tight" style={{ color: t.color }}>
            <AnimatedNumber value={pct} decimals={0} suffix="%" />
          </span>
          <span
            className="mb-1.5 rounded-lg border px-2.5 py-1 text-[12px] font-bold uppercase tracking-wider"
            style={{ borderColor: `${t.color}55`, background: `${t.color}18`, color: t.color }}
          >
            {band}
          </span>
        </div>

        {/* risk meter */}
        <div className="relative mt-4 h-2 w-full overflow-hidden rounded-full bg-abyss-900">
          <div className="absolute inset-0 bg-thermal-bar opacity-25" />
          <span
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.max(2, pct)}%`,
              background: t.color,
              boxShadow: `0 0 14px ${t.color}aa`,
            }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[9.5px] font-semibold uppercase tracking-wider text-cream-faint">
          <span>safe</span>
          <span>watch</span>
          <span>act now</span>
        </div>

        {/* sparkline */}
        <div className="mt-4 h-9 w-full">
          <RiskBars values={history} color={t.color} />
        </div>

        <dl className="mt-4 space-y-1.5 border-t border-rim-soft pt-3 text-[11px]">
          <Row k="Batch" v={batch?.id} />
          <Row k="Node" v={device?.id} />
          <Row
            k="Drivers"
            v="temp excursion · ethylene · humidity"
            className="text-[10.5px]"
          />
          <Row k="Model" v="Isolation Forest + Random Forest" className="text-[10.5px]" />
        </dl>

        <p className="mt-3 flex items-start gap-1.5 text-[10.5px] leading-relaxed text-cream-faint">
          <TrendingUp size={12} className="mt-0.5 shrink-0 text-orbit-300" />
          {band === 'High'
            ? 'Re-ice or divert to the nearest cold store. Expect visible spoilage within 36 h at this trajectory.'
            : band === 'Medium'
              ? 'Trajectory is drifting. Keep the route short and avoid a compressor fault.'
              : 'Cold chain is holding. No corrective action needed.'}
        </p>
      </div>
    </div>
  )
}

function Row({ k, v, className = '' }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-cream-faint">{k}</dt>
      <dd className={cx('mono truncate text-cream-dim', className)}>{v || '-'}</dd>
    </div>
  )
}

function RiskBars({ values, color }) {
  return (
    <div className="flex h-full items-end gap-[3px]">
      {values.map((v, i) => {
        const h = Math.max(8, v * 100)
        const isLast = i === values.length - 1
        return (
          <span
            key={i}
            className="flex-1 rounded-sm transition-all duration-500"
            style={{
              height: `${h}%`,
              background: isLast ? color : `${color}44`,
              boxShadow: isLast ? `0 0 8px ${color}` : 'none',
              transitionDelay: `${i * 12}ms`,
            }}
          />
        )
      })}
    </div>
  )
}
