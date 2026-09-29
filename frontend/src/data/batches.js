// Complete mock batch data and storage utilities for Food Traceability
// Follows the 9-stage journey:
// 1. Farm Origin
// 2. Registration
// 3. Quality Check
// 4. Storage
// 5. IoT-Monitored Transportation
// 6. Real-time Analysis
// 7. Anomaly & Alert Detection
// 8. Destination
// 9. Final Quality Check

export const JOURNEY_STAGES = [
  { id: 'farm', label: 'Farm Origin', icon: 'Sprout', shortDesc: 'Harvested & certified at source farm' },
  { id: 'registration', label: 'Registration', icon: 'FileText', shortDesc: 'Batch ID & QR code generated' },
  { id: 'quality_check', label: 'Quality Check', icon: 'CheckCircle2', shortDesc: 'Moisture, grade & chemical screening' },
  { id: 'storage', label: 'Cold Storage', icon: 'Warehouse', shortDesc: 'Pre-cooling facility & climate control' },
  { id: 'transportation', label: 'IoT Transportation', icon: 'Truck', shortDesc: 'Cold-chain vehicle with live GPS & temp sensors' },
  { id: 'realtime_analysis', label: 'Real-time Analysis', icon: 'Cpu', shortDesc: 'Freshness index & shelf-life prediction' },
  { id: 'anomaly_detection', label: 'Anomaly & Alerts', icon: 'ShieldAlert', shortDesc: 'Thermal breach & tamper detection' },
  { id: 'destination', label: 'Destination Arrival', icon: 'MapPin', shortDesc: 'Received at wholesale market / terminal hub' },
  { id: 'final_quality_check', label: 'Final Quality Check', icon: 'Award', shortDesc: 'Buyer inspection & acceptance' },
]

