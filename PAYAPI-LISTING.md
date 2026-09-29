# EvidenceCheck — Directory Submission Pack

## Canonical seller
- API base URL: https://evidencecheck-api.onrender.com
- Website: https://evidencecheck-site.onrender.com
- Wallet: 0x031a713863890eb611776aadd48397873ed153ab
- Network: Base Mainnet
- Asset: USDC
- x402 version: 2
- Token domain name: USD Coin

## Recommended first listing
- Service name: EvidenceCheck — Vendor Evidence Preflight
- Category: Security / Third-party risk
- Primary paid endpoint: POST /vendor-preflight
- Price: US$0.025 per request
- Description: Evidence-first vendor due-diligence preflight for procurement, security and third-party-risk workflows. Turns a public vendor URL into observable signals, evidence gaps, targeted supplier questions and explicit limitations. Machine-readable JSON; x402 pay-per-request in USDC on Base.

## Other paid endpoints
- POST /site-audit — US$0.01 — bounded public website security preflight
- POST /web-extract — US$0.005 — public webpage extraction
- POST /analyze — US$0.01 — business-document triage

## Machine discovery
- Agent card: https://evidencecheck-api.onrender.com/.well-known/agent-card.json
- x402 discovery: https://evidencecheck-api.onrender.com/.well-known/x402-discovery.json
- OpenAPI: https://evidencecheck-api.onrender.com/openapi.json
- Skill: https://evidencecheck-api.onrender.com/skill.md
- llms.txt: https://evidencecheck-api.onrender.com/llms.txt

## Trust boundary
Public signals are evidence, not proof of internal control effectiveness. Unknown means unverified, not failed. This is not a penetration test, certification, legal opinion or final procurement decision.

## Directory targets
- Agent402: https://agent402.tools/sell — free registration by canonical origin.
- PayAPI Market: https://payapi.market/list — free listing; asks for name, email, wallet, API details and paid route.
- x402 List: https://x402-list.com/submit — directory submission; probes the paid route before review.

Use the live HTTP 402 response from the API as the authoritative source for amount, asset, network and payTo.
