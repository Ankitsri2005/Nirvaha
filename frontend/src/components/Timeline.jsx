import { Sprout, PackageCheck, Snowflake, Truck, Warehouse, ShieldCheck, Stamp, CircleDot, Box } from 'lucide-react'
import Badge from './Badge'
import { cx, fmtDateTime } from '../lib/format'

const TYPE_ICON = {
  Farm: Sprout,
  'Pre-cooling': Snowflake,
  Collection: Box,
  'Cold storage': Warehouse,
  'Transit hub': Truck,
  Transport: Truck,
  Customs: Stamp,
  Delivery: PackageCheck,
}

const SCAN = ['#60A5FA', '#06B6D4', '#3DDC97', '#FFC24B', '#FF7A45', '#FF5C7A']

/**
 * Chain-of-custody timeline. Each row is hash-linked to the previous one, so
 * the connector is drawn as a gradient bar that animates in on mount.
 */
export default function Timeline({ checkpoints = [], className = '', onSelect }) {
  if (!checkpoints.length) {
    return (
      <div className={cx('panel grid place-items-center p-10 text-center', className)}>
        <p className="text-[13px] text-cream-faint">No custody records yet.</p>
      </div>
    )
  }

  return (
    <ol className={cx('relative space-y-3', className)}>
      {/* the spine */}
      <span className="absolute bottom-4 left-[19px] top-4 w-px bg-gradient-to-b from-thermal-frost via-glacier-500 via-thermal-safe to-thermal-warm opacity-40" />

      {checkpoints.map((cp, i) => {
        const Icon = TYPE_ICON[cp.type] || CircleDot
        const color = SCAN[Math.min(i, SCAN.length - 1)]
        const future = cp.status === 'pending'
        return (
          <li
            key={cp.id}
            onClick={() => onSelect?.(cp)}
            className={cx(
              'group relative flex gap-3.5 rounded-xl border p-3 transition-all duration-300',
              onSelect && 'cursor-pointer',
              future
                ? 'border-dashed border-rim bg-abyss-900/40'
                : 'border-rim-soft bg-abyss-850/60 hover:border-rim-bright hover:bg-abyss-800',
            )}
            style={{ animation: `slideinright .35s cubic-bezier(.16,1,.3,1) ${i * 55}ms both` }}
          >
            <span
              className={cx(
                'relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 transition-transform duration-300 group-hover:scale-110',
                future ? 'border-rim bg-abyss-900 text-cream-faint' : 'bg-abyss-850',
              )}
              style={future ? undefined : { borderColor: `${color}88`, color, boxShadow: `0 0 16px -4px ${color}aa` }}
            >
              <Icon size={17} strokeWidth={2.1} />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className={cx('text-[13px] font-bold', future ? 'text-cream-faint' : 'text-cream')}>{cp.type}</h4>
                <Badge tone={future ? 'muted' : cp.onChain ? 'orbit' : 'warn'}>
                  {cp.onChain ? (
                    <>
                      <ShieldCheck size={10} /> ledger
                    </>
                  ) : (
                    'unanchored'
                  )}
                </Badge>
                {cp.auto && <Badge tone="info">auto</Badge>}
              </div>

              <p className="mt-1 text-[11.5px] font-medium text-cream-dim">{cp.location}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-cream-faint">{cp.notes}</p>

              <div className="mt-2 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[10.5px] text-cream-faint">
                <span className="mono">{fmtDateTime(cp.timestamp)}</span>
                {cp.handler && (
                  <span className="flex items-center gap-1">
                    <CircleDot size={10} /> {cp.handler}
                  </span>
                )}
                {cp.temperature != null && (
                  <span className="mono text-glacier-300">{cp.temperature}&deg;C / {cp.humidity}%</span>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/** Horizontal 5-step progress used on the batch detail page. */
export function CustodySteps({ checkpoints = [], total = 5 }) {
  const done = Math.min(total, checkpoints.filter((c) => c.status === 'complete').length)
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cx(
            'h-1.5 flex-1 rounded-full transition-all duration-500',
            i < done ? 'bg-gradient-to-r from-glacier-500 to-thermal-safe' : 'bg-abyss-750',
          )}
          style={{ transitionDelay: `${i * 90}ms` }}
        />
      ))}
    </div>
  )
}
