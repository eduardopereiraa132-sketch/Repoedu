# EvidenceCheck

**Know what a vendor shows. Know what you still need.**

EvidenceCheck is an evidence-first vendor due-diligence service for procurement, third-party risk, security/compliance teams and AI agents. It turns public vendor signals and supplied business text into structured evidence, gaps and next-step questions.

## Live service

- Live API: https://repoedu.onrender.com
- Buyer page: https://repoedu.onrender.com/for-buyers.html
- Agent page: https://repoedu.onrender.com/for-agents.html
- Live demo: https://repoedu.onrender.com/demo
- API definition: https://repoedu.onrender.com/openapi.json
- Machine skill: https://repoedu.onrender.com/skill.md
- LLM discovery: https://repoedu.onrender.com/llms.txt
- Agent card: https://repoedu.onrender.com/.well-known/agent-card.json
- x402 discovery: https://repoedu.onrender.com/.well-known/x402

## The buyer problem

Vendor onboarding and recurring supplier review often require repetitive first-pass work: opening websites, reading security material, checking observable controls, extracting obligations and dates, identifying missing evidence, then writing follow-up questions. EvidenceCheck turns that work into a repeatable evidence workflow.

The product is deliberately **not** positioned as a generic AI summarizer. Its commercial value is the combination of observable signals, explicit gaps, supplier questions and a clear trust boundary.

## What a buyer gets

Depending on the endpoint, EvidenceCheck can provide:

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

The low-cost endpoints are designed to be easy for software and AI agents to trial. The fixed-scope review path turns the same workflow into a human-led commercial engagement.

## Commercial offer

### API — pay per request

Use only the capability required by the workflow. No subscription is required for the machine endpoints.

### Fixed-scope review — US$495

One defined vendor review, public-site preflight, supplied-document review, structured findings/gaps and a target 48-hour turnaround. This is a starting commercial offer for validation, not a claim of existing customer contracts.

### Pilot and recurring programs

Larger procurement/security teams can use the workflow for recurring vendor triage, with scope and pricing agreed around volume and required human review.

## Agent discovery

The service publishes OpenAPI, LLM, skill, agent-card and x402 discovery metadata so compatible software can discover and call paid capabilities programmatically.

The service also includes a separate earning-agent path through BasedAgents. That worker is a distinct revenue channel: x402 lets external buyers pay the API; the earning worker can look for already-funded marketplace work. Neither path should be represented as guaranteed revenue.

## Trust boundary

EvidenceCheck is a **first-pass due-diligence workflow**. It is not a penetration test, vulnerability scanner, certification, legal opinion or replacement for authorized human decisions. Public signals are reported as signals, not proof. Material findings should be verified by the responsible team.

## Receiving wallet

USDC receiving wallet on Base: `0x031a713863890eb611776aadd48397873ed153ab`

## Project status

The production API and buyer-facing site are deployed on Render from the GitHub repository. The current production service is the `evidencecheck-api` deployment; the public buyer site is served from the same repository as a Render static site. Auto-deploy is enabled on `main`.
