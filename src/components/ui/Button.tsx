import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'yellow' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

const variants = {
  primary:   'btn-primary-custom',
  secondary: 'btn-secondary-custom',
  yellow:    'btn-yellow-custom',
  ghost:     'btn-ghost-custom',
};

const sizes = {
  sm: 'btn-custom-sm',
  md: 'btn-custom-md',
  lg: 'btn-custom-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`d-inline-flex align-items-center justify-content-center gap-2 transition-all ${variants[variant]} ${sizes[size]} ${className}`}
      style={{ fontFamily: 'var(--font-instrument-sans)', ...((rest as any).style ?? {}) }}
    >
      {loading && (
        <span className="icon-sm rounded-circle animate-spin"
          style={{ border: '2px solid currentColor', borderTopColor: 'transparent' }} />
      )}
      {children}
    </button>
  );
}