export const INITIAL_BATCHES = {
  'BATCH-MNG-9041': {
    id: 'BATCH-MNG-9041',
    product: 'Alphonso Mangoes',
    variety: 'Ratnagiri Grade A+',
    category: 'Fruits',
    quantity: '1,200 kg (150 Crates)',
    harvestDate: '2024-05-18',
    farmerName: 'Rajesh Patil',
    farmLocation: 'Devgad Orchards, Ratnagiri, Maharashtra',
    farmCoords: [16.9902, 73.312],
    destinationName: 'Vashi APMC Cold Hub, Navi Mumbai',
    destCoords: [19.076, 72.8777],
    currentLocationName: 'NH66 Expressway - Near Khed Tollway',
    currentCoords: [17.72, 73.39],
    route: [
      [16.9902, 73.312],
      [17.3, 73.35],
      [17.72, 73.39],
      [18.15, 73.45],
      [18.5204, 73.8567],
      [18.98, 73.12],
      [19.076, 72.8777]
    ],
    transporterName: 'Kisan Cold-Chain Logistics',
    transporterContact: '+91 98220 44102',
    vehicleNumber: 'MH-08-AG-4921',
    driverName: 'Suresh Gaikwad',
    buyerName: 'FreshBazaar Hypermarkets Ltd.',
    buyerLocation: 'APMC Market Sector 19, Vashi',
    currentStageIndex: 4, // 0-indexed: 4 is 'transportation' (Step 5 of 9)
    status: 'In Transit',
    telemetry: {
      temperature: 7.8,
      tempUnit: '°C',
      tempRange: [4, 10],
      humidity: 86,
      humidityUnit: '% RH',
      humidityRange: [80, 95],
      freshnessScore: 94,
      spoilageRisk: 'Low',
      anomalyDetected: false,
      anomalyMessage: 'All parameters within optimal thermal envelope.',
      lastUpdated: '2 mins ago',
      gpsSpeed: '52 km/h',
      batteryLevel: '94%'
    },
    timeline: [
      {
        stageIndex: 0,
        title: 'Farm Origin & Harvest',
        location: 'Devgad Orchards, Ratnagiri',
        timestamp: '18 May 2024, 06:30 AM',
        status: 'completed',
        details: 'Hand-picked organic Alphonso mangoes at optimal maturity (Brix 14°). Farmer: Rajesh Patil (ID: MH-RTG-882).'
      },
      {
        stageIndex: 1,
        title: 'Batch Registration & QR Minting',
        location: 'Devgad Farmer Producer Org (FPO)',
        timestamp: '18 May 2024, 09:15 AM',
        status: 'completed',
        details: 'Digital batch token minted. Secure QR code generated for transporter and buyer verification.'
      },
      {
        stageIndex: 2,
        title: 'Initial Quality & Chemical Screening',
        location: 'APEDA Accredited Lab #4',
        timestamp: '18 May 2024, 11:45 AM',
        status: 'completed',
        details: 'Moisture content: 82%. Zero harmful pesticide residues. Grade A+ certification approved.'
      },
      {
        stageIndex: 3,
        title: 'Cold Storage & Pre-Cooling',
        location: 'Ratnagiri District Pre-Cooling Hub',
        timestamp: '18 May 2024, 02:00 PM',
        status: 'completed',
        details: 'Pre-cooled to 8.0°C over 4 hours. Palletized and sealed with tamper-evident digital tag #TG-9041.'
      },
      {
        stageIndex: 4,
        title: 'IoT-Monitored Transportation',
        location: 'NH66 Expressway (En route to Navi Mumbai)',
        timestamp: '18 May 2024, 05:00 PM',
        status: 'active',
        details: 'Reefer Truck MH-08-AG-4921 dispatched. Dual IoT sensors streaming GPS, Temp (7.8°C), and Humidity (86%).'
      },
      {
        stageIndex: 5,
        title: 'Real-time Analysis & Freshness AI',
        location: 'Cloud Inference Engine',
        timestamp: 'Continuous',
        status: 'active',
        details: 'AI Freshness index calculates 94% quality retention with predicted 11 days remaining shelf life.'
      },
      {
        stageIndex: 6,
        title: 'Anomaly & Alert Detection',
        location: 'Automated Cold-Chain Sentinel',
        timestamp: 'Continuous',
        status: 'active',
        details: 'Zero temperature breaches recorded during 148 km journey. Cold chain unbroken.'
      },
      {
        stageIndex: 7,
        title: 'Destination Terminal Arrival',
        location: 'Vashi APMC Cold Hub, Navi Mumbai',
        timestamp: 'Est. 19 May 2024, 01:30 AM',
        status: 'pending',
        details: 'Awaiting truck check-in at Bay 4 receiving ramp.'
      },
      {
        stageIndex: 8,
        title: 'Final Quality Check & Buyer Acceptance',
        location: 'FreshBazaar Receiving Warehouse',
        timestamp: 'Est. 19 May 2024, 02:15 AM',
        status: 'pending',
        details: 'Final pulp temperature test, barcode scan, and formal acceptance by Buyer.'
      }
    ]
  },

  'BATCH-TMT-1108': {
    id: 'BATCH-TMT-1108',
    product: 'Organic Roma Tomatoes',
    variety: 'Nashik Valley Select',
    category: 'Vegetables',
    quantity: '3,500 kg (220 Crates)',
    harvestDate: '2024-05-19',
    farmerName: 'Sunita Deshmukh',
    farmLocation: 'Dindori Agro Farm, Nashik, Maharashtra',
    farmCoords: [20.0, 73.83],
    destinationName: 'Pune Fresh Agro Wholesale Mart',
    destCoords: [18.5204, 73.8567],
    currentLocationName: 'Nashik Cold Aggregation Facility',
    currentCoords: [20.0, 73.83],
    route: [
      [20.0, 73.83],
      [19.6, 73.85],
      [19.1, 73.86],
      [18.5204, 73.8567]
    ],
    transporterName: 'Sahyadri Agro Fleet',
    transporterContact: '+91 97650 11984',
    vehicleNumber: 'MH-15-EC-3319',
    driverName: 'Kailash Jadhav',
    buyerName: 'Nature Basket Pune Ltd.',
    buyerLocation: 'Gultekdi Market Yard, Pune',
    currentStageIndex: 3, // Step 4: Cold Storage
    status: 'In Cold Storage',
    telemetry: {
      temperature: 11.2,
      tempUnit: '°C',
      tempRange: [10, 14],
      humidity: 89,
      humidityUnit: '% RH',
      humidityRange: [85, 95],
      freshnessScore: 98,
      spoilageRisk: 'Low',
      anomalyDetected: false,
      anomalyMessage: 'Stabilized in climate chamber #2.',
      lastUpdated: '10 mins ago',
      gpsSpeed: '0 km/h (Stationary)',
      batteryLevel: '99%'
    },
    timeline: [
      {
        stageIndex: 0,
        title: 'Farm Origin & Harvest',
        location: 'Dindori Agro Farm, Nashik',
        timestamp: '19 May 2024, 05:45 AM',
        status: 'completed',
        details: 'Harvested under organic farming standards. Farmer: Sunita Deshmukh.'
      },
      {
        stageIndex: 1,
        title: 'Batch Registration & QR Minting',
        location: 'Nashik Agri Mandi Portal',
        timestamp: '19 May 2024, 07:30 AM',
        status: 'completed',
        details: 'Batch created with digital QR identity. Destination set to Pune Fresh Agro.'
      },
      {
        stageIndex: 2,
        title: 'Initial Quality & Chemical Screening',
        location: 'Nashik Agro Inspection Center',
        timestamp: '19 May 2024, 09:00 AM',
        status: 'completed',
        details: 'Firmness: 4.8 kg/cm². Acid-sugar ratio optimal. Certified organic grade.'
      },
      {
        stageIndex: 3,
        title: 'Cold Storage & Pre-Cooling',
        location: 'Nashik Cold Aggregation Facility',
        timestamp: '19 May 2024, 10:15 AM',
        status: 'active',
        details: 'Stored in Chamber 2 at 11.2°C. Loading scheduled for 2:00 PM.'
      },
      {
        stageIndex: 4,
        title: 'IoT-Monitored Transportation',
        location: 'Nashik - Pune Highway',
        timestamp: 'Scheduled 19 May 2024, 02:00 PM',
        status: 'pending',
        details: 'Truck MH-15-EC-3319 assigned with active telemetry tag.'
      },
      {
        stageIndex: 5,
        title: 'Real-time Analysis & Freshness AI',
        location: 'Cloud Sentinel',
        timestamp: 'Scheduled',
        status: 'pending',
        details: 'Shelf-life tracking will engage upon departure.'
      },
      {
        stageIndex: 6,
        title: 'Anomaly & Alert Detection',
        location: 'Sensor Guardian',
        timestamp: 'Standby',
        status: 'pending',
        details: 'Alert thresholds configured for temperature > 14°C.'
      },
      {
        stageIndex: 7,
        title: 'Destination Terminal Arrival',
        location: 'Pune Fresh Agro Wholesale Mart',
        timestamp: 'Est. 19 May 2024, 07:30 PM',
        status: 'pending',
        details: 'Scheduled arrival at Gultekdi Market yard.'
      },
      {
        stageIndex: 8,
        title: 'Final Quality Check & Buyer Acceptance',
        location: 'Nature Basket Receiving Bay',
        timestamp: 'Est. 19 May 2024, 08:00 PM',
        status: 'pending',
        details: 'Pending delivery and inspection.'
      }
    ]
  },

  'BATCH-ORG-4022': {
    id: 'BATCH-ORG-4022',
    product: 'Nagpur Mandarin Oranges',
    variety: 'Export Grade Extra Sweet',
    category: 'Citrus',
    quantity: '5,000 kg (400 Boxes)',
    harvestDate: '2024-05-15',
    farmerName: 'Vikram Joshi',
    farmLocation: 'Katol Citrus Belt, Nagpur, Maharashtra',
    farmCoords: [21.26, 78.58],
    destinationName: 'Delhi Azadpur APMC Central Hub',
    destCoords: [28.71, 77.18],
    currentLocationName: 'Delhi Azadpur APMC Central Hub',
    currentCoords: [28.71, 77.18],
    route: [
      [21.26, 78.58],
      [23.18, 79.98],
      [25.44, 80.33],
      [26.85, 80.94],
      [28.71, 77.18]
    ],
    transporterName: 'North-South Express Logistics',
    transporterContact: '+91 99112 88390',
    vehicleNumber: 'DL-01-AX-9904',
    driverName: 'Manpreet Singh',
    buyerName: 'Northern Fruit Distributors Pvt Ltd',
    buyerLocation: 'Shed 12, Azadpur Mandi, Delhi',
    currentStageIndex: 8, // Step 9: Final Quality Check Completed!
    status: 'Delivered & Accepted',
    telemetry: {
      temperature: 6.2,
      tempUnit: '°C',
      tempRange: [4, 8],
      humidity: 88,
      humidityUnit: '% RH',
      humidityRange: [80, 90],
      freshnessScore: 92,
      spoilageRisk: 'Low',
      anomalyDetected: false,
      anomalyMessage: 'Full journey audited. Zero compliance violations.',
      lastUpdated: '1 hr ago',
      gpsSpeed: '0 km/h (Delivered)',
      batteryLevel: '100%'
    },
    timeline: [
      {
        stageIndex: 0,
        title: 'Farm Origin & Harvest',
        location: 'Katol Citrus Belt, Nagpur',
        timestamp: '15 May 2024, 07:00 AM',
        status: 'completed',
        details: 'Harvested from certified non-GMO orchards. Farmer: Vikram Joshi.'
      },
      {
        stageIndex: 1,
        title: 'Batch Registration & QR Minting',
        location: 'Nagpur APMC Digital Desk',
        timestamp: '15 May 2024, 10:00 AM',
        status: 'completed',
        details: 'QR assigned. Digital journey ledger initialized.'
      },
      {
        stageIndex: 2,
        title: 'Initial Quality & Chemical Screening',
        location: 'Maharashtra Agro Export Lab',
        timestamp: '15 May 2024, 01:00 PM',
        status: 'completed',
        details: 'Sugar Brix 12.8, acidity balanced. Passed Export Grade screening.'
      },
      {
        stageIndex: 3,
        title: 'Cold Storage & Pre-Cooling',
        location: 'Nagpur Central Cold Hub',
        timestamp: '15 May 2024, 04:00 PM',
        status: 'completed',
        details: 'Pre-cooled to 6.0°C and loaded into temperature-controlled reefer.'
      },
      {
        stageIndex: 4,
        title: 'IoT-Monitored Transportation',
        location: 'Nagpur to Delhi Transit Corridor (950 km)',
        timestamp: '16 May 2024 - 17 May 2024',
        status: 'completed',
        details: 'Transit via Reefer DL-01-AX-9904. Continuous telemetry logged 288 data points.'
      },
      {
        stageIndex: 5,
        title: 'Real-time Analysis & Freshness AI',
        location: 'AI Cold Sentinel',
        timestamp: '17 May 2024',
        status: 'completed',
        details: 'Maintained 92% freshness retention throughout the 950 km haul.'
      },
      {
        stageIndex: 6,
        title: 'Anomaly & Alert Detection',
        location: 'Telemetry Monitor',
        timestamp: '17 May 2024',
        status: 'completed',
        details: '0 thermal breaches. Sealed container integrity intact.'
      },
      {
        stageIndex: 7,
        title: 'Destination Terminal Arrival',
        location: 'Delhi Azadpur APMC Central Hub',
        timestamp: '18 May 2024, 04:30 AM',
        status: 'completed',
        details: 'Truck arrived at Azadpur Mandi. Unloading initiated.'
      },
      {
        stageIndex: 8,
        title: 'Final Quality Check & Buyer Acceptance',
        location: 'Northern Fruit Distributors Shed 12',
        timestamp: '18 May 2024, 06:15 AM',
        status: 'completed',
        details: 'Final receiving check PASSED. Freshness certified. Batch accepted by Buyer.'
      }
    ]
  }
}

