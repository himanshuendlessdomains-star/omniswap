'use client';

import type { TradePhase } from '@/types';

interface Props {
  phase: TradePhase;
  txHash?: string;
}

const PHASES: { phase: TradePhase; label: string }[] = [
  { phase: 'awaiting_transfer', label: 'Awaiting transfer' },
  { phase: 'transferring',      label: 'Transferring' },
  { phase: 'swapping',          label: 'Swapping' },
  { phase: 'receiving_funds',   label: 'Receiving funds' },
  { phase: 'trade_settled',     label: 'Settled' },
];

const PHASE_ORDER = PHASES.map(p => p.phase);

export default function TradeStatus({ phase, txHash }: Props) {
  if (phase === 'idle') return null;

  const currentIdx = PHASE_ORDER.indexOf(phase);
  const settled = phase === 'trade_settled';

  return (
    <div className="p-4 animate-slide-up"
      style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border-2)', borderRadius: '20px' }}>

      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="fw-semibold text-sm mb-0" style={{ color: 'var(--text)' }}>Trade in progress</h4>
        {settled && (
          <span className="d-flex align-items-center gap-1-5 text-xs fw-medium"
            style={{ color: 'var(--accent-green)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Complete
          </span>
        )}
      </div>

      {/* Step track */}
      <div className="d-flex align-items-center">
        {PHASES.map((p, i) => {
          const done    = i < currentIdx;
          const active  = i === currentIdx;
          const pending = i > currentIdx;
          return (
            <div key={p.phase} className={`d-flex align-items-center${i < PHASES.length - 1 ? ' flex-grow-1' : ''}`}>
              <div className="d-flex flex-column align-items-center gap-1">
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center text-xs fw-bold transition-all${
                    done    ? ' bg-accent-green'             :
                    active  ? ' border border-2 animate-pulse-green' :
                    pending ? ' border'                      : ''
                  }`}
                  style={{
                    width: '1.5rem',
                    height: '1.5rem',
                    background: done ? 'var(--accent-green)' : undefined,
                    color: done ? '#030803' : pending ? 'var(--text-dim)' : undefined,
                    borderColor: active ? 'var(--accent-green)' : undefined,
                  }}>
                  {done
                    ? '✓'
                    : active
                      ? <span className="dot-md rounded-circle" style={{ background: 'var(--accent-green)' }} />
                      : ''}
                </div>
                <span className="text-nowrap"
                  style={{ fontSize: '0.625rem', color: active ? 'var(--accent-green)' : done ? 'var(--text-muted)' : 'var(--text-dim)' }}>
                  {p.label}
                </span>
              </div>
              {i < PHASES.length - 1 && (
                <div className="flex-grow-1 mx-1 mb-3 h-px transition-all"
                  style={{ background: done ? 'var(--accent-green)' : 'var(--border)' }} />
              )}
            </div>
          );
        })}
      </div>

      {txHash && (
        <a
          href={`https://tonscan.org/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 d-flex align-items-center gap-1-5 text-xs text-decoration-none transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-green)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          View on Tonscan
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      )}
    </div>
  );
}
