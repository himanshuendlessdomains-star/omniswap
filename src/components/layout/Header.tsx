'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import WalletButton from './WalletButton';

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className="sticky-top"
      style={{
        background: 'rgba(12,15,17,0.85)',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
        transition: 'background 200ms ease, border-color 200ms ease, backdrop-filter 200ms ease',
        zIndex: 50,
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 d-flex align-items-center justify-content-between">

        {/* Logo */}
        <Link href="/" className="d-flex align-items-center gap-2-5 text-decoration-none flex-shrink-0">
          <div
            className="d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: '1.5rem',
              height: '1.5rem',
              borderRadius: '7px',
              background: 'var(--accent-lime)',
            }}
          >
            <div style={{
              width: '9px',
              height: '9px',
              background: '#0c0f11',
              transform: 'rotate(45deg)',
              borderRadius: '2px',
            }} />
          </div>
          <span
            className="fw-medium text-lg tracking-tight font-display"
            style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}
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
                style={{ color: active ? 'var(--accent-lime)' : 'var(--text)' }}
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
