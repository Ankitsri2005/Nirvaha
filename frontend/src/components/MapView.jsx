import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Layers, Moon, Sun, Maximize2, Crosshair } from 'lucide-react'
import { cx } from '../lib/format'
import { C } from '../lib/palette'

const TILES = {
  dark: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: '&copy; Esri &mdash; Satellite' },
  light: { url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenStreetMap contributors' },
}

/**
 * Smooths the marker toward the authoritative position on a rAF loop. The
 * context only ticks every 2 s, so without this the truck would jump.
 */
function useSmoothed([lat, lng], speed = 0.055) {
  const [pos, setPos] = useState([lat, lng])
  const target = useRef([lat, lng])
  const current = useRef([lat, lng])
  const raf = useRef(0)

  useEffect(() => {
    target.current = [lat, lng]
  }, [lat, lng])

  useEffect(() => {
    const loop = () => {
      const [tLat, tLng] = target.current
      const [cLat, cLng] = current.current
      const dLat = tLat - cLat
      const dLng = tLng - cLng
      if (Math.abs(dLat) > 1e-7 || Math.abs(dLng) > 1e-7) {
        const nLat = cLat + dLat * speed
        const nLng = cLng + dLng * speed
        current.current = [nLat, nLng]
        setPos([nLat, nLng])
      }
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf.current)
  }, [speed])

  return pos
}

/** Keeps the whole route in view whenever the shipment changes. */
function FitRoute({ points, trigger }) {
  const map = useMap()
  useEffect(() => {
    if (!points?.length) return
    map.fitBounds(L.latLngBounds(points), { padding: [46, 46], animate: true, duration: 0.9 })
  }, [map, points, trigger])
  return null
}

/** Pans only when the truck actually leaves the viewport, so manual panning sticks. */
function Recenter({ position, enabled }) {
  const map = useMap()
  useEffect(() => {
    if (!enabled || !position) return
    if (map.getBounds().contains(position)) return
    map.panTo(position, { animate: true, duration: 1.2 })
  }, [map, position, enabled])
  return null
}

const truckIcon = (color, heading, breached) => {
  const deg = heading ?? 0
  return L.divIcon({
    className: 'truck-marker',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    html: `
      <div style="position:relative;width:38px;height:38px;display:grid;place-items:center">
        ${breached ? `<span style="position:absolute;inset:4px;border-radius:999px;background:${color};opacity:.55;animation:truckpulse 1.8s cubic-bezier(.2,.6,.3,1) infinite"></span>` : ''}
        <div style="width:15px;height:15px;border-radius:999px;background:${color};box-shadow:0 0 0 2px #05080D,0 0 18px 3px ${color}aa;transition:background .3s"></div>
        <div style="position:absolute;inset:0;display:grid;place-items:center;transform:rotate(${deg}deg)">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" style="filter:drop-shadow(0 0 5px ${color}99)">
            <path d="M12 3.4 L16.2 19 L12 16.1 L7.8 19 Z" fill="${color}" fill-opacity="0.28" stroke="${color}" stroke-width="1.3" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>`,
  })
}

const waypointIcon = (color, done) =>
  L.divIcon({
    className: 'gps-marker',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    html: `<div style="width:16px;height:16px;border-radius:999px;background:#0B131C;border:2px solid ${color};box-shadow:0 0 0 3px #0B131C,0 0 12px 1px ${color}66;display:grid;place-items:center">
      <div style="width:5px;height:5px;border-radius:999px;background:${done ? color : 'transparent'};transition:background .4s"></div>
    </div>`,
  })

