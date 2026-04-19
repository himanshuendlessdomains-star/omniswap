const BASE = 'https://tonapi.io/v2';

/** Fetches native TON balance in TON (not nanotons). Returns 0 on failure. */
export async function fetchTONBalance(address: string): Promise<number> {
  try {
    const r = await fetch(`${BASE}/accounts/${encodeURIComponent(address)}`);
    if (!r.ok) return 0;
    const d = await r.json();
    return Number(d.balance ?? 0) / 1e9;
  } catch { return 0; }
}

/**
 * Fetches jetton (token) balances for an address.
 * Returns a map of uppercase symbol → formatted balance.
 */
export async function fetchJettonBalances(address: string): Promise<Record<string, number>> {
  try {
    const r = await fetch(`${BASE}/accounts/${encodeURIComponent(address)}/jettons`);
    if (!r.ok) return {};
    const d = await r.json();
    const out: Record<string, number> = {};
    for (const item of d.balances ?? []) {
      const sym = item.jetton?.symbol?.toUpperCase() as string | undefined;
      const dec = Number(item.jetton?.decimals ?? 9);
      const raw = item.balance ?? '0';
      if (sym) out[sym] = Number(raw) / 10 ** dec;
    }
    return out;
  } catch { return {}; }
}

/** Fetch both TON and jetton balances in one call. Keyed by symbol. */
export async function fetchAllBalances(address: string): Promise<Record<string, number>> {
  const [ton, jettons] = await Promise.all([
    fetchTONBalance(address),
    fetchJettonBalances(address),
  ]);
  return { TON: ton, ...jettons };
}
