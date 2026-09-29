/**
 * mockData.js - the entire demo dataset.
 *
 * Everything here is deterministic (seeded PRNG) so the dashboard looks identical
 * on every reload, which matters when you are demoing on a projector. The
 * ShipmentContext mutates a copy of this at runtime; nothing writes back here.
 */
import { mulberry32 } from '../lib/format'

/* ------------------------------------------------------------------ *
 * Simulation tuning
 * ------------------------------------------------------------------ */
export const TICK_MS = 2000 // one "sensor cycle"
export const SIM_SEED = 20260928
export const HISTORY_POINTS = 60
// A global ring buffer smaller than the seeded history starves the earliest device,
// so the first device's chart would empty out seconds after load. 5 devices x 60
// points of history, plus headroom for live samples between refills.
export const MAX_READINGS = 540
export const MAX_GPS = 240
export const MAX_ALERTS = 60
export const SPEED_KMH = 46

/* ------------------------------------------------------------------ *
 * Roles (fake auth for phase 1 - replaced by JWT in phase 2)
 * ------------------------------------------------------------------ */
export const ROLE_META = {
  farmer: {
    label: 'Farmer',
    accent: '#3DDC97',
    blurb: 'Registers batches, sees harvest quality and custody status.',
    landing: '/dashboard',
  },
  transporter: {
    label: 'Transporter',
    accent: '#22D3EE',
    blurb: 'Live route, vehicle sensor health and tamper alerts.',
    landing: '/tracking',
  },
  warehouse: {
    label: 'Warehouse',
    accent: '#FFC24B',
    blurb: 'Cold-store intake, stock condition and inbound shipments.',
    landing: '/shipments',
  },
  admin: {
    label: 'Admin',
    accent: '#A78BFF',
    blurb: 'Full platform access including ledger verification.',
    landing: '/dashboard',
  },
}

export const DEMO_USERS = [
  { username: 'kadam.farm', password: 'demo1234', name: 'Suresh Kadam', role: 'farmer', org: 'Kadam Alphonso Farm, Nashik' },
  { username: 'ravi.transit', password: 'demo1234', name: 'Ravi Deshmukh', role: 'transporter', org: 'Nashik Cold Logistics' },
  { username: 'anita.cold', password: 'demo1234', name: 'Anita Bhosale', role: 'warehouse', org: 'Pune Regional Cold Store' },
  { username: 'admin.farmchain', password: 'demo1234', name: 'Farhan Shaikh', role: 'admin', org: 'FoodChain Platform' },
]

/* ------------------------------------------------------------------ *
 * Route: Nashik farm gate -> Pune distribution centre
 * ------------------------------------------------------------------ */
export const ROUTE_WAYPOINTS = [
  { key: 'farm', label: 'Kadam Farm Gate', place: 'Nashik, MH', ll: [19.9975, 73.7898] },
  { key: 'collection', label: 'Sinnar Collection Centre', place: 'Sinnar, MH', ll: [19.8247, 73.7518] },
  { key: 'cold_storage', label: 'Ahmednagar Cold Storage', place: 'Ahmednagar, MH', ll: [19.0948, 74.748] },
  { key: 'transit', label: 'Baramati Transit Hub', place: 'Baramati, MH', ll: [18.3388, 74.9067] },
  { key: 'destination', label: 'Pune Regional DC', place: 'Pune, MH', ll: [18.5204, 73.8567] },
]

/**
 * Turn waypoints into a road-looking polyline: a smooth sinusoidal bend added
 * along the perpendicular of each leg, tapered to zero at both endpoints.
 */
export const buildPath = (wps, stepsPerLeg = 22, seed = 7) => {
  const rng = mulberry32(seed)
  const out = []
  for (let i = 0; i < wps.length - 1; i++) {
    const a = wps[i].ll
    const b = wps[i + 1].ll
    const dLat = b[0] - a[0]
    const dLng = b[1] - a[1]
    const len = Math.hypot(dLat, dLng) || 1e-9
    const pLat = -dLng / len
    const pLng = dLat / len
    const amp = 0.008 + rng() * 0.022
    const phase = rng() * Math.PI * 2
    const freq = 1 + Math.floor(rng() * 2)
    for (let s = 0; s < stepsPerLeg; s++) {
      const t = s / stepsPerLeg
      const bend = Math.sin(t * Math.PI * freq + phase) * amp * Math.sin(t * Math.PI)
      out.push([a[0] + dLat * t + pLat * bend, a[1] + dLng * t + pLng * bend])
    }
  }
  out.push(wps[wps.length - 1].ll)
  return out
}

