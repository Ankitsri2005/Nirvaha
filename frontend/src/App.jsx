import { useState, useEffect } from 'react'
import {
  Sprout,
  Truck,
  Building2,
  QrCode,
  PlusCircle,
  User,
  ArrowLeft,
  LogOut,
  Menu
} from 'lucide-react'
import { useScrollReveal } from './hooks/useScrollReveal'

import { getStoredBatches } from './data/batches'
import { readSession, writeSession } from './lib/session'
import LoginScreen from './components/LoginScreen'
import TopJourneyBar from './components/TopJourneyBar'
import SidebarNav from './components/SidebarNav'
import MobileBottomNav from './components/MobileBottomNav'
import CurrentShipmentCard from './components/CurrentShipmentCard'
import ConditionCard from './components/ConditionCard'
import TemperatureChart from './components/TemperatureChart'
import FoodConditionCard from './components/FoodConditionCard'
import ActiveAlertsCard from './components/ActiveAlertsCard'
import RecentBatchesTable from './components/RecentBatchesTable'
import LiveMap from './components/LiveMap'
import JourneyTimeline from './components/JourneyTimeline'
import IoTHardwareView from './components/IoTHardwareView'
import AlertsView from './components/AlertsView'
import BatchesView from './components/BatchesView'
import BatchQRModal from './components/BatchQRModal'
import RegisterBatchModal from './components/RegisterBatchModal'
import TransporterActionModal from './components/TransporterActionModal'
import BuyerActionModal from './components/BuyerActionModal'

