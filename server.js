import express from "express";
import fs from "node:fs";
import { assessEvidence } from "./assessment-engine.mjs";
import { initStorage, saveAssessment, saveLead, getAssessment, storageConfigured } from "./storage.mjs";
import { renderReport } from "./report.mjs";
import dns from "node:dns/promises";
import net from "node:net";
import { paymentMiddleware } from "@x402/express";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { bazaarResourceServerExtension, declareDiscoveryExtension } from "@x402/extensions/bazaar";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false }));
app.use((req,res,next)=>{
  const origin=req.headers.origin;
  if(origin && origin===publicSiteUrl){
    res.setHeader("Access-Control-Allow-Origin",origin);
    res.setHeader("Vary","Origin");
    res.setHeader("Access-Control-Allow-Methods","GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers","content-type,payment-signature,x-payment,idempotency-key");
    res.setHeader("Access-Control-Expose-Headers","payment-required,payment-response");
  }
  if(req.method==="OPTIONS") return res.sendStatus(204);
  next();
});
app.use((req,res,next)=>{
  res.setHeader("X-Content-Type-Options","nosniff");
  res.setHeader("X-Frame-Options","DENY");
  res.setHeader("Referrer-Policy","no-referrer");
  res.setHeader("Permissions-Policy","camera=(), microphone=(), geolocation=()");
  res.setHeader("Strict-Transport-Security","max-age=31536000; includeSubDomains");
  next();
});

const payTo = process.env.PAY_TO || "0x031a713863890eb611776aadd48397873ed153ab";
const network = process.env.NETWORK || "eip155:8453";
const price = process.env.PRICE || "$0.005";
const sitePrice = process.env.SITE_PRICE || "$0.01";
const documentPrice = process.env.DOCUMENT_PRICE || "$0.01";
const vendorPrice = process.env.VENDOR_PRICE || "$0.025";
const pilotPrice = process.env.PILOT_PRICE || "$495";
const facilitatorUrl = process.env.FACILITATOR_URL || "https://api.cdp.coinbase.com/platform/v2/x402";
const publicUrl = (process.env.PUBLIC_URL || "https://repoedu.onrender.com").replace(/\/$/, "");
const publicSiteUrl = (process.env.PUBLIC_SITE_URL || "https://repoedu.onrender.com").replace(/\/$/, "");
const version = "3.3.0";
const CACHE_TTL_MS = 120000;
const extractionCache = new Map();

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
const webExtractOutputSchema={type:"object",properties:{service:{type:"string"},url:{type:"string"},finalUrl:{type:"string"},status:{type:"integer"},contentType:{type:"string"},title:{type:"string"},description:{type:"string"},canonical:{type:"string"},language:{type:"string"},openGraph:{type:"object"},headings:{type:"array",items:{type:"string"}},text:{type:"string"},links:{type:"array",items:{type:"object"}},wordCount:{type:"integer"},truncated:{type:"boolean"},responseTimeMs:{type:"integer"},cacheHit:{type:"boolean"}},required:["service","url","finalUrl","status","contentType","title","description","canonical","language","openGraph","headings","text","links","wordCount","truncated","responseTimeMs","cacheHit"]};
const vendorPreflightInputSchema={type:"object",properties:{url:{type:"string",description:"Public vendor website URL."},requirements:{type:"array",items:{type:"string"},description:"Optional security requirements to check against public-site signals."}},required:["url"]};
const vendorPreflightOutputSchema={type:"object",properties:{schemaVersion:{type:"string"},service:{type:"string"},checkedAt:{type:"string"},url:{type:"string"},finalUrl:{type:"string"},status:{type:"integer"},https:{type:"boolean"},publicSignalLevel:{type:"string"},riskLevel:{type:"string"},riskLevelInterpretation:{type:"string"},pageTitle:{type:"string"},responseTimeMs:{type:"integer"},checks:{type:"array",items:{type:"object"}},coverage:{type:"object"},gaps:{type:"array",items:{type:"string"}},unverifiableRequirements:{type:"array",items:{type:"string"}},disclosureSignals:{type:"array",items:{type:"object"}},evidencePages:{type:"array",items:{type:"object"}},nextQuestions:{type:"array",items:{type:"string"}},summary:{type:"string"},limitations:{type:"array",items:{type:"string"}}},required:["schemaVersion","service","checkedAt","url","finalUrl","status","https","publicSignalLevel","riskLevel","riskLevelInterpretation","pageTitle","responseTimeMs","checks","coverage","gaps","unverifiableRequirements","disclosureSignals","evidencePages","nextQuestions","summary","limitations"]};
const siteAuditOutputSchema={
  type:"object",properties:{
    service:{type:"string"},url:{type:"string"},finalUrl:{type:"string"},status:{type:"integer"},
    contentType:{type:"string"},responseTimeMs:{type:"integer"},title:{type:"string"},https:{type:"boolean"},
    securityHeaders:{type:"object"},cookieSecurity:{type:"object"},exposedServerHeader:{type:"boolean"},
    robotsTxt:{type:"object"},securityTxt:{type:"object"},findings:{type:"array",items:{type:"string"}}
  },
  required:["service","url","finalUrl","status","contentType","responseTimeMs","title","https","securityHeaders","cookieSecurity","exposedServerHeader","robotsTxt","securityTxt","findings"]
};

function isPrivateIPv6(ip){const v=ip.toLowerCase().replace(/^\[|\]$/g,"");return v==="::"||v==="::1"||v.startsWith("fc")||v.startsWith("fd")||v.startsWith("fe8")||v.startsWith("fe9")||v.startsWith("fea")||v.startsWith("feb")||v.startsWith("ff");}
function isPrivateIPv4(ip){
  const p=ip.split(".").map(Number);
  if(p.length!==4||p.some(n=>!Number.isInteger(n)||n<0||n>255))return true;
  const [a,b,c]=p;
  return a===0||a===10||a===127||a>=224||
    (a===100&&b>=64&&b<=127)||
    (a===169&&b===254)||
    (a===172&&b>=16&&b<=31)||
    (a===192&&(b===0||b===2||b===168))||
    (a===198&&(b===18||b===19||b===51))||
    (a===203&&b===0&&c===113);
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
  return addresses.every(({address,family})=>(family===4&&!isPrivateIPv4(address))||(family===6&&!isPrivateIPv6(address)));
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
  return html.replace(/<(script|style|noscript|template|svg)[^>]*>[\s\S]*?<\/\1>/gi," ")
    .replace(/<\/(p|div|section|article|li|h[1-6]|tr|td|main|header|footer)>/gi,"\n")
    .replace(/<[^>]+>/g," ")
    .replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&quot;/gi,'\"').replace(/&#39;/gi,"'")
    .replace(/\s+/g," ").trim();
}
function extractLinks(html,baseUrl){
  const out=[];const seen=new Set();const re=/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;let m;
  while((m=re.exec(html))&&out.length<100){
    try{const href=new URL(m[1],baseUrl);if(!["http:","https:"].includes(href.protocol))continue;const url=href.toString();if(seen.has(url))continue;seen.add(url);out.push({url,text:htmlToText(m[2]).slice(0,160)});}catch{}
  } return out;
}
async function extractWebpage(raw){
  const first=validatePublicUrl(raw);if(!first)throw new Error("url must be a public http or https URL");
  const key=first.toString(),now=Date.now(),cached=extractionCache.get(key);
  if(cached&&cached.expiresAt>now)return {...cached.value,responseTimeMs:0,cacheHit:true};
  if(cached)extractionCache.delete(key);
  const started=Date.now(),response=await fetchPublic(key),finalUrl=response.url||key;
  if(!validatePublicUrl(finalUrl))throw new Error("final URL is not public");
  const contentType=response.headers.get("content-type")||"";
  if(!contentType.toLowerCase().includes("text/html"))throw new Error("target is not an HTML page");
  const html=await readLimitedText(response,180000);
  const title=(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim().slice(0,300);
  const description=(html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1]||html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)?.[1]||"").trim().slice(0,500);
  const canonicalRaw=html.match(/<link[^>]+rel=["'][^"']*canonical[^"']*["'][^>]+href=["']([^"']+)["']/i)?.[1]||html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*canonical[^"']*["']/i)?.[1]||"";
  let canonical="";try{canonical=canonicalRaw?new URL(canonicalRaw,finalUrl).toString():"";}catch{}
  const language=(html.match(/<html[^>]+lang=["']([^"']+)["']/i)?.[1]||"").slice(0,20);
  const og=(name)=>html.match(new RegExp("<meta[^>]+property=[\"']"+name+"[\"'][^>]+content=[\"']([^\"']*)[\"']","i"))?.[1]||html.match(new RegExp("<meta[^>]+content=[\"']([^\"']*)[\"'][^>]+property=[\"']"+name+"[\"']","i"))?.[1]||"";
  const openGraph={title:og("og:title").slice(0,300),description:og("og:description").slice(0,500),image:og("og:image").slice(0,1000)};
  const headings=[];const hr=/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi;let hm;
  while((hm=hr.exec(html))&&headings.length<50){const h=htmlToText(hm[1]).slice(0,300);if(h)headings.push(h);}
  const rawText=htmlToText(html),maxText=30000,text=rawText.slice(0,maxText);
  const value={service:"Webpage Extractor",url:key,finalUrl,status:response.status,contentType,title,description,canonical,language,openGraph,headings,text,links:extractLinks(html,finalUrl),wordCount:text.split(/\s+/).filter(Boolean).length,truncated:rawText.length>maxText};
  extractionCache.set(key,{value,expiresAt:now+CACHE_TTL_MS});
  while(extractionCache.size>500)extractionCache.delete(extractionCache.keys().next().value);
  return {...value,responseTimeMs:Date.now()-started,cacheHit:false};
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


