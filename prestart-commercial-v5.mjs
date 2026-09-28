import fs from "node:fs";

const file = "server.js";
let source = fs.readFileSync(file, "utf8");

// Keep the existing product and routes intact; improve only the public commercial presentation.
const replacements = [
  ["Agent Web & Security Intelligence", "Vendor Intelligence Agent"],
  ["AI agents structured web and security signals without subscriptions, dashboards or manual procurement.", "Give procurement, security and compliance workflows structured vendor evidence without adding another dashboard or subscription."],
  ["Useful intelligence, delivered as an API.", "Know what is missing before you approve a vendor."],
  ["Explore paid endpoints", "Explore vendor intelligence APIs"],
  ["Webpage Extractor", "Web Evidence Extractor"],
  ["Turn a public webpage into clean text, metadata, headings and links for downstream agent reasoning.", "Turn a public vendor webpage into clean text, metadata, headings and links for downstream review and agent reasoning."],
  ["Vendor Security Preflight", "Vendor Risk Preflight"],
  ["Combine public security signals into a structured procurement-ready risk signal and explicit gaps.", "Turn observable public-site signals into a structured first-pass vendor-risk view with explicit gaps and follow-up questions."],
  ["Business Document Analyzer", "Business Evidence Analyzer"],
  ["Extract obligations, dates, amounts, security signals, missing areas and risk flags from business text.", "Extract obligations, dates, monetary commitments, security signals, missing areas and risk flags from business documents."],
  ["$0.05 / request", "$0.025 / request"],
  ["$0.01 / request</span><div><span class=\"tag\">contracts", "$0.005 / request</span><div><span class=\"tag\">contracts"],
  ["$0.01 / request</span><div><span class=\"tag\">security", "$0.01 / request</span><div><span class=\"tag\">security"],
  ["Payments are settled directly to the configured receiving wallet. No subscription is required.", "Pay only for the capability you call. For larger workflows, use the fixed-scope vendor review or team pilot."],
  ["Public-site checks are signals, not penetration tests or certifications. Results should be validated against the buyer's own requirements.", "FIRST-PASS DUE DILIGENCE · Not a penetration test, certification, legal opinion or final procurement decision. Material findings should be verified by the responsible team."]
];
for (const [from, to] of replacements) source = source.split(from).join(to);

// Add a concise buyer-facing proof strip once, immediately before the footer section.
if (!source.includes("id=\"proof\"")) {
  const anchor = '<section class="section"><h2>Example request</h2>';
  const proof = '<section id="proof" class="section"><div class="grid"><article class="card"><h2>What you get</h2><p>Evidence collected into a repeatable first-pass review: observations, gaps, dates, commitments and next questions.</p></article><article class="card"><h2>Who it is for</h2><p>Procurement, security and compliance teams reviewing software vendors and suppliers.</p></article></div></section>\n';
  source = source.replace(anchor, proof + anchor);
}

fs.writeFileSync(file, source);
console.log("Commercial prestart v5: OK");
