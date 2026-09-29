import { useState } from 'react'
import { User, Eye, EyeOff, Check, Sprout, Truck, Building2, AlertCircle } from 'lucide-react'
import { ROLES, roleMeta } from '../lib/session'

export default function LoginScreen({ onLogin }) {
  const [role, setRole] = useState('farmer')
  const [username, setUsername] = useState('Rajesh Patil')
  const [password, setPassword] = useState('demo1234')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [signupModal, setSignupModal] = useState(false)

  const rolePresets = {
    farmer: { name: 'Rajesh Patil', label: 'Farmer', icon: Sprout },
    transporter: { name: 'Suresh Gaikwad', label: 'Transporter', icon: Truck },
    buyer: { name: 'Vikram Mehta', label: 'Buyer', icon: Building2 },
  }

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole)
    if (rolePresets[selectedRole]) {
      setUsername(rolePresets[selectedRole].name)
    }
    setError('')
  }

  const submit = (e) => {
    e.preventDefault()
    if (!username.trim()) {
      setError('Please enter your username.')
      return
    }
    setError('')
    setBusy(true)

    setTimeout(() => {
      setBusy(false)
      onLogin({
        role,
        name: username.trim(),
        rememberMe,
      })
    }, 350)
  }

  return (
    <div
      className="anim-fade-in relative flex min-h-screen w-full items-center justify-center p-3 sm:p-6"
      style={{
        backgroundImage: "url('/transporte-de-alimentos-scaled.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Subtle vignette/depth overlay for contrast */}
      <div className="anim-fade-in pointer-events-none absolute inset-0 bg-black/15 backdrop-blur-[1px]" />
      <div className="pointer-events-none absolute -left-24 top-1/4 h-[420px] w-[420px] animate-aurora rounded-full bg-emerald-400/10 blur-[110px]" />
      <div className="pointer-events-none absolute -right-24 bottom-1/4 h-[380px] w-[380px] animate-aurora2 rounded-full bg-sky-400/10 blur-[110px]" />

      {/* Glassmorphism Card matching user reference */}
      <div className="anim-bounce-in relative z-10 w-full max-w-[420px] rounded-[24px] sm:rounded-[32px] border border-white/60 bg-white/[0.12] p-5 sm:p-9 shadow-2xl backdrop-blur-xl">

        {/* Role switcher pills */}
        <div className="anim-fade-down mb-5 flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 rounded-full border border-white/30 bg-black/15 p-1 backdrop-blur-md" style={{ '--d': '150ms' }}>
          {Object.entries(rolePresets).map(([key, item], i) => {
            const Icon = item.icon
            const active = role === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleRoleChange(key)}
                style={{ '--d': `${200 + i * 70}ms` }}
                className={`anim-pop flex items-center gap-1 sm:gap-1.5 rounded-full px-2.5 py-1 text-[11px] sm:px-3 sm:text-xs font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-white/30 text-white shadow-sm ring-1 ring-white/50 backdrop-blur-sm'
                    : 'text-white/70 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform duration-300 ${active ? 'scale-110' : ''}`} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* Heading */}
        <div className="anim-fade-up mb-5 sm:mb-6" style={{ '--d': '260ms' }}>
          <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-3xl md:text-[34px]">
            Login
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-normal text-white/90 drop-shadow-xs">
            Welcome back please login to your account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={submit} className="space-y-4">
          {/* User Name Field */}
          <div className="relative flex items-center rounded-2xl border border-white/50 bg-white/10 px-4 py-1.5 transition-all duration-200 focus-within:border-white focus-within:bg-white/20 focus-within:ring-2 focus-within:ring-white/30">
            <input
              id="login-username"
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

          {/* Password Field */}
          <div className="relative flex items-center rounded-2xl border border-white/50 bg-white/10 px-4 py-1.5 transition-all duration-200 focus-within:border-white focus-within:bg-white/20 focus-within:ring-2 focus-within:ring-white/30">
            <input
              id="login-password"
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

          {/* Remember Me */}
          <div className="flex items-center pt-0.5">
            <button
              type="button"
              id="remember-me-btn"
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

          {/* Error Message */}
          {error && (
            <div className="anim-shake flex items-center gap-2 rounded-xl border border-rose-300/40 bg-rose-500/20 px-3.5 py-2 text-xs font-medium text-rose-100 backdrop-blur-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Button with exact olive green gradient */}
          <button
            type="submit"
            id="login-submit-btn"
            disabled={busy}
            style={{
              background: 'linear-gradient(180deg, #99ae47 0%, #5d7522 100%)',
            }}
            className="sheen press w-full cursor-pointer overflow-hidden rounded-2xl border border-[#b4ce55]/40 py-3.5 text-center text-[16.5px] font-semibold text-white shadow-md shadow-emerald-950/20 transition-all duration-200 hover:brightness-105 hover:shadow-lg active:scale-[0.99] disabled:opacity-75"
          >
            {busy ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="anim-spin h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Footer: Signup prompt */}
        <div className="anim-fade-up mt-5 text-center" style={{ '--d': '420ms' }}>
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

      {/* Simple Demo Signup Modal */}
      {signupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadein">
          <div className="w-full max-w-sm rounded-3xl border border-white/40 bg-white/20 p-6 text-white shadow-2xl backdrop-blur-xl">
            <h3 className="text-xl font-bold">Create an Account</h3>
            <p className="mt-2 text-xs text-white/80">
              This demo build currently operates with pre-configured verified credentials for Farmer, Transporter, and Buyer roles. Select a role from the top pills to sign in instantly.
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
