import { useState } from 'react'
import { AlertCircle, ArrowLeft, CheckCircle, ShieldAlert, Bell, PhoneCall } from 'lucide-react'

export default function AlertsView({ onBack }) {
  const [alerts, setAlerts] = useState([
    {
      id: 'ALT-101',
      title: 'Temperature Excursion Spike',
      shipment: 'SHP-001 (BATCH-MNG-9041)',
      severity: 'critical',
      metric: '10.2°C (Max Limit: 10.0°C)',
      time: '2 mins ago',
      details: 'Cold chain compartment #1 experienced a +0.8°C climb during mountain pass climb. Re-stabilization cooling engaged.',
      acknowledged: false
    },
    {
      id: 'ALT-102',
      title: 'Battery Low Warning',
      shipment: 'DEV-003 (BATCH-ORG-4022)',
      severity: 'warning',
      metric: '18% Battery Remaining',
      time: '15 mins ago',
      details: 'Container BLE tag voltage dropped below 2.8V. Estimated 8 hours operating life remaining. Recharging required.',
      acknowledged: false
    },
    {
      id: 'ALT-103',
      title: 'Humidity Fluctuated Above Threshold',
      shipment: 'BATCH-TMT-1108',
      severity: 'resolved',
      metric: '96% RH (Limit: 95%)',
      time: '2 hours ago',
      details: 'Pre-cooling chamber dehumidifier activated. Humidity restored to 88% optimal.',
      acknowledged: true
    }
  ])

  const handleAcknowledge = (id) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Back button */}
      <div className="anim-fade-down flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="press flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:-translate-y-0.5 hover:border-line-strong hover:text-plum hover:shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-black text-slate-900">
              Cold-Chain Alerts &amp; Incident Center
              <span className="anim-pop rounded-full border border-danger-tint bg-danger-tint px-2.5 py-0.5 text-xs font-bold text-danger">
                2 Active
              </span>
            </h1>
            <p className="anim-fade-up text-xs text-slate-500" style={{ '--d': '80ms' }}>
              Thermal excursions, sensor anomalies, and container tampering events
            </p>
          </div>
        </div>
      </div>

      {/* Alerts list */}
      <div className="space-y-4">
        {alerts.map((alt, i) => (
          <div
            key={alt.id}
            className={`anim-fade-up hover-lift rounded-2xl border p-5 shadow-xs ${
              alt.severity === 'critical'
                ? 'anim-glow border-danger-tint bg-paper'
                : alt.severity === 'warning'
                ? 'border-warn-tint bg-paper'
                : 'border-slate-200 bg-slate-50/60 opacity-80'
            }`}
            style={{ '--d': `${i * 120}ms` }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span
                  className={`anim-bounce-in flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    alt.severity === 'critical'
                      ? 'bg-danger-tint'
                      : alt.severity === 'warning'
                      ? 'bg-warn-tint'
                      : 'bg-fresh-tint'
                  }`}
                  style={{ '--d': `${i * 120 + 100}ms` }}
                >
                  <span
                    className={`h-3 w-3 rounded-full ${
                      alt.severity === 'critical'
                        ? 'anim-blink bg-danger'
                        : alt.severity === 'warning'
                        ? 'bg-warn'
                        : 'bg-fresh'
                    }`}
                  />
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{alt.title}</h3>
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-500">
                      {alt.shipment}
                    </span>
                  </div>
                  <p className="mt-1 max-w-2xl text-xs text-slate-600">{alt.details}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 text-right">
                <span className="anim-pop rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-bold text-slate-800">
                  {alt.metric}
                </span>
                <span className="text-[11px] text-slate-400">{alt.time}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
              <span className="text-[11px] font-medium text-slate-500">
                Action: Automated SMS dispatched to driver &amp; Cold Hub
              </span>

              <div className="flex items-center gap-2">
                {!alt.acknowledged ? (
                  <button
                    onClick={() => handleAcknowledge(alt.id)}
                    className="press flex items-center gap-1.5 rounded-lg bg-plum px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:-translate-y-0.5 hover:bg-plum-dark hover:shadow-md"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Acknowledge</span>
                  </button>
                ) : (
                  <span className="anim-pop flex items-center gap-1 text-xs font-bold text-fresh">
                    <CheckCircle className="h-4 w-4" /> Acknowledged
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
