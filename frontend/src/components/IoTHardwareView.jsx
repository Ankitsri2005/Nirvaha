import {
  Cpu,
  Battery,
  Radio,
  Wifi,
  CheckCircle,
  HardDrive,
  Activity,
  ArrowLeft,
  Zap,
  MapPin,
  Thermometer,
  Droplets
} from 'lucide-react'

export default function IoTHardwareView({ onBack }) {
  const hardwareSpecs = [
    {
      component: 'Microcontroller',
      part: 'ESP32 NodeMCU Development Board',
      details: 'Xtensa Dual-Core 32-bit LX6 @ 240MHz, 520KB SRAM, 4MB Flash',
      status: 'Active'
    },
    {
      component: 'Temperature Sensor',
      part: 'DS18B20 Stainless Waterproof Probe',
      details: 'OneWire Protocol, Range: -55°C to +125°C, Accuracy: ±0.5°C',
      status: 'GPIO 4 (4.7kΩ Pullup)'
    },
    {
      component: 'Humidity Sensor',
      part: 'DHT22 / AM2302 Digital Sensor',
      details: 'Range: 0-100% RH, Accuracy: ±2% RH, Sampling: 0.5 Hz',
      status: 'GPIO 15'
    },
    {
      component: 'GPS Location Tracker',
      part: 'u-blox NEO-6M GPS Receiver',
      details: 'Ceramic patch antenna, 50-channel tracking engine, 1-second update',
      status: 'UART2 (RX2: 16, TX2: 17)'
    },
    {
      component: 'Gas / Spoilage Sensor',
      part: 'MQ-135 Air Quality Sensor',
      details: 'Analog NH3 / VOC output, 5V heater supply, 10kΩ+20kΩ divider to 3.3V ADC',
      status: 'ADC1 (GPIO 34)'
    },
    {
      component: 'Tamper Switch',
      part: 'Reed Switch (Door Seal)',
      details: 'Normally-closed contact on door frame, opens on seal breach, internal pull-up',
      status: 'GPIO 32 (Pullup)'
    },
    {
      component: 'Onboard Display',
      part: '0.96" Blue I2C OLED (SSD1306)',
      details: '128x64 pixels, displays live Temp, Humidity, and GPS status',
      status: 'I2C (SDA: 21, SCL: 22)'
    },
    {
      component: 'Offline Buffer',
      part: 'microSD Card Module (SPI)',
      details: 'Offline telemetry buffer for tunnel / no-signal transits, flushed on reconnect',
      status: 'SPI (CS 13, MOSI 23, MISO 19, SCK 18)'
    },
    {
      component: 'Power Module',
      part: '3.7V Rechargeable Li-ion Battery Pack',
      details: 'Battery pack with TP4056 micro-USB charging & safety cut-off',
      status: '3.7V / 4.1V Charged'
    },
    {
      component: 'Voltage Regulator',
      part: 'Buck Converter (LM2596 / MP1584)',
      details: '3.7V battery to regulated 5V rail for GPS module and MQ-135 heater',
      status: '5V Rail'
    }
  ]

  const pinoutTable = [
    { component: 'DS18B20 Probe', vcc: '3.3V', gnd: 'GND', data: 'GPIO 4', pullup: 'OneWire / 4.7 kΩ' },
    { component: 'DHT22 Humidity', vcc: '3.3V', gnd: 'GND', data: 'GPIO 15', pullup: 'OneWire / internal' },
    { component: 'MQ-135 Gas', vcc: '5V (heater)', gnd: 'GND', data: 'ADC1_CH6 (34)', pullup: 'Analog in, 10kΩ/20kΩ divider' },
    { component: 'Reed Tamper Switch', vcc: '3.3V', gnd: 'GND', data: 'GPIO 32', pullup: 'Internal pull-up, active-high' },
    { component: 'NEO-6M GPS', vcc: '5V (3.3V backup)', gnd: 'GND', data: 'RX2 (16) / TX2 (17)', pullup: 'UART2 / 9600 baud' },
    { component: '0.96" OLED', vcc: '3.3V', gnd: 'GND', data: 'SDA (21) / SCL (22)', pullup: 'I2C bus, addr 0x3C' },
    { component: 'microSD Module', vcc: '3.3V', gnd: 'GND', data: 'CS 13 / MOSI 23 / MISO 19 / SCK 18', pullup: 'SPI (VSPI) / 20 MHz' },
    { component: 'Li-ion Battery', vcc: 'VIN (5V/3.7V)', gnd: 'GND', data: 'ADC1_CH7 (35)', pullup: 'Analog in, 2:1 divider' },
    { component: 'Buck Regulator', vcc: 'VIN (battery)', gnd: 'GND', data: '5V rail out', pullup: 'MP1584 / LM2596' }
  ]

  return (
    <div className="space-y-6">
      {/* Header with Back button */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-paper px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-blush transition-colors shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span>IoT Hardware Setup</span>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                ESP32 Node Online
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Food Cold-Chain Sensor Node &bull; Microcontroller wiring & telemetry specs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Transmitting Telemetry Every 5s</span>
        </div>
      </div>

      {/* Main Hardware Photo Showcase */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">COLD-CHAIN IOT HARDWARE SETUP</h2>
          </div>
          <span className="font-mono text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
            Node: ESP32-COLD-01
          </span>
        </div>

        {/* Embedded Real Hardware Photo */}
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner">
          <img
            src="hardware.jpg"
            alt="Cold-Chain IoT Hardware Setup with ESP32, DS18B20 probe, DHT22 sensor, MQ-135 gas sensor, reed tamper switch, NEO-6M GPS, OLED display and microSD buffer"
            className="mx-auto max-h-[520px] w-full object-contain"
            loading="eager"
          />
        </div>

        {/* Quick summary strip directly under photo */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="text-slate-400 block text-[11px] font-semibold">OLED Live Display</span>
            <span className="font-bold text-slate-900">7.8°C / 86.4% RH</span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="text-slate-400 block text-[11px] font-semibold">Probe Immersion</span>
            <span className="font-bold text-emerald-700">Submerged & Sealed</span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="text-slate-400 block text-[11px] font-semibold">GPS Satellites</span>
            <span className="font-bold text-slate-900">9 Locked (NEO-6M)</span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="text-slate-400 block text-[11px] font-semibold">Battery Voltage</span>
            <span className="font-bold text-emerald-700">4.12V (94% Charged)</span>
          </div>
        </div>
      </div>

      {/* Component Specifications */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            HARDWARE COMPONENTS & MODULE SPECS
          </h2>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {hardwareSpecs.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {item.component}
                </span>
                <span className="font-mono text-[11px] font-semibold text-emerald-700">
                  {item.status}
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 mt-1">{item.part}</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">{item.details}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Complete GPIO Pinout & Connection Mapping */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            ESP32 GPIO PINOUT & WIRING TABLE
          </h2>
          <span className="text-xs text-slate-500 font-medium">Standard 30-pin DevKit</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold">
                <th className="pb-2.5 font-bold">Connected Module</th>
                <th className="pb-2.5 font-bold">VCC</th>
                <th className="pb-2.5 font-bold">GND</th>
                <th className="pb-2.5 font-bold">ESP32 Pin / GPIO</th>
                <th className="pb-2.5 font-bold">Bus / Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {pinoutTable.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="py-2.5 font-bold text-slate-900">{row.component}</td>
                  <td className="py-2.5 text-slate-600">{row.vcc}</td>
                  <td className="py-2.5 text-slate-600">{row.gnd}</td>
                  <td className="py-2.5 font-mono font-bold text-emerald-700">{row.data}</td>
                  <td className="py-2.5 text-slate-500">{row.pullup}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Telemetry Packet Stream */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">LIVE SENSOR TELEMETRY PACKET STREAM</h3>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Listening on MQTT / HTTP
          </span>
        </div>

        <div className="mt-4 font-mono text-xs rounded-xl bg-slate-900 p-4 text-emerald-400 overflow-x-auto space-y-1">
          <p className="text-slate-500">// Real-time JSON packet from ESP32 Node 01:</p>
          <p>{JSON.stringify({
            node: 'ESP32-COLD-01',
            batch_id: 'BATCH-MNG-9041',
            timestamp: new Date().toISOString(),
            temperature_c: 7.8,
            humidity_rh: 86.4,
            gps: { lat: 17.720, lng: 73.390, speed_kmh: 52.4, sats: 9 },
            battery_v: 4.12,
            battery_pct: 94,
            tamper_seal: 'SECURE_OK',
            oled_status: 'DISPLAY_OK'
          }, null, 2)}</p>
        </div>
      </div>
    </div>
  )
}
