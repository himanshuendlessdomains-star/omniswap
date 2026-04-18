import { Buffer } from 'buffer';
import {
  TonClient,
  WalletContractV4,
  internal,
  SendMode,
  Cell,
} from '@ton/ton';

export interface TonMessage {
  address: string;
  amount: string;
  payload?: string;
}

export async function buildAndSendTonTransaction(
  walletAddress: string,
  walletId: string,
  messages: TonMessage[],
  opts: {
    getAccessToken: () => Promise<string | null>;
    signRawHash: (params: {
      address: string;
      chainType: 'ton';
      hash: `0x${string}`;
    }) => Promise<{ signature: `0x${string}` }>;
    privyAppId: string;
  }
): Promise<string> {
  const accessToken = await opts.getAccessToken();
  if (!accessToken) throw new Error('Not authenticated');

  const res = await fetch(`https://auth.privy.io/api/v1/wallets/${walletId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'privy-app-id': opts.privyAppId,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch wallet public key from Privy');

  let publicKeyHex: string = (await res.json()).public_key.replace('0x', '');
  // Strip Ed25519 ASN.1 prefix if present
  if (publicKeyHex.length === 66 && publicKeyHex.startsWith('00')) {
    publicKeyHex = publicKeyHex.slice(2);
  }

  const contract = WalletContractV4.create({
    workchain: 0,
    publicKey: Buffer.from(publicKeyHex, 'hex'),
  });

  const client = new TonClient({
    endpoint:
      process.env.NEXT_PUBLIC_TONCENTER_API_URL ??
      'https://toncenter.com/api/v2/jsonRPC',
    apiKey: process.env.NEXT_PUBLIC_TONCENTER_API_KEY,
  });

  const opened = client.open(contract);
  const seqno = await opened.getSeqno();

  const transfer = await contract.createTransfer({
    seqno,
    messages: messages.map((m) =>
      internal({
        to: m.address,
        value: BigInt(m.amount),
        body: m.payload ? Cell.fromBase64(m.payload) : undefined,
      })
    ),
    sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
    signer: async (msgCell) => {
      const hash = ('0x' +
        Buffer.from(msgCell.hash()).toString('hex')) as `0x${string}`;
      const { signature } = await opts.signRawHash({
        address: walletAddress,
        chainType: 'ton',
        hash,
      });
      return Buffer.from(signature.slice(2), 'hex');
    },
  });

  await opened.send(transfer);

  return transfer.hash().toString('base64');
}