export const ROUTE_PATH = buildPath(ROUTE_WAYPOINTS, 22, 7)

/* ------------------------------------------------------------------ *
 * Product catalogue + per-category thresholds
 * ------------------------------------------------------------------ */
export const CATALOG = {
  mango: { emoji: '\u{1F96D}', accent: '#FFC24B', shelfLifeDays: 14 },
  grapes: { emoji: '\u{1F347}', accent: '#A78BFF', shelfLifeDays: 21 },
  chilli: { emoji: '\u{1F336}', accent: '#FF7A45', shelfLifeDays: 10 },
  pomegranate: { emoji: '\u{1F345}', accent: '#FF5C7A', shelfLifeDays: 28 },
}

/**
 * Sensor channels are derived from the batch, so a chilli lot is allowed to sit
 * at 9 C while grapes must stay at 4 C. `softMax` is the advisory limit that
 * raises a warning before the hard band is crossed.
 */
const SENSOR_SPECS = ({ tMin, tMax, tBase, tNoise, hBase, gasBase, softMax = 180 }) => [
  { key: 'temperature', label: 'Temperature', unit: '\u00b0C', short: 'Temp', min: tMin, max: tMax, baseline: tBase, noise: tNoise, decimals: 1 },
  { key: 'humidity', label: 'Humidity', unit: '%', short: 'RH', min: Math.max(0, hBase - 5), max: hBase + 5, baseline: hBase, noise: 1.2, decimals: 0 },
  { key: 'gas', label: 'Ethylene / VOC', unit: 'ppm', short: 'Gas', min: 0, max: 240, baseline: gasBase, noise: 6, decimals: 0, softMax },
  { key: 'light', label: 'Light exposure', unit: 'lux', short: 'Light', min: 0, max: 400, baseline: 0, noise: 0, decimals: 0 },
  { key: 'door', label: 'Door state', unit: '', short: 'Door', min: 0, max: 1, baseline: 0, noise: 0, decimals: 0, binary: true },
  { key: 'tamper', label: 'Tamper switch', unit: '', short: 'Tamper', min: 0, max: 1, baseline: 0, noise: 0, decimals: 0, binary: true },
]

/* ------------------------------------------------------------------ *
 * Batches
 * ------------------------------------------------------------------ */
const now = Date.now()
const H = 3600_000

