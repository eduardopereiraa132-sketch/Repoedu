import fs from "node:fs";

const file = "server.js";
let source = fs.readFileSync(file, "utf8");
const marker = "// FAST_402_GATE_V2";
const oldGate=/\n\/\/ FAST_402_GATE_V[12][\\s\\S]*?\napp\.use\(fast402\);\n/g;
source=source.replace(oldGate,"\n");
if (source.includes(marker)) {
  fs.writeFileSync(file, source);
  process.exit(0);
}

const insertion = `
${marker}
const BASE_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
function dollarsToAtomic(value){
  const n=Number(String(value).replace(/^\\$/,""));
  if(!Number.isFinite(n)||n<=0) throw new Error("Invalid route price");
  return String(Math.round(n*1_000_000));
}
const BAZAAR_BY_PATH = {
  "/vendor-preflight": {
    input: {type:"http",method:"POST",bodyType:"json",body:{url:"https://vendor.example",requirements:["access control","incident response","data protection"]}},
    inputSchema: {type:"object",properties:{url:{type:"string",format:"uri",description:"Public vendor website URL."},requirements:{type:"array",items:{type:"string"}}},required:["url"]},
    outputExample:{service:"Vendor Security Preflight",status:200,https:true,publicSignalLevel:"observable",gaps:["Current assurance evidence not found publicly"],nextQuestions:["Provide current assurance evidence"],limitations:["Public first-pass only"]}
  },
  "/site-audit": {
    input:{type:"http",method:"POST",bodyType:"json",body:{url:"https://vendor.example"}},
    inputSchema:{type:"object",properties:{url:{type:"string",format:"uri",description:"Public website URL."}},required:["url"]},
    outputExample:{service:"Website Security Preflight",status:200,https:true,securityHeaders:{hsts:true},cookieSecurity:{secure:true},findings:["Observable configuration recorded; not a penetration test."]}
  },
  "/web-extract": {
    input:{type:"http",method:"POST",bodyType:"json",body:{url:"https://vendor.example"}},
    inputSchema:{type:"object",properties:{url:{type:"string",format:"uri",description:"Public webpage URL."}},required:["url"]},
    outputExample:{service:"Webpage Extractor",status:200,title:"Example vendor",headings:["About","Security"],wordCount:120}
  },
  "/analyze": {
    input:{type:"http",method:"POST",bodyType:"json",body:{text:"Paste the business document text to triage."}},
    inputSchema:{type:"object",properties:{text:{type:"string",maxLength:50000,description:"Business/security document text."}},required:["text"]},
    outputExample:{service:"Business Document Analyzer",wordCount:120,dates:["2026-12-31"],monetaryAmounts:["US$10,000"],obligations:["Notify within 72 hours"],securitySignals:["access control"],missingAreas:["retention period"],riskFlags:[]}
  }
};

function buildFastBazaar(path,cfg){
  const declared = BAZAAR_BY_PATH[path];
  if(!declared) return {};
  const info = {input:declared.input,output:{type:"json",example:declared.outputExample}};
  const schema = {
    "$schema":"https://json-schema.org/draft/2020-12/schema",
    type:"object",
    properties:{
      input:{type:"object",properties:{
        type:{type:"string",const:"http"},
        method:{type:"string",enum:["POST","PUT","PATCH"]},
        bodyType:{type:"string",enum:["json","form-data","text"]},
        body:{type:"object"}
      },required:["type","method","bodyType","body"]},
      output:{type:"object",properties:{
        type:{type:"string",const:"json"},
        example:{type:"object"}
      },required:["type","example"]}
    },
    required:["input"]
  };
  return {bazaar:{info,schema}};
}

function fast402(req,res,next){
  if(req.method!=="POST") return next();
  const path=req.path;
  const cfg=routes[path];
  if(!cfg) return next();
  if(req.get("PAYMENT-SIGNATURE")||req.get("X-PAYMENT")) return next();
  const accepts=cfg.accepts;
  const priceValue=typeof accepts.price==="string"?accepts.price:price;
  const resource=cfg.resource||{};
  const paymentRequired={
    x402Version:2,
    error:"PAYMENT-SIGNATURE header is required",
    resource:{
      url:publicUrl+path,
      description:resource.description||cfg.description||"Paid API resource",
      mimeType:resource.mimeType||cfg.mimeType||"application/json",
      serviceName:resource.serviceName||"Agent Web & Security Intelligence",
      tags:Array.isArray(resource.tags)?resource.tags.slice(0,5):undefined,
      iconUrl:resource.iconUrl||undefined
    },
    accepts:[{
      scheme:"exact",network:network,amount:dollarsToAtomic(priceValue),asset:BASE_USDC,payTo:payTo,
      maxTimeoutSeconds:300,extra:{name:"USD Coin",version:"2",assetTransferMethod:"eip3009"}
    }],
    extensions:buildFastBazaar(path,cfg)
  };
  const encoded=Buffer.from(JSON.stringify(paymentRequired),"utf8").toString("base64");
  res.status(402).set("PAYMENT-REQUIRED",encoded).set("Cache-Control","no-store").json(paymentRequired);
}
app.use(fast402);
`;

const target="app.use(paymentMiddleware(routes,x402Server));";
if(!source.includes(target)) throw new Error("x402 middleware target not found");
source=source.replace(target,insertion+"\n"+target);
fs.writeFileSync(file,source);
console.log("Installed fast 402 gate with Bazaar metadata");
