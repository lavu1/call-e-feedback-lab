import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const evidencePath = `${projectRoot}/evidence/sdk-version-check.json`;
const documentedVersion = "0.2.0";
const registryUrl = "https://registry.npmjs.org/@call-e%2Fcalle/latest";

const response = await fetch(registryUrl, { headers: { Accept: "application/json" } });
if (!response.ok) throw new Error(`npm registry returned HTTP ${response.status}.`);
const metadata = await response.json();

const evidence = {
  evidence_version: 1,
  kind: "official-sdk-version-comparison",
  observed_at: new Date().toISOString(),
  command: "npm view @call-e/calle version engines dist-tags --json",
  sources: {
    documented_claim: "https://github.com/CALLE-AI/call-e-integrations#sdk",
    package_registry: "https://www.npmjs.com/package/@call-e/calle",
  },
  documented_current_version: documentedVersion,
  registry_latest_version: metadata.version,
  comparison: metadata.version === documentedVersion ? "match" : "mismatch",
  limitations: [
    "This verifies public documentation and registry metadata only.",
    "No SDK method, authenticated API request, or phone call was executed.",
  ],
};

await mkdir(`${projectRoot}/evidence`, { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);

