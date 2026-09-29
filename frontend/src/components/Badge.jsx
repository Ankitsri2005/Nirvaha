import { cx } from '../lib/format'

/** Small status/severity pill used everywhere. */
export default function Badge({ tone = 'neutral', children, dot = false, pulse = false, className = '' }) {
  const tones = {
    neutral: 'border-rim bg-abyss-800 text-cream-dim',
    safe: 'border-thermal-safe/40 bg-thermal-safe/10 text-thermal-safe',
    warn: 'border-thermal-warm/40 bg-thermal-warm/10 text-thermal-warm',
    crit: 'border-thermal-crit/45 bg-thermal-crit/12 text-thermal-crit',
    info: 'border-glacier-500/40 bg-glacier-500/10 text-glacier-300',
    orbit: 'border-orbit-400/40 bg-orbit-400/10 text-orbit-300',
    muted: 'border-rim-soft bg-abyss-900 text-cream-faint',
  }
  const dots = {
    neutral: 'bg-cream-faint',
    safe: 'bg-thermal-safe',
    warn: 'bg-thermal-warm',
    crit: 'bg-thermal-crit',
    info: 'bg-glacier-400',
    orbit: 'bg-orbit-400',
    muted: 'bg-cream-faint',
  }
  return (
    <span className={cx('chip', tones[tone] || tones.neutral, className)}>
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && <span className={cx('absolute inline-flex h-full w-full rounded-full opacity-70 animate-pulsering', dots[tone] || dots.neutral)} />}
          <span className={cx('relative inline-flex h-1.5 w-1.5 rounded-full', dots[tone] || dots.neutral, pulse && 'animate-pulsedot')} />
        </span>
      )}
      {children}
    </span>
  )
}
