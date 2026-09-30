import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Truck } from 'lucide-react'

// Custom Modern Div Icons with Clean Agri-Light Palette
function createPinIcon(type) {
  let bgColor = '#4F7F5E'
  let borderColor = '#FFFFFF'
  let iconSvg = ''

  if (type === 'farm') {
    bgColor = '#4F7F5E' // farm origin - farmer accent
    iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a9 9 0 0 1 9 9c0 5-9 11-9 11S3 16 3 11a9 9 0 0 1 9-9z"></path>
        <circle cx="12" cy="11" r="3"></circle>
      </svg>`
  } else if (type === 'destination') {
    bgColor = '#4A2540' // destination market - plum
    iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
        <line x1="4" y1="22" x2="4" y2="15"></line>
      </svg>`
  } else {
    // Current live vehicle location with animated pulse
    iconSvg = `
      <div class="relative flex items-center justify-center">
        <span class="absolute inline-flex h-10 w-10 animate-ping rounded-full opacity-60" style="background:#7A6A4F"></span>
        <div class="relative flex h-8 w-8 items-center justify-center rounded-full shadow-md" style="background:#7A6A4F;box-shadow:0 0 0 2px #FFFFFF">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
        </div>
      </div>`
    return L.divIcon({
      className: 'live-vehicle-marker',
      html: iconSvg,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -22]
    })
  }

  const html = `
    <div style="
      background: ${bgColor};
      border: 2px solid ${borderColor};
      width: 32px;
      height: 32px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(74,37,64,0.18);
    ">
      ${iconSvg}
    </div>
  `

  return L.divIcon({
    className: 'custom-map-pin',
    html,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  })
}

// Controller to auto-fit map view to route bounds
function MapBoundsController({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (!coords || coords.length === 0) return
    try {
      const bounds = L.latLngBounds(coords)
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 })
    } catch (e) {
      console.warn('Could not fit bounds', e)
    }
  }, [map, coords])
  return null
}

export default function LiveMap({ batch }) {
  if (!batch) return null

  const farmCoords = batch.farmCoords || [18.5, 73.8]
  const destCoords = batch.destCoords || [19.0, 72.8]
  const currentCoords = batch.currentCoords || farmCoords
  const route = batch.route && batch.route.length > 0 ? batch.route : [farmCoords, currentCoords, destCoords]

  const allCoords = [farmCoords, destCoords, currentCoords]

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      {/* Map Header Status Bar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 bg-slate-50/70 px-3.5 py-3 sm:px-5 sm:py-3.5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-transit opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-transit"></span>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800">Where is My Order Currently?</h3>
              <span className="rounded-full bg-transit-tint px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-transit">
                Live GPS
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Current Location: <span className="font-semibold text-slate-700">{batch.currentLocationName || 'In Transit'}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-emerald-600 shrink-0"></span>
            <span className="truncate max-w-[120px] sm:max-w-none">Origin: {batch.farmLocation.split(',')[0]}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-plum shrink-0"></span>
            <span className="truncate max-w-[120px] sm:max-w-none">Dest: {batch.destinationName.split(',')[0]}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-line bg-paper px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs font-medium text-slate-700 shadow-xs">
            <Truck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-transit" />
            <span>{batch.telemetry?.gpsSpeed || '50 km/h'}</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[290px] sm:h-[380px] w-full bg-slate-100">
        <MapContainer
          center={currentCoords}
          zoom={8}
          scrollWheelZoom={false}
          className="h-full w-full z-0"
          attributionControl={false}
        >
          {/* Free OpenStreetMap tiles - No API key required, zero watermarks */}
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />

          <MapBoundsController coords={allCoords} />

          {/* Planned transit route line in plum */}
          <Polyline
            positions={route}
            pathOptions={{
              color: '#4A2540',
              weight: 4,
              opacity: 0.85,
              dashArray: '8, 8',
              lineCap: 'round'
            }}
          />

          {/* Farm Origin Marker */}
          <Marker position={farmCoords} icon={createPinIcon('farm')}>
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-fresh">Farm Origin</p>
                <p className="text-slate-800 font-semibold">{batch.farmLocation}</p>
                <p className="text-slate-600 mt-0.5">Farmer: {batch.farmerName}</p>
                <p className="text-slate-500">Harvest: {batch.harvestDate}</p>
              </div>
            </Popup>
          </Marker>

          {/* Destination Marker */}
          <Marker position={destCoords} icon={createPinIcon('destination')}>
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-plum">Destination Market</p>
                <p className="text-slate-800 font-semibold">{batch.destinationName}</p>
                <p className="text-slate-600 mt-0.5">Buyer: {batch.buyerName}</p>
              </div>
            </Popup>
          </Marker>

          {/* Current Live Vehicle Marker */}
          <Marker position={currentCoords} icon={createPinIcon('vehicle')}>
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-transit flex items-center gap-1">
                  Current Order Location
                </p>
                <p className="text-slate-900 font-bold">{batch.currentLocationName}</p>
                <div className="mt-1 border-t border-slate-100 pt-1 text-slate-600 space-y-0.5">
                  <p>Vehicle: <span className="font-semibold text-slate-800">{batch.vehicleNumber}</span></p>
                  <p>Temp: <span className="font-bold text-fresh">{batch.telemetry?.temperature}°C</span> (Optimal)</p>
                  <p>Speed: <span className="font-semibold text-slate-800">{batch.telemetry?.gpsSpeed}</span></p>
                  <p>Driver: {batch.driverName} ({batch.transporterContact})</p>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Floating Order Status Pill on Map */}
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-transit-tint text-transit">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Vehicle: {batch.vehicleNumber} ({batch.transporterName})
              </p>
              <p className="text-[11px] text-slate-500">
                {batch.currentLocationName} &bull; Sensor ping: {batch.telemetry?.lastUpdated || 'Live'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-md bg-fresh-tint border border-fresh-tint px-2.5 py-0.5 font-semibold text-fresh">
              Temp: {batch.telemetry?.temperature}°C
            </span>
            <span className="rounded-md bg-transit-tint border border-transit-tint px-2.5 py-0.5 font-semibold text-transit">
              Humidity: {batch.telemetry?.humidity}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
