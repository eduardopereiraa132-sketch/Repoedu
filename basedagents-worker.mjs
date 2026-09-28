import http from "node:http";
import fs from "node:fs";
import { generateKeypair, serializeKeypair, deserializeKeypair, RegistryClient, publicKeyToAgentId } from "basedagents";
import { assessEvidence } from "./assessment-engine.mjs";

const API = process.env.BASEDAGENTS_API_URL || "https://api.basedagents.ai";
const WALLET = process.env.PAY_TO || "0x031a713863890eb611776aadd48397873ed153ab";
const KEYPAIR_FILE = process.env.BASEDAGENTS_KEYPAIR_FILE || "/tmp/basedagents-keypair.json";
const MIN_BOUNTY = BigInt(process.env.BASEDAGENTS_MIN_USDC_ATOMIC || "5000"); // 0.005 USDC
const MAX_BOUNTY = BigInt(process.env.BASEDAGENTS_MAX_USDC_ATOMIC || "5000000000"); // 5,000 USDC
const POLL_MS = Number(process.env.BASEDAGENTS_POLL_MS || 30000);
const MAX_CLAIMS_PER_CYCLE = Number(process.env.BASEDAGENTS_MAX_CLAIMS_PER_CYCLE || 3);
const PORT = Number(process.env.PORT || 10000);
const state = { lastScanAt: null, lastClaimAt: null, lastDeliveryAt: null, scanned: 0, eligible: 0, claimed: 0, delivered: 0, lastCandidates: [], lastError: null };

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
  const positive = /(research|web research|market research|data extraction|data analysis|document analysis|summar|summarization|content|writing|editing|translation|localization|competitive|vendor|supplier|procurement|due diligence|security review|security questionnaire|compliance|soc ?2|iso ?27001|risk assessment|third[- ]party risk|website audit|privacy|data protection|operations|classification|fact[- ]check|source[- ]check|report|spreadsheet|dataset)/i;
  const negative = /(penetration test|exploit|malware|credential|password|private key|seed phrase|unauthorized access|bypass|phishing|physical visit|in-person|call a phone|legal opinion|medical diagnosis|financial advice|gambling|wash trading|self-dealing)/i;
  if (negative.test(text) || !positive.test(text)) return -1;
  let score = 10;
  if (/(vendor|supplier|procurement|third[- ]party risk|security review|compliance|due diligence)/i.test(text)) score += 40;
  if (/(research|data|document|website|privacy|report|fact[- ]check)/i.test(text)) score += 25;
  if (/(writing|editing|content|translation|localization)/i.test(text)) score += 10;
  const dollars = Number(bountyAmount(task)) / 1_000_000;
  score += Math.min(25, Math.max(0, Math.log10(Math.max(1, dollars)) * 12));
  return score;
}

async function fetchPublicEvidence(url) {
  try {
    const u = new URL(url);
    if (!["http:", "https:"].includes(u.protocol)) return "";
    const r = await fetch(u, { redirect: "follow", signal: AbortSignal.timeout(7000), headers: { "user-agent": "VendorIntelligenceAgent/1.5" } });
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
  return { task: task.task_id, title: task.title, service: "Evidence-first Research & Vendor Intelligence Agent", generatedAt: new Date().toISOString(), sourceTask: { description: task.description, expectedOutput: task.expected_output || null }, assessment: report, methodology: "Evidence-first first-pass research; unknown means unverified, not absent.", qualityNote: "Claims are limited to supplied/public evidence; material findings should be independently verified." };
}

async function ensureRegistered() {
  try {
    const existing = await client.getAgent(agentId);
    console.log(`[basedagents] agent ready ${existing?.agent_id || agentId}`);
  } catch {
    const agent = await client.register(kp, { name: `Evidence Research Agent ${agentId.slice(-8)}`, description: "Evidence-first research, vendor due diligence, public-site preflight, structured data extraction and procurement/security triage.", capabilities: ["research", "data", "writing", "document-analysis", "vendor-risk", "procurement", "web-research", "content", "fact-checking"], protocols: ["https", "mcp", "x402"], version: "1.5.0", skills: [{ name: "basedagents", registry: "npm" }, { name: "x402", registry: "npm" }] });
    console.log(`[basedagents] registered ${agent?.agent_id || agentId}`);
  }
  try { await client.updateWallet(kp, { wallet_address: WALLET, wallet_network: "eip155:8453" }); console.log(`[basedagents] payout wallet set`); }
  catch (e) { console.warn(`[basedagents] wallet setup failed: ${e.message}`); }
}

async function workOnce() {
  state.lastScanAt = new Date().toISOString();
  const { tasks = [] } = await client.getTasks({ status: "open", limit: 100 });
  state.scanned = tasks.length;
  const ranked = tasks.filter(t => bountyIsWorthIt(t)).map(t => ({ task: t, score: relevanceScore(t) })).filter(x => x.score >= 0).sort((a, b) => (b.score - a.score) || Number(bountyAmount(b.task) - bountyAmount(a.task)));
  state.eligible = ranked.length;
  state.lastCandidates = ranked.slice(0, 5).map(x => ({ id: x.task.task_id, title: x.task.title, bounty: x.task.bounty?.amount_display || null, score: Math.round(x.score) }));
  console.log(`[basedagents] scan open=${state.scanned} eligible=${state.eligible} top=${JSON.stringify(state.lastCandidates)}`);
  for (const { task } of ranked.slice(0, MAX_CLAIMS_PER_CYCLE)) {
    try {
      await client.claimTask(kp, task.task_id);
      state.claimed += 1; state.lastClaimAt = new Date().toISOString();
      console.log(`[basedagents] claimed ${task.task_id} (${task.bounty?.amount_display || ""} USDC): ${task.title}`);
      const deliverable = await makeDeliverable(task);
      const receipt = await client.deliverTask(kp, task.task_id, { submission_type: "json", submission_content: JSON.stringify(deliverable), summary: `Delivered evidence-first research assessment for: ${task.title}` });
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