import fs from "node:fs";

const file = "server.js";
let source = fs.readFileSync(file, "utf8");
const marker = "// COMMERCIAL_LANDING_V4";
if (!source.includes(marker)) {
  const insertion = String.raw`
${marker}
const commercialLanding = String.raw\`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Agent Web & Security Intelligence — Pay-per-use APIs for AI agents</title>
<meta name="description" content="Machine-readable web extraction, website security preflight, vendor security signals and business document analysis. Pay per request with USDC via x402.">
<meta property="og:title" content="Agent Web & Security Intelligence"><meta property="og:description" content="Security and web intelligence APIs built for AI agents. Structured JSON. Pay per request.">
<style>
:root{--bg:#07111f;--panel:#0d1b2d;--line:#1b3049;--text:#eef6ff;--muted:#9fb2c8;--accent:#6ee7b7;--accent2:#60a5fa;--danger:#fca5a5}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 70% -10%,#16375c 0,transparent 42%),var(--bg);color:var(--text);font:16px/1.6 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.wrap{max-width:1080px;margin:auto;padding:28px 22px 72px}.nav{display:flex;justify-content:space-between;align-items:center;gap:18px}.brand{font-weight:800;letter-spacing:-.02em}.pill{border:1px solid #24415f;border-radius:999px;padding:7px 12px;color:#b9cce0;font-size:13px}.hero{padding:82px 0 54px;max-width:850px}.eyebrow{color:var(--accent);font-weight:800;text-transform:uppercase;letter-spacing:.12em;font-size:12px}.hero h1{font-size:clamp(42px,7vw,74px);line-height:1.02;letter-spacing:-.055em;margin:14px 0 22px}.hero p{font-size:20px;color:var(--muted);max-width:760px}.cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}.btn{display:inline-block;text-decoration:none;color:#041019;background:var(--accent);font-weight:800;padding:12px 17px;border-radius:12px}.btn.secondary{background:transparent;color:var(--text);border:1px solid #2a4561}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:18px}.card{background:linear-gradient(180deg,#0e2034,#0a1728);border:1px solid var(--line);border-radius:18px;padding:23px}.card h2{margin:0 0 8px;font-size:20px}.card p{color:var(--muted);margin:0 0 16px}.price{font-weight:900;font-size:22px}.tag{display:inline-block;color:#b8d5ef;background:#10263e;border:1px solid #1e3d5c;border-radius:999px;padding:4px 8px;font-size:12px;margin:3px 4px 0 0}.section{margin-top:64px}.section h2{font-size:32px;letter-spacing:-.03em}.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.step strong{display:block;font-size:18px;margin-bottom:5px}.muted{color:var(--muted)}pre{background:#06101c;border:1px solid var(--line);border-radius:14px;padding:18px;overflow:auto;color:#cce2f7}.footer{margin-top:65px;padding-top:24px;border-top:1px solid var(--line);color:#7890aa;font-size:13px}@media(max-width:720px){.grid,.steps{grid-template-columns:1fr}.hero{padding-top:55px}.hero h1{font-size:48px}}
</style></head>
<body><main class="wrap">
<header class="nav"><div class="brand">Agent Web & Security Intelligence</div><div class="pill">x402 · USDC · Base</div></header>
<section class="hero"><div class="eyebrow">Built for machine-to-machine commerce</div><h1>Useful intelligence, delivered as an API.</h1><p>Give AI agents structured web and security signals without subscriptions, dashboards or manual procurement. Each request is independently priced and machine-readable.</p><div class="cta"><a class="btn" href="#services">Explore paid endpoints</a><a class="btn secondary" href="/llms.txt">Agent integration guide</a></div></section>
<section id="services"><div class="eyebrow">Pay only when you use it</div><div class="grid">
<article class="card"><h2>Webpage Extractor</h2><p>Turn a public webpage into clean text, metadata, headings and links for downstream agent reasoning.</p><span class="price">$0.005 / request</span><div><span class="tag">research</span><span class="tag">web</span><span class="tag">content</span></div></article>
<article class="card"><h2>Website Security Preflight</h2><p>Fast public-site checks for HTTPS, security headers, cookies, robots.txt, security.txt and exposed server details.</p><span class="price">$0.01 / request</span><div><span class="tag">security</span><span class="tag">compliance</span><span class="tag">vendor-risk</span></div></article>
<article class="card"><h2>Vendor Security Preflight</h2><p>Combine public security signals into a structured procurement-ready risk signal and explicit gaps.</p><span class="price">$0.05 / request</span><div><span class="tag">third-party risk</span><span class="tag">procurement</span><span class="tag">due diligence</span></div></article>
<article class="card"><h2>Business Document Analyzer</h2><p>Extract obligations, dates, amounts, security signals, missing areas and risk flags from business text.</p><span class="price">$0.01 / request</span><div><span class="tag">contracts</span><span class="tag">compliance</span><span class="tag">risk</span></div></article>
</div></section>
<section class="section"><div class="eyebrow">Designed for agents</div><div class="steps"><div class="card step"><strong>1. Discover</strong><span class="muted">Use the public discovery metadata and machine-readable descriptions.</span></div><div class="card step"><strong>2. Pay</strong><span class="muted">The endpoint returns an x402 payment requirement. Pay USDC on Base.</span></div><div class="card step"><strong>3. Receive</strong><span class="muted">Get deterministic JSON designed to feed directly into another workflow.</span></div></div></section>
<section class="section"><h2>Example request</h2><pre>POST /web-extract
Content-Type: application/json

{"url":"https://example.com"}</pre><p class="muted">Payments are settled directly to the configured receiving wallet. No subscription is required.</p></section>
<footer class="footer">Public-site checks are signals, not penetration tests or certifications. Results should be validated against the buyer's own requirements.</footer>
</main></body></html>\`;
app.get("/",(_,res)=>res.status(200).type("html").send(commercialLanding));
app.get("/llms.txt",(_,res)=>res.type("text/plain").send(`# Agent Web & Security Intelligence

Paid x402 APIs for AI agents on Base Mainnet using USDC.

## Endpoints
- POST /web-extract — $0.005 — extract public webpage text, metadata and links. JSON: {url}
- POST /site-audit — $0.01 — public website security preflight. JSON: {url}
- POST /vendor-preflight — $0.05 — vendor security preflight. JSON: {url, requirements?}
- POST /analyze — $0.01 — business document analysis. JSON: {text}

## Payment
- Network: eip155:8453 (Base Mainnet)
- Asset: USDC
- x402 scheme: exact
- Payment is required per request.

## Limitations
Public-site endpoints do not perform authenticated testing, exploitation, source-code review or certification.
`));
app.get("/robots.txt",(_,res)=>res.type("text/plain").send("User-agent: *\\nAllow: /\\nAllow: /llms.txt\\n"));
`;
  const target = "app.listen(";
  if (!source.includes(target)) throw new Error("server listen target not found");
  source = source.replace(target, insertion + "\n" + target);
  fs.writeFileSync(file, source);
}
console.log("Commercial prestart: OK");
