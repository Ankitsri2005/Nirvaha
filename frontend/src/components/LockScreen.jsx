import { Link, useNavigate } from 'react-router-dom'
import { Lock, ArrowLeft, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { allowedFor } from '../lib/nav'

/** Shown when a signed-in role tries to open a page it has no access to. */
export default function LockScreen() {
  const { role, roleMeta } = useAuth()
  const navigate = useNavigate()
  const first = allowedFor(role)[0]

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="panel max-w-md p-8 text-center">
        <span
          className="mx-auto grid h-14 w-14 place-items-center rounded-2xl"
          style={{ background: `${roleMeta?.accent}18`, color: roleMeta?.accent }}
        >
          <Lock size={24} />
        </span>
        <h2 className="mt-4 text-[17px] font-bold text-cream">Not available for your role</h2>
        <p className="mt-2 text-[12px] leading-relaxed text-cream-dim">
          You are signed in as <span className="font-semibold" style={{ color: roleMeta?.accent }}>{roleMeta?.label}</span>.{' '}
          {roleMeta?.blurb}
        </p>
        <div className="mt-6 flex gap-2">
          <button onClick={() => navigate(-1)} className="btn-ghost flex-1 text-[11.5px]">
            <ArrowLeft size={13} /> Go back
          </button>
          <Link to={first?.to || '/dashboard'} className="btn-primary flex-1 text-[11.5px]">
            <LayoutDashboard size={13} /> My pages
          </Link>
        </div>
        <p className="mt-5 text-[10.5px] text-cream-faint">
          Role menus are filtered client-side now. The API enforces the same matrix server-side in phase 2.
        </p>
      </div>
    </div>
  )
}
