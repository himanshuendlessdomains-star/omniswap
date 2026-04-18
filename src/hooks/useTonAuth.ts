'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useCreateWallet } from '@privy-io/react-auth/extended-chains';
import { useTonWalletPrivy } from './useTonWalletPrivy';

export function useTonAuth() {
  const { ready, authenticated, login } = usePrivy();
  const { createWallet } = useCreateWallet();
  const tonWallet = useTonWalletPrivy();

  async function connect() {
    if (!authenticated) {
      login();
    } else if (!tonWallet) {
      await createWallet({ chainType: 'ton' });
    }
  }

  return {
    ready,
    wallet: tonWallet,
    isConnected: !!tonWallet,
    connect,
  };
}
