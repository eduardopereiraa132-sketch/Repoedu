# Agent distribution plan — 2026-09

## Goal
Maximize machine discoverability of EvidenceCheck and reach buyers who already use pay-per-call agent services, without claiming guaranteed traffic or fabricated traction.

## Why this category is commercially credible
Vendor security assessments and third-party risk management are established workflows. Current TPRM platforms explicitly support vendor inventories, questionnaires, evidence collection, risk classification, assessments and decision records. EvidenceCheck is positioned as a narrower first-pass layer rather than a replacement for a full TPRM platform.

## Canonical machine entry points
- Base URL: https://repoedu.onrender.com
- OpenAPI: /openapi.json
- LLM instructions: /llms.txt
- Skill: /skill.md
- Agent card: /.well-known/agent-card.json
- x402 metadata: /.well-known/x402
- x402 discovery manifest: /.well-known/x402-discovery.json
- Human buyer brief: /buyer-brief.html

## Discovery channels — current priority
1. **x402 Bazaar** — native x402 discovery layer. The x402 project documents Bazaar as a machine-readable catalog for payable HTTP endpoints and MCP tools; routes need the Bazaar extension to become discoverable. Keep schemas, prices and payment requirements accurate.
2. **Agent402 Marketplace** — currently lists tens of thousands of discoverable services and describes free registration, semantic buyer discovery and direct USDC settlement. Prepare a listing using the canonical service URL and the strongest single use case: vendor preflight before approval.
3. **PayAPI Market** — currently advertises free API listing, agent search, x402 settlement and a verified-provider concept. Submit only after the public endpoint passes a real mainnet payment test; do not claim verification before that.
4. **x402.new** — currently advertises a large live directory of x402 services. Maintain machine-readable discovery endpoints and monitor whether EvidenceCheck appears after indexing.
5. **x402 List / x402scan and compatible community directories** — submit the public service URL where permitted. Any paid review/listing fee requires explicit owner approval and should not be paid automatically.
6. **Direct discovery** — keep OpenAPI, llms.txt, skill.md and well-known metadata stable so agents can discover the service without a pre-existing integration.

## Listing copy
**Service name:** EvidenceCheck

**One-line pitch:** Verify what a vendor's public evidence supports before you approve or escalate the review.

**Description:** Evidence-first vendor due-diligence API for procurement, third-party risk, security and compliance workflows. Give it a vendor URL or supplied business/security evidence and receive structured observable signals, gaps, targeted supplier questions and explicit human-review points. Pay per request in USDC on Base via x402.

**Best first use case:** `vendor-preflight` — a fast first-pass check before a team spends hours on a full questionnaire or review.

**Protected paths:**
- `/web-extract`
- `/site-audit`
- `/vendor-preflight`
- `/analyze`

## Commercial positioning
Lead with the specific job: **"Check what a vendor's public evidence supports before you approve or escalate the review."** Avoid generic "AI security" claims. The buyer is not purchasing a chatbot; they are purchasing a verification step and a structured next-action queue.

## Conversion assets
- Main landing page: `/`
- Buyer page: `/buy.html`
- Buyer brief: `/buyer-brief.html`
- Decision workflow: `/decision-kit.html`
- Human-led offer: `/offer.html`
- Live example: `/demo`
- Free preview: `/assessment-page.html`

The product should show a real example before asking for a larger purchase. Do not manufacture testimonials, customer logos, revenue, uptime or verification claims.

## Buyer funnel
1. Agent or human discovers the capability.
2. Buyer sees a concrete example and machine-readable schema.
3. Buyer runs a low-cost or free preview.
4. Buyer uses the focused API call if the result is useful.
5. Human buyer can escalate to the fixed-scope review or recurring intake.

## Important constraint
No directory can truthfully guarantee exposure to every existing agent. Listing improves discoverability; actual calls depend on an agent's discovery method, task fit, budget, trust policy and endpoint availability.
