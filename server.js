import express from "express";
import { paymentMiddleware } from "@x402/express";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import {
  bazaarResourceServerExtension,
  declareDiscoveryExtension
} from "@x402/extensions/bazaar";

const app = express();
app.use(express.json({ limit: "2mb" }));

const payTo = process.env.PAY_TO || "0x031a713863890eb611776aadd48397873ed153ab";
const network = process.env.NETWORK || "eip155:8453";
const price = process.env.PRICE || "$0.50";
const facilitatorUrl = process.env.FACILITATOR_URL || "https://facilitator.payai.network";
const publicUrl = process.env.PUBLIC_URL || "https://repoedu-1.onrender.com";

const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl });
const x402Server = new x402ResourceServer(facilitatorClient)
  .register(network, new ExactEvmScheme())
  .registerExtension(bazaarResourceServerExtension);

const inputSchema = {
  type: "object",
  properties: {
    text: {
      type: "string",
      description: "Plain-text business document to analyze. Recommended: up to 50,000 characters."
    }
  },
  required: ["text"]
};

const outputSchema = {
  type: "object",
  properties: {
    service: { type: "string" },
    wordCount: { type: "integer" },
    characterCount: { type: "integer" },
    dates: { type: "array", items: { type: "string" } },
    monetaryAmounts: { type: "array", items: { type: "string" } },
    obligations: { type: "array", items: { type: "string" } },
    securitySignals: { type: "array", items: { type: "string" } },
    missingAreas: { type: "array", items: { type: "string" } },
    riskFlags: { type: "array", items: { type: "string" } }
  },
  required: [
    "service",
    "wordCount",
    "characterCount",
    "dates",
    "monetaryAmounts",
    "obligations",
    "securitySignals",
    "missingAreas",
    "riskFlags"
  ]
};

const routes = {
  "POST /analyze": {
    accepts: {
      scheme: "exact",
      price,
      network,
      payTo
    },
    resource: {
      url: publicUrl + "/analyze",
      description:
        "Analyze a business document and extract obligations, dates, monetary amounts, security signals, missing areas and risk flags. Returns deterministic structured JSON suitable for downstream AI-agent workflows.",
      mimeType: "application/json",
      serviceName: "Business Document Analyzer",
      tags: ["documents", "compliance", "contracts", "security", "risk"]
    },
    description:
      "Paid business-document analysis. Send JSON {text:string}. The response is structured for machine consumption.",
    mimeType: "application/json",
    extensions: {
      ...declareDiscoveryExtension({
        input: {
          text: "Supplier must provide incident notification within 24 hours. Contract expires on 30/11/2026."
        },
        inputSchema,
        bodyType: "json",
        output: {
          example: {
            service: "Business Document Analyzer",
            wordCount: 13,
            characterCount: 105,
            dates: ["30/11/2026", "24 hours"],
            monetaryAmounts: [],
            obligations: [
              "Supplier must provide incident notification within 24 hours."
            ],
            securitySignals: ["incident notification"],
            missingAreas: ["access control", "data retention"],
            riskFlags: ["deadline/obligation detected"]
          },
          schema: outputSchema
        }
      })
    }
  }
};

app.use(paymentMiddleware(routes, x402Server));

app.get("/", (_req, res) => {
  res.json({
    service: "Business Document Analyzer",
    description:
      "Machine-readable business document analysis for AI agents and automation workflows.",
    payment: {
      protocol: "x402",
      price,
      network,
      recipient: payTo
    },
    endpoint: {
      method: "POST",
      path: "/analyze",
      contentType: "application/json",
      body: { text: "business document text" }
    },
    discovery: {
      protocol: "x402 Bazaar",
      resource: publicUrl + "/analyze"
    }
  });
});

app.get("/health", (_req, res) =>
  res.json({
    ok: true,
    service: "x402-business-agent",
    network,
    price,
    facilitator: facilitatorUrl
  })
);


app.get("/.well-known/x402", (_req, res) => {
  res.json({
    x402Version: 2,
    service: "Business Document Analyzer",
    description: "Paid machine-readable business-document analysis for AI agents.",
    endpoints: [
      {
        method: "POST",
        path: "/analyze",
        url: publicUrl + "/analyze",
        price: price,
        network: network,
        asset: "USDC",
        payTo: payTo,
        contentType: "application/json"
      }
    ],
    discovery: {
      protocol: "x402-bazaar",
      resource: publicUrl + "/analyze"
    },
    docs: publicUrl + "/openapi.json",
    llms: publicUrl + "/llms.txt"
  });
});

