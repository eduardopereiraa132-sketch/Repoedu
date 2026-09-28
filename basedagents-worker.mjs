import { deserializeKeypair, RegistryClient, publicKeyToAgentId } from "basedagents";
import { assessEvidence } from "./assessment-engine.mjs";

const API = process.env.BASEDAGENTS_API_URL || "https://api.basedagents.ai";
const WALLET = process.env.PAY_TO || "0x031a713863890eb611776aadd48397873ed153ab";
const KEYPAIR_JSON = process.env.BASEDAGENTS_KEYPAIR_JSON;
const MIN_BOUNTY = BigInt(process.env.BASEDAGENTS_MIN_USDC_ATOMIC || "500000"); // $0.50
const MAX_BOUNTY = BigInt(process.env.BASEDAGENTS_MAX_USDC_ATOMIC || "25000000"); // $25
const POLL_MS = Number(process.env.BASEDAGENTS_POLL_MS || 60000);

if (!KEYPAIR_JSON) {
  console.warn("[basedagents] worker disabled: BASEDAGENTS_KEYPAIR_JSON is not configured");
  process.exit(0);
}

const kp = deserializeKeypair(KEYPAIR_JSON);
const agentId = publicKeyToAgentId(kp.publicKey);
const client = new RegistryClient(API);

function bountyIsWorthIt(task) {
  if (!task?.bounty?.amount_atomic) return false;
  const amount = BigInt(task.bounty.amount_atomic);
  return amount >= MIN_BOUNTY && amount <= MAX_BOUNTY;
}

function looksRelevant(task) {
  const text = `${task.title || ""}\n${task.description || ""}\n${task.expected_output || ""}`.toLowerCase();
  const positive = /(vendor|supplier|procurement|due diligence|security review|security questionnaire|compliance|soc ?2|iso ?27001|risk assessment|third[- ]party risk|website audit|document analysis|privacy|data protection)/i;
  const negative = /(penetration test|exploit|malware|credential|password|private key|unauthorized access|bypass|phishing)/i;
  return positive.test(text) && !negative.test(text);
}

async function fetchPublicEvidence(url) {
  try {
    const u = new URL(url);
    if (!["http:", "https:"].includes(u.protocol)) return "";
    const r = await fetch(u, { redirect: "follow", signal: AbortSignal.timeout(7000), headers: { "user-agent": "VendorIntelligenceAgent/1.3" } });
    if (!r.ok) return `HTTP status ${r.status}`;
    const html = (await r.text()).slice(0, 120000);
    const title = (html.match(/<title[^>]*>([\\s\\S]*?)<\\/title>/i)?.[1] || "").replace(/<[^>]+>/g, " ").replace(/\\s+/g, " ").trim();
    const text = html.replace(/<(script|style|noscript)[^>]*>[\\s\\S]*?<\\/\\1>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\\s+/g, " ").trim();
    return `URL: ${url}\\nTitle: ${title}\\nPublic page text: ${text.slice(0, 30000)}`;
  } catch (e) {
    return `Public evidence could not be fetched: ${e.message}`;
  }
}

async function makeDeliverable(task) {
  const source = `${task.title || ""}\\n${task.description || ""}\\n${task.expected_output || ""}`;
  const url = source.match(/https?:\\/\\/[^\\s)]+/i)?.[0] || "";
  const evidence = url ? await fetchPublicEvidence(url) : source;
  const report = assessEvidence({ vendorUrl: url, evidence, notes: source });
  return {
    task: task.task_id,
    title: task.title,
    service: "Vendor Intelligence Agent",
    generatedAt: new Date().toISOString(),
    sourceTask: { description: task.description, expectedOutput: task.expected_output || null },
    assessment: report,
    methodology: "Evidence-first first-pass triage; unknown means unverified, not absent.",
  };
}

async function ensureRegistered() {
  try {
    await client.getAgent(agentId);
    console.log(`[basedagents] registered as ${agentId}`);
  } catch {
    const agent = await client.register(kp, {
      name: "Vendor Intelligence Agent",
      description: "Evidence-first vendor due diligence, public-site security preflight and supplier-risk triage.",
      capabilities: ["research", "data", "security-review", "vendor-risk", "document-analysis", "procurement"],
      protocols: ["https", "mcp", "x402"],
      contact_endpoint: process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL.replace(/\\/$/, "")}/health` : undefined,
      version: "1.3.0",
      skills: [{ name: "basedagents", registry: "npm" }, { name: "x402", registry: "npm" }],
    });
    console.log(`[basedagents] registered ${agent.agent_id}`);
  }
  try {
    await client.updateWallet(kp, { wallet_address: WALLET, wallet_network: "eip155:8453" });
    console.log(`[basedagents] payout wallet set to ${WALLET}`);
  } catch (e) {
    console.warn(`[basedagents] wallet setup failed: ${e.message}`);
  }
}

async function workOnce() {
  const { tasks } = await client.getTasks({ status: "open", limit: 100 });
  const candidates = tasks.filter(t => bountyIsWorthIt(t) && looksRelevant(t));
  for (const task of candidates) {
    try {
      await client.claimTask(kp, task.task_id);
      console.log(`[basedagents] claimed ${task.task_id} (${task.bounty?.amount_display || ""} USDC): ${task.title}`);
      const deliverable = await makeDeliverable(task);
      const receipt = await client.deliverTask(kp, task.task_id, {
        submission_type: "json",
        submission_content: JSON.stringify(deliverable),
        summary: `Delivered evidence-first vendor/security assessment for: ${task.title}`,
      });
      console.log(`[basedagents] delivered ${task.task_id}; receipt=${receipt.receipt_id || "created"}`);
      return;
    } catch (e) {
      console.warn(`[basedagents] skipped ${task.task_id}: ${e.message}`);
    }
  }
}

async function main() {
  try { await ensureRegistered(); } catch (e) { console.error(`[basedagents] setup error: ${e.message}`); }
  while (true) {
    try { await workOnce(); } catch (e) { console.error(`[basedagents] poll error: ${e.message}`); }
    await new Promise(r => setTimeout(r, POLL_MS));
  }
}

main();
