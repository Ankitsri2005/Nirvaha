import { Truck, MapPin, ExternalLink } from 'lucide-react'

export default function CurrentShipmentCard({ batch, onOpenMap }) {
  if (!batch) return null

  // Calculate percentage along route based on currentStageIndex (0-8)
  const percentComplete = Math.min(Math.round(((batch.currentStageIndex + 1) / 9) * 100), 100)

  const originName = batch.farmLocation ? batch.farmLocation.split(',')[1] || batch.farmLocation.split(',')[0] : 'Origin'
  const destName = batch.destinationName ? batch.destinationName.split(',')[1] || batch.destinationName.split(',')[0] : 'Destination'

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              CURRENT SHIPMENT
            </h3>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-transit-tint bg-transit-tint px-2.5 py-0.5 text-xs font-bold text-transit">
            <span className="relative flex h-2 w-2">
              <span className="anim-pulse-ring absolute inline-flex h-full w-full rounded-full bg-transit" />
              <span className="anim-pulse-dot relative inline-flex h-2 w-2 rounded-full bg-transit" />
            </span>
            {batch.status || 'IN TRANSIT'}
          </span>
        </div>

        {/* Product & Batch ID */}
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <div>
              <h2 className="text-lg font-bold leading-tight text-slate-900">{batch.product}</h2>
              <p className="font-mono text-xs font-semibold text-slate-500">{batch.id}</p>
            </div>
          </div>
        </div>

        {/* Route Progress Visual Bar */}
        <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              {originName.trim()}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-transit" />
              {destName.trim()}
            </span>
          </div>

          {/* Slider bar with truck */}
          <div className="relative my-3 h-2.5 w-full rounded-full bg-slate-200">
            <div
              className="anim-grow-x h-full rounded-full bg-gradient-to-r from-plum to-rose"
              style={{ width: `${percentComplete}%`, '--d': '150ms' }}
            />
            {/* Truck Icon on slider */}
            <div
              className="anim-float absolute -top-3 -ml-3.5 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md transition-all duration-700"
              style={{ left: `${Math.min(Math.max(percentComplete, 6), 94)}%` }}
            >
              <Truck className="h-4 w-4 text-plum" />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="font-bold text-plum">{percentComplete}% JOURNEY COMPLETE</span>
            <span className="font-medium text-slate-500">{batch.currentLocationName || 'On Route'}</span>
          </div>
        </div>
      </div>

      {/* Button to view Live Map */}
      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-3">
        <div className="text-xs text-slate-500">
          Vehicle: <strong className="font-bold text-slate-800">{batch.vehicleNumber}</strong>
        </div>

        <button
          onClick={onOpenMap}
          className="press inline-flex items-center justify-center gap-1.5 rounded-xl bg-plum px-4 py-2 text-xs font-bold text-white shadow-xs hover:-translate-y-0.5 hover:bg-plum-dark hover:shadow-lg w-full sm:w-auto"
        >
          <span>View Live Tracking</span>
          <span className="transition-transform duration-200">→</span>
        </button>
      </div>
    </div>
  )
}
