'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';
import { createClient } from '@/utils/supabase/client';

export interface SwapRecord {
  id: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  txHash: string;
  ts: number;
}

export function useSwapHistory() {
  const wallet = useTonWallet();
  const [history, setHistory]   = useState<SwapRecord[]>([]);
  const [loading, setLoading]   = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!wallet?.account.address) { setHistory([]); return; }
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('swap_history')
        .select('*')
        .eq('wallet_address', wallet!.account.address)
        .order('ts', { ascending: false })
        .limit(50);
      if (cancelled) return;
      setLoading(false);
      if (data) {
        setHistory(data.map((r: any) => ({
          id:        r.id,
          tokenIn:   r.token_in,
          tokenOut:  r.token_out,
          amountIn:  r.amount_in,
          amountOut: r.amount_out,
          txHash:    r.tx_hash,
          ts:        r.ts,
        })));
      }
    }

    load().catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [wallet?.account.address, supabase]);

  const addRecord = useCallback(async (rec: Omit<SwapRecord, 'id'>) => {
    if (!wallet?.account.address) return;
    const id = `swap_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const full: SwapRecord = { ...rec, id };

    // Optimistic update — show immediately
    setHistory(prev => [full, ...prev.slice(0, 49)]);

    // Persist to Supabase
    async function persist() {
      const { error } = await supabase.from('swap_history').upsert({
        id,
        wallet_address: wallet!.account.address,
        token_in:   rec.tokenIn,
        token_out:  rec.tokenOut,
        amount_in:  rec.amountIn,
        amount_out: rec.amountOut,
        tx_hash:    rec.txHash,
        ts:         rec.ts,
      }, { onConflict: 'id' });
      if (error) console.error('swap_history upsert:', error);
    }
    persist().catch(console.error);
  }, [wallet?.account.address, supabase]);

  return { history, loading, addRecord };
}
