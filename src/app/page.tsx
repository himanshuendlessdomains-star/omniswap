'use client';

import Link from 'next/link';
import SwapCard from '@/components/swap/SwapCard';

// ─── Shared ───────────────────────────────────────────────────────────────────
function SectionLabel({ text }: { text: string }) {
  return (
    <p className="section-label">
      <span style={{ color: 'var(--text-dim)' }}>◆</span> {text}
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
        background: 'var(--bg-primary)',
        paddingTop: '4.5rem',
        paddingBottom: '5.5rem',
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="row align-items-center" style={{ gap: '4rem 0' }}>

          {/* Left — copy */}
          <div className="col-12 col-lg-5">
            {/* Badge */}
            <div className="hero-badge mb-4 d-inline-flex">
              <span
                className="rounded-circle animate-pulse-lime-ring flex-shrink-0"
                style={{ width: '6px', height: '6px', background: 'var(--accent-lime)', display: 'inline-block' }}
              />
              Live on TON · 4 DEXes
            </div>

            {/* Headline */}
            <h1
              className="font-display fw-medium leading-tight mb-4"
              style={{
                fontSize: 'clamp(2.75rem, 6.2vw, 5.5rem)',
                color: 'var(--text)',
                letterSpacing: '-0.035em',
                lineHeight: 0.98,
              }}
            >
              Swap anything,{' '}
              <span style={{ color: 'var(--text-muted)' }}>anywhere,</span>{' '}
              in one tap.
            </h1>

            {/* Description */}
            <p
              className="mb-5"
              style={{ color: 'var(--text-muted)', fontSize: '1.0625rem', lineHeight: 1.55, maxWidth: '32rem' }}
            >
              OmniSwap routes your trade across STON.fi, DeDust, and TONCO
              to guarantee the best price — with MEV protection, sub-10s
              settlement, and a single signature.
            </p>

            {/* CTAs */}
            <div className="d-flex align-items-center gap-3 flex-wrap mb-5">
              <Link
                href="https://x.com/defihimanshu"
                className="d-inline-flex align-items-center gap-2 fw-medium text-decoration-none btn-custom-lg"
                style={{
                  background: 'var(--accent-lime)',
                  color: '#0c0f11',
                  borderRadius: '999px',
                  fontSize: '0.9375rem',
                  transition: 'filter 160ms ease, transform 160ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
              >
                Connect On X
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
              <Link
                href="#how-it-works"
                className="d-inline-flex align-items-center gap-2 fw-medium text-decoration-none btn-custom-lg"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-2)',
                  color: 'var(--text)',
                  borderRadius: '999px',
                  fontSize: '0.9375rem',
                  transition: 'background 160ms ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                See how it works
              </Link>
            </div>

            {/* Trust indicator */}
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex" style={{ marginRight: '0.25rem' }}>
                {[
                  { bg: 'oklch(0.80 0.14 60)',  label: 'J' },
                  { bg: 'oklch(0.76 0.14 200)', label: 'A' },
                  { bg: 'oklch(0.74 0.14 320)', label: 'M' },
                  { bg: 'oklch(0.78 0.14 140)', label: 'T' },
                ].map((av, i) => (
                  <div
                    key={i}
                    className="rounded-circle d-flex align-items-center justify-content-center fw-semibold"
                    style={{
                      width: '1.625rem',
                      height: '1.625rem',
                      background: av.bg,
                      border: '2px solid var(--bg-primary)',
                      marginLeft: i > 0 ? '-8px' : 0,
                      fontSize: '0.625rem',
                      color: '#0c0f11',
                    }}
                  >
                    {av.label}
                  </div>
                ))}
              </div>
              <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Trusted by <span style={{ color: 'var(--text)', fontWeight: 500 }}>52,400+</span> TON traders
              </p>
            </div>
          </div>

          {/* Right — swap card with glow */}
          <div className="col-12 col-lg-7 d-flex justify-content-center justify-content-lg-end">
            <div style={{ width: '100%', maxWidth: '30rem', position: 'relative' }}>
              {/* Glow behind card */}
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  top: '-10%',
                  right: '-10%',
                  width: '70%',
                  height: '80%',
                  background: 'radial-gradient(closest-side, rgba(200,241,53,0.18), transparent 70%)',
                  filter: 'blur(40px)',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <SwapCard />
              </div>
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
        <h2
          className="font-display fw-medium tracking-tighter"
          style={{ fontSize: 'clamp(2rem, 3.8vw, 3.25rem)', color: 'var(--text)', letterSpacing: '-0.028em', lineHeight: 1.02 }}
        >
          One aggregator.{' '}
          <span style={{ color: 'var(--text-muted)' }}>Every DEX worth using.</span>
        </h2>
      </div>

      {/* Marquee */}
      <div style={{ position: 'relative' }}>
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
          className="font-display fw-medium tracking-tighter mb-5"
          style={{ fontSize: 'clamp(2rem, 3.8vw, 3.25rem)', color: 'var(--accent-lime)', letterSpacing: '-0.028em', lineHeight: 1.02 }}
        >
          Built for people who{' '}
          <span style={{ color: 'var(--text-muted)' }}>actually move money.</span>
        </h2>

        <div className="overflow-hidden" style={{ border: '1px solid var(--border)', borderRadius: '20px' }}>
          <div className="feature-grid">
            {FEATURES.map(f => (
              <div key={f.num} className="feature-card" style={{ borderRadius: 0 }}>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--accent-lime)', letterSpacing: '0.04em', marginBottom: '2.5rem' }}>
                  {f.num}
                </div>
                <h3 style={{ fontSize: '1.375rem', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '0.75rem' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.55, color: 'var(--text-muted)', maxWidth: '44ch', margin: 0 }}>
                  {f.body}
                </p>
              </div>
            ))}
          </div>
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
          className="font-display fw-medium tracking-tighter mb-5"
          style={{ fontSize: 'clamp(2rem, 3.8vw, 3.25rem)', color: 'var(--text)', letterSpacing: '-0.028em', lineHeight: 1.02 }}
        >
          Three steps.{' '}
          <span style={{ color: 'var(--text-muted)' }}>No extra tabs open.</span>
        </h2>

        <div className="how-grid">
          {STEPS.map(s => (
            <div
              key={s.num}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '1.75rem',
                minHeight: '200px',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-2)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card)'; }}
            >
              <div style={{ fontFamily: 'monospace', fontSize: '3.75rem', color: 'var(--accent-lime)', letterSpacing: '0.06em' }}>
                {s.num}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '0.625rem' }}>
                {s.title}
              </h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.55, color: 'var(--text-muted)', margin: 0 }}>
                {s.body}
              </p>
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
        <div className="overflow-hidden" style={{ border: '1px solid var(--border)', borderRadius: '20px' }}>
          <div className="stats-grid">
            {STATS.map(s => (
              <div key={s.label} style={{ background: 'var(--bg-primary)', padding: '2.25rem 1.75rem' }}>
                <div
                  className="font-display"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.025em', fontWeight: 400, color: 'var(--text)', lineHeight: 1 }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                  {s.label}
                </div>
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
          className="text-center"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '24px',
            padding: 'clamp(2.5rem, 7vw, 5.5rem)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Lime glow */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 'auto -20% -60% -20%',
              height: '80%',
              background: 'radial-gradient(closest-side, rgba(200,241,53,0.22), transparent 70%)',
              filter: 'blur(30px)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2
              className="font-display fw-medium tracking-tighter mb-3 mx-auto"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', color: 'var(--text)', letterSpacing: '-0.028em', lineHeight: 0.98, maxWidth: '18ch' }}
            >
              Your whole TON life,{' '}
              <span style={{ color: 'var(--text-muted)' }}>in one tab.</span>
            </h2>
            <p className="mb-5 mx-auto" style={{ color: 'var(--text-muted)', maxWidth: '28rem', lineHeight: 1.55, fontSize: '1rem' }}>
              Start swapping with the best rates on TON. Free, self-custodial, no account needed.
            </p>

            <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap mb-4">
              <Link
                href="https://x.com/defihimanshu"
                className="d-inline-flex align-items-center gap-2 fw-medium text-decoration-none btn-custom-lg"
                style={{ background: 'var(--accent-lime)', color: '#0c0f11', borderRadius: '999px' }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
              >
                Connect On X
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
              <Link
                href="/analytics"
                className="d-inline-flex align-items-center gap-2 fw-medium text-decoration-none btn-custom-lg"
                style={{ background: 'transparent', border: '1px solid var(--border-2)', color: 'var(--text)', borderRadius: '999px', transition: 'background 160ms ease' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                View analytics
              </Link>
            </div>

            <p className="mb-0" style={{ fontFamily: 'monospace', fontSize: '0.6875rem', color: 'var(--accent-lime)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Powered by Omniston · STON.fi · DeDust · TONCO · TonConnect
            </p>
          </div>
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
    <footer className="border-top py-5 px-4" style={{ borderColor: 'var(--border)', background: 'rgba(12,15,17,0.85)', }}>
      <div className="max-w-6xl mx-auto">
        <div className="row g-4 mb-5">

          {/* Brand */}
          <div className="col-12 col-md-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '1.375rem', height: '1.375rem', borderRadius: '5px', background: 'var(--accent-lime)' }}
              >
                <div style={{ width: '7px', height: '7px', background: '#0c0f11', transform: 'rotate(45deg)', borderRadius: '1.5px' }} />
              </div>
              <span className="fw-medium font-display" style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}>Omniswap</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text)', lineHeight: 1.7, maxWidth: '18rem', margin: 0 }}>
              The best swap rates on TON. Powered by Omniston — MEV-protected, self-custodial, sub-10s settlement.
            </p>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group} className="col-6 col-md-2">
              <p style={{ fontFamily: 'monospace', fontSize: '0.6875rem', fontWeight: 400, color: 'var(--text)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                {group}
              </p>
              <div className="d-flex flex-column gap-2">
                {links.map(([label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-decoration-none transition-colors"
                    style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-lime)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text)')}
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
          <p style={{ fontFamily: 'monospace', fontSize: '0.6875rem', color: 'var(--text-dim)', letterSpacing: '0.06em', margin: 0 }}>
            © 2026 Omniswap Labs
          </p>
          <p style={{ fontFamily: 'monospace', fontSize: '0.6875rem', color: 'var(--text-dim)', letterSpacing: '0.06em', margin: 0 }}>
            Built for the open internet
          </p>
        </div>
      </div>
    </footer>
  );
}
