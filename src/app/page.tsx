'use client';

import Link from 'next/link';
import SwapCard from '@/components/swap/SwapCard';

// ─── Shared ───────────────────────────────────────────────────────────────────
function SectionLabel({ text }: { text: string }) {
  return (
    <p className="section-label">
      <span style={{ color: 'var(--text-dim)' }}>—</span> {text}
    </p>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Hero />
      <Protocols />
      <Features />
      <HowItWorks />
      <Stats />
      <CTABanner />
      <Footer />
    </>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 60% -10%, rgba(57,231,95,0.06) 0%, transparent 60%), var(--bg-primary)',
        paddingTop: '4rem',
        paddingBottom: '5rem',
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="row align-items-center g-5">

          {/* Left — copy */}
          <div className="col-12 col-lg-5">
            {/* Live badge */}
            <div className="hero-badge mb-4 d-inline-flex">
              <span className="dot-sm rounded-circle animate-pulse" style={{ background: 'var(--accent-lime)' }} />
              Live on TON · 4 DEXes
            </div>

            {/* Headline */}
            <h1
              className="font-display fw-bold tracking-tighter leading-tight mb-4"
              style={{ fontSize: 'clamp(2.6rem, 5vw, 4.25rem)', color: 'var(--text)' }}
            >
              Swap anything,{' '}
              <span style={{ color: 'var(--accent-lime)' }}>anywhere,</span>{' '}
              in one tap.
            </h1>

            {/* Description */}
            <p className="mb-5" style={{ color: 'var(--text-muted)', fontSize: '1.0625rem', lineHeight: 1.7, maxWidth: '30rem' }}>
              OmniSwap routes your trade across STON.fi, DeDust, and TONCO
              to guarantee the best price — with MEV protection, sub-10s
              settlement, and a single signature.
            </p>

            {/* CTAs */}
            <div className="d-flex align-items-center gap-3 flex-wrap mb-5">
              <Link
                href="/"
                className="d-inline-flex align-items-center gap-2 fw-bold text-decoration-none btn-custom-lg"
                style={{
                  background: 'var(--accent-lime)',
                  color: '#0c0f11',
                  borderRadius: '999px',
                  fontSize: '0.9375rem',
                }}
              >
                Launch app
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
              <Link
                href="#how-it-works"
                className="d-inline-flex align-items-center gap-2 fw-medium text-decoration-none btn-custom-lg"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-2)',
                  color: 'var(--text)',
                  borderRadius: '999px',
                  fontSize: '0.9375rem',
                }}
              >
                See how it works
              </Link>
            </div>

            {/* Trust */}
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex" style={{ gap: '-6px' }}>
                {['#c8f135','#39e75f','#60a5fa','#f472b6'].map((c, i) => (
                  <div
                    key={c}
                    className="rounded-circle border"
                    style={{
                      width: '2rem',
                      height: '2rem',
                      background: c,
                      borderColor: 'var(--bg-primary) !important',
                      marginLeft: i > 0 ? '-8px' : 0,
                    }}
                  />
                ))}
              </div>
              <p className="mb-0 text-sm" style={{ color: 'var(--text-muted)' }}>
                Trusted by <span style={{ color: 'var(--text)', fontWeight: 600 }}>52,400+</span> TON traders
              </p>
            </div>
          </div>

          {/* Right — swap card */}
          <div className="col-12 col-lg-7 d-flex justify-content-center justify-content-lg-end">
            <div style={{ width: '100%', maxWidth: '30rem' }}>
              <SwapCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Protocols ────────────────────────────────────────────────────────────────
const PROTOCOLS = [
  { name: 'STON.fi v1',  dot: '#818cf8', desc: 'AMM v1' },
  { name: 'STON.fi v2',  dot: '#a78bfa', desc: 'AMM v2' },
  { name: 'DeDust',      dot: '#fbbf24', desc: 'Vault AMM' },
  { name: 'TONCO',       dot: '#60a5fa', desc: 'CL AMM' },
  { name: 'Omniston',    dot: '#c8f135', desc: 'Aggregator' },
  { name: 'TonConnect',  dot: '#38bdf8', desc: 'Wallet SDK' },
  { name: 'STON.fi v1',  dot: '#818cf8', desc: 'AMM v1' },
  { name: 'STON.fi v2',  dot: '#a78bfa', desc: 'AMM v2' },
  { name: 'DeDust',      dot: '#fbbf24', desc: 'Vault AMM' },
  { name: 'TONCO',       dot: '#60a5fa', desc: 'CL AMM' },
  { name: 'Omniston',    dot: '#c8f135', desc: 'Aggregator' },
  { name: 'TonConnect',  dot: '#38bdf8', desc: 'Wallet SDK' },
];

