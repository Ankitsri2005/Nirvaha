import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ArrowUpRight, Sprout, Snowflake, PackageSearch, CalendarClock } from 'lucide-react'
import { useShipments } from '../context/ShipmentContext'
import { cx, fmtDate } from '../lib/format'
import { C, SHIPMENT_STATUS } from '../lib/palette'
import Badge from '../components/Badge'
import Sparkline from '../components/Sparkline'

export default function Batches() {
  const { batches, shipments, devices, latestByDevice, historyByDevice, riskOf, setSelectedBatchId } = useShipments()
  const navigate = useNavigate()

  const rows = useMemo(
    () =>
      batches.map((b) => {
        const devs = devices.filter((d) => d.batchId === b.id)
        const last = latestByDevice[devs[0]?.id]
        const history = historyByDevice[devs[0]?.id] || []
        const shipment = shipments.find((s) => s.batchId === b.id)
        const risk = Math.max(0, ...devs.map((d) => riskOf(d.id)))
        const inBand = last ? last.temperature >= b.minTemp && last.temperature <= b.maxTemp : null
        return { b, devs, last, history, shipment, risk, inBand }
      }),
    [batches, devices, shipments, latestByDevice, historyByDevice, riskOf],
  )

  return (
    <div className="space-y-4">
      {/* stats */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <Kpi label="Registered batches" value={batches.length} icon={PackageSearch} color={C.glacier} />
        <Kpi
          label="Inside cold chain"
          value={rows.filter((r) => r.inBand).length}
          icon={Snowflake}
          color={C.safe}
        />
        <Kpi
          label="Distinct producers"
          value={new Set(batches.map((b) => b.farmId)).size}
          icon={Sprout}
          color={C.orbit}
        />
        <Kpi
          label="Expiring in 7 days"
          value={batches.filter((b) => new Date(b.expiryAt) - Date.now() < 7 * 86400000).length}
          icon={CalendarClock}
          color={C.warm}
        />
      </div>

      {/* grid */}
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {rows.map(({ b, last, history, shipment, risk, inBand }, i) => {
          const st = SHIPMENT_STATUS[shipment?.status] || SHIPMENT_STATUS.pending
          const spark = history.slice(-24).map((r) => r.temperature)
          const daysLeft = Math.round((new Date(b.expiryAt) - Date.now()) / 86400000)
          return (
            <div
              key={b.id}
              onClick={() => {
                setSelectedBatchId(b.id)
                navigate(`/batches/${b.id}`)
              }}
              className="panel panel-hover cursor-pointer overflow-hidden animate-slideinbottom"
              style={{ animationDelay: `${i * 65}ms` }}
            >
              <div className="flex items-start gap-3.5 p-5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-rim bg-abyss-850 text-[24px]">
                  {EMOJI[b.category]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-[14px] font-bold text-cream">{b.product}</h3>
                    {inBand === false && (
                      <Badge tone="crit" dot pulse>
                        breach
                      </Badge>
                    )}
                  </div>
                  <p className="mono mt-0.5 text-[10.5px] text-glacier-300">{b.id}</p>
                  <p className="mt-1 truncate text-[11px] text-cream-faint">
                    {b.farmName} &middot; {b.location}
                  </p>
                </div>
                {spark.length > 1 && <Sparkline values={spark} color={inBand === false ? C.crit : C.glacier} w={60} h={26} />}
              </div>

              <div className="grid grid-cols-3 gap-px border-y border-rim-soft bg-rim-soft/40">
                <Cell k="Crates" v={b.quantityCrates} />
                <Cell k="Weight" v={`${(b.weightKg / 1000).toFixed(1)} t`} />
                <Cell k="Shelf" v={`${daysLeft}d`} color={daysLeft < 5 ? C.warm : undefined} />
              </div>

              <div className="space-y-2 p-4">
                <Line k="Safe band" v={`${b.minTemp} \u2013 ${b.maxTemp} \u00b0C`} color={C.glacier} />
                <Line
                  k="Current"
                  v={last ? `${last.temperature} \u00b0C` : 'no data'}
                  color={inBand === false ? C.crit : C.safe}
                />
                <Line
                  k="Spoilage risk"
                  v={`${Math.round(risk * 100)}%`}
                  color={risk > 0.66 ? C.crit : risk > 0.33 ? C.warm : C.safe}
                />
                <Line k="Harvested" v={fmtDate(b.harvestedAt)} />
              </div>

              <div className="flex items-center justify-between border-t border-rim-soft px-5 py-3">
                <span
                  className="chip"
                  style={{ borderColor: `${st.color}44`, background: `${st.color}14`, color: st.color }}
                >
                  {st.label}
                  {shipment ? ` · ${shipment.id}` : ''}
                </span>
                <span className="flex items-center gap-1 text-[10.5px] font-semibold text-glacier-300">
                  open record <ArrowUpRight size={12} />
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <p className="flex items-center gap-2 px-1 text-[10.5px] text-cream-faint">
        <Search size={12} /> Every card opens the full batch record: thresholds, live channels, custody
        ledger and route.
      </p>
    </div>
  )
}

function Kpi({ label, value, icon: Icon, color }) {
  return (
    <div className="glass flex items-center gap-3.5 p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${color}18`, color }}>
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="label">{label}</p>
        <p className="mono text-[20px] font-semibold leading-tight" style={{ color }}>
          {value}
        </p>
      </div>
    </div>
  )
}

function Cell({ k, v, color }) {
  return (
    <div className="bg-abyss-850 px-3 py-2.5 text-center">
      <p className="label">{k}</p>
      <p className={cx('mono mt-0.5 text-[12.5px] font-semibold', color ? '' : 'text-cream')} style={color ? { color } : undefined}>
        {v}
      </p>
    </div>
  )
}

function Line({ k, v, color }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[11px]">
      <span className="text-cream-faint">{k}</span>
      <span className="mono font-semibold" style={{ color: color || '#A7BCD0' }}>
        {v}
      </span>
    </div>
  )
}

const EMOJI = { mango: '\u{1F96D}', grapes: '\u{1F347}', chilli: '\u{1F336}', pomegranate: '\u{1F345}' }
