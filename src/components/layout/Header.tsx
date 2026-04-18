'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import WalletButton from './WalletButton';

export default function Header() {
  const pathname = usePathname();

  return (
    <header
      className="sticky-top border-bottom"
      style={{
        background: 'rgba(12,15,17,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 50,
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 d-flex align-items-center justify-content-between">

        {/* Logo */}
        <Link href="/" className="d-flex align-items-center gap-2-5 text-decoration-none flex-shrink-0">
          <div
            className="d-flex align-items-center justify-content-center animate-pulse-green"
            style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              background: 'var(--accent-lime)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M7 16L12 4L17 16" stroke="#0c0f11" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 12H15" stroke="#0c0f11" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span
            className="fw-bold text-lg tracking-tight font-display"
            style={{ color: 'var(--text)' }}
          >
            Omniswap
          </span>
        </Link>

        {/* Nav */}
        <nav className="d-none d-md-flex align-items-center gap-1">
          {([['/', 'Swap'], ['/analytics', 'Analytics']] as const).map(([href, label]) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="px-3 py-2 rounded-3 text-sm text-decoration-none transition-colors"
                style={{ color: active ? 'var(--text)' : 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={e => (e.currentTarget.style.color = active ? 'var(--text)' : 'var(--text-muted)')}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <WalletButton />
      </div>
    </header>
  );
}
