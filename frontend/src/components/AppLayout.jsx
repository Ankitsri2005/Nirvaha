import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import AlertToasts from './AlertToasts'

export default function AppLayout() {
  const [navOpen, setNavOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <div className="relative min-h-screen bg-abyss-950">
      {/* animated aurora backdrop */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full bg-glacier-500/10 blur-[120px] animate-aurora" />
        <div className="absolute -right-32 top-1/4 h-[520px] w-[520px] rounded-full bg-orbit-400/8 blur-[130px] animate-aurora2" />
        <div className="absolute bottom-[-180px] left-1/3 h-[480px] w-[480px] rounded-full bg-thermal-safe/6 blur-[140px] animate-aurora" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(232,242,248,1) 1px, transparent 1px), linear-gradient(90deg, rgba(232,242,248,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at 50% 0%, black, transparent 72%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 0%, black, transparent 72%)',
          }}
        />
      </div>

      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="relative lg:pl-[264px]">
        <Navbar onMenu={() => setNavOpen(true)} />
        <main key={pathname} className="animate-slideinbottom px-4 pb-10 pt-5 lg:px-7">
          <Outlet />
        </main>
      </div>

      <AlertToasts />
    </div>
  )
}
