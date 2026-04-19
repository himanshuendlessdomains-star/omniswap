<div align="center">

# ⚡ OmniSwap

**The best swap rates across the TON ecosystem**

Smart-routing DEX aggregator powered by [Omniston](https://omniston.ston.fi) — automatically splits and routes your swap across STON.fi, DeDust, and TONCO to guarantee the best price every time.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![TON](https://img.shields.io/badge/TON-Blockchain-0098EA?logo=ton&logoColor=white)](https://ton.org)
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
- [Data Flow](#data-flow)
- [Omni Points System](#omni-points-system)
- [Liquid Staking (Tonstakers)](#liquid-staking-tonstakers)
- [Analytics Dashboard](#analytics-dashboard)
- [Supported Tokens](#supported-tokens)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

---

## Overview

OmniSwap is a non-custodial DEX aggregator built on the **TON blockchain**. Instead of routing your swap through a single exchange, it queries all major TON DEXes simultaneously and finds the optimal split — sending portions of your trade to whichever pools offer the best effective rate, minimising price impact and maximising your output.

Under the hood it uses the **Omniston WebSocket SDK** (`wss://omni-ws.ston.fi`) to stream real-time quotes from competing resolvers, picks the best one, and executes the entire multi-leg trade as a single atomic on-chain transaction via **TonConnect**.

```
You enter 100 TON → Omniston routes → 60% STON.fi v2 + 40% DeDust → You receive max USDT
```

---

## Features

| Feature | Description |
|---|---|
| 🔀 **Smart Routing** | Splits trades across up to 4 DEXes to minimise price impact |
| ⚡ **Real-time Quotes** | WebSocket streaming — best quote updates live as resolvers compete |
| 🔒 **Atomic Execution** | All swap legs in one transaction; reverts entirely if any leg fails |
| 💸 **Savings Analytics** | Live calculator showing exactly how much Omniston saved you vs single-DEX |
| 👛 **TonConnect** | Connect any TON wallet (Tonkeeper, MyTonWallet, OpenMask, etc.) |
| ⚙️ **Slippage Control** | Configure 0.5 / 1 / 2% tolerance per swap |
| 📊 **Route Visualiser** | See which protocols handled what percentage of your trade |
| 🔄 **Trade Tracker** | Real-time status through every phase: Transfer → Swap → Settle |
| 🏦 **Liquid Staking** | Stake TON via Tonstakers — receive tsTON, unstake any time |
| ⭐ **Omni Points** | Earn points for every on-platform action; boost with staking and referrals |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          OmniSwap Frontend                          │
│                        (Next.js 16 / React 19)                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
           ┌─────────────────┼──────────────────┬─────────────────┐
           │                 │                  │                 │
           ▼                 ▼                  ▼                 ▼
  ┌────────────────┐ ┌──────────────┐ ┌─────────────────┐ ┌──────────────┐
  │  Omniston SDK  │ │  TonConnect  │ │ Tonstakers SDK  │ │PointsContext │
  │  WebSocket     │ │  UI React    │ │  liquid staking │ │ localStorage │
  │  wss://omni-ws │ │  v2.4.4      │ │  on TON         │ │ + CoinGecko  │
  │  .ston.fi      │ │              │ └────────┬────────┘ └──────────────┘
  └───────┬────────┘ └──────┬───────┘          │
          │                 │                  │
          ▼                 ▼                  ▼
  ┌───────────────────────────────────────────────┐
  │               TON Blockchain                  │
  │  STON.fi v1 · STON.fi v2 · DeDust · TONCO     │
  │  Tonstakers liquid staking contract            │
  └───────────────────────────────────────────────┘
```

### Component Architecture

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout — fonts, Bootstrap, providers
│   ├── page.tsx                  # Home — hero + SwapCard
│   ├── analytics/page.tsx        # Analytics — savings dashboard + staking returns
│   ├── staking/page.tsx          # Liquid staking — stake/unstake TON
│   ├── points/page.tsx           # Omni Points dashboard
│   └── providers.tsx             # TonConnectUIProvider + PointsProvider
│
├── contexts/
│   └── PointsContext.tsx         # ★ Points state, localStorage, all award logic
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx            # Sticky nav — logo, links, wallet button, points badge
│   │   └── WalletButton.tsx      # Connect / disconnect + first-connect bonus trigger
│   │
│   ├── swap/
│   │   ├── SwapCard.tsx          # ★ Main swap interface — awards points on trade_settled
│   │   ├── TokenSelector.tsx     # Modal token picker with search
│   │   ├── QuoteDisplay.tsx      # Rate, resolver, gas, fee breakdown table
│   │   ├── RouteVisualizer.tsx   # Protocol pills showing trade path
│   │   └── TradeStatus.tsx       # Step-by-step trade progress tracker
│   │
│   └── ui/
│       ├── Button.tsx            # Reusable button — primary/secondary/yellow/ghost
│       ├── Badge.tsx             # Protocol & status badges
│       └── PointsBadge.tsx       # Header points counter with rank colour + multiplier
│
├── lib/
│   ├── omniston.ts               # ★ Omniston SDK — quote, build, track
│   ├── tokens.ts                 # Token list, formatUnits, parseUnits
│   ├── tonconnect.ts             # Wallet address helpers
│   ├── tonstakers.ts             # Nanoton helpers — fromNano, toNano, calcReturn
│   └── points.ts                 # ★ Pure points logic — config, types, calculators
│
├── types/index.ts                # Token, BestQuote, Route, TradePhase …
│
└── styles/
    ├── variables.scss            # CSS custom properties — all design tokens
    └── globals.scss              # Global styles, utilities, animations
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | [Next.js](https://nextjs.org) | 16.2.4 |
| UI Library | [React](https://react.dev) | 19.2.4 |
| Language | [TypeScript](https://typescriptlang.org) | ^5 |
| DEX Aggregation | [@ston-fi/omniston-sdk](https://www.npmjs.com/package/@ston-fi/omniston-sdk) | ^0.7.9 |
| Wallet Connection | [@tonconnect/ui-react](https://www.npmjs.com/package/@tonconnect/ui-react) | ^2.4.4 |
| Liquid Staking | [tonstakers-sdk](https://github.com/tonstakers/tonstakers-sdk) | latest |
| Styling | [Bootstrap](https://getbootstrap.com) + [Sass](https://sass-lang.com) | 5.3.3 / ^1.99 |
| Reactivity | [RxJS](https://rxjs.dev) (Omniston streams) | ^7.8.2 |
| Deployment | [Vercel](https://vercel.com) | — |

---

## Project Structure

```
omniswap/
├── public/
│   ├── icon.png                  # App icon (used by TonConnect)
│   └── tonconnect-manifest.json  # TonConnect app metadata
│
├── src/
│   ├── app/                      # Next.js App Router pages
│   ├── contexts/                 # React contexts (PointsContext)
│   ├── components/               # React components
│   ├── lib/                      # Business logic & SDK wrappers
│   ├── styles/                   # SCSS design system
│   └── types/                    # TypeScript interfaces
│
├── .env.example                  # Environment variable template
├── next.config.ts                # Next.js config — image domains
├── tsconfig.json                 # TypeScript config — strict mode
└── postcss.config.js             # PostCSS with autoprefixer
```

---

## Data Flow

### Quote Flow

```
User types amount
       │
       ▼ (600ms debounce)
SwapCard.fetchQuote()
       │
       ▼
lib/omniston.ts → requestQuote()
       │
       ▼
Omniston WebSocket (wss://omni-ws.ston.fi)
       │
       │  streams BestQuote events (resolvers compete)
       ▼
normalizeQuote()  ──→  picks highest askUnits
       │
       ▼
QuoteDisplay  +  RouteVisualizer  +  amountOut field
```

### Swap Execution Flow

```
User clicks "Swap"
       │
       ▼
buildTransfer(rawQuote, walletAddress)
       │
       ▼
TonConnect → sendTransaction()   ←── user approves in wallet
       │
       ▼
TON Blockchain — atomic multi-DEX execution
       │
       ▼
omniston.trackTrade()  (WebSocket stream)
       │
       ├── transferring
       ├── swapping
       ├── receiving_funds
       └── trade_settled ✓
              │
              ▼
       PointsContext.awardSwap()  ──→  localStorage
```

---

## Omni Points System

Omni Points (OP) are an engagement reward system stored in `localStorage`, keyed per wallet address. All logic lives in `src/lib/points.ts` (pure functions) and `src/contexts/PointsContext.tsx` (React state + persistence).

### Earning Points

| Action | Base Points | Notes |
|---|---|---|
| Connect wallet | **+10 OP** | One-time bonus; awarded in `WalletButton` on first connect |
| First swap | **+10 OP** | One-time bonus; awarded when `trade_settled` fires for the first time |
| Swap tokens | **1 OP per $10** | Applied on every `trade_settled`; USD value estimated from token symbol + live TON price |
| Visit Analytics | **1 OP per day** | Rate-limited to once per 24 h via timestamp stored in the record |

All non-bonus points are multiplied by the user's current **multiplier** before being credited.

### Multiplier Boosts

```
totalMultiplier = 1 + stakingBoost + referralBoost
```

| Boost source | Rate | Maximum |
|---|---|---|
| Staking TON | +1× per $100 staked | 100× |
| Referring friends | +1× per referral | 20× |

**Example:** User stakes $500 (5×) and has referred 3 friends (3×) → multiplier = **1 + 5 + 3 = 9×**. A $50 swap earns 5 base points × 9 = **45 OP**.

### Staking Boost Mechanics

- Derived from `user.stakedBalance` (nanotons) × `pub.rates.TONUSD`
- Updated in real-time whenever the staking page re-fetches user data
- Formula: `floor(stakedUSD / 100)`, capped at 100

### Referral System

- Each wallet has a unique referral code derived from the last 10 hex chars of its address
- Share URL format: `https://omniswap.app/?ref=<CODE>`
- On wallet connect, the `?ref=` param is read from the URL
- Self-referrals are rejected (`refCode !== own code`)
- Referral counts are stored in a shared localStorage key (`omniswap_ref_v1_<CODE>`) so the referrer's boost updates when they next connect on the same device
- A wallet can only be referred once (first referral code wins)

### Rank Tiers

| Rank | Threshold |
|---|---|
| Bronze | 0 – 99 OP |
| Silver | 100 – 499 OP |
| Gold | 500 – 1,999 OP |
| Platinum | 2,000 – 9,999 OP |
| Diamond | 10,000+ OP |

### Security & Anti-Gaming

| Concern | Mitigation |
|---|---|
| Double-awarding a swap | `seenSwapTxIds` array; transaction hash checked before every award |
| Analytics farming | 24-hour cooldown enforced by comparing `Date.now()` to `lastAnalyticsAward` |
| Self-referral | Referral code compared to own code before processing |
| Double-referral | `referral.referredBy` field — once set, URL param is ignored |
| Unbounded storage | `seenSwapTxIds` capped at 500 entries; history capped at 100 events |
| Out-of-range boosts | All boost inputs clamped with `Math.min(value, MAX)` in `calcMultiplier` |
| Tampered localStorage | Schema version check on load — mismatched version resets the record |

> **Known limitation:** `localStorage` data is fully client-controlled. Without a backend, a determined user can edit their point total directly. The system is designed for honest engagement incentives, not high-stakes rewards that require server-side verification.

### Points Dashboard (`/points`)

- Total points with rank colour and progress bar to next tier
- Multiplier breakdown (base + staking + referral)
- Task checklist with live completion status
- Copy-to-clipboard referral link
- Scrollable earnings history (last 20 events with type, base, multiplier, earned, timestamp)

---

## Liquid Staking (Tonstakers)

The `/staking` page integrates the [Tonstakers SDK](https://github.com/tonstakers/tonstakers-sdk) for liquid staking on TON.

### How It Works

1. User deposits TON → receives **tsTON** (liquid staking token)
2. tsTON accrues value as staking rewards accumulate
3. User can unstake at any time via three modes:
   - **Standard** — waits for the next staking round (~36 h)
   - **Instant** — uses pool liquidity for immediate exit (may have a small fee)
   - **Best Rate** — automatically picks the optimal exit path

### SDK Initialization Fix

The Tonstakers SDK relies on `connector.onStatusChange()` to detect wallet connections. However, `TonConnect.onStatusChange` only fires on **future** status changes — it does not replay the current wallet state to new subscribers. If the wallet is already connected when the staking page loads, `Tonstakers.ready` would never become `true`.

**Fix** (`staking/page.tsx` and `analytics/page.tsx`): a thin connector wrapper that immediately invokes the callback with `tonConnectUI.wallet` (if present) before registering the TonConnect subscription:

```ts
const connector = {
  sendTransaction: (tx) => tonConnectUI.sendTransaction(tx),
  onStatusChange: (cb) => {
    const current = tonConnectUI.wallet;
    if (current) cb(current);           // replay current state
    return tonConnectUI.onStatusChange(cb); // then subscribe to future changes
  },
};
```

### Staking → Points Integration

After each user data refresh (on wallet connect, post-stake, post-unstake), `StakingPage` calls:

```ts
updateStakingBoost(fromNano(user.stakedBalance), pub.rates.TONUSD)
```

This updates `boosts.staking` in `PointsContext`, which immediately recalculates the multiplier applied to all future point awards.

---

## Analytics Dashboard

The `/analytics` page shows real-time and aggregate savings data:

- **Platform Stats** — $24M+ total volume, 52,400+ swaps, $71,800+ saved
- **Live Savings Calculator** — enter any amount, fetch a real Omniston quote, and see:
  - Best Omniston output vs single-DEX estimate
  - Exact savings in tokens + percentage
  - Per-protocol route split (bar chart)
- **Protocol Distribution** — 30-day volume share across all four DEXes
- **Staking Returns** — live APY from Tonstakers + 30 / 90 / 365-day return projections
- **Top Pairs by Savings** — highest-saving token pairs with trade counts and volume

Visiting the analytics page also awards **1 Omni Point per day** (rate-limited; only credited while a wallet is connected).

---

## Supported Tokens

| Symbol | Name | Decimals | Contract |
|---|---|---|---|
| **TON** | Toncoin | 9 | Native |
| **USDT** | Tether USD | 6 | `EQCxE6mU...sDs` |
| **STON** | STON | 9 | `EQB-MPwr...728` |
| **SCALE** | Scaleton | 9 | `EQBlqsm1...ALE` |
| **BOLT** | Bolt | 9 | `EQDQoc5M...qB3` |
| **jUSDC** | jUSDC | 6 | `EQAvDfWF...6y` |
| **pTON** | Proxy TON | 9 | `EQCM3B12...cmZ` |

Routing is provided by **four DEX protocols**:

```
STON.fi v1  ·  STON.fi v2  ·  DeDust  ·  TONCO
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A TON wallet (e.g. [Tonkeeper](https://tonkeeper.com))

### Install

```bash
git clone https://github.com/your-username/omniswap.git
cd omniswap
npm install
```

### Configure

```bash
cp .env.example .env.local
```

Edit `.env.local` (see [Environment Variables](#environment-variables) below).

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_OMNISTON_WS` | No | Omniston WebSocket URL (default: `wss://omni-ws.ston.fi`) |
| `NEXT_PUBLIC_REFERRER_ADDRESS` | No | Your TON address to receive referrer fees |
| `NEXT_PUBLIC_REFERRER_FEE_BPS` | No | Referrer fee in basis points (default: `10` = 0.1%) |
| `NEXT_PUBLIC_TONCENTER_API_URL` | No | TonCenter RPC endpoint (improves rate limits) |
| `NEXT_PUBLIC_TONCENTER_API_KEY` | No | TonCenter API key |

> No API keys are required to run locally — the Omniston WebSocket is public.

---

## Deployment

The app is deployed on **Vercel** at [omniswap-three.vercel.app](https://omniswap-three.vercel.app).

**Deploy your own:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/omniswap)

Or manually:

```bash
npm i -g vercel
vercel --prod
```

The `tonconnect-manifest.json` in `/public` must point to your deployed URL so TonConnect wallets can verify the app identity.

---

## How Omniston Works

```
Without Omniston           With Omniston
─────────────────          ───────────────────────────
                           ┌─────────────────────┐
100 TON ──► STON.fi ──►   │   Omniston Solver   │
            (high impact)  │                     │
                           │  60 TON ──► STON.fi │
                           │  40 TON ──► DeDust  │
                           └────────┬────────────┘
                                    │
You receive less USDT          You receive more USDT
                                    ▲ ~0.3% average saving
```

By splitting across multiple pools, each pool experiences **less price impact**, and the blended exchange rate is better than any single pool could offer. The larger the trade, the more significant the saving.

---

<div align="center">

Built with ♥ on the TON blockchain · Powered by [Omniston](https://omniston.ston.fi)

</div>
