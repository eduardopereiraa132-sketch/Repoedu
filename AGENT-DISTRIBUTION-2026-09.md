# Agent distribution plan — 2026-09

## Goal
Maximize machine discoverability of EvidenceCheck without pretending that one registry reaches every AI agent.

## Canonical machine entry points
- Base URL: https://repoedu.onrender.com
- OpenAPI: /openapi.json
- LLM instructions: /llms.txt
- Skill: /skill.md
- Agent card: /.well-known/agent-card.json
- x402 metadata: /.well-known/x402
- x402 discovery manifest: /.well-known/x402-discovery.json
- Human buyer brief: /buyer-brief.html

## Discovery channels
1. **x402 Bazaar** — paid routes declare Bazaar metadata through the x402 extension. This is the native discovery layer for compatible x402 clients.
2. **x402.new** — the directory states that it continuously indexes the public x402 discovery network and does not require a manual submission form. Keep the endpoints payable and discoverable.
3. **x402-list** — submit the public service URL for automated 402 probing and human review. A first service submission is free according to its current documentation; services hosted on free compute may incur a one-time $1 USDC/Base review-queue fee. Do not pay that fee automatically: it requires explicit owner approval.
4. **Community A2A/x402 directories** — publish the canonical agent card and machine documentation where their submission process permits it.
5. **Direct discovery** — keep OpenAPI, llms.txt, skill.md and well-known metadata stable so agents can discover the service without a pre-existing integration.

## x402-list submission payload
- Service name: EvidenceCheck
- Service URL: https://repoedu.onrender.com
- Website URL: https://evidencecheck-site.onrender.com/buyer-brief.html
- Category: AI / Data / Security
- Description: Evidence-first vendor due-diligence API for AI agents and procurement/security workflows. Provides webpage extraction, public website security preflight, vendor preflight, and structured business-document triage. Pay per request in USDC on Base via x402.
- Protected paths:
  - /web-extract
  - /site-audit
  - /vendor-preflight
  - /analyze

## Commercial positioning
Lead with the specific job: **"Check what a vendor's public evidence supports before you approve or escalate the review."** Avoid generic "AI security" claims.

## Conversion assets
- Main landing page: `/`
- Buyer page: `/buy.html`
- Buyer brief: `/buyer-brief.html`
- Decision workflow: `/decision-kit.html`
- Human-led offer: `/offer.html`
- Live example: `/demo`

The product should show a real example before asking for a larger purchase. Do not manufacture testimonials, customer logos, revenue, uptime or verification claims.

## Important constraint
No directory can truthfully guarantee exposure to every existing agent. Listing improves discoverability; actual calls depend on an agent's discovery method, task fit, budget and trust policy.
