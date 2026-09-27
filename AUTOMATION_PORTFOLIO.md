# AI Automation Portfolio

## What I build

I implement practical AI and workflow automations for businesses using n8n, APIs, webhooks, Google Workspace, CRMs, databases and LLMs.

The focus is not "AI for the sake of AI". Each workflow is designed around a measurable business process: reduce manual work, move information between systems, classify incoming data, generate structured outputs, or automate follow-up.

## Demonstration system

This repository contains a live machine-facing automation/security system deployed on Render.

It demonstrates:

- Public webpage extraction into structured data
- Website security preflight
- Vendor-risk preflight
- Business-document classification and extraction
- JSON APIs designed for automation
- x402 machine-to-machine payment flow on Base
- Input validation, public-URL protection and security headers
- Structured outputs suitable for downstream workflows

Live demonstration:
https://repoedu.onrender.com/demo

API documentation:
https://repoedu.onrender.com/openapi.json

## Example client workflows

### 1. Lead intake automation
Form / ad lead -> validation -> AI qualification -> CRM -> notification -> follow-up task.

### 2. Email operations
Inbox -> classify -> extract action items -> draft response -> create task -> human approval.

### 3. Document processing
PDF/text -> extract dates, amounts, obligations and risk signals -> structured record -> report.

### 4. CRM follow-up
New opportunity -> enrich -> qualify -> assign -> scheduled follow-up -> status reporting.

### 5. Internal knowledge workflow
Company documents -> structured knowledge base -> AI retrieval -> controlled answer -> source/evidence trail.

## Delivery model

I prefer small fixed-scope implementations first.

Typical first project:
- One workflow
- Existing client tools
- Clear input and output
- Error handling
- Basic documentation
- 3–5 day target for a well-scoped workflow

Initial project pricing is discussed according to scope. The objective is to prove value with one workflow before expanding.

## Working style

- Business process first
- Automation second
- Human approval where decisions matter
- Reliable integrations over fragile demos
- Clear handoff and documentation
- No unnecessary custom software when an existing tool/API solves the problem
