import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  ALERT_RULES,
  HISTORY_POINTS,
  INITIAL_ALERTS,
  INITIAL_BATCHES,
  INITIAL_CHECKPOINTS,
  INITIAL_DEVICES,
  INITIAL_SHIPMENTS,
  MAX_ALERTS,
  MAX_GPS,
  MAX_READINGS,
  SPEED_KMH,
  TICK_MS,
  makeSeedReadings,
  nextAlertId,
  nextCheckpointId,
  nextReadingId,
} from '../data/mockData'
import { bearing, clamp, cumulativeKm, mulberry32, pointAt, round } from '../lib/format'

/**
 * ShipmentContext owns the whole live world: a 2 s loop moves the trucks, samples
 * every device, evaluates thresholds, raises de-duplicated alerts and appends
 * custody checkpoints. Phase 4 swaps the loop for REST/WebSocket reads without
 * touching anything downstream of this provider.
 */

const PROGRESS_PER_TICK = 0.004 // ~7x real time, so a route completes in ~8 min
const TOAST_TTL = 6500
const FAULT_AFTER_SECONDS = 6
const TEMP_HOLD_TICKS = 22
const RISK_ALERT_AT = 0.66

const ShipmentCtx = createContext(null)

const initialState = () => {
  const batches = INITIAL_BATCHES.map((b) => ({ ...b }))
  const shipments = INITIAL_SHIPMENTS.map((s) => {
    const { total } = cumulativeKm(s.path)
    const pos = pointAt(s.path, s.progress)
    return {
      ...s,
      position: pos,
      heading: bearing(pointAt(s.path, Math.max(0, s.progress - 0.012)), pos),
      distanceKm: round(total, 1),
      distanceTravelledKm: round(total * s.progress, 1),
      lastFixAt: new Date().toISOString(),
    }
  })
  return {
    batches,
    devices: INITIAL_DEVICES.map((d) => ({ ...d })),
    shipments,
    alerts: [...INITIAL_ALERTS],
    checkpoints: [...INITIAL_CHECKPOINTS],
    readings: makeSeedReadings(INITIAL_DEVICES, batches),
    gps: [],
    syncEvents: [],
    paused: false,
    tick: 0,
    lastTickAt: new Date().toISOString(),
    speedScale: 1,
  }
}

const newSim = () => ({
  tempBias: {},
  tempTarget: {},
  tempHold: {},
  spoilage: {},
  faulted: new Set(),
  offline: new Set(),
  tamperUntil: {},
  buffer: {},
  alertKeys: {},
  batteryWarned: new Set(),
  signalCycles: {},
  nextWp: {},
  rng: mulberry32(9001),
})

