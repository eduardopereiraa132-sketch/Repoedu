# EvidenceCheck — Business Document Analyzer

## Purpose
Perform deterministic first-pass triage of supplied business-document text for dates, monetary amounts, obligations, security signals, missing areas and risk flags.

## Endpoint
POST https://evidencecheck-api.onrender.com/analyze

## Price
US$0.01 per call via x402 exact / USDC / Base Mainnet.

## Input
{"text":"Supplier must notify incidents within 24 hours. Annual fee USD 24,000."}

## Output
{
  "service": "Business Document Analyzer",
  "wordCount": 18,
  "characterCount": 103,
  "dates": ["within 24 hours"],
  "monetaryAmounts": ["USD 24,000"],
  "obligations": ["Supplier must notify incidents within 24 hours."],
  "securitySignals": ["security","incident"],
  "missingAreas": ["access control"],
  "riskFlags": ["obligations detected","deadlines or time periods detected"]
}

## Agent behavior
1. Send only the text necessary for triage.
2. Treat the output as a first-pass analytical result.
3. Use source documents and human verification for material decisions.
4. Do not treat missing public wording as proof that a control is absent.
