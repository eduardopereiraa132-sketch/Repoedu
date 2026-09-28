# EvidenceCheck

**Know what to verify before you approve.**

EvidenceCheck is an evidence-first vendor due-diligence and web-intelligence service for procurement, third-party risk, security/compliance teams and AI agents. It turns public vendor signals and supplied business text into structured evidence, gaps and next-step questions.

## Start here — for AI agents

**Canonical service:** https://repoedu.onrender.com

**Universal machine manifest:** https://repoedu.onrender.com/agent-discovery.json

**LLM instructions:** https://repoedu.onrender.com/llms.txt

**OpenAPI:** https://repoedu.onrender.com/openapi.json

**Agent card:** https://repoedu.onrender.com/.well-known/agent.json

**x402 discovery:** https://repoedu.onrender.com/.well-known/x402-discovery.json

**Skill:** https://repoedu.onrender.com/skill.md

The paid routes declare the x402 Bazaar discovery extension, so compatible discovery clients can index the service's capabilities, schemas, pricing and payment terms. The universal manifest provides the same information to agents that do not use Bazaar directly.

## The buyer problem

Vendor onboarding and recurring supplier review often require repetitive first-pass work: opening websites, reading security material, checking observable controls, extracting obligations and dates, identifying missing evidence, then writing follow-up questions. EvidenceCheck turns that work into a repeatable evidence workflow.

The product is deliberately **not** positioned as a generic AI summarizer. Its commercial value is the combination of observable signals, explicit gaps, supplier questions and a clear trust boundary.

## What a buyer gets

- Public website security preflight
- Vendor security signals
- Clean webpage text, metadata, headings and links
- Business-document dates, monetary amounts and obligations
- Missing evidence and control gaps
- Supplier follow-up questions
- Structured JSON for downstream workflows
- Human-readable fixed-scope review for deeper work
- Explicit limitations and human-review points

The practical question is: **what do we know, what is missing, and what should we verify next?**

## Machine API

Paid x402 endpoints use USDC on Base mainnet (`eip155:8453`):

| Endpoint | Purpose | Entry price |
|---|---|---:|
| `/web-extract` | Extract clean webpage text, metadata and links | US$0.005 |
| `/site-audit` | Public website security preflight | US$0.01 |
| `/vendor-preflight` | Vendor-risk preflight and evidence gaps | US$0.025 |
| `/analyze` | Business-document analysis | US$0.005 |

The low-cost endpoints are intentionally easy for software and AI agents to trial. The fixed-scope review path turns the same workflow into a human-led commercial engagement.

## Commercial offer

### API — pay per request

Use only the capability required by the workflow. No subscription is required for the machine endpoints.

### Fixed-scope review — US$495

One defined vendor review, public-site preflight, supplied-document review, structured findings/gaps and a target 48-hour turnaround. This is a starting commercial offer for validation, not a claim of existing customer contracts.

### Pilot and recurring programs

Larger procurement/security teams can use the workflow for recurring vendor triage, with scope and pricing agreed around volume and required human review.

## Agent discovery and distribution

EvidenceCheck is designed for machine discovery rather than relying on a human finding a homepage first. Compatible agents can discover it through x402 Bazaar metadata; public x402 directories can also index the service. Current ecosystem directories include x402 List and x402.new. Listing approval and ranking are controlled by each directory, so no system can truthfully guarantee delivery to every existing agent.

For directory operators, the canonical submission details are maintained in `AGENT-DISTRIBUTION-2026-09.md`.

## Trust boundary

EvidenceCheck is a **first-pass due-diligence workflow**. It is not a penetration test, vulnerability scanner, certification, legal opinion or replacement for authorized human decisions. Public signals are reported as signals, not proof. Material findings should be verified by the responsible team.

## Receiving wallet

USDC receiving wallet on Base: `0x031a713863890eb611776aadd48397873ed153ab`

## Project status

The canonical API is deployed on Render from this GitHub repository with auto-deploy from `main`. Buyer-facing pages, machine-readable discovery files, x402 payment metadata and agent selection guidance are maintained together so the service is easier for both humans and software agents to evaluate.
