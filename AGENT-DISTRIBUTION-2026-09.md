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

## Discovery channels
1. **x402 Bazaar** — every paid route declares Bazaar metadata through the x402 extension. Bazaar is the native discovery layer for compatible x402 clients.
2. **x402-list** — submit the public service URL for automated 402 probing and human review. Submission is free for a first submission; approval is not guaranteed.
3. **Community A2A/x402 directories** — publish the canonical agent card and machine documentation where their submission process permits it.
4. **Direct discovery** — keep OpenAPI, llms.txt, skill.md and well-known metadata stable so agents can discover the service without a pre-existing integration.

## x402-list submission payload
- Service name: EvidenceCheck
- Service URL: https://repoedu.onrender.com
- Website URL: https://repoedu.onrender.com/buy.html
- Category: AI / Data / Security
- Description: Evidence-first vendor due-diligence API for AI agents and procurement/security workflows. Provides webpage extraction, public website security preflight, vendor preflight, and structured business-document triage. Pay per request in USDC on Base via x402.
- Protected paths:
  - /web-extract
  - /site-audit
  - /vendor-preflight
  - /analyze

## Important constraint
No directory can truthfully guarantee exposure to every existing agent. Listing improves discoverability; actual calls depend on an agent's discovery method, task fit, budget and trust policy.

## Commercial positioning
Lead with the specific job: **"Check what a vendor's public evidence supports before you approve or escalate the review."** Avoid generic "AI security" claims.
