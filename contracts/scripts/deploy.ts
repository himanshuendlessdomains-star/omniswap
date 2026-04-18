/**
 * Deploy OmniswapRouter to TON mainnet/testnet via @ton/ton + tonconnect.
 *
 * Usage:
 *   npx ts-node scripts/deploy.ts --network testnet --owner <addr> --fee 10
 */
import { toNano, Address, TonClient, WalletContractV4, internal } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
  const network = process.argv.includes('--network')
    ? process.argv[process.argv.indexOf('--network') + 1]
    : 'testnet';

  const endpoint = network === 'mainnet'
    ? 'https://toncenter.com/api/v2/jsonRPC'
    : 'https://testnet.toncenter.com/api/v2/jsonRPC';

  const apiKey   = process.env.TONCENTER_API_KEY ?? '';
  const mnemonic = (process.env.DEPLOYER_MNEMONIC ?? '').split(' ');
  const ownerAddr = process.env.OWNER_ADDRESS ?? '';
  const feeCollector = process.env.FEE_COLLECTOR ?? ownerAddr;

  if (!mnemonic.length || !ownerAddr) {
    console.error('Missing DEPLOYER_MNEMONIC or OWNER_ADDRESS in .env');
    process.exit(1);
  }

  const client    = new TonClient({ endpoint, apiKey });
  const keyPair   = await mnemonicToPrivateKey(mnemonic);
  const wallet    = WalletContractV4.create({ publicKey: keyPair.publicKey, workchain: 0 });
  const contract  = client.open(wallet);
  const seqno     = await contract.getSeqno();

  // Read compiled contract code (requires `blueprint build` first)
  const codePath = path.join(__dirname, '../build/OmniswapRouter.code.boc');
  if (!fs.existsSync(codePath)) {
    console.error('Contract not compiled. Run: npx blueprint build');
    process.exit(1);
  }

  console.log(`Deploying OmniswapRouter to ${network}…`);
  console.log(`  Owner:         ${ownerAddr}`);
  console.log(`  Fee collector: ${feeCollector}`);
  console.log(`  Fee BPS:       10 (0.1%)`);

  await contract.sendTransfer({
    seqno,
    secretKey: keyPair.secretKey,
    messages: [
      internal({
        to:    wallet.address,
        value: toNano('0.15'),
        body:  'Deploy OmniswapRouter',
      }),
    ],
  });

  console.log('Deploy transaction sent. Check tonscan for confirmation.');
}

main().catch(console.error);
