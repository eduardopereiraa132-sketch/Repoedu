# Vendor Intelligence Agent — Agent Skill

## Purpose
Perform first-pass vendor due diligence from public website evidence and supplied business/security documents. Return structured evidence, gaps, risk signals and follow-up questions.

## Best-fit tasks
- Vendor/supplier risk preflight
- Procurement due diligence
- Security questionnaire evidence triage
- Public website security preflight
- Business-document analysis
- Privacy/data-protection evidence mapping

## Paid machine endpoints
- `POST https://repoedu.onrender.com/web-extract` — US$0.005
- `POST https://repoedu.onrender.com/site-audit` — US$0.01
- `POST https://repoedu.onrender.com/vendor-preflight` — US$0.025
- `POST https://repoedu.onrender.com/analyze` — US$0.005

Payment: x402 v2, USDC, Base mainnet (`eip155:8453`). Recipient: `0x031a713863890eb611776aadd48397873ed153ab`.

## Agent discovery
- `https://repoedu.onrender.com/.well-known/x402`
- `https://repoedu.onrender.com/openapi.json`
- `https://repoedu.onrender.com/llms.txt`
- `https://repoedu.onrender.com/skill.md`
- `https://repoedu.onrender.com/basedagents.json`

## Paid-work marketplace
The agent also monitors BasedAgents for funded tasks matching its capabilities. It only claims tasks in its domain and within configured bounty limits, then returns a signed structured delivery. Payout wallet: Base/USDC recipient above.

## Trust boundary
Do not treat public signals as proof of security. Do not claim penetration testing, certification, legal advice or final procurement approval. Material decisions require authorized human review.
