# Vendor Intelligence Agent — Buyer Quickstart

## What problem does it solve?

Vendor reviews become expensive when procurement and security teams have to collect website evidence, documents, dates, obligations and missing information manually.

Vendor Intelligence Agent is a **first-pass vendor due-diligence layer**. It turns a vendor URL and supplied evidence into a structured review that a human reviewer can act on.

## What a buyer receives

1. Public website security preflight.
2. Document extraction and obligation signals.
3. Dates and monetary commitments.
4. Missing evidence and control gaps.
5. Supplier questions to resolve gaps.
6. Executive-ready summary.
7. Explicit limitations and human-review points.

## Best use cases

- Software/vendor onboarding.
- Procurement triage before security review.
- Recurring supplier reassessment.
- Preparing vendor questionnaires and follow-up questions.
- Reducing time spent on repetitive first-pass evidence collection.

## What it does NOT claim

It is not a penetration test, vulnerability scanner, certification, legal opinion or compliance attestation. Public signals are observations, not proof. Material decisions remain with authorized people.

## Start small

### Machine/API trial

Use the low-cost x402 endpoints for individual capabilities:

| Capability | Endpoint | Entry price |
|---|---|---:|
| Web extraction | `/web-extract` | US$0.005 |
| Website security preflight | `/site-audit` | US$0.01 |
| Vendor preflight | `/vendor-preflight` | US$0.025 |
| Business-document analysis | `/analyze` | US$0.005 |

Payments use x402 on Base mainnet with USDC.

### Human-led proof of value

**US$495** — one defined vendor review, public-site preflight, supplied-document review, structured findings and gaps, with a target 48-hour turnaround.

### Team pilot

**US$2,500 setup + US$500/month** — up to 25 vendor assessments/month, configured requirements, structured reports and measurement of review time and human-intervention rate.

## Decision rule

Buy this when the goal is to **reduce repetitive first-pass review work**, not to outsource the final security or procurement decision.

## Machine discovery

The service publishes OpenAPI and x402/Bazaar discovery metadata so compatible agents can discover the paid endpoints and their payment requirements.
