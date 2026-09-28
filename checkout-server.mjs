import express from "express";

const app = express();
app.use(express.json({limit:"1mb"}));
app.use(express.static("public"));

const PORT = process.env.PORT || 10000;
const PAY_TO = process.env.PAY_TO || "0x031a713863890eb611776aadd48397873ed153ab";
const RPC_URL = process.env.BASE_RPC_URL || "https://mainnet.base.org";
const USDC = (process.env.USDC_CONTRACT || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913").toLowerCase();
const EXPLORER = "https://basescan.org/tx/";
const intents = new Map();

const PRODUCTS = {
  "document": { name:"Business Document Analyzer", amount:"0.005", endpoint:"/analyze" },
  "site": { name:"Website Security Preflight", amount:"0.01", endpoint:"/site-audit" },
  "vendor": { name:"Vendor Security Preflight", amount:"0.025", endpoint:"/vendor-preflight" }
};

function units(decimal){
  const [a,b=""] = String(decimal).split(".");
  return BigInt(a)*1000000n + BigInt((b+"000000").slice(0,6));
}
function normalizeAddress(v){ return typeof v === "string" && /^0x[a-fA-F0-9]{40}$/.test(v) ? v.toLowerCase() : null; }
async function rpc(method, params){
  const r = await fetch(RPC_URL,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method,params})});
  const j=await r.json(); if(j.error) throw new Error(j.error.message||"RPC error"); return j.result;
}
function decodeTransfer(log){
  if(!log?.topics || log.topics[0]?.toLowerCase()!=="0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef") return null;
  const from="0x"+log.topics[1].slice(-40), to="0x"+log.topics[2].slice(-40);
  return {from:from.toLowerCase(),to:to.toLowerCase(),value:BigInt(log.data)};
}
async function findPayment(txHash, expectedAmount){
  const tx=await rpc("eth_getTransactionReceipt",[txHash]);
  if(!tx) return {confirmed:false,reason:"Transaction not mined yet."};
  if(tx.status!=="0x1") return {confirmed:false,reason:"Transaction failed on-chain."};
  for(const log of tx.logs||[]){
    if(String(log.address).toLowerCase()!==USDC) continue;
    const t=decodeTransfer(log); if(!t) continue;
    if(t.to===PAY_TO.toLowerCase() && t.value>=expectedAmount){
      return {confirmed:true,from:t.from,to:t.to,value:t.value.toString(),txHash};
    }
  }
  return {confirmed:false,reason:"No matching USDC transfer to the merchant address was found in this transaction."};
}

app.get("/health",(_,res)=>res.json({ok:true,service:"EvidenceCheck Checkout",network:"Base Mainnet",asset:"USDC"}));
app.get("/config",(_,res)=>res.json({network:"Base Mainnet",chainId:8453,asset:"USDC",merchant:PAY_TO,products:PRODUCTS}));
app.post("/create-intent",(req,res)=>{
  const product=PRODUCTS[req.body?.product||"vendor"];
  if(!product) return res.status(400).json({error:"Unknown product"});
  const id=crypto.randomUUID();
  intents.set(id,{id,product,amount:product.amount,createdAt:Date.now(),paid:false});
  res.json({id,product:product.name,amount:product.amount,asset:"USDC",network:"Base",chainId:8453,merchant:PAY_TO,usdcContract:USDC,expiresInSeconds:1800});
});
app.post("/verify",async(req,res)=>{
  const {id,txHash}=req.body||{}; const intent=intents.get(id);
  if(!intent) return res.status(404).json({error:"Payment intent not found or expired."});
  if(!/^0x[a-fA-F0-9]{64}$/.test(txHash||"")) return res.status(400).json({error:"Invalid transaction hash."});
  try{
    const result=await findPayment(txHash,units(intent.amount));
    if(result.confirmed){intent.paid=true;intent.txHash=txHash;return res.json({paid:true,product:intent.product.name,amount:intent.amount,txHash,explorer:EXPLORER+txHash,nextStep:`Payment verified. Use ${intent.product.endpoint} with your request.`});}
    return res.json({paid:false,reason:result.reason});
  }catch(e){return res.status(502).json({paid:false,reason:e.message});}
});

app.listen(PORT,"0.0.0.0",()=>console.log(`EvidenceCheck checkout listening on ${PORT}`));
