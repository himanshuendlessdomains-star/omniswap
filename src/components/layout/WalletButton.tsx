'use client';

import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import Button from '@/components/ui/Button';
import { shortenAddress } from '@/lib/tonconnect';

export default function WalletButton() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  if (wallet) {
    const addr = wallet.account.address;
    return (
      <button
        onClick={() => tonConnectUI.disconnect()}
        className="d-flex align-items-center gap-2 px-3 py-2 border fw-medium text-sm transition-colors"
        style={{
          background: 'var(--accent-green-dim)',
          borderColor: 'rgba(57,231,95,0.3)',
          color: 'var(--accent-green)',
          borderRadius: '14px',
        }}
      >
        <span className="dot-md rounded-circle" style={{ background: 'var(--accent-green)' }} />
        {shortenAddress(addr)}
      </button>
    );
  }

  return (
    <Button
      variant="primary"
      size="sm"
      onClick={() => tonConnectUI.openModal()}
    >
      Connect Wallet
    </Button>
  );
}
