import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Truck, Package, Search, ArrowUpRight, Route as RouteIcon, Clock, Snowflake, Weight } from 'lucide-react'
import { useShipments } from '../context/ShipmentContext'
import { cx, fmtDate, fmtDuration, round } from '../lib/format'
import { C, SHIPMENT_STATUS } from '../lib/palette'
import Badge from '../components/Badge'
import Sparkline from '../components/Sparkline'

export default function Shipments() {
  const { shipments, batches, devices, latestByDevice, historyByDevice, selectedShipmentId, setSelectedShipmentId } =
    useShipments()

  const enriched = useMemo(
    () =>
      shipments.map((s) => {
        const batch = batches.find((b) => b.id === s.batchId)
        const devs = devices.filter((d) => d.shipmentId === s.id)
        const last = latestByDevice[devs[0]?.id]
        const inBand = last && batch ? last.temperature >= batch.minTemp && last.temperature <= batch.maxTemp : null
        return { s, batch, devs, last, inBand }
      }),
    [shipments, batches, devices, latestByDevice],
  )

  return (
    <div className="space-y-4">
      {/* summary strip */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <Summary
          label="Total consignments"
          value={shipments.length}
          icon={Truck}
          tone="info"
        />
        <Summary
          label="In transit"
          value={shipments.filter((s) => s.status !== 'delivered').length}
          icon={RouteIcon}
          tone="safe"
        />
        <Summary
          label="Delivered"
          value={shipments.filter((s) => s.status === 'delivered').length}
          icon={Package}
          tone="safe"
        />
        <Summary
          label="Distance covered"
          value={round(shipments.reduce((a, s) => a + (s.distanceTravelledKm || 0), 0), 0)}
          unit="km"
          icon={RouteIcon}
          tone="orbit"
        />
      </div>

      {/* list */}
      <div className="grid gap-4 xl:grid-cols-2">
        {enriched.map(({ s, batch, devs, last, inBand }, i) => {
          const st = SHIPMENT_STATUS[s.status] || SHIPMENT_STATUS.pending
          const history = historyByDevice[devs[0]?.id] || []
          const spark = history.slice(-24).map((r) => r.temperature)
          const etaMs = s.eta ? new Date(s.eta) - new Date() : 0
          const selected = s.id === selectedShipmentId

          return (
            <div
              key={s.id}
              onClick={() => setSelectedShipmentId(s.id)}
              className={cx(
                'panel panel-hover cursor-pointer overflow-hidden animate-slideinbottom',
                selected && 'border-glacier-500/50',
              )}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              {/* progress hairline */}
              <div className="h-[3px] w-full bg-abyss-900">
                <div
                  className="h-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${(s.progress || 0) * 100}%`,
                    background:
                      s.status === 'breach'
                        ? 'linear-gradient(90deg,#FFC24B,#FF5C7A)'
                        : 'linear-gradient(90deg,#06B6D4,#3DDC97)',
                  }}
                />
              </div>

              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="mono text-[14px] font-bold text-cream">{s.id}</h3>
                      <span
                        className="chip"
                        style={{ borderColor: `${st.color}44`, background: `${st.color}14`, color: st.color }}
                      >
                        {st.label}
                      </span>
                      {inBand === false && (
                        <Badge tone="crit" dot pulse>
                          out of band
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-cream-dim">
                      {s.origin} <ArrowUpRight size={12} className="text-cream-faint" /> {s.destination}
                    </p>
                  </div>
                  {spark.length > 1 && <Sparkline values={spark} color={inBand === false ? C.crit : C.glacier} w={72} h={28} />}
                </div>

                {/* batch */}
                {batch && (
                  <Link
                    to={`/batches/${batch.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3.5 flex items-center gap-3 rounded-xl border border-rim-soft bg-abyss-900/50 p-3 transition-colors hover:border-glacier-500/40"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-abyss-800 text-[17px]">
                      {EMOJI[batch.category]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-semibold text-cream">{batch.product}</span>
                      <span className="mono block text-[10.5px] text-cream-faint">
                        {batch.id} &middot; {batch.quantityCrates} crates
                      </span>
                    </span>
                    <span className="mono shrink-0 text-right text-[11px]">
                      <span className="block text-cream-faint">range</span>
                      <span className="text-glacier-300">
                        {batch.minTemp}&ndash;{batch.maxTemp}&deg;C
                      </span>
                    </span>
                  </Link>
                )}

                {/* metrics */}
                <div className="mt-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  <Metric icon={Snowflake} label="Temp now" value={last ? `${last.temperature}\u00b0C` : '-'} tone={inBand === false ? C.crit : C.glacier} />
                  <Metric icon={RouteIcon} label="Progress" value={`${Math.round((s.progress || 0) * 100)}%`} />
                  <Metric icon={Weight} label="Distance" value={`${round(s.distanceTravelledKm || 0, 0)} km`} />
                  <Metric
                    icon={Clock}
                    label={s.status === 'delivered' ? 'Delivered' : 'ETA'}
                    value={s.status === 'delivered' ? fmtDate(s.arrivedAt) : fmtDuration(Math.max(0, etaMs / 1000))}
                  />
                </div>

                {/* footer */}
                <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-rim-soft pt-3 text-[10.5px] text-cream-faint">
                  <span className="mono">{s.vehicle}</span>
                  <span>{s.driver}</span>
                  <span className="mono">{s.sealId}</span>
                  <span className="ml-auto">
                    {devs.length} node{devs.length > 1 ? 's' : ''} &middot;{' '}
                    <span className="text-thermal-safe">{devs.filter((d) => d.status === 'online').length} online</span>
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <p className="flex items-center gap-2 px-1 text-[10.5px] text-cream-faint">
        <Search size={12} /> Click any card to pin it on the dashboard and tracking map.
      </p>
    </div>
  )
}

function Summary({ label, value, unit, icon: Icon, tone }) {
  const colors = { info: C.glacier, safe: C.safe, orbit: C.orbit, crit: C.crit, warn: C.warm }
  return (
    <div className="glass flex items-center gap-3.5 p-4">
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
        style={{ background: `${colors[tone]}18`, color: colors[tone] }}
      >
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="label">{label}</p>
        <p className="mono text-[20px] font-semibold leading-tight" style={{ color: colors[tone] }}>
          {value}
          {unit && <span className="ml-1 text-[11px] text-cream-faint">{unit}</span>}
        </p>
      </div>
    </div>
  )
}

function Metric({ icon: Icon, label, value, tone = '#A7BCD0' }) {
  return (
    <div className="rounded-lg border border-rim-soft bg-abyss-900/50 px-2.5 py-2">
      <p className="label flex items-center gap-1">
        <Icon size={10} /> {label}
      </p>
      <p className="mono mt-0.5 text-[12.5px] font-semibold" style={{ color: tone }}>
        {value}
      </p>
    </div>
  )
}

const EMOJI = { mango: '\u{1F96D}', grapes: '\u{1F347}', chilli: '\u{1F336}', pomegranate: '\u{1F345}' }
