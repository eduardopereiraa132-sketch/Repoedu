import fs from "node:fs";

const file = "server.js";
let source = fs.readFileSync(file, "utf8");
const marker = "// FAST_402_GATE_V2";
if (source.includes(marker)) process.exit(0);

const insertion = `
${marker}
const BASE_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
function dollarsToAtomic(value){
  const n=Number(String(value).replace(/^\\$/,""));
  if(!Number.isFinite(n)||n<=0) throw new Error("Invalid route price");
  return String(Math.round(n*1_000_000));
}
function buildFastBazaar(cfg){
  const declared=cfg.extensions?.bazaar;
  if(!declared) return {};
  const info=declared.info ? structuredClone(declared.info) : {};
  if(info.input){
    info.input={type:"http",method:"POST",...info.input};
  } else {
    info.input={type:"http",method:"POST"};
  }
  if(info.output){
    info.output={type:"json",...info.output};
  }
  return {bazaar:{info,schema:declared.schema||{type:"object",properties:{}}}};
}
function fast402(req,res,next){
  if(req.method!=="POST") return next();
  const path=req.path;
  const cfg=routes[path];
  if(!cfg) return next();
  if(req.get("PAYMENT-SIGNATURE")) return next();
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
      scheme:"exact",
      network:network,
      amount:dollarsToAtomic(priceValue),
      asset:BASE_USDC,
      payTo:payTo,
      maxTimeoutSeconds:300,
      extra:{name:"USDC",version:"2"}
    }],
    extensions:buildFastBazaar(cfg)
  };
  const encoded=Buffer.from(JSON.stringify(paymentRequired),"utf8").toString("base64");
  res.status(402).set("PAYMENT-REQUIRED",encoded).set("Cache-Control","no-store").json(paymentRequired);
}
app.use(fast402);
`;

const target = "app.use(paymentMiddleware(routes,x402Server));";
if(!source.includes(target)) throw new Error("x402 middleware target not found");
source = source.replace(target, insertion + "\n" + target);
fs.writeFileSync(file, source);
console.log("Installed fast 402 gate with Bazaar metadata");
