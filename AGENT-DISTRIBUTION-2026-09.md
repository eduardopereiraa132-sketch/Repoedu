# Agent distribution plan — 2026-09

## Goal
Maximize machine discoverability of EvidenceCheck and reach buyers who already use pay-per-call agent services, without claiming guaranteed traffic or fabricated traction.

## Positioning
**EvidenceCheck is the verification step before the expensive vendor review.** Its strongest job is `vendor-preflight`: check what a supplier's public evidence supports, identify what is still unknown, and produce targeted questions before a team spends hours on a questionnaire or deeper review.

It is deliberately narrower than a full TPRM platform and more evidence-bounded than a generic AI summary.

## Canonical machine entry points
- API: https://repoedu.onrender.com
- Buyer site: https://repoedu.onrender.com
- OpenAPI: /openapi.json
- LLM instructions: /llms.txt
- Skill: /skill.md
- Agent card: /.well-known/agent-card.json
- x402 metadata: /.well-known/x402
- x402 discovery manifest: /.well-known/x402-discovery.json
- Human purchase flow: /purchase
- Buyer preview: /assessment and /demo

## Discovery channels — current priority
1. **x402scan** — current public registration page: https://www.x402scan.com/resources/register. Submit the canonical HTTPS API URL after confirming the production 402 challenge is healthy. x402scan currently presents itself as an explorer, analytics dashboard and marketplace for paid APIs and agentic commerce.
2. **Agentic Market** — current marketplace materials explicitly invite API sellers to list services so agents can discover and pay per request in USDC. Lead with `vendor-preflight`, not the generic extractor endpoints.
3. **Native x402/Bazaar discovery** — keep route schemas, prices, descriptions and payment requirements accurate. The current x402 Bazaar documentation says listing is free and supports Base mainnet USDC, with HTTP services and MCP tools discoverable through machine-readable metadata.
4. **Other x402 directories/community indexes** — submit where permitted. Do not pay a listing or review fee without explicit owner approval.
5. **Direct discovery** — keep OpenAPI, llms.txt, skill.md and well-known metadata stable so agents can discover the service without a prior integration.

## Listing copy
**Service name:** EvidenceCheck

**One-line pitch:** Verify what a vendor's public evidence supports before you approve or escalate the review.

**Description:** Evidence-first vendor due-diligence API for procurement, third-party risk, security and compliance workflows. Give it a vendor URL or supplied business/security evidence and receive observable signals, explicit evidence gaps, targeted supplier questions and human-review boundaries. Pay per request in USDC on Base via x402.

**Best first use case:** `vendor-preflight` — a fast first-pass check before a team spends hours on a full questionnaire or review.

**Protected paths:**
- `/vendor-preflight`
- `/site-audit`
- `/web-extract`
- `/analyze`

## Buyer-facing proof strategy
- Show a concrete live example before asking for a larger purchase.
- Keep the output schema deterministic and easy to inspect.
- Make limitations explicit: public evidence is not proof; unknown is not absent.
- Keep entry pricing low enough for an agent to test without approval friction.
- Do not manufacture testimonials, customer logos, revenue, uptime, verification badges or buyer volume.

## Commercial ladder
1. Free preview / example.
2. $0.005–$0.025 machine call for a focused task.
3. $495 fixed-scope human-led vendor review.
4. $1,250/month recurring intake starting package.
5. Higher-volume team program from $2,500/month.

These are offer prices, not guaranteed revenue.

## Buyer funnel
1. Agent or human discovers EvidenceCheck.
2. It evaluates the narrow capability and schema.
3. It runs a low-cost or free preview.
4. It pays for the focused call if the result is useful.
5. A human buyer can escalate to a defined review or recurring intake.

## Launch gate
Before external directory submission, confirm:
- `GET /health` returns 200.
- `GET /openapi.json` is reachable.
- `GET /.well-known/x402` and the discovery manifest expose the intended Base mainnet terms.
- A no-payment request returns a valid HTTP 402 challenge.
- A small real mainnet payment settles to the configured wallet.
- The paid route returns the expected JSON after settlement.

The x402 seller documentation recommends testnet first, then Base mainnet with network `eip155:8453`, a real receiving wallet, and small real payments before going live.

## Current implementation state
- Canonical application origin in the repository: `https://repoedu.onrender.com`.
- Receiving address is the owner's Base EVM address.
- Intended production network: `eip155:8453`.
- Facilitator URL is environment-configurable; the live Render value must be verified before claiming a specific facilitator is active.
- Buyer pages and API discovery metadata are served by the same application origin.
- GitHub `main` is the source branch; live deployment status must be verified on Render.

## Important constraint
No directory can truthfully guarantee exposure to every existing agent. Listing improves discoverability; actual calls depend on an agent's discovery method, task fit, budget, trust policy, endpoint availability and reputation.
