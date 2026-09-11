# Test protocol

## Scope and source baseline

Reviewed on 11 September 2026:

- [Official rules](https://call-e.devpost.com/rules)
- [CALL-E quickstart](https://docs.heycall-e.com/quickstart)
- [Authentication](https://docs.heycall-e.com/authentication)
- [Calls guide](https://docs.heycall-e.com/calls)
- [Errors](https://docs.heycall-e.com/errors)
- [Regions and languages](https://docs.heycall-e.com/regions)
- [Official integrations repository](https://github.com/CALLE-AI/call-e-integrations)

The harness uses the direct Developer API contract documented at
`https://api.heycall-e.com`. It does not install the SDK and does not use an app
database.

## Safe local checks

Run:

```bash
npm test
npm run doctor
npm run check:sdk-version
```

`npm test` uses loopback-only mock HTTP servers. `doctor` performs no network
request. The package-version check reads public npm registry metadata and does not
contact the CALL-E API.

## Authorized live setup

1. Create a CALL-E project API key in the dashboard.
2. Identify a specific test recipient who owns or controls the destination number.
3. Obtain explicit consent for one role-play supplier-availability call.
4. Confirm the destination appears in the current regions table. E.164 validity by
   itself does not establish coverage.
5. Create `.env` from `.env.example` and fill it locally. Do not put credentials,
   the raw phone number, or personal consent records in tracked files.
6. Choose one stable `CALLE_IDEMPOTENCY_KEY` for this operation.
7. Run `npm run doctor` and resolve every failed check.
8. Run `npm run preview`. This prints a redacted request and performs no network
   action.
9. Review the exact task, recipient, region, locale and no-order boundary.
10. Set `CALLE_LIVE_ACK=I_AUTHORIZED_ONE_TEST_CALL` only for the authorized run.
11. Run `npm run create` once. Save the returned `call_id`; the harness also stores
    it privately in `.local/run.json`.
12. Run `npm run status` to read the call and event records. Poll the same Call ID;
    do not create a replacement call to discover the first call's outcome.
13. Review generated evidence manually and redact any remaining names, company
    details, transcript details or other personal information.

## Expected behavior

- Create returns a top-level `call_...` ID and a non-terminal status.
- Terminal top-level status is one of `completed`, `failed`, or `canceled`.
- A `completed` status is execution completion, not proof of a favorable supplier
  answer.
- The business answer comes from `structured_result` and its supporting evidence.
- An unclear answer stays `unknown`; a null structured result stays unresolved.
- Request failures preserve the documented stable error envelope when available.

## Evidence rules

- Record timestamps, environment, exact request shape, HTTP status, request ID,
  Call ID, status transitions and sanitized terminal output.
- Preserve undocumented `failure_code` values only as diagnostic text. Do not build
  retry claims around them.
- Never label mock results, documentation examples or planned calls as live evidence.
- Reuse the same request body and idempotency key after a lost create response.
- Do not publish generated evidence before a manual privacy review.

