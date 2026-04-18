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
  publicKey: string,
  messages: TonMessage[],
  signRawHash: (params: {
    address: string;
    chainType: 'ton';
    hash: `0x${string}`;
  }) => Promise<{ signature: `0x${string}` }>
): Promise<string> {
  // Strip 0x and optional Ed25519 ASN.1 prefix
  let publicKeyHex = publicKey.replace('0x', '');
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
      const { signature } = await signRawHash({
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
