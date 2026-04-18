import type { ReactNode } from 'react';

type Variant = 'green' | 'yellow' | 'muted' | 'stonfi' | 'dedust' | 'tonco';

const cls: Record<Variant, string> = {
  green:  'badge-green',
  yellow: 'badge-yellow',
  muted:  'badge-muted',
  stonfi: 'protocol-stonfi',
  dedust: 'protocol-dedust',
  tonco:  'protocol-tonco',
};

function protocolVariant(name: string): Variant {
  const n = name.toLowerCase();
  if (n.includes('ston')) return 'stonfi';
  if (n.includes('dedust')) return 'dedust';
  if (n.includes('tonco')) return 'tonco';
  return 'muted';
}

interface Props {
  variant?: Variant;
  protocol?: string;
  children: ReactNode;
  className?: string;
}

export default function Badge({ variant, protocol, children, className = '' }: Props) {
  const v = variant ?? (protocol ? protocolVariant(protocol) : 'muted');
  return (
    <span className={`px-2 py-1 rounded-pill text-xs fw-medium ${cls[v]} ${className}`}>
      {children}
    </span>
  );
}
