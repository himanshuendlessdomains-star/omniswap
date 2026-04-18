'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Token } from '@/types';
import { TON_TOKENS } from '@/lib/tokens';

interface Props {
  value: Token | null;
  onChange: (t: Token) => void;
  exclude?: Token | null;
  label: string;
}

export default function TokenSelector({ value, onChange, exclude, label }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const options = TON_TOKENS.filter(t =>
    t.address !== exclude?.address &&
    (t.symbol.toLowerCase().includes(query.toLowerCase()) ||
     t.name.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="d-flex align-items-center gap-2 px-3 py-2 flex-shrink-0 transition-all"
        style={{
          background: value ? 'var(--bg-card-2)' : 'var(--accent-green)',
          border: '1px solid var(--border-2)',
          color: value ? 'var(--text)' : '#030803',
          borderRadius: '14px',
        }}
      >
        {value ? (
          <>
            <TokenIcon token={value} size={22} />
            <span className="fw-semibold text-sm">{value.symbol}</span>
            <ChevronDown />
          </>
        ) : (
          <span className="fw-semibold text-sm px-1">{label}</span>
        )}
      </button>

      {/* Modal */}
      {open && (
        <div className="position-fixed top-0 start-0 bottom-0 end-0 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 50 }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-100 max-w-sm overflow-hidden animate-slide-up"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-2)', borderRadius: '24px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-bottom" style={{ borderColor: 'var(--border)' }}>
              <h3 className="fw-semibold mb-3" style={{ color: 'var(--text)' }}>Select token</h3>
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by name or symbol…"
                className="w-100 px-3 py-2 text-sm outline-none"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  color: 'var(--text)',
                }}
              />
            </div>
            <div className="max-h-72 overflow-y-auto">
              {options.map(token => (
                <button
                  key={token.address}
                  onClick={() => { onChange(token); setOpen(false); setQuery(''); }}
                  className="w-100 d-flex align-items-center gap-3 px-4 py-3 transition-colors text-start"
                  style={{ color: 'var(--text)', background: 'transparent', border: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <TokenIcon token={token} size={32} />
                  <div>
                    <div className="fw-semibold text-sm">{token.symbol}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{token.name}</div>
                  </div>
                  {token.balance && (
                    <span className="ms-auto text-sm" style={{ color: 'var(--text-muted)' }}>{token.balance}</span>
                  )}
                </button>
              ))}
              {options.length === 0 && (
                <p className="text-center py-4 text-sm mb-0" style={{ color: 'var(--text-muted)' }}>No tokens found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TokenIcon({ token, size }: { token: Token; size: number }) {
  return (
    <div className="rounded-circle overflow-hidden flex-shrink-0"
      style={{ width: size, height: size, background: 'var(--bg-card-2)' }}>
      <Image
        src={token.logoUrl}
        alt={token.symbol}
        width={size}
        height={size}
        className="object-cover"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    </div>
  );
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
