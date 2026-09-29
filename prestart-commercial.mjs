import fs from "node:fs";

// Legacy compatibility: the canonical server now contains its own stable buyer landing page.
// Do not mutate server.js at boot; generated string injection previously caused production syntax errors.
console.log("Commercial prestart skipped: stable landing is built into server.js");