export function ShipmentProvider({ children }) {
  const [state, setState] = useState(initialState)
  const [toasts, setToasts] = useState([])
  const [selectedShipmentId, setSelectedShipmentId] = useState('SHP-2041')
  const [selectedBatchId, setSelectedBatchId] = useState('FB-2026-0A41')

  const stateRef = useRef(state)
  const sim = useRef(newSim())
  const toastsRef = useRef([])

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const commit = useCallback((next) => {
    stateRef.current = next
    setState(next)
  }, [])

  const emitToast = useCallback((alert) => {
    if (!alert) return
    toastsRef.current = [{ id: alert.id, at: Date.now(), alert }, ...toastsRef.current].slice(0, 4)
    setToasts([...toastsRef.current])
  }, [])

  /* ---------------------------------------------------------------- *
   * alert book-keeping: one alert per (device, rule), counted while active
   * ---------------------------------------------------------------- */
  const raise = useCallback((s, key, type, p) => {
    const shape = (ALERT_RULES[type] || (() => ({ severity: 'info', title: type })))(p.value, p.threshold)
    const existingId = sim.current.alertKeys[key]

    if (existingId) {
      const idx = s.alerts.findIndex((a) => a.id === existingId)
      if (idx >= 0) {
        const alerts = [...s.alerts]
        alerts[idx] = {
          ...alerts[idx],
          value: p.value,
          message: p.message || alerts[idx].message,
          timestamp: new Date().toISOString(),
          occurrences: alerts[idx].occurrences + 1,
        }
        s.alerts = alerts
      }
      return null
    }

    const alert = {
      id: nextAlertId(),
      type,
      severity: shape.severity,
      title: shape.title,
      message: p.message || '',
      deviceId: p.deviceId || null,
      batchId: p.batchId || null,
      shipmentId: p.shipmentId || null,
      location: p.location || null,
      value: p.value ?? null,
      threshold: p.threshold ?? null,
      unit: p.unit || '',
      timestamp: new Date().toISOString(),
      acknowledged: false,
      resolved: false,
      occurrences: 1,
    }
    s.alerts = [alert, ...s.alerts].slice(0, MAX_ALERTS)
    sim.current.alertKeys[key] = alert.id
    return alert
  }, [])

  const clear = useCallback((s, key) => {
    const id = sim.current.alertKeys[key]
    if (!id) return
    const idx = s.alerts.findIndex((a) => a.id === id)
    if (idx >= 0 && !s.alerts[idx].resolved) {
      const alerts = [...s.alerts]
      alerts[idx] = { ...alerts[idx], resolved: true, resolvedAt: new Date().toISOString() }
      s.alerts = alerts
    }
    delete sim.current.alertKeys[key]
  }, [])

  /* ---------------------------------------------------------------- *
   * the loop
   * ---------------------------------------------------------------- */
  const tick = useCallback((opts) => {
    const s = { ...stateRef.current }
    // `paused` freezes the ambient stream, but an explicit simulator action or the
    // navbar's "force one cycle" button must still land.
    if (s.paused && !opts?.force) return

    const S = sim.current
    const rnd = S.rng
    const tNow = Date.now()
    const nowIso = new Date(tNow).toISOString()

    s.tick += 1
    s.lastTickAt = nowIso

    const batchById = Object.fromEntries(s.batches.map((b) => [b.id, b]))
    const devices = s.devices.map((d) => ({ ...d }))
    const shipments = s.shipments.map((x) => ({ ...x }))
    const readings = [...s.readings]
    const gps = [...s.gps]
    const checkpoints = [...s.checkpoints]
    const syncEvents = [...s.syncEvents]
    const fresh = []

    /* ---------------- 1. move the trucks ---------------- */
    for (const sh of shipments) {
      const tempKey = `temp:${devices.find((d) => d.shipmentId === sh.id)?.id}`
      const alertId = S.alertKeys[tempKey]
      const breached = Boolean(alertId && s.alerts.find((a) => a.id === alertId && !a.resolved))

      if (sh.speed > 0) {
        const slowed = breached ? 0.45 : 1
        sh.progress = clamp(
          sh.progress + PROGRESS_PER_TICK * s.speedScale * slowed * (sh.speed / SPEED_KMH + 0.4),
          0,
          1,
        )
        if (breached) sh.status = 'breach'
        else if (sh.status === 'breach') sh.status = 'in_transit'
      }

      const pos = pointAt(sh.path, sh.progress)
      sh.position = pos
      sh.heading = Math.round(bearing(pointAt(sh.path, Math.max(0, sh.progress - 0.012)), pos))
      sh.distanceTravelledKm = round((sh.distanceKm || 0) * sh.progress, 1)
      sh.lastFixAt = nowIso

      if (sh.speed > 0) {
        sh.eta = new Date(tNow + ((1 - sh.progress) * (sh.distanceKm || 1) * 3600) / sh.speed).toISOString()
        gps.push({
          id: `G-${gps.length + 1}`,
          shipmentId: sh.id,
          batchId: sh.batchId,
          lat: round(pos[0], 6),
          lng: round(pos[1], 6),
          speed: sh.speed,
          heading: sh.heading,
          timestamp: nowIso,
        })
      }

      /* custody checkpoint on crossing a waypoint */
      const wpCount = sh.waypoints?.length || 0
      if (wpCount > 1 && sh.status !== 'delivered') {
        let idx = S.nextWp[sh.id] ?? Math.max(1, Math.ceil(sh.progress * (wpCount - 1)))
        while (idx < wpCount - 1 && sh.progress >= idx / (wpCount - 1)) {
          const wp = sh.waypoints[idx]
          const primary = devices.find((d) => d.shipmentId === sh.id && d.status === 'online')
          const last = primary ? [...readings].reverse().find((r) => r.deviceId === primary.id) : null
          const type = CHECKPOINT_TYPE[wp.key] || 'Checkpoint'
          checkpoints.push({
            id: nextCheckpointId(),
            batchId: sh.batchId,
            shipmentId: sh.id,
            type,
            location: `${wp.label}, ${wp.place}`,
            actor: sh.transporter,
            handler: CHECKPOINT_HANDLERS[type] || sh.driver,
            timestamp: nowIso,
            temperature: last?.temperature ?? null,
            humidity: last?.humidity ?? null,
            notes: `Auto-logged on arrival at ${wp.label}. Custody handover signed by ${sh.driver}.`,
            geo: wp.ll,
            status: 'complete',
            onChain: true,
            auto: true,
          })
          fresh.push(
            raise(s, `cp:${sh.id}:${idx}`, 'checkpoint', {
              value: last?.temperature ?? null,
              threshold: batchById[sh.batchId]?.maxTemp ?? null,
              unit: '\u00b0C',
              message: `Custody checkpoint "${type}" recorded at ${wp.label}. Ledger entry created for ${sh.batchId}.`,
              deviceId: primary?.id,
              batchId: sh.batchId,
              shipmentId: sh.id,
              location: `${wp.label}, ${wp.place}`,
            }),
          )
          idx += 1
        }
        S.nextWp[sh.id] = idx
      }

      if (sh.progress >= 1 && sh.status !== 'delivered') {
        sh.status = 'delivered'
        sh.speed = 0
        sh.arrivedAt = nowIso
        fresh.push(
          raise(s, `delivered:${sh.id}`, 'delivered', {
            value: null,
            threshold: null,
            message: `${sh.id} delivered to ${sh.destination}. Cold chain closed, ${sh.distanceTravelledKm} km travelled.`,
            batchId: sh.batchId,
            shipmentId: sh.id,
            location: sh.destination,
          }),
        )
      }
    }

    /* ---------------- 2. sample the devices ---------------- */
    for (const d of devices) {
      const batch = batchById[d.batchId]
      if (!batch) continue

      const isFaulted = S.faulted.has(d.id)
      const isOffline = S.offline.has(d.id)

      /* housekeeping: battery + radio, unaffected by sensor faults */
      d.battery = round(Math.max(1, d.battery - 0.04), 1)
      d.batteryStatus = d.battery < 20 ? 'critical' : d.battery < 45 ? 'low' : 'good'
      d.signal = Math.round(clamp(d.signal + (rnd() - 0.5) * 5, -99, -42))

      if (!isFaulted) d.lastSeen = nowIso
      d.ageSeconds = Math.round((tNow - new Date(d.lastSeen).getTime()) / 1000)

      d.status = isOffline ? 'offline' : isFaulted ? 'fault' : 'online'
      d.network = isOffline ? 'offline' : 'online'

      if (d.battery < 20 && !S.batteryWarned.has(d.id)) {
        S.batteryWarned.add(d.id)
        fresh.push(
          raise(s, `batt:${d.id}`, 'battery_low', {
            value: Math.round(d.battery),
            threshold: 20,
            unit: '%',
            message: `${d.id} battery at ${Math.round(d.battery)}%. About ${Math.round(d.battery * 0.35)} h of runtime left at the current sample rate.`,
            deviceId: d.id,
            batchId: d.batchId,
            shipmentId: d.shipmentId,
            location: d.location,
          }),
        )
      }

      if (d.status === 'online' && d.signal < -85) {
        S.signalCycles[d.id] = (S.signalCycles[d.id] || 0) + 1
        if (S.signalCycles[d.id] === 6) {
          fresh.push(
            raise(s, `sig:${d.id}`, 'signal_weak', {
              value: d.signal,
              threshold: -85,
              unit: 'dBm',
              message: `${d.id} RSSI ${d.signal} dBm for 6 cycles. Readings are buffering to microSD.`,
              deviceId: d.id,
              batchId: d.batchId,
              shipmentId: d.shipmentId,
              location: d.location,
            }),
          )
        }
      } else if (d.signal >= -80) {
        S.signalCycles[d.id] = 0
      }

      /* offline: hardware keeps sampling, the backend simply never sees it */
      if (isOffline) {
        S.buffer[d.id] = S.buffer[d.id] || []
        if (S.buffer[d.id].length < 300) S.buffer[d.id].push(sample(batch, d, S, rnd, tNow))
        d.bufferedReadings = S.buffer[d.id].length
        d.lastValidAt = d.lastValidAt || d.lastSeen
        continue
      }

      /* faulted: no sensor data. The UI must fall back to the last valid reading */
      if (isFaulted) {
        continue
      }

      const reading = sample(batch, d, S, rnd, tNow)
      readings.push(reading)
      d.lastReadingAt = reading.timestamp
      d.lastValidAt = reading.timestamp
      d.ageSeconds = 0

      /* flush the SD buffer if it was offline a moment ago */
      const buffered = S.buffer[d.id]
      if (buffered?.length) {
        const dupes = buffered.length - new Set(buffered.map((r) => r.timestamp)).size
        readings.push(...buffered)
        S.buffer[d.id] = []
        d.bufferedReadings = 0
        syncEvents.unshift({
          id: `SYNC-${syncEvents.length + 1}`,
          deviceId: d.id,
          shipmentId: d.shipmentId,
          batchId: d.batchId,
          at: nowIso,
          rows: buffered.length,
          duplicates: dupes,
          ms: 40 + Math.round(rnd() * 120),
          status: 'complete',
        })
        fresh.push(
          raise(s, `on:${d.id}`, 'device_online', {
            value: buffered.length,
            threshold: null,
            unit: 'rows',
            message: `${d.id} reconnected. ${buffered.length} buffered readings uploaded, ${dupes} duplicate rows rejected.`,
            deviceId: d.id,
            batchId: d.batchId,
            shipmentId: d.shipmentId,
            location: d.location,
          }),
        )
        clear(s, `offline:${d.id}`)
      }

      evaluate(s, batch, d, reading, fresh, raise, clear)
    }

    /* ---------------- 3. commit ---------------- */
    s.devices = devices
    s.checkpoints = [...checkpoints].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    s.syncEvents = syncEvents.slice(0, 20)
    s.readings = readings.slice(-MAX_READINGS)
    s.gps = gps.slice(-MAX_GPS)

    /* 3b. reconcile shipment status against alerts raised *this* tick, so a
           demo click flips the card and the map without waiting for the next cycle */
    for (const sh of shipments) {
      if (sh.speed <= 0 || sh.status === 'delivered') continue
      const deviceId = devices.find((d) => d.shipmentId === sh.id)?.id
      const alertId = deviceId ? S.alertKeys[`temp:${deviceId}`] : null
      const breached = Boolean(alertId && s.alerts.find((a) => a.id === alertId && !a.resolved))
      if (breached) sh.status = 'breach'
      else if (sh.status === 'breach') sh.status = 'in_transit'
    }
    s.shipments = shipments

    commit(s)

    fresh.forEach(emitToast)
  }, [commit, raise, clear, emitToast])

  /* the loop */
  useEffect(() => {
    const id = setInterval(tick, TICK_MS)
    return () => clearInterval(id)
  }, [tick])

  /* toast expiry */
  useEffect(() => {
    const id = setInterval(() => {
      const cutoff = Date.now() - TOAST_TTL
      const kept = toastsRef.current.filter((t) => t.at >= cutoff)
      if (kept.length !== toastsRef.current.length) {
        toastsRef.current = kept
        setToasts([...kept])
      }
    }, 700)
    return () => clearInterval(id)
  }, [])

  const dismissToast = useCallback((id) => {
    toastsRef.current = toastsRef.current.filter((t) => t.id !== id)
    setToasts([...toastsRef.current])
  }, [])

  /* ---------------------------------------------------------------- *
   * simulator controls
   * ---------------------------------------------------------------- */
  /**
   * Accepts a device id, a shipment id, 'all'/undefined, or anything unrecognised
   * and always resolves to a real device. Callers pass device ids today, but
   * silently doing nothing when handed a shipment id is a bad failure mode for the
   * one button the whole demo hangs on.
   */
  const resolveTarget = useCallback((ref) => {
    const s = stateRef.current
    const primaryOf = (shipmentId) =>
      s.devices.find((d) => d.shipmentId === shipmentId && d.status === 'online')
      || s.devices.find((d) => d.shipmentId === shipmentId)

    if (ref && ref !== 'all') {
      const byDevice = s.devices.find((d) => d.id === ref)
      if (byDevice) return byDevice.id
      const byShipment = primaryOf(ref)
      if (byShipment) return byShipment.id
    }
    const moving = s.shipments.find((x) => x.status !== 'delivered') || s.shipments[0]
    return primaryOf(moving?.id)?.id || s.devices.find((d) => d.status === 'online')?.id || s.devices[0]?.id
  }, [])

  const simulateTemperatureRise = useCallback(
    (deviceId) => {
      const id = resolveTarget(deviceId)
      const S = sim.current
      const s = stateRef.current
      const device = s.devices.find((d) => d.id === id)
      const batch = s.batches.find((b) => b.id === device?.batchId)
      if (!device || !batch) return null
      S.tempTarget[id] = batch.maxTemp + 3 + S.rng() * 3.5
      S.tempHold[id] = TEMP_HOLD_TICKS
      tick({ force: true })
      return { device, batch }
    },
    [resolveTarget, tick],
  )

  const clearTemperatureRise = useCallback(
    (deviceId) => {
      const id = resolveTarget(deviceId)
      sim.current.tempTarget[id] = 0
      sim.current.tempHold[id] = 0
      sim.current.tempBias[id] = 0
      tick({ force: true })
    },
    [resolveTarget, tick],
  )

  const simulateSensorFailure = useCallback(
    (deviceId) => {
      const id = resolveTarget(deviceId)
      const S = sim.current
      const s = stateRef.current
      const device = s.devices.find((d) => d.id === id)
      sim.current.faulted.add(id)
      emitToast(
        raise(s, `fault:${id}`, 'sensor_failure', {
          value: null,
          threshold: FAULT_AFTER_SECONDS,
          unit: 's',
          message: `${id} (${device?.name}) has not reported for ${FAULT_AFTER_SECONDS} s. The console is showing the last valid reading and flagging maintenance.`,
          deviceId: id,
          batchId: device?.batchId,
          shipmentId: device?.shipmentId,
          location: device?.location,
        }),
      )
      tick({ force: true })
    },
    [resolveTarget, emitToast, raise, tick],
  )

  const simulateTamper = useCallback(
    (deviceId) => {
      const id = resolveTarget(deviceId)
      const S = sim.current
      const s = stateRef.current
      const device = s.devices.find((d) => d.id === id)
      const batch = s.batches.find((b) => b.id === device?.batchId)
      S.tamperUntil[id] = Date.now() + 14000
      if (batch) {
        S.tempTarget[id] = Math.max(S.tempTarget[id] || 0, batch.maxTemp + 1.8)
        S.tempHold[id] = 14
      }
      emitToast(
        raise(s, `tamper:${id}`, 'tamper', {
          value: 1,
          threshold: 0,
          message: `Door / tamper switch opened on ${device?.name} (${id}). Custody is compromised until the seal is re-verified.`,
          deviceId: id,
          batchId: device?.batchId,
          shipmentId: device?.shipmentId,
          location: device?.location,
        }),
      )
      tick({ force: true })
    },
    [resolveTarget, emitToast, raise, tick],
  )

  const goOffline = useCallback(
    (deviceId) => {
      const S = sim.current
      const s = stateRef.current
      const ids =
        deviceId === 'all' || !deviceId
          ? s.devices.filter((d) => d.status !== 'fault').map((d) => d.id)
          : [resolveTarget(deviceId)]
      for (const id of ids) {
        S.offline.add(id)
        S.buffer[id] = S.buffer[id] || []
        const d = s.devices.find((x) => x.id === id)
        emitToast(
          raise(s, `offline:${id}`, 'device_offline', {
            value: null,
            threshold: null,
            message: `${id} lost its uplink. Readings are buffering to microSD - nothing is lost.`,
            deviceId: id,
            batchId: d?.batchId,
            shipmentId: d?.shipmentId,
            location: d?.location,
          }),
        )
      }
      tick({ force: true })
    },
    [resolveTarget, emitToast, raise, tick],
  )

  const goOnline = useCallback(
    (deviceId) => {
      const ids = deviceId === 'all' || !deviceId ? [...sim.current.offline] : [resolveTarget(deviceId)]
      ids.forEach((id) => sim.current.offline.delete(id))
      tick({ force: true })
    },
    [resolveTarget, tick],
  )

  const recoverDevice = useCallback(
    (deviceId) => {
      sim.current.faulted.delete(deviceId)
      sim.current.offline.delete(deviceId)
      sim.current.buffer[deviceId] = []
      clear(stateRef.current, `fault:${deviceId}`)
      clear(stateRef.current, `offline:${deviceId}`)
      tick({ force: true })
    },
    [clear, tick],
  )

  const pause = useCallback(
    (v) => commit({ ...stateRef.current, paused: v ?? !stateRef.current.paused }),
    [commit],
  )

  const setSpeedScale = useCallback(
    (v) => commit({ ...stateRef.current, speedScale: v }),
    [commit],
  )

  const reset = useCallback(() => {
    sim.current = newSim()
    toastsRef.current = []
    setToasts([])
    commit(initialState())
  }, [commit])

  const acknowledgeAlert = useCallback(
    (id) =>
      commit({
        ...stateRef.current,
        alerts: stateRef.current.alerts.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)),
      }),
    [commit],
  )

  const resolveAlert = useCallback(
    (id) => {
      const key = Object.entries(sim.current.alertKeys).find(([, v]) => v === id)?.[0]
      if (key) delete sim.current.alertKeys[key]
      commit({
        ...stateRef.current,
        alerts: stateRef.current.alerts.map((a) =>
          a.id === id ? { ...a, resolved: true, acknowledged: true, resolvedAt: new Date().toISOString() } : a,
        ),
      })
    },
    [commit],
  )

  const clearResolvedAlerts = useCallback(
    () => commit({ ...stateRef.current, alerts: stateRef.current.alerts.filter((a) => !a.resolved) }),
    [commit],
  )

  /* ---------------------------------------------------------------- *
   * derived state
   * ---------------------------------------------------------------- */
  const latestByDevice = useMemo(() => {
    const out = {}
    for (const r of state.readings) out[r.deviceId] = r
    return out
  }, [state.readings])

  const historyByDevice = useMemo(() => {
    const out = {}
    for (const r of state.readings) (out[r.deviceId] ||= []).push(r)
    for (const k of Object.keys(out)) out[k] = out[k].slice(-HISTORY_POINTS)
    return out
  }, [state.readings])

  const riskOf = useCallback(
    (deviceId) => {
      const base = sim.current.spoilage[deviceId] ?? 0.08
      const t = latestByDevice[deviceId]?.temperature
      return clamp(typeof t === 'number' ? base + clamp((t - 4) / 34, 0, 0.32) : base, 0.02, 0.98)
    },
    [latestByDevice],
  )

  const kpis = useMemo(() => {
    const open = state.alerts.filter((a) => !a.resolved)
    const online = state.devices.filter((d) => d.status === 'online')
    const temps = online.map((d) => latestByDevice[d.id]?.temperature).filter((v) => typeof v === 'number')
    const inBand = state.batches.filter((b) => {
      const devs = state.devices.filter((d) => d.batchId === b.id)
      const live = devs.filter((d) => d.status === 'online')
      // A device that has dropped off the network cannot clear a batch, so it
      // counts as out of band. A device merely in maintenance is simply not
      // monitoring anything, which is not a failure - judge that batch on its
      // last known condition instead.
      if (!live.length) {
        if (devs.some((d) => d.status === 'fault' || d.status === 'offline')) return false
        const last = devs.map((d) => latestByDevice[d.id]?.temperature).filter((v) => typeof v === 'number')
        return last.length ? last.every((t) => t >= b.minTemp && t <= b.maxTemp) : true
      }
      return live.every((d) => {
        const t = latestByDevice[d.id]?.temperature
        return typeof t === 'number' && t >= b.minTemp && t <= b.maxTemp
      })
    }).length
    return {
      totalBatches: state.batches.length,
      activeShipments: state.shipments.filter((x) => x.status !== 'delivered').length,
      delivered: state.shipments.filter((x) => x.status === 'delivered').length,
      openAlerts: open.length,
      criticalAlerts: open.filter((a) => a.severity === 'critical').length,
      unread: open.filter((a) => !a.acknowledged).length,
      online: online.length,
      faulted: state.devices.filter((d) => d.status !== 'online').length,
      totalDevices: state.devices.length,
      avgTemp: temps.length ? round(temps.reduce((a, b) => a + b, 0) / temps.length, 1) : 0,
      compliance: Math.round((inBand / state.batches.length) * 100),
      highRisk: state.batches.filter(
        (b) => state.devices.filter((d) => d.batchId === b.id).some((d) => riskOf(d.id) > RISK_ALERT_AT),
      ).length,
    }
  }, [state.batches, state.shipments, state.devices, state.alerts, latestByDevice, riskOf])

  const value = useMemo(
    () => ({
      ...state,
      latestByDevice,
      historyByDevice,
      kpis,
      toasts,
      dismissToast,
      riskOf,
      selectedShipmentId,
      setSelectedShipmentId,
      selectedBatchId,
      setSelectedBatchId,
      pause,
      setSpeedScale,
      reset,
      acknowledgeAlert,
      resolveAlert,
      clearResolvedAlerts,
      actions: {
        simulateTemperatureRise,
        clearTemperatureRise,
        simulateSensorFailure,
        simulateTamper,
        goOffline,
        goOnline,
        recoverDevice,
        tick,
      },
    }),
    [
      state,
      latestByDevice,
      historyByDevice,
      kpis,
      toasts,
      dismissToast,
      riskOf,
      selectedShipmentId,
      selectedBatchId,
      pause,
      setSpeedScale,
      reset,
      acknowledgeAlert,
      resolveAlert,
      clearResolvedAlerts,
      simulateTemperatureRise,
      clearTemperatureRise,
      simulateSensorFailure,
      simulateTamper,
      goOffline,
      goOnline,
      recoverDevice,
      tick,
    ],
  )

  return <ShipmentCtx.Provider value={value}>{children}</ShipmentCtx.Provider>
}