export default function App() {
  const [session, setSession] = useState(() => readSession())
  const [batches, setBatches] = useState(() => getStoredBatches())

  const role = session?.role || 'farmer'

  const [selectedBatchId, setSelectedBatchId] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const paramBatch = params.get('batch')
    const all = getStoredBatches()
    if (paramBatch && all[paramBatch]) return paramBatch
    return 'BATCH-MNG-9041'
  })

  const [activeView, setActiveView] = useState('dashboard')

  const changeView = (view) => {
    setActiveView(view)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isTransporterModalOpen, setIsTransporterModalOpen] = useState(false)
  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const currentBatch = batches[selectedBatchId] || Object.values(batches)[0]

  const roleProfiles = {
    farmer: { name: 'Rajesh Patil', roleLabel: 'FARMER' },
    transporter: { name: 'Suresh Gaikwad', roleLabel: 'TRANSPORTER' },
    buyer: { name: 'Vikram Mehta', roleLabel: 'BUYER' }
  }

  const baseProfile = roleProfiles[role] || roleProfiles.farmer
  const currentProfile = {
    ...baseProfile,
    name: session?.name?.trim() || baseProfile.name
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set('batch', selectedBatchId)
    params.set('role', role)
    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', newUrl)
  }, [selectedBatchId, role])

  const handleSelectBatch = (id) => {
    if (batches[id]) {
      setSelectedBatchId(id)
    }
  }

  const handleBatchCreated = (newBatch) => {
    const updated = getStoredBatches()
    setBatches(updated)
    setSelectedBatchId(newBatch.id)
    setIsQRModalOpen(true)
  }

  const handleBatchUpdated = (updatedBatch) => {
    const all = getStoredBatches()
    all[updatedBatch.id] = updatedBatch
    try {
      localStorage.setItem('food_traceability_batches_v2', JSON.stringify(all))
    } catch (e) {}
    setBatches({ ...all })
  }

  const handleLogin = (next) => {
    setSession(writeSession(next))
  }

  const handleLogout = () => {
    setSession(writeSession(null))
  }

  const revealKpi = useScrollReveal()
  const revealShipment = useScrollReveal()
  const revealCharts = useScrollReveal()
  const revealAlerts = useScrollReveal()
  const revealBatches = useScrollReveal()

  if (!session) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans anim-fade-in flex flex-col">
      {/* Sidebar Navigation (Desktop permanent + Mobile slide-over drawer) */}
      <SidebarNav
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeView={activeView}
        onSelectView={changeView}
        alertsCount={2}
        batchesCount={Object.keys(batches).length}
        currentProfile={currentProfile}
        role={role}
        onLogout={handleLogout}
        onOpenQR={() => setIsQRModalOpen(true)}
        onOpenRoleAction={() => {
          if (role === 'farmer') setIsRegisterModalOpen(true)
          if (role === 'transporter') setIsTransporterModalOpen(true)
          if (role === 'buyer') setIsBuyerModalOpen(true)
        }}
      />

      {/* Main Content Area (Offset by lg:pl-64 on desktop) */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-md px-3 py-2.5 sm:px-6 sm:py-3">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2.5">
              {/* Mobile Hamburger Menu Button (Matches user reference) */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 lg:hidden shadow-xs active:scale-95 transition-all"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div
                onClick={() => changeView('dashboard')}
                className="group flex cursor-pointer items-center gap-2 sm:gap-2.5"
                title="Go to Home Overview"
              >
                <div className="anim-float flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-plum text-white shadow-xs transition-transform duration-300 group-hover:scale-105 shrink-0">
                  <Sprout className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.4]" />
                </div>
                <div>
                  <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-none block">
                    Nirvaha
                  </span>
                  <p className="hidden text-[10px] font-mono text-slate-500 uppercase tracking-wider sm:block mt-0.5">
                    Cold-Chain OS
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* SOS / Alert Pill Badge (Matches reference screenshot style) */}
              <button
                onClick={() => changeView('alerts')}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-600 to-red-600 px-3 py-1 text-xs font-black text-white shadow-sm ring-2 ring-rose-200/80 hover:from-rose-700 hover:to-red-700 active:scale-95 transition-all"
                title="View Active Cold-Chain Alerts"
              >
                <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
                <span>Alerts (2)</span>
              </button>

              <div className="hidden items-center gap-2 rounded-xl border border-plum-tint bg-plum-tint px-3 py-1.5 text-xs font-semibold text-plum md:flex">
                <User className="h-3.5 w-3.5 text-slate-500" />
                <span>{currentProfile.name}</span>
              </div>

              <div className="hidden sm:flex items-center rounded-xl border border-slate-200 bg-white p-1 pl-2 sm:pl-2.5 shadow-xs">
                <span className="text-xs sm:text-sm anim-float">{currentProfile.icon}</span>
                <span className="px-1 text-[11px] sm:text-xs font-bold uppercase text-slate-800">
                  {currentProfile.roleLabel}
                </span>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  aria-label="Sign out"
                  className="ml-1 flex cursor-pointer items-center gap-1 rounded-lg border border-line p-1 sm:px-2 sm:py-1 text-xs font-bold text-muted hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Sign out</span>
                </button>
              </div>

              <button
                onClick={() => setIsQRModalOpen(true)}
                className="flex cursor-pointer items-center gap-1 rounded-xl border border-line bg-paper px-2 py-1.5 sm:px-3 text-xs font-bold text-slate-700 shadow-xs hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md"
                title="Share QR code"
              >
                <QrCode className="anim-pulse-dot h-3.5 w-3.5 sm:h-4 sm:w-4 text-plum" />
                <span className="hidden sm:inline">QR</span>
              </button>

              {role === 'farmer' && (
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="flex cursor-pointer items-center gap-1 rounded-xl bg-plum px-2.5 py-1.5 sm:px-3.5 text-xs font-bold text-white shadow-xs hover:-translate-y-0.5 hover:bg-plum-dark hover:shadow-lg"
                >
                  <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Batch</span>
                </button>
              )}

              {role === 'transporter' && (
                <button
                  onClick={() => setIsTransporterModalOpen(true)}
                  className="flex cursor-pointer items-center gap-1 rounded-xl bg-plum px-2.5 py-1.5 sm:px-3.5 text-xs font-bold text-white shadow-xs hover:-translate-y-0.5 hover:bg-plum-dark hover:shadow-lg"
                >
                  <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Log</span>
                </button>
              )}

              {role === 'buyer' && (
                <button
                  onClick={() => setIsBuyerModalOpen(true)}
                  className="flex cursor-pointer items-center gap-1 rounded-xl bg-plum px-2.5 py-1.5 sm:px-3.5 text-xs font-bold text-white shadow-xs hover:-translate-y-0.5 hover:bg-plum-dark hover:shadow-lg"
                >
                  <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Verify</span>
                </button>
              )}
            </div>
          </div>
        </header>

        <TopJourneyBar
          currentStageIndex={currentBatch?.currentStageIndex ?? 4}
          activeView={activeView}
          onSelectView={changeView}
        />

        <main className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6 pb-24 lg:pb-8 flex-1">
          <div key={activeView} className="view-enter">
          {activeView === 'hardware' && (
            <IoTHardwareView onBack={() => changeView('dashboard')} />
          )}

          {activeView === 'timeline' && (
            <div className="space-y-4">
              <div className="anim-fade-down flex items-center justify-between border-b border-slate-200 pb-3">
                <button
                  onClick={() => changeView('dashboard')}
                  className="press flex items-center gap-1.5 rounded-xl border border-line bg-paper px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:-translate-y-0.5 hover:border-line-strong hover:text-plum hover:shadow-md"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </button>
                <span className="anim-fade-in font-mono rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                  Batch: {currentBatch.id} ({currentBatch.product})
                </span>
              </div>
              <JourneyTimeline batch={currentBatch} />
            </div>
          )}

          {activeView === 'alerts' && (
            <AlertsView onBack={() => changeView('dashboard')} />
          )}

          {activeView === 'map' && (
            <div className="space-y-4">
              <div className="anim-fade-down flex items-center justify-between border-b border-slate-200 pb-3">
                <button
                  onClick={() => changeView('dashboard')}
                  className="press flex items-center gap-1.5 rounded-xl border border-line bg-paper px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:-translate-y-0.5 hover:border-line-strong hover:text-plum hover:shadow-md"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </button>
                <span className="anim-fade-in flex items-center gap-2 rounded-lg border border-transit-tint bg-transit-tint px-3 py-1 text-xs font-bold text-transit">
                  <span className="relative flex h-2 w-2">
                    <span className="anim-pulse-ring absolute inline-flex h-full w-full rounded-full bg-transit" />
                    <span className="anim-pulse-dot relative inline-flex h-2 w-2 rounded-full bg-transit" />
                  </span>
                  Live GPS Active: {currentBatch.vehicleNumber} ({currentBatch.currentLocationName})
                </span>
              </div>
              <LiveMap batch={currentBatch} />
            </div>
          )}

          {activeView === 'batches' && (
            <BatchesView
              batches={batches}
              onSelectBatch={(id) => {
                handleSelectBatch(id)
                changeView('dashboard')
              }}
              onBack={() => changeView('dashboard')}
              onOpenQR={(b) => setIsQRModalOpen(true)}
              onOpenMap={() => changeView('map')}
            />
          )}

          {activeView === 'dashboard' && (
            <div>
              <div className="mb-6">
                <h1 className="anim-fade-up text-xl font-black text-slate-900">
                  Good morning, {currentProfile.name.split(' ')[0]}
                </h1>
                <p className="anim-fade-up mt-0.5 text-xs text-slate-500" style={{ '--d': '60ms' }}>
                  Here's the current health of your food shipments.
                </p>

                <div ref={revealKpi} className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 reveal-up" style={{ '--reveal-d': '80ms' }}>
                  <div
                    onClick={() => changeView('batches')}
                    className="sheen hover-lift cursor-pointer rounded-2xl border border-line bg-paper p-4 shadow-xs hover:border-line-strong"
                    title="Click to view all batches"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500">
                      <span>BATCHES</span>
                    </div>
                    <div className="mt-2 text-2xl font-black text-slate-900">12</div>
                    <p className="link-underline mt-1 inline-block text-[11px] font-medium text-slate-400">Click to view all &rarr;</p>
                  </div>

                  <div
                    onClick={() => changeView('map')}
                    className="sheen hover-lift cursor-pointer rounded-2xl border border-line bg-paper p-4 shadow-xs hover:border-line-strong"
                    title="Click to view live transit map"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500">
                      <span>TRANSIT</span>
                    </div>
                    <div className="mt-2 text-2xl font-black text-slate-900">5</div>
                    <p className="link-underline mt-1 inline-block text-[11px] font-semibold text-plum">Track live on map &rarr;</p>
                  </div>

                  <div
                    onClick={() => changeView('alerts')}
                    className="sheen hover-lift cursor-pointer rounded-2xl border border-line bg-paper p-4 shadow-xs hover:border-rose-300"
                    title="Click to view all alerts"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500">
                      <span>ALERTS</span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">2</span>
                      <span className="text-xs font-bold text-danger">1 Critical</span>
                    </div>
                    <p className="link-underline mt-1 inline-block text-[11px] font-medium text-danger">Review incidents &rarr;</p>
                  </div>

                  <div
                    onClick={() => changeView('hardware')}
                    className="sheen hover-lift cursor-pointer rounded-2xl border border-line bg-paper p-4 shadow-xs hover:border-line-strong"
                    title="Click to open IoT Hardware specs & photo"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500">
                      <span>DEVICES</span>
                    </div>
                    <div className="mt-2 text-2xl font-black text-slate-900">8 / 10</div>
                    <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-fresh">
                      <span className="anim-pulse-dot h-2 w-2 rounded-full bg-fresh"></span>
                      <span className="link-underline">View Hardware &rarr;</span>
                    </p>
                  </div>
                </div>
              </div>

              <div ref={revealShipment} className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-12 reveal-up" style={{ '--reveal-d': '60ms' }}>
                <div className="lg:col-span-8">
                  <CurrentShipmentCard
                    batch={currentBatch}
                    onOpenMap={() => changeView('map')}
                  />
                </div>
                <div className="lg:col-span-4">
                  <ConditionCard telemetry={currentBatch?.telemetry} />
                </div>
              </div>

              <div ref={revealCharts} className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-12 reveal-up" style={{ '--reveal-d': '80ms' }}>
                <div className="lg:col-span-8">
                  <TemperatureChart
                    currentTemp={currentBatch?.telemetry?.temperature || 7.8}
                    tempRange={currentBatch?.telemetry?.tempRange || [4, 10]}
                  />
                </div>
                <div className="lg:col-span-4">
                  <FoodConditionCard
                    freshnessScore={currentBatch?.telemetry?.freshnessScore || 94}
                    spoilageRisk={currentBatch?.telemetry?.spoilageRisk || 'Low'}
                  />
                </div>
              </div>

              <div ref={revealAlerts} className="mb-6 reveal-up" style={{ '--reveal-d': '60ms' }}>
                <ActiveAlertsCard onViewAll={() => changeView('alerts')} />
              </div>

              <div ref={revealBatches} className="mb-6 reveal-up" style={{ '--reveal-d': '80ms' }}>
                <RecentBatchesTable
                  batches={batches}
                  selectedId={selectedBatchId}
                  onSelectBatch={handleSelectBatch}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (Matches user reference) */}
      <MobileBottomNav
        activeView={activeView}
        onSelectView={changeView}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        alertsCount={2}
      />

      {/* Modals — rendered inside root div so z-index stacking works correctly on mobile */}
      <BatchQRModal
        batch={currentBatch}
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />

      <RegisterBatchModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onBatchCreated={handleBatchCreated}
      />

      <TransporterActionModal
        isOpen={isTransporterModalOpen}
        onClose={() => setIsTransporterModalOpen(false)}
        batch={currentBatch}
        onUpdate={handleBatchUpdated}
      />

      <BuyerActionModal
        isOpen={isBuyerModalOpen}
        onClose={() => setIsBuyerModalOpen(false)}
        batch={currentBatch}
        onUpdate={handleBatchUpdated}
      />
    </div>
  )
}
