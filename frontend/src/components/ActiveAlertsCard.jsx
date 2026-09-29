import { ChevronRight } from 'lucide-react'

export default function ActiveAlertsCard({ onViewAll }) {
  const alerts = [
    {
      id: 'ALT-1',
      severity: 'critical',
      title: 'Temperature Excursion',
      shipment: 'SHP-001',
      metric: '10.2°C',
      time: '2 min ago'
    },
    {
      id: 'ALT-2',
      severity: 'warning',
      title: 'Battery Low',
      shipment: 'DEV-003',
      metric: '18%',
      time: '15 min ago'
    }
  ]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="anim-blink text-base">🚨</span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            ACTIVE ALERTS
          </h3>
          <span className="anim-pop rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
            {alerts.length}
          </span>
        </div>

        <button
          onClick={onViewAll}
          className="group flex cursor-pointer items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-600"
        >
          <span className="link-underline">View all</span>
          <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>

      {/* Alert Rows */}
      <div className="mt-3 divide-y divide-slate-100">
        {alerts.map((alt, i) => (
          <div
            key={alt.id}
            onClick={onViewAll}
            className="anim-fade-up group flex cursor-pointer flex-wrap items-center justify-between gap-2 rounded-xl px-2 py-3 hover:bg-rose-50/40"
            style={{ '--d': `${i * 110}ms` }}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110 ${
                  alt.severity === 'critical'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                <span className={alt.severity === 'critical' ? 'anim-blink' : ''}>
                  {alt.severity === 'critical' ? '🔴' : '🟡'}
                </span>
              </span>

              <div>
                <p className="text-xs font-bold text-slate-900 transition-colors group-hover:text-rose-700">
                  {alt.title}
                </p>
                <p className="font-mono text-[11px] text-slate-500">{alt.shipment}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="rounded-md border border-slate-200/60 bg-slate-50 px-2.5 py-1 font-mono font-bold text-slate-700">
                {alt.metric}
              </span>
              <span className="min-w-[70px] text-right text-[11px] text-slate-400">
                {alt.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
