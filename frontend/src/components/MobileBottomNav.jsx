import React from 'react'
import {
  Home,
  GitBranch,
  AlertTriangle,
  Cpu,
  Menu
} from 'lucide-react'

export default function MobileBottomNav({
  activeView,
  onSelectView,
  onOpenSidebar,
  alertsCount = 2
}) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'timeline', label: 'Traceability', icon: GitBranch },
    { id: 'hardware', label: 'IoT Hardware', icon: Cpu },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: alertsCount },
    { id: 'menu', label: 'Menu', icon: Menu, isAction: true }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md px-2 py-1.5 shadow-lg lg:hidden">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeView === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.isAction) {
                  onOpenSidebar()
                } else {
                  onSelectView(tab.id)
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                isActive
                  ? 'bg-plum-tint/80 text-plum font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
