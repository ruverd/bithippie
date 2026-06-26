import { writeFileSync } from "node:fs";
import { buildApp } from "../app";
import { buildContainer } from "../container";
import { getPrisma } from "../infrastructure/prisma";

// Build the app and ask it for its own OpenAPI document. No DB connection is
// made: the /openapi/json handler touches no repository, and PrismaClient
// connects lazily (only on the first query).
const app = buildApp(buildContainer(getPrisma()));
const res = await app.handle(new Request("http://localhost/openapi/json"));
if (res.status !== 200) {
  throw new Error(`OpenAPI export failed: status ${res.status}`);
}
const doc = await res.json();
const outUrl = new URL("../../openapi.json", import.meta.url); // -> apps/api/openapi.json
writeFileSync(outUrl, `${JSON.stringify(doc, null, 2)}\n`);
// eslint-disable-next-line no-console
console.log(`Wrote ${outUrl.pathname}`);
