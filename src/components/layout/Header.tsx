'use client';

import Link from 'next/link';
import WalletButton from './WalletButton';

export default function Header() {
  return (
    <header className="sticky-top border-bottom"
      style={{ background: 'rgba(7,12,7,0.85)', backdropFilter: 'blur(16px)', zIndex: 50, borderColor: 'var(--border)' }}>
      <div className="max-w-5xl mx-auto px-3 h-16 d-flex align-items-center justify-content-between">

        {/* Logo */}
        <Link href="/" className="d-flex align-items-center gap-2-5 text-decoration-none">
          <div className="icon-lg rounded-3 d-flex align-items-center justify-content-center animate-pulse-green"
            style={{ background: 'var(--accent-green-dim)', border: '1px solid rgba(57,231,95,0.3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M7 16L12 4L17 16" stroke="var(--accent-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 12H15" stroke="var(--accent-green)" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="fw-bold text-lg tracking-tight" style={{ color: 'var(--text)' }}>
            Omni<span style={{ color: 'var(--accent-green)' }}>Swap</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="d-none d-md-flex align-items-center gap-1">
          {[['/', 'Swap'], ['/analytics', 'Analytics']].map(([href, label]) => (
            <Link key={href}
              href={href}
              className="px-3 py-2 rounded-3 text-sm text-decoration-none transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              {label}
            </Link>
          ))}
        </nav>

        <WalletButton />
      </div>
    </header>
  );
}
