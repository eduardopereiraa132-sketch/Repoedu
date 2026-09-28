import http from "node:http";
import fs from "node:fs";
import { generateKeypair, serializeKeypair, deserializeKeypair, RegistryClient, publicKeyToAgentId } from "basedagents";
import { assessEvidence } from "./assessment-engine.mjs";

const API = process.env.BASEDAGENTS_API_URL || "https://api.basedagents.ai";
const WALLET = process.env.PAY_TO || "0x031a713863890eb611776aadd48397873ed153ab";
const KEYPAIR_FILE = process.env.BASEDAGENTS_KEYPAIR_FILE || "/tmp/basedagents-keypair.json";
const MIN_BOUNTY = BigInt(process.env.BASEDAGENTS_MIN_USDC_ATOMIC || "10000"); // 0.01 USDC
const MAX_BOUNTY = BigInt(process.env.BASEDAGENTS_MAX_USDC_ATOMIC || "1000000000"); // 1,000 USDC
const POLL_MS = Number(process.env.BASEDAGENTS_POLL_MS || 30000);
const MAX_CLAIMS_PER_CYCLE = Number(process.env.BASEDAGENTS_MAX_CLAIMS_PER_CYCLE || 3);
const PORT = Number(process.env.PORT || 10000);
const state = { lastScanAt: null, lastClaimAt: null, lastDeliveryAt: null, claimed: 0, delivered: 0, lastError: null };

http.createServer((req, res) => {
  res.setHeader("content-type", "application/json");
  if (req.url === "/health") return res.end(JSON.stringify({ ok: true, service: "basedagents-earning-worker", wallet: WALLET, state }));
  res.end(JSON.stringify({ service: "Vendor Intelligence Agent", earningMode: "funded-task-marketplace", state }));
}).listen(PORT, "0.0.0.0", () => console.log(`[basedagents] health server on ${PORT}`));

async function loadKeypair() {
  if (process.env.BASEDAGENTS_KEYPAIR_JSON) return deserializeKeypair(process.env.BASEDAGENTS_KEYPAIR_JSON);
  if (fs.existsSync(KEYPAIR_FILE)) return deserializeKeypair(fs.readFileSync(KEYPAIR_FILE, "utf8"));
  const kp = await generateKeypair();
  fs.writeFileSync(KEYPAIR_FILE, serializeKeypair(kp), { mode: 0o600 });
  return kp;
}

const kp = await loadKeypair();
const agentId = publicKeyToAgentId(kp.publicKey);
const client = new RegistryClient(API);

function bountyAmount(task) { try { return BigInt(task?.bounty?.amount_atomic || "0"); } catch { return 0n; } }
function bountyIsWorthIt(task) { const amount = bountyAmount(task); return amount >= MIN_BOUNTY && amount <= MAX_BOUNTY; }
function relevanceScore(task) {
  const text = `${task.title || ""}\n${task.description || ""}\n${task.expected_output || ""}`.toLowerCase();
  const positive = /(vendor|supplier|procurement|due diligence|security review|security questionnaire|compliance|soc ?2|iso ?27001|risk assessment|third[- ]party risk|website audit|document analysis|privacy|data protection|research|data extraction|competitive|market research|web research)/i;
  const negative = /(penetration test|exploit|malware|credential|password|private key|unauthorized access|bypass|phishing|physical visit|in-person|call a phone|legal opinion)/i;
  if (negative.test(text) || !positive.test(text)) return -1;
  let score = 0;
  if (/(vendor|supplier|procurement|third[- ]party risk|security review|compliance)/i.test(text)) score += 50;
  if (/(research|data|document|website|privacy)/i.test(text)) score += 25;
  score += Math.min(25, Number(bountyAmount(task)) / 1000000);
  return score;
}

