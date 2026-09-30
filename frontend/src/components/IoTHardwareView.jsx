import React, { useState } from 'react'
import {
  ArrowLeft,
  ArrowDown,
  ArrowRight,
  Check,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Shield,
  Layers,
  Link as LinkIcon
} from 'lucide-react'

export default function IoTHardwareView({ onBack }) {
  const [offlineSyncTab, setOfflineSyncTab] = useState('available') // 'available' | 'lost' | 'returns'

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 font-sans text-slate-900">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Nirvaha IoT Hardware Node
              </h1>
              <span className="rounded bg-slate-100 border border-slate-300 px-2 py-0.5 text-[11px] font-mono font-medium text-slate-700">
                Node ID: ESP32-COLD-01
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Field deployment unit with multi-gas ripening estimation, offline persistence, and cryptographic provenance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700">
          <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
          <span>4G Cellular Telemetry Active</span>
        </div>
      </div>

      {/* Clean Physical Hardware Showcase */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Hardware Implementation — Field Deployment Unit
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              All sensors, logic, power management, and wireless modules enclosed inside an industrial IP67 housing.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Form Factor: IP67 Waterproof Box
          </span>
        </div>

        <div className="mt-4 flex justify-center bg-slate-50 border border-slate-200 rounded-lg p-3">
          <img
            src="hardware_enclosure.jpg"
            alt="Assembled Nirvaha IoT hardware node inside IP67 industrial enclosure"
            className="max-h-[520px] w-auto object-contain rounded"
            loading="eager"
          />
        </div>
        <p className="text-[11px] text-slate-400 text-center mt-2.5 font-mono">
          Figure 1.0 — Sealed enclosure with internal baseplate wiring, battery management, external antennas, and 4x PG compression glands.
        </p>
      </div>

      {/* Section Divider */}
      <div className="border-b border-slate-200 pb-2">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          System Architecture & Functional Specifications
        </h2>
        <p className="text-xs text-slate-500">
          Technical operation across multi-sensor acquisition, AI ripening estimation, offline synchronization, and ledger verification.
        </p>
      </div>

      {/* 01: Multi-Sensor Food Monitoring */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
              01
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Multi-Sensor Food Monitoring
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Continuous Acquisition</span>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Flow Diagram */}
          <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs text-slate-800">
            <div className="flex justify-center">
              <div className="rounded border border-slate-400 bg-white px-4 py-1 font-bold text-slate-800 shadow-xs">
                FOOD CONTAINER
              </div>
            </div>

            <div className="flex justify-center my-1 text-slate-400">
              <ArrowDown className="h-3.5 w-3.5" />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded border border-slate-300 bg-white p-2">
                <span className="font-bold block text-slate-900">SHT31</span>
                <span className="text-[10px] text-slate-500">Temp / RH</span>
              </div>
              <div className="rounded border border-slate-300 bg-white p-2">
                <span className="font-bold block text-slate-900">MQ ARRAY</span>
                <span className="text-[10px] text-slate-500">MQ-2 / 3 / 135</span>
              </div>
              <div className="rounded border border-slate-300 bg-white p-2">
                <span className="font-bold block text-slate-900">MPU6050</span>
                <span className="text-[10px] text-slate-500">Vibration / Tilt</span>
              </div>
            </div>

            <div className="flex justify-center my-1 text-slate-400">
              <ArrowDown className="h-3.5 w-3.5" />
            </div>

            <div className="flex justify-center">
              <div className="rounded border border-slate-800 bg-slate-900 text-white px-5 py-1.5 font-bold shadow-xs">
                ESP32 CONTROLLER
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Operational Scope
            </span>
            <p className="text-xs text-slate-700 leading-relaxed">
              Continuous sensing of environmental, gas, motion and location conditions.
            </p>
            <div className="text-[11px] text-slate-600 space-y-1 pt-1 font-mono">
              <div>&bull; SHT31: Temperature + humidity</div>
              <div>&bull; MQ-2/3/135: Multi-gas pattern</div>
              <div>&bull; MPU6050: Acceleration / shock</div>
              <div>&bull; NEO-6M: Satellite GPS fix</div>
            </div>
          </div>
        </div>
      </div>

      {/* 02: AI-Based Ripening Detection */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
              02
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              AI-Based Ripening Detection
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">E-Nose Model</span>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Flow Diagram */}
          <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs text-slate-800">
            <div className="flex flex-col items-center space-y-1">
              <div className="flex gap-2 text-center">
                <span className="rounded border border-slate-300 bg-white px-2.5 py-1 font-bold text-slate-800">MQ-2</span>
                <span className="rounded border border-slate-300 bg-white px-2.5 py-1 font-bold text-slate-800">MQ-3</span>
                <span className="rounded border border-slate-300 bg-white px-2.5 py-1 font-bold text-slate-800">MQ-135</span>
              </div>

              <ArrowDown className="h-3 w-3 text-slate-400" />

              <div className="rounded border border-slate-300 bg-white px-4 py-1 text-center">
                <span className="font-bold block text-slate-900">ESP32</span>
                <span className="text-[10px] text-slate-500">Sensor Data Vector</span>
              </div>

              <ArrowDown className="h-3 w-3 text-slate-400" />

              <div className="rounded border border-slate-400 bg-slate-200 px-5 py-1 text-center font-bold text-slate-900">
                AI / ML MODEL
              </div>

              <ArrowDown className="h-3 w-3 text-slate-400" />

              <div className="rounded border border-slate-700 bg-slate-800 text-white px-4 py-1 text-center font-bold">
                ETHYLENE ESTIMATE
              </div>

              <ArrowDown className="h-3 w-3 text-slate-400" />

              <div className="grid grid-cols-2 gap-2 w-full max-w-xs text-center text-[11px]">
                <div className="rounded border border-slate-300 bg-white p-1.5 font-semibold text-slate-800">
                  Ripening Stage
                </div>
                <div className="rounded border border-slate-300 bg-white p-1.5 font-semibold text-slate-800">
                  Condition Status
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wide block">
              Low-cost gas sensor array + AI model
            </span>
            <p className="text-xs text-slate-700 leading-relaxed">
              MQ-2, MQ-3 and MQ-135 provide combined gas-response patterns. The trained ML model uses these patterns to estimate ethylene-related ripening changes.
            </p>
            <p className="text-[11px] text-slate-500 leading-normal border-t border-slate-100 pt-2">
              Cross-sensitive metal-oxide responses are decomposed mathematically, isolating true ethylene from humidity and background alcohol vapors.
            </p>
          </div>
        </div>
      </div>

      {/* 03: Smart Offline -> Online Synchronization */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
              03
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Smart Offline → Online Synchronization
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Store-and-Forward Buffer</span>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Visual Steps */}
          <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs space-y-3">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-200/80 p-1 rounded">
              <button
                onClick={() => setOfflineSyncTab('available')}
                className={`py-1 px-2 rounded text-[11px] font-bold transition-all ${
                  offlineSyncTab === 'available'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Network Available
              </button>
              <button
                onClick={() => setOfflineSyncTab('lost')}
                className={`py-1 px-2 rounded text-[11px] font-bold transition-all ${
                  offlineSyncTab === 'lost'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Network Lost
              </button>
              <button
                onClick={() => setOfflineSyncTab('returns')}
                className={`py-1 px-2 rounded text-[11px] font-bold transition-all ${
                  offlineSyncTab === 'returns'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Network Returns
              </button>
            </div>

            {/* Step Pipeline Visualization */}
            <div className="bg-white border border-slate-200 rounded p-3 min-h-[90px] flex items-center justify-center">
              {offlineSyncTab === 'available' && (
                <div className="flex items-center gap-2 overflow-x-auto text-center text-slate-800">
                  <div className="border border-slate-300 rounded px-2.5 py-1.5 bg-slate-50 font-bold">SENSORS</div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <div className="border border-slate-300 rounded px-2.5 py-1.5 bg-slate-50 font-bold">ESP32</div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <div className="border border-slate-300 rounded px-2.5 py-1.5 bg-slate-50 font-bold">SIM7080G (4G)</div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <div className="border border-slate-300 rounded px-2.5 py-1.5 bg-slate-50 font-bold">CLOUD</div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <div className="border border-slate-800 bg-slate-900 text-white rounded px-2.5 py-1.5 font-bold">DASHBOARD</div>
                </div>
              )}

              {offlineSyncTab === 'lost' && (
                <div className="flex items-center gap-2 overflow-x-auto text-center text-slate-800">
                  <div className="border border-slate-300 rounded px-2.5 py-1.5 bg-slate-50 font-bold">SENSORS</div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <div className="border border-slate-300 rounded px-2.5 py-1.5 bg-slate-50 font-bold">ESP32</div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <div className="border border-rose-300 bg-rose-50 text-rose-800 rounded px-2.5 py-1.5 font-bold">
                    NETWORK UNAVAILABLE
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <div className="border border-amber-300 bg-amber-50 text-amber-900 rounded px-2.5 py-1.5 font-bold">
                    SD CARD (LOCAL BUFFER)
                  </div>
                </div>
              )}

              {offlineSyncTab === 'returns' && (
                <div className="flex items-center gap-2 overflow-x-auto text-center text-slate-800">
                  <div className="border border-amber-300 bg-amber-50 text-amber-900 rounded px-2.5 py-1.5 font-bold">
                    SD CARD (STORED READINGS)
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <div className="border border-slate-300 rounded px-2.5 py-1.5 bg-slate-50 font-bold">ESP32</div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <div className="border border-slate-300 rounded px-2.5 py-1.5 bg-slate-50 font-bold">SIM7080G (4G)</div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <div className="border border-slate-300 rounded px-2.5 py-1.5 bg-slate-50 font-bold">CLOUD</div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <div className="border border-emerald-400 bg-emerald-50 text-emerald-900 rounded px-2.5 py-1.5 font-bold">
                    DATABASE UPDATED
                  </div>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-600 leading-normal">
              No data loss during connectivity interruptions. Sensor readings continue to be recorded locally on the SD card. The RV-3028 RTC preserves the time of each reading. When 4G connectivity returns, the stored records are synchronized with the cloud.
            </p>
          </div>

          {/* Beside it: OFFLINE BUFFER Card */}
          <div className="lg:col-span-4 rounded-lg border border-slate-200 bg-white p-4 font-mono text-xs flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                <span className="font-bold text-slate-900 uppercase">OFFLINE BUFFER</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              </div>

              <div className="mt-3 space-y-2 text-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Records waiting</span>
                  <span className="font-bold text-slate-900">1,284</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Time preserved</span>
                  <span className="font-semibold text-slate-800">✓ RTC timestamp</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Sync status</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span> Ready
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 mt-3 font-sans">
              FAT32 append-only queue preserves complete historical telemetry through tunnels and network dropouts.
            </p>
          </div>
        </div>
      </div>

      {/* Row: 04 (Timestamping) & 05 (Security) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 04: Reliable Timestamping */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
                  04
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Reliable Timestamping
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500">RV-3028 RTC</span>
            </div>

            {/* Visual Box */}
            <div className="mt-4 bg-slate-50 border border-slate-200 rounded p-3 font-mono text-xs">
              <div className="text-center">
                <span className="font-bold text-slate-900 block">RV-3028 RTC</span>
                <ArrowDown className="h-3 w-3 text-slate-400 mx-auto my-1" />
                <span className="text-[11px] text-slate-600 block">Accurate local time</span>
                <ArrowDown className="h-3 w-3 text-slate-400 mx-auto my-1" />
              </div>

              <div className="rounded border border-slate-300 bg-white p-3 space-y-1 text-slate-700">
                <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1">
                  Sensor Reading
                </div>
                <div className="flex justify-between"><span>Temp:</span> <strong className="text-slate-900">8.4°C</strong></div>
                <div className="flex justify-between"><span>Humidity:</span> <strong className="text-slate-900">72%</strong></div>
                <div className="flex justify-between"><span>Gas:</span> <strong className="text-slate-900">0.82</strong></div>
                <div className="flex justify-between"><span>GPS:</span> <strong className="text-slate-900">Location Lock</strong></div>
                <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                  <span>Timestamp:</span> <span>20:42:18</span>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-600 leading-relaxed">
            Every locally stored reading carries its time context, including during network outages. Essential for verifiable audit records.
          </p>
        </div>

        {/* 05: Secure Data & Device Identity */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
                  05
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Secure Data & Device Identity
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500">ATECC608A</span>
            </div>

            {/* Visual Box */}
            <div className="mt-4 bg-slate-50 border border-slate-200 rounded p-3 font-mono text-xs">
              <div className="flex flex-col items-center space-y-1 text-slate-800">
                <span className="font-bold text-slate-700">SENSOR DATA</span>
                <ArrowDown className="h-3 w-3 text-slate-400" />
                <span className="rounded border border-slate-300 bg-white px-3 py-0.5 font-bold">ESP32-S3</span>
                <ArrowDown className="h-3 w-3 text-slate-400" />

                <div className="w-full rounded border border-slate-400 bg-white p-2.5 text-left space-y-1">
                  <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1">
                    ATECC608A Secure Element
                  </span>
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <div>├── Device identity</div>
                    <div>├── Cryptographic operations</div>
                    <div>└── Data authentication</div>
                  </div>
                </div>

                <ArrowDown className="h-3 w-3 text-slate-400" />
                <span className="rounded bg-slate-900 text-white px-3 py-0.5 font-bold">4G / CLOUD</span>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <span className="text-xs font-bold text-slate-900 block">Hardware-backed security</span>
            <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
              ATECC608A provides secure cryptographic functions and device identity support so the sensor node can authenticate itself and protect sensitive operations.
            </p>
          </div>
        </div>
      </div>

      {/* 06: Sensor Failure Detection */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
              06
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Sensor Failure Detection
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Health Monitoring</span>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Normal vs Failure comparison */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-3 font-mono text-xs">
            {/* Normal */}
            <div className="rounded border border-slate-200 bg-slate-50 p-3 space-y-1.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-200 pb-1">
                Normal Path
              </span>
              <div className="bg-white border border-slate-300 p-1 rounded font-bold">SHT31</div>
              <ArrowDown className="h-3 w-3 mx-auto text-slate-400" />
              <div className="text-[10px] text-emerald-700 font-semibold">Reading received ✓</div>
              <ArrowDown className="h-3 w-3 mx-auto text-slate-400" />
              <div className="bg-white border border-slate-300 p-1 rounded">ESP32</div>
              <ArrowDown className="h-3 w-3 mx-auto text-slate-400" />
              <div className="bg-slate-900 text-white font-bold p-1 rounded text-[11px]">Normal</div>
            </div>

            {/* Failure */}
            <div className="rounded border border-slate-200 bg-slate-50 p-3 space-y-1.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-200 pb-1">
                Failure Path
              </span>
              <div className="bg-white border border-slate-300 p-1 rounded font-bold">SHT31</div>
              <ArrowDown className="h-3 w-3 mx-auto text-slate-400" />
              <div className="text-[10px] text-rose-700 font-semibold">No valid reading</div>
              <ArrowDown className="h-3 w-3 mx-auto text-slate-400" />
              <div className="bg-white border border-slate-300 p-1 rounded text-[10px]">Abnormal / Missing data</div>
              <ArrowDown className="h-3 w-3 mx-auto text-slate-400" />
              <div className="bg-rose-100 text-rose-900 border border-rose-300 font-bold p-1 rounded text-[11px]">
                SENSOR FAILURE ALERT
              </div>
            </div>
          </div>

          {/* DEVICE HEALTH Widget */}
          <div className="lg:col-span-5 rounded border border-slate-200 bg-white p-3.5 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-bold text-slate-900 uppercase">DEVICE HEALTH</span>
              <span className="text-[10px] text-slate-500">Autonomous Check</span>
            </div>

            <div className="space-y-1 text-[11px] text-slate-700">
              <div className="flex justify-between items-center">
                <span>✓ SHT31</span>
                <span className="font-bold text-slate-900">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span>✓ MQ Array</span>
                <span className="font-bold text-slate-900">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span>✓ GPS</span>
                <span className="font-bold text-slate-900">Locked</span>
              </div>
              <div className="flex justify-between items-center">
                <span>✓ MPU6050</span>
                <span className="font-bold text-slate-900">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span>✓ 4G</span>
                <span className="font-bold text-slate-900">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span>✓ SD Card</span>
                <span className="font-bold text-slate-900">Ready</span>
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-200 flex justify-between items-center text-rose-800 bg-rose-50 border border-rose-200 px-2 py-1 rounded text-[11px]">
                <span className="font-bold">⚠ Example: SHT31</span>
                <span className="font-bold">No Response</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row: 07 (GPS + Motion) & 08 (Power) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 07: GPS + Motion Tracking */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
                  07
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  GPS + Motion Tracking
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500">NEO-6M + MPU6050</span>
            </div>

            {/* Flows */}
            <div className="mt-4 grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded p-3 font-mono text-xs">
              <div className="space-y-1 text-center border-r border-slate-200 pr-2">
                <span className="font-bold block text-slate-900">GPS (NEO-6M)</span>
                <ArrowDown className="h-3 w-3 mx-auto text-slate-400" />
                <span className="text-[10px] text-slate-600 block">Latitude / Longitude</span>
                <ArrowDown className="h-3 w-3 mx-auto text-slate-400" />
                <span className="text-[10px] text-slate-600 block">ESP32 &rarr; 4G</span>
                <ArrowDown className="h-3 w-3 mx-auto text-slate-400" />
                <span className="rounded bg-slate-900 text-white font-bold p-1 block text-[10px]">
                  Dashboard Map
                </span>
              </div>

              <div className="space-y-1 text-center pl-1">
                <span className="font-bold block text-slate-900">MPU6050</span>
                <ArrowDown className="h-3 w-3 mx-auto text-slate-400" />
                <span className="text-[10px] text-slate-600 block">Acceleration / Motion</span>
                <ArrowDown className="h-3 w-3 mx-auto text-slate-400" />
                <span className="text-[10px] text-slate-600 block">Detect unusual shock</span>
                <ArrowDown className="h-3 w-3 mx-auto text-slate-400" />
                <span className="rounded border border-slate-300 bg-white text-slate-900 font-bold p-1 block text-[10px]">
                  Event / Alert
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <span className="text-xs font-bold text-slate-900 block">
              Where is the shipment? + What is happening to the device?
            </span>
            <p className="text-xs text-slate-600 mt-0.5 leading-normal">
              Correlates vehicle transit position with road vibration, harsh braking, and drop shocks during cold-chain delivery.
            </p>
          </div>
        </div>

        {/* 08: Self-Powered / Power Management */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
                  08
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Self-Powered / Power Management
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500">Solar + 18650</span>
            </div>

            {/* Power Flow */}
            <div className="mt-4 bg-slate-50 border border-slate-200 rounded p-3 font-mono text-xs text-center space-y-1">
              <div className="inline-block rounded border border-slate-400 bg-white px-3 py-0.5 font-bold text-slate-900">
                SOLAR PANEL (5–10 W)
              </div>
              <ArrowDown className="h-3 w-3 text-slate-400 mx-auto" />
              <div className="text-[10px] text-slate-600">SOLAR CHARGE CONTROLLER</div>
              <ArrowDown className="h-3 w-3 text-slate-400 mx-auto" />
              <div className="inline-block rounded border border-slate-300 bg-white px-3 py-0.5 font-bold text-slate-900">
                18650 BATTERY (BMS)
              </div>
              <ArrowDown className="h-3 w-3 text-slate-400 mx-auto" />
              <div className="text-[10px] text-slate-600">DC-DC REGULATOR (5V / 3.3V)</div>
              <ArrowDown className="h-3 w-3 text-slate-400 mx-auto" />
              <div className="inline-block rounded bg-slate-900 text-white px-3 py-0.5 font-bold text-[11px]">
                ESP32 + SENSORS + 4G MODULE
              </div>
            </div>
          </div>

          <div className="mt-3">
            <span className="text-xs font-bold text-slate-900 block">
              Solar-assisted power system
            </span>
            <p className="text-xs text-slate-600 mt-0.5 leading-normal">
              Solar energy charges the battery while the BMS and regulated power rails protect and supply the electronics during long road trips.
            </p>
          </div>
        </div>
      </div>

      {/* 09: BLOCKCHAIN TRACEABILITY */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
              09
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Blockchain Traceability
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Immutable Provenance</span>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Flow Pipeline */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded p-4 font-mono text-xs text-center space-y-1.5">
            <div className="rounded border border-slate-300 bg-white py-1 px-3 font-bold text-slate-800">
              Sensor Data
            </div>
            <ArrowDown className="h-3.5 w-3.5 text-slate-400 mx-auto" />
            <div className="rounded border border-slate-300 bg-white py-1 px-3 font-bold text-slate-800">
              Hash Generated
            </div>
            <ArrowDown className="h-3.5 w-3.5 text-slate-400 mx-auto" />
            <div className="rounded border border-slate-800 bg-slate-900 text-white py-1.5 px-4 font-bold">
              Blockchain Record
            </div>
          </div>

          {/* Blockchain Record Card */}
          <div className="lg:col-span-7 rounded border border-slate-200 bg-white p-4 font-mono text-xs space-y-2">
            <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
              <span className="font-bold text-slate-900 uppercase">BLOCKCHAIN AUDIT RECORD</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span> VERIFIED
              </span>
            </div>

            <div className="space-y-1.5 text-slate-700 text-[11px]">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500">Status</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  ● VERIFIED
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500">Batch</span>
                <span className="font-bold text-slate-900">MANGO-2026-014</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500">Timestamp</span>
                <span className="text-slate-900">30 Sep 2026 &bull; 20:42:18</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500">Record Hash</span>
                <span className="font-mono bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded text-slate-800 text-[10px]">
                  8f3a9e21...91c2b4e7
                </span>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-emerald-700 font-sans text-xs font-semibold">
                <Check className="h-4 w-4" />
                <span>Data integrity verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
