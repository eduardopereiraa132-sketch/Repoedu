# Business Document Analyzer

Paid, machine-readable business-document analysis API for AI agents and automation.

## Live service

- Base URL: https://repoedu-1.onrender.com
- Health: https://repoedu-1.onrender.com/health
- OpenAPI: https://repoedu-1.onrender.com/openapi.json
- Paid endpoint: POST https://repoedu-1.onrender.com/analyze
- Payment protocol: x402 v2
- Network: Base Mainnet (eip155:8453)
- Price: US$0.50 per request
- Settlement asset: USDC
- Payee: 0x031a713863890eb611776aadd48397873ed153ab

## How an agent uses it

1. POST JSON {"text":"..."} to /analyze.
2. The unpaid response is HTTP 402 with x402 payment requirements.
3. An x402-capable client signs the requested USDC payment on Base.
4. The client retries with the payment payload.
5. The facilitator verifies and settles the payment; the API returns the analysis.

## What it returns

Structured JSON with word/character counts, dates, monetary amounts, obligations, security signals, missing control areas and risk flags.

## Discovery

The route includes the x402 Bazaar discovery extension and machine-readable input/output schemas so compatible facilitators can catalog it for AI-agent discovery.

## Important revenue condition

This is a real payment service, not a balance generator. Money reaches the payee only after an external funded client actually pays for a request. No secret key is stored in the repository.

## Local development

```bash
npm install
npm start
```

Optional environment variables: PAY_TO, NETWORK, PRICE, FACILITATOR_URL, PUBLIC_URL.