async function fetchPublicEvidence(url) {
  try {
    const u = new URL(url);
    if (!["http:", "https:"].includes(u.protocol)) return "";
    const r = await fetch(u, { redirect: "follow", signal: AbortSignal.timeout(7000), headers: { "user-agent": "VendorIntelligenceAgent/1.4" } });
    if (!r.ok) return `HTTP status ${r.status}`;
    const html = (await r.text()).slice(0, 120000);
    const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const text = html.replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return `URL: ${url}\nTitle: ${title}\nPublic page text: ${text.slice(0, 30000)}`;
  } catch (e) { return `Public evidence could not be fetched: ${e.message}`; }
}

async function makeDeliverable(task) {
  const source = `${task.title || ""}\n${task.description || ""}\n${task.expected_output || ""}`;
  const url = source.match(/https?:\/\/[^\s)]+/i)?.[0] || "";
  const evidence = url ? await fetchPublicEvidence(url) : source;
  const report = assessEvidence({ vendorUrl: url, evidence, notes: source });
  return { task: task.task_id, title: task.title, service: "Vendor Intelligence Agent", generatedAt: new Date().toISOString(), sourceTask: { description: task.description, expectedOutput: task.expected_output || null }, assessment: report, methodology: "Evidence-first first-pass triage; unknown means unverified, not absent.", qualityNote: "Claims are limited to supplied/public evidence; material findings should be independently verified." };
}

async function ensureRegistered() {
  try {
    const existing = await client.getAgent(agentId);
    console.log(`[basedagents] agent ready ${existing?.agent_id || agentId}`);
  } catch {
    const agent = await client.register(kp, { name: `Vendor Intelligence Agent ${agentId.slice(-8)}`, description: "Evidence-first vendor due diligence, public-site security preflight, supplier-risk triage and structured research.", capabilities: ["research", "data", "security-review", "vendor-risk", "document-analysis", "procurement", "web-research"], protocols: ["https", "mcp", "x402"], version: "1.4.0", skills: [{ name: "basedagents", registry: "npm" }, { name: "x402", registry: "npm" }] });
    console.log(`[basedagents] registered ${agent?.agent_id || agentId}`);
  }
  try { await client.updateWallet(kp, { wallet_address: WALLET, wallet_network: "eip155:8453" }); console.log(`[basedagents] payout wallet set`); }
  catch (e) { console.warn(`[basedagents] wallet setup failed: ${e.message}`); }
}

async function workOnce() {
  state.lastScanAt = new Date().toISOString();
  const { tasks = [] } = await client.getTasks({ status: "open", limit: 100 });
  const candidates = tasks.filter(t => bountyIsWorthIt(t)).map(t => ({ task: t, score: relevanceScore(t) })).filter(x => x.score >= 0).sort((a, b) => (b.score - a.score) || Number(bountyAmount(b.task) - bountyAmount(a.task))).slice(0, MAX_CLAIMS_PER_CYCLE);
  for (const { task } of candidates) {
    try {
      await client.claimTask(kp, task.task_id);
      state.claimed += 1; state.lastClaimAt = new Date().toISOString();
      console.log(`[basedagents] claimed ${task.task_id} (${task.bounty?.amount_display || ""} USDC): ${task.title}`);
      const deliverable = await makeDeliverable(task);
      const receipt = await client.deliverTask(kp, task.task_id, { submission_type: "json", submission_content: JSON.stringify(deliverable), summary: `Delivered evidence-first research/security assessment for: ${task.title}` });
      state.delivered += 1; state.lastDeliveryAt = new Date().toISOString();
      console.log(`[basedagents] delivered ${task.task_id}; receipt=${receipt?.receipt_id || "created"}`);
    } catch (e) { state.lastError = String(e?.message || e); console.warn(`[basedagents] skipped ${task.task_id}: ${state.lastError}`); }
  }
}

async function main() {
  try { await ensureRegistered(); } catch (e) { state.lastError = String(e?.message || e); console.error(`[basedagents] setup error: ${state.lastError}`); }
  while (true) {
    try { await workOnce(); } catch (e) { state.lastError = String(e?.message || e); console.error(`[basedagents] poll error: ${state.lastError}`); }
    await new Promise(r => setTimeout(r, POLL_MS));
  }
}
main();