const DISCLOSURE_SIGNALS = [
  {id:"security_assurance", label:"independent security assurance", pattern:/soc\s*2|soc2|iso\s*27001|iso\/iec\s*27001|independent audit|assurance report/i},
  {id:"security_practices", label:"security practices", pattern:/access control|mfa|multi-factor|encryption|vulnerability management|penetration test|security program|security controls/i},
  {id:"incident_response", label:"incident response", pattern:/incident response|security incident|breach notification|incident notification/i},
  {id:"privacy", label:"privacy and data protection", pattern:/privacy policy|data protection|personal data|gdpr|dpa|data processing/i},
  {id:"subprocessors", label:"subprocessor transparency", pattern:/subprocessor|sub-processors|subprocessor list|third[- ]party providers/i},
  {id:"continuity", label:"continuity and recovery", pattern:/business continuity|disaster recovery|recovery point|recovery time|bc\/?dr/i}
];

function disclosureSignalsFromText(text,sourceUrl){
  const out=[];
  for(const topic of DISCLOSURE_SIGNALS){
    if(topic.pattern.test(text||"")){
      out.push({
        id:topic.id,
        topic:topic.label,
        evidenceUrl:sourceUrl,
        observation:"Related public wording was observed.",
        note:"This is evidence discovery, not proof that the underlying control or certification is valid."
      });
    }
  }
  return out;
}

async function vendorPreflight(rawUrl,requirements=[]){
  const started=Date.now();
  const audit=await auditSite(rawUrl);
  let root=null;
  try{root=await extractWebpage(audit.finalUrl);}catch{}

  const rootSignals=disclosureSignalsFromText(root?.text||"",audit.finalUrl);
  const pages=[{
    url:audit.finalUrl,
    title:root?.title||audit.finalUrl,
    status:audit.status,
    signals:rootSignals,
    topics:rootSignals.map(x=>x.topic)
  }];

  const candidateLinks=(root?.links||[])
    .filter(x=>/security|trust|compliance|privacy|subprocessor|soc\s*2|iso\s*27001|incident/i.test((x.text||"")+" "+x.url))
    .map(x=>x.url)
    .filter((u,i,a)=>a.indexOf(u)===i && u!==audit.finalUrl)
    .slice(0,2);

  const extraResults=await Promise.allSettled(candidateLinks.map(u=>extractWebpage(u)));
  for(let i=0;i<extraResults.length;i++){
    const r=extraResults[i];
    if(r.status==="fulfilled"){
      const signals=disclosureSignalsFromText(r.value.text||"",r.value.finalUrl);
      pages.push({
        url:r.value.finalUrl,
        title:r.value.title||r.value.finalUrl,
        status:r.value.status,
        signals,
        topics:signals.map(x=>x.topic)
      });
    }
  }

  const disclosureSignals=[...new Map(pages.flatMap(p=>p.signals).map(x=>[x.id+"|"+x.evidenceUrl,x])).values()];
  const observedAt=new Date().toISOString();
  const baseSource=audit.finalUrl;
  const checks=[
    {id:"https",label:"HTTPS",passed:audit.https,status:audit.https?"observed":"not_observed",detail:audit.https?"HTTPS is enabled":"HTTPS is not enabled",source:baseSource,observedAt},
    {id:"hsts",label:"HSTS",passed:audit.securityHeaders.strictTransportSecurity,status:audit.securityHeaders.strictTransportSecurity?"observed":"not_observed",detail:audit.securityHeaders.strictTransportSecurity?"HSTS observed":"HSTS not observed",source:baseSource,observedAt},
    {id:"csp",label:"Content Security Policy",passed:audit.securityHeaders.contentSecurityPolicy,status:audit.securityHeaders.contentSecurityPolicy?"observed":"not_observed",detail:audit.securityHeaders.contentSecurityPolicy?"CSP observed":"CSP not observed",source:baseSource,observedAt},
    {id:"xcto",label:"X-Content-Type-Options",passed:audit.securityHeaders.xContentTypeOptions,status:audit.securityHeaders.xContentTypeOptions?"observed":"not_observed",detail:audit.securityHeaders.xContentTypeOptions?"Header observed":"Header not observed",source:baseSource,observedAt},
    {id:"frame",label:"Clickjacking protection",passed:audit.securityHeaders.xFrameOptions,status:audit.securityHeaders.xFrameOptions?"observed":"not_observed",detail:audit.securityHeaders.xFrameOptions?"X-Frame-Options observed":"X-Frame-Options not observed",source:baseSource,observedAt},
    {id:"referrer",label:"Referrer Policy",passed:audit.securityHeaders.referrerPolicy,status:audit.securityHeaders.referrerPolicy?"observed":"not_observed",detail:audit.securityHeaders.referrerPolicy?"Header observed":"Header not observed",source:baseSource,observedAt},
    {id:"permissions",label:"Permissions Policy",passed:audit.securityHeaders.permissionsPolicy,status:audit.securityHeaders.permissionsPolicy?"observed":"not_observed",detail:audit.securityHeaders.permissionsPolicy?"Permissions Policy observed":"Permissions Policy not observed",source:baseSource,observedAt},
    {id:"securityTxt",label:"security.txt",passed:audit.securityTxt.exists,status:audit.securityTxt.exists?"observed":"not_observed",detail:audit.securityTxt.exists?"security.txt observed":"security.txt not observed",source:new URL("/.well-known/security.txt",audit.finalUrl).toString(),observedAt},
    {id:"robots",label:"robots.txt",passed:audit.robotsTxt.exists,status:audit.robotsTxt.exists?"observed":"not_observed",detail:audit.robotsTxt.exists?"robots.txt observed":"robots.txt not observed",source:new URL("/robots.txt",audit.finalUrl).toString(),observedAt},
    {id:"server",label:"Server disclosure",passed:!audit.exposedServerHeader,status:!audit.exposedServerHeader?"observed":"not_observed",detail:!audit.exposedServerHeader?"Server header not exposed":"Server header exposed",source:baseSource,observedAt}
  ];

  const reqs=Array.isArray(requirements)?requirements.filter(x=>typeof x==="string"&&x.trim()).slice(0,20):[];
  const unverifiableRequirements=[];
  for(const req of reqs){
    const r=String(req).toLowerCase();
    let match=null;
    if(/https|tls/.test(r))match=checks.find(x=>x.id==="https");
    else if(/hsts|strict transport/.test(r))match=checks.find(x=>x.id==="hsts");
    else if(/content.?security.?policy|csp/.test(r))match=checks.find(x=>x.id==="csp");
    else if(/clickjack|x-frame/.test(r))match=checks.find(x=>x.id==="frame");
    else if(/referrer/.test(r))match=checks.find(x=>x.id==="referrer");
    else if(/permission/.test(r))match=checks.find(x=>x.id==="permissions");
    else if(/security.?txt/.test(r))match=checks.find(x=>x.id==="securityTxt");
    if(match){match.requirement=req;}
    else{unverifiableRequirements.push(req);}
  }

  const core=checks.filter(x=>["https","hsts","csp","xcto","frame","referrer","permissions"].includes(x.id));
  const failedCore=core.filter(x=>!x.passed).length;
  const publicSignalLevel=!audit.https||failedCore>=5?"high":failedCore>=3?"medium":failedCore>=1?"low":"informational";
  const gaps=checks.filter(x=>x.passed===false).map(x=>x.label);
  const coverage={
    observed:checks.filter(x=>x.status==="observed").length,
    notObserved:checks.filter(x=>x.status==="not_observed").length,
    unverifiable:unverifiableRequirements.length,
    totalChecks:checks.length
  };

  const nextQuestions=[];
  if(!disclosureSignals.some(x=>x.id==="security_assurance"))nextQuestions.push("Ask the vendor for current independent security assurance evidence (for example SOC 2 or ISO/IEC 27001) if applicable.");
  if(!disclosureSignals.some(x=>x.id==="incident_response"))nextQuestions.push("Ask how security incidents are handled and what notification commitment applies to the service.");
  if(!disclosureSignals.some(x=>x.id==="privacy"))nextQuestions.push("Ask for the applicable privacy/DPA terms and data-retention or deletion commitments.");
  if(!disclosureSignals.some(x=>x.id==="subprocessors"))nextQuestions.push("Ask for the current subprocessor list and change-notification process.");
  if(!audit.securityHeaders.strictTransportSecurity)nextQuestions.push("Confirm transport-security controls and supported TLS configuration.");
  for(const req of unverifiableRequirements)nextQuestions.push("Request evidence for the requirement: "+req);

  const summary = "Observed " + coverage.observed + "/" + coverage.totalChecks + " public-site checks. " + gaps.length + " checks were not observed; " + unverifiableRequirements.length + " requested requirements were not verifiable by this public preflight.";

  return {
    schemaVersion:"2.0",
    service:"Vendor Security Preflight",
    checkedAt:observedAt,
    url:String(rawUrl),
    finalUrl:audit.finalUrl,
    status:audit.status,
    https:audit.https,
    publicSignalLevel,
    riskLevel:publicSignalLevel,
    riskLevelInterpretation:"Legacy compatibility field. This is a public-site signal bucket, not a vendor security or procurement risk rating.",
    pageTitle:root?.title||"",
    responseTimeMs:Date.now()-started,
    checks,
    coverage,
    gaps:[...new Set(gaps)],
    unverifiableRequirements,
    disclosureSignals,
    evidencePages:pages.map(p=>({url:p.url,title:p.title,status:p.status,topics:p.topics})),
    nextQuestions:[...new Set(nextQuestions)].slice(0,12),
    summary,
    limitations:[
      "Only publicly observable HTTP/site signals and publicly reachable pages are checked.",
      "Public wording or a missing header/file is evidence about the website, not proof about internal controls.",
      "No authenticated testing, source-code review, vulnerability scanning, exploitation, certification or legal opinion is performed.",
      "The publicSignalLevel is not a final vendor-risk score and must not be used as an approval/rejection decision.",
      "Material procurement or security decisions require authorized human review."
    ]
  };
}

