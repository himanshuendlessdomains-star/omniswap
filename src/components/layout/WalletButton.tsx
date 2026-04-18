'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useCreateWallet } from '@privy-io/react-auth/extended-chains';
import { useTonWalletPrivy } from '@/hooks/useTonWalletPrivy';
import { shortenAddress } from '@/lib/tonconnect';
import Button from '@/components/ui/Button';

export default function WalletButton() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { createWallet } = useCreateWallet();
  const tonWallet = useTonWalletPrivy();

  if (!ready) return null;

  if (!authenticated) {
    return (
      <Button variant="primary" size="sm" onClick={login}>
        Connect Wallet
      </Button>
    );
  }

  if (!tonWallet) {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={() => createWallet({ chainType: 'ton' })}
      >
        Create TON Wallet
      </Button>
    );
  }

  return (
    <button
      onClick={logout}
      className="d-flex align-items-center gap-2 px-3 py-2 border fw-medium text-sm transition-colors"
      style={{
        background: 'var(--accent-green-dim)',
        borderColor: 'rgba(57,231,95,0.3)',
        color: 'var(--accent-green)',
        borderRadius: '14px',
        cursor: 'pointer',
      }}
    >
      <span
        className="dot-md rounded-circle"
        style={{ background: 'var(--accent-green)' }}
      />
      {shortenAddress(tonWallet.address)}
    </button>
  );
}
