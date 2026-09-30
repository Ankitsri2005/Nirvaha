import { ShieldCheck, Check } from 'lucide-react'

export default function FoodConditionCard({ freshnessScore = 94, spoilageRisk = 'Low' }) {
  const RADIUS = 42
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS
  const score = Math.max(0, Math.min(Number(freshnessScore) || 0, 100))
  const drawn = (CIRCUMFERENCE * score) / 100

  const checks = [
    'Temperature within optimal limit',
    'Humidity preserved (86% RH)',
    'IoT sensor telemetry active',
    'Container digital seal secure',
  ]

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            FOOD CONDITION
          </h3>
        </div>
        <span className="anim-pulse-dot rounded-full border border-fresh-tint bg-fresh-tint px-2 py-0.5 text-[11px] font-bold text-fresh">
          AI Verified
        </span>
      </div>

      {/* Big Score Display with animated ring */}
      <div className="my-4 text-center">
        <div className="anim-pop relative mx-auto h-28 w-28">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke="#E1EEE5"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke="#4A2540"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${drawn} ${CIRCUMFERENCE}`}
              className="anim-draw"
              style={{ '--dash': drawn, '--d': '200ms' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black leading-none text-slate-900">{score}</span>
            <span className="text-[11px] font-bold text-slate-400">/ 100</span>
          </div>
        </div>

        <div className="anim-fade-up mt-3 inline-flex items-center gap-1.5 rounded-full bg-fresh-tint/70 px-3 py-0.5 text-xs font-bold text-fresh" style={{ '--d': '500ms' }}>
          <span className="anim-pulse-dot h-2 w-2 rounded-full bg-fresh" />
          <span>GOOD QUALITY</span>
        </div>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Spoilage risk: {spoilageRisk}
        </p>
      </div>

      {/* 4 Checklist Items */}
      <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
        {checks.map((label, i) => (
          <div
            key={label}
            className="anim-fade-up flex items-center gap-2 text-slate-700"
            style={{ '--d': `${300 + i * 90}ms` }}
          >
            <div className="anim-pop flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-fresh-tint text-fresh" style={{ '--d': `${340 + i * 90}ms` }}>
              <Check className="h-3 w-3 stroke-[3]" />
            </div>
            <span className="font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