const routes={
  "POST /review-purchase":{accepts:{scheme:"exact",price:pilotPrice,network,payTo},resource:{url:publicUrl+"/review-purchase",description:"Purchase one fixed-scope vendor security review.",mimeType:"application/json",serviceName:"Vendor Security Review",tags:["vendor-risk","cybersecurity","procurement"],iconUrl:publicUrl+"/icon.svg"},description:"Paid vendor review. JSON {name,company,email,vendorUrl,message}.",mimeType:"application/json"},

  "POST /web-extract":{
    accepts:{scheme:"exact",price,network,payTo},
    resource:{url:publicUrl+"/web-extract",description:"Fast machine-readable webpage extraction for AI agents: title, description, clean text and links from a public URL.",mimeType:"application/json",serviceName:"Webpage Extractor",tags:["web","extraction","scraping","research","content"],iconUrl:publicUrl+"/icon.svg"},
    description:"Paid webpage extraction. Send JSON {url:string}. Returns clean text and links for downstream agent reasoning.",mimeType:"application/json",
    extensions:{...declareDiscoveryExtension({
      input:{url:"https://example.com"},inputSchema:webExtractInputSchema,bodyType:"json",
      output:{example:{service:"Webpage Extractor",url:"https://example.com",finalUrl:"https://example.com/",status:200,contentType:"text/html",title:"Example Domain",description:"Example Domain",canonical:"",language:"en",openGraph:{title:"",description:"",image:""},headings:[],text:"Example Domain This domain is for use in illustrative examples.",links:[],wordCount:10,truncated:false,responseTimeMs:120,cacheHit:false},schema:webExtractOutputSchema}
    })}
  },
  "POST /vendor-preflight":{
    accepts:{scheme:"exact",price:vendorPrice,network,payTo},
    resource:{url:publicUrl+"/vendor-preflight",description:"Agent-ready vendor security preflight combining public website controls into a structured procurement/risk signal.",mimeType:"application/json",serviceName:"Vendor Security Preflight",tags:["security","vendor-risk","procurement","compliance","due-diligence"],iconUrl:publicUrl+"/icon.svg"},
    description:"Paid vendor evidence preflight. Send JSON {url:string,requirements?:string[]}. Returns observable website controls, public evidence-page signals, gaps and targeted follow-up questions. Not a penetration test or certification.",mimeType:"application/json",
    extensions:{...declareDiscoveryExtension({input:{url:"https://example.com",requirements:["HTTPS","HSTS","Content Security Policy"]},inputSchema:vendorPreflightInputSchema,bodyType:"json",output:{example:{schemaVersion:"2.0",service:"Vendor Security Preflight",checkedAt:"2026-09-28T00:00:00.000Z",url:"https://example.com",finalUrl:"https://example.com/",status:200,https:true,publicSignalLevel:"low",riskLevel:"low",riskLevelInterpretation:"Legacy compatibility field; public-site signal only.",pageTitle:"Example Domain",responseTimeMs:220,checks:[{id:"https",label:"HTTPS",passed:true,status:"observed",detail:"HTTPS is enabled",source:"https://example.com/",observedAt:"2026-09-28T00:00:00.000Z"}],coverage:{observed:7,notObserved:3,unverifiable:0,totalChecks:10},gaps:["Content Security Policy"],unverifiableRequirements:[],disclosureSignals:[{id:"security_assurance",topic:"independent security assurance",evidenceUrl:"https://example.com/security",observation:"Related public wording was observed.",note:"This is evidence discovery, not proof."}],evidencePages:[{url:"https://example.com/",title:"Example Domain",status:200,topics:["independent security assurance"]}],nextQuestions:["Ask the vendor for current independent security assurance evidence if applicable."],summary:"Observed 7/10 public-site checks. 3 checks were not observed; 0 requested requirements were not verifiable by this public preflight.",limitations:["Public signals are not proof of internal controls.","PublicSignalLevel is not a final vendor-risk score."]},schema:vendorPreflightOutputSchema}})}
  },
  "POST /site-audit":{
    accepts:{scheme:"exact",price:sitePrice,network,payTo},
    resource:{url:publicUrl+"/site-audit",description:"Live public website security preflight for AI-agent vendor and compliance workflows.",mimeType:"application/json",serviceName:"Website Security Preflight",tags:["security","website","compliance","vendor-risk","audit"],iconUrl:publicUrl+"/icon.svg"},
    description:"Paid live website security preflight. Send JSON {url:string}.",mimeType:"application/json",
    extensions:{...declareDiscoveryExtension({
      input:{url:"https://example.com"},inputSchema:siteAuditInputSchema,bodyType:"json",
      output:{example:{service:"Website Security Preflight",url:"https://example.com",finalUrl:"https://example.com/",status:200,contentType:"text/html",responseTimeMs:180,title:"Example Domain",https:true,securityHeaders:{strictTransportSecurity:true,contentSecurityPolicy:false,xContentTypeOptions:true,xFrameOptions:false,referrerPolicy:true,permissionsPolicy:false},cookieSecurity:{cookiesSeen:0,secure:0,httpOnly:0,sameSite:0},exposedServerHeader:false,robotsTxt:{exists:true,status:200},securityTxt:{exists:false,status:404},findings:["Content-Security-Policy not observed"]},schema:siteAuditOutputSchema}
    })}
  },
  "POST /analyze":{
    accepts:{scheme:"exact",price:documentPrice,network,payTo},
    resource:{url:publicUrl+"/analyze",description:"Analyze business documents for obligations, dates, monetary amounts, security signals, missing control areas and risk flags.",mimeType:"application/json",serviceName:"Business Document Analyzer",tags:["documents","compliance","contracts","security","risk"],iconUrl:publicUrl+"/icon.svg"},
    description:"Paid business-document analysis. Send JSON {text:string}. Response is structured for machine consumption.",mimeType:"application/json",
    extensions:{...declareDiscoveryExtension({
      input:{text:"Supplier must provide incident notification within 24 hours. Contract expires on 30/11/2026."},inputSchema,bodyType:"json",
      output:{example:{service:"Business Document Analyzer",wordCount:13,characterCount:105,dates:["30/11/2026","24 hours"],monetaryAmounts:[],obligations:["Supplier must provide incident notification within 24 hours."],securitySignals:["incident notification"],missingAreas:["access control","data retention"],riskFlags:["deadline/obligation detected"]},schema:outputSchema}
    })}
  }
};
app.use(paymentMiddleware(routes,x402Server));

