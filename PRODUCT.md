# Vendor Intelligence Agent

## Positioning

AI-assisted vendor due-diligence workflow for procurement, security and compliance teams.

**Core promise:** turn a vendor URL and the evidence a company already has into a structured first-pass review in minutes — with observed signals, missing evidence, supplier questions and explicit limitations.

## Product workflow

1. User submits a vendor URL.
2. Public website signals are collected and checked.
3. Vendor documents are supplied as text/PDF-derived text.
4. The system extracts obligations, dates, amounts, security signals and missing control areas.
5. A structured assessment combines the evidence.
6. Missing information is converted into supplier questions.
7. The result is suitable for human review, procurement follow-up and downstream automation.
8. Future expansion: track supplier responses and automatically re-assess the evidence.

## Why a buyer would use it

The product targets a specific operational bottleneck: repetitive first-pass vendor review. It is not positioned as a generic chatbot or a replacement for security testing. Its value is the repeatable workflow and structured output around evidence.

## Machine-facing services

The live API exposes small, independently useful capabilities for compatible AI/software buyers through x402 on Base mainnet using USDC:

- **Webpage Extractor** — clean machine-readable webpage text, metadata and links.
- **Website Security Preflight** — observable HTTPS, security headers, cookie flags, robots/security files and disclosure signals.
- **Vendor Security Preflight** — structured vendor-risk signal plus gaps and limitations.
- **Business Document Analyzer** — obligations, dates, amounts, security signals, missing areas and risk flags.

These endpoints are intentionally low-priced entry points. The commercial workflow sells the larger business outcome rather than forcing every buyer into a subscription.

## Commercial offer

### Proof of Value
**US$495 fixed scope**

- One vendor
- Public-site preflight
- Supplied-document review
- Structured findings and gaps
- Clear limitations
- 48-hour target turnaround

Purpose: reduce purchase friction and create a concrete evaluation before a larger commitment.

### Pilot
**US$2,500 implementation + US$500/month**

- Up to 25 vendor assessments/month
- Assessment requirements configured to the buyer's workflow
- Public-site preflight
- Document analysis
- Structured vendor reports
- Evidence/gap checklist
- Supplier-question preparation
- Measurement of review time and human-intervention rate

### Business
**US$1,500/month**

- Up to 100 vendor assessments/month
- Shared workflow
- Supplier-question generation
- Exportable reports
- Assessment history
- API access where applicable

### Enterprise
**Custom**

- Higher volume
- Custom assessment requirements
- Integrations
- SSO/role controls when implemented
- SLA/support

Pricing is a commercial hypothesis to validate with real buyers, not a guarantee of market willingness to pay.

## What it is not

- Not a penetration test.
- Not a vulnerability scanner.
- Not a certification or attestation.
- Not legal advice.
- Not a replacement for human approval of material procurement/security decisions.

## Revenue strategy

Two layers are intentionally preserved:

1. **Machine layer:** inexpensive x402 endpoints that can be discovered and purchased by compatible agents/software.
2. **Business layer:** higher-value fixed-scope and recurring vendor-review workflows for human teams.

This avoids relying on consumer advertising and gives a buyer multiple ways to start.

## Success metrics

- Paid API requests
- Proof-of-value purchases
- Pilot conversion rate
- Assessments completed per customer
- Time saved per assessment
- Human-intervention rate
- Recurring revenue
