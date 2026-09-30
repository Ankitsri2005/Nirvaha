import { useState } from 'react'
import { ArrowLeft, Search, QrCode, Map, CheckCircle, Truck, Building2, Sprout } from 'lucide-react'

export default function BatchesView({ batches, onSelectBatch, onBack, onOpenQR, onOpenMap }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const allBatches = Object.values(batches || {})

  const filtered = allBatches.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.product.toLowerCase().includes(search.toLowerCase()) ||
      b.farmLocation.toLowerCase().includes(search.toLowerCase())

    if (filter === 'all') return matchesSearch
    if (filter === 'transit') return matchesSearch && b.status.includes('Transit')
    if (filter === 'storage') return matchesSearch && b.status.includes('Storage')
    if (filter === 'delivered') return matchesSearch && b.status.includes('Delivered')
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header with Back button */}
      <div className="anim-fade-down flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="press flex items-center gap-1.5 rounded-xl border border-line bg-paper px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:-translate-y-0.5 hover:border-line-strong hover:text-plum hover:shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span>Food Batches &amp; Inventory Directory</span>
              <span className="anim-pop rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                {allBatches.length} Batches
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Manage, monitor, and inspect digital batch records across your supply chain
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="anim-fade-in flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1" style={{ '--d': '120ms' }}>
          {['all', 'transit', 'storage', 'delivered'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1 text-xs font-bold capitalize transition-all duration-200 hover:-translate-y-0.5 ${
                filter === f
                  ? 'bg-plum text-white shadow-md ring-2 ring-plum-tint'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {f === 'all' ? 'All Batches' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="anim-fade-up relative max-w-md" style={{ '--d': '100ms' }}>
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by product, batch ID, or farm origin..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 py-2 text-xs"
        />
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((batch, i) => (
          <div
            key={batch.id}
            className="sheen hover-lift anim-bounce-in flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-line-strong"
            style={{ '--d': `${i * 90}ms` }}
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-500 block">{batch.id}</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{batch.product}</h3>
                  <p className="text-xs text-slate-500 font-medium">{batch.variety}</p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    batch.status.includes('Delivered')
                      ? 'bg-fresh-tint text-fresh border border-fresh-tint'
                      : batch.status.includes('Transit')
                      ? 'bg-transit-tint text-transit border border-transit-tint'
                      : 'bg-warn-tint text-warn border border-warn-tint'
                  }`}
                >
                  {batch.status}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Quantity:</span>
                  <span className="font-semibold text-slate-800">{batch.quantity}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Origin:</span>
                  <span className="font-semibold text-slate-800">{batch.farmLocation.split(',')[0]}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Destination:</span>
                  <span className="font-semibold text-slate-800">{batch.destinationName.split(',')[0]}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Temperature:</span>
                  <span className="font-bold text-plum">{batch.telemetry?.temperature}°C</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  onSelectBatch(batch.id)
                  onOpenQR(batch)
                }}
                className="press flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-plum"
              >
                <QrCode className="h-3.5 w-3.5 text-plum" />
                <span>Show QR</span>
              </button>

              <button
                onClick={() => {
                  onSelectBatch(batch.id)
                  onOpenMap()
                }}
                className="press flex items-center gap-1 rounded-lg bg-plum px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:-translate-y-0.5 hover:bg-plum-dark hover:shadow-md"
              >
                <Map className="h-3.5 w-3.5" />
                <span>Track on Map</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
