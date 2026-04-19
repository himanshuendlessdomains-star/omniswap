'use client';

import { useEffect } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import Button from '@/components/ui/Button';
import { shortenAddress } from '@/lib/tonconnect';
import { usePoints } from '@/contexts/PointsContext';

export default function WalletButton() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const { awardFirstConnect } = usePoints();

  // Award the one-time first-connect bonus whenever a wallet address is present.
  // The award function is idempotent — it checks the flag internally.
  useEffect(() => {
    if (wallet?.account.address) awardFirstConnect();
  }, [wallet?.account.address, awardFirstConnect]);

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
