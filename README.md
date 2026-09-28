# EvidenceCheck

**Know what to verify before you approve.**

EvidenceCheck is an evidence-first vendor due-diligence and public web-intelligence service for procurement, third-party risk, security/compliance teams and AI agents. It turns public vendor signals and supplied business text into structured evidence, explicit gaps, targeted supplier questions and a clear next-action queue.

## Buyer-first entry points

**API:** https://evidencecheck-api.onrender.com  
**Buyer site:** https://evidencecheck-site.onrender.com  
**Buyer page:** https://evidencecheck-site.onrender.com/buy.html  
**Decision Kit:** https://evidencecheck-site.onrender.com/decision-kit.html  
**Live example:** https://evidencecheck-site.onrender.com/demo

The commercial promise is deliberately narrow: **check what a vendor's public evidence supports before a team spends time on a deeper review.** It is not positioned as a generic AI summary or a replacement for authorized security assessment.

## Start here — for AI agents

**Universal machine manifest:** https://evidencecheck-api.onrender.com/agent-discovery.json  
**LLM instructions:** https://evidencecheck-api.onrender.com/llms.txt  
**OpenAPI:** https://evidencecheck-api.onrender.com/openapi.json  
**Agent card:** https://evidencecheck-api.onrender.com/.well-known/agent.json  
**x402 discovery:** https://evidencecheck-api.onrender.com/.well-known/x402-discovery.json  
**Skill:** https://evidencecheck-api.onrender.com/skill.md

The paid routes declare machine-readable discovery metadata so compatible clients can inspect capabilities, schemas, prices and payment terms before deciding whether to call them.

## What buyers get

- Public website security preflight
- Vendor security signals
- Clean webpage text, metadata, headings and links
- Business-document dates, monetary amounts and obligations
- Missing evidence and control gaps
- Targeted supplier follow-up questions
- Structured JSON for downstream workflows
- Human-readable fixed-scope review for deeper work
- Explicit limitations and human-review points

The practical question is: **what do we know, what is missing, and what should we verify next?**

## Machine API

Paid x402 endpoints use USDC on Base mainnet (`eip155:8453`):

| Endpoint | Purpose | Entry price |
|---|---|---:|
| `/vendor-preflight` | Vendor-risk preflight, evidence gaps and supplier questions | US$0.025 |
| `/site-audit` | Public website security preflight | US$0.01 |
| `/web-extract` | Clean webpage text, metadata and links | US$0.005 |
| `/analyze` | Business-document evidence triage | US$0.005 |

**Selection rule:** use the cheapest endpoint that fully matches the task. For vendor approval/triage, start with `/vendor-preflight`.

## Commercial offer

### API — pay per request

Use one narrow capability at a time. No subscription is required for the machine endpoints.

### Fixed-scope review — US$495

One defined vendor review, public-site preflight, supplied-document review, structured findings/gaps and a target 48-hour turnaround. This is an offer price for validation, not a claim of existing customer contracts.

### Recurring intake — US$1,250/month starting package

A starting scope of up to 10 vendor preflights per month, with a consistent review workflow and monthly evidence summary. Final scope and suitability are confirmed before purchase.

### Team program — from US$2,500/month

Higher-volume vendor triage, recurring reporting and workflow integration with scope agreed around volume and required human review.

These are offer prices and revenue scenarios, **not guaranteed sales or existing revenue**.

## Distribution

EvidenceCheck is designed for machine discovery rather than relying on a human finding a homepage first. Current ecosystem research shows active x402 marketplaces where agents discover and pay for APIs, including Agent402 Marketplace and PayAPI Market. Directory inclusion, ranking and buyer volume are controlled by each directory and are not guaranteed. See `AGENT-DISTRIBUTION-2026-09.md` for the current distribution plan.

## Trust boundary

EvidenceCheck is a **first-pass due-diligence workflow**. It is not a penetration test, vulnerability scanner, certification, legal opinion or replacement for authorized human decisions. Public signals are reported as signals, not proof. Missing public evidence is reported as unknown rather than proof of absence. Material findings should be verified by the responsible team.

## Receiving wallet

USDC receiving wallet on Base: `0x031a713863890eb611776aadd48397873ed153ab`

## Deployment

The canonical API is deployed on Render from this GitHub repository with auto-deploy from `main`. The buyer site and API share the same repository so product messaging, machine discovery metadata and payment service can evolve together.

## Revenue status

**No revenue should be claimed until an external payer completes a real mainnet transaction.** The system can be deployed and configured to accept x402 payments, but technical readiness is not evidence of sales.
