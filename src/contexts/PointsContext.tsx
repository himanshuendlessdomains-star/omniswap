'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';
import {
  POINTS_CONFIG, PointsRecord, PointEvent, PointEventType,
  makeEmptyRecord, genReferralCode,
  calcMultiplier, calcSwapBasePoints, calcStakingBoost, calcReferralBoost,
} from '@/lib/points';

// ─── localStorage helpers ─────────────────────────────────────────────────────

const RECORD_KEY = (addr: string) => `omniswap_pts_v1_${addr}`;
const REF_KEY    = (code: string) => `omniswap_ref_v1_${code}`;

function loadRecord(addr: string): PointsRecord {
  try {
    const raw = localStorage.getItem(RECORD_KEY(addr));
    if (!raw) return makeEmptyRecord(addr);
    const parsed: PointsRecord = JSON.parse(raw);
    // Reject records from incompatible schema versions
    if (parsed?.version !== POINTS_CONFIG.SCHEMA_VERSION) return makeEmptyRecord(addr);
    return parsed;
  } catch {
    return makeEmptyRecord(addr);
  }
}

function saveRecord(rec: PointsRecord): void {
  try { localStorage.setItem(RECORD_KEY(rec.walletAddress), JSON.stringify(rec)); }
  catch { /* storage full or sandboxed */ }
}

function readRefCount(code: string): number {
  try { return Math.max(0, parseInt(localStorage.getItem(REF_KEY(code)) ?? '0', 10) || 0); }
  catch { return 0; }
}

function bumpRefCount(code: string): void {
  try { localStorage.setItem(REF_KEY(code), String(readRefCount(code) + 1)); }
  catch { /* ignore */ }
}

// ─── Shallow clone (avoids structuredClone SSR compatibility issues) ──────────

function cloneRecord(r: PointsRecord): PointsRecord {
  return {
    ...r,
    breakdown:     { ...r.breakdown },
    boosts:        { ...r.boosts },
    flags:         { ...r.flags },
    referral:      { ...r.referral },
    history:       [...r.history],
    seenSwapTxIds: [...r.seenSwapTxIds],
  };
}

// ─── Append a point event to the record, returns points earned ────────────────

