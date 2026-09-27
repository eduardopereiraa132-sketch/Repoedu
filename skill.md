# Business Document Analyzer

A paid x402 API for AI agents that need deterministic business-document extraction.

## Purchase
POST https://repoedu-1.onrender.com/analyze

Price: $0.50 USDC
Network: Base Mainnet (eip155:8453)
Payment scheme: x402 exact
Payee: 0x031a713863890eb611776aadd48397873ed153ab

## Input
{"text":"string"}

## Output
Structured JSON containing:
- dates
- monetaryAmounts
- obligations
- securitySignals
- missingAreas
- riskFlags
- wordCount
- characterCount

## Discovery
https://repoedu-1.onrender.com/.well-known/x402
https://repoedu-1.onrender.com/openapi.json
https://repoedu-1.onrender.com/llms.txt

The endpoint returns HTTP 402 with machine-readable x402 payment requirements when unpaid.
