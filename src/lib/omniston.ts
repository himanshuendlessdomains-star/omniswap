'use client';

import { Omniston, SettlementMethod, Blockchain, GaslessSettlement } from '@ston-fi/omniston-sdk';
import type { BestQuote } from '@/types';

const WS_URL = 'wss://omni-ws.ston.fi';

let _client: Omniston | null = null;

export function getOmniston(): Omniston {
  if (!_client) {
    _client = new Omniston({ apiUrl: WS_URL });
  }
  return _client;
}

export function makeAddress(address: string) {
  return { blockchain: Blockchain.TON, address };
}

export interface QuoteParams {
  bidAssetAddress: string;
  askAssetAddress: string;
  bidUnits?: string;
  askUnits?: string;
  slippageBps?: number;
  referrerAddress?: string;
  referrerFeeBps?: number;
}

export function requestQuote(params: QuoteParams) {
  const omniston = getOmniston();

  const amount = params.bidUnits
    ? { bidUnits: params.bidUnits }
    : { askUnits: params.askUnits! };

  return omniston.requestForQuote({
    settlementMethods: [SettlementMethod.SETTLEMENT_METHOD_SWAP],
    bidAssetAddress: makeAddress(params.bidAssetAddress),
    askAssetAddress: makeAddress(params.askAssetAddress),
    amount,
    ...(params.referrerAddress && {
      referrerAddress: makeAddress(params.referrerAddress),
      referrerFeeBps: params.referrerFeeBps ?? 10,
    }),
    settlementParams: {
      maxPriceSlippageBps: params.slippageBps ?? 100,
      gaslessSettlement: GaslessSettlement.GASLESS_SETTLEMENT_POSSIBLE,
      maxOutgoingMessages: 4,
      flexibleReferrerFee: true,
    },
  });
}

// Map SDK quote event → our normalized BestQuote
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeQuote(raw: any): BestQuote | null {
  const q = raw?.quote;
  if (!q) return null;

  const swapParams = q.params?.swap;
  const routes = swapParams?.routes?.map((r: any) => ({
    gasBudget: r.gasBudget ?? r.gas_budget ?? '0',
    steps: r.steps?.map((s: any) => ({
      bidAsset: s.bidAssetAddress?.address ?? '',
      askAsset: s.askAssetAddress?.address ?? '',
      chunks: s.chunks?.map((c: any) => ({
        protocol: protocolLabel(c.protocol),
        bidAmount: c.bidAmount ?? c.bid_amount ?? '0',
        askAmount: c.askAmount ?? c.ask_amount ?? '0',
      })) ?? [],
    })) ?? [],
  })) ?? [];

  return {
    quoteId: q.quoteId ?? q.quote_id ?? '',
    resolverName: q.resolverName ?? q.resolver_name ?? 'Unknown',
    bidUnits: q.bidUnits ?? q.bid_units ?? '0',
    askUnits: q.askUnits ?? q.ask_units ?? '0',
    referrerFeeUnits: q.referrerFeeUnits ?? q.referrer_fee_units ?? '0',
    protocolFeeUnits: q.protocolFeeUnits ?? q.protocol_fee_units ?? '0',
    tradeStartDeadline: q.tradeStartDeadline ?? q.trade_start_deadline ?? 0,
    routes,
    minAskAmount: swapParams?.minAskAmount ?? swapParams?.min_ask_amount ?? '0',
    recommendedSlippageBps: swapParams?.recommendedSlippageBps ?? swapParams?.recommended_slippage_bps ?? 50,
    gasEstimate: q.estimatedGasConsumption ?? q.estimated_gas_consumption ?? '0',
  };
}

// Protocol numeric → label
function protocolLabel(proto: string | number): string {
  const map: Record<string | number, string> = {
    1: 'STON.fi v1', StonFiV1: 'STON.fi v1',
    2: 'STON.fi v2', StonFiV2: 'STON.fi v2',
    3: 'DeDust',     DeDust: 'DeDust',
    4: 'TONCO',      TonCo: 'TONCO',
  };
  return map[proto] ?? String(proto);
}

export async function buildTransfer(
  quote: any,
  walletAddress: string,
  useRecommendedSlippage = true,
) {
  const omniston = getOmniston();
  const addr = makeAddress(walletAddress);
  return omniston.buildTransfer({
    quote,
    sourceAddress: addr,
    destinationAddress: addr,
    gasExcessAddress: addr,
    refundAddress: addr,
    useRecommendedSlippage,
  });
}