function pushEvent(
  rec: PointsRecord,
  type: PointEventType,
  base: number,
  multiplier: number,
  meta?: string,
): number {
  const earned = base * multiplier;
  const event: PointEvent = {
    id:         `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    basePoints: base,
    multiplier,
    earned,
    ts:         Date.now(),
    ...(meta ? { meta } : {}),
  };
  // Prepend and cap history at 100 entries to bound storage size
  rec.history = [event, ...rec.history.slice(0, 99)];
  return earned;
}

// ─── Context surface area ─────────────────────────────────────────────────────

export interface PointsContextValue {
  record: PointsRecord | null;
  tonUSDPrice: number;
  multiplier: number;
  awardFirstConnect:    () => void;
  awardFirstSwap:       () => void;
  awardSwap:            (usdValue: number, txId: string) => void;
  awardAnalyticsVisit:  () => void;
  updateStakingBoost:   (stakedTON: number, tonUSD: number) => void;
  referralLink:         string;
}

const PointsContext = createContext<PointsContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function PointsProvider({ children }: { children: React.ReactNode }) {
  const wallet    = useTonWallet();
  const walletAddr = wallet?.account.address ?? null;

  const [record,       setRecord]       = useState<PointsRecord | null>(null);
  const [tonUSDPrice,  setTonUSDPrice]  = useState(0);

  // Fetch TON/USD once for use in swap USD-value estimation
  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd')
      .then(r => r.json())
      .then(data => {
        const price = data?.['the-open-network']?.usd;
        if (typeof price === 'number' && price > 0) setTonUSDPrice(price);
      })
      .catch(() => { /* degrade gracefully — TON-denominated swaps won't earn points */ });
  }, []);

  // Load (or reset) the record when the connected wallet changes
  useEffect(() => {
    if (!walletAddr) { setRecord(null); return; }

    const rec = loadRecord(walletAddr);

    // Always sync referral count from shared storage on load
    rec.referral.count   = readRefCount(rec.referral.code);
    rec.boosts.referral  = calcReferralBoost(rec.referral.count);

    // One-shot referral code processing from URL
    if (!rec.referral.referredBy) {
      try {
        const refCode = new URLSearchParams(window.location.search).get('ref');
        // Reject empty codes and self-referrals
        if (refCode && refCode.trim() && refCode !== rec.referral.code) {
          rec.referral.referredBy = refCode.trim().toUpperCase();
          bumpRefCount(refCode.trim().toUpperCase());
        }
      } catch { /* URL parsing failed — skip */ }
    }

    // Apply first-connect bonus directly here, before setRecord.
    // React runs child effects before parent effects, so WalletButton's
    // useEffect fires while record is still null — calling awardFirstConnect()
    // from there silently no-ops. Baking the bonus in at load time avoids
    // the race entirely.
    if (!rec.flags.firstConnectAwarded) {
      const bonus = POINTS_CONFIG.FIRST_CONNECT_BONUS;
      rec.totalPoints              += bonus;
      rec.breakdown.bonus          += bonus;
      rec.flags.firstConnectAwarded = true;
      pushEvent(rec, 'first_connect', bonus, 1);
    }

    setRecord(rec);
  }, [walletAddr]);

  // Persist to localStorage whenever the record changes
  useEffect(() => {
    if (record) saveRecord(record);
  }, [record]);

  // ─── Core mutator — wraps every state update ────────────────────────────────
  const mutate = useCallback((updater: (r: PointsRecord) => PointsRecord) => {
    setRecord(prev => (prev ? updater(prev) : prev));
  }, []);

  // ─── Award functions ─────────────────────────────────────────────────────────

  const awardFirstConnect = useCallback(() => {
    mutate(prev => {
      if (prev.flags.firstConnectAwarded) return prev;
      const next = cloneRecord(prev);
      const bonus = POINTS_CONFIG.FIRST_CONNECT_BONUS;
      next.totalPoints         += bonus;
      next.breakdown.bonus     += bonus;
      next.flags.firstConnectAwarded = true;
      pushEvent(next, 'first_connect', bonus, 1);
      return next;
    });
  }, [mutate]);

  const awardFirstSwap = useCallback(() => {
    mutate(prev => {
      if (prev.flags.firstSwapAwarded) return prev;
      const next = cloneRecord(prev);
      const bonus = POINTS_CONFIG.FIRST_SWAP_BONUS;
      next.totalPoints        += bonus;
      next.breakdown.bonus    += bonus;
      next.flags.firstSwapAwarded = true;
      pushEvent(next, 'first_swap', bonus, 1);
      return next;
    });
  }, [mutate]);

  const awardSwap = useCallback((usdValue: number, txId: string) => {
    // Validate inputs before touching state
    if (!Number.isFinite(usdValue) || usdValue <= 0) return;
    if (typeof txId !== 'string' || !txId.trim()) return;

    mutate(prev => {
      const id = txId.trim();
      // Idempotency check — never award the same transaction twice
      if (prev.seenSwapTxIds.includes(id)) return prev;

      const base = calcSwapBasePoints(usdValue);
      if (base <= 0) return prev; // swap below $10 threshold

      const next   = cloneRecord(prev);
      const m      = calcMultiplier(next.boosts.staking, next.boosts.referral);
      const earned = pushEvent(next, 'swap', base, m, id);
      next.totalPoints      += earned;
      next.breakdown.swap   += earned;
      // Cap seen-IDs array to prevent unbounded growth (keep newest 500)
      next.seenSwapTxIds = [...next.seenSwapTxIds.slice(-499), id];
      return next;
    });
  }, [mutate]);

  const awardAnalyticsVisit = useCallback(() => {
    mutate(prev => {
      const now = Date.now();
      // Rate-limit to once per 24 h
      if (now - prev.lastAnalyticsAward < POINTS_CONFIG.ANALYTICS_COOLDOWN_MS) return prev;

      const next   = cloneRecord(prev);
      const base   = POINTS_CONFIG.ANALYTICS_POINTS;
      const m      = calcMultiplier(next.boosts.staking, next.boosts.referral);
      const earned = pushEvent(next, 'analytics', base, m);
      next.totalPoints          += earned;
      next.breakdown.analytics  += earned;
      next.lastAnalyticsAward   = now;
      return next;
    });
  }, [mutate]);

  const updateStakingBoost = useCallback((stakedTON: number, tonUSD: number) => {
    if (!Number.isFinite(stakedTON) || !Number.isFinite(tonUSD) || tonUSD < 0) return;
    const stakedUSD = Math.max(0, stakedTON) * Math.max(0, tonUSD);
    const newBoost  = calcStakingBoost(stakedUSD);
    mutate(prev => {
      if (prev.boosts.staking === newBoost) return prev; // no-op to avoid spurious saves
      const next = cloneRecord(prev);
      next.boosts.staking = newBoost;
      return next;
    });
  }, [mutate]);

  // ─── Derived values ───────────────────────────────────────────────────────────

  const multiplier = useMemo(
    () => record ? calcMultiplier(record.boosts.staking, record.boosts.referral) : 1,
    [record?.boosts.staking, record?.boosts.referral],
  );

  const referralLink = useMemo(() => {
    if (!record || typeof window === 'undefined') return '';
    return `${window.location.origin}/?ref=${record.referral.code}`;
  }, [record?.referral.code]);

  return (
    <PointsContext.Provider value={{
      record, tonUSDPrice, multiplier,
      awardFirstConnect, awardFirstSwap, awardSwap,
      awardAnalyticsVisit, updateStakingBoost, referralLink,
    }}>
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints(): PointsContextValue {
  const ctx = useContext(PointsContext);
  if (!ctx) throw new Error('usePoints must be used within PointsProvider');
  return ctx;
}