export const useShipments = () => {
  const ctx = useContext(ShipmentCtx)
  if (!ctx) throw new Error('useShipments must be used inside <ShipmentProvider>')
  return ctx
}

/* ------------------------------------------------------------------ *
 * internals
 * ------------------------------------------------------------------ */

const CHECKPOINT_TYPE = {
  farm: 'Farm',
  precooling: 'Pre-cooling',
  collection: 'Collection',
  cold_storage: 'Cold storage',
  transit: 'Transit hub',
  destination: 'Delivery',
}

const CHECKPOINT_HANDLERS = {
  Farm: 'Suresh Kadam',
  'Pre-cooling': 'Mahesh Jadhav',
  Collection: 'Jaydeep Patil',
  'Cold storage': 'Anita Bhosale',
  'Transit hub': 'Ravi Deshmukh',
  Delivery: 'Anita Bhosale',
  Customs: 'Customs officer',
}

/** One sensor sample with any injected scenario folded in. */
function sample(batch, device, S, rnd, tNow) {
  const tamperOpen = (S.tamperUntil[device.id] || 0) > tNow

  /* ease an injected bias in, hold it, then release it back to setpoint */
  const bias = S.tempBias[device.id] || 0
  const target = S.tempTarget[device.id] || 0
  const next = bias + (target - bias) * 0.34
  S.tempBias[device.id] = target === 0 ? Math.max(0, next * 0.72) : next
  if (target > 0) {
    S.tempHold[device.id] = Math.max(0, (S.tempHold[device.id] || 0) - 1)
    if (S.tempHold[device.id] === 0) S.tempTarget[device.id] = 0
  }

  const spoilage = S.spoilage[device.id] ?? 0.06
  const effBias = S.tempBias[device.id] + (tamperOpen ? 3.4 : 0)
  const out = { id: nextReadingId(), deviceId: device.id, batchId: batch.id, timestamp: new Date(tNow).toISOString() }

  for (const sp of batch.sensors) {
    if (sp.binary) out[sp.key] = tamperOpen ? 1 : 0
    else if (sp.key === 'temperature') out[sp.key] = round(sp.baseline + effBias + (rnd() - 0.5) * 2 * sp.noise, 1)
    else if (sp.key === 'gas') out[sp.key] = Math.round(sp.baseline + spoilage * 190 + (rnd() - 0.5) * 2 * sp.noise)
    else if (sp.key === 'light') out[sp.key] = Math.max(0, Math.round(rnd() < 0.1 ? rnd() * 280 : (rnd() - 0.5) * 4))
    else out[sp.key] = round(sp.baseline + (rnd() - 0.5) * 2 * sp.noise, sp.decimals)
  }

  /* spoilage climbs with excursions, settles slowly while in band */
  const tOver = Math.max(0, out.temperature - batch.maxTemp)
  const tUnder = Math.max(0, batch.minTemp - out.temperature)
  const gasSoft = batch.sensors.find((s) => s.key === 'gas')?.softMax ?? 180
  S.spoilage[device.id] = clamp(
    spoilage + tOver * 0.021 + tUnder * 0.008 + (out.gas > gasSoft ? 0.017 : 0) - 0.009,
    0.02,
    0.98,
  )

  out.battery = device.battery
  out.signal = device.signal
  out.spoilageRisk = round(S.spoilage[device.id], 3)
  return out
}

