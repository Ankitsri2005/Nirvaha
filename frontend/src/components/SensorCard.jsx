import { useMemo } from 'react'
import { Thermometer, Droplets, Wind, Sun, DoorOpen, ShieldAlert, Cpu, WifiOff, Battery, Signal, Clock } from 'lucide-react'
import AnimatedNumber from './AnimatedNumber'
import Badge from './Badge'
import { cx, fmtAgo, round } from '../lib/format'
import { C, thermalColor } from '../lib/palette'
import Sparkline from './Sparkline'

const ICONS = {
  temperature: Thermometer,
  humidity: Droplets,
  gas: Wind,
  light: Sun,
  door: DoorOpen,
  tamper: ShieldAlert,
}

/**
 * One live sensor channel. If the device is dead or offline the card switches to
 * "last valid reading" mode and shows the data age, instead of a blank panel.
 */
export default function SensorCard({
  spec,
  reading,
  history = [],
  device,
  batch,
  stale = false,
  className = '',
}) {
  const Icon = ICONS[spec.key] || Cpu
  const isBinary = Boolean(spec.binary)
  const value = reading?.[spec.key]
  const age = device?.ageSeconds ?? 0

  const series = useMemo(
    () => history.map((h) => Number(h[spec.key]) || 0),
    [history, spec.key],
  )

  /* ---------- binary channels (door, tamper) ---------- */
  if (isBinary) {
    const open = value === 1
    const tone = open ? (spec.key === 'tamper' ? C.crit : C.warm) : C.safe
    return (
      <div
        className={cx(
          'panel panel-hover relative overflow-hidden p-4',
          open && spec.key === 'tamper' && 'animate-flashcrit border-thermal-crit/45',
          className,
        )}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="grid h-8 w-8 place-items-center rounded-lg transition-colors"
            style={{ background: `${tone}1f`, color: tone }}
          >
            <Icon size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold text-cream-dim">{spec.label}</p>
            <p className="text-[15px] font-bold" style={{ color: tone }}>
              {stale ? 'Unknown' : open ? (spec.key === 'tamper' ? 'TRIGGERED' : 'OPEN') : 'Closed'}
            </p>
          </div>
        </div>
        {open && !stale && (
          <p className="mt-2 text-[10.5px] leading-relaxed text-thermal-crit">
            Custody compromised until the seal is re-verified.
          </p>
        )}
      </div>
    )
  }

  /* ---------- analog channels ---------- */
  const outOfBand = !stale && typeof value === 'number' && (value < spec.min || value > spec.max)
  const color = outOfBand ? C.crit : spec.key === 'temperature' ? thermalColor(value ?? 0) : C.glacier
  const overPct = Math.min(100, Math.max(2, ((value - spec.min) / (spec.max - spec.min || 1)) * 100))
  const softBreach = spec.softMax != null && value > spec.softMax && !outOfBand

  return (
    <div
      className={cx(
        'panel panel-hover relative overflow-hidden p-4',
        outOfBand && 'border-thermal-crit/45',
        className,
      )}
    >
      {outOfBand && <span className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-thermal-warm via-thermal-crit to-thermal-crit" />}

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className="grid h-8 w-8 place-items-center rounded-lg transition-transform duration-300"
            style={{ background: `${color}1f`, color }}
          >
            <Icon size={16} />
          </span>
          <div>
            <p className="text-[12px] font-semibold leading-tight text-cream-dim">{spec.label}</p>
            <p className="text-[10px] text-cream-faint">band {spec.min}–{spec.max}{spec.unit}</p>
          </div>
        </div>
        {series.length > 1 && <Sparkline values={series} color={color} w={52} h={22} />}
      </div>

      <div className="mt-3 flex items-end gap-1.5">
        <span className="font-mono text-[28px] font-semibold leading-none tracking-tight" style={{ color: stale ? C.faint : color }}>
          {stale ? '--' : <AnimatedNumber value={value ?? 0} decimals={spec.decimals} />}
        </span>
        <span className="mb-0.5 text-[11px] font-medium text-cream-faint">{spec.unit}</span>
        {outOfBand && (
          <span className="mb-1 ml-auto">
            <Badge tone="crit" dot pulse>
              breach
            </Badge>
          </span>
        )}
        {softBreach && (
          <span className="mb-1 ml-auto">
            <Badge tone="warn" dot>
              rising
            </Badge>
          </span>
        )}
      </div>

      {/* band gauge */}
      <div className="relative mt-3 h-1.5 w-full overflow-hidden rounded-full bg-abyss-900">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-thermal-frost/30 via-thermal-safe/30 to-thermal-crit/30" />
        {!stale && (
          <span
            className="absolute top-1/2 h-3.5 w-[3px] -translate-y-1/2 rounded-full transition-all duration-700 ease-out"
            style={{ left: `calc(${overPct}% - 1.5px)`, background: color, boxShadow: `0 0 10px 1px ${color}` }}
          />
        )}
      </div>

      {stale && (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-thermal-warm/30 bg-thermal-warm/8 px-2.5 py-1.5">
          <Clock size={12} className="text-thermal-warm" />
          <p className="text-[10.5px] leading-tight text-thermal-warm">
            Last valid reading {fmtAgo(reading?.timestamp || device?.lastValidAt)}
            {age > 0 ? ` · stale ${Math.round(age)}s` : ''}
          </p>
        </div>
      )}
    </div>
  )
}

/** Compact footer strip shown under a device's sensor grid. */
export function DeviceFooter({ device }) {
  const batt = device?.battery ?? 0
  const battColor = batt < 20 ? C.crit : batt < 45 ? C.warm : C.safe
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-rim-soft/70 px-4 py-2.5 text-[10.5px] text-cream-faint">
      <span className="flex items-center gap-1.5">
        <Battery size={12} style={{ color: battColor }} />
        <span className="mono" style={{ color: battColor }}>{round(batt, 0)}%</span>
        <span className="text-cream-faint/70">battery</span>
      </span>
      <span className="flex items-center gap-1.5">
        <Signal size={12} className={device?.signal < -85 ? 'text-thermal-warm' : 'text-glacier-400'} />
        <span className="mono">{device?.signal} dBm</span>
      </span>
      <span className="flex items-center gap-1.5">
        <Cpu size={12} />
        <span className="mono">fw {device?.firmware}</span>
      </span>
      {device?.bufferedReadings > 0 && (
        <span className="flex items-center gap-1.5 text-thermal-warm">
          <WifiOff size={12} />
          <span className="mono">{device.bufferedReadings} rows on SD</span>
        </span>
      )}
      <span className="ml-auto flex items-center gap-1.5">
        <span className="relative flex h-1.5 w-1.5">
          {device?.status === 'online' && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-thermal-safe opacity-70 animate-pulsering" />
          )}
          <span
            className={cx(
              'relative inline-flex h-1.5 w-1.5 rounded-full',
              device?.status === 'online'
                ? 'bg-thermal-safe animate-pulsedot'
                : device?.status === 'fault'
                  ? 'bg-thermal-crit'
                  : 'bg-cream-faint',
            )}
          />
        </span>
        {device?.status}
      </span>
    </div>
  )
}
