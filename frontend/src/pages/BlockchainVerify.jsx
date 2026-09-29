import { useMemo, useState } from 'react'
import { ShieldCheck, ShieldAlert, Link2, Fingerprint, Lock, Rocket, Bug, Blocks } from 'lucide-react'
import { useShipments } from '../context/ShipmentContext'
import { cx, fmtDateTime } from '../lib/format'
import { C } from '../lib/palette'
import Badge from '../components/Badge'

/** Stands in for hashing_service.py. Same shape, weaker guarantee. */
const pseudoHash = (s) => {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (Math.abs(h >>> 0) >>> 0).toString(16).padStart(8, '0')
}

const canonical = (cp) =>
  `${cp.batchId}|${cp.type}|${cp.location}|${cp.handler}|${new Date(cp.timestamp).toISOString()}|${cp.temperature}|${cp.humidity}`

export default function BlockchainVerify() {
  const { batches, checkpoints } = useShipments()
  const [batchId, setBatchId] = useState(batches[0]?.id)
  const [tampered, setTampered] = useState(null)

  const rows = useMemo(
    () =>
      checkpoints
        .filter((c) => c.batchId === batchId)
        .slice()
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
    [checkpoints, batchId],
  )

  /**
   * Two chains are built. `anchored` is the chain that was written to the ledger
   * when each checkpoint was recorded; `live` is the chain recomputed from the
   * rows as they sit in the database right now. They agree until someone edits a
   * row, at which point every entry from that point on diverges.
   */
  const buildChain = (list, view) => {
    let prev = '0x0'
    return list.map((cp) => {
      const row = view && view.id === cp.id ? { ...cp, ...view.patch } : cp
      const hash = `0x${pseudoHash(`${canonical(row)}|${prev}`)}`
      const entry = { ...cp, hash, prev }
      prev = hash
      return entry
    })
  }

  const anchored = useMemo(() => buildChain(rows, null), [rows])
  const chain = useMemo(() => buildChain(rows, tampered), [rows, tampered])
  const brokenFrom = useMemo(
    () => chain.findIndex((c, i) => c.hash !== anchored[i]?.hash),
    [chain, anchored],
  )

  const tamperedIndex = tampered ? rows.findIndex((r) => r.id === tampered.id) : -1
  const intact = brokenFrom < 0
  const brokenCount = intact ? 0 : chain.length - brokenFrom

  return (
    <div className="space-y-4">
      {/* phase banner */}
      <div className="panel relative overflow-hidden border-orbit-400/30">
        <span className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-orbit-400/12 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-4 p-5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-orbit-400/40 bg-orbit-400/12 text-orbit-300">
            <Blocks size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[15px] font-bold text-cream">Ledger verification</h2>
              <Badge tone="orbit">Phase 6 preview</Badge>
            </div>
            <p className="mt-1 text-[11.5px] leading-relaxed text-cream-dim">
              This page shows the verification contract the Solidity layer will enforce. Right now the
              chain is recomputed in the browser with a non-cryptographic hash so the tamper demo can be
              rehearsed before <span className="mono text-cream-dim">FoodTraceability.sol</span> exists.
            </p>
          </div>
        </div>
      </div>

      {/* batch picker */}
      <div className="flex flex-wrap gap-1.5">
        {batches.map((b) => (
          <button
            key={b.id}
            onClick={() => {
              setBatchId(b.id)
              setTampered(null)
            }}
            className={cx(
              'mono rounded-xl border px-3 py-2 text-[11.5px] font-semibold transition-all duration-200',
              b.id === batchId
                ? 'border-orbit-400/60 bg-orbit-400/12 text-orbit-300'
                : 'border-rim-soft bg-abyss-850/60 text-cream-faint hover:border-rim-bright',
            )}
          >
            {b.id}
            <span className="ml-2 text-[10px] opacity-60">{checkpoints.filter((c) => c.batchId === b.id).length}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
        {/* verification result */}
        <div className="space-y-4">
          <div
            className={cx(
              'panel overflow-hidden p-6 text-center transition-all duration-500',
              intact ? 'border-thermal-safe/45' : 'border-thermal-crit/55 animate-flashcrit',
            )}
          >
            <span
              className={cx(
                'mx-auto grid h-16 w-16 place-items-center rounded-2xl transition-colors duration-500',
                intact ? 'bg-thermal-safe/12 text-thermal-safe' : 'bg-thermal-crit/15 text-thermal-crit',
              )}
            >
              {intact ? <ShieldCheck size={30} /> : <ShieldAlert size={30} />}
            </span>
            <h3
              className={cx(
                'mt-4 text-[22px] font-extrabold tracking-tight',
                intact ? 'text-thermal-safe' : 'text-thermal-crit',
              )}
            >
              {intact ? 'Verified' : 'Tampered'}
            </h3>
            <p className="mx-auto mt-2 max-w-xs text-[11.5px] leading-relaxed text-cream-dim">
              {intact
                ? `${chain.length} custody entries recomputed and matched. Nobody has rewritten history.`
                : `Entry #${tamperedIndex + 1} was edited in the database. Its recomputed hash no longer matches the value anchored for it, and so does every entry after it.`}
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2.5 border-t border-rim-soft pt-4 text-left">
              <Metric k="Entries" v={chain.length} />
              <Metric k="Matched" v={chain.length - brokenCount} color={intact ? C.safe : C.crit} />
              <Metric k="Broken" v={brokenCount} color={intact ? C.safe : C.crit} />
            </div>
          </div>

          {/* tamper rehearsal */}
          <div className="panel overflow-hidden">
            <div className="panel-head">
              <span className="panel-title">
                <Bug size={13} className="text-thermal-crit" /> Tamper rehearsal
              </span>
              <Badge tone="muted">demo only</Badge>
            </div>
            <div className="p-5">
              <p className="text-[11.5px] leading-relaxed text-cream-dim">
                In the real demo you run an <span className="mono text-cream">UPDATE</span> against the{' '}
                <span className="mono text-cream">checkpoints</span> table and reload this page. Here you
                can reproduce the identical result with a button.
              </p>

              <div className="mt-4 space-y-2">
                {rows.map((r, i) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <span className="mono w-8 text-[10.5px] text-cream-faint">#{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-[11.5px] text-cream-dim">{r.type}</span>
                    <button
                      onClick={() => setTampered(tampered?.id === r.id ? null : { id: r.id, patch: { temperature: 14.8, handler: 'edited.in.db' } })}
                      className={cx(
                        'rounded-lg border px-2.5 py-1 text-[10.5px] font-semibold transition-colors',
                        tampered?.id === r.id
                          ? 'border-thermal-crit/60 bg-thermal-crit/12 text-thermal-crit'
                          : 'border-rim-soft bg-abyss-900 text-cream-faint hover:border-thermal-crit/50 hover:text-thermal-crit',
                      )}
                    >
                      {tampered?.id === r.id ? 'restore' : 'edit row'}
                    </button>
                  </div>
                ))}
              </div>

              {tampered && (
                <button onClick={() => setTampered(null)} className="btn-ghost mt-4 w-full text-[11.5px]">
                  <Lock size={13} /> Restore original row
                </button>
              )}
            </div>
          </div>
        </div>

        {/* chain detail */}
        <div className="panel overflow-hidden">
          <div className="panel-head">
            <span className="panel-title">
              <Fingerprint size={13} className="text-orbit-300" /> Recomputed hashes
            </span>
            <span className="mono text-[10.5px] text-cream-faint">{batchId}</span>
          </div>

          <div className="max-h-[620px] overflow-y-auto p-4">
            <div className="space-y-2">
              {chain.map((c, i) => {
                const ok = i < brokenFrom
                return (
                  <div
                    key={c.id}
                    className={cx(
                      'relative rounded-xl border p-3 transition-colors',
                      ok ? 'border-rim-soft bg-abyss-900/50' : 'animate-flashcrit border-thermal-crit/60 bg-thermal-crit/8',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cx(
                          'grid h-6 w-6 shrink-0 place-items-center rounded-md text-[10px] font-bold',
                          ok ? 'bg-thermal-safe/15 text-thermal-safe' : 'bg-thermal-crit/18 text-thermal-crit',
                        )}
                      >
                        {ok ? <Link2 size={11} /> : <ShieldAlert size={11} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-semibold text-cream">{c.type}</span>
                        <span className="block truncate text-[10.5px] text-cream-faint">{c.location}</span>
                      </span>
                      <span className="mono shrink-0 text-[9.5px] text-cream-faint">{fmtDateTime(c.timestamp)}</span>
                    </div>

                    <div className="mt-2 space-y-1 border-t border-rim-soft pt-2">
                      <p className="mono break-all text-[10px] text-orbit-300">hash {c.hash}</p>
                      <p className="mono break-all text-[9.5px] text-cream-faint/70">prev {c.prev}</p>
                      {!ok && (
                        <p className="mono text-[10px] font-semibold text-thermal-crit">
                          recomputed {c.hash} &ne; anchored {anchored[i].hash}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="border-t border-rim-soft p-4">
            <p className="flex items-start gap-2 text-[10.5px] leading-relaxed text-cream-faint">
              <Rocket size={12} className="mt-0.5 shrink-0 text-glacier-300" />
              Phase 6 replaces this with <span className="mono text-cream-dim">hashing_service.py</span> (SHA-256),{' '}
              <span className="mono text-cream-dim">blockchain_service.py</span> (writes on registration,
              handovers, critical alerts and delivery only) and{' '}
              <span className="mono text-cream-dim">verification_service.py</span>, anchored to a local
              Hardhat chain first and Sepolia if a public link is wanted.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Metric({ k, v, color }) {
  return (
    <div>
      <p className="label">{k}</p>
      <p className="mono text-[17px] font-semibold" style={{ color: color || C.dim }}>
        {v}
      </p>
    </div>
  )
}