export const INITIAL_BATCHES = [
  {
    id: 'FB-2026-0A41',
    product: 'Alphonso Mango',
    variety: 'Alphonso (Hapus)',
    category: 'mango',
    grade: 'A',
    quantityCrates: 480,
    weightKg: 9600,
    farmId: 'FRM-118',
    farmName: 'Kadam Alphonso Farm',
    farmOwner: 'Suresh Kadam',
    location: 'Nashik, Maharashtra',
    geo: [19.9975, 73.7898],
    harvestedAt: new Date(now - 54 * H).toISOString(),
    expiryAt: new Date(now + 9 * 24 * H).toISOString(),
    minTemp: 4,
    maxTemp: 8,
    minHumidity: 85,
    maxHumidity: 95,
    certifications: ['FSSAI', 'GlobalG.A.P.', 'HACCP'],
    harvestMethod: 'Hand-picked, stem-cut',
    lotNote: 'Day-3 north block, uniform ripening grade.',
    qr: 'QR-FB-2026-0A41',
    sensors: SENSOR_SPECS({ tMin: 4, tMax: 8, tBase: 6.1, tNoise: 0.28, hBase: 90, gasBase: 92, softMax: 180 }),
  },
  {
    id: 'FB-2026-0B17',
    product: 'Thompson Seedless Grapes',
    variety: 'Thompson Seedless',
    category: 'grapes',
    grade: 'A+',
    quantityCrates: 320,
    weightKg: 6400,
    farmId: 'FRM-204',
    farmName: 'Nimgaon Export Farms',
    farmOwner: 'Anil Patil',
    location: 'Sangli, Maharashtra',
    geo: [19.8247, 73.7518],
    harvestedAt: new Date(now - 71 * H).toISOString(),
    expiryAt: new Date(now + 17 * 24 * H).toISOString(),
    minTemp: 2,
    maxTemp: 6,
    minHumidity: 90,
    maxHumidity: 98,
    certifications: ['FSSAI', 'APEDA', 'GlobalG.A.P.'],
    harvestMethod: 'Box-picked, pre-cooled within 40 min',
    lotNote: 'Export lot, 18 kg vented crates.',
    qr: 'QR-FB-2026-0B17',
    sensors: SENSOR_SPECS({ tMin: 2, tMax: 6, tBase: 4.2, tNoise: 0.22, hBase: 94, gasBase: 68, softMax: 150 }),
  },
  {
    id: 'FB-2026-0C08',
    product: 'Green Chilli',
    variety: 'G20 Hybrid',
    category: 'chilli',
    grade: 'B',
    quantityCrates: 180,
    weightKg: 3600,
    farmId: 'FRM-077',
    farmName: 'Bhima Organic Growers',
    farmOwner: 'Sunita Wagh',
    location: 'Pune, Maharashtra',
    geo: [18.5204, 73.8567],
    harvestedAt: new Date(now - 20 * H).toISOString(),
    expiryAt: new Date(now + 6 * 24 * H).toISOString(),
    minTemp: 7,
    maxTemp: 12,
    minHumidity: 90,
    maxHumidity: 98,
    certifications: ['FSSAI', 'NPOP Organic'],
    harvestMethod: 'Machine harvested, shade-packed',
    lotNote: 'Awaiting dispatch - pre-cooling hold.',
    qr: 'QR-FB-2026-0C08',
    sensors: SENSOR_SPECS({ tMin: 7, tMax: 12, tBase: 9.4, tNoise: 0.4, hBase: 94, gasBase: 128, softMax: 200 }),
  },
  {
    id: 'FB-2026-0D22',
    product: 'Bhagwa Pomegranate',
    variety: 'Bhagwa',
    category: 'pomegranate',
    grade: 'A',
    quantityCrates: 260,
    weightKg: 7800,
    farmId: 'FRM-131',
    farmName: 'Dharashiv Cold Estate',
    farmOwner: 'Mohan Rathod',
    location: 'Solapur, Maharashtra',
    geo: [18.3388, 74.9067],
    harvestedAt: new Date(now - 96 * H).toISOString(),
    expiryAt: new Date(now + 21 * 24 * H).toISOString(),
    minTemp: 4,
    maxTemp: 8,
    minHumidity: 88,
    maxHumidity: 96,
    certifications: ['FSSAI', 'GI Tagged', 'HACCP'],
    harvestMethod: 'Hand-picked, wax-free',
    lotNote: 'Delivered. Cold chain unbroken for 96 h.',
    qr: 'QR-FB-2026-0D22',
    sensors: SENSOR_SPECS({ tMin: 4, tMax: 8, tBase: 5.8, tNoise: 0.26, hBase: 92, gasBase: 84, softMax: 180 }),
  },
]

/* ------------------------------------------------------------------ *
 * Devices
 * ------------------------------------------------------------------ */
