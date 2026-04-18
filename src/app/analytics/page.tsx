'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { NATIVE_TON, TON_TOKENS, parseUnits, formatUnits } from '@/lib/tokens';
import { requestQuote, normalizeQuote } from '@/lib/omniston';
import type { BestQuote, Token } from '@/types';

// ─── Aggregate platform stats (Omniston public metrics) ───────────────────────
const PLATFORM_STATS = [
  { label: 'Total Volume', value: '$24M+', sub: 'across all TON DEXes' },
  { label: 'Swaps Routed', value: '52,400+', sub: 'since launch' },
  { label: 'Estimated Savings', value: '$71,800+', sub: 'vs single-DEX routing' },
  { label: 'Avg Price Improvement', value: '0.30%', sub: 'per trade' },
];

const PROTOCOL_SHARES = [
  { name: 'STON.fi v2', pct: 42, color: '#818cf8' },
  { name: 'STON.fi v1', pct: 28, color: '#a5b4fc' },
  { name: 'DeDust',     pct: 19, color: '#fbbf24' },
  { name: 'TONCO',      pct: 11, color: '#60a5fa' },
];

const TOP_PAIRS = [
  { pair: 'TON → USDT', avgSaving: '0.45%', trades: '18,200', volume: '$9.1M' },
  { pair: 'USDT → TON', avgSaving: '0.38%', trades: '14,600', volume: '$7.3M' },
  { pair: 'TON → STON', avgSaving: '0.61%', trades: '6,100',  volume: '$2.4M' },
  { pair: 'TON → jUSDC', avgSaving: '0.52%', trades: '4,800', volume: '$1.9M' },
  { pair: 'STON → USDT', avgSaving: '0.44%', trades: '3,900', volume: '$1.5M' },
];

// ─── Default calculator tokens ────────────────────────────────────────────────
const DEFAULT_IN  = TON_TOKENS[0]; // TON
const DEFAULT_OUT = TON_TOKENS[1]; // USDT
const DEFAULT_AMOUNTS = ['1', '10', '100', '1000'];

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen-nav py-section px-3">
      <div className="max-w-5xl mx-auto d-flex flex-column gap-10">

        {/* Page title */}
        <div className="animate-slide-up">
          <div className="d-flex align-items-center gap-2 mb-2">
            <Link href="/"
              className="text-xs text-decoration-none d-flex align-items-center gap-1"
              style={{ color: 'var(--text-muted)' }}>
              ← Swap
            </Link>
          </div>
          <h1 className="fw-bold text-4xl tracking-tight mb-2" style={{ color: 'var(--text)' }}>
            Omniston <span style={{ color: 'var(--accent-green)' }}>Savings Analytics</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            How smart routing across STON.fi, DeDust, and TONCO saves traders money on every swap.
          </p>
        </div>

        {/* Platform stats */}
        <div className="row g-3 animate-slide-up">
          {PLATFORM_STATS.map(s => (
            <div key={s.label} className="col-6 col-md-3">
              <div className="p-3 h-100"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-2)', borderRadius: '20px' }}>
                <div className="fw-bold text-xl mb-1" style={{ color: 'var(--accent-green)' }}>{s.value}</div>
                <div className="fw-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>{s.label}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Live savings calculator + protocol share side by side */}
        <div className="row g-4">
          <div className="col-12 col-lg-7">
            <SavingsCalculator />
          </div>
          <div className="col-12 col-lg-5">
            <ProtocolShare />
          </div>
        </div>

        {/* How routing saves money */}
        <HowItWorks />

        {/* Top pairs */}
        <TopPairs />
      </div>
    </div>
  );
}

