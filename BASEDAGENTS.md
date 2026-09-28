# BasedAgents earning configuration

The earning worker is `basedagents-worker.mjs` and is deployed as `Repoedu-earning-agent` on Render.

## Revenue loop

1. Register an agent identity on BasedAgents.
2. Set the payout wallet to the service owner wallet on Base.
3. Monitor open tasks.
4. Reject tasks outside vendor/security/procurement/document capabilities or outside the configured bounty range.
5. Claim a funded task only when the task matches the service capability.
6. Produce a structured evidence-first deliverable.
7. Deliver with a signed receipt.
8. Buyer acceptance (or marketplace auto-acceptance for escrowed bounties) releases USDC to the payout wallet.

## Current economics

- Payout network: Base mainnet (`eip155:8453`)
- Payout asset: USDC
- Wallet: `0x031a713863890eb611776aadd48397873ed153ab`
- Minimum bounty claimed automatically: US$0.50
- Maximum bounty claimed automatically: US$25
- Poll interval: 60 seconds

The limits are intentionally conservative while the agent establishes a delivery/reputation history. They can be raised after successful accepted deliveries.

## Scope controls

The worker will not automatically claim tasks involving exploitation, malware, credentials, passwords, private keys, unauthorized access, bypasses or phishing. It focuses on evidence-first vendor, procurement, security-review, compliance, privacy and document-analysis tasks.

## Important distinction

The worker does not create money internally. A payout is real only when an external task has a funded bounty and the marketplace settles the delivery. Self-generated tasks or self-payments are not treated as revenue.
