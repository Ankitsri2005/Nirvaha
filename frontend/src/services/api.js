/**
 * api.js - the seam between the mock engine and the real backend.
 *
 * Phase 1 only ever reads from ShipmentContext. Phase 4 fills these in and the
 * provider switches to `dataSource = 'live'`; every page above keeps working
 * because nothing imports fetch directly.
 */

// `import.meta.env` only exists under Vite; the optional chain keeps this module
// importable from plain Node (the smoke tests load it) as well as the app.
const ENV = import.meta.env || {}
const BASE = ENV.VITE_API_URL || '/api'
export const USE_MOCK = ENV.VITE_USE_MOCK !== 'false'

const request = async (path, { method = 'GET', body, token, signal } = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    signal,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail?.detail || `${res.status} ${res.statusText}`)
  }
  return res.status === 204 ? null : res.json()
}

const qs = (params) => {
  const s = new URLSearchParams(
    Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ).toString()
  return s ? `?${s}` : ''
}

export const api = {
  /* ---------------- auth ---------------- */
  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } }),
  me: (token) => request('/auth/me', { token }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),

  /* ---------------- batches ---------------- */
  listBatches: (params, token) => request(`/batches${qs(params)}`, { token }),
  getBatch: (id, token) => request(`/batches/${id}`, { token }),
  createBatch: (payload, token) => request('/batches', { method: 'POST', body: payload, token }),
  checkpoints: (batchId, token) => request(`/batches/${batchId}/checkpoints`, { token }),

  /* ---------------- shipments ---------------- */
  listShipments: (params, token) => request(`/shipments${qs(params)}`, { token }),
  getShipment: (id, token) => request(`/shipments/${id}`, { token }),
  createShipment: (payload, token) => request('/shipments', { method: 'POST', body: payload, token }),

  /* ---------------- devices + sensors ---------------- */
  listDevices: (token) => request('/devices', { token }),
  getDevice: (id, token) => request(`/devices/${id}`, { token }),
  registerDevice: (payload, token) => request('/devices', { method: 'POST', body: payload, token }),
  postReading: (payload, token) => request('/sensors/readings', { method: 'POST', body: payload, token }),
  latestReading: (deviceId, token) => request(`/sensors/readings/latest?device_id=${deviceId}`, { token }),
  readingHistory: (deviceId, params, token) =>
    request(`/sensors/readings${qs({ device_id: deviceId, ...params })}`, { token }),

  /* ---------------- gps ---------------- */
  gpsTrack: (shipmentId, token) => request(`/gps/track/${shipmentId}`, { token }),
  postGps: (payload, token) => request('/gps', { method: 'POST', body: payload, token }),

  /* ---------------- alerts ---------------- */
  listAlerts: (params, token) => request(`/alerts${qs(params)}`, { token }),
  ackAlert: (id, token) => request(`/alerts/${id}/acknowledge`, { method: 'POST', token }),
  resolveAlert: (id, token) => request(`/alerts/${id}/resolve`, { method: 'POST', token }),

  /* ---------------- offline sync (phase 4) ---------------- */
  uploadLog: (rows, token) => request('/sync/logs', { method: 'POST', body: { rows }, token }),

  /* ---------------- blockchain (phase 6) ---------------- */
  verifyChain: (batchId, token) => request(`/blockchain/verify/${batchId}`, { token }),
  anchor: (batchId, token) => request(`/blockchain/anchor/${batchId}`, { method: 'POST', token }),
}

/** Live telemetry socket, used instead of polling when available. */
export const telemetrySocket = (token) => {
  const url = new URL(BASE, window.location.origin)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.pathname = `${url.pathname.replace(/\/$/, '')}/ws/telemetry`
  if (token) url.searchParams.set('token', token)
  return new WebSocket(url.toString())
}
