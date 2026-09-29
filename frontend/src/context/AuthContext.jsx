import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  authenticate,
  demoUserFor,
  readStoredAuth,
  STORAGE_KEY,
  roleAccent,
  ROLE_META,
} from '../lib/nav'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredAuth())

  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* private mode - demo still works in memory */
    }
  }, [user])

  const login = useCallback((username, password) => {
    const res = authenticate(username, password)
    if (res.ok) setUser(res.user)
    return res
  }, [])

  const logout = useCallback(() => setUser(null), [])

  /**
   * Demo-only role switch. There is no server session to change, so we adopt the
   * matching demo identity wholesale; phase 2 replaces this with a re-issued token.
   */
  const switchRole = useCallback((role) => {
    if (!ROLE_META[role]) return
    setUser(() => {
      const demo = demoUserFor(role)
      return demo ? { ...demo, avatarSeed: demo.name } : { id: role, name: ROLE_META[role].label, role }
    })
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthed: Boolean(user),
      role: user?.role ?? null,
      roleMeta: user ? ROLE_META[user.role] : null,
      accent: user ? roleAccent(user.role) : null,
      login,
      logout,
      switchRole,
    }),
    [user, login, logout, switchRole],
  )

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
