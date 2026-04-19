'use client';

import type { SwapRecord } from '@/hooks/useSwapHistory';

interface Props {
  records: SwapRecord[];
  loading: boolean;
  onClose: () => void;
}

export default function SwapHistory({ records, loading, onClose }: Props) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'var(--bg-card)',
      borderRadius: '28px',
      border: '1px solid var(--border-2)',
      zIndex: 10,
      display: 'flex', flexDirection: 'column',
      animation: 'slide-up 0.2s ease',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '1.25rem 1.25rem 0.875rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <h3 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '0.9375rem', margin: 0 }}>
            Transaction History
          </h3>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* List */}
      <div style={{ overflowY: 'auto', flex: 1, padding: '0.5rem 0.75rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem 0' }}>
            <span className="animate-spin" style={{
              width: '1.25rem', height: '1.25rem', borderRadius: '50%',
              border: '2px solid var(--accent-green)', borderTopColor: 'transparent', display: 'block',
            }} />
          </div>
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.5" style={{ marginBottom: '0.75rem' }}>
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>No transactions yet</p>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
              Your swaps will appear here
            </p>
          </div>
        ) : (
          records.map(rec => <HistoryRow key={rec.id} rec={rec} />)
        )}
      </div>
    </div>
  );
}

// ─── Single history row ────────────────────────────────────────────────────────

function HistoryRow({ rec }: { rec: SwapRecord }) {
  const date = new Date(rec.ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const amtIn  = formatAmt(rec.amountIn);
  const amtOut = formatAmt(rec.amountOut);

  return (
    <div style={{
      padding: '0.875rem 0.5rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '0.75rem',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
        {/* Swap icon */}
        <div style={{
          width: '2rem', height: '2rem', borderRadius: '50%', flexShrink: 0,
          background: 'var(--bg-card-2)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2.5">
            <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
            <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
          </svg>
        </div>

        <div style={{ minWidth: 0 }}>
          {/* Token pair + amounts */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.875rem' }}>
              {amtIn} {rec.tokenIn}
            </span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
            <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.875rem' }}>
              {amtOut} {rec.tokenOut}
            </span>
          </div>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>{date}</span>
        </div>
      </div>

      {/* Tonscan link */}
      <a
        href={`https://tonscan.org/tx/${encodeURIComponent(rec.txHash)}`}
        target="_blank"
        rel="noopener noreferrer"
        title="View on Tonscan"
        style={{ color: 'var(--text-dim)', flexShrink: 0, display: 'flex' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-green)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
          <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      </a>
    </div>
  );
}

function formatAmt(raw: string): string {
  const n = parseFloat(raw);
  if (isNaN(n)) return raw;
  if (n >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (n >= 1) return n.toFixed(4).replace(/\.?0+$/, '');
  return n.toPrecision(4);
}
