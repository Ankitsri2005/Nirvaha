import { useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Sprout,
  Package,
  Truck,
  ShieldCheck,
  Award,
  CalendarDays,
  MapPin,
  Weight,
  Layers,
  Cpu,
  ArrowUpRight,
  Boxes,
} from 'lucide-react'
import SensorChart from '../components/SensorChart'
import SensorCard, { DeviceFooter } from '../components/SensorCard'
import SpoilageRiskCard from '../components/SpoilageRiskCard'
import Timeline from '../components/Timeline'
import Badge from '../components/Badge'
import MapView from '../components/MapView'
import SimulatorPanel from '../components/SimulatorPanel'
import { useShipments } from '../context/ShipmentContext'
import { cx, fmtDate, fmtDateTime, fmtDuration } from '../lib/format'
import { C } from '../lib/palette'

export default function BatchDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { batches, shipments, devices, checkpoints, gps, alerts, historyByDevice, latestByDevice, riskOf } =
    useShipments()

  const batch = batches.find((b) => b.id === id) || batches[0]
  const shipment = shipments.find((s) => s.batchId === batch?.id)
  const devs = devices.filter((d) => d.batchId === batch?.id)
  const device = devs.find((d) => d.status !== 'offline') || devs[0]
  const history = historyByDevice[device?.id] || []
  const reading = latestByDevice[device?.id]
  const cps = useMemo(
    () =>
      checkpoints
        .filter((c) => c.batchId === batch?.id)
        .slice()
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [checkpoints, batch?.id],
  )
  const batchAlerts = alerts.filter((a) => a.batchId === batch?.id && !a.resolved)

  if (!batch) return null

  const freshnessDays = Math.max(
    0,
    Math.round((Date.now() - new Date(batch.harvestedAt)) / 86400000),
  )
  const shelfDays = Math.max(0, Math.round((new Date(batch.expiryAt) - Date.now()) / 86400000))

  return (
    <div className="space-y-4">
      {/* breadcrumb */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => navigate('/batches')} className="btn-ghost text-[11.5px]">
          <ArrowLeft size={13} /> all batches
        </button>
        <span className="text-cream-faint">/</span>
        <span className="mono text-[12px] text-glacier-300">{batch.id}</span>
      </div>

      {/* hero */}
      <div className="panel relative overflow-hidden">
        <span className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-glacier-500/10 blur-3xl" />
        <div className="relative flex flex-wrap items-start gap-5 p-6">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-rim bg-abyss-850 text-[32px]">
            {EMOJI[batch.category]}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[22px] font-bold tracking-tight text-cream">{batch.product}</h2>
              <Badge tone="info">Grade {batch.grade}</Badge>
              {batchAlerts.length > 0 ? (
                <Badge tone="crit" dot pulse>
                  {batchAlerts.length} open alert{batchAlerts.length > 1 ? 's' : ''}
                </Badge>
              ) : (
                <Badge tone="safe" dot>
                  clean
                </Badge>
              )}
            </div>
            <p className="mt-1 text-[12.5px] text-cream-dim">
              {batch.variety} &middot; {batch.quantityCrates} crates &middot; {batch.weightKg} kg &middot; {batch.harvestMethod}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {batch.certifications.map((c) => (
                <span
                  key={c}
                  className="chip border-orbit-400/35 bg-orbit-400/10 text-orbit-300"
                >
                  <Award size={10} /> {c}
                </span>
              ))}
              <span className="chip border-rim bg-abyss-900 text-cream-dim">
                <Layers size={10} /> {batch.qr}
              </span>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3">
            <Field icon={CalendarDays} k="Harvested" v={fmtDate(batch.harvestedAt)} sub={`${freshnessDays}d ago`} />
            <Field icon={CalendarDays} k="Use by" v={fmtDate(batch.expiryAt)} sub={`${shelfDays}d left`} tone={shelfDays < 5 ? C.warm : undefined} />
            <Field icon={Sprout} k="Farm" v={batch.farmName} sub={batch.farmId} />
            <Field icon={MapPin} k="Origin" v={batch.location} />
            <Field icon={Weight} k="Net weight" v={`${batch.weightKg} kg`} />
            <Field icon={Package} k="Lot note" v={batch.lotNote} wide />
          </dl>
        </div>
      </div>

      <SimulatorPanel />

      {/* condition + risk */}
      <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <div className="panel p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="panel-title">Cold-chain history</p>
              <p className="mt-1 text-[11.5px] text-cream-faint">
                {history.length} readings &middot; {device?.name} &middot; {fmtDateTime(history[0]?.timestamp || batch.harvestedAt)} onwards
              </p>
            </div>
            <span className="chip border-glacier-500/40 bg-glacier-500/10 text-glacier-300">
              safe band {batch.minTemp}&ndash;{batch.maxTemp}&deg;C
            </span>
          </div>
          <SensorChart data={history} batch={batch} height={270} />

          <div className="mt-5 border-t border-rim-soft pt-4">
            <p className="panel-title mb-3">All channels</p>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {batch.sensors.map((spec) => (
                <SensorCard
                  key={spec.key}
                  spec={spec}
                  reading={reading}
                  history={history}
                  device={device}
                  batch={batch}
                  stale={device?.status !== 'online'}
                />
              ))}
            </div>
          </div>
          {device && <DeviceFooter device={device} className="mt-4 rounded-xl border border-rim-soft" />}
        </div>

        <div className="space-y-4">
          <SpoilageRiskCard device={device} batch={batch} score={riskOf(device?.id)} />

          <div className="panel p-5">
            <p className="panel-title mb-3">Thresholds</p>
            <dl className="space-y-2.5 text-[11.5px]">
              <Band k="Temperature" lo={`${batch.minTemp} \u00b0C`} hi={`${batch.maxTemp} \u00b0C`} now={reading?.temperature} unit="\u00b0C" />
              <Band k="Humidity" lo={`${batch.minHumidity} %`} hi={`${batch.maxHumidity} %`} now={reading?.humidity} unit="%" />
              <Band
                k="Ethylene"
                lo="0 ppm"
                hi={`${batch.sensors.find((s) => s.key === 'gas')?.softMax} ppm`}
                now={reading?.gas}
                unit=" ppm"
              />
            </dl>
            <p className="mt-4 border-t border-rim-soft pt-3 text-[10.5px] leading-relaxed text-cream-faint">
              A reading outside any band raises a single alert, de-duplicated per node and rule, and
              auto-resolves when the value returns inside the band.
            </p>
          </div>
        </div>
      </div>

      {/* custody + route */}
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="panel-title">
              <ShieldCheck size={13} className="text-orbit-300" /> Custody ledger
            </span>
            <Link to={`/traceability`} className="flex items-center gap-1 text-[10.5px] text-glacier-300 hover:text-glacier-200">
              open <ArrowUpRight size={11} />
            </Link>
          </div>
          <Timeline checkpoints={cps} />
        </div>

        <div className="space-y-4">
          {shipment ? (
            <>
              <MapView
                shipment={shipment}
                device={device}
                gps={gps}
                alerts={batchAlerts}
                height={290}
                showLegend={false}
              />
              <div className="panel p-5">
                <p className="panel-title mb-3">
                  <Truck size={13} /> Shipment
                </p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="mono text-[15px] font-bold text-cream">{shipment.id}</p>
                    <p className="mt-0.5 text-[11px] text-cream-faint">
                      {shipment.origin} &rarr; {shipment.destination}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="mono text-[20px] font-semibold text-glacier-300">
                      {Math.round((shipment.progress || 0) * 100)}%
                    </p>
                    <p className="text-[10px] text-cream-faint">
                      {shipment.status === 'delivered'
                        ? 'delivered'
                        : `ETA ${fmtDuration(Math.max(0, (new Date(shipment.eta) - Date.now()) / 1000))}`}
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-abyss-900">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-glacier-500 to-thermal-safe transition-all duration-1000"
                    style={{ width: `${(shipment.progress || 0) * 100}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="panel grid place-items-center py-14 text-center">
              <Boxes size={24} className="text-cream-faint" />
              <p className="mt-3 text-[12.5px] text-cream-faint">No shipment assigned to this batch yet.</p>
            </div>
          )}

          <div className="panel p-5">
            <p className="panel-title mb-3">
              <Cpu size={13} /> Nodes on this batch
            </p>
            <div className="space-y-2">
              {devs.map((d) => (
                <div
                  key={d.id}
                  className={cx(
                    'flex items-center gap-3 rounded-xl border p-3',
                    d.status === 'online'
                      ? 'border-rim-soft bg-abyss-900/50'
                      : 'border-thermal-crit/35 bg-thermal-crit/6',
                  )}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: d.status === 'online' ? C.safe : C.crit }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-semibold text-cream">{d.name}</span>
                    <span className="mono block text-[10.5px] text-cream-faint">{d.id}</span>
                  </span>
                  <span className="mono text-[11px] text-glacier-300">
                    {latestByDevice[d.id]?.temperature != null
                      ? `${latestByDevice[d.id].temperature}\u00b0C`
                      : 'no data'}
                  </span>
                </div>
              ))}
              {!devs.length && (
                <p className="py-4 text-center text-[11.5px] text-cream-faint">No nodes assigned.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ icon: Icon, k, v, sub, tone, wide }) {
  return (
    <div className={cx(wide && 'col-span-2 sm:col-span-3')}>
      <dt className="label flex items-center gap-1">
        <Icon size={10} /> {k}
      </dt>
      <dd className="mt-0.5 text-[12.5px] font-semibold text-cream-dim" style={tone ? { color: tone } : undefined}>
        {v}
      </dd>
      {sub && <p className="text-[10px] text-cream-faint">{sub}</p>}
    </div>
  )
}

function Band({ k, lo, hi, now, unit = '' }) {
  const out = now != null && (now < parseFloat(lo) || now > parseFloat(hi))
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-rim-soft bg-abyss-900/50 px-3 py-2">
      <span className="text-cream-faint">{k}</span>
      <span className="mono text-[11px] text-cream-dim">
        {lo} &ndash; {hi}
      </span>
      {now != null && (
        <span className="mono text-[12px] font-semibold" style={{ color: out ? C.crit : C.safe }}>
          {now}
          {unit}
        </span>
      )}
    </div>
  )
}

const EMOJI = { mango: '\u{1F96D}', grapes: '\u{1F347}', chilli: '\u{1F336}', pomegranate: '\u{1F345}' }
