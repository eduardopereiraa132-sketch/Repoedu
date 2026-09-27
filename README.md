# Vendor Intelligence Agent

AI-assisted vendor due-diligence workflow for procurement, security and compliance teams.

**Base API:** https://repoedu-1.onrender.com

## Commercial product

The project is moving from low-value pay-per-call primitives toward a higher-value B2B workflow. The product combines public vendor security signals, business-document analysis and structured risk triage into a repeatable vendor review.

See:
- `PRODUCT.md` — product, workflow and commercial model
- `LANDING_COPY.md` — customer-facing positioning
- `OUTREACH.md` — pilot sales and qualification script

## Existing machine-facing primitives

- **Webpage Extractor** — US$0.005 USDC/call
- **Website Security Preflight** — US$0.01 USDC/call
- **Business Document Analyzer** — US$0.005 USDC/call
- **Vendor Security Preflight** — US$0.025 USDC/call

These remain infrastructure for agents and for the higher-value commercial workflow. x402 uses USDC on Base Mainnet (`eip155:8453`).

## Initial pilot hypothesis

**US$2,500 implementation + US$500/month** for a focused pilot using a customer's real vendor-review workflow.

The pilot is intended to validate measurable time savings and human-review reduction before expanding to a larger annual contract.

Commercial pricing is a hypothesis to validate, not a guaranteed market price.

## Scope and limitations

The product is not a penetration test, certification or legal opinion. It reports observable signals and supplied-document evidence and keeps material procurement/security decisions under human approval.

## Revenue principle

Do not optimize primarily for API-call count. Optimize for annual customer value: the customer pays for the completed vendor-review workflow, while x402 remains a machine-to-machine payment mechanism underneath.

## Deployment

Render is configured as a Node web service with automatic deployment on commit. The current deployment configuration uses the free plan, so production economics and uptime should be validated before selling a paid SLA.