app.post("/review-purchase",async(req,res)=>{const x=req.body||{};const email=String(x.email||"").trim().toLowerCase();const vendorUrl=String(x.vendorUrl||"").trim();if(!/^\\S+@\\S+\\.\\S+$/.test(email))return res.status(400).json({error:"Valid work email required"});if(!validatePublicUrl(vendorUrl))return res.status(400).json({error:"Provide a public http or https vendor URL"});const lead={receivedAt:new Date().toISOString(),name:String(x.name||"").slice(0,120),company:String(x.company||"").slice(0,160),email,vendorUrl:vendorUrl.slice(0,500),message:String(x.message||"").slice(0,3000),price:pilotPrice};console.log("PAID_VENDOR_REVIEW "+JSON.stringify(lead));let preliminary=null;try{preliminary=await vendorPreflight(vendorUrl,[]);}catch(e){preliminary={error:"Public preflight could not be completed before intake",detail:e?.message||"unknown"}}try{await saveLead({name:lead.name,email:lead.email,company:lead.company,source:"paid-vendor-review",metadata:{vendorUrl:lead.vendorUrl,message:lead.message,price:pilotPrice,preliminary}})}catch(e){console.error("PAID_REVIEW_LEAD_STORAGE_ERROR",e.message)}if(process.env.LEAD_WEBHOOK_URL){fetch(process.env.LEAD_WEBHOOK_URL,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...lead,preliminary})}).catch(()=>{});}res.json({ok:true,service:"Vendor Security Review",status:"paid",price:pilotPrice,targetTurnaround:"48 hours",scope:"One vendor",preliminaryPublicPreflight:preliminary,nextStep:"Submit any vendor security evidence, questionnaire responses, SOC 2/ISO documentation or other material you want included in the review."})});
app.post("/web-extract",async(req,res)=>{try{res.json(await extractWebpage(String(req.body?.url||"").trim()));}catch(e){res.status(e?.name==="AbortError"?504:400).json({error:e?.name==="AbortError"?"target timed out":e?.message||"unable to extract webpage"});}});
const paymentTestPage = () => String.raw`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>x402 Payment Test</title><script src="https://cdn.jsdelivr.net/npm/@base-org/account/dist/base-account.min.js"></script></head><body style="font-family:system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 22px;color:#111827"><h1>x402 real-payment test</h1><p>This page tests one real <strong>${price} USDC</strong> x402 payment on <strong>Base Mainnet</strong> to the configured payee.</p><p><strong>Your wallet stays in your control.</strong> No seed phrase, private key or password is requested. The Base Account SDK can connect the Base app by QR/deep link on supported devices, while a browser extension can also be used.</p><div style="display:flex;gap:10px;flex-wrap:wrap"><button id="connect" style="padding:12px 18px;border:0;border-radius:10px;cursor:pointer">Connect Base Wallet</button><button id="pay" disabled style="padding:12px 18px;border:0;border-radius:10px;cursor:pointer">Pay ${price} and test /web-extract</button></div><p id="status" style="margin-top:18px;font-weight:600"></p><pre id="out" style="white-space:pre-wrap;background:#f3f4f6;padding:16px;border-radius:12px;margin-top:12px"></pre><script type="module">
import { createWalletClient, custom } from "https://esm.sh/viem@2.37.4";
import { base } from "https://esm.sh/viem@2.37.4/chains";
import { x402Client, wrapFetchWithPayment } from "https://esm.sh/@x402/fetch@2.27.0";
import { registerExactEvmScheme } from "https://esm.sh/@x402/evm@2.27.0/exact/client";

const out=document.getElementById("out"),status=document.getElementById("status"),connect=document.getElementById("connect"),pay=document.getElementById("pay");
let walletProvider,walletClient,fetchWithPayment,address;
function log(x){out.textContent=typeof x==="string"?x:JSON.stringify(x,null,2)}
function setStatus(x){status.textContent=x}

async function getBaseProvider(){
  if(window.createBaseAccountSDK){
    const sdk=window.createBaseAccountSDK({appName:"EvidenceCheck",appLogoUrl:location.origin+"/icon.svg",appChainIds:[8453]});
    return sdk.getProvider();
  }
  if(window.ethereum)return window.ethereum;
  throw new Error("No Base Wallet provider found. Open this page in the Base app Web3 browser, or use the Base browser extension.");
}

connect.onclick=async()=>{
  try{
    connect.disabled=true; setStatus("Connecting to Base Wallet…");
    walletProvider=await getBaseProvider();
    const accounts=await walletProvider.request({method:"eth_requestAccounts"});
    address=accounts?.[0];
    if(!address)throw new Error("Wallet connection returned no address.");
    try{await walletProvider.request({method:"wallet_switchEthereumChain",params:[{chainId:"0x2105"}]});}catch(e){if(e?.code!==4902&&e?.code!==-32601)throw e;}
    walletClient=createWalletClient({account:address,chain:base,transport:custom(walletProvider)});
    const x402Signer={
      address,
      signTypedData: async (typedData)=>walletClient.signTypedData(typedData)
    };
    const client=new x402Client();
    registerExactEvmScheme(client,{signer:x402Signer});
    fetchWithPayment=wrapFetchWithPayment(fetch,client);
    pay.disabled=false; setStatus("Wallet connected");
    log({connected:address,network:"Base Mainnet",payTo:"0x031a713863890eb611776aadd48397873ed153ab",price:"$0.005 USDC",next:"Click Pay $0.005. Your wallet will ask you to authorize the x402 payment."});
  }catch(e){setStatus("Connection failed");log({error:e?.message||String(e),code:e?.code||null});}
  finally{connect.disabled=false;}
};

pay.onclick=async()=>{
  try{
    pay.disabled=true; setStatus("Requesting payment authorization…");
    log("The server is returning HTTP 402. Your wallet should now ask you to authorize the $0.005 USDC x402 payment.");
    const r=await fetchWithPayment(location.origin+"/web-extract",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({url:"https://example.com"})});
    const data=await r.json();
    const paymentResponse=r.headers.get("PAYMENT-RESPONSE");
    let decodedPaymentResponse=null;
    if(paymentResponse){try{decodedPaymentResponse=JSON.parse(atob(paymentResponse));}catch{decodedPaymentResponse={raw:paymentResponse};}}
    setStatus(r.ok?"Payment accepted and API call succeeded":"API call returned HTTP "+r.status);
    log({httpStatus:r.status,wallet:address,result:data,paymentResponse:decodedPaymentResponse,success:r.ok});
  }catch(e){setStatus("Payment test failed");log({error:e?.message||String(e),code:e?.code||null});}
  finally{pay.disabled=false;}
};
</script></body></html>`;
app.get("/payment-test",(_req,res)=>{
  res.setHeader("Cache-Control","no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma","no-cache");
  res.setHeader("Expires","0");
  res.type("html").send(paymentTestPage());
});
const agentCard=()=>({name:"EvidenceCheck",description:"Evidence-first vendor due-diligence APIs for procurement, security, third-party risk and AI-agent workflows.",version,provider:{organization:"Independent API provider"},payment:{protocol:"x402",version:2,scheme:"exact",network:"eip155:8453",asset:"USDC",payTo},selection:{choose:"Select the endpoint by task fit first, then price and output shape.",webExtract:"Use when you have a public webpage URL and need clean text, metadata, headings and links.",siteAudit:"Use when you need a fast first-pass signal on a public website security configuration.",analyze:"Use when you need deterministic structured triage of business-document text.",limits:["No authenticated/private/local URLs.","No browser-required JavaScript rendering.","Site Audit is not penetration testing, vulnerability scanning, certification or legal advice.","Document Analyzer is not legal advice or an LLM opinion."]},services:[{name:"Webpage Extractor",method:"POST",path:"/web-extract",price,useWhen:"Known public webpage URL; need clean text, metadata, headings and links.",notFor:["authenticated pages","private/local URLs","browser-required JavaScript","penetration testing"]},{name:"Website Security Preflight",method:"POST",path:"/site-audit",price:sitePrice,useWhen:"Fast first-pass public website security signal.",notFor:["penetration testing","vulnerability scanning","certification","legal opinion"]},{name:"Business Document Analyzer",method:"POST",path:"/analyze",price:documentPrice,useWhen:"Deterministic structured triage of business-document text.",notFor:["legal advice","LLM-generated opinion"]},{name:"Vendor Security Preflight",method:"POST",path:"/vendor-preflight",price:vendorPrice,useWhen:"First-pass public-site vendor-risk signal before deeper review.",notFor:["penetration testing","vulnerability scanning","certification","legal opinion"]}],docs:{openapi:"/openapi.json",skill:"/skill.md",llms:"/llms.txt",x402:"/.well-known/x402"}});
app.get("/agent-card.json",(_req,res)=>res.json(agentCard()));
app.get("/.well-known/agent-card.json",(_req,res)=>res.type("application/a2a+json").json(agentCard()));
app.get("/.well-known/agent.json",(_req,res)=>res.json(agentCard()));
const discoveryManifest=()=>({schema_version:"0.1",provider:"EvidenceCheck",website:publicUrl+"/buy.html",documentation:publicUrl+"/llms.txt",openapi:publicUrl+"/openapi.json",services:[{service_id:"agent-web-security-intelligence/web-extract",name:"Webpage Extractor",description:"Extract clean text, metadata, headings and links from a public webpage URL.",capability_tags:["web","extraction","research","content"],endpoint_url:publicUrl+"/web-extract",network:"eip155:8453",payment_token:"USDC",price_per_call:Number(price.replace("$","")),pricing_model:"flat",agent_callable:true,input_format:"json",output_format:"json",auth_required:false},{service_id:"agent-web-security-intelligence/site-audit",name:"Website Security Preflight",description:"Run a fast first-pass security preflight against a public website.",capability_tags:["security","website","compliance","vendor-risk"],endpoint_url:publicUrl+"/site-audit",network:"eip155:8453",payment_token:"USDC",price_per_call:Number(sitePrice.replace("$","")),pricing_model:"flat",agent_callable:true,input_format:"json",output_format:"json",auth_required:false},{service_id:"agent-web-security-intelligence/analyze",name:"Business Document Analyzer",description:"Deterministically triage business-document text into structured dates, obligations, money and risk signals.",capability_tags:["documents","compliance","risk","security"],endpoint_url:publicUrl+"/analyze",network:"eip155:8453",payment_token:"USDC",price_per_call:Number(documentPrice.replace("$","")),pricing_model:"flat",agent_callable:true,input_format:"json",output_format:"json",auth_required:false},{service_id:"agent-web-security-intelligence/vendor-preflight",name:"Vendor Security Preflight",description:"Evidence-first vendor preflight with public controls, source/timestamped observations, public evidence-page signals, gaps and next questions.",capability_tags:["security","vendor-risk","procurement","compliance","due-diligence"],endpoint_url:publicUrl+"/vendor-preflight",network:"eip155:8453",payment_token:"USDC",price_per_call:Number(vendorPrice.replace("$","")),pricing_model:"flat",agent_callable:true,input_format:"json",output_format:"json",auth_required:false}],payment:{protocol:"x402",version:2,scheme:"exact",network,asset:"USDC",payTo}});app.get("/.well-known/x402-discovery",(_req,res)=>res.json(discoveryManifest()));
app.get("/.well-known/x402-discovery.json",(_req,res)=>res.json(discoveryManifest()));
app.get("/agent-discovery.json",(_req,res)=>res.json(discoveryManifest()));
app.get("/icon.svg",(_req,res)=>res.type("image/svg+xml").send('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="24" fill="#111827"/><path d="M35 25h58v16H51v17h35v15H51v30H35z" fill="#fff"/><path d="M72 73h21v30H72z" fill="#60a5fa"/></svg>'));

