import { Link } from 'react-router-dom'
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  Thermometer,
  Droplets,
  Wind,
  Cpu,
  WifiOff,
  DoorOpen,
  Battery,
  Signal,
  Sparkles,
  MapPinOff,
  CheckCircle2,
  ClipboardCheck,
  PackageCheck,
  Repeat,
} from 'lucide-react'
import Badge from './Badge'
import { cx, fmtAgo, fmtTime } from '../lib/format'

const TYPE_META = {
  temperature_breach: { icon: Thermometer, tone: 'crit' },
  humidity_breach: { icon: Droplets, tone: 'warn' },
  gas_spike: { icon: Wind, tone: 'warn' },
  sensor_failure: { icon: Cpu, tone: 'crit' },
  device_offline: { icon: WifiOff, tone: 'warn' },
  device_online: { icon: CheckCircle2, tone: 'safe' },
  tamper: { icon: DoorOpen, tone: 'crit' },
  spoilage_risk: { icon: Sparkles, tone: 'orbit' },
  battery_low: { icon: Battery, tone: 'info' },
  signal_weak: { icon: Signal, tone: 'info' },
  geofence: { icon: MapPinOff, tone: 'crit' },
  delivered: { icon: PackageCheck, tone: 'safe' },
  checkpoint: { icon: ClipboardCheck, tone: 'info' },
  door_open: { icon: DoorOpen, tone: 'warn' },
}

const SEV = {
  critical: { tone: 'crit', Icon: ShieldAlert, label: 'Critical' },
  warning: { tone: 'warn', Icon: AlertTriangle, label: 'Warning' },
  info: { tone: 'info', Icon: Info, label: 'Info' },
}

export default function AlertCard({ alert, onAck, onResolve, compact = false }) {
  const sev = SEV[alert.severity] || SEV.info
  const type = TYPE_META[alert.type] || { icon: Info, tone: 'info' }
  const Icon = alert.resolved ? CheckCircle2 : type.icon
  const resolved = alert.resolved

  return (
    <div
      className={cx(
        'group relative overflow-hidden rounded-2xl border bg-abyss-850/60 p-4 backdrop-blur-sm transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-rim-bright hover:bg-abyss-850',
        resolved
          ? 'border-rim-soft opacity-60'
          : alert.severity === 'critical'
            ? 'border-thermal-crit/40'
            : alert.severity === 'warning'
              ? 'border-thermal-warm/35'
              : 'border-rim-soft',
        !resolved && alert.severity === 'critical' && 'animate-slideinbottom',
      )}
    >
      {/* severity rail */}
      <span
        className={cx(
          'absolute inset-y-0 left-0 w-[3px] transition-opacity',
          resolved ? 'bg-thermal-safe/50' : alert.severity === 'critical' ? 'bg-thermal-crit' : alert.severity === 'warning' ? 'bg-thermal-warm' : 'bg-glacier-400',
        )}
      />

      <div className="flex gap-3 pl-1.5">
        <span
          className={cx(
            'mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110',
            resolved
              ? 'bg-thermal-safe/12 text-thermal-safe'
              : alert.severity === 'critical'
                ? 'bg-thermal-crit/14 text-thermal-crit'
                : alert.severity === 'warning'
                  ? 'bg-thermal-warm/14 text-thermal-warm'
                  : 'bg-glacier-500/12 text-glacier-300',
          )}
        >
          <Icon size={17} strokeWidth={2.1} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={cx('text-[13.5px] font-bold leading-tight', resolved ? 'text-cream-faint line-through decoration-1' : 'text-cream')}>
              {alert.title}
            </h3>
            <Badge tone={resolved ? 'safe' : sev.tone} dot={!resolved} pulse={!resolved && alert.severity === 'critical'}>
              {resolved ? 'Resolved' : sev.label}
            </Badge>
            {alert.occurrences > 1 && (
              <Badge tone="muted">
                <Repeat size={10} /> {alert.occurrences} cycles
              </Badge>
            )}
          </div>

          {!compact && <p className="mt-1.5 text-[12px] leading-relaxed text-cream-dim">{alert.message}</p>}

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[10.5px] text-cream-faint">
            <span className="mono">{fmtTime(alert.timestamp)} · {fmtAgo(alert.timestamp)}</span>
            {alert.deviceId && <span className="mono">{alert.deviceId}</span>}
            {alert.batchId && (
              <Link to={`/batches/${alert.batchId}`} className="mono text-glacier-300 transition-colors hover:text-glacier-200">
                {alert.batchId}
              </Link>
            )}
            {alert.value != null && alert.threshold != null && (
              <span className="mono">
                <span className="font-bold text-thermal-crit">{alert.value}{alert.unit}</span>
                <span className="text-cream-faint/70"> / limit {alert.threshold}{alert.unit}</span>
              </span>
            )}
          </div>

          {!compact && (onAck || onResolve) && !resolved && (
            <div className="mt-3 flex gap-2">
              {onAck && !alert.acknowledged && (
                <button onClick={() => onAck(alert.id)} className="btn-ghost px-2.5 py-1 text-[11px]">
                  Acknowledge
                </button>
              )}
              {onResolve && (
                <button onClick={() => onResolve(alert.id)} className="btn-safe px-2.5 py-1 text-[11px]">
                  Resolve
                </button>
              )}
            </div>
          )}
          {resolved && alert.resolvedAt && (
            <p className="mt-2 flex items-center gap-1.5 text-[10.5px] text-thermal-safe">
              <CheckCircle2 size={12} /> auto-resolved at {fmtTime(alert.resolvedAt)} - values back in band
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
