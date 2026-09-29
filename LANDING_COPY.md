# EvidenceCheck

## Hero

**Know what a vendor's evidence actually supports — before you approve it.**

EvidenceCheck is a first-pass vendor due-diligence workflow for procurement, security, compliance and third-party-risk teams. Give it a vendor URL or supplied business evidence and get a structured verification queue: what was observed, what is missing, what to ask the supplier next, and what still needs human review.

**Primary CTA:** Run a vendor preflight  
**Secondary CTA:** Try the API

### The fastest useful question
**Should this vendor move forward, or does the evidence need more work?**

EvidenceCheck does not pretend that a public website proves security. It turns observable evidence into a repeatable triage step before your team spends hours on questionnaires, PDFs and manual research.

## What you get

- **Vendor preflight** — public evidence, security signals, gaps, targeted supplier questions and limitations in one structured response.
- **Website security preflight** — observable HTTPS, security headers, cookie flags, robots/security files and other public signals.
- **Document intelligence** — dates, monetary amounts, obligations, security signals, missing areas and risk flags.
- **Evidence vs. unknowns** — findings are separated from inference so reviewers can see what is actually supported.
- **Action queue** — missing evidence becomes concrete follow-up questions instead of a vague summary.
- **Machine-readable output** — JSON for procurement, GRC, workflow automation and AI agents.

## Why teams use it

Vendor review time is often spent on collection and first-pass triage rather than the decisions that require experienced judgment. EvidenceCheck handles the repeatable layer and makes the handoff explicit.

**The product is not another generic AI summarizer.** The output is designed around a decision workflow:

**Evidence → gaps → supplier questions → human review**

## Try before you commit

### Machine API
Use individual capabilities on a pay-per-request basis. Compatible agents can call the endpoints with USDC on Base through x402.

- `/vendor-preflight` — **US$0.025**
- `/site-audit` — **US$0.01**
- `/web-extract` — **US$0.005**
- `/analyze` — **US$0.01**

The low entry prices are deliberate: the easiest way to evaluate the product is to run one real check.

### Human-led review
For organizations that need a defined review rather than an API call, EvidenceCheck offers a fixed-scope vendor review and recurring intake. Scope, turnaround and human-review requirements are confirmed before purchase.

**Fixed-scope starting offer: US$495**  
One defined vendor review, public-site preflight, supplied-document review, structured findings/gaps and a target 48-hour turnaround.

**Recurring intake starting offer: US$1,250/month**  
Up to 10 vendor preflights per month with a consistent review workflow and monthly evidence summary, subject to final scope.

These are offer prices, not claims of existing customers or revenue.

## Example workflow

1. Submit the vendor's public URL.
2. EvidenceCheck collects observable signals.
3. The system identifies gaps and generates targeted supplier questions.
4. Your workflow receives structured JSON.
5. A human reviewer decides whether to approve, request evidence or escalate.

## Built for agents too

EvidenceCheck exposes machine-readable discovery through OpenAPI, `llms.txt`, skill metadata and x402 discovery metadata. A compatible agent can discover a capability, understand its schema and price, pay for a single request and receive structured output without a subscription.

## Trust boundary

EvidenceCheck is **first-pass due diligence**, not a penetration test, vulnerability scanner, certification, legal opinion or compliance attestation. Public signals do not prove that a control exists or that a system is secure. Material decisions remain with authorized people.

## FAQ

### Does it replace a security or procurement team?
No. It reduces repetitive collection and triage so qualified people can focus on decisions and exceptions.

### Does it test a vendor's systems?
No. The current workflow is limited to public website signals and supplied business/security evidence. It does not perform authenticated testing or exploitation.

### What makes the output different from a normal AI summary?
The workflow explicitly separates observed evidence, gaps, supplier questions and limitations. The result is intended to become a review queue, not just prose.

### Can an AI agent buy a single check?
Yes. The machine API exposes priced x402 endpoints on Base with USDC payment metadata and discovery information.

### Can I try it without a contract?
Yes. The machine endpoints are pay-per-request. The smallest checks cost fractions of a dollar, so a buyer can validate the output before considering a larger engagement.
