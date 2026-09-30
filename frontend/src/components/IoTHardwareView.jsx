import React from 'react'
import {
  ArrowLeft,
  Zap,
  ShieldCheck,
  CheckCircle,
  Activity,
  Cpu,
  MapPin,
  Radio
} from 'lucide-react'

export default function IoTHardwareView({ onBack }) {
  const sensorModules = [
    {
      id: 'enose-ethylene',
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
      title: 'DS3231 High-Precision Real-Time Clock (RTC)',
      badge: 'Tamper-Proof Time',
      hardware: 'DS3231 SN I2C RTC with integrated TCXO and CR2032 lithium coin cell backup',
      wiring: 'I2C bus (SDA: GPIO 21, SCL: GPIO 22, Address 0x68). 3.3V logic.',
      working:
        'An internal Temperature-Compensated Crystal Oscillator (TCXO) dynamically tunes crystal capacitance across temperature variations (-40°C to +85°C), maintaining precision under ±2 ppm (less than 1 minute drift per year).',
      projectRole:
        'Provides unalterable legal timestamps for regulatory food safety audits (HACCP/FDA). When the transport enters underground tunnels, cold storage basements, or remote zones with zero GPS satellite or cellular signals, the DS3231 ensures every reading has an authenticated timestamp.'
    },
    {
      id: 'microsd',
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
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Nirvaha IoT Hardware Node
              </h1>
              <span className="rounded-full bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Node: ESP32-COLD-01 (Active)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Self-powered cold-chain monitoring unit with multi-gas AI ripening prediction & GPS tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs font-bold text-emerald-700">
          <Radio className="h-4 w-4 text-emerald-600 animate-pulse" />
          <span>Active Field Node</span>
        </div>
      </div>

      {/* Hardware In-Box Image Showcase */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              HARDWARE DESIGN & ASSEMBLED FIELD ENCLOSURE
            </h2>
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              IP67 Industrial Reefer Unit
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete self-contained IoT node fitted inside an industrial weatherproof enclosure with cable glands, internal power regulation, and external sensor leads.
          </p>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-2 shadow-inner">
          <div className="flex justify-center items-center bg-slate-900/60 rounded-xl overflow-hidden p-2">
            <img
              src="hardware_enclosure.jpg"
              alt="Assembled Nirvaha IoT hardware node fitted into the IP67 weatherproof enclosure"
              className="max-h-[620px] w-auto object-contain rounded-lg"
              loading="eager"
            />
          </div>
        </div>
      </div>

      {/* HOW EACH SENSOR WORKS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            How Each Sensor & Module Works in this Project
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed technical description of each physical sensor, its electrical interface, and its exact function in the Nirvaha food traceability system.
          </p>
        </div>

        <div className="mt-6 space-y-6">
          {sensorModules.map((item, index) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 hover:bg-slate-50 transition-all shadow-xs"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-bold shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{item.hardware}</p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 uppercase tracking-wide">
                  {item.badge}
                </span>
              </div>

              {/* Card Content Grid */}
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Working Principle */}
                <div className="rounded-xl bg-white p-4 border border-slate-200/80">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    <span>How it Works & Electrical Circuit</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.working}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500">
                    <strong className="text-slate-700">Interface:</strong> {item.wiring}
                  </div>
                </div>

                {/* Role in Project */}
                <div className="rounded-xl bg-emerald-50/50 p-4 border border-emerald-200/70">
                  <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Exact Role in Nirvaha Food Traceability</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
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