/** Threshold rules. `raise`/`clear` are passed in so alerts stay de-duplicated. */
function evaluate(s, batch, device, r, out, raise, clear) {
  const gasSoft = batch.sensors.find((x) => x.key === 'gas')?.softMax ?? 180
  const tests = [
    {
      key: `temp:${device.id}`,
      type: 'temperature_breach',
      bad: r.temperature > batch.maxTemp || r.temperature < batch.minTemp,
      value: r.temperature,
      threshold: r.temperature > batch.maxTemp ? batch.maxTemp : batch.minTemp,
      unit: '\u00b0C',
      message: `${device.id} reading ${r.temperature}\u00b0C against the ${batch.minTemp}-${batch.maxTemp}\u00b0C band for ${batch.product}. Batch ${batch.id} is out of cold chain.`,
    },
    {
      key: `hum:${device.id}`,
      type: 'humidity_breach',
      bad: r.humidity > batch.maxHumidity || r.humidity < batch.minHumidity,
      value: r.humidity,
      threshold: r.humidity > batch.maxHumidity ? batch.maxHumidity : batch.minHumidity,
      unit: '%',
      message: `${device.id} humidity ${r.humidity}% outside ${batch.minHumidity}-${batch.maxHumidity}%. Condensation and skin rot risk for ${batch.product}.`,
    },
    {
      key: `gas:${device.id}`,
      type: 'gas_spike',
      bad: r.gas > gasSoft,
      value: r.gas,
      threshold: gasSoft,
      unit: 'ppm',
      message: `${device.id} ethylene/VOC at ${r.gas} ppm. Ripening is accelerating - shorten the route or re-ice.`,
    },
    {
      key: `spoilage:${device.id}`,
      type: 'spoilage_risk',
      bad: r.spoilageRisk > RISK_ALERT_AT,
      value: Math.round(r.spoilageRisk * 100),
      threshold: Math.round(RISK_ALERT_AT * 100),
      unit: '%',
      message: `Model risk score ${Math.round(r.spoilageRisk * 100)}% for ${batch.id}. Isolation Forest flagged an anomaly and the classifier predicts visible spoilage within 36 h.`,
    },
  ]

  for (const t of tests) {
    if (t.bad) {
      out.push(
        raise(s, t.key, t.type, {
          value: t.value,
          threshold: t.threshold,
          unit: t.unit,
          message: t.message,
          deviceId: device.id,
          batchId: batch.id,
          shipmentId: device.shipmentId,
          location: device.location,
        }),
      )
    } else {
      clear(s, t.key)
    }
  }
}
