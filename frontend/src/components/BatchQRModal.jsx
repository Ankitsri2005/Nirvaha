import { useState } from 'react'
import { QrCode, Copy, Check, X, ShieldCheck } from 'lucide-react'

export default function BatchQRModal({ batch, isOpen, onClose }) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  if (!isOpen || !batch) return null

  const currentOrigin = window.location.origin
  const shareableUrl = `${currentOrigin}/?batch=${batch.id}`
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(
    shareableUrl
  )}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(batch.id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  return (
    <div className="anim-fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs">
      <div className="anim-pop relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-plum-tint text-plum">
            <QrCode className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-lg font-bold text-slate-900">Batch QR & Share Pass</h3>
          <p className="mt-1 text-xs text-slate-500">
            Share this QR code or Batch ID with the Transporter &amp; Buyer so they can pull up the same live
            journey from their own console.
          </p>
        </div>

        {/* QR Code Container */}
        <div className="mt-5 flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="anim-pop relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-sm">
            <span className="anim-pulse-ring pointer-events-none absolute inset-0 rounded-xl border-2 border-plum" />
            <img
              src={qrImageUrl}
              alt={`QR Code for batch ${batch.id}`}
              className="h-44 w-44 object-contain"
              loading="eager"
            />
          </div>

          <div className="mt-3 text-center">
            <div className="anim-fade-up flex items-center justify-center gap-1.5 font-mono text-sm font-bold text-slate-900" style={{ '--d': '250ms' }}>
              <span>{batch.id}</span>
              <button
                onClick={handleCopyId}
                title="Copy Batch ID"
                className="rounded p-1 text-slate-400 hover:text-slate-700"
              >
                {copiedId ? <Check className="h-3.5 w-3.5 text-plum" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <p className="anim-fade-up mt-0.5 text-xs font-medium text-slate-600" style={{ '--d': '320ms' }}>
              {batch.product} &bull; {batch.quantity}
            </p>
          </div>
        </div>

        {/* Direct Link Share */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Direct Tracking Link</label>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <input
              type="text"
              readOnly
              value={shareableUrl}
              className="w-full bg-transparent p-0 text-xs text-slate-700 focus:outline-none focus:ring-0 border-0"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 rounded-lg bg-plum px-3 py-1 text-xs font-semibold text-white hover:bg-plum-dark whitespace-nowrap transition-colors shadow-xs"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* Role instructions */}
        <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/60 p-3 text-[11px] text-rose-900">
          <div className="flex items-center gap-1.5 font-bold mb-1">
            <ShieldCheck className="h-3.5 w-3.5 text-rose" />
            <span>No separate login needed</span>
          </div>
          <p className="text-rose-800">
            When the Transporter or Buyer signs in, they pick their role, enter this Batch ID, and see the same live
            dashboard.
          </p>
        </div>

        {/* Done Button */}
        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-plum py-2.5 text-xs font-semibold text-white transition-colors hover:bg-plum-dark"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
