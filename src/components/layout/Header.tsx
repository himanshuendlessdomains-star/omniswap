'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import WalletButton from './WalletButton';
import PointsBadge from '@/components/ui/PointsBadge';

const NAV_LINKS = [
  ['/',           'Swap'],
  ['/analytics',  'Analytics'],
  ['/staking',    'Staking'],
  ['/points',     'Points'],
] as const;

export default function Header() {
  const pathname  = usePathname();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close mobile menu whenever the route changes
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header
      className="sticky-top"
      style={{
        background:          'rgba(12,15,17,0.95)',
        backdropFilter:      scrolled || menuOpen ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled || menuOpen ? 'blur(20px)' : 'none',
        borderBottom:        `1px solid ${scrolled || menuOpen ? 'var(--border)' : 'transparent'}`,
        transition:          'border-color 200ms ease, backdrop-filter 200ms ease',
        zIndex:              100,
      }}
    >
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 h-16 d-flex align-items-center justify-content-between">

        {/* Logo */}
        <Link href="/" className="d-flex align-items-center gap-2-5 text-decoration-none flex-shrink-0">
          <div
            className="d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: '1.5rem', height: '1.5rem', borderRadius: '7px', background: 'var(--accent-lime)' }}
          >
            <div style={{ width: '9px', height: '9px', background: '#0c0f11', transform: 'rotate(45deg)', borderRadius: '2px' }} />
          </div>
          <span className="fw-medium text-lg tracking-tight font-display" style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}>
            Omniswap
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="d-none d-md-flex align-items-center gap-1">
          {NAV_LINKS.map(([href, label]) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="px-3 py-2 rounded-3 text-sm text-decoration-none transition-colors"
                style={{ color: active ? 'var(--accent-lime)' : 'var(--text)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={e => (e.currentTarget.style.color = active ? 'var(--accent-lime)' : 'var(--text-muted)')}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="d-flex align-items-center gap-2">
          {/* Points badge hidden on very small screens to save space */}
          <div className="d-none d-sm-flex">
            <PointsBadge />
          </div>
          <WalletButton />

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="d-flex d-md-none align-items-center justify-content-center flex-shrink-0"
            style={{
              width:        '36px',
              height:       '36px',
              background:   menuOpen ? 'var(--bg-card-2)' : 'transparent',
              border:       `1px solid ${menuOpen ? 'var(--border-2)' : 'transparent'}`,
              borderRadius: '8px',
              cursor:       'pointer',
              color:        'var(--text)',
              transition:   'background 150ms ease, border-color 150ms ease',
            }}
          >
            {menuOpen ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ───────────────────────────────────────────────────── */}
      {menuOpen && (
        <nav
          className="d-md-none"
          style={{
            borderTop:   '1px solid var(--border)',
            padding:     '0.75rem 1rem 1.5rem',
            background:  'rgba(12,15,17,0.98)',
          }}
        >
          <div className="max-w-6xl mx-auto d-flex flex-column gap-1">
            {NAV_LINKS.map(([href, label]) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="d-flex align-items-center justify-content-between px-3 rounded-3 text-decoration-none"
                  style={{
                    height:     '52px',
                    background: active ? 'var(--bg-card-2)' : 'transparent',
                    color:      active ? 'var(--accent-lime)' : 'var(--text)',
                    transition: 'background 120ms ease',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <span className="fw-medium" style={{ fontSize: '0.9375rem' }}>{label}</span>
                  {active ? (
                    <span className="rounded-circle flex-shrink-0" style={{ width: '6px', height: '6px', background: 'var(--accent-lime)' }} />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  )}
                </Link>
              );
            })}

            {/* Points badge inside drawer for very small screens */}
            <div className="d-sm-none mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <PointsBadge />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
