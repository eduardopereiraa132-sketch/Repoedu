import fs from "node:fs";

const file = "server.js";
let source = fs.readFileSync(file, "utf8");
const marker = "// FAST_402_GATE_V1";
if (source.includes(marker)) process.exit(0);

const insertion = `
${marker}
const BASE_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
function dollarsToAtomic(value){
  const n=Number(String(value).replace(/^\\$/,""));
  if(!Number.isFinite(n)||n<=0) throw new Error("Invalid route price");
  return String(Math.round(n*1_000_000));
}
function fast402(req,res,next){
  if(!["POST"].includes(req.method)) return next();
  const path=req.path;
  const cfg=routes[path];
  if(!cfg) return next();
  const paymentSignature=req.get("PAYMENT-SIGNATURE");
  if(paymentSignature) return next();
  const accepts=cfg.accepts;
  const priceValue=typeof accepts.price==="string"?accepts.price:price;
  const paymentRequired={
    x402Version:2,
    error:"PAYMENT-SIGNATURE header is required",
    resource:{
      url:publicUrl+path,
      description:cfg.resource?.description||cfg.description||"Paid API resource",
      mimeType:cfg.mimeType||"application/json",
      serviceName:cfg.resource?.serviceName||"Agent Web & Security Intelligence"
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
    extensions:{}
  };
  const encoded=Buffer.from(JSON.stringify(paymentRequired),"utf8").toString("base64");
  res.status(402).set("PAYMENT-REQUIRED",encoded).json(paymentRequired);
}
app.use(fast402);
`;

const target = "app.use(paymentMiddleware(routes,x402Server));";
if(!source.includes(target)) throw new Error("x402 middleware target not found");
source = source.replace(target, insertion + "\n" + target);
fs.writeFileSync(file, source);
console.log("Installed fast 402 gate");