export const INITIAL_DEVICES = [
  {
    id: 'ESP32-1042',
    name: 'Reefer Node A',
    role: 'Trailer 1 - pallet 1',
    firmware: '1.4.2',
    status: 'online',
    battery: 87,
    signal: -61,
    ip: '10.42.0.11',
    mac: '7C:9E:BD:11:04:2A',
    shipmentId: 'SHP-2041',
    batchId: 'FB-2026-0A41',
    location: 'NH-52, after Ahmednagar',
    lastSeen: new Date(now - TICK_MS).toISOString(),
    installedAt: new Date(now - 62 * H).toISOString(),
    bufferedReadings: 0,
  },
  {
    id: 'ESP32-1043',
    name: 'Reefer Node B',
    role: 'Trailer 1 - pallet 2',
    firmware: '1.4.2',
    status: 'online',
    battery: 64,
    signal: -74,
    ip: '10.42.0.12',
    mac: '7C:9E:BD:11:04:2B',
    shipmentId: 'SHP-2041',
    batchId: 'FB-2026-0A41',
    location: 'NH-52, after Ahmednagar',
    lastSeen: new Date(now - TICK_MS).toISOString(),
    installedAt: new Date(now - 62 * H).toISOString(),
    bufferedReadings: 0,
  },
  {
    id: 'ESP32-1044',
    name: 'Trailer Node C',
    role: 'Reefer truck MH-15-AB-4412',
    firmware: '1.3.9',
    status: 'online',
    battery: 42,
    signal: -88,
    ip: '10.42.0.21',
    mac: '7C:9E:BD:22:07:1C',
    shipmentId: 'SHP-2042',
    batchId: 'FB-2026-0B17',
    location: 'Mumbai Expressway, near Khalapur',
    lastSeen: new Date(now - TICK_MS).toISOString(),
    installedAt: new Date(now - 74 * H).toISOString(),
    bufferedReadings: 0,
  },
  {
    id: 'ESP32-1045',
    name: 'Pallet Node D',
    role: 'Cold store - bay 3',
    firmware: '1.4.2',
    status: 'online',
    battery: 95,
    signal: -55,
    ip: '10.51.0.08',
    mac: '7C:9E:BD:33:02:5D',
    shipmentId: 'SHP-2043',
    batchId: 'FB-2026-0C08',
    location: 'Pune Regional DC, bay 3',
    lastSeen: new Date(now - TICK_MS).toISOString(),
    installedAt: new Date(now - 210 * H).toISOString(),
    bufferedReadings: 0,
  },
  {
    id: 'ESP32-1046',
    name: 'Cold Store Node E',
    role: 'Cold store - bay 1',
    firmware: '1.4.0',
    status: 'maintenance',
    battery: 18,
    signal: -96,
    ip: '10.51.0.06',
    mac: '7C:9E:BD:33:02:5E',
    shipmentId: 'SHP-2044',
    batchId: 'FB-2026-0D22',
    location: 'Pune Regional DC, bay 1',
    lastSeen: new Date(now - 19 * H).toISOString(),
    installedAt: new Date(now - 320 * H).toISOString(),
    bufferedReadings: 412,
  },
]

/* ------------------------------------------------------------------ *
 * Shipments
 * ------------------------------------------------------------------ */
