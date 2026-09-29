import { Link } from 'react-router-dom'
import { Cpu, Battery, Signal, WifiOff, Wrench, RotateCw, Activity } from 'lucide-react'
import Badge from './Badge'
import { cx, fmtAgo } from '../lib/format'
import { C, DEVICE_STATUS } from '../lib/palette'

/**
 * Device roster row. A node that is faulted shows its age and a "last valid
 * reading" warning rather than pretending to be healthy.
 */
export default function DeviceHealth({ device, onRecover, className = '' }) {
  const st = DEVICE_STATUS[device.status] || DEVICE_STATUS.offline
  const bat = device.battery ?? 0
  const batColor = bat < 20 ? C.crit : bat < 45 ? C.warm : C.safe
  const faulted = device.status === 'fault'
  const offline = device.status === 'offline'

  return (
    <div
      className={cx(
        'panel panel-hover group relative overflow-hidden',
        faulted && 'border-thermal-crit/40',
        offline && 'border-rim',
        className,
      )}
    >
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent" style={{ background: `linear-gradient(90deg, ${st.color}, transparent)` }} />

      <div className="p-4">
        <div className="flex items-start gap-3">
          <span
            className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl"
            style={{ background: `${st.color}18`, color: st.color }}
          >
            {faulted || offline ? <WifiOff size={18} /> : <Cpu size={18} />}
            {device.status === 'online' && (
              <span className="absolute inset-0 rounded-xl border border-thermal-safe/30 animate-pulsering" />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-[13px] font-bold text-cream">{device.name}</h3>
              <Badge tone={device.status === 'online' ? 'safe' : device.status === 'fault' ? 'crit' : device.status === 'maintenance' ? 'warn' : 'muted'} dot pulse={device.status === 'fault'}>
                {st.label}
              </Badge>
            </div>
            <p className="mono mt-0.5 text-[10.5px] text-cream-faint">{device.id} &middot; fw {device.firmware}</p>
            <p className="mt-1.5 truncate text-[11px] text-cream-dim">{device.role}</p>
          </div>
        </div>

        {/* gauges */}
        <div className="mt-3.5 grid grid-cols-3 gap-2">
          <Gauge
            icon={Battery}
            label="Battery"
            value={bat}
            display={`${Math.round(bat)}%`}
            pct={bat}
            color={batColor}
          />
          <Gauge
            icon={Signal}
            label="Signal"
            value={device.signal}
            display={`${device.signal}`}
            pct={((device.signal + 99) / 57) * 100}
            color={device.signal < -85 ? C.warm : C.glacier}
          />
          <Gauge icon={Activity} label="Uptime" display={faulted ? 'stale' : 'live'} pct={faulted ? 12 : 100} color={faulted ? C.crit : C.safe} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-cream-faint">
          <span>last seen {fmtAgo(device.lastSeen)}</span>
          {device.ageSeconds > 0 && (
            <span className="mono text-thermal-warm">age {device.ageSeconds}s</span>
          )}
          {device.bufferedReadings > 0 && (
            <span className="mono text-thermal-warm">{device.bufferedReadings} rows on SD</span>
          )}
        </div>

        {(faulted || offline) && (
          <div className={cx('mt-3 flex items-center gap-2 rounded-lg border px-2.5 py-2', offline ? 'border-thermal-warm/30 bg-thermal-warm/8' : 'border-thermal-crit/30 bg-thermal-crit/8')}>
            <Wrench size={13} className={offline ? 'text-thermal-warm' : 'text-thermal-crit'} />
            <p className={cx('flex-1 text-[10.5px] leading-snug', offline ? 'text-thermal-warm' : 'text-thermal-crit')}>
              {offline
                ? 'Uplink down. Readings buffering to microSD - nothing lost.'
                : 'Sensor silent. Console is showing the last valid reading.'}
            </p>
            <button onClick={() => onRecover?.(device.id)} className="btn-safe px-2 py-1 text-[10.5px]">
              <RotateCw size={11} /> Recover
            </button>
          </div>
        )}

        {device.batchId && (
          <Link
            to={`/batches/${device.batchId}`}
            className="mono mt-3 inline-flex items-center gap-1.5 text-[10.5px] text-glacier-300 transition-colors hover:text-glacier-200"
          >
            {device.batchId} &rarr;
          </Link>
        )}
      </div>
    </div>
  )
}

function Gauge({ icon: Icon, label, display, pct, color }) {
  return (
    <div className="rounded-lg border border-rim-soft bg-abyss-900/50 px-2 py-1.5">
      <p className="label flex items-center gap-1">
        <Icon size={10} /> {label}
      </p>
      <p className="mono mt-0.5 text-[12px] font-semibold" style={{ color }}>
        {display}
      </p>
      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-abyss-800">
        <span
          className="block h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.max(3, Math.min(100, pct))}%`, background: color, boxShadow: `0 0 8px ${color}99` }}
        />
      </div>
    </div>
  )
}
