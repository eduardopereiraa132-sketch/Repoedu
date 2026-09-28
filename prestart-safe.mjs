import fs from "node:fs";

const file = "server.js";
let source = fs.readFileSync(file, "utf8");
const marker = "// SAFE_PUBLIC_LANDING_V1";
if (!source.includes(marker)) {
  const target = "app.listen(";
  if (!source.includes(target)) throw new Error("server listen target not found");
  const insertion = `${marker}\napp.use((req,res,next)=>{\n  if(req.path === "/") return res.sendFile("index.html", {root:"public"});\n  next();\n});`;
  source = source.replace(target, insertion + "\n" + target);
  fs.writeFileSync(file, source);
}
console.log("Safe public landing: OK");
