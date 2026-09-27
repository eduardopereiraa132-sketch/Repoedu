const url = process.env.API_URL || "https://repoedu-1.onrender.com/analyze";
const response = await fetch(url, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ text: "Test x402 payment request" })
});
console.log("HTTP", response.status);
console.log("Headers:", Object.fromEntries(response.headers.entries()));
console.log("Body:", await response.text());
if (response.status !== 402) process.exitCode = 1;
