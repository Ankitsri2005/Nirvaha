import { NavLink, useLocation } from 'react-router-dom'
import { Snowflake, X, LogOut } from 'lucide-react'
import { NAV_ITEMS } from '../lib/nav'
import { useAuth } from '../context/AuthContext'
import { useShipments } from '../context/ShipmentContext'
import { cx, initials } from '../lib/format'


export default function Sidebar({ open, onClose }) {
  const { user, roleMeta, logout } = useAuth()
  const { kpis, paused } = useShipments()
  const location = useLocation()

  const badgeFor = (to) => {
    if (to === '/alerts' && kpis.openAlerts) return { text: kpis.openAlerts, tone: kpis.criticalAlerts ? 'crit' : 'warn' }
    if (to === '/shipments' && kpis.activeShipments) return { text: kpis.activeShipments, tone: 'info' }
    if (to === '/devices' && kpis.faulted) return { text: kpis.faulted, tone: 'crit' }
    return null
  }

  return (
    <>
      {/* mobile scrim */}
      <div
        onClick={onClose}
        className={cx(
          'fixed inset-0 z-40 bg-abyss-950/80 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-rim-soft bg-abyss-900/95 backdrop-blur-2xl transition-transform duration-300 ease-out lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* brand */}
        <div className="relative flex items-center gap-3 border-b border-rim-soft px-5 py-[18px]">
          <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-glacier-400 to-glacier-600 shadow-[0_10px_30px_-10px_rgba(34,211,238,0.9)]">
            <Snowflake size={19} className="text-abyss-950 animate-floaty" strokeWidth={2.6} />
            <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25" />
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-extrabold leading-none tracking-tight text-cream">FarmChain</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cream-faint">
              Cold-chain OS
            </p>
          </div>
          <button onClick={onClose} className="btn-icon ml-auto lg:hidden" aria-label="Close menu">
            <X size={16} />
          </button>
        </div>

        {/* nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="label px-3 pb-2">Operations</p>
          <ul className="space-y-1">
            {NAV_ITEMS.filter((i) => i.roles.includes(user?.role)).map((item, idx) => {
              const Icon = item.icon
              const badge = badgeFor(item.to)
              return (
                <li key={item.to} className="animate-slideinright" style={{ animationDelay: `${idx * 40}ms` }}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onClose}
                    className={({ isActive }) => cx('nav-link', isActive && 'nav-link-active')}
                  >
                    <Icon size={17} strokeWidth={2} className="shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {badge && (
                      <span
                        className={cx(
                          'mono min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold',
                          badge.tone === 'crit'
                            ? 'bg-thermal-crit/18 text-thermal-crit animate-pulsedot'
                            : badge.tone === 'warn'
                              ? 'bg-thermal-warm/15 text-thermal-warm'
                              : 'bg-glacier-500/15 text-glacier-300',
                        )}
                      >
                        {badge.text}
                      </span>
                    )}
                  </NavLink>
                </li>
              )
            })}
          </ul>

        </nav>

        {/* user card */}
        <div className="border-t border-rim-soft p-3">
          <div className="flex items-center gap-3 rounded-xl bg-abyss-850/70 p-3">
            <div
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[12px] font-bold text-abyss-950"
              style={{ background: `linear-gradient(135deg, ${roleMeta?.accent}, ${roleMeta?.accent}88)` }}
            >
              {initials(user?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-semibold text-cream">{user?.name}</p>
              <p className="truncate text-[10.5px] text-cream-faint">{user?.org}</p>
            </div>
            <button onClick={logout} title="Sign out" className="btn-icon h-8 w-8">
              <LogOut size={15} />
            </button>
          </div>
          {paused && (
            <p className="mt-2 rounded-lg border border-thermal-warm/35 bg-thermal-warm/10 px-2.5 py-1.5 text-center text-[10.5px] font-semibold text-thermal-warm">
              Stream paused
            </p>
          )}
        </div>
      </aside>
    </>
  )
}
