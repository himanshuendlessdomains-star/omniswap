<div align="center">

# ⚡ OmniSwap

**The best swap rates across the TON ecosystem**

Smart-routing DEX aggregator powered by [Omniston](https://omniston.ston.fi) — automatically splits and routes your swap across STON.fi, DeDust, and TONCO to guarantee the best price every time.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![TON](https://img.shields.io/badge/TON-Blockchain-0098EA?logo=ton&logoColor=white)](https://ton.org)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel&logoColor=white)](https://omniswap-three.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

[**Live Demo →**](https://omniswap-three.vercel.app)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Omni Points System](#omni-points-system)
- [Liquid Staking](#liquid-staking)
- [Analytics Dashboard](#analytics-dashboard)
- [Database Setup (Supabase)](#database-setup-supabase)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Security Notes](#security-notes)
- [Known Limitations](#known-limitations)

---

## Overview

OmniSwap is a production-grade DEX aggregator on the TON blockchain. It sources quotes from all major TON DEXes simultaneously via the Omniston protocol and routes each swap through the optimal combination of pools to guarantee the best output for any trade size.

### What makes it different

| Feature | OmniSwap | Single DEX |
|---|---|---|
| Price source | 4 DEXes simultaneously | 1 pool |
| Split routing | Yes — any ratio | No |
| MEV protection | Omniston resolver network | Depends on DEX |
| Liquid staking | Integrated (Tonstakers) | Not applicable |
| Engagement rewards | Omni Points system | Not applicable |

---

## Features

| Category | Feature |
|---|---|
| **Swap** | Smart routing via Omniston across STON.fi v1/v2, DeDust, TONCO |
| **Swap** | Real-time quote streaming with best-price selection |
| **Swap** | Live route visualiser — see exactly which pools are used |
| **Swap** | Slippage protection with configurable tolerance |
| **Swap** | Sub-10s settlement with atomic execution |
| **Staking** | Liquid staking via Tonstakers SDK (TON → tsTON) |
| **Staking** | Standard, instant, and best-rate unstake modes |
| **Staking** | Live APY, TVL, and projected returns calculator |
| **Analytics** | Live savings calculator with real Omniston quotes |
| **Analytics** | Protocol distribution chart and top-pairs table |
| **Analytics** | Tonstakers APY and staker statistics |
| **Points** | Omni Points engagement reward system (see below) |
| **Points** | Rank tiers: Bronze → Silver → Gold → Platinum → Diamond |
| **Points** | Multiplier boosts via staking and referrals |
| **UX** | Mobile-responsive with hamburger menu |
| **UX** | Wallet-gated flows with TonConnect |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Next.js 16 (App Router)           │
│                                                      │
│  ┌──────────┐  ┌────────────┐  ┌────────────────┐  │
│  │  / Swap  │  │ /analytics │  │   /staking     │  │
│  └────┬─────┘  └─────┬──────┘  └───────┬────────┘  │
│       │               │                  │           │
│  ┌────▼───────────────▼──────────────────▼────────┐ │
│  │              PointsProvider (Context)           │ │
│  │   React state cache + Supabase persistence     │ │
│  └────────────────────────┬────────────────────────┘ │
│                           │                          │
│  ┌────────────────────────▼────────────────────────┐ │
│  │          TonConnectUIProvider (wallet)          │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
         │                    │                   │
         ▼                    ▼                   ▼
   Omniston WS           Tonstakers SDK       Supabase
   (swap quotes)         (staking data)     (points DB)
```

### Data flow

1. **Swap** — `SwapCard` streams quotes via Omniston WebSocket → user confirms → TonConnect sends transaction → on `trade_settled` phase, `awardSwap()` is called
2. **Staking** — Tonstakers SDK initialised with a connector wrapper that replays the already-connected wallet state → balances and rates fetched → `updateStakingBoost()` keeps the multiplier in sync
3. **Points** — All award functions update React state optimistically, then `useEffect([record])` flushes to Supabase asynchronously

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.4 (App Router) |
| Language | TypeScript 5 |
| UI | React 19, Bootstrap 5 utility classes, custom CSS variables |
| Wallet | TonConnect UI React (`@tonconnect/ui-react`) |
| Swap protocol | Omniston (`@ston-fi/omniston-sdk`) |
| Liquid staking | Tonstakers SDK (`tonstakers-sdk`) |
| Database | Supabase (PostgreSQL) via `@supabase/supabase-js` + `@supabase/ssr` |
| TON price | CoinGecko public API (one fetch on mount) |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx             — Home page (hero, explore, points sections)
│   ├── analytics/page.tsx   — Analytics dashboard + staking returns
│   ├── staking/page.tsx     — Liquid staking UI
│   ├── points/page.tsx      — Omni Points dashboard
│   ├── layout.tsx           — Root layout
│   └── providers.tsx        — TonConnectUIProvider + PointsProvider
├── components/
│   ├── layout/
│   │   ├── Header.tsx       — Sticky nav with mobile hamburger
│   │   └── WalletButton.tsx — Connect/disconnect button
│   ├── swap/
│   │   ├── SwapCard.tsx     — Main swap interface
│   │   ├── TokenSelector.tsx
│   │   ├── QuoteDisplay.tsx
│   │   ├── RouteVisualizer.tsx
│   │   └── TradeStatus.tsx
│   └── ui/
│       ├── PointsBadge.tsx  — Header rank + points display
│       └── Button.tsx
├── contexts/
│   └── PointsContext.tsx    — Points state, Supabase persistence, award logic
├── lib/
│   ├── points.ts            — Pure calculation functions + types
│   ├── omniston.ts          — Omniston SDK helpers
│   ├── tonstakers.ts        — Tonstakers helpers (fromNano, calcReturn)
│   ├── tokens.ts            — Token list + unit helpers
│   └── tonconnect.ts        — Address formatter
└── utils/
    └── supabase/
        ├── client.ts        — Browser Supabase client
        ├── server.ts        — Server-side Supabase client (RSC/API routes)
        └── middleware.ts    — Middleware session refresh helper
```

---

## Omni Points System

Users earn **Omni Points (OP)** for engaging with the platform. Points are stored per-wallet in Supabase and persist across devices and browsers.

### Earning points

| Action | Points | Notes |
|---|---|---|
| Connect wallet | **+10 OP** | One-time bonus |
| First swap | **+10 OP** | One-time bonus |
| Swap tokens | **1 OP per $10 swapped** | Multiplied by boost |
| Visit Analytics | **1 OP per day** | 24-hour cooldown |

### Multiplier boosts

Total multiplier = `1 + stakingBoost + referralBoost`

| Boost | Rate | Cap |
|---|---|---|
| Staking boost | +1× per $100 staked | 100× |
| Referral boost | +1× per referral | 20× |

**Example:** User with $500 staked (5×) and 3 referrals (3×) has a 9× multiplier. A $100 swap earns `10 base × 9 = 90 OP`.

### Rank tiers

| Rank | Points required |
|---|---|
| Bronze | 0 – 99 |
| Silver | 100 – 499 |
| Gold | 500 – 1,999 |
| Platinum | 2,000 – 9,999 |
| Diamond | 10,000+ |

### Referral system

- Each wallet has a unique referral code derived from the last 10 hex characters of their address
- Share `https://omniswap.app/?ref=CODE` — when a new wallet connects via this link, the referrer gains +1× multiplier
- Self-referrals are blocked (code checked against own address)
- Referral count is derived from a live Supabase query (not a mutable counter) for accuracy

### Anti-gaming measures

| Attack vector | Mitigation |
|---|---|
| Duplicate swap points | `seenSwapTxIds` array with txHash dedup — stored in Supabase |
| Analytics farming | `lastAnalyticsAward` timestamp — 24h cooldown enforced server-side |
| First-connect replay | `firstConnectAwarded` boolean flag — write-once |
| First-swap replay | `firstSwapAwarded` boolean flag — write-once |
| Self-referral | Referral code compared against own wallet's derived code |

### Implementation architecture

```
src/lib/points.ts          — Pure functions: calcMultiplier, calcSwapBasePoints,
                              genReferralCode, getPointsRank (no side effects)
src/contexts/PointsContext.tsx — React state + Supabase sync
                              Optimistic local updates → async DB flush
```

**Race condition fix:** The first-connect bonus is applied directly inside the wallet-load `useEffect` (before `setRecord` is called) rather than from a child component effect. This avoids the React child-before-parent effects ordering issue where the bonus would see `record = null` and silently no-op.

---

## Liquid Staking

Liquid staking is powered by the [Tonstakers SDK](https://tonstakers.com). Users deposit TON and receive **tsTON** — a liquid receipt token that appreciates in value as staking rewards accrue.

### Tonstakers initialisation fix

TonConnect's `onStatusChange` only fires on **future** wallet state changes. If a wallet is already connected when the page loads, the SDK's `initialize()` never receives the wallet and stays in an uninitialised state.

**Fix applied** (in both `staking/page.tsx` and `analytics/page.tsx`):

```typescript
const connector = {
  sendTransaction: (tx) => tonConnectUI.sendTransaction(tx),
  onStatusChange: (cb) => {
    // Replay current wallet state immediately so SDK initialises on load
    const current = tonConnectUI.wallet;
    if (current) cb(current);
    return tonConnectUI.onStatusChange(cb);
  },
};
const ts = new Tonstakers({ connector });
```

### Staking boost sync

The `updateStakingBoost(stakedTON, tonUSD)` function is called from a `useEffect` in `StakingPage` that depends on `[user.stakedBalance, pub.rates?.TONUSD]`. It calculates `stakedUSD = stakedTON × tonUSD` and sets the staking boost (`floor(stakedUSD / 100)`, capped at 100). The boost is saved to Supabase on the next flush cycle.

---

## Analytics Dashboard

The analytics page shows:
- Platform stats (total volume, swaps routed, estimated savings, avg price improvement)
- Live savings calculator using real Omniston quotes
- Protocol distribution chart (STON.fi v1/v2, DeDust, TONCO)
- How Omniston routing saves money (step-by-step explainer)
- Top pairs by savings
- Tonstakers APY + TVL + staker count
- Returns calculator for projected staking earnings

**Stats note:** `PLATFORM_STATS` values are static display figures representing aggregate metrics. For real-time on-chain data, integrate with Omniston's analytics API or TON indexer.

---

## Database Setup (Supabase)

Run the following SQL in **Supabase Dashboard → SQL Editor** to create the schema:

```sql
-- Points records (one row per wallet address)
CREATE TABLE public.points_records (
  wallet_address        TEXT        PRIMARY KEY,
  total_points          INTEGER     NOT NULL DEFAULT 0,
  breakdown_swap        INTEGER     NOT NULL DEFAULT 0,
  breakdown_analytics   INTEGER     NOT NULL DEFAULT 0,
  breakdown_bonus       INTEGER     NOT NULL DEFAULT 0,
  boost_staking         INTEGER     NOT NULL DEFAULT 0,
  boost_referral        INTEGER     NOT NULL DEFAULT 0,
  flag_first_connect    BOOLEAN     NOT NULL DEFAULT FALSE,
  flag_first_swap       BOOLEAN     NOT NULL DEFAULT FALSE,
  referral_code         TEXT,
  referred_by           TEXT,
  referral_count        INTEGER     NOT NULL DEFAULT 0,
  last_analytics_award  BIGINT      NOT NULL DEFAULT 0,
  seen_swap_tx_ids      TEXT[]      NOT NULL DEFAULT '{}',
  version               INTEGER     NOT NULL DEFAULT 1,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Points events (append-only history, one row per earning event)
CREATE TABLE public.points_events (
  id             TEXT        PRIMARY KEY,
  wallet_address TEXT        NOT NULL REFERENCES public.points_records(wallet_address) ON DELETE CASCADE,
  type           TEXT        NOT NULL,  -- 'swap' | 'analytics' | 'first_connect' | 'first_swap'
  base_points    INTEGER     NOT NULL,
  multiplier     NUMERIC     NOT NULL,
  earned         INTEGER     NOT NULL,
  meta           TEXT,                  -- txHash for swap events
  ts             BIGINT      NOT NULL,  -- Unix milliseconds
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_points_events_wallet_ts
  ON public.points_events (wallet_address, ts DESC);

CREATE INDEX idx_points_records_referred_by
  ON public.points_records (referred_by);

-- Row-level security (open access — wallet address is the identifier)
ALTER TABLE public.points_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_events  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_all" ON public.points_records
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "public_all" ON public.points_events
  FOR ALL USING (true) WITH CHECK (true);
```

### Schema design notes

- `referral_count` is a denormalised cache; the live count is always recomputed on load from `COUNT(*) WHERE referred_by = code`
- `seen_swap_tx_ids` caps at 500 entries (oldest are trimmed) to bound row size
- `points_events` is append-only; events are inserted via upsert with `onConflict: 'id'` to prevent duplicates
- Schema version field enables future migrations (mismatch resets the record)

---

## Environment Variables

```env
# TonConnect manifest (required)
NEXT_PUBLIC_PRIVY_APP_ID=...

# TON RPC
NEXT_PUBLIC_TONCENTER_API_URL=https://toncenter.com/api/v2/jsonRPC
NEXT_PUBLIC_TONCENTER_API_KEY=...

# Omniston WebSocket
NEXT_PUBLIC_OMNISTON_WS=wss://omni-ws.ston.fi

# Referral fee config
NEXT_PUBLIC_REFERRER_ADDRESS=...
NEXT_PUBLIC_REFERRER_FEE_BPS=10

# Supabase (required for points persistence)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type check
npx tsc --noEmit

# Production build
npm run build
```

> **Before running:** Create the Supabase tables using the SQL in [Database Setup](#database-setup-supabase) and add the env vars above to `.env.local`.

---

## Security Notes

### What is protected

| Concern | How |
|---|---|
| Duplicate swap awards | txHash stored in `seen_swap_tx_ids`; checked before every award |
| Analytics farming | `lastAnalyticsAward` Unix timestamp; 24-hour server-enforced gap |
| First-connect/swap replays | Boolean flags written once and never reset |
| Self-referral | Referral code compared against the connecting wallet's own derived code |
| Race condition on first-connect | Bonus applied inside the wallet-load `useEffect` before `setRecord`, not from a child effect |

### Known limitations

| Limitation | Impact | Mitigation path |
|---|---|---|
| Open Supabase RLS | A user who knows their wallet address and the table schema can call the Supabase API directly to inflate points | Add API route layer + wallet signature verification (sign a nonce with TonConnect, verify on server) |
| Client-computed USD value | Swap points depend on `tonUSDPrice` fetched from CoinGecko — could be stale or zero if the API fails | Use a dedicated price oracle or compute USD value from on-chain data post-trade |
| No wallet ownership proof | Points are attributed to the address in `wallet.account.address` from TonConnect; ownership is asserted by the SDK | Require a wallet signature before writing any points (adds one extra UX step) |
| `seenSwapTxIds` history cap | After 500 swaps, dedup protection for the oldest transactions expires | For high-volume users, move swap dedup to the `points_events` table (unique constraint on `meta` + `type = 'swap'`) |

---

## License

MIT
