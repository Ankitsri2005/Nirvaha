// Small shared helpers. Kept dependency-free on purpose.

export const pad = (n) => String(n).padStart(2, '0')

export const fmtTime = (d) => {
  const t = d instanceof Date ? d : new Date(d)
  return `${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`
}

export const fmtClock12 = (d) => {
  const t = d instanceof Date ? d : new Date(d)
  let h = t.getHours()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${pad(t.getMinutes())}:${pad(t.getSeconds())} ${ampm}`
}

export const fmtDate = (d) => {
  const t = d instanceof Date ? d : new Date(d)
  return `${pad(t.getDate())} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][t.getMonth()]} ${t.getFullYear()}`
}

export const fmtDateTime = (d) => `${fmtDate(d)}, ${fmtTime(d)}`

export const fmtAgo = (iso) => {
  const secs = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (secs < 5) return 'just now'
  if (secs < 60) return `${secs}s ago`
  const m = Math.floor(secs / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export const fmtDuration = (secs) => {
  const s = Math.max(0, Math.floor(secs))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m ${s % 60}s`
}

export const round = (n, dp = 1) => {
  const f = 10 ** dp
  return Math.round(n * f) / f
}

export const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n))

export const lerp = (a, b, t) => a + (b - a) * t

export const shortId = (s, n = 6) => (s ? String(s).slice(-n).toUpperCase() : '----')

/** Interpolate a point along a [lat, lng] path at 0..1 progress. */
export const pointAt = (path, t) => {
  if (!path || path.length === 0) return [0, 0]
  if (path.length === 1) return path[0]
  const segs = path.length - 1
  const pos = clamp(t, 0, 1) * segs
  const i = Math.min(segs - 1, Math.floor(pos))
  const f = pos - i
  return [lerp(path[i][0], path[i + 1][0], f), lerp(path[i][1], path[i + 1][1], f)]
}

/** Bearing in degrees from a -> b. */
export const bearing = (a, b) => {
  const toRad = (x) => (x * Math.PI) / 180
  const y = Math.sin(toRad(b[1] - a[1])) * Math.cos(toRad(b[0]))
  const x =
    Math.cos(toRad(a[0])) * Math.sin(toRad(b[0])) - Math.sin(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.cos(toRad(b[1] - a[1]))
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

/** Great-circle distance in km (haversine). */
export const haversineKm = (a, b) => {
  const R = 6371
  const dLat = ((b[0] - a[0]) * Math.PI) / 180
  const dLng = ((b[1] - a[1]) * Math.PI) / 180
  const la1 = (a[0] * Math.PI) / 180
  const la2 = (b[0] * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export const cumulativeKm = (path) => {
  let total = 0
  const marks = [0]
  for (let i = 1; i < path.length; i++) {
    total += haversineKm(path[i - 1], path[i])
    marks.push(total)
  }
  return { marks, total }
}

export const cx = (...parts) => parts.filter(Boolean).join(' ')

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

/** Deterministic PRNG so the demo looks the same on every reload. */
export const mulberry32 = (seed) => {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
