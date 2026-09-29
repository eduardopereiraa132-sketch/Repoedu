# EvidenceCheck — marketplace listing

## Short name
EvidenceCheck

## One-line pitch
**Check what a vendor's public evidence supports before you approve or escalate the review.**

## Buyer problem
Procurement, security and GRC workflows often spend repetitive time opening supplier pages, collecting public signals, identifying missing evidence and writing follow-up questions before the substantive review can begin.

## What this service does
EvidenceCheck turns a public vendor URL and optional requirements into structured, evidence-first triage:

1. observable vendor/site signals;
2. evidence gaps and unknowns;
3. targeted supplier follow-up questions;
4. a concise summary for downstream workflows;
5. explicit limitations and human-review points.

It is intentionally **not** a generic AI summary and does not claim that public evidence proves compliance or security.

## Primary capability
`POST /vendor-preflight`

Example input:
```json
{"url":"https://vendor.example","requirements":["access control","incident response","data protection"]}
```

Output includes observable checks with source URLs/timestamps, relevant public evidence-page signals, explicit gaps, requirements that cannot be verified publicly, targeted supplier questions, coverage and limitations. The legacy `riskLevel` field is not a final vendor-risk rating.

**Price:** US$0.025 per request.

## Secondary capabilities
- `/site-audit` — public website security preflight — **US$0.01**
- `/web-extract` — clean webpage text, metadata, headings and links — **US$0.005**
- `/analyze` — business-document dates, amounts, obligations, security signals and gaps — **US$0.01**

## Why an agent would call it
Use `vendor-preflight` as the low-cost verification step before requesting a full questionnaire, escalating to a human reviewer, or spending more compute/time on vendor research. It is designed to answer: “What can I verify from public evidence right now, and what should I ask for next?”

The endpoint is intentionally cheap enough for automated triage and structured enough for downstream workflows.

## Best-fit buyers
- Procurement agents screening new SaaS suppliers.
- Security agents triaging vendors before deeper assessment.
- GRC workflows extracting obligations and missing evidence.
- Approval workflows deciding which vendors need human escalation.

## Machine discovery
- `/openapi.json`
- `/llms.txt`
- `/skill.md`
- `/.well-known/agent-card.json`
- `/.well-known/x402-discovery.json`

## Payment
USDC on Base mainnet (`eip155:8453`) via x402.

## Receiving address
`0x031a713863890eb611776aadd48397873ed153ab`

## Human escalation

For buyers that need a defined vendor review rather than an API call, the service offers a fixed-scope review starting at US$495 and recurring intake starting at US$1,250/month. These are offer prices, not claims of existing customer contracts or revenue.

## Directory submission strategy
- **x402 List:** submit through its current `/submit` flow. Its public documentation says service submissions are free, endpoints are automatically probed for a valid HTTP 402 response, and listings are manually reviewed.
- **PayAPI Market:** submit the API for free; the marketplace currently advertises 100% of provider call revenue going to providers and verifies listings with a real payment before its verified badge.
- **Agent402:** register the public x402 origin through its seller flow; its current documentation describes free listing and direct USDC settlement to the provider wallet.

Do not pay a directory fee automatically. Do not claim listing, verification or ranking until an external directory confirms it.

## Trust boundary
First-pass due diligence only. Not a penetration test, vulnerability scanner, certification, legal opinion or replacement for authorized human review. Public signals are reported as signals, not proof of controls.

## Accuracy rule
Never claim verified status, customer traction, revenue, uptime, reviews or directory ranking unless supported by an actual external record.
