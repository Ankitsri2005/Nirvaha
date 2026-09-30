import { useState } from 'react'
import { Award, X, CheckCircle2 } from 'lucide-react'
import { advanceBatchStage } from '../data/batches'

export default function BuyerActionModal({ isOpen, onClose, batch, onUpdate }) {
  const [grade, setGrade] = useState('Grade A+ Approved')
  const [inspectorNotes, setInspectorNotes] = useState('Pulp firmness optimal. Visual appearance fresh. Seal intact.')
  const [decision, setDecision] = useState('accept')

  if (!isOpen || !batch) return null

  const handleCompleteCheck = (e) => {
    e.preventDefault()

    const note = `${decision === 'accept' ? 'APPROVED & ACCEPTED' : 'CONDITIONALLY ACCEPTED'}: ${grade}. Notes: ${inspectorNotes}`
    const updated = advanceBatchStage(batch.id, 8, note)

    if (updated) {
      onUpdate(updated)
    }
    onClose()
  }

  return (
    <div className="anim-fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="anim-pop relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-tint text-rose-dark">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Buyer Final Quality Check</h3>
            <p className="text-xs text-slate-500">Step 9 of 9: Receiving inspection & digital acceptance</p>
          </div>
        </div>

        <form onSubmit={handleCompleteCheck} className="mt-5 space-y-4">
          {/* Provenance summary */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs space-y-1">
            <p className="text-slate-600">
              Batch: <span className="font-mono text-slate-900 font-bold">{batch.id}</span>
            </p>
            <p className="text-slate-600">
              Product: <span className="font-semibold text-slate-900">{batch.product} ({batch.quantity})</span>
            </p>
            <p className="text-slate-600">
              Origin Farm: <span className="text-slate-900">{batch.farmLocation}</span>
            </p>
            <p className="text-fresh font-bold mt-1">
              IoT Freshness: {batch.telemetry?.freshnessScore}% &bull; Avg Temp: {batch.telemetry?.temperature}°C
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Quality Assessment Rating
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full"
            >
              <option value="Grade A+ Approved (Export Premium)">Grade A+ Approved (Export Premium)</option>
              <option value="Grade A Approved (Standard Retail)">Grade A Approved (Standard Retail)</option>
              <option value="Grade B (Commercial Processing)">Grade B (Commercial Processing)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Receiving Inspector Remarks
            </label>
            <textarea
              rows={3}
              value={inspectorNotes}
              onChange={(e) => setInspectorNotes(e.target.value)}
              className="w-full text-xs"
              placeholder="Enter quality evaluation remarks..."
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-plum py-2.5 text-xs font-bold text-white hover:bg-plum-dark transition-all shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Sign & Complete Final Quality Check</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
