'use client';

import Link from 'next/link';
import { usePoints } from '@/contexts/PointsContext';
import { fmtPoints, getPointsRank } from '@/lib/points';

const RANK_COLORS: Record<string, string> = {
  Bronze:   '#cd7f32',
  Silver:   '#b0b7c3',
  Gold:     '#fbbf24',
  Platinum: '#a5b4fc',
  Diamond:  'var(--accent-lime)',
};

export default function PointsBadge() {
  const { record, multiplier } = usePoints();

  if (!record) return null;

  const rank  = getPointsRank(record.totalPoints);
  const color = RANK_COLORS[rank];

  return (
    <Link
      href="/points"
      className="d-flex align-items-center gap-2 text-decoration-none"
      style={{
        background:   'var(--bg-card-2)',
        border:       `1px solid var(--border-2)`,
        borderRadius: '999px',
        padding:      '0.3125rem 0.75rem',
        transition:   'border-color 150ms ease',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = color)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-2)')}
    >
      {/* Rank dot */}
      <span
        className="rounded-circle flex-shrink-0"
        style={{ width: '8px', height: '8px', background: color }}
      />

      {/* Points count */}
      <span
        style={{
          fontFamily:    'monospace',
          fontSize:      '0.75rem',
          fontWeight:    600,
          color:         'var(--text)',
          letterSpacing: '0.02em',
        }}
      >
        {fmtPoints(record.totalPoints)}{' '}
        <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>OP</span>
      </span>

      {/* Multiplier badge — only shown when boosted */}
      {multiplier > 1 && (
        <span
          style={{
            fontFamily:    'monospace',
            fontSize:      '0.625rem',
            fontWeight:    700,
            color:         'var(--accent-lime)',
            background:    'var(--accent-lime-dim)',
            border:        '1px solid rgba(200,241,53,0.25)',
            borderRadius:  '999px',
            padding:       '1px 6px',
          }}
        >
          {multiplier}×
        </span>
      )}
    </Link>
  );
}
