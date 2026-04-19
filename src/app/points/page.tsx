'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { usePoints } from '@/contexts/PointsContext';
import {
  POINTS_CONFIG, PointEvent,
  fmtPoints, getPointsRank, pointsToNextRank, calcMultiplier,
} from '@/lib/points';

// ─── Rank metadata ────────────────────────────────────────────────────────────

const RANK_META: Record<string, { color: string; next: string; threshold: number }> = {
  Bronze:   { color: '#cd7f32', next: 'Silver',   threshold: 100    },
  Silver:   { color: '#b0b7c3', next: 'Gold',     threshold: 500    },
  Gold:     { color: '#fbbf24', next: 'Platinum', threshold: 2_000  },
  Platinum: { color: '#a5b4fc', next: 'Diamond',  threshold: 10_000 },
  Diamond:  { color: 'var(--accent-lime)', next: '', threshold: Infinity },
};

const EVENT_LABELS: Record<PointEvent['type'], string> = {
  first_connect: 'First connect bonus',
  first_swap:    'First swap bonus',
  swap:          'Swap',
  analytics:     'Analytics visit',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtRelTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(diff / 86_400_000);
  if (d > 0)  return `${d}d ago`;
  if (h > 0)  return `${h}h ago`;
  if (m > 0)  return `${m}m ago`;
  return 'Just now';
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PointsPage() {
  const { record, multiplier, referralLink } = usePoints();
  const [copied, setCopied] = useState(false);

  function copyLink() {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen-nav" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto px-4 py-section d-flex flex-column gap-5">

        {/* Back */}
        <Link href="/" className="text-xs text-decoration-none d-flex align-items-center gap-1"
          style={{ color: 'var(--text-muted)', width: 'fit-content' }}>
          ← Back
        </Link>

        <div className="d-flex align-items-baseline gap-2 mb-0">
          <p className="section-label mb-0">◆ OMNI POINTS</p>
        </div>

        <h1
          className="font-display fw-medium tracking-tighter mt-0"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', color: 'var(--text)', letterSpacing: '-0.028em', lineHeight: 1 }}
        >
          Your rewards,{' '}
          <span style={{ color: 'var(--text-muted)' }}>your multiplier.</span>
        </h1>

        {!record ? (
          <NoWalletState />
        ) : (
          <>
            <OverviewCards record={record} multiplier={multiplier} />
            <div className="row g-4">
              <div className="col-12 col-lg-7">
                <HowToEarn record={record} />
              </div>
              <div className="col-12 col-lg-5 d-flex flex-column gap-4">
                <ReferralCard referralLink={referralLink} copied={copied} onCopy={copyLink} record={record} />
                <BoostBreakdown record={record} multiplier={multiplier} />
              </div>
            </div>
            <HistoryTable history={record.history} />
          </>
        )}
      </div>
    </div>
  );
}

// ─── No wallet ────────────────────────────────────────────────────────────────

function NoWalletState() {
  return (
    <div className="p-5 text-center d-flex flex-column align-items-center gap-3"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px' }}>
      <div style={{ fontSize: '2.5rem' }}>◆</div>
      <h3 className="fw-medium" style={{ color: 'var(--text)' }}>Connect to start earning</h3>
      <p style={{ color: 'var(--text-muted)', maxWidth: '28rem' }}>
        Connect your TON wallet to start earning Omni Points. Swap, stake, and explore
        to climb the leaderboard and unlock multiplier boosts.
      </p>
    </div>
  );
}

// ─── Overview cards ───────────────────────────────────────────────────────────

function OverviewCards({ record, multiplier }: { record: NonNullable<ReturnType<typeof usePoints>['record']>; multiplier: number }) {
  const rank      = getPointsRank(record.totalPoints);
  const meta      = RANK_META[rank];
  const toNext    = pointsToNextRank(record.totalPoints);
  const threshold = meta.threshold === Infinity ? record.totalPoints : meta.threshold;
  const prevThreshold = {
    Bronze: 0, Silver: 100, Gold: 500, Platinum: 2_000, Diamond: 10_000,
  }[rank] ?? 0;
  const progress = threshold === Infinity
    ? 100
    : Math.round(((record.totalPoints - prevThreshold) / (threshold - prevThreshold)) * 100);

  return (
    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' }}>
      {/* Total points */}
      <div style={{ background: 'var(--bg-card)', padding: '1.5rem' }}>
        <div style={{ fontFamily: 'monospace', fontSize: '0.6875rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Total Points
        </div>
        <div className="font-display fw-medium"
          style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: 'var(--accent-lime)', letterSpacing: '-0.02em', lineHeight: 1 }}>
          {fmtPoints(record.totalPoints)}
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: '0.375rem' }}>OP</span>
        </div>
      </div>

      {/* Rank */}
      <div style={{ background: 'var(--bg-card)', padding: '1.5rem' }}>
        <div style={{ fontFamily: 'monospace', fontSize: '0.6875rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Rank
        </div>
        <div className="fw-medium" style={{ fontSize: '1.5rem', color: meta.color, lineHeight: 1, marginBottom: '0.5rem' }}>
          {rank}
        </div>
        {toNext !== null && (
          <div>
            <div style={{ height: '4px', background: 'var(--border-2)', borderRadius: '2px', overflow: 'hidden', marginBottom: '0.25rem' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: meta.color, borderRadius: '2px', transition: 'width 0.6s ease' }} />
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.625rem', color: 'var(--text-dim)' }}>
              {toNext.toLocaleString()} pts to {meta.next}
            </div>
          </div>
        )}
      </div>

      {/* Multiplier */}
      <div style={{ background: 'var(--bg-card)', padding: '1.5rem' }}>
        <div style={{ fontFamily: 'monospace', fontSize: '0.6875rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Multiplier
        </div>
        <div className="font-display fw-medium"
          style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: multiplier > 1 ? 'var(--accent-lime)' : 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>
          {multiplier}×
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.625rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
          staking {record.boosts.staking}× + referral {record.boosts.referral}×
        </div>
      </div>
    </div>
  );
}

// ─── How to earn ──────────────────────────────────────────────────────────────

function HowToEarn({ record }: { record: NonNullable<ReturnType<typeof usePoints>['record']> }) {
  const tasks = [
    {
      label:   'Connect wallet (one-time)',
      sub:     '+10 points',
      done:    record.flags.firstConnectAwarded,
      href:    null,
      accent:  false,
    },
    {
      label:   'First swap (one-time)',
      sub:     '+10 points',
      done:    record.flags.firstSwapAwarded,
      href:    '/',
      accent:  false,
    },
    {
      label:   'Swap tokens',
      sub:     '1 point per $10 swapped · boosted by multiplier',
      done:    false,
      href:    '/',
      accent:  false,
    },
    {
      label:   'Visit Analytics daily',
      sub:     '1 point per day · boosted by multiplier',
      done:    false,
      href:    '/analytics',
      accent:  false,
    },
    {
      label:   'Stake TON (boost)',
      sub:     '+1× per $100 staked · up to 100× multiplier boost',
      done:    record.boosts.staking > 0,
      href:    '/staking',
      accent:  true,
    },
    {
      label:   'Refer friends (boost)',
      sub:     '+1× per referral · up to 20× multiplier boost',
      done:    record.referral.count > 0,
      href:    null,
      accent:  true,
    },
  ];

  return (
    <div className="p-4 d-flex flex-column gap-3"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px' }}>
      <h3 className="fw-medium mb-0" style={{ fontSize: '1rem', color: 'var(--text)' }}>How to earn</h3>

      <div className="d-flex flex-column" style={{ gap: '2px' }}>
        {tasks.map(t => (
          <div key={t.label} className="d-flex align-items-start gap-3 py-3 px-1"
            style={{ borderBottom: '1px solid var(--border)' }}>
            {/* Status icon */}
            <div className="flex-shrink-0 d-flex align-items-center justify-content-center mt-1"
              style={{
                width: '18px', height: '18px',
                borderRadius: '50%',
                background: t.done ? 'var(--accent-lime-dim)' : 'var(--bg-card-2)',
                border: `1px solid ${t.done ? 'rgba(200,241,53,0.3)' : 'var(--border-2)'}`,
              }}>
              {t.done && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent-lime)" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>

            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2">
                <span className="text-sm fw-medium" style={{ color: 'var(--text)' }}>{t.label}</span>
                {t.accent && (
                  <span style={{ fontFamily: 'monospace', fontSize: '0.5625rem', color: 'var(--accent-lime)', background: 'var(--accent-lime-dim)', border: '1px solid rgba(200,241,53,0.2)', borderRadius: '999px', padding: '1px 5px' }}>
                    BOOST
                  </span>
                )}
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>{t.sub}</div>
            </div>

            {t.href && !t.done && (
              <Link href={t.href} className="text-xs text-decoration-none flex-shrink-0 mt-1"
                style={{ color: 'var(--accent-lime)' }}>
                Go →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Referral card ────────────────────────────────────────────────────────────

function ReferralCard({
  referralLink, copied, onCopy, record,
}: {
  referralLink: string;
  copied: boolean;
  onCopy: () => void;
  record: NonNullable<ReturnType<typeof usePoints>['record']>;
}) {
  return (
    <div className="p-4 d-flex flex-column gap-3"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px' }}>
      <div>
        <h3 className="fw-medium mb-1" style={{ fontSize: '1rem', color: 'var(--text)' }}>Refer friends</h3>
        <p className="text-xs mb-0" style={{ color: 'var(--text-muted)' }}>
          +1× multiplier per referral · max 20× boost ·{' '}
          <strong style={{ color: 'var(--text)' }}>{record.referral.count} referred</strong>
        </p>
      </div>

      {/* Referral link */}
      <div className="d-flex align-items-center gap-2 p-2 px-3"
        style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '12px' }}>
        <span className="flex-grow-1 text-xs text-truncate" style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>
          {referralLink || '—'}
        </span>
        <button
          onClick={onCopy}
          disabled={!referralLink}
          className="flex-shrink-0 text-xs fw-medium px-3 py-1 transition-all"
          style={{
            background:   copied ? 'var(--accent-lime-dim)' : 'var(--bg-card-2)',
            border:       `1px solid ${copied ? 'rgba(200,241,53,0.3)' : 'var(--border-2)'}`,
            color:        copied ? 'var(--accent-lime)' : 'var(--text)',
            borderRadius: '8px',
            cursor:       referralLink ? 'pointer' : 'not-allowed',
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {record.referral.referredBy && (
        <p className="text-xs mb-0" style={{ color: 'var(--text-dim)' }}>
          You were referred by code{' '}
          <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>
            {record.referral.referredBy}
          </span>
        </p>
      )}
    </div>
  );
}

// ─── Boost breakdown ──────────────────────────────────────────────────────────

function BoostBreakdown({ record, multiplier }: { record: NonNullable<ReturnType<typeof usePoints>['record']>; multiplier: number }) {
  const rows = [
    { label: 'Base',          value: '1×',                              color: 'var(--text)' },
    { label: 'Staking boost', value: `+${record.boosts.staking}×`,     color: 'var(--accent-lime)' },
    { label: 'Referral boost', value: `+${record.boosts.referral}×`,   color: '#a5b4fc' },
    { label: 'Total',         value: `${multiplier}×`,                  color: 'var(--accent-lime)', bold: true },
  ];

  return (
    <div className="p-4 d-flex flex-column gap-3"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px' }}>
      <h3 className="fw-medium mb-0" style={{ fontSize: '1rem', color: 'var(--text)' }}>Multiplier breakdown</h3>
      <div className="d-flex flex-column gap-1">
        {rows.map(r => (
          <div key={r.label} className="d-flex align-items-center justify-content-between py-2 px-3"
            style={{ background: r.bold ? 'rgba(200,241,53,0.05)' : 'var(--bg-card-2)', borderRadius: '8px', border: r.bold ? '1px solid rgba(200,241,53,0.15)' : '1px solid transparent' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {r.label}
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: r.color, fontWeight: r.bold ? 700 : 500 }}>
              {r.value}
            </span>
          </div>
        ))}
      </div>
      <div className="d-flex flex-column gap-2">
        <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
          Staking cap: {record.boosts.staking}/{POINTS_CONFIG.MAX_STAKING_BOOST}×
          {' '}(${record.boosts.staking * 100} / $10,000 staked)
        </div>
        <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
          Referral cap: {record.boosts.referral}/{POINTS_CONFIG.MAX_REFERRAL_BOOST}×
          {' '}({record.referral.count}/{POINTS_CONFIG.MAX_REFERRAL_BOOST} friends)
        </div>
      </div>
    </div>
  );
}

// ─── History table ────────────────────────────────────────────────────────────

function HistoryTable({ history }: { history: PointEvent[] }) {
  if (!history.length) return null;

  return (
    <div className="d-flex flex-column gap-3">
      <h3 className="fw-medium mb-0" style={{ fontSize: '1rem', color: 'var(--text)' }}>Earnings history</h3>

      <div style={{ border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        {/* Header */}
        <div className="d-flex px-4 py-2"
          style={{ background: 'var(--bg-card-2)', borderBottom: '1px solid var(--border)' }}>
          {['Event', 'Base', 'Multiplier', 'Earned', 'When'].map(h => (
            <div key={h} className="text-xs fw-medium"
              style={{ flex: h === 'Event' ? 2 : 1, color: 'var(--text-dim)', fontFamily: 'monospace', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {history.slice(0, 20).map((e, i) => (
          <div key={e.id}
            className="d-flex align-items-center px-4 py-3"
            style={{ borderBottom: i < Math.min(history.length, 20) - 1 ? '1px solid var(--border)' : 'none', background: 'var(--bg-card)' }}>
            <div className="text-sm" style={{ flex: 2, color: 'var(--text)' }}>
              {EVENT_LABELS[e.type]}
            </div>
            <div style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {e.basePoints} pts
            </div>
            <div style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {e.multiplier}×
            </div>
            <div style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-lime)' }}>
              +{e.earned}
            </div>
            <div style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {fmtRelTime(e.ts)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
