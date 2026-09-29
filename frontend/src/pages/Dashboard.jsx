import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Boxes,
  Truck,
  ShieldCheck,
  BellRing,
  Thermometer,
  Cpu,
  ArrowUpRight,
  Radio,
} from 'lucide-react'
import StatCard from '../components/StatCard'
import SensorCard, { DeviceFooter } from '../components/SensorCard'
import SensorChart from '../components/SensorChart'
import AlertCard from '../components/AlertCard'
import MapView from '../components/MapView'
import SpoilageRiskCard from '../components/SpoilageRiskCard'
import Badge from '../components/Badge'
import { useShipments } from '../context/ShipmentContext'
import { cx, fmtAgo } from '../lib/format'
import { C, SHIPMENT_STATUS } from '../lib/palette'

export default function Dashboard() {
  const {
    batches,
    devices,
    shipments,
    alerts,
    gps,
    kpis,
    historyByDevice,
    latestByDevice,
    riskOf,
    selectedShipmentId,
    setSelectedShipmentId,
    acknowledgeAlert,
    resolveAlert,
  } = useShipments()

  const shipment = shipments.find((s) => s.id === selectedShipmentId) || shipments[0]
  const batch = batches.find((b) => b.id === shipment?.batchId)
  const device =
    devices.find((d) => d.shipmentId === shipment?.id && d.status !== 'offline') ||
    devices.find((d) => d.shipmentId === shipment?.id) ||
    devices[0]
  const reading = latestByDevice[device?.id]
  const history = historyByDevice[device?.id] || []
  const deviceAlerts = alerts.filter((a) => a.deviceId === device?.id)
  const open = alerts.filter((a) => !a.resolved)

  const tempSpark = useMemo(() => history.slice(-24).map((r) => r.temperature), [history])
  const alertSpark = useMemo(
    () => Array.from({ length: 24 }, (_, i) => Math.max(0, kpis.openAlerts - (23 - i) * 0.15)),
    [kpis.openAlerts],
  )

  const batchSensors = batch?.sensors || []
  const stale = device?.status === 'fault' || device?.status === 'offline'

  return (
    <div className="space-y-5">
      {/* ---------------- KPI row ---------------- */}
      <section className="grid grid-cols-2 gap-3.5 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Tracked batches"
          value={kpis.totalBatches}
          icon={Boxes}
          tone="info"
          hint={`${kpis.activeShipments} in transit · ${kpis.delivered} delivered`}
        />
        <StatCard
          label="Active shipments"
          value={kpis.activeShipments}
          icon={Truck}
          tone="safe"
          hint={`${shipments.length} consignments total`}
        />
        <StatCard
          label="Cold-chain compliance"
          value={kpis.compliance}
          suffix="%"
          icon={ShieldCheck}
          tone={kpis.compliance === 100 ? 'safe' : 'warn'}
          hint="batches inside their safe band"
        />
        <StatCard
          label="Open alerts"
          value={kpis.openAlerts}
          icon={BellRing}
          tone={kpis.criticalAlerts ? 'crit' : kpis.openAlerts ? 'warn' : 'safe'}
          hint={kpis.criticalAlerts ? `${kpis.criticalAlerts} critical` : 'nothing critical'}
          spark={alertSpark}
        />
        <StatCard
          label="Fleet average"
          value={kpis.avgTemp}
          decimals={1}
          unit="°C"
          icon={Thermometer}
          tone="info"
          hint="mean across reporting nodes"
          spark={tempSpark}
        />
        <StatCard
          label="Nodes online"
          value={`${kpis.online}/${kpis.totalDevices}`}
          icon={Cpu}
          tone={kpis.faulted ? 'warn' : 'safe'}
          hint={kpis.faulted ? `${kpis.faulted} need attention` : 'all reporting'}
        />
      </section>

      {/* ---------------- map + sensors ---------------- */}
      <section className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <div className="space-y-4">
          <ShipmentPicker shipments={shipments} value={shipment?.id} onChange={setSelectedShipmentId} />
          <MapView shipment={shipment} device={device} gps={gps} alerts={deviceAlerts} height={430} />
        </div>

        <div className="panel flex flex-col overflow-hidden">
          <div className="panel-head">
            <span className="panel-title">
              <Radio size={13} className="text-glacier-300" />
              Live node telemetry
            </span>
            <div className="flex items-center gap-2">
              {batch && <span className="mono text-[10.5px] text-cream-faint">{batch.id}</span>}
              <Badge tone={stale ? 'crit' : 'safe'} dot pulse={!stale}>
                {stale ? device?.status : 'streaming'}
              </Badge>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-3 p-4 lg:grid-cols-3">
            {batchSensors.map((spec) => (
              <SensorCard
                key={spec.key}
                spec={spec}
                reading={reading}
                history={history}
                device={device}
                batch={batch}
                stale={stale}
              />
            ))}
          </div>

          <DeviceFooter device={device} />
        </div>
      </section>

      {/* ---------------- chart + risk ---------------- */}
      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="panel p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="panel-title">Condition history</p>
              <p className="mt-1 text-[11.5px] text-cream-faint">
                {history.length} readings from {device?.name} &middot; last {Math.round(history.length * 2)}s
              </p>
            </div>
            {batch && (
              <span className="chip border-rim bg-abyss-900 text-cream-dim">
                safe band {batch.minTemp}&ndash;{batch.maxTemp}&deg;C
              </span>
            )}
          </div>
          <SensorChart data={history} batch={batch} height={280} />
        </div>

        <SpoilageRiskCard device={device} batch={batch} score={riskOf(device?.id)} />
      </section>

      {/* ---------------- open alerts ---------------- */}
      <section className="panel overflow-hidden">
        <div className="panel-head">
          <span className="panel-title">
            <BellRing size={13} className={kpis.openAlerts ? 'text-thermal-warm' : 'text-thermal-safe'} />
            Open exceptions
            <span className="mono text-[10px] text-cream-faint">({open.length})</span>
          </span>
          <Link to="/alerts" className="btn-ghost px-2.5 py-1.5 text-[11.5px]">
            Open console <ArrowUpRight size={13} />
          </Link>
        </div>
        <div className="p-4">
          {open.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {open.slice(0, 4).map((a) => (
                <AlertCard key={a.id} alert={a} onAck={acknowledgeAlert} onResolve={resolveAlert} compact />
              ))}
            </div>
          ) : (
            <div className="grid place-items-center py-10 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-thermal-safe/12 text-thermal-safe">
                <ShieldCheck size={22} />
              </span>
              <p className="mt-3 text-[13px] font-semibold text-cream">All batches within safe range</p>
              <p className="mt-1 text-[11.5px] text-cream-faint">
                No threshold breaches or exceptions at this time.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ---------------- batch strip ---------------- */}
      <section className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {batches.map((b, i) => {
          const devs = devices.filter((d) => d.batchId === b.id)
          const worst = devs.reduce((acc, d) => Math.max(acc, latestByDevice[d.id]?.spoilageRisk ?? 0), 0)
          const status = shipments.find((s) => s.batchId === b.id)?.status || 'pending'
          const st = SHIPMENT_STATUS[status] || SHIPMENT_STATUS.pending
          return (
            <Link
              key={b.id}
              to={`/batches/${b.id}`}
              className="panel panel-hover animate-slideinbottom p-4"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-cream">{b.product}</p>
                  <p className="mono mt-0.5 text-[10.5px] text-cream-faint">{b.id}</p>
                </div>
                <span className="text-[20px] leading-none">{CATALOG_EMOJI[b.category]}</span>
              </div>

              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="text-cream-faint">condition</span>
                  <span className="mono text-cream-dim">
                    {b.minTemp}&ndash;{b.maxTemp}&deg;C
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="text-cream-faint">spoilage risk</span>
                  <span className="mono" style={{ color: worst > 0.66 ? C.crit : worst > 0.33 ? C.warm : C.safe }}>
                    {Math.round(worst * 100)}%
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="chip" style={{ borderColor: `${st.color}44`, background: `${st.color}14`, color: st.color }}>
                  {st.label}
                </span>
                <span className="flex items-center gap-1 text-[10.5px] text-cream-faint">
                  {b.quantityCrates} crates <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          )
        })}
      </section>
    </div>
  )
}

