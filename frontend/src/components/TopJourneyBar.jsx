export default function TopJourneyBar({ currentStageIndex = 4, onSelectView, activeView = 'dashboard' }) {
  const stages = [
    { id: 'farm', label: 'FARM', view: 'timeline' },
    { id: 'batch', label: 'BATCH', view: 'batches' },
    { id: 'transport', label: 'TRANSPORT', view: 'map' },
    { id: 'track', label: 'TRACK', view: 'map' },
    { id: 'condition', label: 'CONDITION', view: 'dashboard' },
    { id: 'destination', label: 'DESTINATION', view: 'timeline' }
  ]

  const pipelineProgressIndex = Math.min(Math.floor((currentStageIndex / 8) * (stages.length - 1)), stages.length - 1)

  return (
    <div className="anim-fade-down border-b border-line bg-paper px-4 py-3 shadow-2xs sm:px-6" style={{ '--d': '90ms' }}>
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
                    <span className="text-xs font-bold text-ink transition-colors duration-200 group-hover:text-plum">
                      <span>{stg.label}</span>
                    </span>
                    <div className="mt-1.5 flex items-center justify-center">
                      <span className="relative flex h-3.5 w-3.5">
                        {isCurrent && (
                          <span className="anim-pulse-ring absolute inline-flex h-full w-full rounded-full bg-plum" />
                        )}
                        <span
                          className={`relative h-3.5 w-3.5 rounded-full border-2 transition-all duration-300 ${
                            isPast
                              ? 'scale-110 border-plum bg-plum shadow-xs ring-2 ring-plum-tint'
                              : 'border-line-strong bg-paper group-hover:scale-125 group-hover:border-faint'
                          }`}
                        />
                      </span>
                    </div>
                  </button>

                  {i < stages.length - 1 && (
                    <div className="mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-sand">
                      <div
                        className={`anim-grow-x h-full rounded-full ${
                          i < pipelineProgressIndex ? 'bg-plum' : 'bg-transparent'
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
        <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-line px-0.5 pt-2 text-xs font-bold sm:mt-3 sm:flex-wrap sm:justify-center sm:gap-2 sm:pt-2.5">
          <button
            onClick={() => onSelectView('dashboard')}
            className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${
              activeView === 'dashboard'
                ? 'bg-plum text-white shadow-md ring-2 ring-plum-tint'
                : 'text-muted hover:text-plum hover:bg-blush'
            }`}
          >
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onSelectView('timeline')}
            className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${
              activeView === 'timeline'
                ? 'bg-plum text-white shadow-md ring-2 ring-plum-tint'
                : 'text-muted hover:text-plum hover:bg-blush'
            }`}
          >
            <span>Traceability</span>
          </button>

          <button
            onClick={() => onSelectView('alerts')}
            className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${
              activeView === 'alerts'
                ? 'bg-danger text-white shadow-md ring-2 ring-danger-tint'
                : 'text-muted hover:text-danger hover:bg-danger-tint'
            }`}
          >
            <span>Alerts</span>
            <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              activeView === 'alerts' ? 'bg-paper text-danger' : 'bg-danger-tint text-danger'
            }`}>
              2
            </span>
          </button>

          <button
            onClick={() => onSelectView('hardware')}
            className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${
              activeView === 'hardware'
                ? 'bg-plum text-white shadow-md ring-2 ring-plum-tint'
                : 'text-muted hover:text-plum hover:bg-blush'
            }`}
          >
            <span>IoT Hardware</span>
          </button>

          <button
            onClick={() => onSelectView('map')}
            className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${
              activeView === 'map'
                ? 'bg-plum text-white shadow-md ring-2 ring-plum-tint'
                : 'text-muted hover:text-plum hover:bg-blush'
            }`}
          >
            <span>Live Map</span>
          </button>

          <button
            onClick={() => onSelectView('batches')}
            className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${
              activeView === 'batches'
                ? 'bg-plum text-white shadow-md ring-2 ring-plum-tint'
                : 'text-muted hover:text-plum hover:bg-blush'
            }`}
          >
            <span>Batches (12)</span>
          </button>
        </div>
      </div>
    </div>
  )
}