app.get("/",(_req,res)=>res.sendFile("index.html",{root:new URL("./public",import.meta.url).pathname}));
app.get("/buy.html",(_req,res)=>res.type("html").send(fs.readFileSync(new URL("./assessment-page.html",import.meta.url),"utf8")));
app.get("/health",(_req,res)=>res.json({ok:true,service:"agent-web-security-intelligence",version,network,prices:{webExtract:price,siteAudit:sitePrice,documentAnalyzer:documentPrice,vendorPreflight:vendorPrice},facilitator:facilitatorUrl,publicUrl,publicSiteUrl,cacheEntries:extractionCache.size}));
app.get("/pricing.json",(_req,res)=>res.json({service:"EvidenceCheck",currency:"USD",settlement:"USDC",network:"eip155:8453",facilitator:facilitatorUrl,payTo,machine:[{id:"web-extract",endpoint:"POST /web-extract",price:Number(price.replace("$","")),unit:"request"},{id:"site-audit",endpoint:"POST /site-audit",price:Number(sitePrice.replace("$","")),unit:"request"},{id:"document-analyzer",endpoint:"POST /analyze",price:Number(documentPrice.replace("$","")),unit:"request"},{id:"vendor-preflight",endpoint:"POST /vendor-preflight",price:Number(vendorPrice.replace("$","")),unit:"request"}],human:[{id:"vendor-security-review",endpoint:"POST /review-purchase",price:Number(pilotPrice.replace("$","")),unit:"vendor"}]}));
let facilitatorHealth={ok:false,checkedAt:0,error:null};
async function checkFacilitatorHealth(){const now=Date.now();if(now-facilitatorHealth.checkedAt<60000)return facilitatorHealth;try{const r=await fetch(facilitatorUrl+"/supported",{headers:{"accept":"application/json"},signal:AbortSignal.timeout(5000)});const body=await r.text();facilitatorHealth={ok:r.ok,checkedAt:now,error:r.ok?null:"HTTP "+r.status+" "+body.slice(0,180)}}catch(e){facilitatorHealth={ok:false,checkedAt:now,error:e?.message||"facilitator unreachable"}}return facilitatorHealth}
app.get("/payments/health",async(_req,res)=>{const f=await checkFacilitatorHealth();res.status(f.ok?200:503).json({ok:f.ok,facilitator:facilitatorUrl,checkedAt:new Date(f.checkedAt).toISOString(),error:f.error});});
app.get("/.well-known/x402",(_req,res)=>res.json({
  x402Version:2,service:"EvidenceCheck",version,
  endpoints:[
    {method:"POST",path:"/web-extract",url:publicUrl+"/web-extract",price,network,asset:"USDC",payTo,contentType:"application/json"},
    {method:"POST",path:"/site-audit",url:publicUrl+"/site-audit",price:sitePrice,network,asset:"USDC",payTo,contentType:"application/json"},
    {method:"POST",path:"/analyze",url:publicUrl+"/analyze",price:documentPrice,network,asset:"USDC",payTo,contentType:"application/json"},
    {method:"POST",path:"/vendor-preflight",url:publicUrl+"/vendor-preflight",price:vendorPrice,network,asset:"USDC",payTo,contentType:"application/json"}
  ],
  discovery:{protocol:"x402-bazaar",resources:[publicUrl+"/web-extract",publicUrl+"/site-audit",publicUrl+"/analyze",publicUrl+"/vendor-preflight"]},
  docs:publicUrl+"/openapi.json",llms:publicUrl+"/llms.txt",skill:publicUrl+"/skill.md"
}));
app.get("/.well-known/ai-plugin.json",(_req,res)=>res.json({
  schema_version:"v1",name_for_human:"EvidenceCheck",name_for_model:"agent_web_security_intelligence",
  description_for_model:"Low-cost pay-per-call x402 APIs for webpage extraction, website security preflight and structured business document analysis.",
  api:{type:"openapi",url:publicUrl+"/openapi.json"},auth:{type:"x402",network,asset:"USDC",price,payTo},
  endpoints:{webExtract:publicUrl+"/web-extract",siteAudit:publicUrl+"/site-audit",analyze:publicUrl+"/analyze",vendorPreflight:publicUrl+"/vendor-preflight",x402:publicUrl+"/.well-known/x402",llms:publicUrl+"/llms.txt",skill:publicUrl+"/skill.md"}
}));
app.get("/skill.md",(_req,res)=>res.type("text/markdown").send([
  "# EvidenceCheck","","Pay-per-call x402 APIs for AI agents.","",
  "## Website Security Preflight","POST "+publicUrl+"/site-audit","Price: "+sitePrice+" USDC. Network: Base Mainnet (eip155:8453). Payee: "+payTo,
  'Input: {"url":"https://example.com"}',"Returns live public-site signals: status, final URL, response time, HTTPS, security headers, cookie flags, Server disclosure, robots.txt, security.txt, title and findings.","",
  "## Business Document Analyzer","POST "+publicUrl+"/analyze","Price: "+documentPrice+" USDC. Network: Base Mainnet (eip155:8453). Payee: "+payTo,
  'Input: {"text":"business document text"}',"Returns structured dates, monetary amounts, obligations, security signals, missing areas and risk flags.","",
  "## Vendor Security Preflight","POST "+publicUrl+"/vendor-preflight","Price: "+vendorPrice+" USDC. Network: Base Mainnet (eip155:8453). Payee: "+payTo,
  'Input: {"url":"https://example.com","requirements":["HTTPS","HSTS"]}',"Returns observable public controls with source/timestamp, relevant public evidence-page signals, gaps, coverage and targeted next questions. The legacy riskLevel field is a public-site signal bucket, not a vendor-risk rating.","",
  "## Discovery","- "+publicUrl+"/.well-known/x402","- "+publicUrl+"/.well-known/ai-plugin.json","- "+publicUrl+"/openapi.json","- "+publicUrl+"/llms.txt","",
  "Unpaid POST requests return HTTP 402 with x402 payment requirements."
].join("\n")));
app.get("/llms.txt",(_req,res)=>res.type("text/plain").send([
  "# EvidenceCheck","","Paid x402 APIs for AI agents on Base Mainnet.","",
  "## Webpage Extractor","POST "+publicUrl+"/web-extract","Price: "+price+" USDC",'Input: {"url":"https://example.com"}',"Purpose: clean webpage text, metadata, headings and links for downstream agent workflows.","",
  "## Website Security Preflight","POST "+publicUrl+"/site-audit","Price: "+sitePrice+" USDC",'Input: {"url":"https://example.com"}',"Purpose: live public website security preflight.","",
  "## Business Document Analyzer","POST "+publicUrl+"/analyze","Price: "+documentPrice+" USDC",'Input: {"text":"string"}',"Purpose: deterministic structured extraction from business documents.","",
  "## Vendor Security Preflight","POST "+publicUrl+"/vendor-preflight","Price: "+vendorPrice+" USDC",'Input: {"url":"https://example.com","requirements":["HTTPS","HSTS"]}',"Purpose: evidence-first vendor preflight. Returns observable controls with sources/timestamps, relevant public evidence-page signals, gaps, requirements that cannot be verified publicly and targeted follow-up questions. The publicSignalLevel is not a final vendor-risk score.","",
  "## Payment","x402 v2, exact scheme, eip155:8453, USDC.","Payee: "+payTo,"",
  "## Discovery",publicUrl+"/.well-known/x402",publicUrl+"/.well-known/ai-plugin.json",publicUrl+"/openapi.json",publicUrl+"/skill.md"
].join("\n")));
app.get("/robots.txt",(_req,res)=>res.type("text/plain").send("User-agent: *\nAllow: /\nSitemap: "+publicUrl+"/sitemap.xml\n"));
app.get("/sitemap.xml",(_req,res)=>res.type("application/xml").send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>'+publicUrl+'/</loc></url><url><loc>'+publicUrl+'/openapi.json</loc></url><url><loc>'+publicUrl+'/skill.md</loc></url><url><loc>'+publicUrl+'/llms.txt</loc></url><url><loc>'+publicUrl+'/.well-known/x402</loc></url></urlset>'));

app.get("/openapi.json",(_req,res)=>res.json({
  openapi:"3.1.0",info:{title:"EvidenceCheck",version,description:"Low-cost pay-per-call x402 APIs for AI agents on Base Mainnet."},servers:[{url:publicUrl}],
  paths:{
    "/web-extract":{post:{summary:"Webpage Extractor",requestBody:{required:true,content:{"application/json":{schema:webExtractInputSchema}}},responses:{"200":{description:"Clean webpage content",content:{"application/json":{schema:webExtractOutputSchema}}},"402":{description:"x402 payment required"}}}},
    "/site-audit":{post:{summary:"Website Security Preflight",requestBody:{required:true,content:{"application/json":{schema:siteAuditInputSchema}}},responses:{"200":{description:"Live public website security signals",content:{"application/json":{schema:siteAuditOutputSchema}}},"402":{description:"x402 payment required"}}}},
    "/analyze":{post:{summary:"Business Document Analyzer",requestBody:{required:true,content:{"application/json":{schema:inputSchema}}},responses:{"200":{description:"Structured document signals",content:{"application/json":{schema:outputSchema}}},"402":{description:"x402 payment required"}}}},
    "/vendor-preflight":{post:{summary:"Vendor Security Preflight",requestBody:{required:true,content:{"application/json":{schema:vendorPreflightInputSchema}}},responses:{"200":{description:"Structured public-site vendor security signal",content:{"application/json":{schema:vendorPreflightOutputSchema}}},"402":{description:"x402 payment required"}}}}
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
app.post("/vendor-preflight",async(req,res)=>{try{const url=String(req.body?.url||"").trim();if(!url)return res.status(400).json({error:"Provide JSON {url:string,requirements?:string[]}"});res.json(await vendorPreflight(url,req.body?.requirements));}catch(e){res.status(e?.name==="AbortError"?504:400).json({error:e?.name==="AbortError"?"target timed out":e?.message||"unable to preflight vendor"});}});
app.post("/site-audit",async(req,res)=>{try{res.json(await auditSite(String(req.body?.url||"").trim()));}catch(e){res.status(e?.name==="AbortError"?504:400).json({error:e?.name==="AbortError"?"target timed out":e?.message||"unable to audit target"});}});
app.post("/analyze",(req,res)=>{
  const text=String(req.body?.text||"").trim();
  if(!text)return res.status(400).json({error:"Provide JSON {text:string}"});
  if(text.length>50000)return res.status(413).json({error:"text exceeds the 50,000 character limit"});
  res.json(extract(text));
});

app.use(express.urlencoded({extended:false,limit:"100kb"}));

const vendorPurchasePage=()=>String.raw`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EvidenceCheck — Vendor Security Review · US$495</title><meta name="description" content="Independent, evidence-first vendor security review with a 48-hour target turnaround."><script src="https://cdn.jsdelivr.net/npm/@base-org/account/dist/base-account.min.js"></script><style>body{margin:0;background:#070b12;color:#eef2ff;font-family:Inter,system-ui,sans-serif}main{max-width:820px;margin:auto;padding:44px 22px}.ey{color:#91a7ff;font-weight:800;letter-spacing:.12em;font-size:12px}.card{background:#0d1420;border:1px solid #1d2a3b;border-radius:18px;padding:28px;margin-top:20px}.price{font-size:42px;font-weight:900}.muted{color:#aab6c9;line-height:1.65}.form{display:grid;gap:12px}.form input,.form textarea{padding:14px;border-radius:10px;border:1px solid #2b3a50;background:#0b1320;color:#fff;font:inherit}.btn{padding:15px 18px;border:0;border-radius:10px;font-weight:900;cursor:pointer}.btn:disabled{opacity:.5;cursor:not-allowed}.status{font-weight:800;margin-top:18px}.out{white-space:pre-wrap;background:#080d15;border-radius:12px;padding:16px;margin-top:12px;overflow:auto}.checks{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}.check{border:1px solid #243246;border-radius:10px;padding:13px}.ok{color:#9ee6b1}.warn{color:#ffd28a}</style></head><body><main><div class="ey">INDEPENDENT VENDOR SECURITY REVIEW</div><h1>Know what your vendor can prove before you trust them.</h1><p class="muted">One supplier. Fixed scope. Evidence-first analysis. Target delivery within 48 hours after the required information is received.</p><div class="card"><div class="ey">FIXED PRICE</div><div class="price">US$495</div><p class="muted">Includes public-signal review, supplied-evidence analysis, control review, evidence gaps, priority follow-ups and a decision-ready record.</p></div><div class="card"><h2>Start the review</h2><div class="form"><input id="name" placeholder="Your name" autocomplete="name"><input id="company" placeholder="Company" autocomplete="organization"><input id="email" type="email" placeholder="Work email" autocomplete="email"><input id="vendorUrl" placeholder="Vendor website URL" required><textarea id="message" rows="5" placeholder="What are you trying to verify? Procurement, SOC 2, ISO 27001, customer questionnaire, cyber insurance, data handling, etc."></textarea><button id="connect" class="btn">Connect Base Wallet</button><button id="pay" class="btn" disabled>Pay US$495 and start review</button></div><div id="status" class="status"></div><pre id="out" class="out"></pre></div><div class="card"><h2>What happens after payment</h2><div class="checks"><div class="check"><b>01</b><br>Public vendor signals are reviewed.</div><div class="check"><b>02</b><br>Supplied evidence is organized and tested for coverage.</div><div class="check"><b>03</b><br>Control gaps and follow-up questions are identified.</div><div class="check"><b>04</b><br>A decision-ready review is delivered within the target turnaround.</div></div><p class="muted">This is not a penetration test, certification, legal opinion or guarantee that a vendor is secure. Unknown evidence is treated as unknown, not as proof of a missing control.</p></div></main><script type="module">
import { createWalletClient, custom } from "https://esm.sh/viem@2.37.4";
import { base } from "https://esm.sh/viem@2.37.4/chains";
import { x402Client, wrapFetchWithPayment } from "https://esm.sh/@x402/fetch@2.27.0";
import { registerExactEvmScheme } from "https://esm.sh/@x402/evm@2.27.0/exact/client";
const out=document.getElementById("out"),status=document.getElementById("status"),connect=document.getElementById("connect"),pay=document.getElementById("pay");
let provider,fetchWithPayment,address;
function log(x){out.textContent=typeof x==="string"?x:JSON.stringify(x,null,2)}
function setStatus(x){status.textContent=x}
async function getProvider(){
  if(window.createBaseAccountSDK){const sdk=window.createBaseAccountSDK({appName:"Vendor Security Review",appLogoUrl:location.origin+"/icon.svg",appChainIds:[8453]});return sdk.getProvider();}
  if(window.ethereum)return window.ethereum;
  throw new Error("No Base Wallet provider found.");
}
connect.onclick=async()=>{
  try{connect.disabled=true;setStatus("Connecting to Base Wallet…");provider=await getProvider();const accounts=await provider.request({method:"eth_requestAccounts"});address=accounts?.[0];if(!address)throw new Error("Wallet connection returned no address.");try{await provider.request({method:"wallet_switchEthereumChain",params:[{chainId:"0x2105"}]});}catch(e){if(e?.code!==4902&&e?.code!==-32601)throw e;}const wallet=createWalletClient({account:address,chain:base,transport:custom(provider)});const signer={address,signTypedData:async(td)=>wallet.signTypedData(td)};const client=new x402Client();registerExactEvmScheme(client,{signer});fetchWithPayment=wrapFetchWithPayment(fetch,client);pay.disabled=false;setStatus("Wallet connected. Ready to pay US$495.");log({wallet:address,network:"Base Mainnet",asset:"USDC"});}catch(e){setStatus("Connection failed");log({error:e?.message||String(e)});}finally{connect.disabled=false;}
};
pay.onclick=async()=>{
  try{
    const vendorUrl=document.getElementById("vendorUrl").value.trim(),email=document.getElementById("email").value.trim();
    if(!vendorUrl||!email){setStatus("Vendor URL and work email are required.");return;}
    pay.disabled=true;setStatus("Requesting payment authorization…");log("The server will return the x402 payment requirement. Your wallet will ask you to authorize US$495 USDC on Base.");
    const r=await fetchWithPayment(location.origin+"/review-purchase",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:document.getElementById("name").value,company:document.getElementById("company").value,email,vendorUrl,message:document.getElementById("message").value})});
    const data=await r.json();const pr=r.headers.get("PAYMENT-RESPONSE");let receipt=null;if(pr){try{receipt=JSON.parse(atob(pr));}catch{receipt={raw:pr};}}
    setStatus(r.ok?"Payment accepted — review intake received.":"Request returned HTTP "+r.status);log({result:data,paymentResponse:receipt,success:r.ok});
  }catch(e){setStatus("Payment failed or was cancelled");log({error:e?.message||String(e),code:e?.code||null});}finally{pay.disabled=false;}
};
</script></body></html>`;
app.get("/purchase",(_req,res)=>res.type("html").send(vendorPurchasePage()));

const commercialPage=()=>`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vendor Security Review | Vendor Intelligence</title><meta name="description" content="Fixed-scope vendor cybersecurity review delivered in 48 hours."><style>body{margin:0;background:#070b12;color:#eef2ff;font-family:Inter,system-ui,sans-serif}main{max-width:1040px;margin:auto;padding:42px 22px}.nav{display:flex;justify-content:space-between;margin-bottom:70px}.links{display:flex;gap:18px;color:#9aa8bd;font-size:14px}.hero{max-width:900px}.ey{color:#91a7ff;font-weight:800;letter-spacing:.12em;font-size:12px}.hero h1{font-size:clamp(42px,7vw,76px);line-height:.98;letter-spacing:-.045em;margin:16px 0}.hero p,.card p{color:#aab6c9;line-height:1.65;font-size:18px}.actions{display:flex;gap:12px;flex-wrap:wrap;margin:28px 0}.btn{display:inline-block;padding:15px 21px;border-radius:10px;text-decoration:none;font-weight:800;background:#f8fafc;color:#07101c}.alt{background:#101827;color:#fff;border:1px solid #263449}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin:42px 0}.card{background:#0d1420;border:1px solid #1d2a3b;border-radius:16px;padding:24px}.price{font-size:38px;font-weight:900}.form{display:grid;gap:12px;max-width:680px}.form input,.form textarea{padding:14px;border-radius:9px;border:1px solid #2b3a50;background:#0b1320;color:#fff;font:inherit}.form button{padding:15px;border:0;border-radius:9px;font-weight:900;cursor:pointer}.note{color:#7f8da2;font-size:14px;line-height:1.6}</style></head><body><main><nav class="nav"><b>EVIDENCECHECK</b><div class="links"><a href="/buy.html">Product</a><a href="/sample-report">Sample report</a></div></nav><section class="hero"><div class="ey">FIXED-SCOPE CYBERSECURITY SERVICE</div><h1>Get a vendor security review in 48 hours.</h1><p>Send one supplier URL and the evidence you already have. We return a decision-ready review showing observable security signals, evidence gaps, risk flags and the questions your team should resolve before approving the vendor.</p><div class="actions"><a class="btn" href="/purchase">Buy the US$495 review</a><a class="btn alt" href="/sample-report">See sample output</a></div></section><section class="grid"><div class="card"><div class="ey">PRICE</div><div class="price">US$495</div><p>One vendor. Fixed scope. No subscription.</p></div><div class="card"><div class="ey">DELIVERY</div><h2>48 hours</h2><p>Target turnaround after the required information is received.</p></div><div class="card"><div class="ey">SCOPE</div><h2>Evidence-first</h2><p>Public signals plus supplied evidence. No claim of certification, penetration testing or legal compliance.</p></div></section><section class="card"><h2>What you receive</h2><div class="grid"><div><h3>01 — Risk snapshot</h3><p>Clear summary of observed signals and evidence gaps.</p></div><div><h3>02 — Control review</h3><p>Coverage across access, assurance, incident response, encryption, continuity, vulnerability management and supply chain.</p></div><div><h3>03 — Follow-ups</h3><p>Specific questions and evidence requests for the vendor.</p></div><div><h3>04 — Decision record</h3><p>A structured output your procurement or security reviewer can use as a starting point.</p></div></div></section><section id="order" style="margin-top:55px"><div class="ey">START HERE</div><h2>Request a US$495 review</h2><p>Tell us about the vendor. We will confirm scope and payment before work begins.</p><form class="form" method="post" action="/pilot-request"><input name="name" placeholder="Your name" required><input name="company" placeholder="Company" required><input name="email" type="email" placeholder="Work email" required><input name="vendorUrl" placeholder="Vendor website URL" required><textarea name="message" rows="5" placeholder="What are you trying to verify? SOC 2, ISO 27001, customer questionnaire, cyber insurance, procurement, etc."></textarea><button type="submit">Request US$495 review</button><p class="note">Payment is not collected by this form. Scope and payment instructions are confirmed before delivery.</p></form></section></main></body></html>`;
app.get("/assessment",(_req,res)=>res.type("html").send(fs.readFileSync(new URL("./assessment-page.html",import.meta.url),"utf8")));
app.post("/assessment",async(req,res)=>{try{const x=req.body||{};const vendorUrl=String(x.vendorUrl||"").trim();const evidence=String(x.evidence||"").trim();if(evidence.length<20)return res.status(400).json({error:"Provide at least 20 characters of evidence."});if(evidence.length>100000)return res.status(413).json({error:"Evidence exceeds the 100,000 character limit."});const result=assessEvidence({vendorName:String(x.vendorName||"").slice(0,160),vendorUrl:vendorUrl.slice(0,1000),evidence,notes:String(x.notes||"").slice(0,10000)});result._evidence=evidence;const assessmentId=await saveAssessment(result);delete result._evidence;res.json({...result,assessmentId,storage:storageConfigured()});}catch(e){console.error("ASSESSMENT_ERROR",e);res.status(400).json({error:e?.message||"unable to assess evidence"});}});

app.post("/assessment/report",async(req,res)=>{try{const x=req.body||{};if(!x.result||typeof x.result!=="object")return res.status(400).send("Assessment result required");res.type("html").send(renderReport(x.result,x.assessmentId||""));}catch(e){res.status(400).send("Unable to render report");}});
app.get("/assessment/report/:id",async(req,res)=>{try{const row=await getAssessment(String(req.params.id||""));if(!row)return res.status(404).send("Assessment not found");res.type("html").send(renderReport(row.result,row.id));}catch(e){res.status(500).send("Unable to load report");}});
app.post("/assessment/lead",async(req,res)=>{try{const x=req.body||{};const email=String(x.email||"").trim().toLowerCase();if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email))return res.status(400).json({error:"Valid email required"});const id=await saveLead({name:String(x.name||"").slice(0,120),email,company:String(x.company||"").slice(0,160),role:String(x.role||"").slice(0,120),source:"assessment",assessmentId:String(x.assessmentId||"").slice(0,80),metadata:{}});if(process.env.LEAD_WEBHOOK_URL)fetch(process.env.LEAD_WEBHOOK_URL,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:x.name,email,company:x.company,role:x.role,assessmentId:x.assessmentId,source:"assessment"})}).catch(()=>{});res.json({ok:true,id});}catch(e){res.status(500).json({error:"Unable to save lead"});}});
app.get("/health/storage",async(_req,res)=>{try{const r=await initStorage();res.json(r);}catch(e){console.error("STORAGE_HEALTH_ERROR",JSON.stringify({name:e?.name||"Error",code:e?.code||null,message:e?.message||"unknown"}));res.status(503).json({enabled:false,error:"database unavailable"});}});

