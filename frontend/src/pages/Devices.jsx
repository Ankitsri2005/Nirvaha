import { useMemo, useState } from 'react'
import { Cpu, HardDrive, UploadCloud, CheckCheck, Radio, Search, Server } from 'lucide-react'
import DeviceHealth from '../components/DeviceHealth'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'
import { useShipments } from '../context/ShipmentContext'
import { cx, fmtAgo } from '../lib/format'
import { C } from '../lib/palette'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'online', label: 'Online' },
  { key: 'fault', label: 'Sensor fault' },
  { key: 'offline', label: 'Offline' },
  { key: 'maintenance', label: 'Maintenance' },
]

export default function Devices() {
  const { devices, syncEvents, actions, readings } = useShipments()
  const [tab, setTab] = useState('all')
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    let out = devices
    if (tab !== 'all') out = out.filter((d) => d.status === tab)
    if (q.trim()) {
      const n = q.toLowerCase()
      out = out.filter((d) => [d.id, d.name, d.role, d.batchId, d.mac].filter(Boolean).some((f) => String(f).toLowerCase().includes(n)))
    }
    return out
  }, [devices, tab, q])

  const totalRows = devices.reduce((a, d) => a + (d.bufferedReadings || 0), 0)
  const avgBattery = devices.length ? devices.reduce((a, d) => a + d.battery, 0) / devices.length : 0
  const totalReadings = readings.length

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <StatCard label="Total nodes" value={devices.length} icon={Cpu} tone="info" hint="IoT sensor shields" />
        <StatCard
          label="Reporting"
          value={devices.filter((d) => d.status === 'online').length}
          icon={Radio}
          tone="safe"
          hint="sending telemetry now"
        />
        <StatCard
          label="Mean battery"
          value={Math.round(avgBattery)}
          suffix="%"
          icon={HardDrive}
          tone={avgBattery < 40 ? 'warn' : 'safe'}
          hint={`${devices.filter((d) => d.battery < 20).length} critical`}
        />
        <StatCard
          label="Offline buffer"
          value={totalRows}
          icon={UploadCloud}
          tone={totalRows ? 'warn' : 'safe'}
          hint="readings pending upload"
        />
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          {/* filters */}
          <div className="panel flex flex-wrap items-center gap-2 p-3.5">
            <div className="flex flex-wrap gap-1.5">
              {TABS.map((t) => {
                const n = t.key === 'all' ? devices.length : devices.filter((d) => d.status === t.key).length
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={cx(
                      'rounded-lg border px-2.5 py-1.5 text-[11.5px] font-semibold transition-all duration-200',
                      tab === t.key
                        ? 'border-glacier-500/60 bg-glacier-500/12 text-glacier-300'
                        : 'border-rim-soft bg-abyss-900 text-cream-faint hover:border-rim-bright hover:text-cream-dim',
                    )}
                  >
                    {t.label}
                    <span className="mono ml-1.5 text-[10px] opacity-70">{n}</span>
                  </button>
                )
              })}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="search node, batch, mac..." className="w-56" />
            </div>
          </div>

          {/* cards */}
          <div className="grid gap-3.5 md:grid-cols-2">
            {filtered.map((d, i) => (
              <div key={d.id} className="animate-slideinbottom" style={{ animationDelay: `${i * 55}ms` }}>
                <DeviceHealth device={d} onRecover={actions.recoverDevice} />
              </div>
            ))}
            {!filtered.length && (
              <div className="panel col-span-full grid place-items-center py-14 text-center">
                <p className="text-[12.5px] text-cream-faint">No nodes match this filter.</p>
              </div>
            )}
          </div>
        </div>

        {/* right rail */}
        <div className="space-y-4">
          {/* SD card status */}
          <div className="panel overflow-hidden">
            <div className="panel-head">
              <span className="panel-title">
                <HardDrive size={13} className="text-thermal-warm" /> microSD buffering
              </span>
              <Badge tone={totalRows ? 'warn' : 'safe'} dot>
                {totalRows ? `${totalRows} queued` : 'empty'}
              </Badge>
            </div>
            <div className="p-5">
              <p className="text-[11.5px] leading-relaxed text-cream-dim">
                Sensor readings are buffered locally when the network is unavailable. On reconnect,
                buffered data uploads automatically and duplicate entries are discarded.
              </p>

              <div className="mt-4 space-y-2">
                {devices.map((d) => {
                  const n = d.bufferedReadings || 0
                  const pct = Math.min(100, (n / 500) * 100)
                  return (
                    <div key={d.id} className="rounded-lg border border-rim-soft bg-abyss-900/50 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="mono text-[10.5px] text-cream-dim">{d.id}</span>
                        <span className="mono text-[10.5px]" style={{ color: n ? C.warm : C.faint }}>
                          {n} rows
                        </span>
                      </div>
                      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-abyss-800">
                        <span
                          className="block h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(2, pct)}%`, background: n ? C.warm : C.safe }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>


            </div>
          </div>

          {/* sync log */}
          <div className="panel overflow-hidden">
            <div className="panel-head">
              <span className="panel-title">
                <CheckCheck size={13} className="text-orbit-300" /> Sync log
              </span>
              <span className="mono text-[10.5px] text-cream-faint">{syncEvents.length} events</span>
            </div>
            <div className="p-4">
              {syncEvents.length ? (
                <div className="space-y-2">
                  {syncEvents.map((e) => (
                    <div
                      key={e.id}
                      className="animate-slideinbottom rounded-xl border border-orbit-400/28 bg-orbit-400/6 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="mono text-[11px] font-semibold text-orbit-300">{e.deviceId}</span>
                        <span className="text-[10px] text-cream-faint">{fmtAgo(e.at)}</span>
                      </div>
                      <p className="mono mt-1.5 text-[10.5px] text-cream-dim">
                        {e.rows} rows · {e.duplicates} duplicates discarded · {e.ms} ms
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-[11.5px] text-cream-faint">
                  No uploads yet. Readings will appear here when a node reconnects after an outage.
                </p>
              )}
            </div>
          </div>

          {/* fleet table */}
          <div className="panel overflow-hidden">
            <div className="panel-head">
              <span className="panel-title">
                <Server size={13} /> Registry
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Node</th>
                    <th>FW</th>
                    <th>Batch</th>
                    <th>Last seen</th>
                    <th>State</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((d) => (
                    <tr key={d.id}>
                      <td className="mono text-[11px] text-glacier-300">{d.id}</td>
                      <td className="mono text-[11px]">{d.firmware}</td>
                      <td className="mono text-[10.5px]">{d.batchId}</td>
                      <td className="text-[11px]">{fmtAgo(d.lastSeen)}</td>
                      <td>
                        <Badge
                          tone={d.status === 'online' ? 'safe' : d.status === 'fault' ? 'crit' : d.status === 'maintenance' ? 'warn' : 'muted'}
                          dot={d.status !== 'maintenance'}
                        >
                          {d.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>


        </div>
      </div>
    </div>
  )
}
