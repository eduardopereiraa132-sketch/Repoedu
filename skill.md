# Agent Web & Security Intelligence

## Webpage Extractor
POST https://repoedu-1.onrender.com/web-extract
Price: $0.005 USDC. Network: Base Mainnet (eip155:8453). Payee: 0x031a713863890eb611776aadd48397873ed153ab
Input: {"url":"https://example.com"}
Returns clean webpage text, title, description and up to 100 links.

## Website Security Preflight
POST https://repoedu-1.onrender.com/site-audit
Price: $0.01 USDC
Network: Base Mainnet (eip155:8453)
Payment: x402 v2 exact
Payee: 0x031a713863890eb611776aadd48397873ed153ab
Input: {"url":"https://example.com"}
Returns live public website signals: HTTP status, response time, final URL, HTTPS, common security headers, cookie flags, Server disclosure, robots.txt, security.txt, page title and findings.

## Business Document Analyzer
POST https://repoedu-1.onrender.com/analyze
Price: $0.005 USDC
Network: Base Mainnet (eip155:8453)
Payment: x402 v2 exact
Payee: 0x031a713863890eb611776aadd48397873ed153ab
Input: {"text":"string"}
Returns structured dates, money, obligations, security signals, missing areas and risk flags.

## Vendor Security Preflight
POST https://repoedu-1.onrender.com/vendor-preflight
Price: $0.025 USDC
Network: Base Mainnet (eip155:8453)
Payment: x402 v2 exact
Payee: 0x031a713863890eb611776aadd48397873ed153ab
Input: {"url":"https://example.com","requirements":["HTTPS","HSTS","Content Security Policy"]}
Returns a structured first-pass vendor-risk signal from public website controls. It is not a penetration test, vulnerability scan, certification or legal opinion.

## Discovery
https://repoedu-1.onrender.com/.well-known/x402
https://repoedu-1.onrender.com/openapi.json
https://repoedu-1.onrender.com/llms.txt
https://repoedu-1.onrender.com/skill.md

Unpaid requests return HTTP 402 with machine-readable x402 payment requirements.
