import os from "node:os";

export const OFFICIAL_BASE_URL = "https://api.heycall-e.com";
export const LIVE_ACK = "I_AUTHORIZED_ONE_TEST_CALL";

const SUPPORTED_REGIONS = new Set([
  "AE", "AU", "BD", "BR", "BW", "CA", "CM", "DE", "EG", "ES", "FI",
  "FR", "GB", "GH", "HN", "ID", "IE", "IL", "IN", "JP", "KE", "LK",
  "MX", "MY", "MZ", "NA", "NG", "NL", "OM", "PH", "PK", "PL", "SA",
  "SG", "TH", "TN", "TR", "TW", "UA", "US", "VN", "ZA",
]);

const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;
const IDEMPOTENCY_PATTERN = /^[A-Za-z0-9._:-]{8,128}$/;

export class CalleApiError extends Error {
  constructor(message, { status, body, requestId }) {
    super(message);
    this.name = "CalleApiError";
    this.status = status;
    this.body = body;
    this.requestId = requestId;
  }
}

function required(env, name) {
  const value = env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function normalizedBaseUrl(env) {
  const value = (env.CALLE_BASE_URL || OFFICIAL_BASE_URL).replace(/\/+$/, "");
  if (value !== OFFICIAL_BASE_URL && env.CALLE_ALLOW_NON_OFFICIAL_BASE_URL !== "yes") {
    throw new Error(
      "A non-official CALLE_BASE_URL requires CALLE_ALLOW_NON_OFFICIAL_BASE_URL=yes. " +
        "Use that override only for a controlled local mock server.",
    );
  }
  return value;
}

export function buildCallRequest(env = process.env) {
  const phone = required(env, "CALLE_TEST_PHONE");
  const region = required(env, "CALLE_TEST_REGION").toUpperCase();
  const locale = required(env, "CALLE_TEST_LOCALE");
  const idempotencyKey = required(env, "CALLE_IDEMPOTENCY_KEY");

  if (!PHONE_PATTERN.test(phone)) {
    throw new Error("CALLE_TEST_PHONE must be an E.164 number such as +15551234567.");
  }
  if (!SUPPORTED_REGIONS.has(region)) {
    throw new Error(
      `CALLE_TEST_REGION=${region} is not in the CALL-E coverage table reviewed on 2026-09-11.`,
    );
  }
  if (!IDEMPOTENCY_PATTERN.test(idempotencyKey)) {
    throw new Error(
      "CALLE_IDEMPOTENCY_KEY must be 8-128 characters using letters, numbers, dot, underscore, colon, or hyphen.",
    );
  }

  return {
    idempotencyKey,
    body: {
      task:
        "Call the consenting test recipient, identify this as a CALL-E integration test, " +
        "and ask them to role-play a supplier. Ask whether 25 fictional Acme filter units " +
        "are available this week. Do not place an order, promise payment, or contact anyone else.",
      recipients: [{ phones: [phone], region, locale }],
      result_schema: {
        type: "object",
        required: ["availability", "quantity_confirmed", "timing", "evidence_summary"],
        properties: {
          availability: {
            type: "string",
            enum: ["yes", "no", "unknown"],
            description:
              "Whether the role-play supplier clearly said the fictional units are available. Use unknown for unclear evidence.",
          },
          quantity_confirmed: {
            type: "string",
            enum: ["yes", "no", "unknown"],
            description:
              "Whether availability of all 25 fictional units was clearly confirmed. Use unknown for unclear evidence.",
          },
          timing: {
            type: "string",
            description:
              "The availability timing stated by the recipient, or an empty string if none was established.",
          },
          evidence_summary: {
            type: "string",
            description:
              "One concise paraphrase of the call evidence supporting the classification.",
          },
        },
        additionalProperties: false,
      },
      metadata: {
        workflow: "call-e-feedback-lab",
        scenario: "supplier-availability-role-play",
      },
    },
  };
}

export function doctor(env = process.env) {
  const region = env.CALLE_TEST_REGION?.trim().toUpperCase() || null;
  const phone = env.CALLE_TEST_PHONE?.trim() || null;
  const idempotencyKey = env.CALLE_IDEMPOTENCY_KEY?.trim() || null;
  const checks = {
    api_key_present: Boolean(env.CALLE_API_KEY?.trim()),
    api_key_prefix_matches_current_docs: env.CALLE_API_KEY
      ? env.CALLE_API_KEY.startsWith("iams_live_")
      : null,
    recipient_phone_present: Boolean(phone),
    recipient_phone_is_e164: phone ? PHONE_PATTERN.test(phone) : null,
    region_present: Boolean(region),
    region_in_reviewed_coverage_table: region ? SUPPORTED_REGIONS.has(region) : null,
    locale_present: Boolean(env.CALLE_TEST_LOCALE?.trim()),
    consent_confirmed: env.CALLE_CONSENT_CONFIRMED === "yes",
    consent_reference_present: Boolean(env.CALLE_CONSENT_REFERENCE?.trim()),
    live_ack_exact: env.CALLE_LIVE_ACK === LIVE_ACK,
    idempotency_key_present: Boolean(idempotencyKey),
    idempotency_key_valid: idempotencyKey ? IDEMPOTENCY_PATTERN.test(idempotencyKey) : null,
  };

  return {
    status: Object.values(checks).every((value) => value === true) ? "ready" : "not_ready",
    network_action: "none",
    live_call_placed: false,
    environment: {
      node: process.version,
      platform: process.platform,
      os_release: os.release(),
      base_url: env.CALLE_BASE_URL || OFFICIAL_BASE_URL,
    },
    checks,
    required_live_ack: LIVE_ACK,
  };
}

export function assertLiveAuthorization(env = process.env) {
  required(env, "CALLE_API_KEY");
  if (env.CALLE_CONSENT_CONFIRMED !== "yes") {
    throw new Error("CALLE_CONSENT_CONFIRMED must be exactly yes before a live call.");
  }
  required(env, "CALLE_CONSENT_REFERENCE");
  if (env.CALLE_LIVE_ACK !== LIVE_ACK) {
    throw new Error(`CALLE_LIVE_ACK must be exactly ${LIVE_ACK}.`);
  }
  return buildCallRequest(env);
}

function redactString(value, force = false) {
  if (force) return "[REDACTED]";
  return value
    .replace(/iams_live_[A-Za-z0-9._-]+/g, "[REDACTED_API_KEY]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [REDACTED]")
    .replace(/\+[1-9]\d{7,14}/g, "[REDACTED_E164]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED_EMAIL]");
}

export function sanitizeEvidence(value, parentKey = "") {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeEvidence(item, parentKey));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, sanitizeEvidence(item, key)]),
    );
  }
  if (typeof value !== "string") return value;
  const sensitiveKey = /(authorization|api.?key|secret|token|password|phone)/i.test(parentKey);
  return redactString(value, sensitiveKey);
}

