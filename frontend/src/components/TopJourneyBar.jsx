export default function TopJourneyBar({ currentStageIndex = 4, onSelectView, activeView = 'dashboard' }) {
  const stages = [
    { id: 'farm', label: 'FARM', icon: '🌱', view: 'timeline' },
    { id: 'batch', label: 'BATCH', icon: '📦', view: 'batches' },
    { id: 'transport', label: 'TRANSPORT', icon: '🚚', view: 'map' },
    { id: 'track', label: 'TRACK', icon: '🗺', view: 'map' },
    { id: 'condition', label: 'CONDITION', icon: '🌡', view: 'dashboard' },
    { id: 'destination', label: 'DESTINATION', icon: '🏭', view: 'timeline' }
  ]

  const pipelineProgressIndex = Math.min(Math.floor((currentStageIndex / 8) * (stages.length - 1)), stages.length - 1)

  return (
    <div className="anim-fade-down border-b border-slate-200 bg-white px-4 py-3 shadow-2xs sm:px-6" style={{ '--d': '90ms' }}>
      <div className="mx-auto max-w-7xl">
        {/* Pipeline Stage Bar */}
        <div className="overflow-x-auto pb-1.5 no-scrollbar">
          <div className="flex min-w-[540px] items-center justify-between px-1 sm:min-w-[620px] sm:px-4">
            {stages.map((stg, i) => {
              const isPast = i <= pipelineProgressIndex
              const isCurrent = i === pipelineProgressIndex
              return (
                <div
                  key={stg.label}
                  className="anim-fade-up flex flex-1 items-center last:flex-none"
                  style={{ '--d': `${140 + i * 70}ms` }}
                >
                  <button
                    onClick={() => onSelectView(stg.view)}
                    className="group flex cursor-pointer flex-col items-center focus:outline-none"
                    title={`View ${stg.label} section`}
                  >
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-700 transition-colors duration-200 group-hover:text-emerald-700">
                      <span className="transition-transform duration-300 group-hover:scale-125 group-hover:-translate-y-0.5">
                        {stg.icon}
                      </span>
                      <span>{stg.label}</span>
                    </span>
                    <div className="mt-1.5 flex items-center justify-center">
                      <span className="relative flex h-3.5 w-3.5">
                        {isCurrent && (
                          <span className="anim-pulse-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
                        )}
                        <span
                          className={`relative h-3.5 w-3.5 rounded-full border-2 transition-all duration-300 ${
                            isPast
                              ? 'scale-110 border-emerald-600 bg-emerald-600 shadow-xs ring-2 ring-emerald-100'
                              : 'border-slate-300 bg-white group-hover:scale-125 group-hover:border-slate-400'
                          }`}
                        />
                      </span>
                    </div>
                  </button>

                  {i < stages.length - 1 && (
                    <div className="mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`anim-grow-x h-full rounded-full ${
                          i < pipelineProgressIndex ? 'bg-emerald-600' : 'bg-transparent'
                        }`}
                        style={{ '--d': `${200 + i * 70}ms` }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Dedicated Section Tabs - swipeable pills on mobile */}
        <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-slate-100 px-0.5 pt-2 text-xs font-bold sm:mt-3 sm:flex-wrap sm:justify-center sm:gap-2 sm:pt-2.5">
          <button
            onClick={() => onSelectView('dashboard')}
            className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${
              activeView === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-200'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
            }`}
          >
            <span>🏠</span>
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onSelectView('timeline')}
            className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${
              activeView === 'timeline'
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-200'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
            }`}
          >
            <span>📜</span>
            <span>Traceability</span>
          </button>

          <button
            onClick={() => onSelectView('alerts')}
            className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${
              activeView === 'alerts'
                ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-200'
                : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
            }`}
          >
            <span>🚨</span>
            <span>Alerts</span>
            <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              activeView === 'alerts' ? 'bg-white text-rose-700' : 'bg-rose-100 text-rose-700'
            }`}>
              2
            </span>
          </button>

          <button
            onClick={() => onSelectView('hardware')}
            className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${
              activeView === 'hardware'
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-200'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <span>🔧</span>
            <span>IoT Hardware</span>
          </button>

          <button
            onClick={() => onSelectView('map')}
            className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${
              activeView === 'map'
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-200'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <span>🗺</span>
            <span>Live Map</span>
          </button>

          <button
            onClick={() => onSelectView('batches')}
            className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${
              activeView === 'batches'
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-200'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <span>📦</span>
            <span>Batches (12)</span>
          </button>
        </div>
      </div>
    </div>
  )
}
