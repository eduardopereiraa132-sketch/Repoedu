import express from "express";
import dns from "node:dns/promises";
import net from "node:net";
import { paymentMiddleware } from "@x402/express";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { bazaarResourceServerExtension, declareDiscoveryExtension } from "@x402/extensions/bazaar";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "2mb" }));

const payTo = process.env.PAY_TO || "0x031a713863890eb611776aadd48397873ed153ab";
const network = process.env.NETWORK || "eip155:8453";
const price = process.env.PRICE || "$0.005";
const sitePrice = process.env.SITE_PRICE || "$0.01";
const documentPrice = process.env.DOCUMENT_PRICE || price;
const facilitatorUrl = process.env.FACILITATOR_URL || "https://facilitator.xpay.sh";
const publicUrl = (process.env.PUBLIC_URL || "https://repoedu-1.onrender.com").replace(/\/$/, "");

const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl });
const x402Server = new x402ResourceServer(facilitatorClient)
  .register(network, new ExactEvmScheme())
  .registerExtension(bazaarResourceServerExtension);

const inputSchema = {
  type: "object", properties: { text: { type: "string", description: "Business document text, maximum 50,000 characters." } }, required: ["text"]
};
const outputSchema = {
  type: "object",
  properties: {
    service:{type:"string"},wordCount:{type:"integer"},characterCount:{type:"integer"},
    dates:{type:"array",items:{type:"string"}},monetaryAmounts:{type:"array",items:{type:"string"}},
    obligations:{type:"array",items:{type:"string"}},securitySignals:{type:"array",items:{type:"string"}},
    missingAreas:{type:"array",items:{type:"string"}},riskFlags:{type:"array",items:{type:"string"}}
  },
  required:["service","wordCount","characterCount","dates","monetaryAmounts","obligations","securitySignals","missingAreas","riskFlags"]
};
const siteAuditInputSchema={type:"object",properties:{url:{type:"string",description:"Public http or https website URL."}},required:["url"]};
const webExtractInputSchema={type:"object",properties:{url:{type:"string",description:"Public http or https webpage URL."}},required:["url"]};
const webExtractOutputSchema={type:"object",properties:{service:{type:"string"},url:{type:"string"},finalUrl:{type:"string"},status:{type:"integer"},contentType:{type:"string"},title:{type:"string"},description:{type:"string"},text:{type:"string"},links:{type:"array",items:{type:"object"}},wordCount:{type:"integer"},truncated:{type:"boolean"}},required:["service","url","finalUrl","status","contentType","title","description","text","links","wordCount","truncated"]};
const siteAuditOutputSchema={
  type:"object",properties:{
    service:{type:"string"},url:{type:"string"},finalUrl:{type:"string"},status:{type:"integer"},
    contentType:{type:"string"},responseTimeMs:{type:"integer"},title:{type:"string"},https:{type:"boolean"},
    securityHeaders:{type:"object"},cookieSecurity:{type:"object"},exposedServerHeader:{type:"boolean"},
    robotsTxt:{type:"object"},securityTxt:{type:"object"},findings:{type:"array",items:{type:"string"}}
  },
  required:["service","url","finalUrl","status","contentType","responseTimeMs","title","https","securityHeaders","cookieSecurity","exposedServerHeader","robotsTxt","securityTxt","findings"]
};

