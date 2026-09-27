import express from "express";

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => res.json({ ok: true, service: "x402-business-agent" }));

app.post("/analyze", (req, res) => {
  const text = String(req.body?.text || "").trim();
  if (!text) return res.status(400).json({ error: "Provide JSON {text:string}" });
  res.json({
    service: "Business Document Analyzer",
    wordCount: text.split(/\s+/).filter(Boolean).length,
    status: "ok"
  });
});

const port = Number(process.env.PORT || 10000);
app.listen(port, "0.0.0.0", () => console.log("Listening on " + port));
