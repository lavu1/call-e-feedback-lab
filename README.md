# CALL-E Feedback Lab

**Status: local harness implemented; one documentation issue confirmed; account and live-call testing blocked on access and consent.**

This project prepares one evidence-backed entry for the
[CALL-E Most Valuable Feedback](https://call-e.devpost.com/) awards. It provides a
small direct-API harness, mock tests, automatic evidence redaction and a consolidated
feedback report. It does not claim an authenticated API test or real phone call.

Official rules: [call-e.devpost.com/rules](https://call-e.devpost.com/rules)  
Feedback deadline: **18 September 2026 at 17:45 Africa/Lusaka**, verified on
11 September 2026. The rules state that feedback entrants must join the Devpost
hackathon, complete the feedback survey during the feedback period, and submit no
more than one feedback entry per entrant.

## Current evidence

- Confirmed documentation issue: the official integrations README labels
  `@call-e/calle@0.2.0` as current, while npm returned `0.7.0` as latest on
  11 September 2026.
- Local harness tests cover the consent gate, request shape, idempotency header,
  stable API error preservation and evidence redaction against loopback mocks.
- No CALL-E API key was available. No authenticated endpoint was contacted and no
  phone call was placed.

## Run locally

Requires Node.js 22 or newer and no third-party dependencies.

```bash
npm test
npm run doctor
npm run check:sdk-version
```

For a future authorized test, create a private `.env` from `.env.example`, then use:

```bash
npm run preview
npm run create
npm run status
```

`create` is blocked unless a key, supported region, specific consent reference,
stable idempotency key, and exact `I_AUTHORIZED_ONE_TEST_CALL` acknowledgement are
present. Follow [the test protocol](docs/TEST_PROTOCOL.md) before enabling it.

## Project files

- [Specification](docs/SPEC.md)
- [Build plan](docs/BUILD_PLAN.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Access status](docs/ACCESS.md)
- [Test protocol](docs/TEST_PROTOCOL.md)
- [Scenarios](data/scenarios.json)
- [Confirmed finding](findings/2026-09-11-sdk-version-drift.json)
- [Evidence policy](evidence/README.md)
- [Consolidated report](submission/REPORT.md)
- [Completion checklist](submission/CHECKLIST.md)

Sample organizations, products and quantities are fictional. A full application,
database, public deployment, pull request and video are outside this feedback-only
project unless the user separately authorizes them.

