# Access and eligibility

Checked against the [official rules](https://call-e.devpost.com/rules) and
[CALL-E developer documentation](https://docs.heycall-e.com/quickstart) on
11 September 2026.

## Confirmed locally

- [x] Feedback period deadline verified as 18 September 2026 at 23:45 SGT, which is
  17:45 Africa/Lusaka.
- [x] Rules require the entrant to join the Devpost hackathon and complete one CALL-E
  Feedback Survey during the feedback period.
- [x] Node.js v24.12.0 and npm 11.6.2 are available on macOS 26.6.2.
- [x] Direct-API harness and local mock tests prepared without credentials.

## Missing or unverified

- [ ] Entrant confirms they are an eligible adult and not in an excluded territory.
- [ ] Devpost hackathon registration.
- [ ] Access to the official feedback survey.
- [ ] CALL-E account and server project API key. `CALLE_API_KEY` was absent during
  local preparation.
- [ ] A specific consenting test recipient and consent record.
- [ ] A recipient destination in a currently available supported region. Zambia is
  not in the coverage table reviewed on 11 September 2026; do not infer that the
  entrant intends to use a Zambian number.

No credential, Devpost state or recipient authorization was inferred. No CALL-E API
request or phone call was attempted without those prerequisites.

When access is supplied, keep values in the ignored `.env` file and follow
[TEST_PROTOCOL.md](TEST_PROTOCOL.md). A live call requires the exact acknowledgement
`I_AUTHORIZED_ONE_TEST_CALL` in addition to the key, recipient, consent reference,
region, locale and stable idempotency key.
