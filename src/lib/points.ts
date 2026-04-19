// ─── Config ───────────────────────────────────────────────────────────────────
export const POINTS_CONFIG = {
  SWAP_POINTS_PER_10_USD:    1,
  ANALYTICS_POINTS:          1,
  FIRST_CONNECT_BONUS:       10,
  FIRST_SWAP_BONUS:          10,
  STAKING_BOOST_PER_100_USD: 1,
  MAX_STAKING_BOOST:         100,
  MAX_REFERRAL_BOOST:        20,
  ANALYTICS_COOLDOWN_MS:     86_400_000, // 24 h
  SCHEMA_VERSION:            1,
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────
export type PointEventType =
  | 'swap'
  | 'analytics'
  | 'first_connect'
  | 'first_swap';

export interface PointEvent {
  id: string;
  type: PointEventType;
  basePoints: number;
  multiplier: number;
  earned: number;
  ts: number;
  meta?: string; // txId for swaps
}

export interface PointsRecord {
  walletAddress: string;
  totalPoints: number;
  breakdown: {
    swap: number;
    analytics: number;
    bonus: number;
  };
  boosts: {
    staking: number;  // 0 – 100
    referral: number; // 0 – 20
  };
  flags: {
    firstConnectAwarded: boolean;
    firstSwapAwarded: boolean;
  };
  referral: {
    code: string;
    referredBy: string | null;
    count: number;
  };
  history: PointEvent[];
  lastAnalyticsAward: number;
  seenSwapTxIds: string[];
  version: number;
}

export type PointsRank = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

// ─── Pure calculation functions ───────────────────────────────────────────────

/** Derive a short, URL-safe referral code from a wallet address. */
export function genReferralCode(walletAddress: string): string {
  return walletAddress.replace(/[^a-fA-F0-9]/g, '').slice(-10).toUpperCase();
}

/**
 * Total point multiplier. Both boost inputs are clamped to their configured
 * maxima before summing so callers cannot produce out-of-range values.
 */
export function calcMultiplier(staking: number, referral: number): number {
  const s = Math.max(0, Math.min(Math.floor(staking), POINTS_CONFIG.MAX_STAKING_BOOST));
  const r = Math.max(0, Math.min(Math.floor(referral), POINTS_CONFIG.MAX_REFERRAL_BOOST));
  return 1 + s + r;
}

/** Base points for a swap. Returns 0 for invalid or sub-$10 values. */
export function calcSwapBasePoints(usdValue: number): number {
  if (!Number.isFinite(usdValue) || usdValue < 10) return 0;
  return Math.floor(usdValue / 10);
}

/** Staking boost (0 – 100) derived from USD value of staked TON. */
export function calcStakingBoost(stakedUSD: number): number {
  if (!Number.isFinite(stakedUSD) || stakedUSD <= 0) return 0;
  return Math.min(Math.floor(stakedUSD / 100), POINTS_CONFIG.MAX_STAKING_BOOST);
}

/** Referral boost (0 – 20) derived from number of successful referrals. */
export function calcReferralBoost(count: number): number {
  if (!Number.isFinite(count) || count <= 0) return 0;
  return Math.min(Math.floor(count), POINTS_CONFIG.MAX_REFERRAL_BOOST);
}

/** Map total points to a rank tier. */
export function getPointsRank(totalPoints: number): PointsRank {
  if (totalPoints >= 10_000) return 'Diamond';
  if (totalPoints >= 2_000)  return 'Platinum';
  if (totalPoints >= 500)    return 'Gold';
  if (totalPoints >= 100)    return 'Silver';
  return 'Bronze';
}

/** Points required to reach the next rank (null if already Diamond). */
export function pointsToNextRank(totalPoints: number): number | null {
  if (totalPoints >= 10_000) return null;
  if (totalPoints >= 2_000)  return 10_000 - totalPoints;
  if (totalPoints >= 500)    return 2_000  - totalPoints;
  if (totalPoints >= 100)    return 500    - totalPoints;
  return 100 - totalPoints;
}

/** Format large point counts with K / M suffix. */
export function fmtPoints(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.floor(n));
}

/** Create a zeroed record for a wallet address. */
export function makeEmptyRecord(walletAddress: string): PointsRecord {
  return {
    walletAddress,
    totalPoints:        0,
    breakdown:          { swap: 0, analytics: 0, bonus: 0 },
    boosts:             { staking: 0, referral: 0 },
    flags:              { firstConnectAwarded: false, firstSwapAwarded: false },
    referral:           { code: genReferralCode(walletAddress), referredBy: null, count: 0 },
    history:            [],
    lastAnalyticsAward: 0,
    seenSwapTxIds:      [],
    version:            POINTS_CONFIG.SCHEMA_VERSION,
  };
}
