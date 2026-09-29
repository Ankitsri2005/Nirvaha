/**
 * Runtime smoke test for the phase 1 simulation engine.
 * Deliberately avoids the router and Leaflet so it can run headless; the things
 * it exercises are the ones the demo depends on.
 *
 *   npm run test:smoke
 */
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
})
globalThis.window = dom.window
globalThis.document = dom.window.document
// node 22 exposes a getter-only global navigator, so it has to be redefined
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
  writable: true,
})
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const React = (await import('react')).default
const { createRoot } = await import('react-dom/client')
const act = React.act || (await import('react-dom/test-utils')).act
const { ShipmentProvider, useShipments } = await import('../src/context/ShipmentContext.jsx')

const ctx = { current: null }

function Harness() {
  ctx.current = useShipments()
  return null
}

const results = []
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  -> ${detail}` : ''}`)
}

const root = createRoot(document.getElementById('root'))
await act(async () => {
  root.render(React.createElement(ShipmentProvider, null, React.createElement(Harness)))
})

const S = () => ctx.current
const step = async (n = 1) => {
  for (let i = 0; i < n; i++) await act(async () => { S().actions.tick({ force: true }) })
}

/* 1. seeded world */
check('batches seeded', S().batches.length === 4, `${S().batches.length}`)
check('shipments seeded', S().shipments.length === 4, `${S().shipments.length}`)
check('devices seeded', S().devices.length === 5, `${S().devices.length}`)
check(
  'every device has chart history',
  S().devices.filter((d) => d.status !== 'maintenance').every((d) => (S().historyByDevice[d.id] || []).length > 0),
  S().devices.map((d) => `${d.id}:${(S().historyByDevice[d.id] || []).length}`).join(' '),
)
check('compliance starts at 100%', S().kpis.compliance === 100, `${S().kpis.compliance}%`)

/* 2. the headline demo: click "simulate temperature rise" */
const target = S().shipments.find((x) => x.status === 'in_transit' || x.status !== 'delivered')
const deviceId = S().devices.find((d) => d.shipmentId === target.id)?.id
const tempAlertBefore = S().alerts.filter((a) => a.type === 'temperature_breach').length

// exactly what SimulatorPanel does when a device is picked
await act(async () => { S().actions.simulateTemperatureRise(deviceId) })
const tempAlertAfter = S().alerts.filter((a) => a.type === 'temperature_breach').length
check('temperature alert raised on click', tempAlertAfter > tempAlertBefore, `${tempAlertBefore} -> ${tempAlertAfter}`)

const breached = S().shipments.find((x) => x.id === target.id)
check('shipment flips to breach in the same click', breached.status === 'breach', breached.status)

const toast = S().toasts.find((t) => t.alert.type === 'temperature_breach')
check('toast emitted', Boolean(toast), toast?.alert.title)

/* the alert must not spam on every cycle */
const atRaise = S().alerts.length
await step(3)
const dupes = S().alerts.filter((a) => a.type === 'temperature_breach' && a.occurrences > 1)
check('repeated breaches increment, not duplicate', S().alerts.length === atRaise && dupes.length > 0,
  `alerts ${atRaise} -> ${S().alerts.length}, occurrences ${dupes.map((a) => a.occurrences).join(',')}`)

/* 3. recovery */
await act(async () => { S().actions.clearTemperatureRise(deviceId) })
await step(4)
const recovered = S().shipments.find((x) => x.id === target.id)
const resolved = S().alerts.filter((a) => a.type === 'temperature_breach' && a.resolved)
check('breach auto-resolves when back in band', recovered.status !== 'breach' && resolved.length > 0,
  `status ${recovered.status}, resolved ${resolved.length}`)

/* 3b. the "auto" target and a shipment id must both work, not silently no-op */
const autoCount = S().alerts.length
await act(async () => { S().actions.simulateTemperatureRise() })
const autoRaised = S().alerts.some(
  (a) => a.type === 'temperature_breach' && !a.resolved,
)
check('auto target raises a breach', autoRaised && S().alerts.length > autoCount,
  `${autoCount} -> ${S().alerts.length}`)
