'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import Button from '@/components/ui/Button';
import { fromNano, toNano, calcReturn } from '@/lib/tonstakers';
import { usePoints } from '@/contexts/PointsContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PublicData {
  apy: number | null;
  tvl: number | null;
  stakersCount: number | null;
  rates: { TONUSD: number; tsTONTON: number; tsTONTONProjected: number } | null;
  loading: boolean;
}

interface UserData {
  balance: number | null;
  stakedBalance: number | null;
  availableBalance: number | null;
  instantLiquidity: number | null;
  ready: boolean;
}

type UnstakeMode = 'standard' | 'instant' | 'bestrate';
type TxStatus = 'idle' | 'pending' | 'success' | 'error';

// ─── SDK hook ─────────────────────────────────────────────────────────────────
function useStaking() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const tsRef = useRef<any>(null);

  const [pub, setPub] = useState<PublicData>({ apy: null, tvl: null, stakersCount: null, rates: null, loading: true });
  const [user, setUser] = useState<UserData>({ balance: null, stakedBalance: null, availableBalance: null, instantLiquidity: null, ready: false });
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [txError, setTxError] = useState('');

  useEffect(() => {
    if (!tonConnectUI) return;
    let mounted = true;

    import('tonstakers-sdk').then(({ Tonstakers }) => {
      if (!mounted) return;

      // TonConnect's onStatusChange never fires the current state — only future changes.
      // Wrap the connector so Tonstakers' initialize() sees the already-connected wallet.
      const connector = {
        sendTransaction: (tx: any) => (tonConnectUI as any).sendTransaction(tx),
        onStatusChange: (cb: (wallet: any) => void) => {
          const current = (tonConnectUI as any).wallet;
          if (current) cb(current);
          return (tonConnectUI as any).onStatusChange(cb);
        },
      };

      const ts = new Tonstakers({ connector });
      tsRef.current = ts;

      // Fetch public data (no wallet needed)
      Promise.all([
        ts.getCurrentApy().catch(() => null),
        ts.getTvl().catch(() => null),
        ts.getStakersCount().catch(() => null),
        ts.getRates().catch(() => null),
      ]).then(([apy, tvl, stakersCount, rates]) => {
        if (mounted) setPub({ apy, tvl, stakersCount, rates, loading: false });
      }).catch(() => {
        if (mounted) setPub(d => ({ ...d, loading: false }));
      });

      async function loadUser() {
        if (!mounted) return;
        try {
          const [balance, stakedBalance, availableBalance, instantLiquidity] = await Promise.all([
            ts.getBalance().catch(() => null),
            ts.getStakedBalance().catch(() => null),
            ts.getAvailableBalance().catch(() => null),
            ts.getInstantLiquidity().catch(() => null),
          ]);
          if (mounted) setUser({ balance, stakedBalance, availableBalance, instantLiquidity, ready: true });
        } catch {
          if (mounted) setUser(d => ({ ...d, ready: true }));
        }
      }

      ts.addEventListener('initialized', loadUser);
      ts.addEventListener('deinitialized', () => {
        if (mounted) setUser({ balance: null, stakedBalance: null, availableBalance: null, instantLiquidity: null, ready: false });
      });

      if (ts.ready) loadUser();
    }).catch(err => {
      console.error('tonstakers-sdk load error:', err);
      if (mounted) setPub(d => ({ ...d, loading: false }));
    });

    return () => { mounted = false; tsRef.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshUser = useCallback(async () => {
    const ts = tsRef.current;
    if (!ts) return;
    try {
      const [balance, stakedBalance, availableBalance] = await Promise.all([
        ts.getBalance().catch(() => null),
        ts.getStakedBalance().catch(() => null),
        ts.getAvailableBalance().catch(() => null),
      ]);
      setUser(d => ({ ...d, balance, stakedBalance, availableBalance }));
    } catch { /* ignore */ }
  }, []);

  const stake = useCallback(async (amountTon: number) => {
    const ts = tsRef.current;
    if (!ts) throw new Error('SDK not ready');
    setTxStatus('pending'); setTxError('');
    try {
      await ts.stake(toNano(amountTon));
      setTxStatus('success');
      setTimeout(refreshUser, 4000);
    } catch (err: any) {
      setTxStatus('error');
      setTxError(err?.message ?? 'Transaction failed');
      throw err;
    }
  }, [refreshUser]);

  const unstake = useCallback(async (amountTsTON: number, mode: UnstakeMode) => {
    const ts = tsRef.current;
    if (!ts) throw new Error('SDK not ready');
    setTxStatus('pending'); setTxError('');
    try {
      const amount = toNano(amountTsTON);
      if (mode === 'instant') await ts.unstakeInstant(amount);
      else if (mode === 'bestrate') await ts.unstakeBestRate(amount);
      else await ts.unstake(amount);
      setTxStatus('success');
      setTimeout(refreshUser, 4000);
    } catch (err: any) {
      setTxStatus('error');
      setTxError(err?.message ?? 'Transaction failed');
      throw err;
    }
  }, [refreshUser]);

  return { pub, user, stake, unstake, txStatus, txError, setTxStatus, wallet };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StakingPage() {
  const sdk = useStaking();
  const { pub, user } = sdk;
  const { updateStakingBoost } = usePoints();

  // Keep the staking boost in sync whenever the user's staked balance or TON price changes.
  useEffect(() => {
    const stakedTON = user.stakedBalance !== null ? fromNano(user.stakedBalance) : 0;
    const tonUSD    = pub.rates?.TONUSD ?? 0;
    updateStakingBoost(stakedTON, tonUSD);
  }, [user.stakedBalance, pub.rates?.TONUSD, updateStakingBoost]);

  return (
    <div className="min-h-screen-nav" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto px-4 py-section">

        {/* Header */}
        <div className="mb-5">
          <div className="d-flex align-items-center gap-2 mb-3">
            <Link href="/" className="text-xs text-decoration-none d-flex align-items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              ← Back
            </Link>
          </div>
          <p className="section-label">◆ STAKING</p>
          <h1
            className="font-display fw-medium tracking-tighter mb-3"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', color: 'var(--text)', letterSpacing: '-0.028em', lineHeight: 1 }}
          >
            Stake TON,{' '}
            <span style={{ color: 'var(--text-muted)' }}>earn rewards.</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '36rem', lineHeight: 1.6 }}>
            Liquid staking via Tonstakers — deposit TON, receive tsTON that grows in value.
            Unstake any time.
          </p>
        </div>

        <div className="row g-4">
          {/* Staking card */}
          <div className="col-12 col-lg-6">
            <StakingCard sdk={sdk} />
          </div>

          {/* Sidebar */}
          <div className="col-12 col-lg-6 d-flex flex-column gap-4">
            <StatsRow pub={pub} />
            <ReturnsCalculator pub={pub} />
            <RatesCard pub={pub} user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Staking card ─────────────────────────────────────────────────────────────
function StakingCard({ sdk }: { sdk: ReturnType<typeof useStaking> }) {
  const [tonConnectUI] = useTonConnectUI();
  const { pub, user, stake, unstake, txStatus, txError, setTxStatus, wallet } = sdk;

  const [tab, setTab] = useState<'stake' | 'unstake'>('stake');
  const [mode, setMode] = useState<UnstakeMode>('standard');
  const [amount, setAmount] = useState('');

  const apy = pub.apy;
  const rates = pub.rates;
  const amountNum = parseFloat(amount) || 0;

  const availableTON = user.availableBalance !== null ? fromNano(user.availableBalance) : null;
  const stakedTsTON = user.stakedBalance !== null ? fromNano(user.stakedBalance) : null;

  // Derived values
  const tsTONOut = rates && amountNum > 0 ? amountNum / rates.tsTONTON : 0;
  const TONOut = rates && amountNum > 0 ? amountNum * rates.tsTONTON : 0;
  const earningsYr = apy && amountNum > 0 ? calcReturn(tab === 'stake' ? amountNum : TONOut, apy, 365) : 0;

  function handleMax() {
    if (tab === 'stake' && availableTON !== null) setAmount(Math.max(0, availableTON - 1).toFixed(2));
    else if (tab === 'unstake' && stakedTsTON !== null) setAmount(stakedTsTON.toFixed(4));
  }

  async function handleAction() {
    if (!wallet) { tonConnectUI.openModal(); return; }
    if (amountNum <= 0) return;
    try {
      if (tab === 'stake') await stake(amountNum);
      else await unstake(amountNum, mode);
      setAmount('');
    } catch { /* error shown via txError */ }
  }

  const isPending = txStatus === 'pending';
  const canAct = !!wallet && amountNum > 0 && !isPending;

  const btnLabel = !wallet ? 'Connect Wallet'
    : isPending ? (tab === 'stake' ? 'Staking…' : 'Unstaking…')
    : tab === 'stake' ? 'Stake TON'
    : 'Unstake tsTON';

  return (
    <div className="p-4 d-flex flex-column gap-3"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-2)', borderRadius: '28px', boxShadow: 'var(--shadow-card), var(--shadow-glow)' }}>

      {/* Tab bar + APY badge */}
      <div className="d-flex align-items-center">
        <div className="d-flex rounded-pill p-1" style={{ background: 'var(--bg-card-2)', gap: '4px' }}>
          {(['stake', 'unstake'] as const).map(t => (
            <button key={t}
              onClick={() => { setTab(t); setAmount(''); setTxStatus('idle'); }}
              className="px-3 py-1-5 text-sm fw-medium transition-all"
              style={{
                background: tab === t ? 'var(--bg-card)' : 'transparent',
                color: tab === t ? 'var(--text)' : 'var(--text-muted)',
                border: tab === t ? '1px solid var(--border-2)' : '1px solid transparent',
                borderRadius: '999px', cursor: 'pointer',
                padding: '0.375rem 0.875rem',
              }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        {apy !== null && (
          <div className="d-flex align-items-center gap-1 px-3 py-1 ms-auto"
            style={{ background: 'var(--accent-lime-dim)', border: '1px solid rgba(200,241,53,0.25)', borderRadius: '999px' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.6875rem', color: 'var(--text-dim)', letterSpacing: '0.06em' }}>APY</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-lime)' }}>{apy.toFixed(2)}%</span>
          </div>
        )}
        {pub.loading && apy === null && (
          <span className="icon-sm rounded-circle animate-spin ms-auto"
            style={{ border: '2px solid var(--border-2)', borderTopColor: 'var(--accent-lime)' }} />
        )}
      </div>

      {/* Unstake mode selector */}
      {tab === 'unstake' && (
        <div className="d-flex gap-2 animate-slide-up">
          {([
            { id: 'standard' as const, label: 'Standard', hint: 'Next round' },
            { id: 'instant' as const,  label: '⚡ Instant', hint: 'Immediate' },
            { id: 'bestrate' as const, label: '↗ Best Rate', hint: 'Optimised' },
          ]).map(m => (
            <button key={m.id}
              onClick={() => setMode(m.id)}
              className="flex-grow-1 d-flex flex-column align-items-center py-2 transition-all"
              style={{
                background: mode === m.id ? 'var(--bg-card-2)' : 'transparent',
                color: mode === m.id ? 'var(--text)' : 'var(--text-muted)',
                border: `1px solid ${mode === m.id ? 'var(--border-2)' : 'var(--border)'}`,
                borderRadius: '14px', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500,
                gap: '2px',
              }}>
              {m.label}
              <span style={{ fontSize: '0.625rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>{m.hint}</span>
            </button>
          ))}
        </div>
      )}

      {/* Amount input field */}
      <div className="p-3 d-flex flex-column gap-2"
        style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '20px' }}>
        <div className="d-flex align-items-center justify-content-between">
          <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
            {tab === 'stake' ? 'Amount (TON)' : 'Amount (tsTON)'}
          </span>
          {wallet && (
            <button onClick={handleMax}
              className="text-xs fw-medium"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-lime)', padding: 0 }}>
              MAX ·{' '}
              {tab === 'stake'
                ? (availableTON !== null ? availableTON.toFixed(2) + ' TON' : '…')
                : (stakedTsTON !== null ? stakedTsTON.toFixed(4) + ' tsTON' : '…')}
            </button>
          )}
        </div>
        <div className="d-flex align-items-center gap-3">
          {/* Token pill */}
          <div className="d-flex align-items-center gap-2 px-3 py-2 flex-shrink-0"
            style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border-2)', borderRadius: '12px' }}>
            <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
              style={{ width: '20px', height: '20px', background: tab === 'stake' ? 'oklch(0.76 0.14 230)' : 'var(--accent-lime)', fontSize: '9px', color: '#0c0f11' }}>
              {tab === 'stake' ? 'T' : 'ts'}
            </div>
            <span className="text-sm fw-semibold" style={{ color: 'var(--text)' }}>
              {tab === 'stake' ? 'TON' : 'tsTON'}
            </span>
          </div>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex-grow-1 text-end fw-semibold outline-none"
            style={{
              fontSize: '1.25rem',
              color: amount ? 'var(--text)' : 'var(--text-dim)',
              background: 'transparent', border: 'none',
            }}
          />
        </div>
      </div>

      {/* Output */}
      {amountNum > 0 && rates && (
        <div className="p-3 d-flex align-items-center justify-content-between animate-slide-up"
          style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)', borderRadius: '16px' }}>
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--text-dim)' }}>You receive (approx.)</div>
            <div className="fw-semibold" style={{ color: 'var(--text)', fontSize: '1.0625rem' }}>
              {tab === 'stake' ? `≈ ${tsTONOut.toFixed(4)} tsTON` : `≈ ${TONOut.toFixed(4)} TON`}
            </div>
          </div>
          {tab === 'stake' && earningsYr > 0 && (
            <div className="text-end">
              <div className="text-xs mb-1" style={{ color: 'var(--text-dim)' }}>Est. yearly earnings</div>
              <div className="fw-semibold text-sm" style={{ color: 'var(--accent-lime)' }}>
                +{earningsYr.toFixed(4)} TON/yr
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rate line */}
      {rates && (
        <div className="d-flex align-items-center justify-content-between px-1">
          <span style={{ fontFamily: 'monospace', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>
            1 tsTON = {rates.tsTONTON.toFixed(4)} TON
          </span>
          {rates.TONUSD > 0 && (
            <span style={{ fontFamily: 'monospace', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>
              1 TON ≈ ${rates.TONUSD.toFixed(2)}
            </span>
          )}
        </div>
      )}

      {/* Instant liquidity warning */}
      {tab === 'unstake' && mode === 'instant' && user.instantLiquidity !== null && (
        <div className="px-1">
          <span style={{ fontFamily: 'monospace', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            Pool liquidity: {fromNano(user.instantLiquidity).toLocaleString('en-US', { maximumFractionDigits: 0 })} TON available
          </span>
        </div>
      )}

      {/* Error */}
      {txError && (
        <p className="text-xs px-1 mb-0" style={{ color: '#ef4444' }}>{txError}</p>
      )}

      {/* Success */}
      {txStatus === 'success' && (
        <div className="p-3 d-flex align-items-center gap-2 animate-slide-up"
          style={{ background: 'rgba(200,241,53,0.08)', border: '1px solid rgba(200,241,53,0.2)', borderRadius: '14px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-lime)" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span className="text-sm" style={{ color: 'var(--accent-lime)' }}>
            Transaction sent!{' '}
            {tab === 'stake' ? "You'll receive tsTON shortly." : 'Unstaking in progress.'}
          </span>
        </div>
      )}

      <Button
        variant={wallet ? 'primary' : 'secondary'}
        size="lg"
        className="w-100 mt-1"
        loading={isPending}
        disabled={wallet ? !canAct : false}
        onClick={handleAction}
      >
        {btnLabel}
      </Button>

      <p className="text-xs text-center mb-0" style={{ color: 'var(--text-dim)' }}>
        Powered by{' '}
        <a href="https://tonstakers.com" target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
          Tonstakers
        </a>
        {' '}· liquid staking on TON
      </p>
    </div>
  );
}

// ─── Stats row ────────────────────────────────────────────────────────────────
function StatsRow({ pub }: { pub: PublicData }) {
  const tvlTON = pub.tvl !== null ? fromNano(pub.tvl) : null;

  const stats = [
    {
      label: 'Current APY',
      value: pub.apy !== null ? `${pub.apy.toFixed(2)}%` : '—',
      accent: true,
    },
    {
      label: 'Total Value Locked',
      value: tvlTON !== null
        ? tvlTON >= 1_000_000
          ? `${(tvlTON / 1_000_000).toFixed(1)}M TON`
          : `${(tvlTON / 1_000).toFixed(0)}K TON`
        : '—',
      accent: false,
    },
    {
      label: 'Active Stakers',
      value: pub.stakersCount !== null
        ? pub.stakersCount.toLocaleString('en-US')
        : '—',
      accent: false,
    },
  ];

  return (
    <div className="overflow-hidden" style={{ border: '1px solid var(--border)', borderRadius: '20px' }}>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'var(--bg-primary)', padding: '1.25rem 1rem' }}>
            <div
              className="font-display fw-medium"
              style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', letterSpacing: '-0.02em', color: s.accent ? 'var(--accent-lime)' : 'var(--text)', lineHeight: 1 }}
            >
              {pub.loading && s.value === '—' ? (
                <span className="icon-sm rounded-circle animate-spin d-inline-block"
                  style={{ border: '2px solid var(--border-2)', borderTopColor: 'var(--text-dim)', width: '16px', height: '16px' }} />
              ) : s.value}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Returns calculator ───────────────────────────────────────────────────────
function ReturnsCalculator({ pub }: { pub: PublicData }) {
  const [amount, setAmount] = useState('100');
  const apy = pub.apy;
  const amountNum = parseFloat(amount) || 0;

  const periods = [
    { label: '30 days', days: 30 },
    { label: '90 days', days: 90 },
    { label: '1 year',  days: 365 },
  ];

  return (
    <div className="p-4 d-flex flex-column gap-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px' }}>
      <div>
        <h3 className="fw-medium mb-1" style={{ fontSize: '1rem', color: 'var(--text)' }}>Returns Calculator</h3>
        <p className="text-xs mb-0" style={{ color: 'var(--text-muted)' }}>
          Projected earnings at current APY ({apy !== null ? `${apy.toFixed(2)}%` : '—'})
        </p>
      </div>

      {/* Amount input */}
      <div className="d-flex align-items-center gap-3 p-3"
        style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '14px' }}>
        <span className="text-sm" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Stake</span>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="100"
          className="flex-grow-1 fw-semibold outline-none text-end"
          style={{ fontSize: '1.125rem', background: 'transparent', border: 'none', color: 'var(--text)' }}
        />
        <span className="text-sm fw-medium flex-shrink-0" style={{ color: 'var(--text-muted)' }}>TON</span>
      </div>

      {/* Results table */}
      <div className="d-flex flex-column" style={{ border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        {/* Header */}
        <div className="d-flex px-3 py-2" style={{ background: 'var(--bg-card-2)', borderBottom: '1px solid var(--border)' }}>
          {['Period', 'Earnings', 'Total'].map(h => (
            <div key={h} className="flex-grow-1 text-xs fw-medium"
              style={{ color: 'var(--text-dim)', fontFamily: 'monospace', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {h}
            </div>
          ))}
        </div>
        {periods.map((p, i) => {
          const earnings = apy && amountNum > 0 ? calcReturn(amountNum, apy, p.days) : null;
          return (
            <div key={p.label}
              className={`d-flex align-items-center px-3 py-3${i < periods.length - 1 ? ' border-bottom' : ''}`}
              style={{ borderColor: 'var(--border)' }}>
              <div className="flex-grow-1 text-sm" style={{ color: 'var(--text-muted)' }}>{p.label}</div>
              <div className="flex-grow-1 text-sm fw-semibold" style={{ color: 'var(--accent-lime)' }}>
                {earnings !== null ? `+${earnings.toFixed(4)} TON` : '—'}
              </div>
              <div className="flex-grow-1 text-sm fw-medium" style={{ color: 'var(--text)' }}>
                {earnings !== null ? (amountNum + earnings).toFixed(4) : '—'}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs mb-0" style={{ color: 'var(--text-dim)' }}>
        Estimates based on current APY. Actual returns vary with network conditions.
      </p>
    </div>
  );
}

// ─── Rates card ───────────────────────────────────────────────────────────────
function RatesCard({ pub, user }: { pub: PublicData; user: UserData }) {
  const rates = pub.rates;

  return (
    <div className="p-4 d-flex flex-column gap-3"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px' }}>
      <h3 className="fw-medium mb-0" style={{ fontSize: '1rem', color: 'var(--text)' }}>Exchange Rates</h3>

      <div className="d-flex flex-column gap-2">
        {[
          { label: 'Current', value: rates ? `1 tsTON = ${rates.tsTONTON.toFixed(4)} TON` : '—' },
          { label: 'Projected', value: rates ? `1 tsTON = ${rates.tsTONTONProjected.toFixed(4)} TON` : '—' },
          { label: 'TON / USD', value: rates ? `$${rates.TONUSD.toFixed(2)}` : '—' },
        ].map(row => (
          <div key={row.label} className="d-flex align-items-center justify-content-between py-2 px-3"
            style={{ background: 'var(--bg-card-2)', borderRadius: '10px' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.6875rem', color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {row.label}
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--text)', fontWeight: 500 }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* User position (if wallet connected & staked) */}
      {user.stakedBalance !== null && fromNano(user.stakedBalance) > 0 && rates && (
        <div className="p-3 d-flex align-items-center justify-content-between animate-slide-up"
          style={{ background: 'rgba(200,241,53,0.08)', border: '1px solid rgba(200,241,53,0.2)', borderRadius: '12px' }}>
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--text-dim)' }}>Your position</div>
            <div className="fw-semibold" style={{ color: 'var(--text)' }}>
              {fromNano(user.stakedBalance).toFixed(4)} tsTON
            </div>
          </div>
          <div className="text-end">
            <div className="text-xs mb-1" style={{ color: 'var(--text-dim)' }}>≈ TON value</div>
            <div className="fw-semibold" style={{ color: 'var(--accent-lime)' }}>
              {(fromNano(user.stakedBalance) * rates.tsTONTON).toFixed(4)} TON
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