export default function MapView({
  shipment,
  device,
  gps = [],
  alerts = [],
  height = 460,
  className = '',
  showLegend = true,
  follow = true,
  dark = true,
}) {
  const [theme, setTheme] = useState(dark ? 'dark' : 'light')
  const [fitTick, setFitTick] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [followOn, setFollowOn] = useState(follow)
  const wrap = useRef(null)

  const path = shipment?.path || []
  const routePts = useMemo(() => path.map(([a, b]) => [a, b]), [path])
  const raw = shipment?.position || [0, 0]
  const position = useSmoothed(raw)
  const breached = shipment?.status === 'breach'
  const truckColor = breached ? C.crit : shipment?.status === 'delivered' ? C.safe : C.glacier

  const travelled = useMemo(
    () => gps.filter((g) => g.shipmentId === shipment?.id).map((g) => [g.lat, g.lng]),
    [gps, shipment?.id],
  )

  const alertPins = alerts.filter((a) => !a.resolved && a.deviceId === device?.id).slice(0, 3)

  const doneWp = new Set()
  if (shipment?.waypoints) {
    const wpCount = shipment.waypoints.length
    shipment.waypoints.forEach((w, i) => {
      if (shipment.progress >= i / (wpCount - 1 || 1)) doneWp.add(w.key)
    })
  }

  return (
    <div
      ref={wrap}
      className={cx(
        'panel relative overflow-hidden',
        fullscreen && 'fixed inset-4 z-[70] shadow-panel',
        className,
      )}
      style={{ height: fullscreen ? undefined : height }}
    >
      <MapContainer
        center={routePts[0] || [19.5, 74.2]}
        zoom={8}
        scrollWheelZoom
        className="h-full w-full"
        style={{ height: '100%' }}
      >
        <TileLayer url={TILES[theme].url} attribution={TILES[theme].attribution} />

        {/* full planned route */}
        <Polyline
          positions={routePts}
          pathOptions={{ color: breached ? C.crit : C.rimBright, weight: 2.5, opacity: 0.55, dashArray: '6 7' }}
        />
        {/* travelled track */}
        {travelled.length > 1 && (
          <>
            <Polyline positions={travelled} pathOptions={{ color: truckColor, weight: 5.5, opacity: 0.14, lineCap: 'round' }} />
            <Polyline positions={travelled} pathOptions={{ color: truckColor, weight: 2, opacity: 0.95, lineCap: 'round' }} />
          </>
        )}

        {/* waypoints */}
        {shipment?.waypoints?.map((w) => {
          const done = doneWp.has(w.key)
          return (
            <Marker key={w.key} position={w.ll} icon={waypointIcon(done ? C.safe : C.faint, done)}>
              <Popup>
                <p className="font-semibold text-cream">{w.label}</p>
                <p className="text-cream-faint">{w.place}</p>
                <p className="mt-1 text-[10.5px] text-thermal-safe">
                  {done ? 'Waypoint cleared' : 'Ahead on route'}
                </p>
              </Popup>
            </Marker>
          )
        })}

        {/* alert pins near the device */}
        {alertPins.map((a) => (
          <CircleMarker
            key={a.id}
            center={position}
            radius={16 + a.occurrences}
            pathOptions={{
              color: a.severity === 'critical' ? C.crit : C.warm,
              weight: 1.2,
              opacity: 0.5,
              fillOpacity: 0.08,
              dashArray: '3 4',
            }}
          />
        ))}

        {/* the truck */}
        <Marker position={position} icon={truckIcon(truckColor, shipment?.heading, breached)} zIndexOffset={1000}>
          <Popup>
            <p className="font-semibold text-cream">{shipment?.id}</p>
            <p className="text-cream-faint">{shipment?.vehicle}</p>
            <p className="mono mt-1 text-[11px] text-glacier-300">
              {position[0].toFixed(4)}, {position[1].toFixed(4)}
            </p>
          </Popup>
        </Marker>

        <FitRoute points={routePts} trigger={fitTick} />
        <Recenter position={position} enabled={follow} />
      </MapContainer>

      {/* status ribbon */}
      <div className="pointer-events-none absolute left-3 top-3 z-[400] flex flex-wrap items-center gap-2">
        <span
          className={cx(
            'chip border backdrop-blur-md',
            breached
              ? 'animate-flashcrit border-thermal-crit/60 bg-thermal-crit/15 text-thermal-crit'
              : shipment?.status === 'delivered'
                ? 'border-thermal-safe/50 bg-thermal-safe/12 text-thermal-safe'
                : 'border-glacier-500/45 bg-abyss-900/80 text-glacier-300',
          )}
        >
          <span className="relative flex h-1.5 w-1.5">
            {!['delivered'].includes(shipment?.status) && (
              <span className={cx('absolute inline-flex h-full w-full rounded-full opacity-70 animate-pulsering', breached ? 'bg-thermal-crit' : 'bg-glacier-400')} />
            )}
            <span
              className={cx(
                'relative inline-flex h-1.5 w-1.5 rounded-full',
                breached ? 'bg-thermal-crit animate-pulsedot' : 'bg-glacier-400 animate-pulsedot',
              )}
            />
          </span>
          {shipment?.id} · {breached ? 'cold-chain breach' : shipment?.status?.replace('_', ' ')}
        </span>
        {device && (
          <span className="chip border-rim bg-abyss-900/80 text-cream-dim backdrop-blur-md">{device.name}</span>
        )}
      </div>

      {/* controls */}
      <div className="absolute right-3 top-3 z-[400] flex flex-col gap-1.5">
        <button
          onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          className="btn-icon backdrop-blur-md"
          title="Toggle map theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button onClick={() => setFitTick((n) => n + 1)} className="btn-icon backdrop-blur-md" title="Fit route">
          <Layers size={15} />
        </button>
        <button
          onClick={() => setFollowOn((v) => !v)}
          className={cx('btn-icon backdrop-blur-md', followOn && 'border-glacier-500/60 text-glacier-300')}
          title={followOn ? 'Following vehicle' : 'Follow vehicle'}
        >
          <Crosshair size={15} />
        </button>
        <button
          onClick={() => setFullscreen((f) => !f)}
          className="btn-icon backdrop-blur-md"
          title="Toggle fullscreen"
        >
          <Maximize2 size={15} />
        </button>
      </div>

      {/* legend */}
      {showLegend && (
        <div className="absolute bottom-3 left-3 z-[400] flex flex-wrap items-center gap-x-3.5 gap-y-1.5 rounded-xl border border-rim-soft bg-abyss-900/85 px-3 py-2 backdrop-blur-md">
          {[
            ['Travelled', C.glacier],
            ['Planned route', C.rimBright],
            ['Waypoint cleared', C.safe],
            ['Alert radius', C.crit],
          ].map(([label, color]) => (
            <span key={label} className="flex items-center gap-1.5 text-[10px] font-semibold text-cream-faint">
              <span className="h-[3px] w-4 rounded-full" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
