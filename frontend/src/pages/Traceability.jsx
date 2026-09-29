import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { GitBranch, ShieldCheck, Link2, Fingerprint, QrCode, Download, Boxes, ArrowUpRight, Sparkles } from 'lucide-react'
import Timeline, { CustodySteps } from '../components/Timeline'
import Badge from '../components/Badge'
import { useShipments } from '../context/ShipmentContext'
import { cx, fmtDate, fmtDateTime, shortId } from '../lib/format'
import { C } from '../lib/palette'

/* FNV-1a stands in for SHA-256 until hashing_service.py lands in phase 6. */
const pseudoHash = (s) => {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return Math.abs(h >>> 0).toString(16).padStart(8, '0')
}

const chainHash = (cp, prev) =>
  pseudoHash(`${cp.batchId}|${cp.type}|${cp.timestamp}|${cp.handler}|${prev}`)

export default function Traceability() {
  const { batches, checkpoints, shipments, selectedBatchId, setSelectedBatchId } = useShipments()
  const [selected, setSelected] = useState(null)

  const batch = batches.find((b) => b.id === selectedBatchId) || batches[0]
  const batchShipments = shipments.filter((s) => s.batchId === batch?.id)
  const rows = useMemo(
    () => checkpoints.filter((c) => c.batchId === batch?.id).slice().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
    [checkpoints, batch?.id],
  )

  /* each entry hashes its own payload plus the previous hash */
  const ledger = useMemo(() => {
    let prev = '0x0'
    return rows.map((cp) => {
      const hash = chainHash(cp, prev)
      const entry = { ...cp, hash, prev }
      prev = hash
      return entry
    })
  }, [rows])

  const active = selected ? ledger.find((l) => l.id === selected.id) : null

  return (
    <div className="space-y-4">
      {/* batch selector */}
      <div className="flex flex-wrap gap-1.5">
        {batches.map((b) => {
          const on = b.id === batch?.id
          return (
            <button
              key={b.id}
              onClick={() => setSelectedBatchId(b.id)}
              className={cx(
                'flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left transition-all duration-200',
                on ? 'border-orbit-400/55 bg-orbit-400/10' : 'border-rim-soft bg-abyss-850/60 hover:border-rim-bright',
              )}
            >
              <span className={cx('mono text-[12px] font-bold', on ? 'text-orbit-300' : 'text-cream-dim')}>{b.id}</span>
              <span className="hidden text-[10.5px] text-cream-faint sm:inline">{b.product}</span>
              <span className="mono text-[9.5px] text-cream-faint">{checkpoints.filter((c) => c.batchId === b.id).length} entries</span>
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        {/* timeline */}
        <div className="space-y-4">
          <div className="panel p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="panel-title">
                  <GitBranch size={13} className="text-orbit-300" /> Chain of custody
                </p>
                <p className="mt-1 text-[11.5px] text-cream-faint">
                  {batch?.product} &middot; harvested {fmtDate(batch?.harvestAt)} &middot; {batch?.farmName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="chip border-orbit-400/40 bg-orbit-400/10 text-orbit-300">
                  <Link2 size={10} /> {ledger.length} linked
                </span>
                <span className="chip border-rim bg-abyss-900 text-cream-dim">
                  {batchShipments.length} shipment{batchShipments.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <CustodySteps checkpoints={rows} total={5} />

            <Timeline
              className="mt-5"
              checkpoints={ledger.slice().reverse()}
              onSelect={(cp) => setSelected(cp.id === selected?.id ? null : cp)}
            />
          </div>
        </div>

        {/* right rail */}
        <div className="space-y-4">
          {/* QR card */}
          <div className="panel overflow-hidden">
            <div className="panel-head">
              <span className="panel-title">
                <QrCode size={13} /> Consumer-facing card
              </span>
              <button className="btn-icon h-7 w-7" title="Download">
                <Download size={13} />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-4">
                <QrBlock seed={batch?.id} />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold leading-tight text-cream">{batch?.product}</p>
                  <p className="mt-0.5 text-[11.5px] text-cream-dim">{batch?.variety}</p>
                  <p className="mono mt-2 text-[11px] text-glacier-300">{batch?.id}</p>
                  <p className="mt-1.5 text-[10.5px] text-cream-faint">{batch?.quantityCrates} crates &middot; {batch?.weightKg} kg</p>
                </div>
              </div>

              <dl className="mt-4 space-y-1.5 border-t border-rim-soft pt-3.5 text-[11px]">
                <Line k="Farm" v={batch?.farmName} />
                <Line k="Origin" v={batch?.location} />
                <Line k="Harvested" v={fmtDateTime(batch?.harvestAt)} />
                <Line k="Use by" v={fmtDate(batch?.expiryAt)} />
                <Line k="Cold chain" v={`${batch?.minTemp}\u2013${batch?.maxTemp}\u00b0C`} mono />
                <Line k="Certifications" v={batch?.certifications?.join(' · ')} />
              </dl>

              <Link
                to={`/batches/${batch?.id}`}
                className="btn-ghost mt-4 w-full text-[11.5px]"
              >
                Open full batch record <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>

          {/* ledger integrity */}
          <div className="panel overflow-hidden">
            <div className="panel-head">
              <span className="panel-title">
                <Fingerprint size={13} className="text-orbit-300" /> Hash chain
              </span>
              <Badge tone="muted">phase 6</Badge>
            </div>
            <div className="p-5">
              <p className="text-[11.5px] leading-relaxed text-cream-dim">
                Each entry commits to the previous one, so editing any historical row breaks every hash
                after it. Phase 6 anchors the head of the chain to a Solidity contract.
              </p>

              <div className="mt-4 max-h-64 space-y-1.5 overflow-y-auto pr-1">
                {ledger
                  .slice()
                  .reverse()
                  .map((l, i) => (
                    <div
                      key={l.id}
                      onClick={() => setSelected(l.id === selected?.id ? null : l.id)}
                      className={cx(
                        'cursor-pointer rounded-lg border px-2.5 py-2 transition-colors',
                        selected?.id === l.id
                          ? 'border-orbit-400/60 bg-orbit-400/10'
                          : 'border-rim-soft bg-abyss-900/50 hover:border-rim-bright',
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-cream-dim">
                          {i + 1}. {l.type}
                        </span>
                        <span className="mono text-[9.5px] text-cream-faint">#{ledger.length - i}</span>
                      </div>
                      <p className="mono mt-1 text-[10px] text-orbit-300">0x{l.hash}</p>
                      <p className="mono mt-0.5 text-[9.5px] text-cream-faint/70">prev 0x{l.prev}</p>
                    </div>
                  ))}
              </div>

              {active && (
                <div className="mt-4 animate-slideinbottom rounded-xl border border-orbit-400/30 bg-orbit-400/8 p-3">
                  <p className="label mb-1.5">Selected entry</p>
                  <p className="text-[12px] font-semibold text-cream">{active.type}</p>
                  <p className="mt-1 text-[10.5px] leading-relaxed text-cream-dim">{active.notes}</p>
                  <div className="mt-2 space-y-1">
                    <p className="mono break-all text-[10px] text-orbit-300">0x{active.hash}</p>
                    <p className="mono text-[9.5px] text-cream-faint">
                      {fmtDateTime(active.timestamp)} &middot; {active.handler}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* shipment ledger summary */}
      <section className="panel overflow-hidden">
        <div className="panel-head">
          <span className="panel-title">
            <Boxes size={13} /> All batch chains
          </span>
          <span className="flex items-center gap-1.5 text-[10.5px] text-cream-faint">
            <Sparkles size={11} className="text-orbit-300" /> entries are appended automatically on every handover
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>Batch</th>
                <th>Product</th>
                <th className="text-right">Entries</th>
                <th className="text-right">Handovers</th>
                <th>Last event</th>
                <th>Chain head</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => {
                const cps = checkpoints.filter((c) => c.batchId === b.id)
                const sorted = cps.slice().sort((x, y) => new Date(x.timestamp) - new Date(y.timestamp))
                let prev = '0x0'
                for (const cp of sorted) prev = chainHash(cp, prev)
                return (
                  <tr key={b.id}>
                    <td className="mono text-glacier-300">{b.id}</td>
                    <td className="font-medium text-cream">{b.product}</td>
                    <td className="mono text-right">{cps.length}</td>
                    <td className="mono text-right">{Math.max(0, cps.length - 1)}</td>
                    <td className="text-[11.5px]">
                      {sorted.length ? fmtDateTime(sorted[sorted.length - 1].timestamp) : '-'}
                    </td>
                    <td className="mono text-orbit-300">0x{prev}</td>
                    <td>
                      <span className="flex items-center gap-1.5 text-[11px] text-thermal-safe">
                        <ShieldCheck size={12} /> linked
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function Line({ k, v, mono }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-cream-faint">{k}</dt>
      <dd className={cx('truncate text-right text-cream-dim', mono && 'mono text-[10.5px]')}>{v || '-'}</dd>
    </div>
  )
}

/**
 * Deterministic "QR" drawn from the batch id. A real encoder is not needed for
 * a demo - the point is that the pattern is derived from, and unique to, the id.
 */
function QrBlock({ seed = '' }) {
  const cells = useMemo(() => {
    const n = 21
    const out = []
    let h = 0x811c9dc5
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i)
      h = Math.imul(h, 0x01000193)
    }
    for (let i = 0; i < n * n; i++) {
      h ^= h << 13
      h ^= h >>> 17
      h ^= h << 5
      const finder =
        (i < 7 && i % n < 7) ||
        (i < 7 && i % n > n - 8) ||
        (i > n - 8 && i % n < 7)
      out.push(finder ? 1 : (h >>> 3) % 3 === 0 ? 1 : 0)
    }
    return out
  }, [seed])
  const n = 21
  return (
    <div className="shrink-0 rounded-xl border border-rim bg-abyss-950 p-2">
      <svg width="104" height="104" viewBox={`0 0 ${n} ${n}`} className="rounded-md">
        {cells.map((v, i) =>
          v ? (
            <rect
              key={i}
              x={i % n}
              y={Math.floor(i / n)}
              width="1"
              height="1"
              rx="0.2"
              fill={C.glacier}
            />
          ) : null,
        )}
      </svg>
      <p className="mono mt-1.5 text-center text-[8.5px] text-cream-faint">{shortId(seed, 10)}</p>
    </div>
  )
}