async function apiRequest(path, { method = "GET", body, idempotencyKey, env, fetchImpl }) {
  const apiKey = required(env, "CALLE_API_KEY");
  const baseUrl = normalizedBaseUrl(env);
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

  const response = await fetchImpl(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { unparsed_response: text };
    }
  }
  const requestId = response.headers.get("x-request-id");
  if (!response.ok) {
    throw new CalleApiError(
      data?.error?.message || `CALL-E request failed with HTTP ${response.status}.`,
      { status: response.status, body: data, requestId },
    );
  }
  return { http_status: response.status, request_id: requestId, data };
}

export async function createCall(env = process.env, fetchImpl = globalThis.fetch) {
  const request = assertLiveAuthorization(env);
  return apiRequest("/v1/calls", {
    method: "POST",
    body: request.body,
    idempotencyKey: request.idempotencyKey,
    env,
    fetchImpl,
  });
}

export async function readCall(callId, env = process.env, fetchImpl = globalThis.fetch) {
  if (!/^call_[A-Za-z0-9_-]+$/.test(callId)) {
    throw new Error("CALLE_CALL_ID must be a CALL-E call id beginning with call_.");
  }
  return apiRequest(`/v1/calls/${encodeURIComponent(callId)}`, { env, fetchImpl });
}

export async function readEvents(callId, env = process.env, fetchImpl = globalThis.fetch) {
  if (!/^call_[A-Za-z0-9_-]+$/.test(callId)) {
    throw new Error("CALLE_CALL_ID must be a CALL-E call id beginning with call_.");
  }
  return apiRequest(`/v1/calls/${encodeURIComponent(callId)}/events?limit=50`, {
    env,
    fetchImpl,
  });
}

export function evidenceEnvelope(kind, payload, env = process.env) {
  return {
    evidence_version: 1,
    kind,
    observed_at: new Date().toISOString(),
    environment: {
      node: process.version,
      platform: process.platform,
      os_release: os.release(),
      integration: "CALL-E Developer API via native Node fetch",
      base_url: env.CALLE_BASE_URL || OFFICIAL_BASE_URL,
    },
    safety: {
      automatically_redacted: true,
      manual_privacy_review_required_before_submission: true,
    },
    payload: sanitizeEvidence(payload),
  };
}

export function errorEvidence(error) {
  return sanitizeEvidence({
    name: error.name,
    message: error.message,
    http_status: error.status ?? null,
    request_id: error.requestId ?? null,
    response: error.body ?? null,
  });
}

