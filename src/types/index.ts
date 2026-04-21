export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl: string;
  balance?: string;
}

export interface RouteChunk {
  protocol: string;
  bidAmount: string;
  askAmount: string;
}

export interface RouteStep {
  bidAsset: string;
  askAsset: string;
  chunks: RouteChunk[];
}

export interface Route {
  steps: RouteStep[];
  gasBudget: string;
}

export interface BestQuote {
  quoteId: string;
  resolverName: string;
  bidUnits: string;
  askUnits: string;
  referrerFeeUnits: string;
  protocolFeeUnits: string;
  tradeStartDeadline: number;
  routes: Route[];
  minAskAmount: string;
  recommendedSlippageBps: number;
  gasEstimate: string;
}

export type TradePhase =
  | 'idle'
  | 'awaiting_transfer'
  | 'transferring'
  | 'swapping'
  | 'receiving_funds'
  | 'trade_settled';
