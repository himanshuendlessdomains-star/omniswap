
// TonConnect manifest — hosted at /tonconnect-manifest.json
export const TONCONNECT_MANIFEST_URL =
  typeof window !== 'undefined'
    ? `${window.location.origin}/tonconnect-manifest.json`
    : 'https://omniswap.app/tonconnect-manifest.json';

export function shortenAddress(address: string, chars = 4): string {
  if (!address || address.length < chars * 2 + 3) return address;
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}