export const INITIAL_SHIPMENTS = [
  {
    id: 'SHP-2041',
    batchId: 'FB-2026-0A41',
    status: 'in_transit',
    origin: 'Nashik, MH',
    destination: 'Pune, MH',
    originGeo: ROUTE_WAYPOINTS[0].ll,
    destGeo: ROUTE_WAYPOINTS[4].ll,
    waypoints: ROUTE_WAYPOINTS,
    path: ROUTE_PATH,
    progress: 0.415,
    speed: SPEED_KMH,
    heading: 205,
    position: null, // filled by context from path + progress
    departedAt: new Date(now - 7.6 * H).toISOString(),
    eta: new Date(now + 2.4 * H).toISOString(),
    distanceKm: null,
    vehicle: 'Reefer truck MH-15-AB-4412',
    vehicleType: 'Refrigerated truck (8.2 m)',
    driver: 'Ravi Deshmukh',
    driverPhone: '+91 98xxx xxxxx',
    transporter: 'Nashik Cold Logistics',
    sealId: 'SEAL-774120',
    co2: 18.4,
    distanceTravelledKm: null,
  },
  {
    id: 'SHP-2042',
    batchId: 'FB-2026-0B17',
    status: 'in_transit',
    origin: 'Sangli, MH',
    destination: 'Mumbai, MH',
    originGeo: [16.8524, 74.5815],
    destGeo: [19.076, 72.8777],
    waypoints: [
      { key: 'farm', label: 'Nimgaon Export Farms', place: 'Sangli, MH', ll: [16.8524, 74.5815] },
      { key: 'collection', label: 'Pali Weighbridge', place: 'Pali, MH', ll: [16.9859, 74.1166] },
      { key: 'cold_storage', label: 'Panvel Pre-cooling', place: 'Panvel, MH', ll: [18.9891, 73.1157] },
      { key: 'destination', label: 'Mumbai Market Yard', place: 'Mumbai, MH', ll: [19.076, 72.8777] },
    ],
    path: buildPath(
      [
        { ll: [16.8524, 74.5815] },
        { ll: [16.9859, 74.1166] },
        { ll: [18.9891, 73.1157] },
        { ll: [19.076, 72.8777] },
      ],
      20,
      19,
    ),
    progress: 0.775,
    speed: 38,
    heading: 350,
    position: null,
    departedAt: new Date(now - 9.2 * H).toISOString(),
    eta: new Date(now + 1.1 * H).toISOString(),
    distanceKm: null,
    vehicle: 'Reefer truck MH-12-XY-9087',
    vehicleType: 'Refrigerated truck (6.5 m)',
    driver: 'Suresh Gaikwad',
    driverPhone: '+91 97xxx xxxxx',
    transporter: 'Konkan Fruit Carriers',
    sealId: 'SEAL-774188',
    co2: 12.1,
    distanceTravelledKm: null,
  },
  {
    id: 'SHP-2043',
    batchId: 'FB-2026-0C08',
    status: 'at_checkpoint',
    origin: 'Pune, MH',
    destination: 'Pune, MH',
    originGeo: [18.5204, 73.8567],
    destGeo: [18.5204, 73.8567],
    waypoints: [
      { key: 'collection', label: 'Bhima Collection Point', place: 'Pune, MH', ll: [18.5204, 73.8567] },
      { key: 'destination', label: 'Pune Regional DC, bay 3', place: 'Pune, MH', ll: [18.5204, 73.8567] },
    ],
    path: [
      [18.5204, 73.8567],
      [18.5204, 73.8567],
    ],
    progress: 0.1,
    speed: 0,
    heading: 0,
    position: null,
    departedAt: null,
    eta: new Date(now + 5 * H).toISOString(),
    distanceKm: null,
    vehicle: 'Pending dispatch',
    vehicleType: '-',
    driver: '-',
    driverPhone: '-',
    transporter: 'Self transport',
    sealId: 'SEAL-774201',
    co2: 0,
    distanceTravelledKm: null,
  },
  {
    id: 'SHP-2044',
    batchId: 'FB-2026-0D22',
    status: 'delivered',
    origin: 'Solapur, MH',
    destination: 'Pune, MH',
    originGeo: [17.6599, 75.9064],
    destGeo: [18.5204, 73.8567],
    waypoints: [
      { key: 'farm', label: 'Dharashiv Cold Estate', place: 'Solapur, MH', ll: [17.6599, 75.9064] },
      { key: 'cold_storage', label: 'Baramati Transit Hub', place: 'Baramati, MH', ll: [18.3388, 74.9067] },
      { key: 'destination', label: 'Pune Regional DC', place: 'Pune, MH', ll: [18.5204, 73.8567] },
    ],
    path: buildPath(
      [
        { ll: [17.6599, 75.9064] },
        { ll: [18.3388, 74.9067] },
        { ll: [18.5204, 73.8567] },
      ],
      18,
      33,
    ),
    progress: 1,
    speed: 0,
    heading: 0,
    position: null,
    departedAt: new Date(now - 96 * H).toISOString(),
    eta: new Date(now - 4 * H).toISOString(),
    distanceKm: null,
    vehicle: 'Reefer truck MH-20-QR-5510',
    vehicleType: 'Refrigerated truck (8.2 m)',
    driver: 'Imran Shaikh',
    driverPhone: '+91 96xxx xxxxx',
    transporter: 'Devagiri Cold Chain',
    sealId: 'SEAL-774009',
    co2: 22.7,
    distanceTravelledKm: null,
  },
]

/* ------------------------------------------------------------------ *
 * Checkpoints (chain of custody) - the full ledger is built at runtime
 * ------------------------------------------------------------------ */
const CP = (n) => ({
  type: n,
  location: '',
  actor: '',
  handler: '',
  notes: '',
  condition: null,
  signature: '',
})

