import React from 'react'
import {
  LayoutDashboard,
  GitBranch,
  AlertTriangle,
  Cpu,
  MapPin,
  Boxes,
  X,
  LogOut,
  User,
  QrCode,
  PlusCircle,
  Truck,
  Building2,
  Sprout
} from 'lucide-react'

export default function SidebarNav({
  isOpen,
  onClose,
  activeView,
  onSelectView,
  alertsCount = 2,
  batchesCount = 12,
  currentProfile,
  role,
  onLogout,
  onOpenQR,
  onOpenRoleAction
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timeline', label: 'Traceability', icon: GitBranch },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: alertsCount, badgeTone: 'danger' },
    { id: 'hardware', label: 'IoT Hardware', icon: Cpu },
    { id: 'map', label: 'Live Map', icon: MapPin },
    { id: 'batches', label: 'Batches', icon: Boxes, badge: batchesCount, badgeTone: 'neutral' }
  ]

  const handleNavClick = (viewId) => {
    onSelectView(viewId)
    if (onClose) onClose()
  }

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white text-slate-900">
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex cursor-pointer items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-plum text-white shadow-xs">
              <Sprout className="h-5 w-5 stroke-[2.4]" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-slate-900 block leading-tight">
                Nirvaha
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                Agri Cold-Chain OS
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-4 space-y-1">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-plum text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeTone === 'danger'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Quick Operations Section */}
        <div className="px-3 pt-2">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Quick Actions
          </p>
          <div className="space-y-1.5 px-1">
            <button
              onClick={() => {
                if (onOpenQR) onOpenQR()
                if (onClose) onClose()
              }}
              className="flex w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <QrCode className="h-4 w-4 text-plum" />
              <span>Share QR Passport</span>
            </button>

            {role === 'farmer' && (
              <button
                onClick={() => {
                  if (onOpenRoleAction) onOpenRoleAction()
                  if (onClose) onClose()
                }}
                className="flex w-full items-center gap-2.5 rounded-xl bg-plum px-3 py-2 text-xs font-bold text-white hover:bg-plum-dark transition-colors shadow-xs"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Register New Batch</span>
              </button>
            )}

            {role === 'transporter' && (
              <button
                onClick={() => {
                  if (onOpenRoleAction) onOpenRoleAction()
                  if (onClose) onClose()
                }}
                className="flex w-full items-center gap-2.5 rounded-xl bg-plum px-3 py-2 text-xs font-bold text-white hover:bg-plum-dark transition-colors shadow-xs"
              >
                <Truck className="h-4 w-4" />
                <span>Log Transit Waybill</span>
              </button>
            )}

            {role === 'buyer' && (
              <button
                onClick={() => {
                  if (onOpenRoleAction) onOpenRoleAction()
                  if (onClose) onClose()
                }}
                className="flex w-full items-center gap-2.5 rounded-xl bg-plum px-3 py-2 text-xs font-bold text-white hover:bg-plum-dark transition-colors shadow-xs"
              >
                <Building2 className="h-4 w-4" />
                <span>Verify Shipment</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User Footer Profile & Logout */}
      <div className="border-t border-slate-200 p-4 bg-slate-50/70">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-base shrink-0">{currentProfile?.icon || '👤'}</span>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 block truncate">
                {currentProfile?.name || 'User'}
              </span>
              <span className="text-[10px] font-mono uppercase text-slate-500 block">
                {currentProfile?.roleLabel || role}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Sign out"
            aria-label="Sign out"
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1.5 text-xs font-bold text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 transition-colors shadow-xs shrink-0"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden"
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Permanent Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white shadow-xs">
        {sidebarContent}
      </aside>
    </>
  )
}
