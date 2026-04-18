'use client';

import { usePrivy } from '@privy-io/react-auth';

export interface TonWalletAccount {
  address: string;
  walletId: string;
}

export function useTonWalletPrivy(): TonWalletAccount | null {
  const { user } = usePrivy();

  const tonAccount = user?.linkedAccounts?.find(
    (account) =>
      account.type === 'wallet' &&
      'chainType' in account &&
      (account as any).chainType === 'ton'
  ) as any;

  if (!tonAccount) return null;

  return {
    address: tonAccount.address,
    walletId: tonAccount.id,
  };
}
