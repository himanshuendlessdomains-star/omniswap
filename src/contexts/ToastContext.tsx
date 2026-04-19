'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  action?: { label: string; href: string };
}

interface ToastCtx {
  toast: (opts: Omit<ToastItem, 'id'>) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((opts: Omit<ToastItem, 'id'>) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setItems(prev => [...prev.slice(-3), { ...opts, id }]);
    setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), 5500);
  }, []);

  const dismiss = useCallback((id: string) => {
    setItems(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <ToastList items={items} onDismiss={dismiss} />
    </Ctx.Provider>
  );
}

// ─── Toast portal ─────────────────────────────────────────────────────────────

function ToastList({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: string) => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || items.length === 0) return null;

  return createPortal(
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem',
      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem',
      pointerEvents: 'none',
    }}>
      {items.map(item => (
        <ToastCard key={item.id} item={item} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body,
  );
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const isSuccess = item.type === 'success';
  const isError   = item.type === 'error';

  const borderColor = isSuccess
    ? 'rgba(57,231,95,0.35)'
    : isError
    ? 'rgba(239,68,68,0.35)'
    : 'var(--border-2)';

  const iconBg = isSuccess ? 'var(--accent-green)' : isError ? '#ef4444' : 'transparent';
  const iconStroke = isSuccess ? '#030803' : 'white';
  const paddingLeft = isSuccess || isError ? '1.75rem' : 0;

  return (
    <div style={{
      minWidth: '280px', maxWidth: '380px',
      padding: '0.875rem 1rem',
      borderRadius: '14px',
      background: 'var(--bg-card)',
      border: `1px solid ${borderColor}`,
      boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
      pointerEvents: 'all',
      display: 'flex', flexDirection: 'column', gap: '0.3rem',
      animation: 'slideInRight 0.25s ease',
    }}>
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {(isSuccess || isError) && (
            <span style={{
              width: '1.25rem', height: '1.25rem', borderRadius: '50%',
              background: iconBg, display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              {isSuccess ? (
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={iconStroke} strokeWidth="3.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={iconStroke} strokeWidth="3.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              )}
            </span>
          )}
          <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.875rem' }}>
            {item.title}
          </span>
        </div>
        <button
          onClick={() => onDismiss(item.id)}
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 0, lineHeight: 1, flexShrink: 0 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {item.message && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', margin: 0, paddingLeft }}>
          {item.message}
        </p>
      )}

      {item.action && (
        <a
          href={item.action.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: isSuccess ? 'var(--accent-green)' : 'var(--text-muted)',
            fontSize: '0.75rem', fontWeight: 500,
            textDecoration: 'none', marginTop: '0.1rem', paddingLeft,
          }}
        >
          {item.action.label} →
        </a>
      )}
    </div>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.toast;
}
