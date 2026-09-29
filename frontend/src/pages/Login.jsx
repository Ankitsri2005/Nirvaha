import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { User, Eye, EyeOff, Check, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { DEMO_USERS, ROLE_META } from '../data/mockData'
import { canAccess, landingFor } from '../lib/nav'

export default function Login() {
  const { isAuthed, role, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('admin.farmchain')
  const [password, setPassword] = useState('demo1234')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [signupModal, setSignupModal] = useState(false)

  // already signed in? go straight to a page this role can actually open
  if (isAuthed) return <Navigate to={landingFor(role)} replace />

  const submit = (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setTimeout(() => {
      const res = login(username, password)
      setBusy(false)
      if (!res.ok) return setError(res.error)
      const from = location.state?.from
      const target = from && canAccess(res.user.role, from) ? from : landingFor(res.user.role)
      navigate(target, { replace: true })
    }, 380)
  }

  const quick = (u) => {
    setUsername(u.username)
    setPassword(u.password)
    setError('')
  }

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center p-4 sm:p-6"
      style={{
        backgroundImage: "url('/transporte-de-alimentos-scaled.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Subtle vignette/depth overlay for contrast */}
      <div className="pointer-events-none absolute inset-0 bg-black/15 backdrop-blur-[1px]" />

      {/* Glassmorphic Login Card */}
      <div className="relative z-10 w-full max-w-[420px] rounded-[32px] border border-white/60 bg-white/[0.12] p-7 shadow-2xl backdrop-blur-xl sm:p-9">
        
        {/* Quick Demo Switcher */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-white/30 bg-black/15 p-1 backdrop-blur-md">
          {DEMO_USERS.map((u) => {
            const meta = ROLE_META[u.role]
            const active = username === u.username
            return (
              <button
                key={u.username}
                type="button"
                onClick={() => quick(u)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-white/30 text-white shadow-sm ring-1 ring-white/50 backdrop-blur-sm'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {meta?.label || u.name}
              </button>
            )
          })}
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-[34px]">
            Login
          </h1>
          <p className="mt-1.5 text-sm font-normal text-white/90 drop-shadow-xs">
            Welcome back please login to your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-4">
          {/* Username */}
          <div className="relative flex items-center rounded-2xl border border-white/50 bg-white/10 px-4 py-1.5 transition-all duration-200 focus-within:border-white focus-within:bg-white/20 focus-within:ring-2 focus-within:ring-white/30">
            <input
              id="page-username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError('')
              }}
              placeholder="User Name"
              autoComplete="username"
              className="!w-full !border-0 !bg-transparent !p-2 !text-base !font-medium !text-white !placeholder-white/70 !outline-none !ring-0 focus:!ring-0"
            />
            <User className="h-5 w-5 shrink-0 text-white/80" strokeWidth={1.8} />
          </div>

          {/* Password */}
          <div className="relative flex items-center rounded-2xl border border-white/50 bg-white/10 px-4 py-1.5 transition-all duration-200 focus-within:border-white focus-within:bg-white/20 focus-within:ring-2 focus-within:ring-white/30">
            <input
              id="page-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              className="!w-full !border-0 !bg-transparent !p-2 !text-base !font-medium !text-white !placeholder-white/70 !outline-none !ring-0 focus:!ring-0"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ml-1 text-white/80 transition-colors hover:text-white focus:outline-none"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <Eye className="h-5 w-5 shrink-0" strokeWidth={1.8} />
              ) : (
                <EyeOff className="h-5 w-5 shrink-0" strokeWidth={1.8} />
              )}
            </button>
          </div>

          {/* Remember me */}
          <div className="flex items-center pt-0.5">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className="group flex cursor-pointer items-center gap-2.5 select-none focus:outline-none"
            >
              <div
                className={`flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border transition-all duration-150 ${
                  rememberMe
                    ? 'border-[#92a83e] bg-[#8ba436] text-white shadow-xs'
                    : 'border-white/60 bg-white/10 group-hover:border-white'
                }`}
              >
                {rememberMe && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </div>
              <span className="text-[13.5px] font-normal text-white/95 drop-shadow-xs">
                Remember me
              </span>
            </button>
          </div>

          {/* Error notice */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-300/40 bg-rose-500/20 px-3.5 py-2 text-xs font-medium text-rose-100 backdrop-blur-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={busy}
            style={{
              background: 'linear-gradient(180deg, #99ae47 0%, #5d7522 100%)',
            }}
            className="w-full cursor-pointer rounded-2xl border border-[#b4ce55]/40 py-3.5 text-center text-[16.5px] font-semibold text-white shadow-md shadow-emerald-950/20 transition-all duration-200 hover:brightness-105 active:scale-[0.99] disabled:opacity-75"
          >
            {busy ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-5 text-center">
          <p className="text-[13px] text-white/90 drop-shadow-xs">
            Don’t have an account?{' '}
            <button
              type="button"
              onClick={() => setSignupModal(true)}
              className="font-bold text-white transition-opacity hover:underline"
            >
              Signup
            </button>
          </p>
        </div>
      </div>

      {/* Demo Signup Modal */}
      {signupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadein">
          <div className="w-full max-w-sm rounded-3xl border border-white/40 bg-white/20 p-6 text-white shadow-2xl backdrop-blur-xl">
            <h3 className="text-xl font-bold">Create an Account</h3>
            <p className="mt-2 text-xs text-white/80">
              This demo build currently operates with pre-configured verified credentials. Choose any role preset to explore the system.
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSignupModal(false)}
                className="rounded-xl bg-white/25 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/35"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