function isPrivateIPv4(ip){
  const p=ip.split(".").map(Number);
  return p.length===4&&(p[0]===10||p[0]===127||p[0]===0||(p[0]===169&&p[1]===254)||(p[0]===172&&p[1]>=16&&p[1]<=31)||(p[0]===192&&p[1]===168));
}
function validatePublicUrl(raw){
  try{
    const u=new URL(raw);
    if(!["http:","https:"].includes(u.protocol))return null;
    const host=u.hostname.toLowerCase().replace(/^\[|\]$/g,"");
    if(host==="localhost"||host.endsWith(".localhost")||host.endsWith(".local"))return null;
    const ipType=net.isIP(host);
    if(ipType===6)return null;
    if(ipType===4&&isPrivateIPv4(host))return null;
    if(u.username||u.password)return null;
    return u;
  }catch{return null;}
}
async function resolvePublicHost(url){
  const host=url.hostname;
  if(net.isIP(host))return !isPrivateIPv4(host);
  const addresses=await dns.lookup(host,{all:true,verbatim:true});
  if(!addresses.length)return false;
  return addresses.every(({address,family})=>(family===4&&!isPrivateIPv4(address))||family===6);
}
async function fetchPublic(rawUrl,maxRedirects=4){
  let current=validatePublicUrl(rawUrl);
  if(!current)throw new Error("url must be a public http or https URL");
  for(let hop=0;hop<=maxRedirects;hop++){
    if(!(await resolvePublicHost(current)))throw new Error("target resolves to a private or local address");
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),8000);
    try{
      const response=await fetch(current.toString(),{signal:controller.signal,redirect:"manual",headers:{"user-agent":"AgentSecurityPreflight/3.0"}});
      if(![301,302,303,307,308].includes(response.status))return response;
      const location=response.headers.get("location");
      if(!location)return response;
      const next=validatePublicUrl(new URL(location,current).toString());
      if(!next)throw new Error("redirect target is not public");
      current=next;
    }finally{clearTimeout(timer);}
  }
  throw new Error("too many redirects");
}
async function readLimitedText(response,maxBytes=100000){
  if(response.body&&typeof response.body.getReader==="function"){
    const reader=response.body.getReader(),chunks=[];let total=0;
    while(total<maxBytes){
      const {done,value}=await reader.read();
      if(done)break;
      const remaining=maxBytes-total;
      const part=value.byteLength>remaining?value.subarray(0,remaining):value;
      chunks.push(part);total+=part.byteLength;
      if(value.byteLength>remaining){await reader.cancel();break;}
    }
    return new TextDecoder().decode(Buffer.concat(chunks));
  }
  return (await response.text()).slice(0,maxBytes);
}
function htmlToText(html){
  return html.replace(/<(script|style|noscript|template|svg)[^>]*>[\\s\\S]*?<\\/\\1>/gi," ")
    .replace(/<\\/(p|div|section|article|li|h[1-6]|tr|td|main|header|footer)>/gi,"\\n")
    .replace(/<[^>]+>/g," ")
    .replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&quot;/gi,'\"').replace(/&#39;/gi,"'")
    .replace(/\\s+/g," ").trim();
}
function extractLinks(html,baseUrl){
  const out=[];const seen=new Set();const re=/<a\\b[^>]*href=["']([^"']+)["'][^>]*>([\\s\\S]*?)<\\/a>/gi;let m;
  while((m=re.exec(html))&&out.length<100){
    try{const href=new URL(m[1],baseUrl);if(!["http:","https:"].includes(href.protocol))continue;const url=href.toString();if(seen.has(url))continue;seen.add(url);out.push({url,text:htmlToText(m[2]).slice(0,160)});}catch{}
  } return out;
}
async function extractWebpage(raw){
  const first=validatePublicUrl(raw);if(!first)throw new Error("url must be a public http or https URL");
  const response=await fetchPublic(first.toString());const finalUrl=response.url||first.toString();
  if(!validatePublicUrl(finalUrl))throw new Error("final URL is not public");
  const contentType=response.headers.get("content-type")||"";
  if(!contentType.toLowerCase().includes("text/html"))throw new Error("target is not an HTML page");
  const html=await readLimitedText(response,180000);
  const title=(html.match(/<title[^>]*>([\\s\\S]*?)<\\/title>/i)?.[1]||"").replace(/<[^>]+>/g," ").replace(/\\s+/g," ").trim().slice(0,300);
  const description=(html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1]||html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)?.[1]||"").trim().slice(0,500);
  const rawText=htmlToText(html);const maxText=30000;const text=rawText.slice(0,maxText);
  return {service:"Webpage Extractor",url:first.toString(),finalUrl,status:response.status,contentType,title,description,text,links:extractLinks(html,finalUrl),wordCount:text.split(/\\s+/).filter(Boolean).length,truncated:rawText.length>maxText};
}
async function auditSite(raw){
  const first=validatePublicUrl(raw);
  if(!first)throw new Error("url must be a public http or https URL");
  const start=Date.now();
  const response=await fetchPublic(first.toString());
  const finalUrl=response.url||first.toString(),final=validatePublicUrl(finalUrl);
  if(!final)throw new Error("final URL is not public");
  const headers=response.headers,contentType=headers.get("content-type")||"",body=await readLimitedText(response);
  const securityHeaders={
    strictTransportSecurity:!!headers.get("strict-transport-security"),
    contentSecurityPolicy:!!headers.get("content-security-policy"),
    xContentTypeOptions:!!headers.get("x-content-type-options"),
    xFrameOptions:!!headers.get("x-frame-options"),
    referrerPolicy:!!headers.get("referrer-policy"),
    permissionsPolicy:!!headers.get("permissions-policy")
  };
  const cookies=typeof headers.getSetCookie==="function"?headers.getSetCookie():[];
  const cookieSecurity={
    cookiesSeen:cookies.length,secure:cookies.filter(x=>/\bsecure\b/i.test(x)).length,
    httpOnly:cookies.filter(x=>/\bhttponly\b/i.test(x)).length,sameSite:cookies.filter(x=>/\bsamesite=/i.test(x)).length
  };
  const title=(body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||"").replace(/\s+/g," ").trim().slice(0,300);
  const origin=final.origin;
  const [robots,securityTxt]=await Promise.all([fetchPublic(origin+"/robots.txt").catch(()=>null),fetchPublic(origin+"/.well-known/security.txt").catch(()=>null)]);
  const findings=[];
  if(final.protocol==="https:"&&!securityHeaders.strictTransportSecurity)findings.push("Strict-Transport-Security not observed");
  if(!securityHeaders.contentSecurityPolicy)findings.push("Content-Security-Policy not observed");
  if(!securityHeaders.xContentTypeOptions)findings.push("X-Content-Type-Options not observed");
  if(!securityHeaders.referrerPolicy)findings.push("Referrer-Policy not observed");
  if(!securityHeaders.permissionsPolicy)findings.push("Permissions-Policy not observed");
  if(cookies.some(x=>!/\bsecure\b/i.test(x)))findings.push("Cookie without Secure observed");
  if(cookies.some(x=>!/\bhttponly\b/i.test(x)))findings.push("Cookie without HttpOnly observed");
  if(cookies.some(x=>!/\bsamesite=/i.test(x)))findings.push("Cookie without SameSite observed");
  if(headers.get("server"))findings.push("Server header exposed");
  if(!robots?.ok)findings.push("robots.txt not observed");
  if(!securityTxt?.ok)findings.push("security.txt not observed");
  return {
    service:"Website Security Preflight",url:first.toString(),finalUrl:final.toString(),status:response.status,contentType,
    responseTimeMs:Date.now()-start,title,https:final.protocol==="https:",securityHeaders,cookieSecurity,
    exposedServerHeader:!!headers.get("server"),robotsTxt:{exists:!!robots?.ok,status:robots?.status||0},
    securityTxt:{exists:!!securityTxt?.ok,status:securityTxt?.status||0},findings:[...new Set(findings)]
  };
}

