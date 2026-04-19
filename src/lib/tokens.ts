import type { Token } from '@/types';

// Popular TON mainnet tokens (Jetton addresses)
export const TON_TOKENS: Token[] = [
  {
    address: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
    symbol: 'TON',
    name: 'Toncoin',
    decimals: 9,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
  },
  {
    address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logoUrl: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
  },
  {
    address: 'EQBlqsm144Dq6SjbPI4jjZvA1hqTIP3CvHovbIfW_t-SCALE',
    symbol: 'SCALE',
    name: 'Scaleton',
    decimals: 9,
    logoUrl: 'https://cache.tonapi.io/imgproxy/scale.png',
  },
  {
    address: 'EQB-MPwrd1G6WKNkLz_VnV6WqBDd142KMQv-g1O-8QUA3728',
    symbol: 'STON',
    name: 'STON',
    decimals: 9,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/27311.png',
  },
  {
    address: 'EQDQoc5M3Bh8eWFephi9bClhevelbZZvWhkqdo80XuY_0qB3',
    symbol: 'BOLT',
    name: 'Bolt',
    decimals: 9,
    logoUrl: 'https://cache.tonapi.io/imgproxy/bolt.png',
  },
  {
    address: 'EQAvDfWFG0oYX19jwNDNBBL1rKNT9XfaGP9HyTb5nb2Eml6y',
    symbol: 'jUSDC',
    name: 'jUSDC',
    decimals: 6,
    logoUrl: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
  },
  {
    address: 'EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_9Qsq2zXoDBscmZ',
    symbol: 'pTON',
    name: 'Proxy TON',
    decimals: 9,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
  },
];

export const NATIVE_TON = TON_TOKENS[0];

export function findToken(address: string): Token | undefined {
  return TON_TOKENS.find(t => t.address === address);
}

// Blockchain ID for TON per SLIP-044
export const TON_BLOCKCHAIN = 607;

// Format token amount from on-chain units
export function formatUnits(units: string, decimals: number): string {
  if (!units || units === '0') return '0';
  const n = BigInt(units);
  const divisor = BigInt(10 ** decimals);
  const whole = n / divisor;
  const frac = n % divisor;
  if (frac === 0n) return whole.toString();
  const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${whole}.${fracStr}`;
}

// Parse display amount to on-chain units
export function parseUnits(amount: string, decimals: number): string {
  if (!amount || amount === '0') return '0';
  const [whole, frac = ''] = amount.split('.');
  const fracPadded = frac.padEnd(decimals, '0').slice(0, decimals);
  return (BigInt(whole || '0') * BigInt(10 ** decimals) + BigInt(fracPadded || '0')).toString();
}
