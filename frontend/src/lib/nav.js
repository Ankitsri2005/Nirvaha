import { Cpu, LayoutDashboard, MapPinned, Truck, PackageSearch, GitBranch, BellRing, ShieldCheck } from 'lucide-react'
import { DEMO_USERS, ROLE_META } from '../data/mockData'

const ALL = ['farmer', 'transporter', 'warehouse', 'admin']

/** Single source of truth for navigation + per-role access. */
export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ALL, end: true },
  { to: '/tracking', label: 'Live Tracking', icon: MapPinned, roles: ALL },
  { to: '/shipments', label: 'Shipments', icon: Truck, roles: ALL },
  { to: '/batches', label: 'Batch Details', icon: PackageSearch, roles: ALL },
  { to: '/traceability', label: 'Traceability', icon: GitBranch, roles: ALL },
  { to: '/alerts', label: 'Alerts', icon: BellRing, roles: ALL },
  { to: '/devices', label: 'Devices', icon: Cpu, roles: ['transporter', 'warehouse', 'admin'] },
  { to: '/verify', label: 'Ledger Verify', icon: ShieldCheck, roles: ['admin'] },
]

export const allowedFor = (role) => NAV_ITEMS.filter((i) => i.roles.includes(role))

export const canAccess = (role, to) => {
  const item = NAV_ITEMS.find((i) => to === i.to || to.startsWith(i.to + '/'))
  return item ? item.roles.includes(role) : true
}

export const STORAGE_KEY = 'farmchain.auth.v1'

export const readStoredAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/** Fake login - any of the four demo accounts, password must be demo1234. */
export const authenticate = (username, password) => {
  const u = DEMO_USERS.find((x) => x.username.toLowerCase() === String(username).trim().toLowerCase())
  if (!u) return { ok: false, error: 'Unknown username. Try one of the demo accounts below.' }
  if (u.password !== password) return { ok: false, error: 'Wrong password. All demo accounts use demo1234.' }
  return { ok: true, user: { ...u, avatarSeed: u.name } }
}

export const roleAccent = (role) => ROLE_META[role]?.accent || '#6F8AA3'

/** The demo identity behind a role, so "switch role" shows a coherent user. */
export const demoUserFor = (role) => DEMO_USERS.find((u) => u.role === role) || null

/** Where a role lands after signing in or switching. */
export const landingFor = (role) => {
  const meta = ROLE_META[role]
  if (!meta) return '/dashboard'
  return NAV_ITEMS.find((i) => i.to === meta.landing && i.roles.includes(role))?.to
    || allowedFor(role)[0]?.to
    || '/dashboard'
}

export { ROLE_META }
