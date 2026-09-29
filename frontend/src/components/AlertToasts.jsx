import { useNavigate } from 'react-router-dom'
import { X, AlertTriangle, Info, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { useShipments } from '../context/ShipmentContext'
import { cx } from '../lib/format'

const STYLES = {
  critical: { border: 'border-thermal-crit/55', bg: 'from-thermal-crit/22', text: 'text-thermal-crit', icon: ShieldAlert },
  warning: { border: 'border-thermal-warm/50', bg: 'from-thermal-warm/20', text: 'text-thermal-warm', icon: AlertTriangle },
  info: { border: 'border-glacier-500/45', bg: 'from-glacier-500/18', text: 'text-glacier-300', icon: Info },
}

/** Floating stack of freshly raised alerts, bottom-right, auto-expiring. */
export default function AlertToasts() {
  const { toasts, dismissToast } = useShipments()
  const navigate = useNavigate()

  if (!toasts.length) return null

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-[330px] flex-col gap-2.5">
      {toasts.map((t) => {
        const s = STYLES[t.alert.severity] || STYLES.info
        const Icon = s.icon
        return (
          <div
            key={t.id}
            onClick={() => {
              dismissToast(t.id)
              navigate('/alerts')
            }}
            className={cx(
              'pointer-events-auto cursor-pointer animate-slideinright overflow-hidden rounded-xl border bg-gradient-to-r to-abyss-850 p-3.5 shadow-panel backdrop-blur-xl',
              s.border,
              s.bg,
            )}
          >
            <div className="flex gap-2.5">
              <span className={cx('mt-0.5 shrink-0', s.text)}>
                <Icon size={16} strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className={cx('text-[12.5px] font-bold leading-snug', s.text)}>{t.alert.title}</p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-cream-dim">{t.alert.message}</p>
                <p className="mono mt-1.5 text-[9.5px] uppercase tracking-wider text-cream-faint">
                  {t.alert.id}
                  {t.alert.batchId ? ` · ${t.alert.batchId}` : ''}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  dismissToast(t.id)
                }}
                className="shrink-0 text-cream-faint transition-colors hover:text-cream"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
            <div className="mt-2.5 h-[2px] w-full overflow-hidden rounded-full bg-abyss-700">
              <div
                className={cx('h-full rounded-full', s.text.replace('text-', 'bg-'))}
                style={{ animation: 'shrink 6.5s linear forwards' }}
              />
            </div>
          </div>
        )
      })}
      <div className="flex items-center justify-end gap-1.5 pr-1 text-[10px] text-cream-faint">
        <CheckCircle2 size={11} /> click a card to open the console
      </div>
    </div>
  )
}
