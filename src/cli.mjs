#!/usr/bin/env node
import { existsSync } from "node:fs";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CalleApiError,
  buildCallRequest,
  createCall,
  doctor,
  errorEvidence,
  evidenceEnvelope,
  readCall,
  readEvents,
  sanitizeEvidence,
} from "./lab.mjs";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const envPath = `${projectRoot}/.env`;
const localDir = `${projectRoot}/.local`;
const evidenceDir = `${projectRoot}/evidence`;
const statePath = `${localDir}/run.json`;

if (existsSync(envPath)) process.loadEnvFile(envPath);

function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function writeJson(path, value, mode) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  if (mode) await chmod(path, mode);
}

async function writeEvidence(kind, payload) {
  const path = `${evidenceDir}/${stamp()}-${kind}.json`;
  await writeJson(path, evidenceEnvelope(kind, payload));
  return path;
}

async function getCallId() {
  if (process.env.CALLE_CALL_ID) return process.env.CALLE_CALL_ID;
  if (!existsSync(statePath)) {
    throw new Error("Set CALLE_CALL_ID or run the authorized create command first.");
  }
  const state = JSON.parse(await readFile(statePath, "utf8"));
  return state.call_id;
}

async function main() {
  const command = process.argv[2] || "doctor";
  if (command === "doctor") {
    print(doctor());
    return;
  }
  if (command === "preview") {
    const request = buildCallRequest();
    print({
      network_action: "none",
      live_call_placed: false,
      idempotency_key: request.idempotencyKey,
      request: sanitizeEvidence(request.body),
    });
    return;
  }
  if (command === "create") {
    try {
      const result = await createCall();
      const callId = result.data?.id;
      if (!callId) throw new Error("CALL-E create response did not include a top-level call id.");
      await writeJson(
        statePath,
        {
          call_id: callId,
          idempotency_key: process.env.CALLE_IDEMPOTENCY_KEY,
          base_url: process.env.CALLE_BASE_URL || "https://api.heycall-e.com",
          created_at: new Date().toISOString(),
        },
        0o600,
      );
      const evidencePath = await writeEvidence("call-create", result);
      print({ call_id: callId, evidence: evidencePath, next: "npm run status" });
    } catch (error) {
      if (error instanceof CalleApiError) {
        const evidencePath = await writeEvidence("call-create-error", errorEvidence(error));
        error.evidencePath = evidencePath;
      }
      throw error;
    }
    return;
  }
  if (command === "status") {
    try {
      const callId = await getCallId();
      const [call, events] = await Promise.all([readCall(callId), readEvents(callId)]);
      const evidencePath = await writeEvidence("call-status", { call_id: callId, call, events });
      print({
        call_id: callId,
        status: call.data?.status ?? null,
        evidence: evidencePath,
      });
    } catch (error) {
      if (error instanceof CalleApiError) {
        const evidencePath = await writeEvidence("call-status-error", errorEvidence(error));
        error.evidencePath = evidencePath;
      }
      throw error;
    }
    return;
  }
  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  print({
    status: "error",
    error: errorEvidence(error),
    evidence: error.evidencePath || null,
  });
  process.exitCode = 1;
});

