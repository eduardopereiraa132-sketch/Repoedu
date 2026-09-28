# Vendor Intelligence Agent

AI-assisted vendor due diligence for procurement, security and compliance teams, with machine-facing x402 endpoints for compatible AI agents and software.

## Live service

- Live: https://repoedu.onrender.com
- Demo: https://repoedu.onrender.com/demo
- API definition: https://repoedu.onrender.com/openapi.json

## What it does

Turn a vendor URL and supplied evidence into a structured first-pass review:

- Public website security preflight
- Vendor security signals
- Contract/document obligations
- Dates and monetary commitments
- Missing evidence and control gaps
- Supplier questions to resolve gaps
- Executive-ready summary
- Explicit limitations and human-review points

## Machine API

Paid x402 endpoints on Base mainnet/USDC currently include:

| Endpoint | Purpose | Entry price |
|---|---|---:|
| `/web-extract` | Extract clean webpage text, metadata and links | US$0.005 |
| `/site-audit` | Public website security preflight | US$0.01 |
| `/vendor-preflight` | Vendor-risk preflight and gaps | US$0.025 |
| `/analyze` | Business-document analysis | US$0.005 |
| `/review-purchase` | Fixed-scope vendor review intake | US$495 |

Prices are configuration values and may change as the product is validated.

## Commercial workflow

### Proof of Value — US$495
One vendor, public-site preflight, supplied-document review, structured findings/gaps and a target 48-hour turnaround.

### Pilot — US$2,500 setup + US$500/month
Up to 25 vendor assessments/month with configured requirements, reports and measurement of review time/human intervention.

### Business — US$1,500/month
Up to 100 vendor assessments/month with shared workflow, supplier-question generation, history and API access where applicable.

## Trust boundaries

This is a first-pass due-diligence workflow. It is not a penetration test, certification, vulnerability scanner, legal opinion or replacement for authorized human decisions. Public signals are reported as signals, not proof.

## Discovery

The API publishes machine-readable x402/Bazaar discovery metadata so compatible buyers can discover the paid endpoints. A public HTTPS origin is required for discovery and automated purchasing.
