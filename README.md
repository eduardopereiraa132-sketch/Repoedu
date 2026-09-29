# EvidenceCheck

**Verify the evidence before you approve.**

EvidenceCheck is an evidence-first vendor due-diligence service for procurement, third-party risk, security and compliance teams, plus AI agents that need bounded verification work.

The core product is intentionally narrow: take a public vendor URL or supplied business evidence, identify observable signals and explicit gaps, then produce the questions and next actions needed for authorized human review.

## Buyer entry points

- Product: https://repoedu.onrender.com/buy.html
- Live demo: https://repoedu.onrender.com/demo
- Sample report: https://repoedu.onrender.com/sample-report
- Fixed-scope review: https://repoedu.onrender.com/purchase
- Commercial overview: https://repoedu.onrender.com/commercial

## Machine entry points

- API: https://repoedu.onrender.com
- OpenAPI: https://repoedu.onrender.com/openapi.json
- LLM instructions: https://repoedu.onrender.com/llms.txt
- Agent card: https://repoedu.onrender.com/.well-known/agent-card.json
- x402 discovery: https://repoedu.onrender.com/.well-known/x402-discovery.json
- Skill: https://repoedu.onrender.com/skill.md

## Paid capabilities

| Endpoint | Purpose | Entry price |
|---|---|---:|
| `/web-extract` | Clean webpage text, metadata, headings and links | US$0.005 |
| `/analyze` | Dates, money, obligations, security signals and gaps from supplied text | US$0.005 |
| `/site-audit` | Public website security preflight | US$0.01 |
| `/vendor-preflight` | Vendor-risk preflight with evidence gaps and supplier questions | US$0.025 |

Payment is x402 v2, exact scheme, USDC on Base Mainnet (`eip155:8453`).

Receiving wallet:

`0x031a713863890eb611776aadd48397873ed153ab`

## Human-led offer

**US$495 fixed-scope vendor review**

One vendor, evidence-first public-site and supplied-evidence review, structured findings and a target 48-hour turnaround after the required information is received.

This is an offer price, not a claim of existing customer contracts or guaranteed revenue. The service is not a penetration test, certification, legal opinion or replacement for an authorized security/procurement decision.

## What the buyer gets

- Observable public-site signals
- Explicit evidence gaps
- Targeted supplier questions
- Structured JSON for downstream workflows
- Human-readable review output
- Clear limitations and human-review points

The key trust rule is: **unknown evidence is reported as unknown, not as proof of absence.**

## Distribution

The service is designed for agent discovery through machine-readable metadata and x402 indexes.

Current distribution path:
1. Serve a valid HTTPS x402 challenge on the API.
2. Publish `/.well-known/x402`, `/.well-known/x402-discovery.json`, OpenAPI and `llms.txt`.
3. Register the live origin with Agent402's free seller index.
4. Submit to other x402 directories where available.
5. Keep descriptions and pricing narrow so buyer routers can match the service to concrete tasks.

Agent402 currently documents free seller registration with `POST /api/index/register`; buyers pay the seller wallet directly and the marketplace takes 0% from sellers. citeturn928305search2turn928305search3

A GitHub Actions workflow in this repository performs the live-origin check and registration automatically after a main-branch deployment.

## Revenue status

**No revenue is claimed until an external payer completes a real mainnet transaction.**

Technical readiness, directory listing or wallet configuration is not evidence of sales.
