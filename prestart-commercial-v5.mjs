import fs from "node:fs";

const file = "server.js";
let source = fs.readFileSync(file, "utf8");

// V5: preserve the existing API while adding a simpler, human-buyable entry product.
const marker = "// COMMERCIAL_LANDING_V5";
if (source.includes(marker)) { console.log("Commercial V5: already applied"); process.exit(0); }

const snapshotPrice = process.env.SNAPSHOT_PRICE || "$9";
const insertion = String.raw`
${marker}
const snapshotRoute = {
  "POST /vendor-snapshot": {
    accepts: { scheme: "exact", price: snapshotPrice, network, payTo },
    resource: { url: publicUrl + "/vendor-snapshot", description: "Instant vendor security snapshot: live public-site checks, gaps, evidence priorities and procurement follow-up questions.", mimeType: "application/json", serviceName: "Instant Vendor Security Snapshot", tags: ["vendor-risk","procurement","security","due-diligence","compliance"], iconUrl: publicUrl + "/icon.svg" },
    description: "Instant vendor security snapshot for procurement triage. Send JSON {url, requirements?}. Public-site first pass; not a penetration test or certification.",
    mimeType: "application/json",
    extensions: { ...declareDiscoveryExtension({
      input: { url: "https://example.com", requirements: ["HTTPS", "HSTS", "CSP"] },
      inputSchema: { type: "object", properties: { url: { type: "string" }, requirements: { type: "array", items: { type: "string" } } }, required: ["url"] },
      bodyType: "json",
      output: { example: { service: "Instant Vendor Security Snapshot", verdict: "review", riskLevel: "low", vendorUrl: "https://example.com/", keyGaps: ["Content Security Policy"], evidencePriority: ["Request current security documentation", "Confirm incident notification SLA"], buyerQuestions: ["Do you maintain a current SOC 2 Type II or ISO 27001 certification?", "What is your incident notification timeframe?"] }, schema: { type: "object" } }
    }) }
  }
};
app.use(paymentMiddleware(snapshotRoute, x402Server));
app.post("/vendor-snapshot", async (req, res) => {
  try {
    const url = String(req.body?.url || "").trim();
    const requirements = Array.isArray(req.body?.requirements) ? req.body.requirements : [];
    if (!validatePublicUrl(url)) return res.status(400).json({ error: "Provide a public http or https vendor URL" });
    const preflight = await vendorPreflight(url, requirements);
    const failed = preflight.checks.filter(x => x.passed === false);
    const verdict = preflight.riskLevel === "high" ? "escalate" : failed.length ? "review" : "clear-for-next-step";
    const evidencePriority = [
      failed.length ? "Request evidence for every failed or unverifiable control." : "Request current security evidence to confirm public-site signals.",
      "Confirm incident notification, data retention and access-control commitments.",
      "Verify any SOC 2, ISO 27001, privacy or contractual claims directly with the vendor."
    ];
    const buyerQuestions = [
      "Can you provide your current SOC 2 Type II report or ISO 27001 certificate, if applicable?",
      "What is your contractual incident-notification SLA?",
      "Which subprocessors handle our data and where is it stored?",
      "What controls govern privileged access and customer-data retention?"
    ];
    const result = { service: "Instant Vendor Security Snapshot", price: snapshotPrice, generatedAt: new Date().toISOString(), verdict, riskLevel: preflight.riskLevel, vendorUrl: preflight.url, status: preflight.status, https: preflight.https, keyGaps: [...new Set(failed.map(x => x.label))], checks: preflight.checks, evidencePriority, buyerQuestions, summary: `Fast procurement triage found ${failed.length} unmet or unverifiable public-site checks.`, limitations: preflight.limitations };
    try { await saveAssessment({ source: "vendor-snapshot", url, result }); } catch (e) { console.warn("SNAPSHOT_STORAGE_ERROR", e.message); }
    res.json(result);
  } catch (e) { res.status(400).json({ error: e?.message || "snapshot failed" }); }
});

const commercialLandingV5 = String.raw\`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Vendor Intelligence — Instant supplier security triage</title>
<meta name="description" content="Get a fast, evidence-first vendor security snapshot before procurement approval. Machine-readable, pay-per-use, USDC on Base.">
<style>
:root{--bg:#070b12;--panel:#0d1420;--line:#202d3d;--text:#f5f7fb;--muted:#9aa9bb;--accent:#8cf0c0;--blue:#78b7ff}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 80% 0,#173252 0,transparent 36%),var(--bg);color:var(--text);font:16px/1.55 Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.wrap{max-width:1060px;margin:auto;padding:24px 20px 70px}.nav{display:flex;justify-content:space-between;align-items:center}.brand{font-weight:850;letter-spacing:-.03em}.pill{font-size:12px;border:1px solid #2a3b50;border-radius:999px;padding:6px 10px;color:#b8c7d8}.hero{padding:76px 0 48px;max-width:850px}.ey{font-size:12px;text-transform:uppercase;letter-spacing:.13em;color:var(--accent);font-weight:800}.hero h1{font-size:clamp(44px,7vw,76px);line-height:1;letter-spacing:-.06em;margin:12px 0 20px}.hero p{font-size:20px;color:var(--muted);max-width:760px}.cta{display:flex;gap:12px;flex-wrap:wrap;margin-top:26px}.btn{padding:12px 16px;border-radius:11px;text-decoration:none;font-weight:800;background:var(--accent);color:#06100d}.btn.alt{background:transparent;color:var(--text);border:1px solid #314257}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.card{background:linear-gradient(180deg,#101b29,#0b121d);border:1px solid var(--line);border-radius:18px;padding:23px}.card h2{margin:0 0 8px;font-size:21px}.card p{color:var(--muted);margin:0 0 16px}.price{font-size:22px;font-weight:900}.tag{display:inline-block;margin:9px 5px 0 0;padding:4px 8px;border:1px solid #29415c;background:#101f31;border-radius:999px;font-size:12px;color:#bdd4eb}.featured{border-color:#3d6b59;box-shadow:0 0 0 1px #203c31 inset}.section{margin-top:62px}.section h2{font-size:32px;letter-spacing:-.04em}.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.step b{display:block;margin-bottom:5px;font-size:18px}.muted{color:var(--muted)}pre{background:#050a10;border:1px solid var(--line);border-radius:14px;padding:17px;overflow:auto}.foot{margin-top:58px;padding-top:20px;border-top:1px solid var(--line);font-size:13px;color:#718398}@media(max-width:720px){.grid,.steps{grid-template-columns:1fr}.hero{padding-top:52px}}
</style></head><body><main class="wrap">
<header class="nav"><div class="brand">Vendor Intelligence</div><div class="pill">x402 · USDC · Base</div></header>
<section class="hero"><div class="ey">Procurement triage before you approve a supplier</div><h1>Know what is missing before you say yes.</h1><p>Paste a vendor URL. Get a structured first-pass security snapshot with gaps, evidence priorities and questions your procurement or security team can send next.</p><div class="cta"><a class="btn" href="/demo">See a live demo</a><a class="btn alt" href="/llms.txt">For AI agents</a></div></section>
<section class="grid"><article class="card featured"><div class="ey">Fastest path</div><h2>Instant Vendor Snapshot</h2><p>One paid request returns the public-site checks, risk signal, missing evidence and ready-to-send supplier questions.</p><div class="price">$9 / vendor</div><div><span class="tag">procurement</span><span class="tag">security</span><span class="tag">due diligence</span></div></article>
<article class="card"><div class="ey">For automation</div><h2>Vendor Risk Preflight</h2><p>Let an AI agent call the same evidence workflow programmatically and receive structured JSON.</p><div class="price">$0.025 / call</div><div><span class="tag">API</span><span class="tag">x402</span><span class="tag">machine-readable</span></div></article></section>
<section class="section"><div class="ey">What you receive</div><div class="steps"><div class="card step"><b>1 · Signal</b><span class="muted">HTTPS, headers, cookies, robots.txt, security.txt and other public indicators.</span></div><div class="card step"><b>2 · Gap</b><span class="muted">A clear list of controls or evidence that were not observed or could not be verified.</span></div><div class="card step"><b>3 · Next action</b><span class="muted">Concrete evidence requests and supplier questions so the review does not stop at a score.</span></div></div></section>
<section class="section"><h2>Built for real workflows</h2><p class="muted">Use it before onboarding, during supplier renewal, or as a first-pass filter before spending analyst time on a deeper assessment. It is intentionally not a penetration test, certification or legal opinion.</p><pre>POST /vendor-snapshot
Content-Type: application/json

{"url":"https://supplier.example","requirements":["HTTPS","HSTS","SOC 2"]}</pre></section>
<footer class="foot">Public signals are evidence to verify, not proof of security. Material decisions should be reviewed by the responsible human team.</footer>
</main></body></html>\`;
app.get("/",(_,res)=>res.status(200).type("html").send(commercialLandingV5));
app.get("/llms.txt",(_,res)=>res.type("text/plain").send(`# Vendor Intelligence\n\nInstant vendor security snapshots and agent-native procurement triage.\n\n## Paid endpoints\n- POST /vendor-snapshot — $9 — instant vendor security snapshot with gaps, evidence priorities and buyer questions. JSON: {url, requirements?}\n- POST /vendor-preflight — $0.025 — machine-readable public vendor security preflight. JSON: {url, requirements?}\n- POST /site-audit — $0.01 — public website security preflight. JSON: {url}\n- POST /web-extract — $0.005 — webpage extraction. JSON: {url}\n- POST /analyze — $0.005 — business document analysis. JSON: {text}\n\n## Payment\n- Network: eip155:8453 (Base Mainnet)\n- Asset: USDC\n- Scheme: exact\n- Payment is required per paid request.\n\n## Trust boundary\nPublic-site checks are first-pass signals. No authenticated testing, exploitation, source-code review, vulnerability scanning, certification or legal opinion.\n`));
`;

const target = "app.listen(";
if (!source.includes(target)) throw new Error("server listen target not found");
source = source.replace(target, insertion + "\n" + target);
fs.writeFileSync(file, source);
console.log("Commercial V5: OK");
