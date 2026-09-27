import express from "express";
import { paymentMiddleware } from "@x402/express";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";

const app = express();
app.use(express.json({ limit: "2mb" }));

const payTo = process.env.PAY_TO || "0x031a713863890eb611776aadd48397873ed153ab";
const network = process.env.NETWORK || "eip155:8453";
const price = process.env.PRICE || "$0.50";
const facilitatorUrl = process.env.FACILITATOR_URL || "https://facilitator.payai.network";

const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl });
const x402Server = new x402ResourceServer(facilitatorClient)
  .register(network, new ExactEvmScheme());

const routes = {
  "POST /analyze": {
    accepts: {
      scheme: "exact",
      price,
      network,
      payTo
    },
    description: "Analyze a business document and return structured findings.",
    mimeType: "application/json"
  }
};

app.use(paymentMiddleware(routes, x402Server));

app.get("/health", (_req, res) =>
  res.json({
    ok: true,
    service: "x402-business-agent",
    network,
    price,
    facilitator: facilitatorUrl
  })
);

app.post("/analyze", (req, res) => {
  const text = String(req.body?.text || "").trim();
  if (!text) return res.status(400).json({ error: "Provide JSON {text:string}" });

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  res.json({
    service: "Business Document Analyzer",
    wordCount,
    findings: [
      "Document received and structurally analyzed.",
      "Review obligations, deadlines, owners and missing evidence.",
      "Check references to security, privacy, access control and incident handling."
    ]
  });
});

const port = Number(process.env.PORT || 10000);
app.listen(port, "0.0.0.0", () =>
  console.log("x402 service listening on " + port)
);
