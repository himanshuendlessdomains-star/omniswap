'use client';

import { usePrivy } from '@privy-io/react-auth';

export interface TonWalletAccount {
  address: string;
  publicKey: string;
}

export function useTonWalletPrivy(): TonWalletAccount | null {
  const { user } = usePrivy();

  const tonAccount = user?.linkedAccounts?.find(
    (account) =>
      account.type === 'wallet' &&
      'chainType' in account &&
      (account as any).chainType === 'ton'
  ) as any;

  if (!tonAccount?.publicKey) return null;

  return {
    address: tonAccount.address,
    publicKey: tonAccount.publicKey as string,
  };
}
