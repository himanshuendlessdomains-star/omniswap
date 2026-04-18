import SwapCard from '@/components/swap/SwapCard';

export default function Home() {
  return (
    <div className="d-flex flex-column min-h-screen-nav">
      {/* Hero */}
      <section className="flex-grow-1 d-flex flex-column align-items-center justify-content-center px-3 py-section gap-10">
        <div className="d-flex flex-column text-center max-w-2xl gap-3 animate-slide-up">
          <div className="d-inline-flex align-items-center gap-2 px-3 rounded-pill text-xs fw-medium mb-2 align-self-center"
            style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)', border: '1px solid rgba(57,231,95,0.2)', paddingTop: '0.375rem', paddingBottom: '0.375rem' }}>
            <span className="dot-sm rounded-circle animate-pulse" style={{ background: 'var(--accent-green)' }} />
            Powered by Omniston — best rates across all TON DEXes
          </div>
          <h1 className="fw-bold tracking-tight leading-tight text-4xl md:text-5xl" style={{ color: 'var(--text)' }}>
            The best swap rates<br />
            <span style={{ color: 'var(--accent-green)' }}>across TON</span>
          </h1>
          <p className="max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            Automatically routes your swap through STON.fi, DeDust, and TONCO
            to guarantee you the best price every time.
          </p>
        </div>

        {/* Swap interface */}
        <div className="w-100 max-w-md animate-fade-in" style={{ animationDelay: '150ms' }}>
          <SwapCard />
        </div>

        {/* Protocol logos */}
        <div className="d-flex align-items-center gap-3 flex-wrap justify-content-center mt-2 animate-fade-in"
          style={{ animationDelay: '250ms' }}>
          <span className="text-xs" style={{ color: 'var(--text-dim)' }}>Routing through</span>
          {['STON.fi v1', 'STON.fi v2', 'DeDust', 'TONCO'].map(name => (
            <span key={name}
              className="px-3 py-1 rounded-pill text-xs fw-medium"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-top py-4 px-3" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="row g-3 text-center">
            {[
              { label: 'Total volume', value: '$24M+' },
              { label: 'DEXes aggregated', value: '4' },
              { label: 'Avg. savings', value: '0.3%' },
            ].map(stat => (
              <div key={stat.label} className="col-4">
                <div className="fw-bold text-xl" style={{ color: 'var(--accent-green)' }}>{stat.value}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
