'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';
import { fetchAllBalances } from '@/lib/tonapi';

export type WalletBalances = Record<string, number>;

export function useWalletBalances() {
  const wallet = useTonWallet();
  const [balances, setBalances] = useState<WalletBalances>({});
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (address: string) => {
    setLoading(true);
    const result = await fetchAllBalances(address).catch(() => ({}));
    setBalances(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!wallet?.account.address) { setBalances({}); return; }
    let cancelled = false;
    setLoading(true);
    fetchAllBalances(wallet.account.address)
      .then(result => { if (!cancelled) { setBalances(result); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [wallet?.account.address]);

  const refresh = useCallback(() => {
    if (wallet?.account.address) load(wallet.account.address);
  }, [wallet?.account.address, load]);

  return { balances, loading, refresh };
}
