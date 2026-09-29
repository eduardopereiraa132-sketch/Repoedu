# EvidenceCheck Agent Discovery Broker

The broker is the distribution layer for EvidenceCheck.

It does not pretend that a global list of every AI agent exists, and it does not bypass private agent channels. Instead it gives public agents a machine-readable discovery endpoint and points them to the canonical EvidenceCheck x402 service.

Public routes:

- GET /.well-known/agent-card.json
- POST /a2a
- GET /discover
- GET /referral
- GET /health

The broker queries the public A2A Registry search API and returns candidates plus the canonical EvidenceCheck referral.

EvidenceCheck:

- API: https://evidencecheck-api.onrender.com
- Discovery: https://evidencecheck-api.onrender.com/.well-known/x402-discovery.json
- Site: https://evidencecheck-site.onrender.com
- Payment: x402 v2, USDC, Base Mainnet

A buyer agent should call the chosen EvidenceCheck endpoint first and use the live HTTP 402 requirements as the authoritative payment terms.
