/**
 * Semantic colour tokens shared by Tailwind classes, Recharts and inline SVG.
 * The Tailwind config in tailwind.config.js is the single source of truth; this
 * map exists because JS needs the hex values.
 */
export const C = {
  bg: '#080D14',
  panel: '#0B131C',
  rim: '#1D3243',
  rimBright: '#2A4A63',

  glacier: '#22D3EE',
  glacierDim: '#0891B2',

  frost: '#60A5FA',
  safe: '#3DDC97',
  warm: '#FFC24B',
  hot: '#FF7A45',
  crit: '#FF5C7A',
  orbit: '#A78BFF',

  cream: '#E8F2F8',
  dim: '#A7BCD0',
  faint: '#6F8AA3',
}

/** severity -> visual token */
export const SEVERITY = {
  critical: { color: C.crit, ring: 'border-thermal-crit/45', bg: 'bg-thermal-crit/12', text: 'text-thermal-crit', label: 'Critical' },
  warning: { color: C.warm, ring: 'border-thermal-warm/45', bg: 'bg-thermal-warm/12', text: 'text-thermal-warm', label: 'Warning' },
  info: { color: C.glacier, ring: 'border-glacier-500/40', bg: 'bg-glacier-500/10', text: 'text-glacier-300', label: 'Info' },
  resolved: { color: C.safe, ring: 'border-thermal-safe/40', bg: 'bg-thermal-safe/10', text: 'text-thermal-safe', label: 'Resolved' },
}

/** device status -> visual token */
export const DEVICE_STATUS = {
  online: { color: C.safe, label: 'Online', dot: 'bg-thermal-safe' },
  offline: { color: C.faint, label: 'Offline', dot: 'bg-cream-faint' },
  fault: { color: C.crit, label: 'Sensor fault', dot: 'bg-thermal-crit' },
  syncing: { color: C.orbit, label: 'Syncing', dot: 'bg-orbit-400' },
  maintenance: { color: C.warm, label: 'Maintenance', dot: 'bg-thermal-warm' },
}

/** shipment status -> visual token */
export const SHIPMENT_STATUS = {
  in_transit: { color: C.glacier, label: 'In transit' },
  at_checkpoint: { color: C.orbit, label: 'At checkpoint' },
  delayed: { color: C.warm, label: 'Delayed' },
  breach: { color: C.crit, label: 'Cold-chain breach' },
  delivered: { color: C.safe, label: 'Delivered' },
  pending: { color: C.faint, label: 'Pending' },
}

/** spoilage risk band -> visual token */
export const RISK = {
  Low: { color: C.safe, label: 'Low', pct: 12 },
  Medium: { color: C.warm, label: 'Medium', pct: 48 },
  High: { color: C.crit, label: 'High', pct: 81 },
}

/** thermal colour for a temperature in celsius, mapped onto the ramp */
export const thermalColor = (t) => {
  if (t < 2) return C.frost
  if (t < 5) return C.glacier
  if (t < 8) return C.safe
  if (t < 12) return C.warm
  if (t < 18) return C.hot
  return C.crit
}

export const statusChip = (map, key) => map[key] || { color: C.faint, label: key || 'unknown' }