const routes={
  "POST /web-extract":{
    accepts:{scheme:"exact",price,network,payTo},
    resource:{url:publicUrl+"/web-extract",description:"Fast machine-readable webpage extraction for AI agents: title, description, clean text and links from a public URL.",mimeType:"application/json",serviceName:"Webpage Extractor",tags:["web","extraction","scraping","research","content"],iconUrl:publicUrl+"/icon.svg"},
    description:"Paid webpage extraction. Send JSON {url:string}. Returns clean text and links for downstream agent reasoning.",mimeType:"application/json",
    extensions:{...declareDiscoveryExtension({
      input:{url:"https://example.com"},inputSchema:webExtractInputSchema,bodyType:"json",
      output:{example:{service:"Webpage Extractor",url:"https://example.com",finalUrl:"https://example.com/",status:200,contentType:"text/html",title:"Example Domain",description:"Example Domain",text:"Example Domain This domain is for use in illustrative examples.",links:[],wordCount:10,truncated:false},schema:webExtractOutputSchema}
    })}
  },
  "POST /site-audit":{
    accepts:{scheme:"exact",price,network,payTo},
    resource:{url:publicUrl+"/site-audit",description:"Live public website security preflight for AI-agent vendor and compliance workflows.",mimeType:"application/json",serviceName:"Website Security Preflight",tags:["security","website","compliance","vendor-risk","audit"],iconUrl:publicUrl+"/icon.svg"},
    description:"Paid live website security preflight. Send JSON {url:string}.",mimeType:"application/json",
    extensions:{...declareDiscoveryExtension({
      input:{url:"https://example.com"},inputSchema:siteAuditInputSchema,bodyType:"json",
      output:{example:{service:"Website Security Preflight",url:"https://example.com",finalUrl:"https://example.com/",status:200,contentType:"text/html",responseTimeMs:180,title:"Example Domain",https:true,securityHeaders:{strictTransportSecurity:true,contentSecurityPolicy:false,xContentTypeOptions:true,xFrameOptions:false,referrerPolicy:true,permissionsPolicy:false},cookieSecurity:{cookiesSeen:0,secure:0,httpOnly:0,sameSite:0},exposedServerHeader:false,robotsTxt:{exists:true,status:200},securityTxt:{exists:false,status:404},findings:["Content-Security-Policy not observed"]},schema:siteAuditOutputSchema}
    })}
  },
  "POST /analyze":{
    accepts:{scheme:"exact",price,network,payTo},
    resource:{url:publicUrl+"/analyze",description:"Analyze business documents for obligations, dates, monetary amounts, security signals, missing control areas and risk flags.",mimeType:"application/json",serviceName:"Business Document Analyzer",tags:["documents","compliance","contracts","security","risk"],iconUrl:publicUrl+"/icon.svg"},
    description:"Paid business-document analysis. Send JSON {text:string}. Response is structured for machine consumption.",mimeType:"application/json",
    extensions:{...declareDiscoveryExtension({
      input:{text:"Supplier must provide incident notification within 24 hours. Contract expires on 30/11/2026."},inputSchema,bodyType:"json",
      output:{example:{service:"Business Document Analyzer",wordCount:13,characterCount:105,dates:["30/11/2026","24 hours"],monetaryAmounts:[],obligations:["Supplier must provide incident notification within 24 hours."],securitySignals:["incident notification"],missingAreas:["access control","data retention"],riskFlags:["deadline/obligation detected"]},schema:outputSchema}
    })}
  }
};
app.use(paymentMiddleware(routes,x402Server));