app.get("/skill.md", (_req, res) => {
  res.type("text/markdown").send(`# Business Document Analyzer

## Purpose
Extract structured business-document signals for downstream AI-agent workflows.

## Paid endpoint
POST ${publicUrl}/analyze

Payment: x402 v2, exact scheme, Base Mainnet (eip155:8453), USDC, ${price} per request.
Payee: ${payTo}

## Input
JSON object:
{"text":"business document text"}

## Output
JSON fields:
service, wordCount, characterCount, dates, monetaryAmounts, obligations, securitySignals, missingAreas, riskFlags

## Limits
Maximum input size: 50,000 characters.

## Machine-readable docs
- ${publicUrl}/openapi.json
- ${publicUrl}/llms.txt
- ${publicUrl}/.well-known/x402
`);
});

app.get("/openapi.json", (_req, res) => {
  res.json({
    openapi: "3.1.0",
    info: {
      title: "Business Document Analyzer",
      version: "1.0.0",
      description:
        "Paid document-analysis endpoint for AI agents. Payment is handled with x402."
    },
    servers: [{ url: publicUrl }],
    paths: {
      "/analyze": {
        post: {
          summary: "Analyze a business document",
          description:
            "Extract obligations, dates, monetary amounts, security signals, missing areas and risk flags.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: inputSchema
              }
            }
          },
          responses: {
            "200": {
              description: "Structured analysis",
              content: {
                "application/json": { schema: outputSchema }
              }
            },
            "402": {
              description: "x402 payment required"
            }
          }
        }
      }
    }
  });
});

function unique(values) {
  return [...new Set(values)];
}

function extract(text) {
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const dates = unique(
    [
      ...(text.match(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g) || []),
      ...(text.match(/\b\d{1,3}\s+(?:days?|d[ií]as?|hours?|horas?|months?|meses?|years?|a[nñ]os?)\b/gi) || [])
    ]
  );

  const monetaryAmounts = unique(
    text.match(/(?:USD|US\$|U\$S|EUR|€|\$)\s?\d[\d.,]*/gi) || []
  );

  const obligationPattern =
    /\b(must|shall|required to|will|debe|deber[aá]|deber[aá]n|obligaci[oó]n|deber[aá] cumplir|es obligatorio)\b/i;

  const obligations = sentences.filter((s) => obligationPattern.test(s)).slice(0, 20);

  const signalTerms = [
    "security",
    "seguridad",
    "privacy",
    "privacidad",
    "personal data",
    "datos personales",
    "access control",
    "control de acceso",
    "incident",
    "incidente",
    "breach",
    "brecha",
    "encryption",
    "cifrado",
    "backup",
    "respaldo",
    "retention",
    "retención",
    "audit",
    "auditoría"
  ];

  const securitySignals = signalTerms.filter((term) =>
    new RegExp(term, "i").test(text)
  );

  const expectedAreas = [
    ["access control", /access control|control de acceso/i],
    ["incident handling", /incident|incidente|breach|brecha/i],
    ["data protection", /personal data|datos personales|privacy|privacidad/i],
    ["retention", /retention|retención/i],
    ["audit/evidence", /audit|auditor[ií]a|evidence|evidencia/i]
  ];

  const missingAreas = expectedAreas
    .filter(([, pattern]) => !pattern.test(text))
    .map(([name]) => name);

  const riskFlags = [];
  if (obligations.length) riskFlags.push("obligations detected");
  if (dates.length) riskFlags.push("deadlines or time periods detected");
  if (missingAreas.length >= 3) riskFlags.push("several expected control areas are not mentioned");
  if (/penalt(y|ies)|penalidad|multa|indemniz/i.test(text))
    riskFlags.push("penalty or indemnity language detected");

  return {
    service: "Business Document Analyzer",
    wordCount: text.split(/\s+/).filter(Boolean).length,
    characterCount: text.length,
    dates,
    monetaryAmounts,
    obligations,
    securitySignals,
    missingAreas,
    riskFlags
  };
}

app.post("/analyze", (req, res) => {
  const text = String(req.body?.text || "").trim();

  if (!text) {
    return res.status(400).json({
      error: "Provide JSON {text:string}"
    });
  }

  if (text.length > 50000) {
    return res.status(413).json({
      error: "text exceeds the 50,000 character limit"
    });
  }

  res.json(extract(text));
});

const port = Number(process.env.PORT || 10000);
app.listen(port, "0.0.0.0", () =>
  console.log("x402 service listening on " + port)
);