function ShipmentPicker({ shipments, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {shipments.map((s) => {
        const st = SHIPMENT_STATUS[s.status] || SHIPMENT_STATUS.pending
        const on = s.id === value
        return (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={cx(
              'group flex items-center gap-2 rounded-xl border px-3 py-2 transition-all duration-200',
              on
                ? 'border-glacier-500/55 bg-glacier-500/10'
                : 'border-rim-soft bg-abyss-850/60 hover:border-rim-bright',
            )}
          >
            <span
              className="h-1.5 w-1.5 rounded-full transition-transform group-hover:scale-150"
              style={{ background: st.color, boxShadow: on ? `0 0 8px ${st.color}` : 'none' }}
            />
            <span className="text-left leading-tight">
              <span className={cx('mono block text-[11.5px] font-semibold', on ? 'text-glacier-300' : 'text-cream-dim')}>
                {s.id}
              </span>
              <span className="block text-[9.5px] text-cream-faint">
                {s.origin.split(',')[0]} &rarr; {s.destination.split(',')[0]}
              </span>
            </span>
            <span className="ml-1 hidden text-[9.5px] text-cream-faint sm:inline">{fmtAgo(s.lastFixAt)}</span>
          </button>
        )
      })}
    </div>
  )
}

const CATALOG_EMOJI = { mango: '\u{1F96D}', grapes: '\u{1F347}', chilli: '\u{1F336}', pomegranate: '\u{1F345}' }
