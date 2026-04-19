'use client';

import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import Button from '@/components/ui/Button';
import { shortenAddress } from '@/lib/tonconnect';

export default function WalletButton() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  if (wallet) {
    return (
      <button
        onClick={() => tonConnectUI.disconnect()}
        className="d-flex align-items-center gap-2 px-3 py-2 fw-semibold text-sm transition-all"
        style={{
          background: 'var(--accent-green-dim)',
          border: '1px solid var(--border-green)',
          color: 'var(--accent-green)',
          borderRadius: '999px',
        }}
      >
        <span className="dot-md rounded-circle" style={{ background: 'var(--accent-green)' }} />
        {shortenAddress(wallet.account.address)}
      </button>
    );
  }

  return (
    <Button variant="primary" size="sm" onClick={() => tonConnectUI.openModal()}>
      Connect Wallet
    </Button>
  );
}