const STORAGE_KEY = 'food_traceability_batches_v2'

export function getStoredBatches() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Error reading batches from storage:', e)
  }
  // Initialize with initial batches
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BATCHES))
  } catch (e) {}
  return { ...INITIAL_BATCHES }
}

export function saveStoredBatch(batch) {
  const all = getStoredBatches()
  all[batch.id] = batch
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch (e) {
    console.error('Error saving batch:', e)
  }
  return all
}

export function createNewBatch({
  product,
  variety,
  category = 'Produce',
  quantity,
  farmerName,
  farmLocation,
  destinationName,
  transporterName = 'Express Cold Transit',
  vehicleNumber = 'MH-12-TX-8800',
  buyerName = 'Regional Supermarket Hub',
  tempRange = [4, 10]
}) {
  const randNum = Math.floor(1000 + Math.random() * 9000)
  const id = `BATCH-${product.substring(0, 3).toUpperCase()}-${randNum}`
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  // Approximate default coordinates for farm & destination (Maharashtra / India corridor)
  const farmCoords = [17.5 + (Math.random() - 0.5) * 2, 73.5 + (Math.random() - 0.5) * 2]
  const destCoords = [19.0 + (Math.random() - 0.5) * 1.5, 73.0 + (Math.random() - 0.5) * 1.5]
  const route = [
    farmCoords,
    [farmCoords[0] + (destCoords[0] - farmCoords[0]) * 0.3, farmCoords[1] + (destCoords[1] - farmCoords[1]) * 0.3],
    [farmCoords[0] + (destCoords[0] - farmCoords[0]) * 0.7, farmCoords[1] + (destCoords[1] - farmCoords[1]) * 0.7],
    destCoords
  ]

  const newBatch = {
    id,
    product,
    variety: variety || 'Standard Certified',
    category,
    quantity: quantity || '1,000 kg',
    harvestDate: todayStr,
    farmerName: farmerName || 'Primary Producer',
    farmLocation: farmLocation || 'Regional Cooperative Farm',
    farmCoords,
    destinationName: destinationName || 'Central Agricultural Wholesale Market',
    destCoords,
    currentLocationName: farmLocation || 'Farm Origin Dispatch Yard',
    currentCoords: farmCoords,
    route,
    transporterName,
    transporterContact: '+91 98000 00000',
    vehicleNumber,
    driverName: 'Assigned Fleet Driver',
    buyerName,
    buyerLocation: destinationName,
    currentStageIndex: 1, // Step 2: Registered
    status: 'Registered & Ready',
    telemetry: {
      temperature: tempRange[0] + 1.5,
      tempUnit: '°C',
      tempRange,
      humidity: 85,
      humidityUnit: '% RH',
      humidityRange: [80, 95],
      freshnessScore: 99,
      spoilageRisk: 'Low',
      anomalyDetected: false,
      anomalyMessage: 'Initial registration verified. All parameters optimal.',
      lastUpdated: 'Just now',
      gpsSpeed: '0 km/h (At Farm)',
      batteryLevel: '100%'
    },
    timeline: [
      {
        stageIndex: 0,
        title: 'Farm Origin & Harvest',
        location: farmLocation,
        timestamp: `${todayStr}, ${timeStr}`,
        status: 'completed',
        details: `Harvest logged by farmer ${farmerName || 'Producer'}. Soil & organic compliance recorded.`
      },
      {
        stageIndex: 1,
        title: 'Batch Registration & QR Minting',
        location: farmLocation,
        timestamp: `${todayStr}, ${timeStr}`,
        status: 'completed',
        details: `Batch token ${id} generated. QR link ready to share with Transporter and Buyer.`
      },
      {
        stageIndex: 2,
        title: 'Initial Quality Check',
        location: 'Field Testing Unit',
        timestamp: 'Pending Dispatch',
        status: 'active',
        details: 'Initial moisture, grading, and safety screening underway.'
      },
      {
        stageIndex: 3,
        title: 'Cold Storage & Pre-Cooling',
        location: 'Designated Storage Depot',
        timestamp: 'Upcoming',
        status: 'pending',
        details: 'Pre-cooling chamber queued for shipment arrival.'
      },
      {
        stageIndex: 4,
        title: 'IoT-Monitored Transportation',
        location: `Vehicle ${vehicleNumber}`,
        timestamp: 'Upcoming',
        status: 'pending',
        details: `Assigned to ${transporterName}. Telemetry GPS sensor active.`
      },
      {
        stageIndex: 5,
        title: 'Real-time Analysis & Freshness AI',
        location: 'Analysis Engine',
        timestamp: 'Upcoming',
        status: 'pending',
        details: 'Continuous freshness score monitoring.'
      },
      {
        stageIndex: 6,
        title: 'Anomaly & Alert Detection',
        location: 'Sentinel Engine',
        timestamp: 'Upcoming',
        status: 'pending',
        details: 'Automatic alert on temperature breach or unscheduled delay.'
      },
      {
        stageIndex: 7,
        title: 'Destination Arrival',
        location: destinationName,
        timestamp: 'Upcoming',
        status: 'pending',
        details: 'Arrival verification at terminal receiving bay.'
      },
      {
        stageIndex: 8,
        title: 'Final Quality Check & Buyer Acceptance',
        location: destinationName,
        timestamp: 'Upcoming',
        status: 'pending',
        details: `Awaiting delivery confirmation and approval by ${buyerName}.`
      }
    ]
  }

  saveStoredBatch(newBatch)
  return newBatch
}

