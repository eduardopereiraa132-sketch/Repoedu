# Vendor Intelligence Agent

**Know what is missing before you approve a vendor.**

AI-assisted first-pass vendor due diligence for procurement, security and compliance teams, with machine-facing x402 endpoints for compatible AI agents and software.

## Live service

- Live: https://repoedu.onrender.com
- Demo: https://repoedu.onrender.com/demo
- API definition: https://repoedu.onrender.com/openapi.json

## The job it removes

Vendor onboarding often means opening websites, reading security documents, checking contract language, extracting dates and commitments, identifying missing evidence, then writing follow-up questions. The product turns that repetitive first-pass work into a repeatable evidence workflow.

## What the buyer gets

Give the service a vendor URL and the evidence you already have. It returns a structured review containing:

- Public website security preflight
- Vendor security signals
- Contract/document obligations
- Dates and monetary commitments
- Missing evidence and control gaps
- Supplier questions to resolve gaps
- Executive-ready summary
- Explicit limitations and human-review points

The output is designed to answer a practical question: **what do we know, what is missing, and what should we verify next?**

## Why this is commercially useful

The product is not positioned as another generic AI summarizer. Its value is the workflow around evidence, gaps and next actions. It can be used before a deeper security assessment, during procurement triage, or for recurring supplier reviews.

## Machine API

Paid x402 endpoints on Base mainnet/USDC currently include:

| Endpoint | Purpose | Entry price |
|---|---|---:|
| `/web-extract` | Extract clean webpage text, metadata and links | US$0.005 |
| `/site-audit` | Public website security preflight | US$0.01 |
| `/vendor-preflight` | Vendor-risk preflight and gaps | US$0.025 |
| `/analyze` | Business-document analysis | US$0.005 |
| `/review-purchase` | Fixed-scope vendor review intake | US$495 |

The low-cost endpoints make individual capabilities easy to test. The fixed-scope review turns the same workflow into a human-led commercial engagement.

## Commercial packages

### Proof of Value — US$495
One defined vendor review, public-site preflight, supplied-document review, structured findings/gaps and a target 48-hour turnaround.

### Pilot — US$2,500 setup + US$500/month
Up to 25 vendor assessments/month with configured requirements, structured reports and measurement of review time and human-intervention rate.

### Business — US$1,500/month
Up to 100 vendor assessments/month with shared workflow, supplier-question generation, history and API access where applicable.

Packages are starting points for validation, not claims of existing customer contracts.

## Trust boundaries

This is a first-pass due-diligence workflow. It is **not** a penetration test, certification, vulnerability scanner, legal opinion or replacement for authorized human decisions. Public signals are reported as signals, not proof. Material findings should be verified by the responsible team.

## Machine discovery

The service publishes machine-readable OpenAPI and x402/Bazaar discovery metadata so compatible buyers can discover paid capabilities programmatically. The production service uses Base mainnet (`eip155:8453`) and USDC.

See `BUYER-QUICKSTART.md` for the buyer decision guide and `AGENT-DISCOVERY.md` for the machine-facing discovery card.
