# EvidenceCheck

## Purpose
EvidenceCheck provides narrow, machine-readable first-pass intelligence for procurement, vendor-risk, research, and security workflows.

## Paid capabilities

### Webpage Extractor
- Endpoint: `POST /web-extract`
- Price: `$0.005` USDC per request
- Input: `{ "url": "https://example.com" }`
- Returns: title, description, canonical URL, language, headings, cleaned text, links, word count, status and response timing.

### Website Security Preflight
- Endpoint: `POST /site-audit`
- Price: `$0.01` USDC per request
- Input: `{ "url": "https://example.com" }`
- Returns observable HTTPS, security-header, cookie, robots.txt, security.txt and server-header signals.

### Vendor Security Preflight
- Endpoint: `POST /vendor-preflight`
- Price: `$0.025` USDC per request
- Input: `{ "url": "https://vendor.example", "requirements": [] }`
- Returns structured checks, evidence gaps, risk signal, summary and limitations.

### Business Document Analyzer
- Endpoint: `POST /analyze`
- Price: `$0.005` USDC per request
- Input: `{ "text": "..." }`
- Returns obligations, dates, monetary amounts, security signals, missing areas and risk flags.

## Payment
- Protocol: x402
- Network: Base Mainnet (`eip155:8453`)
- Asset: USDC
- Scheme: exact
- Payment: required per request
- Receiver: `0x031a713863890eb611776aadd48397873ed153ab`

## Discovery
- API: `https://evidencecheck-api.onrender.com`
- OpenAPI: `/openapi.json`
- LLM guide: `/llms.txt`
- Agent card: `/.well-known/agent-card.json`
- Agent alias: `/.well-known/agent.json`
- x402 metadata: `/.well-known/x402`
- x402 discovery: `/.well-known/x402-discovery.json`
- Buyer website: `https://evidencecheck-site.onrender.com`

## Trust boundary
EvidenceCheck reports observable signals. It does not certify vendors, perform authenticated penetration testing, exploit systems, or replace contractual, legal, compliance, or human security review.
