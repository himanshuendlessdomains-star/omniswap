import type { BestQuote } from '@/types';
import Badge from '@/components/ui/Badge';

interface Props {
  quote: BestQuote;
}

export default function RouteVisualizer({ quote }: Props) {
  const allChunks = quote.routes.flatMap(r =>
    r.steps.flatMap(s => s.chunks)
  );

  if (allChunks.length === 0) return null;

  return (
    <div className="px-2 pb-1 animate-slide-up">
      <p className="text-xs mb-2 px-1" style={{ color: 'var(--text-dim)' }}>Route</p>
      <div className="d-flex align-items-center gap-1 flex-wrap">
        {allChunks.map((chunk, i) => (
          <div key={i} className="d-flex align-items-center gap-1">
            <Badge protocol={chunk.protocol}>{chunk.protocol}</Badge>
            {i < allChunks.length - 1 && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
