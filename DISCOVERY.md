# Agent Discovery

## Service 1: Webpage Extractor

Live paid endpoint:
POST https://repoedu-1.onrender.com/web-extract

Price: $0.005 USDC/request

Purpose: extract clean machine-readable text, metadata, headings and links from a public webpage for downstream agent research and workflows.

## Service 2: Vendor Security Preflight

Live paid endpoint:
POST https://repoedu-1.onrender.com/vendor-preflight

Price: $0.025 USDC/request

Input: {"url":"https://example.com","requirements":["HTTPS","HSTS","Content Security Policy"]}

Purpose: structured first-pass vendor-risk signal from publicly observable website security controls. It is not a penetration test, vulnerability scan, certification, or legal opinion.

## Service 3: Website Security Preflight

Live paid endpoint:
POST https://repoedu-1.onrender.com/site-audit

Price: $0.01 USDC/request

Purpose: live public website security signals for vendor-risk, compliance and automation workflows.

## Service 4: Business Document Analyzer

Live paid endpoint:
POST https://repoedu-1.onrender.com/analyze

Price: $0.005 USDC/request

Purpose: deterministic structured extraction of dates, monetary amounts, obligations, security signals, missing control areas and risk flags from business-document text.

## Payment

- Protocol: x402 v2
- Scheme: exact
- Network: Base Mainnet (eip155:8453)
- Asset: USDC
- Payee: 0x031a713863890eb611776aadd48397873ed153ab

## Machine-readable discovery

- https://repoedu-1.onrender.com/.well-known/x402
- https://repoedu-1.onrender.com/.well-known/ai-plugin.json
- https://repoedu-1.onrender.com/.well-known/x402-discovery
- https://repoedu-1.onrender.com/agent-card.json
- https://repoedu-1.onrender.com/openapi.json
- https://repoedu-1.onrender.com/llms.txt
- https://repoedu-1.onrender.com/skill.md

## Agent behavior

An unpaid request to a paid endpoint returns HTTP 402 with x402 payment requirements and Bazaar discovery metadata. A compatible x402 client can sign the exact USDC payment on Base and retry the request with the payment payload.

## Revenue condition

Discovery, deployment and catalog presence do not create revenue by themselves. Revenue requires a real funded x402 client to purchase requests. Bazaar listing is intended to make compatible services discoverable to agents; selection still depends on task fit, price, schemas, availability and buyer requirements.

## Scope limitations

- Public HTTP/HTTPS targets only.
- No authenticated/private/local URLs.
- No browser-required JavaScript rendering.
- Vendor Security Preflight and Website Security Preflight are first-pass public-signal checks, not penetration tests, vulnerability scans, certifications or legal opinions.
- Business Document Analyzer provides deterministic extraction/triage, not legal advice or an LLM opinion.