export function advanceBatchStage(batchId, targetStageIndex, note = '') {
  const all = getStoredBatches()
  const batch = all[batchId]
  if (!batch) return null

  const newStage = Math.min(Math.max(targetStageIndex, 0), JOURNEY_STAGES.length - 1)
  batch.currentStageIndex = newStage

  const now = new Date()
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  // Update timeline statuses
  batch.timeline = batch.timeline.map((item, idx) => {
    if (idx < newStage) {
      return { ...item, status: 'completed' }
    } else if (idx === newStage) {
      return {
        ...item,
        status: newStage === 8 ? 'completed' : 'active',
        timestamp: `Updated ${timeStr}`,
        details: note || item.details
      }
    } else {
      return { ...item, status: 'pending' }
    }
  })

  if (newStage >= 8) {
    batch.status = 'Delivered & Accepted'
    batch.currentLocationName = batch.destinationName
    batch.currentCoords = batch.destCoords
    batch.telemetry.gpsSpeed = '0 km/h (Delivered)'
  } else if (newStage >= 4) {
    batch.status = 'In Transit'
    // Move coordinates along the route
    const midIdx = Math.min(newStage - 3, batch.route.length - 1)
    batch.currentCoords = batch.route[midIdx]
    batch.currentLocationName = `Route Checkpoint: Milepost ${newStage * 25} km`
    batch.telemetry.gpsSpeed = '55 km/h'
  }

  saveStoredBatch(batch)
  return batch
}
