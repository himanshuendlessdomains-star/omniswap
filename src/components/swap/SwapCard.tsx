'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import type { Token, BestQuote, TradePhase } from '@/types';
import { NATIVE_TON, TON_TOKENS, parseUnits, formatUnits } from '@/lib/tokens';
import { requestQuote, normalizeQuote, buildTransfer, getOmniston, makeAddress } from '@/lib/omniston';
import TokenSelector from './TokenSelector';
import QuoteDisplay from './QuoteDisplay';
import RouteVisualizer from './RouteVisualizer';
import TradeStatus from './TradeStatus';
import SwapHistory from './SwapHistory';
import Button from '@/components/ui/Button';
import { usePoints } from '@/contexts/PointsContext';
import { useToast } from '@/contexts/ToastContext';
import { useWalletBalances } from '@/hooks/useWalletBalances';
import { useSwapHistory } from '@/hooks/useSwapHistory';

const DEFAULT_SLIPPAGE = 100; // 1%

export default function SwapCard() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const [tokenIn,  setTokenIn]  = useState<Token>(NATIVE_TON);
  const [tokenOut, setTokenOut] = useState<Token>(TON_TOKENS[1]);
  const [amountIn,  setAmountIn]  = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [slippageBps, setSlippageBps] = useState(DEFAULT_SLIPPAGE);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory,  setShowHistory]  = useState(false);

  const [quote, setQuote] = useState<BestQuote | null>(null);
  const rawQuoteRef = useRef<any>(null);
  const [quoting,    setQuoting]    = useState(false);
  const [quoteError, setQuoteError] = useState('');

  const { awardSwap, awardFirstSwap, tonUSDPrice } = usePoints();
  const toast = useToast();
  const { balances, refresh: refreshBalances } = useWalletBalances();
  const { history, loading: historyLoading, addRecord } = useSwapHistory();

  const [phase,    setPhase]    = useState<TradePhase>('idle');
  const [txHash,   setTxHash]   = useState('');
  const [swapping, setSwapping] = useState(false);

  const subRef    = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Quote fetching ──────────────────────────────────────────────────────────

  const fetchQuote = useCallback(() => {
    if (!tokenIn || !tokenOut || !amountIn || Number(amountIn) <= 0) {
      setQuote(null);
      setAmountOut('');
      return;
    }

    if (subRef.current) {
      subRef.current.unsubscribe?.();
      subRef.current = null;
    }

    setQuoting(true);
    setQuoteError('');

    const bidUnits = parseUnits(amountIn, tokenIn.decimals);
    let best: BestQuote | null = null;

    subRef.current = requestQuote({
      bidAssetAddress: tokenIn.address,
      askAssetAddress: tokenOut.address,
      bidUnits,
      slippageBps,
    }).subscribe({
      next: (event: any) => {
        setQuoting(false);
        const normalized = normalizeQuote(event);
        if (!normalized) return;
        if (!best || BigInt(normalized.askUnits) > BigInt(best.askUnits)) {
          best = normalized;
          rawQuoteRef.current = event?.quote ?? event;
          setQuote(normalized);
          setAmountOut(formatUnits(normalized.askUnits, tokenOut.decimals));
        }
      },
      error: (err: Error) => {
        setQuoting(false);
        setQuoteError(err?.message ?? 'Failed to fetch quote');
      },
    });
  }, [tokenIn, tokenOut, amountIn, slippageBps]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchQuote, 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [fetchQuote]);

  useEffect(() => {
    return () => { subRef.current?.unsubscribe?.(); };
  }, []);

  // ─── Award points + record history + toast on settlement ────────────────────

  useEffect(() => {
    if (phase !== 'trade_settled' || !txHash) return;

    const sym = tokenIn?.symbol?.toUpperCase() ?? '';
    const amt = parseFloat(amountIn) || 0;
    let usdValue = 0;
    if (sym.includes('USD') || sym === 'USDC' || sym === 'DAI') {
      usdValue = amt;
    } else if (sym === 'TON' && tonUSDPrice > 0) {
      usdValue = amt * tonUSDPrice;
    }

    awardFirstSwap();
    awardSwap(usdValue, txHash);

    // Record in swap history
    addRecord({
      tokenIn:   tokenIn?.symbol ?? '',
      tokenOut:  tokenOut?.symbol ?? '',
      amountIn,
      amountOut,
      txHash,
      ts: Date.now(),
    });

    // Refresh balances to reflect the new state
    refreshBalances();

    // Success notification
    toast({
      type:    'success',
      title:   'Swap complete!',
      message: `${amountIn} ${tokenIn?.symbol} → ${amountOut} ${tokenOut?.symbol}`,
      action:  { label: 'View on Tonscan', href: `https://tonscan.org/tx/${encodeURIComponent(txHash)}` },
    });
  }, [phase]); // intentionally only re-runs on phase change — eslint-disable-line react-hooks/exhaustive-deps

  // ─── Swap execution ──────────────────────────────────────────────────────────

  function flipTokens() {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn(amountOut);
    setAmountOut('');
    setQuote(null);
  }

  async function handleSwap() {
    if (!wallet || !quote || !rawQuoteRef.current) return;
    setSwapping(true);
    setPhase('awaiting_transfer');

    try {
      const txPayload = await buildTransfer(rawQuoteRef.current, wallet.account.address, true);
      const messages  = txPayload?.ton?.messages ?? [];
      if (!messages.length) throw new Error('No transaction messages returned');

      const result = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: messages.map((m: any) => ({
          address: m.targetAddress ?? m.target_address,
          amount:  m.sendAmount    ?? m.send_amount,
          payload: m.payload,
        })),
      });

      const outHash = result?.boc ?? '';
      setTxHash(outHash);
      setPhase('transferring');

      const omniston = getOmniston();
      const trackSub = omniston.trackTrade({
        quoteId: quote.quoteId,
        traderWalletAddress: makeAddress(wallet.account.address),
        outgoingTxHash: outHash,
      }).subscribe({
        next: (status: any) => {
          // SDK returns protobuf: status.status is TradeStatus_StatusOneOf (object, not string)
          const s = status?.status;
          if (s?.swapping)        setPhase('swapping');
          else if (s?.receivingFunds) setPhase('receiving_funds');
          else if (s?.tradeSettled) {
            setPhase('trade_settled');
            setSwapping(false);
            trackSub?.unsubscribe?.();
          }
        },
        error: () => { setSwapping(false); trackSub?.unsubscribe?.(); },
      });

    } catch (err: any) {
      setSwapping(false);
      setPhase('idle');
      setQuoteError(err?.message ?? 'Transaction failed');
      toast({ type: 'error', title: 'Swap failed', message: err?.message ?? 'Transaction rejected' });
    }
  }

  // ─── Derived values ──────────────────────────────────────────────────────────

  // Attach live balances to tokens so TokenField can display them
  const tokenInWithBal  = attachBalance(tokenIn,  balances);
  const tokenOutWithBal = attachBalance(tokenOut, balances);

  const canSwap = !!wallet && !!quote && !!amountIn && Number(amountIn) > 0 && !swapping;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="w-100 max-w-md mx-auto">
      {/* Card */}
      <div className="p-4 d-flex flex-column gap-3" style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-2)',
        borderRadius: '28px',
        boxShadow: 'var(--shadow-card), var(--shadow-glow)',
        position: 'relative',   // needed for history overlay
        overflow: 'hidden',
        minHeight: '340px',
      }}>
        {/* History overlay */}
        {showHistory && (
          <SwapHistory
            records={history}
            loading={historyLoading}
            onClose={() => setShowHistory(false)}
          />
        )}

        {/* Header */}
        <div className="d-flex align-items-center justify-content-between px-1">
          <h2 className="fw-bold text-lg mb-0" style={{ color: 'var(--text)' }}>Swap</h2>
          <div className="d-flex align-items-center gap-2">
            {/* History button */}
            {wallet && (
              <button
                onClick={() => setShowHistory(s => !s)}
                title="Transaction history"
                className="p-2 rounded-3 transition-colors"
                style={{
                  color: showHistory ? 'var(--accent-green)' : 'var(--text-muted)',
                  background: showHistory ? 'var(--accent-green-dim)' : 'transparent',
                  border: 'none',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </button>
            )}
            {/* Settings button */}
            <button
              onClick={() => setShowSettings(s => !s)}
              className="p-2 rounded-3 transition-colors"
              style={{
                color: 'var(--text-muted)',
                background: showSettings ? 'var(--bg-card-2)' : 'transparent',
                border: 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="p-3 d-flex flex-column gap-2 animate-slide-up"
            style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)', borderRadius: '16px' }}>
            <p className="text-xs fw-medium mb-0" style={{ color: 'var(--text-muted)' }}>Slippage tolerance</p>
            <div className="d-flex gap-2">
              {[50, 100, 200].map(bps => (
                <button key={bps}
                  onClick={() => setSlippageBps(bps)}
                  className="px-3 py-2 text-xs fw-medium transition-all"
                  style={{
                    background: slippageBps === bps ? 'var(--accent-green-dim)' : 'var(--bg-input)',
                    color:      slippageBps === bps ? 'var(--accent-green)' : 'var(--text-muted)',
                    border:     `1px solid ${slippageBps === bps ? 'rgba(57,231,95,0.3)' : 'var(--border)'}`,
                    borderRadius: '10px',
                  }}>
                  {bps / 100}%
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Token In */}
        <TokenField
          label="You pay"
          token={tokenInWithBal}
          amount={amountIn}
          onAmountChange={setAmountIn}
          onTokenChange={setTokenIn}
          excludeToken={tokenOut}
          maxAmount={balances[tokenIn?.symbol ?? ''] ?? undefined}
          onMax={() => {
            const bal = balances[tokenIn?.symbol ?? ''];
            if (bal != null) setAmountIn(String(bal));
          }}
        />

        {/* Flip button */}
        <div className="d-flex justify-content-center" style={{ marginTop: '-0.25rem', marginBottom: '-0.25rem' }}>
          <button onClick={flipTokens}
            className="icon-xl rounded-circle d-flex align-items-center justify-content-center transition-all active-scale-90"
            style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border-2)', color: 'var(--text-muted)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
            </svg>
          </button>
        </div>

        {/* Token Out */}
        <TokenField
          label="You receive"
          token={tokenOutWithBal}
          amount={amountOut}
          loading={quoting}
          onAmountChange={() => {}}
          onTokenChange={setTokenOut}
          excludeToken={tokenIn}
          readOnly
        />

        {/* Quote details */}
        {quote && tokenIn && tokenOut && !quoting && (
          <div className="d-flex flex-column gap-2">
            <QuoteDisplay quote={quote} tokenIn={tokenIn} tokenOut={tokenOut} />
            <RouteVisualizer quote={quote} />
          </div>
        )}

        {quoteError && (
          <p className="text-xs px-1 mb-0" style={{ color: '#ef4444' }}>{quoteError}</p>
        )}

        {/* Swap button */}
        <Button
          variant={wallet ? 'primary' : 'secondary'}
          size="lg"
          className="w-100 mt-1"
          loading={swapping}
          disabled={wallet ? !canSwap : false}
          onClick={wallet ? handleSwap : () => tonConnectUI.openModal()}
        >
          {!wallet
            ? 'Connect Wallet'
            : swapping   ? 'Swapping…'
            : quoting    ? 'Getting best rate…'
            : !amountIn  ? 'Enter amount'
            : !quote     ? 'No quote'
            : 'Swap'}
        </Button>
      </div>

      {/* Trade status */}
      {phase !== 'idle' && (
        <div className="mt-3">
          <TradeStatus phase={phase} txHash={txHash} />
        </div>
      )}
    </div>
  );
}

// ─── Attach live balance to token object ──────────────────────────────────────

function attachBalance(token: Token | null, balances: Record<string, number>): Token | null {
  if (!token) return null;
  const sym = token.symbol.toUpperCase();
  const bal = balances[sym];
  if (bal == null) return token;
  const dp = sym === 'TON' || token.decimals >= 9 ? 4 : 2;
  return { ...token, balance: bal.toFixed(dp) };
}

// ─── Token input field ────────────────────────────────────────────────────────

interface TokenFieldProps {
  label: string;
  token: Token | null;
  amount: string;
  onAmountChange: (v: string) => void;
  onTokenChange: (t: Token) => void;
  excludeToken?: Token | null;
  readOnly?: boolean;
  loading?: boolean;
  maxAmount?: number;
  onMax?: () => void;
}

function TokenField({
  label, token, amount, onAmountChange, onTokenChange,
  excludeToken, readOnly, loading, maxAmount, onMax,
}: TokenFieldProps) {
  return (
    <div className="p-3 d-flex flex-column gap-2"
      style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '20px' }}>
      <div className="d-flex align-items-center justify-content-between">
        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{label}</span>
        <div className="d-flex align-items-center gap-2">
          {token?.balance && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Balance: {token.balance} {token.symbol}
            </span>
          )}
          {onMax && maxAmount != null && maxAmount > 0 && !readOnly && (
            <button
              onClick={onMax}
              className="text-xs fw-semibold px-2 py-1 transition-all"
              style={{
                background: 'var(--accent-green-dim)',
                color: 'var(--accent-green)',
                border: '1px solid rgba(57,231,95,0.25)',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              MAX
            </button>
          )}
        </div>
      </div>
      <div className="d-flex align-items-center gap-3">
        <TokenSelector value={token} onChange={onTokenChange} exclude={excludeToken} label="Pick" />
        <div className="flex-grow-1 position-relative">
          {loading ? (
            <div className="d-flex align-items-center gap-2" style={{ height: '2rem' }}>
              <span className="icon-sm rounded-circle animate-spin"
                style={{ border: '2px solid var(--accent-green)', borderTopColor: 'transparent' }} />
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Fetching…</span>
            </div>
          ) : (
            <input
              type="number"
              value={amount}
              onChange={e => onAmountChange(e.target.value)}
              readOnly={readOnly}
              placeholder="0.00"
              className="w-100 text-end fw-semibold outline-none"
              style={{
                fontSize: '1.25rem',
                color: amount ? 'var(--text)' : 'var(--text-dim)',
                cursor: readOnly ? 'default' : 'text',
                background: 'transparent',
                border: 'none',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