export const INITIAL_CHECKPOINTS = [
  {
    id: 'CP-9001',
    batchId: 'FB-2026-0A41',
    shipmentId: 'SHP-2041',
    ...CP('Farm'),
    location: 'Kadam Alphonso Farm, Nashik',
    actor: 'Suresh Kadam (FRM-118)',
    handler: 'Suresh Kadam',
    timestamp: new Date(now - 54 * H).toISOString(),
    temperature: 8.4,
    humidity: 92,
    notes: 'Harvested at 05:40. Crates moved to pre-cooling within 40 min.',
    geo: [19.9975, 73.7898],
    status: 'complete',
    onChain: true,
  },
  {
    id: 'CP-9002',
    batchId: 'FB-2026-0A41',
    shipmentId: 'SHP-2041',
    ...CP('Pre-cooling'),
    location: 'Nashik Pack House',
    actor: 'Suresh Kadam (FRM-118)',
    handler: 'Mahesh Jadhav',
    timestamp: new Date(now - 51 * H).toISOString(),
    temperature: 7.1,
    humidity: 93,
    notes: 'Forced-air pre-cooling to 7.1 C. Core temperature match.',
    geo: [19.9975, 73.7898],
    status: 'complete',
    onChain: true,
  },
  {
    id: 'CP-9003',
    batchId: 'FB-2026-0A41',
    shipmentId: 'SHP-2041',
    ...CP('Collection'),
    location: 'Sinnar Collection Centre',
    actor: 'Sinnar FPO (FRM-118)',
    handler: 'Jaydeep Patil',
    timestamp: new Date(now - 7.9 * H).toISOString(),
    temperature: 6.4,
    humidity: 91,
    notes: 'Loaded 480 crates. Seal SEAL-774120 applied and signed.',
    geo: [19.8247, 73.7518],
    status: 'complete',
    onChain: true,
  },
  {
    id: 'CP-9004',
    batchId: 'FB-2026-0A41',
    shipmentId: 'SHP-2041',
    ...CP('Transport'),
    location: 'NH-52, Ahmednagar bypass',
    actor: 'Nashik Cold Logistics',
    handler: 'Ravi Deshmukh',
    timestamp: new Date(now - 2.1 * H).toISOString(),
    temperature: 5.9,
    humidity: 90,
    notes: 'Mid-route custody handover. Reefer setpoint 5.5 C, genset running.',
    geo: [19.0948, 74.748],
    status: 'complete',
    onChain: true,
  },
  {
    id: 'CP-9010',
    batchId: 'FB-2026-0D22',
    shipmentId: 'SHP-2044',
    ...CP('Delivery'),
    location: 'Pune Regional DC, bay 1',
    actor: 'Pune Regional Cold Store',
    handler: 'Anita Bhosale',
    timestamp: new Date(now - 4 * H).toISOString(),
    temperature: 5.2,
    humidity: 91,
    notes: 'Received 260 crates. Seal intact, no deviations across 96 h.',
    geo: [18.5204, 73.8567],
    status: 'complete',
    onChain: true,
  },
]

/* ------------------------------------------------------------------ *
 * Seeded history so charts are populated the moment the app opens
 * ------------------------------------------------------------------ */
const makeHistory = (deviceId, batch, rng, points = HISTORY_POINTS, stepMs = TICK_MS) => {
  const spec = batch.sensors.find((s) => s.key === 'temperature')
  const rows = []
  const end = Date.now()
  for (let i = points - 1; i >= 0; i--) {
    const t = new Date(end - i * stepMs).toISOString()
    const r = {}
    for (const s of batch.sensors) {
      if (s.binary) {
        r[s.key] = 0
      } else {
        r[s.key] = Math.round((s.baseline + (rng() - 0.5) * 2 * s.noise) * 10 ** s.decimals) / 10 ** s.decimals
      }
    }
    r.temperature = Math.min(spec.max + 0.4, Math.max(spec.min - 0.3, r.temperature))
    rows.push({ deviceId, batchId: batch.id, timestamp: t, ...r, battery: 88, signal: -62, spoilageRisk: 0.1 + rng() * 0.08 })
  }
  return rows
}

