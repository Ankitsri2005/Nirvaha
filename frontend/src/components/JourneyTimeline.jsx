import { useState } from 'react'
import {
  Sprout,
  FileText,
  CheckCircle2,
  Warehouse,
  Truck,
  Cpu,
  ShieldAlert,
  MapPin,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { JOURNEY_STAGES } from '../data/batches'

const STAGE_ICONS = {
  Sprout,
  FileText,
  CheckCircle2,
  Warehouse,
  Truck,
  Cpu,
  ShieldAlert,
  MapPin,
  Award
}

export default function JourneyTimeline({ batch }) {
  const [expandedIndex, setExpandedIndex] = useState(batch?.currentStageIndex ?? 4)

  if (!batch || !batch.timeline) return null

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Farm-to-Fork Traceability Journey</h3>
            <span className="anim-pop rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              9-Stage Chain
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Immutable timeline tracking from harvest to buyer final quality approval
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Progress:</span>
          <span className="font-bold text-emerald-700">
            {batch.currentStageIndex + 1} of {JOURNEY_STAGES.length} Stages
          </span>
          <div className="h-2.5 w-28 overflow-hidden rounded-full border border-slate-200/60 bg-slate-100">
            <div
              className="anim-grow-x h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"
              style={{
                width: `${((batch.currentStageIndex + 1) / JOURNEY_STAGES.length) * 100}%`,
                '--d': '250ms',
              }}
            />
          </div>
        </div>
      </div>

      {/* Horizontal Step Summary Bar */}
      <div className="mt-5 mb-6 hidden overflow-x-auto pb-2 md:block">
        <div className="flex items-center justify-between min-w-[700px] px-2">
          {JOURNEY_STAGES.map((stg, i) => {
            const isCompleted = i < batch.currentStageIndex || (i === 8 && batch.currentStageIndex === 8)
            const isActive = i === batch.currentStageIndex && batch.currentStageIndex !== 8
            const IconComponent = STAGE_ICONS[stg.icon] || FileText

            return (
              <div
                key={stg.id}
                className="anim-bounce-in flex flex-1 items-center last:flex-none"
                style={{ '--d': `${100 + i * 80}ms` }}
              >
                <button
                  onClick={() => setExpandedIndex(i)}
                  className="group relative flex flex-col items-center focus:outline-none"
                  title={stg.label}
                >
                  <div className="relative">
                    {isActive && (
                      <span className="anim-pulse-ring absolute inset-0 rounded-xl border-2 border-emerald-400" />
                    )}
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 ${
                        isCompleted
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : isActive
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-md ring-4 ring-emerald-100'
                          : 'border-slate-200 bg-slate-50 text-slate-400 group-hover:border-slate-300 group-hover:text-slate-600'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>
                  </div>
                  <span
                    className={`mt-1.5 max-w-[75px] truncate text-center text-[10px] font-semibold ${
                      isActive ? 'text-emerald-700' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {stg.label}
                  </span>
                </button>
                {i < JOURNEY_STAGES.length - 1 && (
                  <div className="mx-1 h-0.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`anim-grow-x h-full rounded-full ${
                        i < batch.currentStageIndex ? 'bg-emerald-500' : 'bg-transparent'
                      }`}
                      style={{ '--d': `${180 + i * 80}ms` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Vertical Detailed Steps */}
      <div className="space-y-3">
        {batch.timeline.map((step, idx) => {
          const stageConfig = JOURNEY_STAGES[idx] || { label: step.title, icon: 'FileText' }
          const isCompleted = step.status === 'completed'
          const isActive = step.status === 'active'
          const isExpanded = expandedIndex === idx

          return (
            <div
              key={idx}
              className={`anim-fade-up hover-lift rounded-xl border transition-all ${
                isActive
                  ? 'border-emerald-300 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-200'
                  : isCompleted
                  ? 'border-slate-200/80 bg-white hover:border-slate-300'
                  : 'border-slate-100 bg-slate-50/50 opacity-75'
              }`}
              style={{ '--d': `${idx * 70}ms` }}
            >
              <button
                type="button"
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="flex w-full items-center justify-between p-3.5 text-left focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  {/* Step Number & Icon */}
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold ${
                      isCompleted
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : isActive
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{stageConfig.label}</span>
                      {isActive && (
                        <span className="anim-pulse-dot inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Current Stage
                        </span>
                      )}
                      {isCompleted && (
                        <span className="rounded-md bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {step.location || stageConfig.shortDesc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] font-medium text-slate-500 block">{step.timestamp}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Collapsible Details */}
              {isExpanded && (
                <div className="anim-zoom-in border-t border-slate-100 bg-slate-50/70 p-4 pt-3 text-xs">
                  <div className="rounded-lg border border-slate-200 bg-white p-3 text-slate-700 leading-relaxed shadow-xs">
                    <p className="font-bold text-slate-900 mb-1">{step.title}</p>
                    <p>{step.details}</p>
                  </div>

                  {/* Stage-specific contextual data */}
                  {idx === 0 && (
                    <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px]">
                      <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                        <span className="text-slate-500 block">Harvest Date:</span>
                        <span className="font-bold text-slate-800">{batch.harvestDate}</span>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                        <span className="text-slate-500 block">Registered Farmer:</span>
                        <span className="font-bold text-slate-800">{batch.farmerName}</span>
                      </div>
                    </div>
                  )}

                  {idx === 4 && (
                    <div className="mt-2.5 grid grid-cols-3 gap-2 text-[11px]">
                      <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                        <span className="text-slate-500 block">Reefer Vehicle:</span>
                        <span className="font-bold text-slate-800">{batch.vehicleNumber}</span>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                        <span className="text-slate-500 block">Transporter:</span>
                        <span className="font-bold text-slate-800">{batch.transporterName}</span>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                        <span className="text-slate-500 block">Temperature:</span>
                        <span className="font-bold text-emerald-700">{batch.telemetry.temperature}°C</span>
                      </div>
                    </div>
                  )}

                  {idx === 5 && (
                    <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px]">
                      <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                        <span className="text-slate-500 block">Freshness Score:</span>
                        <span className="font-bold text-emerald-700">{batch.telemetry.freshnessScore}% (Optimal)</span>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                        <span className="text-slate-500 block">Predicted Shelf Life:</span>
                        <span className="font-bold text-slate-800">10 - 12 Days Remaining</span>
                      </div>
                    </div>
                  )}

                  {idx === 6 && (
                    <div className="mt-2.5 rounded-lg border border-slate-200 bg-white p-2.5 text-[11px]">
                      <span className="text-slate-500 block">Cold Chain Integrity Check:</span>
                      <span className="font-bold text-emerald-700">
                        {batch.telemetry.anomalyDetected ? 'Alert: Thermal anomaly flagged' : 'Zero Breaches Detected. Safe status.'}
                      </span>
                    </div>
                  )}

                  {idx === 8 && (
                    <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px]">
                      <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                        <span className="text-slate-500 block">Receiving Buyer:</span>
                        <span className="font-bold text-slate-800">{batch.buyerName}</span>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                        <span className="text-slate-500 block">Inspection Status:</span>
                        <span className={`font-bold ${step.status === 'completed' ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {step.status === 'completed' ? 'Accepted & Verified' : 'Awaiting Final Inspection'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
