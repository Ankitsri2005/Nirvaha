import { useState } from 'react'
import { Truck, X, CheckCircle2 } from 'lucide-react'

export default function TransporterActionModal({ isOpen, onClose, batch, onUpdate }) {
  const [checkpointName, setCheckpointName] = useState('')
  const [currentTemp, setCurrentTemp] = useState(batch?.telemetry?.temperature || 7.5)
  const [advanceStage, setAdvanceStage] = useState(false)

  if (!isOpen || !batch) return null

  const handleSave = (e) => {
    e.preventDefault()

    const updatedBatch = { ...batch }
    updatedBatch.telemetry = {
      ...updatedBatch.telemetry,
      temperature: Number(currentTemp),
      lastUpdated: 'Just now'
    }

    if (checkpointName.trim()) {
      updatedBatch.currentLocationName = checkpointName.trim()
    }

    if (advanceStage && updatedBatch.currentStageIndex < 7) {
      updatedBatch.currentStageIndex = Math.min(updatedBatch.currentStageIndex + 1, 7)
    }

    onUpdate(updatedBatch)
    onClose()
  }

  return (
    <div className="anim-fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs">
      <div className="anim-pop relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-transit-tint text-transit">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Transporter Quick Log</h3>
            <p className="text-xs text-slate-500">Update transit checkpoint & container climate</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Current Location / Checkpoint
            </label>
            <input
              type="text"
              placeholder="e.g. Pune Highway Toll Plaza, Mile 180"
              value={checkpointName}
              onChange={(e) => setCheckpointName(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Reefer Cargo Temperature (°C)
            </label>
            <input
              type="number"
              step="0.1"
              value={currentTemp}
              onChange={(e) => setCurrentTemp(e.target.value)}
              className="w-full"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Optimal range for {batch.product}: {batch.telemetry?.tempRange?.[0]}°C - {batch.telemetry?.tempRange?.[1]}°C
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={advanceStage}
                onChange={(e) => setAdvanceStage(e.target.checked)}
                className="h-4 w-4 rounded border-line-strong text-plum focus:ring-plum"
              />
              <span className="text-xs font-medium text-slate-700">Advance shipment to next journey stage</span>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-plum py-2.5 text-xs font-bold text-white hover:bg-plum-dark transition-colors shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Record Update</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
