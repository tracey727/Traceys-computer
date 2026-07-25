import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { getPublicHealth } from "../lib/super-response.js";

const requiredFiles = [
  "index.html",
  "styles.css",
  "app.js",
  "server.mjs",
  "api/super-response.js",
  "api/health.js",
  "lib/super-response.js",
  "vercel.json",
  ".env.example",
];

for (const file of requiredFiles) {
  await access(new URL(`../${file}`, import.meta.url), constants.R_OK);
}

JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
JSON.parse(await readFile(new URL("../manifest.webmanifest", import.meta.url), "utf8"));

const health = getPublicHealth({});
if (!health.ok) throw new Error("Health configuration check failed.");

console.log(`Project check passed: ${requiredFiles.length} required files, valid JSON and importable server logic.`);
