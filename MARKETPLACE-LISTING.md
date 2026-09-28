# EvidenceCheck — marketplace listing

## Short name
EvidenceCheck

## One-line pitch
Verify what a vendor's public evidence supports before you approve or escalate the review.

## Short description
Evidence-first vendor due-diligence API for procurement, third-party risk, security and compliance workflows. Returns observable signals, evidence gaps, targeted supplier questions and explicit human-review points. Pay per request in USDC on Base via x402.

## Primary capability
`POST /vendor-preflight`

Input:
```json
{"url":"https://vendor.example","requirements":["access control","incident response","data protection"]}
```

Output: structured vendor-risk signal, evidence gaps, supplier follow-up questions and limitations.

## Secondary capabilities
- `/web-extract` — clean webpage text, metadata, headings and links.
- `/site-audit` — observable public website security preflight.
- `/analyze` — business-document dates, amounts, obligations, security signals and gaps.

## Why an agent would buy it
Use it as a low-cost verification step before spending more time on a full vendor questionnaire, manual review or human escalation. The output is structured for downstream workflows rather than being only prose.

## Buyer examples
- Procurement agent screening a new SaaS supplier.
- Security agent triaging a vendor before requesting a full assessment.
- GRC workflow extracting obligations and missing evidence from supplier documents.
- Internal approval workflow deciding which vendors need human escalation.

## Trust boundary
First-pass due diligence only. Not a penetration test, certification, legal opinion or replacement for authorized human review. Public signals are not treated as proof of controls.

## Machine discovery
- `/.well-known/x402-discovery.json`
- `/.well-known/agent-card.json`
- `/openapi.json`
- `/llms.txt`
- `/skill.md`

## Payment
USDC on Base mainnet (`eip155:8453`) via x402.

## Receiving address
`0x031a713863890eb611776aadd48397873ed153ab`

## Listing rule
Do not claim verified status, customer traction, revenue, uptime or reviews until each is supported by an actual external record.
