import { useMemo, useState } from 'react'
import {
  Thermometer,
  Cpu,
  WifiOff,
  Wifi,
  DoorOpen,
  RotateCcw,
  Play,
  Pause,
  Gauge,
  ChevronDown,
  Zap,
} from 'lucide-react'
import { useShipments } from '../context/ShipmentContext'
import { cx, fmtAgo } from '../lib/format'
import Badge from './Badge'

/**
 * Demo console. Every button here maps to a scenario in the simulation loop, so
 * what a judge sees on the dashboard is produced by the same code path the real
 * MQTT publisher will use in phase 3.
 */
export default function SimulatorPanel({ className = '', defaultDevice = 'auto' }) {
  const {
    devices,
    actions,
    paused,
    pause,
    reset,
    speedScale,
    setSpeedScale,
    syncEvents,
    lastTickAt,
  } = useShipments()

  const [open, setOpen] = useState(true)
  const [target, setTarget] = useState(defaultDevice)

  const selectable = useMemo(
    () => devices.filter((d) => d.status !== 'offline').slice(0, 4),
    [devices],
  )
  const targetId = target === 'auto' ? undefined : target
  const effective = targetId || devices.find((d) => d.status === 'online' && d.shipmentId === 'SHP-2041')?.id || devices[0]?.id
  const device = devices.find((d) => d.id === effective)

  const offlineCount = devices.filter((d) => d.status === 'offline').length
  const faultCount = devices.filter((d) => d.status === 'fault').length

  return (
    <div className={cx('panel relative overflow-hidden', className)}>
      {/* top glow */}
      <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orbit-400/12 blur-2xl" />

      <div className="panel-head relative">
        <span className="panel-title">
          <Zap size={13} className="text-orbit-300" />
          Scenario simulator
        </span>
        <div className="flex items-center gap-2">
          <span className="hidden text-[10px] text-cream-faint sm:inline">tick {fmtAgo(lastTickAt)}</span>
          <button onClick={() => setOpen((o) => !o)} className="btn-icon h-7 w-7">
            <ChevronDown size={14} className={cx('transition-transform duration-300', open && 'rotate-180')} />
          </button>
        </div>
      </div>

      <div
        className={cx(
          'grid transition-all duration-500 ease-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 p-4">
            {/* target picker */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="label">Target</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setTarget('auto')}
                  className={cx(
                    'rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all',
                    target === 'auto'
                      ? 'border-orbit-400/60 bg-orbit-400/12 text-orbit-300'
                      : 'border-rim-soft bg-abyss-900 text-cream-faint hover:border-rim-bright',
                  )}
                >
                  Auto (truck A)
                </button>
                {selectable.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setTarget(d.id)}
                    className={cx(
                      'mono rounded-lg border px-2.5 py-1 text-[10.5px] font-semibold transition-all',
                      target === d.id
                        ? 'border-glacier-500/60 bg-glacier-500/12 text-glacier-300'
                        : 'border-rim-soft bg-abyss-900 text-cream-faint hover:border-rim-bright',
                    )}
                  >
                    {d.id}
                  </button>
                ))}
              </div>
            </div>

            {/* the three headline scenarios */}
            <div className="grid gap-2 sm:grid-cols-2">
              <ScenarioButton
                onClick={() => actions.simulateTemperatureRise(targetId)}
                icon={Thermometer}
                title="Simulate temperature rise"
                desc="Reefer fails, cargo warms past the limit"
                tone="crit"
              />
              <ScenarioButton
                onClick={() => actions.simulateSensorFailure(targetId)}
                icon={Cpu}
                title="Simulate sensor failure"
                desc="Node stops reporting - last valid reading"
                tone="crit"
              />
              <ScenarioButton
                onClick={() => actions.goOffline(targetId)}
                icon={WifiOff}
                title="Go offline"
                desc="Uplink drops, readings buffer to microSD"
                tone="warn"
              />
              <ScenarioButton
                onClick={() => actions.goOnline(targetId)}
                icon={Wifi}
                title="Reconnect + sync"
                desc="Flush the SD buffer, drop duplicates"
                tone="safe"
                disabled={!offlineCount}
              />
              <ScenarioButton
                onClick={() => actions.simulateTamper(targetId)}
                icon={DoorOpen}
                title="Simulate tamper"
                desc="Door opened mid-route, custody broken"
                tone="crit"
              />
              <ScenarioButton
                onClick={() => actions.clearTemperatureRise(targetId)}
                icon={Gauge}
                title="Return to setpoint"
                desc="Cooling restored, alerts auto-resolve"
                tone="info"
              />
            </div>

            {/* stream controls */}
            <div className="flex flex-wrap items-center gap-2 border-t border-rim-soft pt-3.5">
              <button onClick={() => pause(paused ? false : true)} className={paused ? 'btn-warn' : 'btn-ghost'}>
                {paused ? <Play size={14} /> : <Pause size={14} />}
                {paused ? 'Resume' : 'Pause'}
              </button>

              <div className="flex items-center gap-2 px-1">
                <span className="label">Speed</span>
                <input
                  type="range"
                  min="0.25"
                  max="4"
                  step="0.25"
                  value={speedScale}
                  onChange={(e) => setSpeedScale(Number(e.target.value))}
                  className="slider w-28"
                />
                <span className="mono w-9 text-[11px] text-cream-dim">{speedScale.toFixed(2)}x</span>
              </div>

              <button onClick={reset} className="btn-ghost ml-auto">
                <RotateCcw size={14} /> Reset
              </button>
            </div>

            {/* live status strip */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MiniStat label="Target" value={device?.id || '-'} tone="info" />
              <MiniStat label="Faulted" value={faultCount} tone={faultCount ? 'crit' : 'safe'} />
              <MiniStat label="Offline" value={offlineCount} tone={offlineCount ? 'warn' : 'safe'} />
              <MiniStat label="Synced" value={syncEvents[0] ? `${syncEvents[0].rows} rows` : 'none'} tone="orbit" />
            </div>

            {syncEvents.length > 0 && (
              <div className="animate-slideinbottom rounded-xl border border-orbit-400/30 bg-orbit-400/8 p-3">
                <p className="label mb-1.5">Last SD-card sync</p>
                <p className="mono text-[11px] leading-relaxed text-cream-dim">
                  {syncEvents[0].deviceId} &middot; {syncEvents[0].rows} rows uploaded &middot;{' '}
                  <span className="text-thermal-safe">{syncEvents[0].duplicates} duplicates rejected</span> &middot;{' '}
                  {syncEvents[0].ms} ms
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ScenarioButton({ onClick, icon: Icon, title, desc, tone, disabled }) {
  const tones = {
    crit: 'border-thermal-crit/35 hover:border-thermal-crit/70 hover:bg-thermal-crit/10',
    warn: 'border-thermal-warm/35 hover:border-thermal-warm/70 hover:bg-thermal-warm/10',
    safe: 'border-thermal-safe/35 hover:border-thermal-safe/70 hover:bg-thermal-safe/10',
    info: 'border-glacier-500/35 hover:border-glacier-500/70 hover:bg-glacier-500/10',
  }
  const iconTones = {
    crit: 'bg-thermal-crit/12 text-thermal-crit',
    warn: 'bg-thermal-warm/12 text-thermal-warm',
    safe: 'bg-thermal-safe/12 text-thermal-safe',
    info: 'bg-glacier-500/12 text-glacier-300',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'group flex items-start gap-2.5 rounded-xl border bg-abyss-900/50 p-3 text-left transition-all duration-200 active:scale-[0.98]',
        tones[tone],
        disabled && 'pointer-events-none opacity-35',
      )}
    >
      <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-transform duration-300 group-hover:scale-110', iconTones[tone])}>
        <Icon size={15} />
      </span>
      <span className="min-w-0">
        <span className="block text-[12px] font-bold leading-tight text-cream">{title}</span>
        <span className="mt-0.5 block text-[10.5px] leading-snug text-cream-faint">{desc}</span>
      </span>
    </button>
  )
}

function MiniStat({ label, value, tone }) {
  return (
    <div className="rounded-lg border border-rim-soft bg-abyss-900/50 px-2.5 py-2">
      <p className="label">{label}</p>
      <p className="mono mt-0.5 text-[12px] font-semibold text-cream">
        {value}
        {tone && <Badge tone={tone} className="ml-1.5" dot />}
      </p>
    </div>
  )
}
