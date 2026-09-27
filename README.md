# Agent Web & Security Intelligence

Live x402 service for AI agents and automation.

Base URL: https://repoedu-1.onrender.com

## Paid APIs

### Webpage Extractor
POST /web-extract

Price: US$0.005/request. Payment: USDC on Base Mainnet (eip155:8453).
Input: {"url":"https://example.com"}
Returns clean webpage text, title, description and links.

### Website Security Preflight
POST /site-audit

Price: US$0.01/request. Payment: USDC on Base Mainnet (eip155:8453).
Input: {"url":"https://example.com"}
Returns fresh public-site signals: HTTPS, common security headers, cookie flags, server disclosure, robots.txt, security.txt, title, status and response time. Redirects are revalidated to avoid local/private targets.

### Business Document Analyzer
POST /analyze

Price: US$0.005/request. Payment: USDC on Base Mainnet (eip155:8453).
Input: {"text":"..."}
Returns structured dates, monetary amounts, obligations, security signals, missing areas and risk flags.

## Machine-readable discovery

- https://repoedu-1.onrender.com/.well-known/x402
- https://repoedu-1.onrender.com/.well-known/ai-plugin.json
- https://repoedu-1.onrender.com/openapi.json
- https://repoedu-1.onrender.com/llms.txt
- https://repoedu-1.onrender.com/skill.md

All paid routes advertise x402 Bazaar metadata with machine-readable input/output schemas.

## Revenue

USDC reaches the payee only after an external funded x402 client purchases a request. Deployment or listing does not itself create revenue.

No private key, seed phrase or exchange credential is stored in the repository.
