import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  ArrowDown,
  ArrowRight,
  Check,
  CheckCircle2,
  HardDrive,
  Shield,
  Layers,
  Activity,
  Cpu,
  Lock,
  Clock,
  Radio,
  Zap,
  MapPin,
  Sliders,
  AlertTriangle
} from 'lucide-react'

export default function IoTHardwareView({ onBack }) {
  const [offlineSyncTab, setOfflineSyncTab] = useState('available') // 'available' | 'lost' | 'returns'
  const [simulatedFault, setSimulatedFault] = useState(false)
  const [hashCopied, setHashCopied] = useState(false)
  const [liveSeconds, setLiveSeconds] = useState(18)

  // Real-time ticking clock for RTC visualization
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveSeconds((prev) => (prev >= 59 ? 0 : prev + 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const copyHash = () => {
    navigator.clipboard?.writeText('8f3a9e217c4b108d91c2b4e7a6350f92')
    setHashCopied(true)
    setTimeout(() => setHashCopied(false), 2000)
  }

  // Complete 10 hardware sensor & module specifications
  const sensorModules = [
    {
      id: 'enose-ethylene',
      num: '01',
      title: 'Ethylene & Ripening Detection Array (MQ-2, MQ-3 & MQ-135 + AI Model)',
      badge: 'Ripening & Spoilage AI',
      hardware: 'Trio Gas Sensor Array: MQ-2 (Hydrocarbons), MQ-3 (Alcohol/Ethanol), MQ-135 (Ammonia/VOCs)',
      wiring: '3x Analog Channels to ESP32 ADC1 (GPIO 34, 35, 32) via 10kΩ/20kΩ precision dividers. 5V heater rail.',
      working:
        'Single metal-oxide sensors lack selectivity for pure ethylene (C2H4) because ambient alcohol vapors, humidity, and volatile organics cause cross-interference. Our circuit pairs three distinct gas sensors: MQ-2 catches combustible hydrocarbons, MQ-3 detects ethanol from early fermentation, and MQ-135 measures ammonia and general air contaminants.',
      projectRole:
        'The continuous analog voltage responses from all three sensors form a multi-dimensional signature vector. This vector is fed into our trained AI regression model to isolate ethylene from background gases. As climacteric produce (mangoes, bananas, tomatoes) ripens, it produces a distinct ethylene surge. The model calculates the real-time ripening index and remaining shelf life, flagging early spoilage hours before visible decay occurs.'
    },
    {
      id: 'ds18b20',
      num: '02',
      title: 'DS18B20 Waterproof Core Food Temperature Probe',
      badge: 'Core Food Safety',
      hardware: 'Maxim DS18B20 digital thermometer in 304 food-grade stainless steel capsule',
      wiring: 'Dallas OneWire bus on GPIO 4 with a 4.7kΩ pull-up resistor. 3.3V logic.',
      working:
        'Uses an internal bandgap temperature reference and on-chip 12-bit ADC providing 0.0625°C resolution. Data transmits digitally over a single wire using time-slotted microsecond pulses, eliminating analog voltage drops across long transit wires.',
      projectRole:
        'Routed through the waterproof PG gland directly into the core crate or ice slurry. It measures the internal food pulp temperature rather than air temperature. Brief cargo door openings warm ambient air but do not warm the core food; this probe prevents false breach alarms while immediately catching true refrigeration system failures.'
    },
    {
      id: 'dht22',
      num: '03',
      title: 'DHT22 (AM2302) Ambient Temperature & Humidity Sensor',
      badge: 'Reefer Climate',
      hardware: 'Capacitive polymer humidity sensor & NTC thermistor in slotted white casing',
      wiring: 'Single-wire bi-directional digital interface on GPIO 15. 3.3V power.',
      working:
        'Measures electrical permittivity of a dielectric polymer to determine relative humidity (0–100% RH ±2%) and an NTC resistor for ambient air temp (-40°C to +80°C). Outputs a calibrated 40-bit data packet with hardware CRC checksum.',
      projectRole:
        'Monitors ambient cargo hold conditions. High humidity (>90% RH) causes moisture condensation on produce skins, promoting rapid fungal mold growth and bacterial rot. Low humidity (<75% RH) causes desiccation and weight loss in fresh vegetables. Ensures reefer evaporator coils maintain safe vapor levels.'
    },
    {
      id: 'esp32',
      num: '04',
      title: 'ESP32 Dual-Core Edge Gateway Microcontroller',
      badge: 'Edge Compute Core',
      hardware: 'Xtensa 32-bit LX6 dual-core running at 240MHz with 520KB SRAM',
      wiring: 'Central controller on baseplate, powered via dedicated 5V-to-3.3V regulated rail.',
      working:
        'Runs FreeRTOS multitasking. Core 0 handles deterministic sensor acquisition loops (OneWire, I2C, analog multi-sampling, digital filtering), while Core 1 runs the lightweight feature extraction pipeline, local anomaly checks, and cellular telemetry queue.',
      projectRole:
        'Acts as the intelligent brain inside the vehicle. Validates readings against food-specific temperature and gas bounds, calculates rolling averages, packages encrypted JSON payloads, and manages offline flash storage without dropping a single sample.'
    },
    {
      id: 'gps',
      num: '05',
      title: 'u-blox NEO-6M GPS Tracker & Active Patch Antenna',
      badge: 'Geofence Tracking',
      hardware: '50-channel u-blox positioning engine with external 25x25mm ceramic patch antenna',
      wiring: 'Hardware UART2 (RX2: GPIO 16, TX2: GPIO 17) at 9600 baud. 5V active LNA antenna supply.',
      working:
        'Continuously tracks satellite constellations to output standard NMEA sentences ($GPRMC for coordinates/speed, $GPGGA for altitude/lock). Re-acquires satellite fix in under 1 second during transit.',
      projectRole:
        'Coordinates are stamped onto every sensor packet. Verifies the shipment adheres to approved cold-chain transport corridors and logs travel speed. If the truck halts at an unauthorized non-refrigerated location or deviates off course, an immutable geofence violation is recorded.'
    },
    {
      id: 'cellular',
      num: '06',
      title: 'GSM / 4G Cellular Modem & Micro-SIM Module',
      badge: 'Highway Telemetry',
      hardware: 'Cellular transceiver shield with external magnetic-mount high-gain whip antenna',
      wiring: 'Hardware Serial UART with AT command protocol. 5V rail with 2200µF decoupling capacitor for 2A bursts.',
      working:
        'Establishes TCP/TLS sockets over cellular mobile networks to stream lightweight MQTT data packets directly to the central cloud platform and blockchain oracle.',
      projectRole:
        'Transmits continuous telemetry along remote national highways and rural farmlands where Wi-Fi is unavailable. The external whip antenna mounts outside the reefer box, bypassing the metal container walls that would otherwise block wireless signals.'
    },
    {
      id: 'rtc',
      num: '07',
      title: 'RV-3028 / DS3231 High-Precision Real-Time Clock (RTC)',
      badge: 'Tamper-Proof Time',
      hardware: 'Extreme low-power I2C RTC with integrated TCXO and backup coin cell',
      wiring: 'I2C bus (SDA: GPIO 21, SCL: GPIO 22, Address 0x68). 3.3V logic.',
      working:
        'An internal Temperature-Compensated Crystal Oscillator (TCXO) dynamically tunes crystal capacitance across temperature variations (-40°C to +85°C), maintaining precision under ±2 ppm (less than 1 minute drift per year).',
      projectRole:
        'Provides unalterable legal timestamps for regulatory food safety audits (HACCP/FDA). When the transport enters underground tunnels, cold storage basements, or remote zones with zero GPS satellite or cellular signals, the RTC ensures every reading has an authenticated timestamp.'
    },
    {
      id: 'microsd',
      num: '08',
      title: 'microSD Offline Black-Box Flight Recorder',
      badge: 'Offline Buffer',
      hardware: 'SPI TF / microSD flash card breakout module with 16GB industrial card',
      wiring: 'VSPI interface (CS: 13, MOSI: 23, MISO: 19, SCK: 18). 3.3V operating voltage.',
      working:
        'Maintains a circular append-only file stream on the FAT32 flash card, saving newline-delimited JSON records whenever live cloud transmission is unavailable.',
      projectRole:
        'Zero data loss during network dead zones. If cellular coverage drops in valleys or mountain passes, the node stores all sensor readings locally. Once cell connectivity is restored, the buffered records are replayed and synced with the cloud in chronological sequence.'
    },
    {
      id: 'power-solar',
      num: '09',
      title: 'Solar Photovoltaic Harvesting & Dual 18650 Battery System',
      badge: 'Continuous Power',
      hardware: '12V Monocrystalline Solar Panel, MPPT Battery Management Shield, 2x 18650 Li-ion cells (5200mAh)',
      wiring: 'DC bus with inline fast-acting glass fuse. Regulated dual buck outputs at 5.0V and 3.3V.',
      working:
        'The rooftop solar panel continuously charges the 18650 battery bank using a CC/CV profile with overcharge, deep discharge, and short-circuit protection. Dual high-efficiency buck converters isolate noisy loads from sensitive sensor logic.',
      projectRole:
        'Provides complete power autonomy. Refrigerated truck alternators shut down when the vehicle engine is turned off during driver rest periods or border inspections. This solar-battery setup keeps the monitoring system running continuously for over 72 hours without vehicle power.'
    },
    {
      id: 'hmi-diagnostics',
      num: '10',
      title: 'Driver Status LEDs, Warning Buzzer & Manual Audit Button',
      badge: 'Driver Interface',
      hardware: 'Tri-color status LEDs, 85dB 5V active piezo buzzer, tactile momentary pushbutton',
      wiring: 'LEDs on GPIO 25, 26, 27; Buzzer on GPIO 14 via transistor switch; Pushbutton on GPIO 12 with pull-up.',
      working:
        'Direct GPIO logic providing immediate acoustic and visual feedback to the truck driver without requiring a phone or dashboard screen.',
      projectRole:
        'Green LED confirms cold-chain parameters are normal. Blue confirms cellular and GPS locks. If core temperature exceeds the safety threshold or ethylene spikes, the Red LED flashes and the buzzer emits an 85dB alarm so the driver can inspect the cooling unit immediately. The button allows drivers to log manual inspection events during cargo handover.'
    }
  ]

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20 font-sans text-slate-900">
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
                Node: ESP32-COLD-01
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Field deployment unit with multi-gas ripening estimation, offline persistence, and cryptographic provenance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
            <span>4G Cellular Telemetry Online</span>
          </div>
        </div>
      </div>

      {/* Hardware Box Showcase */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-900"></span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Hardware Implementation &bull; Assembled Field Unit
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              All sensors, logic, power management, and wireless modules enclosed inside an industrial IP67 housing.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
            Enclosure: IP67 Weatherproof
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
        <p className="text-[11px] text-slate-500 text-center mt-2.5 font-mono">
          Figure 1.0 &mdash; Sealed enclosure with internal baseplate wiring, battery management, external antennas, and 4x PG compression glands.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* PART 1: SYSTEM ARCHITECTURE & FUNCTIONAL SPECIFICATIONS (9 Key Features)  */}
      {/* ========================================================================= */}
      <div className="space-y-5">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            System Architecture & Functional Specifications
          </h2>
          <p className="text-xs text-slate-500">
            Technical pipeline spanning multi-sensor ingestion, AI ripening prediction, fault resilience, and cryptographic ledger verification.
          </p>
        </div>

        {/* FEATURE 01: Multi-Sensor Food Monitoring */}
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
            <span className="text-[11px] font-mono text-slate-500">Continuous Sensing</span>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* Diagram */}
            <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs text-slate-800">
              <div className="flex justify-center">
                <div className="rounded border border-slate-400 bg-white px-4 py-1 font-bold text-slate-800 shadow-xs">
                  FOOD CONTAINER
                </div>
              </div>

              <div className="flex justify-center my-1.5 text-slate-400">
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

              <div className="flex justify-center my-1.5 text-slate-400">
                <ArrowDown className="h-3.5 w-3.5" />
              </div>

              <div className="flex justify-center">
                <div className="rounded border border-slate-800 bg-slate-900 text-white px-5 py-1.5 font-bold shadow-xs">
                  ESP32
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="lg:col-span-4 space-y-2">
              <div className="border-l-2 border-slate-900 pl-3">
                <p className="text-xs font-semibold text-slate-800 leading-snug">
                  Continuous sensing of environmental, gas, motion and location conditions.
                </p>
              </div>
              <div className="text-[11px] text-slate-600 space-y-1 font-mono bg-slate-50 p-3 rounded border border-slate-200">
                <div>&bull; SHT31: Temperature + humidity</div>
                <div>&bull; MQ-2/3/135: Multi-gas pattern</div>
                <div>&bull; MPU6050: Acceleration / shock</div>
                <div>&bull; NEO-6M: Satellite GPS fix</div>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURE 02: AI-Based Ripening Detection */}
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
            <span className="text-[11px] font-mono text-slate-500">Combined Pattern</span>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* Diagram */}
            <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs text-slate-800">
              <div className="flex flex-col items-center space-y-1">
                <div className="flex gap-2 text-center">
                  <span className="rounded border border-slate-300 bg-white px-3 py-1 font-bold text-slate-800">MQ-2</span>
                  <span className="rounded border border-slate-300 bg-white px-3 py-1 font-bold text-slate-800">MQ-3</span>
                  <span className="rounded border border-slate-300 bg-white px-3 py-1 font-bold text-slate-800">MQ-135</span>
                </div>

                <ArrowDown className="h-3.5 w-3.5 text-slate-400" />

                <div className="rounded border border-slate-300 bg-white px-4 py-1 text-center">
                  <span className="font-bold block text-slate-900">ESP32</span>
                  <span className="text-[10px] text-slate-500">Sensor Data</span>
                </div>

                <ArrowDown className="h-3.5 w-3.5 text-slate-400" />

                <div className="rounded border border-slate-400 bg-slate-200 px-5 py-1 text-center font-bold text-slate-900">
                  AI / ML MODEL
                </div>

                <ArrowDown className="h-3.5 w-3.5 text-slate-400" />

                <div className="rounded border border-slate-700 bg-slate-800 text-white px-4 py-1 text-center font-bold">
                  ETHYLENE ESTIMATE
                </div>

                <ArrowDown className="h-3.5 w-3.5 text-slate-400" />

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
              <div className="rounded border border-slate-200 bg-slate-50 p-2.5 text-[11px] text-slate-600 font-mono">
                Decouples cross-sensitivities from ethanol and humidity to estimate ripening state.
              </div>
            </div>
          </div>
        </div>

        {/* FEATURE 03: Smart Offline -> Online Synchronization */}
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
            <span className="text-[11px] font-mono text-slate-500">Store-and-Forward</span>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs space-y-3">
              {/* Tab Selector */}
              <div className="grid grid-cols-3 gap-1.5 bg-slate-200 p-1 rounded">
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

              {/* Dynamic Path */}
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

            {/* Offline Buffer Widget */}
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
                    <span className="font-semibold text-slate-800">&bull; RTC timestamp</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Sync status</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span> Ready
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 mt-3 font-sans">
                Store-and-forward persistence tested through mountainous routes and dead-zones.
              </div>
            </div>
          </div>
        </div>

        {/* ROW: 04 (Timestamping) & 05 (Security) */}
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

              <div className="mt-4 bg-slate-50 border border-slate-200 rounded p-3 font-mono text-xs">
                <div className="text-center">
                  <span className="font-bold text-slate-900 block">RV-3028 RTC</span>
                  <ArrowDown className="h-3 w-3 text-slate-400 mx-auto my-1" />
                  <span className="text-[11px] text-slate-600 block">Accurate local time</span>
                  <ArrowDown className="h-3 w-3 text-slate-400 mx-auto my-1" />
                </div>

                <div className="rounded border border-slate-300 bg-white p-3 space-y-1 text-slate-700">
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1 flex justify-between items-center">
                    <span>Sensor Reading</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">&bull; Cached</span>
                  </div>
                  <div className="flex justify-between"><span>Temp:</span> <strong className="text-slate-900">8.4°C</strong></div>
                  <div className="flex justify-between"><span>Humidity:</span> <strong className="text-slate-900">72%</strong></div>
                  <div className="flex justify-between"><span>Gas:</span> <strong className="text-slate-900">0.82</strong></div>
                  <div className="flex justify-between"><span>GPS:</span> <strong className="text-slate-900">Location Lock</strong></div>
                  <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                    <span>Timestamp:</span> <span>20:42:{liveSeconds < 10 ? `0${liveSeconds}` : liveSeconds}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              Every locally stored reading carries its time context, including during network outages.
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

              <div className="mt-4 bg-slate-50 border border-slate-200 rounded p-3 font-mono text-xs">
                <div className="flex flex-col items-center space-y-1 text-slate-800">
                  <span className="font-bold text-slate-700">SENSOR DATA</span>
                  <ArrowDown className="h-3 w-3 text-slate-400" />
                  <span className="rounded border border-slate-300 bg-white px-3 py-0.5 font-bold">ESP32-S3</span>
                  <ArrowDown className="h-3 w-3 text-slate-400" />

                  <div className="w-full rounded border border-slate-400 bg-white p-2.5 text-left space-y-1">
                    <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1">
                      ATECC608A
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

        {/* FEATURE 06: Sensor Failure Detection */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
                06
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Sensor Failure Detection
              </h3>
            </div>
            <button
              onClick={() => setSimulatedFault(!simulatedFault)}
              className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
                simulatedFault
                  ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold'
                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
              }`}
            >
              {simulatedFault ? 'Reset to Normal' : 'Simulate Fault'}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* Normal vs Failure */}
            <div className="lg:col-span-7 grid grid-cols-2 gap-3 font-mono text-xs">
              <div
                className={`rounded border p-3 space-y-1.5 text-center transition-all ${
                  !simulatedFault
                    ? 'bg-slate-50 border-slate-300 ring-1 ring-slate-400'
                    : 'bg-slate-50/50 border-slate-200 opacity-60'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block border-b border-slate-200 pb-1">
                  Normal
                </span>
                <div className="bg-white border border-slate-300 p-1 rounded font-bold">SHT31</div>
                <ArrowDown className="h-3 w-3 mx-auto text-slate-400" />
                <div className="text-[10px] text-emerald-700 font-semibold">Reading received ✓</div>
                <ArrowDown className="h-3 w-3 mx-auto text-slate-400" />
                <div className="bg-white border border-slate-300 p-1 rounded">ESP32</div>
                <ArrowDown className="h-3 w-3 mx-auto text-slate-400" />
                <div className="bg-slate-900 text-white font-bold p-1 rounded text-[11px]">Normal</div>
              </div>

              <div
                className={`rounded border p-3 space-y-1.5 text-center transition-all ${
                  simulatedFault
                    ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-400'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block border-b border-slate-200 pb-1">
                  Failure
                </span>
                <div className="bg-white border border-slate-300 p-1 rounded font-bold">SHT31</div>
                <ArrowDown className="h-3 w-3 mx-auto text-slate-400" />
                <div className="text-[10px] text-rose-700 font-semibold">No valid reading</div>
                <ArrowDown className="h-3 w-3 mx-auto text-slate-400" />
                <div className="bg-white border border-slate-300 p-1 rounded text-[10px]">ESP32 detects abnormal/missing data</div>
                <ArrowDown className="h-3 w-3 mx-auto text-slate-400" />
                <div className="bg-rose-100 text-rose-900 border border-rose-300 font-bold p-1 rounded text-[11px]">
                  ⚠ SENSOR FAILURE
                </div>
              </div>
            </div>

            {/* Health Checklist */}
            <div className="lg:col-span-5 rounded border border-slate-200 bg-white p-3.5 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-bold text-slate-900 uppercase">DEVICE HEALTH</span>
                <span className="text-[10px] text-slate-500">Diagnostics Check</span>
              </div>

              <div className="space-y-1 text-[11px] text-slate-700">
                <div className="flex justify-between items-center">
                  <span>✓ SHT31</span>
                  <span className={`font-bold ${simulatedFault ? 'text-rose-600' : 'text-slate-900'}`}>
                    {simulatedFault ? 'No Response' : 'Online'}
                  </span>
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

        {/* ROW: 07 (GPS + Motion) & 08 (Power) */}
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

              <div className="mt-4 grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded p-3 font-mono text-xs">
                <div className="space-y-1 text-center border-r border-slate-200 pr-2">
                  <span className="font-bold block text-slate-900">NEO-6M</span>
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
                  <span className="text-[10px] text-slate-600 block">Detect unusual vibration / movement</span>
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
                <div className="text-[10px] text-slate-600">DC-DC REGULATOR</div>
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
                Solar energy charges the battery while the BMS and regulated power rails protect and supply the electronics.
              </p>
            </div>
          </div>
        </div>

        {/* FEATURE 09: BLOCKCHAIN TRACEABILITY */}
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
            <span className="text-xs font-mono text-slate-500">Cryptographic Proof</span>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
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

            <div className="lg:col-span-7 rounded border border-slate-200 bg-white p-4 font-mono text-xs space-y-2">
              <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                <span className="font-bold text-slate-900 uppercase">BLOCKCHAIN RECORD</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  ● VERIFIED
                </span>
              </div>

              <div className="space-y-1.5 text-slate-700 text-[11px]">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Status</span>
                  <span className="font-bold text-emerald-700">● VERIFIED</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Batch</span>
                  <span className="font-bold text-slate-900">MANGO-2026-014</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Timestamp</span>
                  <span className="text-slate-900">30 Sep 2026 &bull; 20:42:{liveSeconds < 10 ? `0${liveSeconds}` : liveSeconds}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500">Record Hash</span>
                  <button
                    onClick={copyHash}
                    className="font-mono bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2 py-0.5 rounded text-slate-800 text-[10px] transition-colors flex items-center gap-1"
                    title="Click to copy hash"
                  >
                    <span>8f3a...91c2</span>
                    <span className="text-[9px] text-slate-500">{hashCopied ? '(copied)' : ''}</span>
                  </button>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-emerald-700 font-sans text-xs font-semibold">
                  <Check className="h-4 w-4" />
                  <span>Data integrity verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PART 2: ALL 10 SENSOR & MODULE WORKING SPECIFICATIONS                      */}
      {/* ========================================================================= */}
      <div className="space-y-5 pt-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Detailed Sensor & Module Operational Working
          </h2>
          <p className="text-xs text-slate-500">
            Technical electrical mechanisms, interface wiring, and real-world cold-chain food safety functions for all 10 onboard components.
          </p>
        </div>

        <div className="space-y-4">
          {sensorModules.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300"
            >
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
                    {item.num}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{item.hardware}</p>
                  </div>
                </div>

                <span className="rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-mono px-2 py-0.5">
                  {item.badge}
                </span>
              </div>

              {/* Two-Column Working & Role Grid */}
              <div className="mt-3.5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* How it Works & Electrical Circuit */}
                <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-700"></span>
                    <span>Working Principle & Electrical Circuit</span>
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    {item.working}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-500">
                    <strong className="text-slate-700">Interface:</strong> {item.wiring}
                  </div>
                </div>

                {/* Role in Nirvaha Food Traceability */}
                <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                    <span>Exact Role in Nirvaha Food Traceability</span>
                  </h4>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {item.projectRole}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
