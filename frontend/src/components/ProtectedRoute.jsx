import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { canAccess } from '../lib/nav'
import LockScreen from './LockScreen'

/** Sends anonymous visitors to the login page, remembering where they wanted to go. */
export default function ProtectedRoute({ children }) {
  const { isAuthed, role } = useAuth()
  const location = useLocation()

  if (!isAuthed) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (!canAccess(role, location.pathname)) return <LockScreen />
  return children
}