app.get("/commercial",(_req,res)=>res.type("html").send(commercialPage()));
app.get("/partners",(_req,res)=>res.type("html").send('<html><body style="font-family:system-ui;max-width:900px;margin:60px auto;padding:24px"><h1>Vendor Intelligence for MSPs and MSSPs</h1><p>Deliver repeatable vendor risk assessments across multiple client engagements without rebuilding the same manual process each time.</p><ul><li>Multi-client workflow</li><li>Consistent assessment methodology</li><li>Human approval and review</li><li>Co-branded output</li></ul><a href="/commercial#pilot">Discuss a partner pilot</a> · <a href="/sample-report">See sample report</a></body></html>'));
app.get("/sample-report",(_req,res)=>res.type("html").send(fs.readFileSync(new URL("./sample-report.html",import.meta.url),"utf8")));
app.get("/demo",(_req,res)=>res.type("html").send(fs.readFileSync(new URL("./demo.html",import.meta.url),"utf8")));
app.post("/demo/vendor",async(req,res)=>{try{const url=String(req.body?.url||"").trim();if(!url)return res.status(400).json({error:"Provide a public vendor URL"});res.json(await vendorPreflight(url,req.body?.requirements));}catch(e){res.status(e?.name==="AbortError"?504:400).json({error:e?.name==="AbortError"?"target timed out":e?.message||"unable to preflight vendor"});}});
app.post("/pilot-request",async(req,res)=>{const x=req.body||{};const lead={receivedAt:new Date().toISOString(),name:String(x.name||"").slice(0,120),company:String(x.company||"").slice(0,160),email:String(x.email||"").slice(0,200),volume:String(x.volume||"").slice(0,80),vendorUrl:String(x.vendorUrl||"").slice(0,500),message:String(x.message||"").slice(0,3000)};console.log("PILOT_REQUEST "+JSON.stringify(lead));try{await saveLead({name:lead.name,email:lead.email,company:lead.company,source:"pilot-request",metadata:{volume:lead.volume,vendorUrl:lead.vendorUrl,message:lead.message}})}catch(e){console.error("PILOT_LEAD_STORAGE_ERROR",e.message)}if(process.env.LEAD_WEBHOOK_URL){fetch(process.env.LEAD_WEBHOOK_URL,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(lead)}).catch(()=>{});}res.type("html").send('<html><body style="font-family:system-ui;max-width:700px;margin:80px auto;padding:24px"><h1>Pilot request received</h1><p>Your request was recorded for follow-up.</p><a href="/commercial">Back to product</a></body></html>')});

const port=Number(process.env.PORT||10000);
app.listen(port,"0.0.0.0",()=>console.log("x402 service listening on "+port));