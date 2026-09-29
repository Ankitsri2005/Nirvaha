import { useMemo, useState } from 'react'
import { BellRing, Filter, CheckCheck, ShieldAlert, Clock, X } from 'lucide-react'
import AlertCard from '../components/AlertCard'
import Badge from '../components/Badge'
import StatCard from '../components/StatCard'
import { useShipments } from '../context/ShipmentContext'
import { cx } from '../lib/format'
import { C } from '../lib/palette'

const FILTERS = [
  { key: 'open', label: 'Open' },
  { key: 'critical', label: 'Critical' },
  { key: 'warning', label: 'Warning' },
  { key: 'info', label: 'Info' },
  { key: 'unacked', label: 'Unacknowledged' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'all', label: 'All' },
]

export default function Alerts() {
  const { alerts, kpis, acknowledgeAlert, resolveAlert, clearResolvedAlerts } = useShipments()
  const [filter, setFilter] = useState('open')
  const [q, setQ] = useState('')

  const counts = useMemo(
    () => ({
      open: alerts.filter((a) => !a.resolved).length,
      critical: alerts.filter((a) => !a.resolved && a.severity === 'critical').length,
      warning: alerts.filter((a) => !a.resolved && a.severity === 'warning').length,
      info: alerts.filter((a) => !a.resolved && a.severity === 'info').length,
      unacked: alerts.filter((a) => !a.resolved && !a.acknowledged).length,
      resolved: alerts.filter((a) => a.resolved).length,
      all: alerts.length,
    }),
    [alerts],
  )

  const list = useMemo(() => {
    let out = alerts
    if (filter === 'open') out = out.filter((a) => !a.resolved)
    else if (filter === 'critical') out = out.filter((a) => !a.resolved && a.severity === 'critical')
    else if (filter === 'warning') out = out.filter((a) => !a.resolved && a.severity === 'warning')
    else if (filter === 'info') out = out.filter((a) => !a.resolved && a.severity === 'info')
    else if (filter === 'unacked') out = out.filter((a) => !a.resolved && !a.acknowledged)
    else if (filter === 'resolved') out = out.filter((a) => a.resolved)

    if (q.trim()) {
      const needle = q.toLowerCase()
      out = out.filter((a) =>
        [a.title, a.message, a.deviceId, a.batchId, a.shipmentId, a.location, a.type]
          .filter(Boolean)
          .some((f) => String(f).toLowerCase().includes(needle)),
      )
    }
    return out
  }, [alerts, filter, q])

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <StatCard
          label="Open alerts"
          value={kpis.openAlerts}
          icon={BellRing}
          tone={kpis.openAlerts ? 'warn' : 'safe'}
          hint="conditions currently true"
        />
        <StatCard
          label="Critical"
          value={kpis.criticalAlerts}
          icon={ShieldAlert}
          tone={kpis.criticalAlerts ? 'crit' : 'safe'}
          hint="cold chain or custody at risk"
        />
        <StatCard
          label="Unacknowledged"
          value={counts.unacked}
          icon={Clock}
          tone={counts.unacked ? 'orbit' : 'safe'}
          hint="nobody has looked yet"
        />
        <StatCard
          label="Auto-resolved"
          value={counts.resolved}
          icon={CheckCheck}
          tone="safe"
          hint="values returned to band"
        />
      </section>

      {/* controls */}
      <div className="panel flex flex-wrap items-center gap-2.5 p-3.5">
        <div className="flex items-center gap-1.5 text-cream-faint">
          <Filter size={13} />
          <span className="label">filter</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cx(
                'rounded-lg border px-2.5 py-1.5 text-[11.5px] font-semibold transition-all duration-200',
                filter === f.key
                  ? 'border-glacier-500/60 bg-glacier-500/12 text-glacier-300'
                  : 'border-rim-soft bg-abyss-900 text-cream-faint hover:border-rim-bright hover:text-cream-dim',
              )}
            >
              {f.label}
              <span className="mono ml-1.5 text-[10px] opacity-70">{counts[f.key]}</span>
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search id, node, message..."
            className="w-56"
          />
          {q && (
            <button onClick={() => setQ('')} className="btn-icon">
              <X size={14} />
            </button>
          )}
          {counts.resolved > 0 && (
            <button onClick={clearResolvedAlerts} className="btn-ghost text-[11.5px]">
              <CheckCheck size={13} /> purge resolved
            </button>
          )}
        </div>
      </div>

      {/* list */}
      {list.length ? (
        <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {list.map((a, i) => (
            <div key={a.id} className="animate-slideinbottom" style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}>
              <AlertCard alert={a} onAck={acknowledgeAlert} onResolve={resolveAlert} />
            </div>
          ))}
        </div>
      ) : (
        <div className="panel grid place-items-center py-16 text-center">
          <span
            className="grid h-14 w-14 place-items-center rounded-2xl"
            style={{ background: `${C.safe}1a`, color: C.safe }}
          >
            <CheckCheck size={26} />
          </span>
          <p className="mt-4 text-[14px] font-semibold text-cream">Nothing to show</p>
          <p className="mt-1 max-w-sm text-[11.5px] leading-relaxed text-cream-faint">
            {q
              ? 'No alert matches that search. Clear the filter to see the full history.'
              : 'The console is empty for this filter. Open the simulator and trigger a temperature rise or a tamper event.'}
          </p>
        </div>
      )}

      <p className="flex items-center gap-2 px-1 text-[10.5px] text-cream-faint">
        <Badge tone="muted">note</Badge>
        A condition that persists is one alert with an incrementing cycle counter, not a new alert every
        sample. Alerts auto-resolve when the reading returns to band.
      </p>
    </div>
  )
}
