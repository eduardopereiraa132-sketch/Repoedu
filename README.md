# EvidenceCheck

**Verify the evidence before you approve.**

EvidenceCheck is an evidence-first vendor due-diligence service for procurement, third-party risk, security and compliance teams, plus AI agents that need bounded verification work.

The core product is intentionally narrow: take a public vendor URL or supplied business evidence, identify observable signals and explicit gaps, then produce the questions and next actions needed for authorized human review.

## Buyer entry points

- Product: https://evidencecheck-site.onrender.com
- Live demo: https://evidencecheck-site.onrender.com/demo.html
- Sample report: https://evidencecheck-site.onrender.com/sample-report.html
- Fixed-scope review: https://evidencecheck-api.onrender.com/purchase
- Commercial overview: https://evidencecheck-api.onrender.com/commercial

## Machine entry points

- API: https://evidencecheck-api.onrender.com
- OpenAPI: https://evidencecheck-api.onrender.com/openapi.json
- LLM instructions: https://evidencecheck-api.onrender.com/llms.txt
- Agent card: https://evidencecheck-api.onrender.com/.well-known/agent-card.json
- x402 discovery: https://evidencecheck-api.onrender.com/.well-known/x402-discovery.json
- Skill: https://evidencecheck-api.onrender.com/skill.md

## Paid capabilities

| Endpoint | Purpose | Entry price |
|---|---|---:|
| `/web-extract` | Clean webpage text, metadata, headings and links | US$0.005 |
| `/analyze` | Dates, money, obligations, security signals and gaps from supplied text | US$0.01 |
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

Agent402 currently documents free seller registration with `POST /api/index/register`; buyers pay the seller wallet directly and the marketplace takes 0% from sellers.

A GitHub Actions smoke test validates the paid routes and x402 metadata on every main-branch change.

## Revenue status

**No revenue is claimed until an external payer completes a real mainnet transaction.**

Technical readiness, directory listing or wallet configuration is not evidence of sales.
