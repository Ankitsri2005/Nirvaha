import { ChevronRight } from 'lucide-react'

export default function RecentBatchesTable({ batches, selectedId, onSelectBatch }) {
  const batchList = Object.values(batches || {})

  const getEmoji = (name) => {
    const l = name.toLowerCase()
    if (l.includes('mango')) return '🥭'
    if (l.includes('tomato')) return '🍅'
    if (l.includes('orange')) return '🍊'
    return '📦'
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">📦</span>
          <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            RECENT BATCHES
          </h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
            {batchList.length}
          </span>
        </div>

        <span className="text-xs text-slate-400 font-medium">Click to inspect</span>
      </div>

      {/* Batches Rows */}
      <div className="mt-3 divide-y divide-slate-100">
        {batchList.map((batch, i) => {
          const isSelected = batch.id === selectedId
          const isAtRisk = batch.telemetry?.anomalyDetected
          const isDelivered = batch.status?.includes('Delivered')

          return (
            <div
              key={batch.id}
              onClick={() => onSelectBatch(batch.id)}
              className={`anim-fade-up group flex cursor-pointer flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl px-2.5 py-3 sm:px-3 sm:py-3.5 transition-all duration-200 ${
                isSelected
                  ? 'border border-emerald-200 bg-emerald-50/70 shadow-sm'
                  : 'border border-transparent hover:-translate-y-0.5 hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm'
              }`}
              style={{ '--d': `${i * 70}ms` }}
            >
              {/* Product Info */}
              <div className="flex items-center gap-3">
                <span className="anim-bounce-in text-2xl transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6 shrink-0">
                  {getEmoji(batch.product)}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{batch.id}</span>
                    <span className="text-xs font-semibold text-slate-700">{batch.product}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {batch.farmLocation.split(',')[0]} &rarr; {batch.destinationName.split(',')[0]}
                  </p>
                </div>
              </div>

              {/* Weight & Status Badges */}
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 text-xs w-full sm:w-auto pl-9 sm:pl-0">
                <span className="font-medium text-slate-600">{batch.quantity}</span>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    isAtRisk
                      ? 'border border-rose-200 bg-rose-50 text-rose-700'
                      : isDelivered
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border border-sky-200 bg-sky-50 text-sky-700'
                  }`}
                >
                  <span>{isAtRisk ? '⚠ At Risk' : isDelivered ? '📦 Delivered' : '🚚 In Transit'}</span>
                  <span className={isAtRisk ? 'anim-blink' : 'anim-pulse-dot'}>{isAtRisk ? '🔴' : '🟢'}</span>
                </span>

                <ChevronRight className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-emerald-600" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
