# EvidenceCheck Buyer Agent

Separate machine buyer for EvidenceCheck.

## What it does

1. Reads public machine-discovery endpoints.
2. Calls a paid endpoint without payment.
3. Parses the x402 v2 PAYMENT-REQUIRED challenge.
4. Checks the advertised payment terms.
5. Optionally executes a real x402 purchase when explicitly enabled.

A dry run does not create revenue. It proves that a buyer agent can discover and understand the service.

## Run

    npm install
    npm start

Then:

    GET /simulate

for discovery + safe 402 testing.

    POST /buy

for an explicitly enabled live purchase.

## Live mode

Set these only as secure environment variables:

    SELLER_URL=https://repoedu.onrender.com
    ENABLE_LIVE_PAYMENTS=true
    BUYER_PRIVATE_KEY=0x...

The private key must never be committed to GitHub or pasted into chat.

Start with a low-cost endpoint and a buyer wallet that has enough USDC on Base.