app.post("/web-extract",async(req,res)=>{try{res.json(await extractWebpage(String(req.body?.url||"").trim()));}catch(e){res.status(400).json({error:e?.name==="AbortError"?"target timed out":e?.message||"unable to extract webpage"});}});
app.get("/icon.svg",(_req,res)=>res.type("image/svg+xml").send('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="24" fill="#111827"/><path d="M35 25h58v16H51v17h35v15H51v30H35z" fill="#fff"/><path d="M72 73h21v30H72z" fill="#60a5fa"/></svg>'));

app.get("/",(_req,res)=>{
  const html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Agent Security & Document Intelligence</title><meta name="description" content="Pay-per-call x402 APIs for AI agents: website security preflight and business document analysis."><link rel="icon" href="/icon.svg"></head><body style="font-family:system-ui,sans-serif;max-width:900px;margin:60px auto;padding:0 24px;color:#111827"><h1>Agent Security & Document Intelligence</h1><p>Machine-readable, pay-per-call APIs for AI agents and automation. x402 + USDC on Base Mainnet.</p><div style="display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))"><section style="border:1px solid #ddd;border-radius:16px;padding:22px"><h2>Website Security Preflight</h2><p>Fresh public-site signals for vendor-risk and compliance workflows.</p><code>POST /site-audit</code><p><strong>'+price+' USDC/request</strong></p><a href="/openapi.json">OpenAPI</a> · <a href="/skill.md">Agent skill</a></section><section style="border:1px solid #ddd;border-radius:16px;padding:22px"><h2>Business Document Analyzer</h2><p>Structured dates, obligations, money, security signals and gaps.</p><code>POST /analyze</code><p><strong>'+price+' USDC/request</strong></p><a href="/openapi.json">OpenAPI</a> · <a href="/llms.txt">LLMs.txt</a></section></div><h2>Payment</h2><p>Network: '+network+'<br>Payee: <code>'+payTo+'</code><br>Protocol: x402 v2 exact</p><p><a href="/.well-known/x402">x402 metadata</a> · <a href="/health">health</a></p></body></html>';
  res.type("html").send(html);
});
app.get("/health",(_req,res)=>res.json({ok:true,service:"agent-security-document-intelligence",network,price,facilitator:facilitatorUrl}));
app.get("/.well-known/x402",(_req,res)=>res.json({
  x402Version:2,service:"Agent Security & Document Intelligence",
  endpoints:[
    {method:"POST",path:"/site-audit",url:publicUrl+"/site-audit",price,network,asset:"USDC",payTo,contentType:"application/json"},
    {method:"POST",path:"/analyze",url:publicUrl+"/analyze",price,network,asset:"USDC",payTo,contentType:"application/json"}
  ],
  discovery:{protocol:"x402-bazaar",resources:[publicUrl+"/site-audit",publicUrl+"/analyze"]},
  docs:publicUrl+"/openapi.json",llms:publicUrl+"/llms.txt",skill:publicUrl+"/skill.md"
}));
app.get("/.well-known/ai-plugin.json",(_req,res)=>res.json({
  schema_version:"v1",name_for_human:"Agent Security & Document Intelligence",name_for_model:"agent_security_document_intelligence",
  description_for_model:"Pay-per-call x402 APIs for website security preflight and structured business document analysis.",
  api:{type:"openapi",url:publicUrl+"/openapi.json"},auth:{type:"x402",network,asset:"USDC",price,payTo},
  endpoints:{siteAudit:publicUrl+"/site-audit",analyze:publicUrl+"/analyze",x402:publicUrl+"/.well-known/x402",llms:publicUrl+"/llms.txt",skill:publicUrl+"/skill.md"}
}));
app.get("/skill.md",(_req,res)=>res.type("text/markdown").send([
  "# Agent Security & Document Intelligence","","Pay-per-call x402 APIs for AI agents.","",
  "## Website Security Preflight","POST "+publicUrl+"/site-audit","Price: "+price+" USDC. Network: Base Mainnet (eip155:8453). Payee: "+payTo,
  'Input: {"url":"https://example.com"}',"Returns live public-site signals: status, final URL, response time, HTTPS, security headers, cookie flags, Server disclosure, robots.txt, security.txt, title and findings.","",
  "## Business Document Analyzer","POST "+publicUrl+"/analyze","Price: "+price+" USDC. Network: Base Mainnet (eip155:8453). Payee: "+payTo,
  'Input: {"text":"business document text"}',"Returns structured dates, monetary amounts, obligations, security signals, missing areas and risk flags.","",
  "## Discovery","- "+publicUrl+"/.well-known/x402","- "+publicUrl+"/.well-known/ai-plugin.json","- "+publicUrl+"/openapi.json","- "+publicUrl+"/llms.txt","",
  "Unpaid POST requests return HTTP 402 with x402 payment requirements."
].join("\n")));
app.get("/llms.txt",(_req,res)=>res.type("text/plain").send([
  "# Agent Security & Document Intelligence","","Paid x402 APIs for AI agents on Base Mainnet.","",
  "## Website Security Preflight","POST "+publicUrl+"/site-audit","Price: "+price+" USDC",'Input: {"url":"https://example.com"}',"Purpose: live public website security preflight.","",
  "## Business Document Analyzer","POST "+publicUrl+"/analyze","Price: "+price+" USDC",'Input: {"text":"string"}',"Purpose: deterministic structured extraction from business documents.","",
  "## Payment","x402 v2, exact scheme, eip155:8453, USDC.","Payee: "+payTo,"",
  "## Discovery",publicUrl+"/.well-known/x402",publicUrl+"/.well-known/ai-plugin.json",publicUrl+"/openapi.json",publicUrl+"/skill.md"
].join("\n")));
app.get("/robots.txt",(_req,res)=>res.type("text/plain").send("User-agent: *\nAllow: /\nSitemap: "+publicUrl+"/sitemap.xml\n"));
app.get("/sitemap.xml",(_req,res)=>res.type("application/xml").send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>'+publicUrl+'/</loc></url><url><loc>'+publicUrl+'/openapi.json</loc></url><url><loc>'+publicUrl+'/skill.md</loc></url><url><loc>'+publicUrl+'/llms.txt</loc></url><url><loc>'+publicUrl+'/.well-known/x402</loc></url></urlset>'));

app.get("/openapi.json",(_req,res)=>res.json({
  openapi:"3.1.0",info:{title:"Agent Security & Document Intelligence",version:"2.0.0",description:"Pay-per-call x402 APIs for AI agents."},servers:[{url:publicUrl}],
  paths:{
    "/site-audit":{post:{summary:"Website Security Preflight",requestBody:{required:true,content:{"application/json":{schema:siteAuditInputSchema}}},responses:{"200":{description:"Live public website security signals",content:{"application/json":{schema:siteAuditOutputSchema}}},"402":{description:"x402 payment required"}}}},
    "/analyze":{post:{summary:"Business Document Analyzer",requestBody:{required:true,content:{"application/json":{schema:inputSchema}}},responses:{"200":{description:"Structured document signals",content:{"application/json":{schema:outputSchema}}},"402":{description:"x402 payment required"}}}}
  }
}));

function unique(values){return [...new Set(values)];}
function extract(text){
  const sentences=text.replace(/\s+/g," ").split(/(?<=[.!?])\s+/).map(s=>s.trim()).filter(Boolean);
  const dates=unique([...(text.match(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g)||[]),...(text.match(/\b\d{1,3}\s+(?:days?|d[ií]as?|hours?|horas?|months?|meses?|years?|a[nñ]os?)\b/gi)||[])]);
  const monetaryAmounts=unique(text.match(/(?:USD|US\$|U\$S|EUR|€|\$)\s?\d[\d.,]*/gi)||[]);
  const obligationPattern=/\b(must|shall|required to|will|debe|deber[aá]|deber[aá]n|obligaci[oó]n|deber[aá] cumplir|es obligatorio)\b/i;
  const obligations=sentences.filter(s=>obligationPattern.test(s)).slice(0,20);
  const signalTerms=["security","seguridad","privacy","privacidad","personal data","datos personales","access control","control de acceso","incident","incidente","breach","brecha","encryption","cifrado","backup","respaldo","retention","retención","audit","auditoría"];
  const securitySignals=signalTerms.filter(term=>new RegExp(term,"i").test(text));
  const expectedAreas=[["access control",/access control|control de acceso/i],["incident handling",/incident|incidente|breach|brecha/i],["data protection",/personal data|datos personales|privacy|privacidad/i],["retention",/retention|retención/i],["audit/evidence",/audit|auditor[ií]a|evidence|evidencia/i]];
  const missingAreas=expectedAreas.filter(([,pattern])=>!pattern.test(text)).map(([name])=>name);
  const riskFlags=[];
  if(obligations.length)riskFlags.push("obligations detected");
  if(dates.length)riskFlags.push("deadlines or time periods detected");
  if(missingAreas.length>=3)riskFlags.push("several expected control areas are not mentioned");
  if(/penalt(y|ies)|penalidad|multa|indemniz/i.test(text))riskFlags.push("penalty or indemnity language detected");
  return {service:"Business Document Analyzer",wordCount:text.split(/\s+/).filter(Boolean).length,characterCount:text.length,dates,monetaryAmounts,obligations,securitySignals,missingAreas,riskFlags};
}
app.post("/site-audit",async(req,res)=>{try{res.json(await auditSite(String(req.body?.url||"").trim()));}catch(e){res.status(400).json({error:e?.name==="AbortError"?"target timed out":e?.message||"unable to audit target"});}});
app.post("/analyze",(req,res)=>{
  const text=String(req.body?.text||"").trim();
  if(!text)return res.status(400).json({error:"Provide JSON {text:string}"});
  if(text.length>50000)return res.status(413).json({error:"text exceeds the 50,000 character limit"});
  res.json(extract(text));
});
const port=Number(process.env.PORT||10000);
app.listen(port,"0.0.0.0",()=>console.log("x402 service listening on "+port));
