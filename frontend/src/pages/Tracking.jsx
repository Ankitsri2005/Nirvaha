import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Navigation, Gauge, Fuel, Clock, Route, Cpu, Radio, ArrowUpRight, MapPin, Signal } from 'lucide-react'
import MapView from '../components/MapView'
import SimulatorPanel from '../components/SimulatorPanel'
import SensorCard, { DeviceFooter } from '../components/SensorCard'
import Badge from '../components/Badge'
import MiniTrend from '../components/MiniTrend'
import { useShipments } from '../context/ShipmentContext'
import { cx, fmtAgo, fmtClock12, fmtDuration, round } from '../lib/format'
import { C, SHIPMENT_STATUS } from '../lib/palette'

export default function Tracking() {
  const {
    shipments,
    devices,
    batches,
    gps,
    alerts,
    historyByDevice,
    latestByDevice,
    selectedShipmentId,
    setSelectedShipmentId,
  } = useShipments()
  const [dark, setDark] = useState(true)

  const shipment = shipments.find((s) => s.id === selectedShipmentId) || shipments[0]
  const batch = batches.find((b) => b.id === shipment?.batchId)
  const device =
    devices.find((d) => d.shipmentId === shipment?.id && d.status !== 'offline') ||
    devices.find((d) => d.shipmentId === shipment?.id)
  const reading = latestByDevice[device?.id]
  const history = historyByDevice[device?.id] || []
  const track = useMemo(() => gps.filter((g) => g.shipmentId === shipment?.id), [gps, shipment?.id])
  const deviceAlerts = alerts.filter((a) => a.deviceId === device?.id)

  const remainingKm = Math.max(0, (shipment?.distanceKm || 0) - (shipment?.distanceTravelledKm || 0))
  const etaMs = shipment?.eta ? new Date(shipment.eta) - new Date() : 0

  return (
    <div className="space-y-4">
      <SimulatorPanel />

      {/* shipment tabs */}
      <div className="flex flex-wrap gap-1.5">
        {shipments.map((s) => {
          const st = SHIPMENT_STATUS[s.status] || SHIPMENT_STATUS.pending
          const on = s.id === shipment?.id
          return (
            <button
              key={s.id}
              onClick={() => setSelectedShipmentId(s.id)}
              className={cx(
                'flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left transition-all duration-200',
                on ? 'border-glacier-500/55 bg-glacier-500/10' : 'border-rim-soft bg-abyss-850/60 hover:border-rim-bright',
              )}
            >
              <span className="relative flex h-2 w-2">
                {s.status !== 'delivered' && (
                  <span className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-pulsering" style={{ background: st.color }} />
                )}
                <span className="relative h-2 w-2 rounded-full" style={{ background: st.color }} />
              </span>
              <span>
                <span className={cx('mono block text-[12px] font-bold', on ? 'text-glacier-300' : 'text-cream-dim')}>{s.id}</span>
                <span className="block text-[9.5px] text-cream-faint">
                  {s.origin.split(',')[0]} &rarr; {s.destination.split(',')[0]}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {/* main grid */}
      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          <MapView
            shipment={shipment}
            device={device}
            gps={gps}
            alerts={deviceAlerts}
            height={520}
            dark={dark}
          />

          {/* route legs */}
          <div className="panel p-5">
            <div className="mb-3.5 flex items-center justify-between">
              <span className="panel-title">
                <Route size={13} /> Route legs
              </span>
              <span className="mono text-[10.5px] text-cream-faint">{track.length} GPS fixes logged</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {(shipment?.waypoints || []).map((w, i, arr) => {
                const done = shipment.progress >= i / (arr.length - 1 || 1)
                const isNext = !done && i === Math.ceil(shipment.progress * (arr.length - 1))
                return (
                  <div
                    key={w.key}
                    className={cx(
                      'relative rounded-xl border p-3 transition-all duration-500',
                      isNext
                        ? 'border-glacier-500/50 bg-glacier-500/8'
                        : done
                          ? 'border-thermal-safe/30 bg-thermal-safe/6'
                          : 'border-rim-soft bg-abyss-900/40',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="mono grid h-5 w-5 shrink-0 place-items-center rounded-md text-[9.5px] font-bold"
                        style={{
                          background: done ? 'rgba(61,220,151,0.18)' : isNext ? 'rgba(34,211,238,0.18)' : 'rgba(29,50,67,0.6)',
                          color: done ? C.safe : isNext ? C.glacier : C.faint,
                        }}
                      >
                        {i + 1}
                      </span>
                      <p className="truncate text-[11.5px] font-semibold text-cream-dim">{w.label}</p>
                    </div>
                    <p className="mt-1.5 flex items-center gap-1 text-[10px] text-cream-faint">
                      <MapPin size={10} /> {w.place}
                    </p>
                    {i < arr.length - 1 && (
                      <span
                        className={cx(
                          'absolute -right-1.5 top-1/2 h-px w-3 -translate-y-1/2',
                          done ? 'bg-thermal-safe/50' : 'bg-rim',
                        )}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* right rail */}
        <div className="space-y-4">
          {/* trip card */}
          <div className="panel overflow-hidden">
            <div className="panel-head">
              <span className="panel-title">
                <Navigation size={13} className="text-glacier-300" /> Trip
              </span>
              <Badge
                tone={
                  shipment?.status === 'breach' ? 'crit' : shipment?.status === 'delivered' ? 'safe' : 'info'
                }
                dot
                pulse={shipment?.status === 'breach'}
              >
                {SHIPMENT_STATUS[shipment?.status]?.label}
              </Badge>
            </div>

            <div className="p-5">
              {/* progress */}
              <div className="flex items-baseline justify-between">
                <p className="mono text-[28px] font-semibold leading-none text-cream">
                  {Math.round((shipment?.progress || 0) * 100)}
                  <span className="text-[15px] text-cream-faint">%</span>
                </p>
                <p className="mono text-[11px] text-cream-faint">
                  {round(shipment?.distanceTravelledKm || 0, 0)} / {round(shipment?.distanceKm || 0, 0)} km
                </p>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-abyss-900">
                <div
                  className={cx(
                    'h-full rounded-full transition-all duration-1000 ease-out',
                    shipment?.status === 'breach'
                      ? 'bg-gradient-to-r from-thermal-warm to-thermal-crit'
                      : 'bg-gradient-to-r from-glacier-500 to-thermal-safe',
                  )}
                  style={{ width: `${(shipment?.progress || 0) * 100}%`, boxShadow: '0 0 12px rgba(34,211,238,0.6)' }}
                />
              </div>

              {/* stats grid */}
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <Stat icon={Gauge} label="Speed" value={`${Math.round(shipment?.speed || 0)}`} unit="km/h" />
                <Stat icon={Fuel} label="Remaining" value={round(remainingKm, 0)} unit="km" />
                <Stat icon={Clock} label="ETA" value={etaMs > 0 ? fmtDuration(etaMs / 1000) : 'arrived'} />
                <Stat
                  icon={Radio}
                  label="Last fix"
                  value={fmtClock12(shipment?.lastFixAt)}
                  mono={false}
                />
              </div>

              {/* coordinates */}
              <div className="mt-4 rounded-xl border border-rim-soft bg-abyss-900/60 p-3">
                <p className="label mb-1.5">Position</p>
                <p className="mono text-[13px] text-glacier-300">
                  {shipment?.position?.[0]?.toFixed(5)}, {shipment?.position?.[1]?.toFixed(5)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[10.5px] text-cream-faint">
                  <span>heading {Math.round(shipment?.heading || 0)}&deg;</span>
                  <span>fix {fmtAgo(shipment?.lastFixAt)}</span>
                  {device && (
                    <span className={cx('flex items-center gap-1', device.signal < -85 ? 'text-thermal-warm' : 'text-thermal-safe')}>
                      <Signal size={10} /> {device.signal} dBm
                    </span>
                  )}
                </div>
              </div>

              {/* vehicle + driver */}
              <dl className="mt-4 space-y-2 border-t border-rim-soft pt-3.5 text-[11.5px]">
                <Row k="Vehicle" v={shipment?.vehicle} />
                <Row k="Driver" v={shipment?.driver} />
                <Row k="Transporter" v={shipment?.transporter} />
                <Row k="Seal" v={shipment?.sealId} mono />
                <Row k="Batch" v={batch ? `${batch.id} · ${batch.product}` : '-'} />
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setDark((d) => !d)}
                  className="btn-ghost flex-1 text-[11.5px]"
                >
                  {dark ? 'Light map' : 'Dark map'}
                </button>
                {batch && (
                  <Link to={`/batches/${batch.id}`} className="btn-ghost flex-1 text-[11.5px]">
                    Batch details <ArrowUpRight size={13} />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* on-board sensors */}
          {device && batch && (
            <div className="panel overflow-hidden">
              <div className="panel-head">
                <span className="panel-title">
                  <Cpu size={13} /> On-board sensors
                </span>
                <span className="mono text-[10.5px] text-cream-faint">{device.id}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4">
                {batch.sensors.slice(0, 2).map((spec) => (
                  <SensorCard
                    key={spec.key}
                    spec={spec}
                    reading={reading}
                    history={history}
                    device={device}
                    batch={batch}
                    stale={device.status !== 'online'}
                  />
                ))}
              </div>
              <div className="px-4 pb-4">
                <MiniTrend
                  data={history}
                  dataKey="temperature"
                  band={[batch.minTemp, batch.maxTemp]}
                  label="Cold-chain stability (last 2 min)"
                  height={80}
                />
              </div>
              <DeviceFooter device={device} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label, value, unit, mono = true }) {
  return (
    <div className="rounded-xl border border-rim-soft bg-abyss-900/50 p-2.5">
      <p className="label flex items-center gap-1">
        <Icon size={10} /> {label}
      </p>
      <p className={cx('mt-1 text-[15px] font-semibold text-cream', mono && 'mono')}>
        {value}
        {unit && <span className="ml-1 text-[10px] font-medium text-cream-faint">{unit}</span>}
      </p>
    </div>
  )
}

function Row({ k, v, mono }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="shrink-0 text-cream-faint">{k}</dt>
      <dd className={cx('truncate text-cream-dim', mono ? 'mono text-[11px]' : 'text-[11.5px]')}>{v || '-'}</dd>
    </div>
  )
}