function Protocols() {
  return (
    <section
      className="border-top border-bottom py-section"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-section)', overflow: 'hidden' }}
    >
      <div className="max-w-6xl mx-auto px-4 mb-5">
        <SectionLabel text="Protocols" />
        <h2 className="font-display fw-bold tracking-tighter" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', color: 'var(--text)' }}>
          One aggregator.{' '}
          <span style={{ color: 'var(--text-muted)' }}>Every DEX worth using.</span>
        </h2>
      </div>

      {/* Marquee */}
      <div style={{ position: 'relative' }}>
        {/* Fade edges */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '8rem', background: 'linear-gradient(to right, var(--bg-section), transparent)', zIndex: 2, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '8rem', background: 'linear-gradient(to left, var(--bg-section), transparent)', zIndex: 2, pointerEvents: 'none' }} />

        <div className="d-flex" style={{ gap: '0.75rem', overflow: 'hidden' }}>
          <div className="d-flex animate-marquee flex-shrink-0" style={{ gap: '0.75rem' }}>
            {PROTOCOLS.map((p, i) => (
              <div key={i} className="protocol-pill flex-shrink-0">
                <span className="rounded-circle" style={{ width: '8px', height: '8px', background: p.dot, display: 'inline-block', flexShrink: 0 }} />
                {p.name}
                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{p.desc}</span>
              </div>
            ))}
          </div>
          {/* Duplicate for seamless loop */}
          <div className="d-flex animate-marquee flex-shrink-0" style={{ gap: '0.75rem' }} aria-hidden>
            {PROTOCOLS.map((p, i) => (
              <div key={i} className="protocol-pill flex-shrink-0">
                <span className="rounded-circle" style={{ width: '8px', height: '8px', background: p.dot, display: 'inline-block', flexShrink: 0 }} />
                {p.name}
                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{p.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    num: '01',
    title: 'Omni-routing',
    body: 'A single quote across all TON DEXes simultaneously. Your trade splits across pools in the optimal proportions — you get the best price, not the most popular route.',
  },
  {
    num: '02',
    title: 'Self-custody, no compromise',
    body: 'TonConnect keeps your keys in your wallet — they never touch our servers. Tonkeeper, MyTonWallet, OpenMask, hardware wallets all supported.',
  },
  {
    num: '03',
    title: 'Sub-10s settlement',
    body: "TON's fast-finality block production means your swap lands in seconds. Omniston resolvers compete to fill your trade — you get the fastest path.",
  },
  {
    num: '04',
    title: 'Best rates, always',
    body: 'Competing resolvers bid against each other for your trade on the Omniston network. No hidden spread, no routing kickbacks. You keep the savings.',
  },
];

function Features() {
  return (
    <section className="landing-section border-bottom" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-6xl mx-auto px-4">
        <SectionLabel text="Features" />
        <h2
          className="font-display fw-bold tracking-tighter mb-5"
          style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', color: 'var(--text)' }}
        >
          Built for people who{' '}
          <span style={{ color: 'var(--accent-lime)' }}>actually move money.</span>
        </h2>

        <div
          className="overflow-hidden"
          style={{ border: '1px solid var(--border)', borderRadius: '20px' }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={f.num}
              className={`feature-card d-flex flex-column flex-md-row align-items-md-start gap-4 ${i < FEATURES.length - 1 ? 'border-bottom' : ''}`}
              style={{ borderRadius: 0, border: 'none', borderColor: 'var(--border)' }}
            >
              <div className="feature-number flex-shrink-0" style={{ minWidth: '2.5rem', paddingTop: '0.125rem' }}>{f.num}</div>
              <div>
                <h3
                  className="font-display fw-bold mb-2"
                  style={{ fontSize: '1.1875rem', color: 'var(--text)' }}
                >
                  {f.title}
                </h3>
                <p className="mb-0 text-sm" style={{ color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '36rem' }}>
                  {f.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: '01',
    title: 'Connect your wallet',
    body: 'Tap "Connect Wallet" and approve in Tonkeeper, MyTonWallet, or any TonConnect-compatible wallet. Takes 6 seconds.',
  },
  {
    num: '02',
    title: 'Pick any two tokens',
    body: 'Search TON, USDT, STON, SCALE, BOLT, jUSDC and more. Enter your amount — we find the optimal route across all DEXes instantly.',
  },
  {
    num: '03',
    title: 'Sign once',
    body: 'One signature, one transaction, one receipt. Omniston resolvers handle multi-leg execution atomically — everything reverts if any leg fails.',
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="landing-section border-bottom" style={{ borderColor: 'var(--border)', background: 'var(--bg-section)' }}>
      <div className="max-w-6xl mx-auto px-4">
        <SectionLabel text="How it works" />
        <h2
          className="font-display fw-bold tracking-tighter mb-5"
          style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', color: 'var(--text)' }}
        >
          Three steps.{' '}
          <span style={{ color: 'var(--text-muted)' }}>No extra tabs open.</span>
        </h2>

        <div className="d-flex flex-column gap-3">
          {STEPS.map(s => (
            <div
              key={s.num}
              className="p-4 d-flex align-items-start gap-4"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px' }}
            >
              <div
                className="flex-shrink-0 d-flex align-items-center justify-content-center font-display fw-bold text-sm"
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  background: 'var(--bg-card-2)',
                  color: 'var(--accent-lime)',
                  border: '1px solid var(--border-2)',
                }}
              >
                {s.num}
              </div>
              <div>
                <h3 className="font-display fw-bold mb-1" style={{ fontSize: '1.125rem', color: 'var(--text)' }}>
                  {s.title}
                </h3>
                <p className="mb-0 text-sm" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: '$24M+',   label: 'Volume routed' },
  { value: '52,400+', label: 'Swaps settled' },
  { value: '4',       label: 'DEXes aggregated' },
  { value: '~8s',     label: 'Median settlement' },
];

function Stats() {
  return (
    <section className="landing-section border-bottom" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div
          className="overflow-hidden"
          style={{ border: '1px solid var(--border)', borderRadius: '20px' }}
        >
          <div className="row g-0">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`col-6 col-md-3 stat-card${i % 2 === 0 && i < 2 ? ' border-end' : ''}${i < 2 ? ' border-bottom border-md-bottom-0' : ''}`}
                style={{ borderColor: 'var(--border)' }}
              >
                <h3 className="font-display">{s.value}</h3>
                <p>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA banner ───────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section className="landing-section border-bottom" style={{ borderColor: 'var(--border)', background: 'var(--bg-section)' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div
          className="text-center p-5 p-md-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px' }}
        >
          <h2
            className="font-display fw-bold tracking-tighter mb-3"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', color: 'var(--text)' }}
          >
            Your whole TON life,{' '}
            <span style={{ color: 'var(--accent-lime)' }}>in one tab.</span>
          </h2>
          <p className="mb-5 mx-auto" style={{ color: 'var(--text-muted)', maxWidth: '28rem', lineHeight: 1.7 }}>
            Start swapping with the best rates on TON. Free, self-custodial, no account needed.
          </p>

          <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap mb-4">
            <Link
              href="/"
              className="d-inline-flex align-items-center gap-2 fw-bold text-decoration-none btn-custom-lg"
              style={{ background: 'var(--accent-lime)', color: '#0c0f11', borderRadius: '999px' }}
            >
              Launch app
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
            <Link
              href="/analytics"
              className="d-inline-flex align-items-center gap-2 fw-medium text-decoration-none btn-custom-lg"
              style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border-2)', color: 'var(--text)', borderRadius: '999px' }}
            >
              View analytics
            </Link>
          </div>

          <p className="mb-0 text-xs" style={{ color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
            Powered by Omniston · STON.fi · DeDust · TONCO · TonConnect
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
const FOOTER_LINKS = {
  Product:    [['Swap', '/'], ['Analytics', '/analytics']],
  Developers: [['Omniston SDK', 'https://docs.ston.fi/docs/developer-section/omniston'], ['TonConnect', 'https://docs.ton.org/develop/dapps/ton-connect/overview'], ['GitHub', 'https://github.com']],
  Community:  [['Telegram', 'https://t.me'], ['Twitter / X', 'https://x.com'], ['TON Foundation', 'https://ton.org']],
};

function Footer() {
  return (
    <footer className="border-top py-5 px-4" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="row g-4 mb-5">

          {/* Brand */}
          <div className="col-12 col-md-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="d-flex align-items-center justify-content-center"
                style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', background: 'var(--accent-lime)' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M7 16L12 4L17 16" stroke="#0c0f11" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12H15" stroke="#0c0f11" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="fw-bold font-display" style={{ color: 'var(--text)' }}>Omniswap</span>
            </div>
            <p className="text-xs mb-0" style={{ color: 'var(--text-dim)', lineHeight: 1.7, maxWidth: '18rem' }}>
              The best swap rates on TON. Powered by Omniston — MEV-protected, self-custodial, sub-10s settlement.
            </p>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group} className="col-6 col-md-2 col-lg-2 offset-lg-0">
              <p className="text-xs fw-semibold mb-3" style={{ color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {group}
              </p>
              <div className="d-flex flex-column gap-2">
                {links.map(([label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-sm text-decoration-none transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-xs mb-0" style={{ color: 'var(--text-dim)' }}>
            © 2026 Omniswap Labs
          </p>
          <p className="text-xs mb-0" style={{ color: 'var(--text-dim)', fontFamily: 'monospace' }}>
            Built for the open internet
          </p>
        </div>
      </div>
    </footer>
  );
}
