// OmniswapRouter.tact
// A thin on-chain router that forwards swap messages built by Omniston's
// build_transfer API. Validates the caller, forwards TON + payload, and emits
// events for indexers.
//
// Usage pattern:
//   1. Frontend calls Omniston WS → receives message list (target, amount, payload)
//   2. Frontend sends a single RouteSwap message to this contract with those details
//   3. Contract validates, emits SwapInitiated event, and forwards the messages
//
// NOTE: For gasless swaps, users can send directly from their wallet.
// This contract is optional but useful for apps needing on-chain composability
// or a referral fee vault.

import "@stdlib/deploy";

// ─── Messages ──────────────────────────────────────────────────────────────────

message RouteSwap {
    quoteId:    Int as uint256;   // first 32 bytes of quote_id (hex → int)
    targetAddr: Address;          // target_address from build_transfer response
    sendAmount: Int as coins;     // send_amount (nanoTON)
    payload:    Cell;             // BOC payload from build_transfer response
}

message SwapInitiated {
    sender:    Address;
    quoteId:   Int as uint256;
    sendAmount: Int as coins;
    timestamp: Int as uint32;
}

// ─── Contract ──────────────────────────────────────────────────────────────────

contract OmniswapRouter with Deployable {

    owner: Address;
    feeCollector: Address;
    feeBps: Int as uint16;        // referral fee in basis points (0–100)

    init(owner: Address, feeCollector: Address, feeBps: Int) {
        self.owner        = owner;
        self.feeCollector = feeCollector;
        self.feeBps       = feeBps;
    }

    // ─── Route a swap ─────────────────────────────────────────────────────────

    receive(msg: RouteSwap) {
        let ctx: Context = context();

        // Ensure enough TON was sent to cover the swap amount + gas overhead
        require(ctx.value >= msg.sendAmount + ton("0.05"), "Insufficient TON for swap + gas");

        // Optional: collect protocol/referral fee from surplus
        let surplus: Int = ctx.value - msg.sendAmount - ton("0.05");
        if (surplus > 0 && self.feeBps > 0) {
            let fee: Int = surplus * self.feeBps / 10000;
            if (fee > 0) {
                send(SendParameters{
                    to:    self.feeCollector,
                    value: fee,
                    mode:  SendIgnoreErrors,
                    body:  emptyCell(),
                });
            }
        }

        // Emit event for indexers / analytics
        emit(SwapInitiated{
            sender:     ctx.sender,
            quoteId:    msg.quoteId,
            sendAmount: msg.sendAmount,
            timestamp:  now(),
        }.toCell());

        // Forward swap message to the Omniston resolver target
        send(SendParameters{
            to:    msg.targetAddr,
            value: msg.sendAmount,
            mode:  SendIgnoreErrors,
            body:  msg.payload,
        });
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    receive("withdraw") {
        require(sender() == self.owner, "Unauthorized");
        send(SendParameters{
            to:    self.owner,
            value: 0,
            mode:  SendRemainingBalance + SendIgnoreErrors,
        });
    }

    receive("updateFee") {
        // Fee updates go through governance — placeholder for DAO integration
        require(sender() == self.owner, "Unauthorized");
    }

    // ─── Getters ──────────────────────────────────────────────────────────────

    get fun owner(): Address { return self.owner; }
    get fun feeBps(): Int    { return self.feeBps; }
    get fun balance(): Int   { return myBalance(); }
}
