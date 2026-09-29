import { useEffect, useState } from 'react'
import { Check, Copy, Fingerprint, Loader2, X } from 'lucide-react'

const AUTO_ADVANCE_MS = 2600

export default function BatchIdModal({ batch, isOpen, onClose }) {
  const [copied, setCopied] = useState(false)
  const [advancing, setAdvancing] = useState(false)

  useEffect(() => {
    if (!isOpen || !batch) return undefined
    setCopied(false)
    setAdvancing(false)
    const timer = setTimeout(() => {
      setAdvancing(true)
      setTimeout(onClose, 500)
    }, AUTO_ADVANCE_MS)
    return () => clearTimeout(timer)
  }, [isOpen, batch, onClose])

  if (!isOpen || !batch) return null

  const handleCopy = () => {
    navigator.clipboard?.writeText(batch.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="anim-fade-in fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
      <div className="anim-pop relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <Fingerprint className="h-6 w-6" />
        </div>

        <h3 className="mt-3 text-lg font-bold text-slate-900">Batch Registered</h3>
        <p className="mt-1 text-xs text-slate-500">
          Your journey has started. This is the ID to share with the Transporter &amp; Buyer.
        </p>

        <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-4">
          <span className="font-mono text-lg font-bold tracking-wide text-slate-900">{batch.id}</span>
          <button
            onClick={handleCopy}
            title="Copy Batch ID"
            className="rounded p-1 text-slate-400 hover:text-slate-700"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-500"
        >
          {advancing ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Opening dashboard
            </span>
          ) : (
            'Go to Dashboard'
          )}
        </button>

        <p className="mt-2 text-[11px] text-slate-400">Taking you to the dashboard automatically</p>
      </div>
    </div>
  )
}