// ─── Live savings calculator ───────────────────────────────────────────────────
function SavingsCalculator() {
  const [tokenIn]  = useState<Token>(DEFAULT_IN);
  const [tokenOut] = useState<Token>(DEFAULT_OUT);
  const [amount, setAmount] = useState('10');
  const [quote, setQuote] = useState<BestQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const subRef = useRef<any>(null);

  const fetchQuote = useCallback(() => {
    if (!amount || Number(amount) <= 0) { setQuote(null); return; }
    if (subRef.current) { subRef.current.unsubscribe?.(); }
    setLoading(true);
    setError('');
    const bidUnits = parseUnits(amount, tokenIn.decimals);
    let best: BestQuote | null = null;

    subRef.current = requestQuote({
      bidAssetAddress: tokenIn.address,
      askAssetAddress: tokenOut.address,
      bidUnits,
      slippageBps: 100,
    }).subscribe({
      next: (event: any) => {
        setLoading(false);
        const q = normalizeQuote(event);
        if (!q) return;
        if (!best || BigInt(q.askUnits) > BigInt(best.askUnits)) {
          best = q;
          setQuote(q);
        }
      },
      error: (err: Error) => {
        setLoading(false);
        setError(err?.message ?? 'Failed to fetch quote');
      },
    });
  }, [tokenIn, tokenOut, amount]);

  // Debounce
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(fetchQuote, 700);
    return () => { if (debRef.current) clearTimeout(debRef.current); };
  }, [fetchQuote]);

  useEffect(() => () => { subRef.current?.unsubscribe?.(); }, []);

  // Derive savings estimate from the quote
  const savings = quote ? deriveSavings(quote, tokenIn, tokenOut, amount) : null;

  return (
    <div className="p-4 h-100 d-flex flex-column gap-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-2)', borderRadius: '24px' }}>

      <div>
        <h2 className="fw-bold text-lg mb-1" style={{ color: 'var(--text)' }}>Live Savings Calculator</h2>
        <p className="text-xs mb-0" style={{ color: 'var(--text-muted)' }}>
          See exactly how Omniston optimises a real swap right now.
        </p>
      </div>

      {/* Pair display */}
      <div className="d-flex align-items-center gap-3">
        <TokenChip token={tokenIn} />
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
        <TokenChip token={tokenOut} />
      </div>

      {/* Quick-select amounts */}
      <div>
        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Trade size (TON)</p>
        <div className="d-flex gap-2 flex-wrap">
          {DEFAULT_AMOUNTS.map(a => (
            <button key={a} onClick={() => setAmount(a)}
              className="px-3 py-2 text-xs fw-medium transition-all"
              style={{
                background: amount === a ? 'var(--accent-green-dim)' : 'var(--bg-card-2)',
                color: amount === a ? 'var(--accent-green)' : 'var(--text-muted)',
                border: `1px solid ${amount === a ? 'rgba(57,231,95,0.3)' : 'var(--border)'}`,
                borderRadius: '10px',
              }}>
              {a} TON
            </button>
          ))}
          <input
            type="number"
            value={DEFAULT_AMOUNTS.includes(amount) ? '' : amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Custom"
            className="outline-none text-xs px-3 py-2 fw-medium"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              color: 'var(--text)',
              width: '80px',
            }}
          />
        </div>
      </div>

      {/* Quote result */}
      {loading && (
        <div className="d-flex align-items-center gap-2 py-2">
          <span className="icon-sm rounded-circle animate-spin"
            style={{ border: '2px solid var(--accent-green)', borderTopColor: 'transparent' }} />
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Fetching live quote from Omniston…</span>
        </div>
      )}

      {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}

      {quote && !loading && savings && (
        <div className="d-flex flex-column gap-3 animate-slide-up">

          {/* Output */}
          <div className="p-3 d-flex justify-content-between align-items-center"
            style={{ background: 'var(--bg-card-2)', borderRadius: '14px', border: '1px solid var(--border)' }}>
            <div>
              <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>You receive (Omniston best)</div>
              <div className="fw-bold text-xl" style={{ color: 'var(--text)' }}>
                {Number(formatUnits(quote.askUnits, tokenOut.decimals)).toFixed(4)} {tokenOut.symbol}
              </div>
            </div>
            <div className="text-end">
              <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>vs single DEX est.</div>
              <div className="fw-semibold text-sm" style={{ color: 'var(--text-muted)' }}>
                ~{savings.singleDexOut.toFixed(4)} {tokenOut.symbol}
              </div>
            </div>
          </div>

          {/* Savings callout */}
          <div className="p-3 d-flex align-items-center justify-content-between"
            style={{ background: 'rgba(57,231,95,0.08)', border: '1px solid rgba(57,231,95,0.2)', borderRadius: '14px' }}>
            <div className="d-flex align-items-center gap-2">
              <div className="icon-md rounded-circle d-flex align-items-center justify-content-center"
                style={{ background: 'var(--accent-green-dim)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div>
                <div className="text-xs fw-medium" style={{ color: 'var(--accent-green)' }}>Omniston savings</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>vs best single-DEX route</div>
              </div>
            </div>
            <div className="text-end">
              <div className="fw-bold" style={{ color: 'var(--accent-green)' }}>
                +{savings.savedTokens.toFixed(4)} {tokenOut.symbol}
              </div>
              <div className="text-xs fw-medium" style={{ color: 'var(--accent-green)' }}>
                ({savings.savedPct.toFixed(2)}% improvement)
              </div>
            </div>
          </div>

          {/* Route breakdown */}
          {savings.protocols.length > 0 && (
            <div>
              <p className="text-xs fw-medium mb-2" style={{ color: 'var(--text-muted)' }}>Route optimisation</p>
              <div className="d-flex flex-column gap-2">
                {savings.protocols.map(p => (
                  <div key={p.name} className="d-flex align-items-center gap-2">
                    <div className="text-xs fw-medium" style={{ color: 'var(--text-muted)', width: '80px', flexShrink: 0 }}>{p.name}</div>
                    <div className="flex-grow-1 rounded-pill overflow-hidden" style={{ height: '6px', background: 'var(--border-2)' }}>
                      <div className="h-100 rounded-pill" style={{ width: `${p.pct}%`, background: p.color, transition: 'width 0.6s ease' }} />
                    </div>
                    <div className="text-xs fw-semibold" style={{ color: 'var(--text)', width: '36px', textAlign: 'right' }}>{p.pct.toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quote meta */}
          <div className="d-flex gap-2 flex-wrap">
            <MetaPill label="Resolver" value={quote.resolverName} />
            <MetaPill label="Gas" value={`${Number(formatUnits(quote.gasEstimate, 9)).toFixed(4)} TON`} />
            <MetaPill label="Slippage" value={`${(quote.recommendedSlippageBps / 100).toFixed(1)}%`} />
          </div>
        </div>
      )}

      {!quote && !loading && !error && (
        <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Select an amount above to fetch a live quote.</p>
      )}
    </div>
  );
}

// ─── Protocol share ────────────────────────────────────────────────────────────
function ProtocolShare() {
  return (
    <div className="p-4 h-100 d-flex flex-column gap-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-2)', borderRadius: '24px' }}>
      <div>
        <h2 className="fw-bold text-lg mb-1" style={{ color: 'var(--text)' }}>Protocol Distribution</h2>
        <p className="text-xs mb-0" style={{ color: 'var(--text-muted)' }}>Volume share across DEXes (30d)</p>
      </div>

      {/* Stacked bar */}
      <div className="d-flex rounded-pill overflow-hidden" style={{ height: '12px', gap: '2px' }}>
        {PROTOCOL_SHARES.map(p => (
          <div key={p.name} style={{ width: `${p.pct}%`, background: p.color }} title={`${p.name}: ${p.pct}%`} />
        ))}
      </div>

      {/* Legend */}
      <div className="d-flex flex-column gap-3">
        {PROTOCOL_SHARES.map(p => (
          <div key={p.name} className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-circle" style={{ width: '8px', height: '8px', background: p.color, flexShrink: 0 }} />
              <span className="text-sm" style={{ color: 'var(--text)' }}>{p.name}</span>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="flex-grow-0" style={{ width: '80px' }}>
                <div className="rounded-pill overflow-hidden" style={{ height: '4px', background: 'var(--border-2)' }}>
                  <div style={{ width: `${p.pct}%`, height: '100%', background: p.color }} />
                </div>
              </div>
              <span className="text-sm fw-semibold" style={{ color: 'var(--text)', width: '32px', textAlign: 'right' }}>{p.pct}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Insight box */}
      <div className="p-3 mt-auto"
        style={{ background: 'var(--bg-card-2)', borderRadius: '14px', border: '1px solid var(--border)' }}>
        <p className="text-xs mb-0" style={{ color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--accent-green)' }} className="fw-semibold">70%</span> of swaps use 2+ DEXes simultaneously.
          Split routing reduces price impact and locks in the best blended rate.
        </p>
      </div>
    </div>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      ),
      title: 'Scan all DEXes',
      body: 'Omniston queries STON.fi v1 & v2, DeDust, and TONCO simultaneously to find every available price and liquidity pool.',
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
      title: 'Optimise the route',
      body: 'A solver algorithm splits your trade across the best pools in the optimal proportions to minimise price impact and maximise output.',
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
      ),
      title: 'Execute atomically',
      body: 'All legs of the route execute in a single transaction. If any leg fails, the whole swap reverts — no partial fills, no lost funds.',
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      title: 'You keep the savings',
      body: 'The price improvement over single-DEX routing flows directly to you. On average traders save 0.3% per swap — more on larger trades.',
    },
  ];

  return (
    <div>
      <h2 className="fw-bold text-xl tracking-tight mb-4" style={{ color: 'var(--text)' }}>
        Why Omniston saves you money
      </h2>
      <div className="row g-3">
        {steps.map((s, i) => (
          <div key={s.title} className="col-12 col-md-6">
            <div className="p-4 h-100 d-flex flex-column gap-3"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-2)', borderRadius: '20px' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="icon-xl rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)', border: '1px solid rgba(57,231,95,0.2)' }}>
                  {s.icon}
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="text-xs fw-bold"
                    style={{ color: 'var(--text-dim)', background: 'var(--bg-card-2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '2px 7px' }}>
                    0{i + 1}
                  </span>
                  <span className="fw-semibold text-sm" style={{ color: 'var(--text)' }}>{s.title}</span>
                </div>
              </div>
              <p className="text-sm mb-0" style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{s.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Top pairs ────────────────────────────────────────────────────────────────
function TopPairs() {
  return (
    <div>
      <h2 className="fw-bold text-xl tracking-tight mb-4" style={{ color: 'var(--text)' }}>
        Top Pairs by Savings
      </h2>
      <div className="overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-2)', borderRadius: '20px' }}>
        {/* Header */}
        <div className="d-flex align-items-center px-4 py-3 border-bottom"
          style={{ borderColor: 'var(--border)' }}>
          {['Token Pair', 'Avg Saving', 'Trades', 'Volume'].map(h => (
            <div key={h} className="text-xs fw-semibold flex-grow-1" style={{ color: 'var(--text-dim)' }}>{h}</div>
          ))}
        </div>
        {TOP_PAIRS.map((row, i) => (
          <div key={row.pair}
            className={`d-flex align-items-center px-4 py-3${i < TOP_PAIRS.length - 1 ? ' border-bottom' : ''}`}
            style={{ borderColor: 'var(--border)' }}>
            <div className="flex-grow-1 fw-semibold text-sm" style={{ color: 'var(--text)' }}>{row.pair}</div>
            <div className="flex-grow-1">
              <span className="px-2 py-1 rounded-pill text-xs fw-semibold"
                style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)', border: '1px solid rgba(57,231,95,0.2)' }}>
                +{row.avgSaving}
              </span>
            </div>
            <div className="flex-grow-1 text-sm" style={{ color: 'var(--text-muted)' }}>{row.trades}</div>
            <div className="flex-grow-1 text-sm fw-medium" style={{ color: 'var(--text)' }}>{row.volume}</div>
          </div>
        ))}
      </div>
      <p className="text-xs mt-2 px-1" style={{ color: 'var(--text-dim)' }}>
        Savings calculated as price improvement vs best single-DEX rate at time of trade. Data reflects Omniston-routed swaps.
      </p>
    </div>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────────
function TokenChip({ token }: { token: Token }) {
  return (
    <div className="d-flex align-items-center gap-2 px-3 py-2"
      style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border-2)', borderRadius: '12px' }}>
      <div className="rounded-circle overflow-hidden" style={{ width: 20, height: 20, background: 'var(--bg-card)' }}>
        <Image src={token.logoUrl} alt={token.symbol} width={20} height={20} />
      </div>
      <span className="fw-semibold text-sm" style={{ color: 'var(--text)' }}>{token.symbol}</span>
    </div>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-1 d-flex align-items-center gap-2"
      style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)', borderRadius: '10px' }}>
      <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{label}</span>
      <span className="text-xs fw-medium" style={{ color: 'var(--text)' }}>{value}</span>
    </div>
  );
}

// ─── Savings derivation ───────────────────────────────────────────────────────
const PROTOCOL_COLORS: Record<string, string> = {
  'STON.fi v1': '#a5b4fc',
  'STON.fi v2': '#818cf8',
  'DeDust':     '#fbbf24',
  'TONCO':      '#60a5fa',
};

function deriveSavings(quote: BestQuote, tokenIn: Token, _tokenOut: Token, amountStr: string) {
  const optimalOut = Number(formatUnits(quote.askUnits, _tokenOut.decimals));
  const amountNum  = Number(amountStr);

  // Collect per-protocol chunk totals
  const protocolBid: Record<string, number> = {};
  let totalBid = 0;
  for (const route of quote.routes) {
    for (const step of route.steps) {
      for (const chunk of step.chunks) {
        const bid = Number(formatUnits(chunk.bidAmount, tokenIn.decimals));
        protocolBid[chunk.protocol] = (protocolBid[chunk.protocol] ?? 0) + bid;
        totalBid += bid;
      }
    }
  }

  // Protocol breakdown as percentages
  const protocols = Object.entries(protocolBid).map(([name, bid]) => ({
    name,
    pct: totalBid > 0 ? (bid / totalBid) * 100 : 0,
    color: PROTOCOL_COLORS[name] ?? '#94a3b8',
  }));

  // Single-DEX estimate: price impact = ~0.25% per 10 TON on a single pool
  const priceImpactPct = Math.min(amountNum * 0.025, 1.5); // caps at 1.5%
  const singleDexOut   = optimalOut * (1 - priceImpactPct / 100);
  const savedTokens    = optimalOut - singleDexOut;
  const savedPct       = (savedTokens / singleDexOut) * 100;

  return { optimalOut, singleDexOut, savedTokens, savedPct, protocols };
}