export const makeSeedReadings = (devices, batches) => {
  const rng = mulberry32(SIM_SEED)
  const rows = []
  for (const d of devices) {
    if (d.status === 'maintenance') continue
    const batch = batches.find((b) => b.id === d.batchId)
    if (!batch) continue
    rows.push(...makeHistory(d.id, batch, rng))
  }
  return rows
}

/* ------------------------------------------------------------------ *
 * Seeded alerts
 * ------------------------------------------------------------------ */
export const INITIAL_ALERTS = [
  {
    id: 'ALT-5001',
    type: 'door_open',
    severity: 'warning',
    title: 'Door open for 94 s',
    message: 'Cold-store bay 1 door stayed open beyond the 60 s threshold. Compressor load rising.',
    deviceId: 'ESP32-1046',
    batchId: 'FB-2026-0D22',
    shipmentId: 'SHP-2044',
    location: 'Pune Regional DC, bay 1',
    value: 94,
    threshold: 60,
    unit: 's',
    timestamp: new Date(now - 20 * H).toISOString(),
    acknowledged: true,
    resolved: true,
    occurrences: 1,
  },
  {
    id: 'ALT-5002',
    type: 'battery_low',
    severity: 'info',
    title: 'Device battery at 18%',
    message: 'ESP32-1046 has 6 h of runtime left at the current sample rate. Schedule a swap.',
    deviceId: 'ESP32-1046',
    batchId: 'FB-2026-0D22',
    shipmentId: 'SHP-2044',
    location: 'Pune Regional DC, bay 1',
    value: 18,
    threshold: 20,
    unit: '%',
    timestamp: new Date(now - 19.2 * H).toISOString(),
    acknowledged: true,
    resolved: false,
    occurrences: 2,
  },
  {
    id: 'ALT-5003',
    type: 'signal_weak',
    severity: 'info',
    title: 'Weak uplink on ESP32-1044',
    message: 'RSSI -88 dBm for 6 consecutive cycles. Readings are being buffered to SD card.',
    deviceId: 'ESP32-1044',
    batchId: 'FB-2026-0B17',
    shipmentId: 'SHP-2042',
    location: 'Mumbai Expressway, near Khalapur',
    value: -88,
    threshold: -85,
    unit: 'dBm',
    timestamp: new Date(now - 5 * H).toISOString(),
    acknowledged: true,
    resolved: false,
    occurrences: 6,
  },
]

/* ------------------------------------------------------------------ *
 * Alert templates used by the simulator
 * ------------------------------------------------------------------ */
export const ALERT_RULES = {
  temperature_breach: (v, t) => ({
    severity: v > t * 1.25 ? 'critical' : 'warning',
    title: `Temperature ${v > t ? 'above' : 'below'} limit`,
  }),
  humidity_breach: (v, t) => ({ severity: 'warning', title: 'Humidity outside band' }),
  gas_spike: (v, t) => ({ severity: v > t * 1.2 ? 'critical' : 'warning', title: 'Ethylene spike detected' }),
  sensor_failure: () => ({ severity: 'critical', title: 'Sensor stopped reporting' }),
  device_offline: () => ({ severity: 'warning', title: 'Device lost uplink' }),
  device_online: () => ({ severity: 'info', title: 'Device back online' }),
  tamper: () => ({ severity: 'critical', title: 'Tamper switch triggered' }),
  spoilage_risk: () => ({ severity: 'warning', title: 'Predicted spoilage risk rising' }),
  battery_low: () => ({ severity: 'info', title: 'Device battery low' }),
  signal_weak: () => ({ severity: 'info', title: 'Weak uplink, buffering to SD' }),
  geofence: () => ({ severity: 'critical', title: 'Route deviation detected' }),
  checkpoint: () => ({ severity: 'info', title: 'Custody checkpoint logged' }),
  delivered: () => ({ severity: 'info', title: 'Shipment delivered' }),
}

let alertSeq = 5100
let checkpointSeq = 9100
let readingSeq = 1
export const nextAlertId = () => `ALT-${alertSeq++}`
export const nextCheckpointId = () => `CP-${checkpointSeq++}`
export const nextReadingId = () => `R-${readingSeq++}`

export const CHECKPOINT_TYPES = ['Farm', 'Pre-cooling', 'Collection', 'Cold storage', 'Transport', 'Customs', 'Delivery']
