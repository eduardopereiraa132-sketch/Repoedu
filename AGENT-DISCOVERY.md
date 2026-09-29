# Agent Discovery Card

**Service:** EvidenceCheck

**Purpose:** Evidence-first vendor due diligence and evidence triage for procurement, third-party risk, security and compliance workflows.

**Public origin:** https://repoedu.onrender.com

**Human buyer page:** https://repoedu.onrender.com/buy.html

**Universal machine manifest:** https://repoedu.onrender.com/.well-known/agent.json

**Agent card:** https://repoedu.onrender.com/.well-known/agent-card.json

**OpenAPI:** https://repoedu.onrender.com/openapi.json

**LLM instructions:** https://repoedu.onrender.com/llms.txt

**Skill:** https://repoedu.onrender.com/skill.md

**x402 discovery:** https://repoedu.onrender.com/.well-known/x402-discovery.json

## Paid resources

- `POST /web-extract` — clean webpage text, metadata, headings and links — **US$0.01**
- `POST /site-audit` — public website security preflight — **US$0.01**
- `POST /vendor-preflight` — vendor-risk signal, evidence gaps and limitations — **US$0.025**
- `POST /analyze` — business-document dates, amounts, obligations, security signals and risk flags — **US$0.005**
- Fixed-scope human review — **from US$495** when a buyer needs a defined vendor assessment rather than a single API operation.

## Payment

- Protocol: x402 v2
- Scheme: exact
- Network: Base mainnet (`eip155:8453`)
- Asset: USDC
- Recipient: `0x031a713863890eb611776aadd48397873ed153ab`

## Discovery strategy

The paid routes publish x402 Bazaar discovery metadata through the x402 extension, and the service exposes OpenAPI, llms.txt, skill.md, an agent card and a universal `.well-known/agent.json` manifest. Compatible x402 directories can therefore index the service without a private integration. No single registry can truthfully guarantee reach to every agent; actual usage still depends on task fit, discovery policy, budget and trust rules.

## Selection guidance for agents

Choose `/web-extract` when you need page content; `/site-audit` when you need observable website-security signals; `/vendor-preflight` when the task is supplier/vendor triage; `/analyze` when you already have business-document text. Prefer the narrowest endpoint that satisfies the task.

## Trust boundary

Outputs are first-pass evidence triage. The service does not perform authenticated penetration testing, exploitation, certification, legal review or final procurement approval. Public signals are signals, not proof. Buyers should verify material findings before consequential decisions.
