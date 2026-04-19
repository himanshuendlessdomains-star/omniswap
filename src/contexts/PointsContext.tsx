'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';
import { createClient } from '@/utils/supabase/client';
import {
  POINTS_CONFIG, PointsRecord, PointEvent, PointEventType,
  makeEmptyRecord, genReferralCode,
  calcMultiplier, calcSwapBasePoints, calcStakingBoost, calcReferralBoost,
} from '@/lib/points';

// ─── DB row types ─────────────────────────────────────────────────────────────

type RecordRow = {
  wallet_address: string;
  total_points: number;
  breakdown_swap: number;
  breakdown_analytics: number;
  breakdown_bonus: number;
  boost_staking: number;
  boost_referral: number;
  flag_first_connect: boolean;
  flag_first_swap: boolean;
  referral_code: string;
  referred_by: string | null;
  referral_count: number;
  last_analytics_award: number;
  seen_swap_tx_ids: string[];
  version: number;
};

type EventRow = {
  id: string;
  wallet_address: string;
  type: string;
  base_points: number;
  multiplier: number;
  earned: number;
  meta: string | null;
  ts: number;
};

// ─── Row ↔ domain model mappers ───────────────────────────────────────────────

function rowToRecord(row: RecordRow, history: PointEvent[]): PointsRecord {
  return {
    walletAddress:      row.wallet_address,
    totalPoints:        row.total_points,
    breakdown:          { swap: row.breakdown_swap, analytics: row.breakdown_analytics, bonus: row.breakdown_bonus },
    boosts:             { staking: row.boost_staking, referral: row.boost_referral },
    flags:              { firstConnectAwarded: row.flag_first_connect, firstSwapAwarded: row.flag_first_swap },
    referral:           { code: row.referral_code || genReferralCode(row.wallet_address), referredBy: row.referred_by, count: row.referral_count },
    history,
    lastAnalyticsAward: row.last_analytics_award,
    seenSwapTxIds:      row.seen_swap_tx_ids || [],
    version:            row.version,
  };
}

function recordToRow(rec: PointsRecord): RecordRow {
  return {
    wallet_address:       rec.walletAddress,
    total_points:         rec.totalPoints,
    breakdown_swap:       rec.breakdown.swap,
    breakdown_analytics:  rec.breakdown.analytics,
    breakdown_bonus:      rec.breakdown.bonus,
    boost_staking:        rec.boosts.staking,
    boost_referral:       rec.boosts.referral,
    flag_first_connect:   rec.flags.firstConnectAwarded,
    flag_first_swap:      rec.flags.firstSwapAwarded,
    referral_code:        rec.referral.code,
    referred_by:          rec.referral.referredBy,
    referral_count:       rec.referral.count,
    last_analytics_award: rec.lastAnalyticsAward,
    seen_swap_tx_ids:     rec.seenSwapTxIds,
    version:              rec.version,
  };
}

function rowToEvent(row: EventRow): PointEvent {
  return {
    id:         row.id,
    type:       row.type as PointEventType,
    basePoints: row.base_points,
    multiplier: row.multiplier,
    earned:     row.earned,
    meta:       row.meta ?? undefined,
    ts:         row.ts,
  };
}

function eventToRow(e: PointEvent, walletAddress: string): EventRow {
  return {
    id:             e.id,
    wallet_address: walletAddress,
    type:           e.type,
    base_points:    e.basePoints,
    multiplier:     e.multiplier,
    earned:         e.earned,
    meta:           e.meta ?? null,
    ts:             e.ts,
  };
}

