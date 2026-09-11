# Evidence handling

This directory is for sanitized, reviewable evidence. Raw responses and private
working state belong in the ignored `.local/` or `evidence/raw/` directories.

Generated evidence:

- `local-harness-tests.json` records local mock-test execution. It never represents
  a CALL-E API request or phone call.
- `sdk-version-check.json` records the public documentation/package-registry version
  comparison. It never represents SDK runtime behavior.
- Timestamped `call-create` and `call-status` files are written only by the guarded
  live workflow.

Automatic redaction covers common credentials, email addresses and E.164 numbers.
Every generated file still requires a manual privacy review before it is attached
to the feedback survey.

