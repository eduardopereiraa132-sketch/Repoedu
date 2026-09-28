# EvidenceCheck — marketplace listing

## Short name
EvidenceCheck

## One-line pitch
**Check what a vendor's public evidence supports before you approve or escalate the review.**

## Buyer problem
A procurement, security or GRC workflow needs a fast first pass on a supplier but does not want to spend hours opening pages, extracting evidence and turning every gap into a follow-up question.

## What this service does
EvidenceCheck turns a public vendor URL and optional requirements into structured, evidence-first triage:

1. observable vendor/site signals;
2. evidence gaps and unknowns;
3. targeted supplier follow-up questions;
4. a concise summary for downstream workflows;
5. explicit limitations and human-review points.

It is intentionally **not** a generic AI summary.

## Primary capability
`POST /vendor-preflight`

Example input:
```json
{"url":"https://vendor.example","requirements":["access control","incident response","data protection"]}
```

Output includes a risk signal, observable checks, evidence gaps, supplier questions, summary and limitations.

**Price:** US$0.025 per request.

## Secondary capabilities
- `/site-audit` — public website security preflight — **US$0.01**
- `/web-extract` — clean webpage text, metadata, headings and links — **US$0.005**
- `/analyze` — business-document dates, amounts, obligations, security signals and gaps — **US$0.005**

## Why an agent would call it
Use `vendor-preflight` as a low-cost verification step before requesting a full questionnaire, escalating to a human reviewer or committing more compute/time to a vendor assessment.

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

## Trust boundary
First-pass due diligence only. Not a penetration test, vulnerability scanner, certification, legal opinion or replacement for authorized human review. Public signals are reported as signals, not proof of controls.

## Human escalation
For buyers that need a defined vendor review rather than an API call, the service offers a fixed-scope review starting at US$495 and recurring intake starting at US$1,250/month. These are offer prices, not claims of existing customer contracts or revenue.

## Accuracy rule
Never claim verified status, customer traction, revenue, uptime, reviews or directory ranking unless supported by an actual external record.
