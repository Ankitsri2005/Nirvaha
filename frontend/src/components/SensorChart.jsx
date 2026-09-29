import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
} from 'recharts'
import { Thermometer, Droplets, Wind } from 'lucide-react'
import { fmtTime } from '../lib/format'
import { C } from '../lib/palette'

const TABS = [
  { key: 'temperature', label: 'Temperature', icon: Thermometer, unit: '\u00b0C', color: () => C.glacier },
  { key: 'humidity', label: 'Humidity', icon: Droplets, unit: '%', color: () => C.orbit },
  { key: 'gas', label: 'Ethylene', icon: Wind, unit: 'ppm', color: () => C.warm },
]

function Tip({ active, payload, label, unit, band, color }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-rim bg-abyss-900/95 px-3 py-2 shadow-panel backdrop-blur-md">
      <p className="mono text-[10px] text-cream-faint">{label}</p>
      <p className="mono mt-0.5 text-[14px] font-semibold" style={{ color }}>
        {payload[0].value}
        <span className="ml-0.5 text-[10px] font-medium text-cream-faint">{unit}</span>
      </p>
      {band && (
        <p className="mt-1 text-[10px] text-cream-faint">
          safe band {band[0]}–{band[1]}
          {unit}
        </p>
      )}
    </div>
  )
}

/**
 * Live telemetry chart with the safe band shaded behind the line, so a breach
 * is visible as the curve leaving the band rather than only via a colour change.
 */
export default function SensorChart({ data = [], batch, height = 260, className = '' }) {
  const [tab, setTab] = useState('temperature')
  const active = TABS.find((t) => t.key === tab) || TABS[0]
  const spec = batch?.sensors?.find((s) => s.key === tab)
  const band = spec ? [spec.min, spec.max] : null
  const color = tab === 'temperature' ? C.glacier : active.color()

  const rows = useMemo(
    () =>
      data.map((r) => ({
        t: fmtTime(r.timestamp),
        v: Number(r[tab]) ?? 0,
      })),
    [data, tab],
  )

  const domain = useMemo(() => {
    const vals = rows.map((r) => r.v)
    const lo = Math.min(...vals, ...(band || []))
    const hi = Math.max(...vals, ...(band || []))
    const pad = Math.max(1, (hi - lo) * 0.35)
    return [Math.floor(lo - pad), Math.ceil(hi + pad)]
  }, [rows, band])

  const breaches = rows.filter((r) => band && (r.v < band[0] || r.v > band[1])).length
  const stroke = tab === 'temperature' ? C.glacier : color

  return (
    <div className={className}>
      {/* tabs */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {TABS.map((t) => {
          const Icon = t.icon
          const on = t.key === tab
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cx2(
                'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11.5px] font-semibold transition-all duration-200',
                on
                  ? 'border-glacier-500/60 bg-glacier-500/12 text-glacier-300'
                  : 'border-rim-soft bg-abyss-900 text-cream-faint hover:border-rim-bright hover:text-cream-dim',
              )}
            >
              <Icon size={13} />
              {t.label}
            </button>
          )
        })}
        <span
          className={cx2(
            'ml-auto rounded-lg border px-2.5 py-1.5 text-[11px] font-bold',
            breaches
              ? 'border-thermal-crit/45 bg-thermal-crit/12 text-thermal-crit'
              : 'border-thermal-safe/40 bg-thermal-safe/10 text-thermal-safe',
          )}
        >
          {breaches ? `${breaches} reading${breaches > 1 ? 's' : ''} out of band` : 'All readings in band'}
        </span>
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.45} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 6" stroke="#1D3243" vertical={false} />
            {band && (
              <ReferenceArea y1={band[0]} y2={band[1]} fill="#3DDC97" fillOpacity={0.07} stroke="none" />
            )}
            {band?.map((b) => (
              <ReferenceLine
                key={b}
                y={b}
                stroke="#3DDC97"
                strokeOpacity={0.5}
                strokeDasharray="4 4"
                label={{ value: `${b}${active.unit}`, position: 'right', fill: '#3DDC97', fontSize: 9 }}
              />
            ))}
            <XAxis
              dataKey="t"
              tick={{ fill: '#6F8AA3', fontSize: 9.5 }}
              tickLine={false}
              axisLine={{ stroke: '#1D3243' }}
              minTickGap={28}
            />
            <YAxis
              domain={domain}
              tick={{ fill: '#6F8AA3', fontSize: 9.5 }}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <Tooltip
              content={<Tip unit={active.unit} band={band} color={stroke} />}
              cursor={{ stroke: '#2A4A63', strokeDasharray: '3 3' }}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke={stroke}
              strokeWidth={2}
              fill="url(#chartFill)"
              isAnimationActive={false}
              dot={false}
              activeDot={{ r: 4, fill: stroke, stroke: '#05080D', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/** Two small charts side by side: temperature history + a gauge-friendly trend. */
export function MiniTrend({ data = [], dataKey = 'temperature', band, color = C.glacier, label, unit = '\u00b0C', height = 90 }) {
  const rows = useMemo(() => data.map((r) => ({ t: fmtTime(r.timestamp), v: Number(r[dataKey]) ?? 0 })), [data, dataKey])
  return (
    <div>
      <p className="label mb-1">{label}</p>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 6" stroke="#1D3243" vertical={false} />
            {band && <ReferenceArea y1={band[0]} y2={band[1]} fill="#3DDC97" fillOpacity={0.07} stroke="none" />}
            <XAxis dataKey="t" hide />
            <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
            <Tooltip content={<Tip unit={unit} color={color} />} />
            <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.8} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const cx2 = (...p) => p.filter(Boolean).join(' ')
