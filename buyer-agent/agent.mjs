import express from "express";
import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { registerClientEvmScheme } from "@x402/evm/exact/client";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

const SELLER_URL = process.env.SELLER_URL || "https://repoedu.onrender.com";
const PORT = Number(process.env.PORT || 10000);
const ENABLE_LIVE_PAYMENTS = process.env.ENABLE_LIVE_PAYMENTS === "true";
const BUYER_PRIVATE_KEY = process.env.BUYER_PRIVATE_KEY || "";

const app = express();
app.use(express.json({ limit: "256kb" }));

async function getText(path) {
  const r = await fetch(new URL(path, SELLER_URL));
  return {
    status: r.status,
    headers: Object.fromEntries(r.headers.entries()),
    text: await r.text()
  };
}

function decodePaymentRequired(headers) {
  const value = headers["payment-required"];
  if (!value) return null;
  try {
    return JSON.parse(Buffer.from(value, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

async function probe() {
  const publicPaths = [
    "/health",
    "/openapi.json",
    "/llms.txt",
    "/.well-known/agent-card.json",
    "/.well-known/x402-discovery.json"
  ];

  const discovery = {};
  for (const path of publicPaths) {
    try {
      const r = await getText(path);
      discovery[path] = {
        status: r.status,
        bytes: Buffer.byteLength(r.text),
        contentType: r.headers["content-type"] || ""
      };
    } catch (error) {
      discovery[path] = { error: String(error?.message || error) };
    }
  }

  const target = new URL("/vendor-preflight", SELLER_URL).toString();
  const challenge = await fetch(target, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      url: "https://example.com",
      requirements: ["security", "privacy", "incident response"]
    })
  });

  const headers = Object.fromEntries(challenge.headers.entries());
  return {
    agent: "EvidenceCheck Buyer Agent",
    seller: SELLER_URL,
    target: "/vendor-preflight",
    challengeStatus: challenge.status,
    paymentRequired: decodePaymentRequired(headers),
    discovery
  };
}

async function paidCall() {
  if (!ENABLE_LIVE_PAYMENTS) {
    throw new Error("Live payments disabled. Set ENABLE_LIVE_PAYMENTS=true explicitly.");
  }
  if (!BUYER_PRIVATE_KEY) {
    throw new Error("BUYER_PRIVATE_KEY is required for a live payment run. Keep it only as a secret environment variable.");
  }

  const account = privateKeyToAccount(BUYER_PRIVATE_KEY);
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http()
  });

  const client = new x402Client();
  registerClientEvmScheme(client, { signer: walletClient });
  const paidFetch = wrapFetchWithPayment(fetch, client);

  const response = await paidFetch(new URL("/vendor-preflight", SELLER_URL), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      url: "https://example.com",
      requirements: ["security", "privacy", "incident response"]
    })
  });

  return {
    wallet: account.address,
    status: response.status,
    ok: response.ok,
    body: await response.text()
  };
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    agent: "EvidenceCheck Buyer Agent",
    livePaymentsEnabled: ENABLE_LIVE_PAYMENTS
  });
});

app.get("/simulate", async (_req, res) => {
  try {
    res.json(await probe());
  } catch (error) {
    res.status(502).json({ ok: false, error: String(error?.message || error) });
  }
});

app.post("/buy", async (_req, res) => {
  try {
    res.json(await paidCall());
  } catch (error) {
    res.status(400).json({ ok: false, error: String(error?.message || error) });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("EvidenceCheck Buyer Agent listening on " + PORT);
  console.log("Seller: " + SELLER_URL);
});
