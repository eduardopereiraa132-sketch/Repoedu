# Agent Discovery

## Service 1: Website Security Preflight

Live paid endpoint:
POST https://repoedu-1.onrender.com/site-audit

Purpose: live public website security signals for vendor-risk, compliance and automation workflows.

## Service 2: Business Document Analyzer

Live paid endpoint:
POST https://repoedu-1.onrender.com/analyze

Purpose: deterministic structured extraction from business-document text.

## Payment

- Protocol: x402 v2
- Scheme: exact
- Network: Base Mainnet (eip155:8453)
- Asset: USDC
- Price: 0.50 USD per request
- Payee: 0x031a713863890eb611776aadd48397873ed153ab

## Machine-readable discovery

- https://repoedu-1.onrender.com/.well-known/x402
- https://repoedu-1.onrender.com/.well-known/ai-plugin.json
- https://repoedu-1.onrender.com/openapi.json
- https://repoedu-1.onrender.com/llms.txt
- https://repoedu-1.onrender.com/skill.md

## Agent behavior

An unpaid request to either paid endpoint returns HTTP 402 with x402 payment requirements. A compatible x402 client can sign the exact USDC payment on Base and retry the request with the payment payload.

## Important revenue condition

A listing, deployment or discovery record does not create revenue by itself. Revenue requires a real external funded x402 client to purchase requests.
