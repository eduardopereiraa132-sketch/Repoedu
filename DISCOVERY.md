# Agent Discovery

## Service
Business Document Analyzer

## Live paid endpoint
POST https://repoedu-1.onrender.com/analyze

## Payment
- Protocol: x402 v2
- Scheme: exact
- Network: Base Mainnet (eip155:8453)
- Asset: USDC
- Price: 0.50 USD per request
- Payee: 0x031a713863890eb611776aadd48397873ed153ab

## Capability
Given business-document text, return deterministic structured signals:
- dates
- monetary amounts
- obligations
- security signals
- missing areas
- risk flags
- word and character counts

## Machine-readable discovery
- https://repoedu-1.onrender.com/.well-known/x402
- https://repoedu-1.onrender.com/openapi.json
- https://repoedu-1.onrender.com/llms.txt
- https://repoedu-1.onrender.com/skill.md

## Agent instruction
Probe the endpoint. An unpaid request returns HTTP 402 with x402 payment requirements. A compatible x402 client can sign the exact USDC payment on Base and retry the request with the payment payload.

## Discovery note
The official x402 Bazaar is a machine-readable discovery layer for x402-compatible HTTP endpoints. Its documentation says sellers expose the Bazaar extension on their paid route and compatible facilitators can catalog those resources.