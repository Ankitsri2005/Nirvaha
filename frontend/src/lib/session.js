// Local session for the demo console. Phase 2 swaps this for a real JWT.

export const SESSION_KEY = 'foodtrace.session.v1'

export const ROLES = [
  {
    key: 'farmer',
    label: 'Farmer',
    emoji: '🌱',
    blurb: 'Registers a batch, watches its journey and shares the tracking QR.',
  },
  {
    key: 'transporter',
    label: 'Transporter',
    emoji: '🚚',
    blurb: 'Logs route checkpoints and reefer climate updates.',
  },
  {
    key: 'buyer',
    label: 'Buyer',
    emoji: '🏢',
    blurb: 'Verifies farm origin and performs the final quality check.',
  },
]

/** Only the farmer console is built out right now. */
export const LIVE_ROLES = ['farmer']

export const roleMeta = (key) => ROLES.find((r) => r.key === key) || null

export const readSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && roleMeta(parsed.role) ? parsed : null
  } catch {
    return null
  }
}

export const writeSession = (session) => {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    else localStorage.removeItem(SESSION_KEY)
  } catch {
    /* private mode - the demo still works in memory */
  }
  return session
}
