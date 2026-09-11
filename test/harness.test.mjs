import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";
import {
  CalleApiError,
  LIVE_ACK,
  createCall,
  doctor,
  sanitizeEvidence,
} from "../src/lab.mjs";

function authorizedEnv(baseUrl) {
  return {
    CALLE_API_KEY: "iams_live_test_secret",
    CALLE_BASE_URL: baseUrl,
    CALLE_ALLOW_NON_OFFICIAL_BASE_URL: "yes",
    CALLE_TEST_PHONE: "+15551234567",
    CALLE_TEST_REGION: "US",
    CALLE_TEST_LOCALE: "en-US",
    CALLE_CONSENT_CONFIRMED: "yes",
    CALLE_CONSENT_REFERENCE: "local-test-fixture",
    CALLE_LIVE_ACK: LIVE_ACK,
    CALLE_IDEMPOTENCY_KEY: "feedback-lab-test-001",
  };
}

async function mockServer(handler) {
  const server = http.createServer(handler);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

test("doctor reports missing access without making a request", () => {
  const result = doctor({ CALLE_TEST_LOCALE: "en-US" });
  assert.equal(result.status, "not_ready");
  assert.equal(result.network_action, "none");
  assert.equal(result.live_call_placed, false);
  assert.equal(result.checks.api_key_present, false);
});

test("live create is blocked before fetch when consent acknowledgement is absent", async () => {
  let fetchCalled = false;
  const env = authorizedEnv("http://127.0.0.1:9");
  delete env.CALLE_LIVE_ACK;
  await assert.rejects(
    createCall(env, async () => {
      fetchCalled = true;
    }),
    /CALLE_LIVE_ACK/,
  );
  assert.equal(fetchCalled, false);
});

test("authorized create sends the documented endpoint, auth, idempotency, and strict schema", async () => {
  let observed;
  const server = await mockServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    observed = {
      method: request.method,
      url: request.url,
      authorization: request.headers.authorization,
      idempotency: request.headers["idempotency-key"],
      body: JSON.parse(Buffer.concat(chunks).toString("utf8")),
    };
    response.writeHead(201, { "content-type": "application/json", "x-request-id": "req_test" });
    response.end(JSON.stringify({ id: "call_test_123", status: "queued" }));
  });

  try {
    const result = await createCall(authorizedEnv(server.baseUrl));
    assert.equal(result.http_status, 201);
    assert.equal(result.data.id, "call_test_123");
    assert.equal(observed.method, "POST");
    assert.equal(observed.url, "/v1/calls");
    assert.equal(observed.authorization, "Bearer iams_live_test_secret");
    assert.equal(observed.idempotency, "feedback-lab-test-001");
    assert.equal(observed.body.recipients[0].phones[0], "+15551234567");
    assert.equal(observed.body.result_schema.additionalProperties, false);
    assert.deepEqual(observed.body.result_schema.properties.availability.enum, [
      "yes",
      "no",
      "unknown",
    ]);
  } finally {
    await server.close();
  }
});

test("stable API error envelopes remain available to the evidence layer", async () => {
  const server = await mockServer((_request, response) => {
    response.writeHead(422, { "content-type": "application/json", "x-request-id": "req_error" });
    response.end(
      JSON.stringify({
        error: { code: "invalid_phone", message: "The phone is invalid.", details: {} },
      }),
    );
  });

  try {
    await assert.rejects(createCall(authorizedEnv(server.baseUrl)), (error) => {
      assert.ok(error instanceof CalleApiError);
      assert.equal(error.status, 422);
      assert.equal(error.requestId, "req_error");
      assert.equal(error.body.error.code, "invalid_phone");
      return true;
    });
  } finally {
    await server.close();
  }
});

test("sanitizer removes credentials, phone numbers, and email addresses", () => {
  const sanitized = sanitizeEvidence({
    api_key: "iams_live_secret_value",
    phones: ["+15551234567"],
    transcript: "Email Pat@example.com or call +442071838750.",
  });
  const serialized = JSON.stringify(sanitized);
  assert.equal(serialized.includes("iams_live_secret_value"), false);
  assert.equal(serialized.includes("+15551234567"), false);
  assert.equal(serialized.includes("+442071838750"), false);
  assert.equal(serialized.includes("Pat@example.com"), false);
  assert.match(serialized, /REDACTED/);
});