// ─── Shallow clone ────────────────────────────────────────────────────────────

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
  const wallet     = useTonWallet();
  const walletAddr = wallet?.account.address ?? null;

  const [record,      setRecord]      = useState<PointsRecord | null>(null);
  const [tonUSDPrice, setTonUSDPrice] = useState(0);

  // Single Supabase client for the lifetime of this provider
  const supabase = useMemo(() => createClient(), []);

  // Tracks which event IDs are already in Supabase to avoid duplicate inserts
  const persistedEventIds = useRef<Set<string>>(new Set());

  // Fetch TON/USD once on mount for swap USD-value estimation
  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd')
      .then(r => r.json())
      .then(data => {
        const price = data?.['the-open-network']?.usd;
        if (typeof price === 'number' && price > 0) setTonUSDPrice(price);
      })
      .catch(() => {});
  }, []);

  // Load record from Supabase when wallet connects / changes
  useEffect(() => {
    if (!walletAddr) { setRecord(null); return; }

    persistedEventIds.current.clear();
    let cancelled = false;

    async function load() {
      // Fetch record row and event history in parallel
      const [{ data: row }, { data: eventRows }] = await Promise.all([
        supabase
          .from('points_records')
          .select('*')
          .eq('wallet_address', walletAddr)
          .maybeSingle(),
        supabase
          .from('points_events')
          .select('*')
          .eq('wallet_address', walletAddr)
          .order('ts', { ascending: false })
          .limit(100),
      ]);

      if (cancelled) return;

      const history = (eventRows || []).map(e => rowToEvent(e as EventRow));
      history.forEach(e => persistedEventIds.current.add(e.id));

      const rec = row
        ? rowToRecord(row as RecordRow, history)
        : makeEmptyRecord(walletAddr!);

      // Derive referral count from DB (count records that used this wallet's code)
      const { count: refCount } = await supabase
        .from('points_records')
        .select('wallet_address', { count: 'exact', head: true })
        .eq('referred_by', rec.referral.code);

      if (cancelled) return;

      rec.referral.count  = refCount ?? 0;
      rec.boosts.referral = calcReferralBoost(rec.referral.count);

      // One-shot referral code processing from URL param
      if (!rec.referral.referredBy) {
        try {
          const refCode = new URLSearchParams(window.location.search).get('ref');
          if (refCode && refCode.trim() && refCode !== rec.referral.code) {
            rec.referral.referredBy = refCode.trim().toUpperCase();
          }
        } catch { /* URL parsing failed */ }
      }

      // Apply first-connect bonus before setRecord — child component effects fire
      // before parent effects, so calling awardFirstConnect() from a child would
      // see record=null and silently no-op.
      if (!rec.flags.firstConnectAwarded) {
        const bonus = POINTS_CONFIG.FIRST_CONNECT_BONUS;
        rec.totalPoints              += bonus;
        rec.breakdown.bonus          += bonus;
        rec.flags.firstConnectAwarded = true;
        pushEvent(rec, 'first_connect', bonus, 1);
      }

      if (!cancelled) setRecord(rec);
    }

    load().catch(console.error);
    return () => { cancelled = true; };
  }, [walletAddr, supabase]);

  // Persist record + new events to Supabase whenever local state changes
  useEffect(() => {
    if (!record) return;

    const newEvents = record.history.filter(e => !persistedEventIds.current.has(e.id));

    async function flush() {
      await supabase
        .from('points_records')
        .upsert(recordToRow(record!), { onConflict: 'wallet_address' });

      if (newEvents.length > 0) {
        await supabase
          .from('points_events')
          .upsert(newEvents.map(e => eventToRow(e, record!.walletAddress)), { onConflict: 'id' });
        newEvents.forEach(e => persistedEventIds.current.add(e.id));
      }
    }

    flush().catch(console.error);
  }, [record, supabase]);

  // ─── Core mutator ─────────────────────────────────────────────────────────────

  const mutate = useCallback((updater: (r: PointsRecord) => PointsRecord) => {
    setRecord(prev => (prev ? updater(prev) : prev));
  }, []);

  // ─── Award functions ──────────────────────────────────────────────────────────

  const awardFirstConnect = useCallback(() => {
    mutate(prev => {
      if (prev.flags.firstConnectAwarded) return prev;
      const next  = cloneRecord(prev);
      const bonus = POINTS_CONFIG.FIRST_CONNECT_BONUS;
      next.totalPoints              += bonus;
      next.breakdown.bonus          += bonus;
      next.flags.firstConnectAwarded = true;
      pushEvent(next, 'first_connect', bonus, 1);
      return next;
    });
  }, [mutate]);

  const awardFirstSwap = useCallback(() => {
    mutate(prev => {
      if (prev.flags.firstSwapAwarded) return prev;
      const next  = cloneRecord(prev);
      const bonus = POINTS_CONFIG.FIRST_SWAP_BONUS;
      next.totalPoints           += bonus;
      next.breakdown.bonus       += bonus;
      next.flags.firstSwapAwarded = true;
      pushEvent(next, 'first_swap', bonus, 1);
      return next;
    });
  }, [mutate]);

  const awardSwap = useCallback((usdValue: number, txId: string) => {
    if (!Number.isFinite(usdValue) || usdValue <= 0) return;
    if (typeof txId !== 'string' || !txId.trim()) return;

    mutate(prev => {
      const id = txId.trim();
      if (prev.seenSwapTxIds.includes(id)) return prev;

      const base = calcSwapBasePoints(usdValue);
      if (base <= 0) return prev;

      const next   = cloneRecord(prev);
      const m      = calcMultiplier(next.boosts.staking, next.boosts.referral);
      const earned = pushEvent(next, 'swap', base, m, id);
      next.totalPoints    += earned;
      next.breakdown.swap += earned;
      next.seenSwapTxIds   = [...next.seenSwapTxIds.slice(-499), id];
      return next;
    });
  }, [mutate]);

  const awardAnalyticsVisit = useCallback(() => {
    mutate(prev => {
      const now = Date.now();
      if (now - prev.lastAnalyticsAward < POINTS_CONFIG.ANALYTICS_COOLDOWN_MS) return prev;

      const next   = cloneRecord(prev);
      const base   = POINTS_CONFIG.ANALYTICS_POINTS;
      const m      = calcMultiplier(next.boosts.staking, next.boosts.referral);
      const earned = pushEvent(next, 'analytics', base, m);
      next.totalPoints         += earned;
      next.breakdown.analytics += earned;
      next.lastAnalyticsAward   = now;
      return next;
    });
  }, [mutate]);

  const updateStakingBoost = useCallback((stakedTON: number, tonUSD: number) => {
    if (!Number.isFinite(stakedTON) || !Number.isFinite(tonUSD) || tonUSD < 0) return;
    const stakedUSD = Math.max(0, stakedTON) * Math.max(0, tonUSD);
    const newBoost  = calcStakingBoost(stakedUSD);
    mutate(prev => {
      if (prev.boosts.staking === newBoost) return prev;
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
