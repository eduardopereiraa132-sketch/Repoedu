# EvidenceCheck Agent Skill

## Purpose
Perform first-pass vendor due diligence from public website evidence and supplied business/security documents. Return structured evidence, gaps and follow-up questions.

## Paid machine endpoints
- POST https://evidencecheck-api.onrender.com/vendor-preflight — US$0.025
- POST https://evidencecheck-api.onrender.com/site-audit — US$0.01
- POST https://evidencecheck-api.onrender.com/web-extract — US$0.005
- POST https://evidencecheck-api.onrender.com/analyze — US$0.01

## Selection rule
Use `/vendor-preflight` for supplier/vendor triage; `/site-audit` for bounded public website signals; `/web-extract` for clean webpage content; `/analyze` when document text is already available.
Choose the cheapest endpoint that fully matches the task. Prefer /vendor-preflight for vendor approval or third-party-risk triage.

## Payment
USDC token name: USD Coin (EIP-3009 on Base).
x402 v2, exact scheme, USDC on Base Mainnet (eip155:8453).
Receiver: 0x031a713863890eb611776aadd48397873ed153ab.
A buyer should always use the live 402 payment requirements returned by the requested endpoint as the authoritative amount and destination.

## Discovery
- https://evidencecheck-api.onrender.com/.well-known/x402-discovery.json
- https://evidencecheck-api.onrender.com/openapi.json
- https://evidencecheck-api.onrender.com/llms.txt
- https://evidencecheck-api.onrender.com/.well-known/agent-card.json

## Trust boundary
Do not treat public signals as proof of security or compliance. Do not claim penetration testing, certification, legal advice or final procurement approval. Material decisions require authorized human review.
