import { useState } from 'react'

export default function TemperatureChart({ currentTemp = 7.8, tempRange = [4, 10] }) {
  const [timeframe, setTimeframe] = useState('24h')

  // Hourly mock data points for the 24h temperature curve
  const points = [
    { time: '02:00', temp: 6.8 },
    { time: '06:00', temp: 7.2 },
    { time: '10:00', temp: 8.4 },
    { time: '14:00', temp: 9.1 },
    { time: '18:00', temp: 8.0 },
    { time: '22:00', temp: 7.8 }
  ]

  // SVG chart dimensions
  const width = 460
  const height = 150
  const padding = { top: 20, right: 30, bottom: 25, left: 40 }

  const minTemp = 2
  const maxTemp = 12

  const getY = (t) => {
    return height - padding.bottom - ((t - minTemp) / (maxTemp - minTemp)) * (height - padding.top - padding.bottom)
  }

  const getX = (index) => {
    return padding.left + (index / (points.length - 1)) * (width - padding.left - padding.right)
  }

  // Generate SVG path curve
  const pathD = points.reduce((acc, p, i) => {
    const x = getX(i)
    const y = getY(p.temp)
    if (i === 0) return `M ${x} ${y}`
    const prevX = getX(i - 1)
    const prevY = getY(points[i - 1].temp)
    const cx1 = prevX + (x - prevX) / 2
    const cx2 = prevX + (x - prevX) / 2
    return `${acc} C ${cx1} ${prevY}, ${cx2} ${y}, ${x} ${y}`
  }, '')

  // Area under the curve
  const areaD = `${pathD} L ${getX(points.length - 1)} ${getY(minTemp)} L ${getX(0)} ${getY(minTemp)} Z`

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="anim-float text-base">📈</span>
          <h3 className="text-sm font-bold text-slate-900">TEMPERATURE HISTORY</h3>
        </div>

        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none"
        >
          <option value="24h">24 Hours ▼</option>
          <option value="12h">12 Hours</option>
          <option value="7d">7 Days</option>
        </select>
      </div>

      {/* SVG Sparkline Area Chart */}
      <div className="anim-fade-in relative mt-3 w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full overflow-visible">
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Upper Safe Limit Line (10°C) */}
          <line
            x1={padding.left}
            y1={getY(tempRange[1])}
            x2={width - padding.right}
            y2={getY(tempRange[1])}
            stroke="#EF4444"
            strokeDasharray="4 4"
            strokeWidth="1.2"
            className="anim-fade-svg"
            style={{ '--d': '150ms' }}
          />
          <text x={padding.left - 5} y={getY(tempRange[1]) + 4} textAnchor="end" className="fill-slate-400 font-mono text-[10px]">
            {tempRange[1]}°C
          </text>
          <text
            x={width - padding.right}
            y={getY(tempRange[1]) - 5}
            textAnchor="end"
            className="anim-fade-svg fill-rose-500 text-[9px] font-semibold"
            style={{ '--d': '250ms' }}
          >
            Safe Max
          </text>

          {/* Lower Safe Limit Line (4°C) */}
          <line
            x1={padding.left}
            y1={getY(tempRange[0])}
            x2={width - padding.right}
            y2={getY(tempRange[0])}
            stroke="#3B82F6"
            strokeDasharray="4 4"
            strokeWidth="1.2"
            className="anim-fade-svg"
            style={{ '--d': '150ms' }}
          />
          <text x={padding.left - 5} y={getY(tempRange[0]) + 4} textAnchor="end" className="fill-slate-400 font-mono text-[10px]">
            {tempRange[0]}°C
          </text>

          {/* 8°C Baseline Line */}
          <line
            x1={padding.left}
            y1={getY(8)}
            x2={width - padding.right}
            y2={getY(8)}
            stroke="#E2E8F0"
            strokeWidth="1"
            className="anim-fade-svg"
            style={{ '--d': '100ms' }}
          />
          <text x={padding.left - 5} y={getY(8) + 4} textAnchor="end" className="fill-slate-400 font-mono text-[10px]">
            8°C
          </text>

          {/* Area fill */}
          <path d={areaD} fill="url(#tempGradient)" className="anim-fade-svg" style={{ '--d': '900ms' }} />

          {/* Temperature trend curve line */}
          <path
            d={pathD}
            fill="none"
            stroke="#059669"
            strokeWidth="2.5"
            strokeLinecap="round"
            pathLength="1"
            className="anim-draw-path"
            style={{ '--d': '300ms' }}
          />

          {/* Data Points */}
          {points.map((p, i) => {
            const isLast = i === points.length - 1
            return (
              <g key={i} className="anim-pop" style={{ '--d': `${900 + i * 130}ms` }}>
                {isLast && (
                  <circle
                    cx={getX(i)}
                    cy={getY(p.temp)}
                    r="5"
                    fill="#059669"
                    className="anim-pulse-ring origin-center"
                  />
                )}
                <circle
                  cx={getX(i)}
                  cy={getY(p.temp)}
                  r={isLast ? 5 : 3.5}
                  fill={isLast ? '#059669' : '#FFFFFF'}
                  stroke="#059669"
                  strokeWidth="2"
                  className="transition-all duration-200 hover:r-5"
                />
                <text
                  x={getX(i)}
                  y={height - 6}
                  textAnchor="middle"
                  className="fill-slate-400 text-[10px] font-medium"
                >
                  {p.time.split(':')[0]}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="anim-pulse-dot h-2 w-2 rounded-full bg-emerald-500" />
          <span>
            Current: <strong className="font-bold text-slate-800">{currentTemp}°C</strong> (Optimal Cold Chain)
          </span>
        </span>
        <span className="font-mono text-slate-400">Updated: Just now</span>
      </div>
    </div>
  )
}