await act(async () => { S().actions.clearTemperatureRise() })
await step(4)

await act(async () => { S().actions.simulateTemperatureRise(target.id) })
const byShipment = S().alerts.some((a) => a.type === 'temperature_breach' && !a.resolved)
check('shipment id is accepted as a target', byShipment, 'SHP id resolved to its device')
await act(async () => { S().actions.clearTemperatureRise(target.id) })
await step(4)

/* 4. offline buffering and the duplicate-rejecting sync */
const dev = S().devices.find((d) => d.shipmentId === target.id)
await act(async () => { S().actions.goOffline(dev.id) })
await step(4)
const offlineDev = S().devices.find((d) => d.id === dev.id)
check('device goes offline', offlineDev.status === 'offline', offlineDev.status)
check('readings buffer to sd', (offlineDev.bufferedReadings || 0) >= 4, `${offlineDev.bufferedReadings} rows`)

const rowsBefore = S().readings.length
await act(async () => { S().actions.goOnline(dev.id) })
const onlineDev = S().devices.find((d) => d.id === dev.id)
const sync = S().syncEvents[0]
check('device reconnects', onlineDev.status === 'online', onlineDev.status)
check('buffer flushed on reconnect', S().readings.length > rowsBefore, `${rowsBefore} -> ${S().readings.length}`)
check('buffer emptied', (onlineDev.bufferedReadings || 0) === 0, `${onlineDev.bufferedReadings}`)
check('sync event recorded with dupe count', Boolean(sync) && sync.deviceId === dev.id,
  sync ? `${sync.rows} rows, ${sync.duplicates} dupes` : 'missing')

/* 5. sensor failure freezes readings but keeps the last valid value */
const readingsForDev = () => (S().historyByDevice[dev.id] || []).length
const t0 = readingsForDev()
const lastTempBefore = S().latestByDevice[dev.id]?.temperature
await act(async () => { S().actions.simulateSensorFailure(dev.id) })
await step(4)
const faulted = S().devices.find((d) => d.id === dev.id)
check('device reports fault', faulted.status === 'fault', faulted.status)
check('no new readings while faulted', readingsForDev() === t0, `${t0} -> ${readingsForDev()}`)
check('last valid reading still available', S().latestByDevice[dev.id]?.temperature === lastTempBefore,
  `${lastTempBefore} vs ${S().latestByDevice[dev.id]?.temperature}`)

await act(async () => { S().actions.recoverDevice(dev.id) })
await step(2)
check('device recovers', S().devices.find((d) => d.id === dev.id).status === 'online')

/* 6. tamper */
await act(async () => { S().actions.simulateTamper(dev.id) })
const tampered = S().alerts.find((a) => a.type === 'tamper' && !a.resolved)
check('tamper alert raised', Boolean(tampered), tampered?.title)
check('binary sensor reads open', S().latestByDevice[dev.id]?.door === 1 || S().latestByDevice[dev.id]?.tamper === 1,
  JSON.stringify(S().latestByDevice[dev.id] || {}).slice(0, 90))

/* 7. history survives a long run for every device (the ring-buffer bug) */
await step(40)
const starved = S().devices.filter((d) => d.status === 'online' && (S().historyByDevice[d.id] || []).length < 10)
check('no device loses its chart history over 40 cycles', starved.length === 0,
  S().devices.map((d) => `${d.id}:${(S().historyByDevice[d.id] || []).length}`).join(' '))

/* 8. truck actually moves */
const p0 = S().shipments.find((x) => x.speed > 0)?.progress ?? 0
await step(5)
const p1 = S().shipments.find((x) => x.speed > 0)?.progress ?? 0
check('trucks advance along the route', p1 > p0, `${p0.toFixed(4)} -> ${p1.toFixed(4)}`)
check('gps track grows', S().gps.length > 0, `${S().gps.length} fixes`)

/* 9. reset */
await act(async () => { S().reset() })
check('reset restores the seed', S().kpis.compliance === 100 && S().toasts.length === 0,
  `compliance ${S().kpis.compliance}, toasts ${S().toasts.length}`)

await act(async () => { root.unmount() })

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
