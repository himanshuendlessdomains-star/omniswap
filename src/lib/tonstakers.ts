export const NANOTON = 1_000_000_000;

export function fromNano(n: number | bigint): number {
  return Number(n) / NANOTON;
}

export function toNano(ton: number): bigint {
  return BigInt(Math.floor(ton * NANOTON));
}

/** Compound return: amount × (apy/100) × (days/365) */
export function calcReturn(amountTon: number, apy: number, days: number): number {
  return amountTon * (apy / 100) * (days / 365);
}

export function fmtTON(nanotons: number, dp = 4): string {
  return fromNano(nanotons).toLocaleString('en-US', {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
}
