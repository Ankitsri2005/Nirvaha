import { Thermometer, Droplets, Sparkles, ShieldCheck, ShieldAlert, Activity, Battery } from 'lucide-react'

export default function SensorPanel({ batch }) {
  if (!batch || !batch.telemetry) return null

  const {
    temperature,
    tempRange = [4, 10],
    humidity,
    humidityRange = [80, 95],
    freshnessScore = 95,
    spoilageRisk = 'Low',
    anomalyDetected = false,
    anomalyMessage,
    lastUpdated,
    gpsSpeed,
    batteryLevel
  } = batch.telemetry

  const isTempNormal = temperature >= tempRange[0] && temperature <= tempRange[1]
  const isHumidityNormal = humidity >= humidityRange[0] && humidity <= humidityRange[1]

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Real-time IoT Analysis</h3>
            <p className="text-[11px] text-slate-500">Cold-chain telemetry & AI spoilage detection</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600 font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{lastUpdated || 'Live'}</span>
        </div>
      </div>

      {/* Primary Telemetry Grid */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {/* Temperature Card */}
        <div
          className={`rounded-xl border p-3.5 transition-all ${
            isTempNormal
              ? 'border-emerald-200 bg-emerald-50/50'
              : 'border-rose-300 bg-rose-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Temperature</span>
            <Thermometer
              className={`h-4 w-4 ${isTempNormal ? 'text-emerald-600' : 'text-rose-600'}`}
            />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {temperature}
            </span>
            <span className="text-sm font-semibold text-slate-500">°C</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Safe: {tempRange[0]}° - {tempRange[1]}°C</span>
            <span
              className={`rounded px-1.5 py-0.5 font-bold ${
                isTempNormal
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {isTempNormal ? 'Optimal' : 'Breach'}
            </span>
          </div>
        </div>

        {/* Humidity Card */}
        <div
          className={`rounded-xl border p-3.5 transition-all ${
            isHumidityNormal
              ? 'border-sky-200 bg-sky-50/50'
              : 'border-amber-300 bg-amber-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Humidity</span>
            <Droplets
              className={`h-4 w-4 ${isHumidityNormal ? 'text-sky-600' : 'text-amber-600'}`}
            />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {humidity}
            </span>
            <span className="text-sm font-semibold text-slate-500">% RH</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Target: {humidityRange[0]}-{humidityRange[1]}%</span>
            <span
              className={`rounded px-1.5 py-0.5 font-bold ${
                isHumidityNormal
                  ? 'bg-sky-100 text-sky-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isHumidityNormal ? 'Normal' : 'Check'}
            </span>
          </div>
        </div>

        {/* Freshness Score */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">AI Freshness</span>
            <Sparkles className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-emerald-700">
              {freshnessScore}%
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Risk: {spoilageRisk}</span>
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-bold text-emerald-800">
              Grade A
            </span>
          </div>
        </div>

        {/* Speed / Battery */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">IoT Sensor Pod</span>
            <Battery className="h-4 w-4 text-slate-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              {batteryLevel || '95%'}
            </span>
            <span className="text-xs text-slate-500 font-medium">Battery</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Speed: {gpsSpeed || '0 km/h'}</span>
            <span className="text-emerald-700 font-bold">Online</span>
          </div>
        </div>
      </div>

      {/* Anomaly & Alert Detection Banner */}
      <div className="mt-4">
        <div
          className={`flex items-start gap-3 rounded-xl border p-3.5 ${
            anomalyDetected
              ? 'border-rose-200 bg-rose-50 text-rose-900'
              : 'border-emerald-200 bg-emerald-50/80 text-emerald-900'
          }`}
        >
          {anomalyDetected ? (
            <ShieldAlert className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          ) : (
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
          )}
          <div>
            <p className="text-xs font-bold">
              {anomalyDetected ? 'Anomaly Detected' : 'Cold-Chain Integrity Verified'}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-600 leading-normal">
              {anomalyMessage ||
                (anomalyDetected
                  ? 'Abnormal thermal spike detected. Notification dispatched to transporter.'
                  : 'Zero anomalies. Continuous temperature compliance preserved from farm origin.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
