import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Bell, ChevronDown, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useShipments } from '../context/ShipmentContext'
import { landingFor, ROLE_META } from '../lib/nav'
import { cx, fmtClock12, initials } from '../lib/format'

const TITLES = {
  '/dashboard': ['Cold-chain overview', 'Live fleet condition, compliance and open exceptions'],
  '/tracking': ['Live tracking', 'GPS route, vehicle position and custody handovers'],
  '/shipments': ['Shipments', 'Every consignment, its batch and its condition'],
  '/batches': ['Batch details', 'Harvest data, thresholds and per-reading history'],
  '/traceability': ['Traceability', 'Hash-linked chain of custody, farm to delivery'],
  '/alerts': ['Alert console', 'Threshold breaches, device faults and model warnings'],
  '/devices': ['Device fleet', 'Node health, firmware, battery and SD buffering'],
  '/verify': ['Ledger verification', 'Recompute hashes and compare against the chain'],
}

export default function Navbar({ onMenu }) {
  const { user, roleMeta, logout, switchRole } = useAuth()
  const { kpis, paused } = useShipments()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [clock, setClock] = useState(new Date())
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const close = () => setMenu(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [])

  const base = '/' + (pathname.split('/')[1] || 'dashboard')
  const [title, subtitle] = TITLES[base] || TITLES['/dashboard']

  return (
    <header className="sticky top-0 z-30 border-b border-rim-soft bg-abyss-900/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-3 lg:px-7">
        <button onClick={onMenu} className="btn-icon lg:hidden" aria-label="Open menu">
          <Menu size={17} />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-bold leading-tight tracking-tight text-cream">{title}</h1>
          <p className="hidden truncate text-[11.5px] text-cream-faint sm:block">{subtitle}</p>
        </div>

        {/* live clock + stream state */}
        <div className="hidden items-center gap-3 rounded-xl border border-rim-soft bg-abyss-850/60 px-3 py-1.5 md:flex">
          <span className="relative flex h-2 w-2">
            {paused ? (
              <span className="h-2 w-2 rounded-full bg-thermal-warm" />
            ) : (
              <>
                <span className="absolute inline-flex h-full w-full rounded-full bg-thermal-safe opacity-70 animate-pulsering" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-thermal-safe animate-pulsedot" />
              </>
            )}
          </span>
          <span className="mono text-[12.5px] font-semibold text-cream-dim">{fmtClock12(clock)}</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cream-faint">
            {paused ? 'Paused' : 'Live'}
          </span>
        </div>

        {/* alerts */}
        <Link
          to="/alerts"
          className="btn-icon relative"
          title={`${kpis.openAlerts} open alerts`}
          style={kpis.criticalAlerts ? { borderColor: 'rgba(255,92,122,0.5)', color: '#FF5C7A' } : undefined}
        >
          <Bell size={16} />
          {kpis.unread > 0 && (
            <span className="mono absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-thermal-crit px-1 text-[9.5px] font-bold text-abyss-950 animate-popin">
              {kpis.unread > 9 ? '9+' : kpis.unread}
            </span>
          )}
        </Link>

        {/* user menu */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenu((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-rim-soft bg-abyss-850/60 py-1.5 pl-1.5 pr-2.5 transition-colors hover:border-rim-bright"
          >
            <span
              className="grid h-7 w-7 place-items-center rounded-lg text-[10.5px] font-bold text-abyss-950"
              style={{ background: `linear-gradient(135deg, ${roleMeta?.accent}, ${roleMeta?.accent}88)` }}
            >
              {initials(user?.name)}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-[11.5px] font-semibold text-cream">{user?.name?.split(' ')[0]}</span>
              <span className="block text-[9.5px] font-semibold uppercase tracking-wider" style={{ color: roleMeta?.accent }}>
                {roleMeta?.label}
              </span>
            </span>
            <ChevronDown size={14} className={cx('text-cream-faint transition-transform duration-200', menu && 'rotate-180')} />
          </button>

          {menu && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 origin-top-right animate-popin rounded-xl border border-rim bg-abyss-850 p-1.5 shadow-panel">
              <div className="rounded-lg bg-abyss-900 p-3">
                <p className="text-[12.5px] font-semibold text-cream">{user?.name}</p>
                <p className="mt-0.5 text-[10.5px] text-cream-faint">{user?.org}</p>
                <span
                  className="chip mt-2"
                  style={{
                    borderColor: `${roleMeta?.accent}55`,
                    background: `${roleMeta?.accent}18`,
                    color: roleMeta?.accent,
                  }}
                >
                  <ShieldCheck size={11} /> {roleMeta?.label} access
                </span>
              </div>
              <p className="label px-2 pb-1 pt-2.5">Switch role (demo)</p>
              {Object.entries(ROLE_META).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => {
                    setMenu(false)
                    switchRole(key)
                    navigate(landingFor(key))
                  }}
                  className={cx(
                    'flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[12px] transition-colors hover:bg-abyss-800',
                    user?.role === key ? 'text-cream' : 'text-cream-faint',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.accent }} />
                    {meta.label}
                  </span>
                  {user?.role === key && <span className="text-[9.5px] uppercase tracking-wider">current</span>}
                </button>
              ))}
              <div className="divider my-1.5" />
              <button
                onClick={() => {
                  setMenu(false)
                  logout()
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-[12px] font-semibold text-thermal-crit transition-colors hover:bg-thermal-crit/10"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
