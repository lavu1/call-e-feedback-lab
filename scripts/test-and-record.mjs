import { spawn } from "node:child_process";
import os from "node:os";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const evidencePath = `${projectRoot}/evidence/local-harness-tests.json`;
const startedAt = new Date().toISOString();

const child = spawn(process.execPath, ["--test", "test/harness.test.mjs"], {
  cwd: projectRoot,
  env: process.env,
  shell: false,
});

let stdout = "";
let stderr = "";
child.stdout.on("data", (chunk) => {
  stdout += chunk;
  process.stdout.write(chunk);
});
child.stderr.on("data", (chunk) => {
  stderr += chunk;
  process.stderr.write(chunk);
});

const result = await new Promise((resolve) => {
  child.on("error", (error) => resolve({ code: 1, signal: null, error: error.message }));
  child.on("close", (code, signal) => resolve({ code: code ?? 1, signal, error: null }));
});

const evidence = {
  evidence_version: 1,
  kind: "local-harness-tests",
  started_at: startedAt,
  finished_at: new Date().toISOString(),
  command: "node --test test/harness.test.mjs",
  environment: {
    node: process.version,
    platform: process.platform,
    os_release: os.release(),
  },
  scope: {
    network_target: "loopback-only mock HTTP servers",
    official_call_e_api_contacted: false,
    live_phone_call_placed: false,
    mock_data_used: true,
  },
  exit_code: result.code,
  signal: result.signal,
  spawn_error: result.error,
  stdout,
  stderr,
};

await mkdir(`${projectRoot}/evidence`, { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
process.exitCode = result.code;

