# Agent Document Risk Analyzer

## Purpose
Perform a rapid first-pass analysis of business documents for security, privacy, compliance, operational obligations, deadlines, owners, missing evidence and follow-up actions.

## Endpoint
`POST /analyze`

## Input
```json
{"text":"document text"}
```

## Output
```json
{
  "summary":"...",
  "risks":[{"severity":"high|medium|low","finding":"...","evidence":"...","action":"..."}],
  "obligations":[{"obligation":"...","owner":"...","deadline":"..."}],
  "missing_evidence":["..."],
  "recommended_actions":["..."]
}
```

## Payment
US$0.50 per call. x402 `exact` scheme. USDC on Base mainnet (`eip155:8453`).

## Agent behavior
1. Read this contract before calling.
2. Send only data necessary for analysis.
3. Treat output as a first-pass analytical result.
4. Do not treat it as legal, regulatory or certification advice.

## Discovery
Machine-readable metadata should be exposed at `/.well-known/x402` and `/openapi.json` once deployed.
