import { Thermometer, Droplets, Battery, Lock, Radio } from 'lucide-react'

export default function ConditionCard({ telemetry }) {
  if (!telemetry) return null

  const {
    temperature = 7.8,
    tempRange = [4, 10],
    humidity = 86,
    humidityRange = [80, 95],
    batteryLevel = '94%'
  } = telemetry

  const isTempSafe = temperature >= tempRange[0] && temperature <= tempRange[1]
  const isHumiditySafe = humidity >= humidityRange[0] && humidity <= humidityRange[1]

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            CONDITION
          </h3>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-fresh-tint bg-fresh-tint px-2 py-0.5 text-[11px] font-semibold text-fresh">
          <span className="anim-pulse-dot h-1.5 w-1.5 rounded-full bg-fresh" />
          Live Telemetry
        </span>
      </div>

      <div className="mt-4 space-y-3.5">
        {/* Temperature */}
        <div
          className="hover-lift anim-fade-up flex items-center justify-between rounded-lg border-b border-slate-100 pb-2.5"
          style={{ '--d': '60ms' }}
        >
          <div>
            <span className="block text-xs font-semibold text-slate-500">Temperature</span>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="anim-pop inline-block text-xl font-extrabold text-slate-900">
                {temperature}°C
              </span>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
              isTempSafe
                ? 'border border-fresh-tint bg-fresh-tint text-fresh'
                : 'border border-danger-tint bg-danger-tint text-danger'
            }`}
          >
            <span
              className={`anim-pulse-dot h-2 w-2 rounded-full ${
                isTempSafe ? 'bg-fresh' : 'bg-danger'
              }`}
            />
            {isTempSafe ? 'Optimal' : 'Breach'}
          </span>
        </div>

        {/* Humidity */}
        <div
          className="hover-lift anim-fade-up flex items-center justify-between rounded-lg border-b border-slate-100 pb-2.5"
          style={{ '--d': '120ms' }}
        >
          <div>
            <span className="block text-xs font-semibold text-slate-500">Humidity</span>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="anim-pop inline-block text-xl font-extrabold text-slate-900">
                {humidity}%
              </span>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
              isHumiditySafe
                ? 'border border-fresh-tint bg-fresh-tint text-fresh'
                : 'border border-warn-tint bg-warn-tint text-warn'
            }`}
          >
            <span className="anim-pulse-dot h-2 w-2 rounded-full bg-fresh" />
            Optimal
          </span>
        </div>

        {/* Battery */}
        <div
          className="hover-lift anim-fade-up flex items-center justify-between rounded-lg border-b border-slate-100 pb-2.5"
          style={{ '--d': '180ms' }}
        >
          <div>
            <span className="block text-xs font-semibold text-slate-500">Battery</span>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="anim-pop inline-block text-xl font-extrabold text-slate-900">
                {batteryLevel}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-fresh-tint bg-fresh-tint px-2 py-0.5 text-xs font-bold text-fresh">
            <span className="anim-pulse-dot h-2 w-2 rounded-full bg-fresh" />
            Charged
          </span>
        </div>

        {/* Door & GPS Status Row */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
          <div
            className="hover-lift anim-fade-up flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2"
            style={{ '--d': '240ms' }}
          >
            <span className="text-slate-500">Door</span>
            <span className="flex items-center gap-1 font-bold text-fresh">
              <Lock className="h-3 w-3" /> Secure
            </span>
          </div>

          <div
            className="hover-lift anim-fade-up flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2"
            style={{ '--d': '300ms' }}
          >
            <span className="text-slate-500">GPS</span>
            <span className="flex items-center gap-1 font-bold text-fresh">
              <Radio className="anim-pulse-dot h-3 w-3 text-fresh" /> Online
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
