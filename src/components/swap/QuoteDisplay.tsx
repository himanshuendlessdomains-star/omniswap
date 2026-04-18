import type { BestQuote, Token } from '@/types';
import { formatUnits } from '@/lib/tokens';

interface Props {
  quote: BestQuote;
  tokenIn: Token;
  tokenOut: Token;
}

export default function QuoteDisplay({ quote, tokenIn, tokenOut }: Props) {
  const rate = (() => {
    const bid = Number(formatUnits(quote.bidUnits, tokenIn.decimals));
    const ask = Number(formatUnits(quote.askUnits, tokenOut.decimals));
    if (!bid) return '—';
    return (ask / bid).toFixed(6);
  })();

  const rows: [string, string][] = [
    ['Rate', `1 ${tokenIn.symbol} ≈ ${rate} ${tokenOut.symbol}`],
    ['Resolver', quote.resolverName],
    ['Gas estimate', `${formatUnits(quote.gasEstimate, 9)} TON`],
    ['Recommended slippage', `${(quote.recommendedSlippageBps / 100).toFixed(2)}%`],
    ['Protocol fee', `${formatUnits(quote.protocolFeeUnits, tokenOut.decimals)} ${tokenOut.symbol}`],
  ];

  return (
    <div className="overflow-hidden animate-slide-up"
      style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)', borderRadius: '14px' }}>
      {rows.map(([label, val], idx) => (
        <div key={label}
          className={`d-flex align-items-center justify-content-between px-3 py-2${idx < rows.length - 1 ? ' border-bottom' : ''}`}
          style={{ borderColor: 'var(--border)' }}>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
          <span className="text-xs fw-medium" style={{ color: 'var(--text)' }}>{val}</span>
        </div>
      ))}
    </div>
  );
}
