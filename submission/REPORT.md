# CALL-E documentation feedback report

**Status:** Public, reviewable documentation report. One documentation issue is confirmed. CALL-E
account/API/call claims are withheld because credentials and a consenting recipient
were not available.

## Testing summary

Environment: macOS 26.6.2, Darwin 25.6.0, Node.js v24.12.0, npm 11.6.2.  
Integration target: CALL-E Developer API using native server-side Node `fetch`.  
Documentation reviewed: official quickstart, Authentication, Calls, Errors, Regions,
integrations README and Devpost rules on 11 September 2026.

Completed:

- Built and exercised a local harness design against loopback-only mock HTTP servers.
- Checked the public TypeScript SDK package version metadata.
- Verified the entry requirements and feedback deadline from the official rules.

Not completed:

- CALL-E dashboard or API-key authentication.
- Any request to `api.heycall-e.com`.
- SDK runtime behavior.
- Any real or simulated-through-CALL-E phone call, transcript, timing or structured
  result.
- Devpost registration or survey submission.

## Confirmed finding: current SDK version statement is stale or ambiguous

Type: confirmed documentation issue  
Priority: medium onboarding/troubleshooting friction

Preconditions:

- Public internet access.
- npm CLI or access to the public npm package metadata.

Exact reproduction:

1. Open the SDK section of the official
   [CALL-E integrations README](https://github.com/CALLE-AI/call-e-integrations#sdk).
2. Observe the statement that the current TypeScript package is
   `@call-e/calle@0.2.0`.
3. Run `npm view @call-e/calle version engines dist-tags --json`.
4. Compare the README statement with the registry's `latest` version.

Expected:

The package explicitly labeled current matches the registry's latest stable release,
or the README explains that the older number is an intentionally tested baseline.

Actual:

On 11 September 2026 the public npm registry returned `0.7.0` as both the package
version and `latest` tag, while the official README labeled `0.2.0` current.
Reproduced 1 of 1 metadata checks.

Impact:

The adjacent unpinned install command resolves to 0.7.0, but the version statement
sets a 0.2.0 expectation. Developers and maintainers may discuss failures against
different SDK surfaces while believing they followed the same current setup.

Proposed improvement:

Generate the displayed current version from release metadata, link to the latest
stable package without a hard-coded number, or label 0.2.0 as a tested baseline with
an explanation of compatibility through 0.7.0.

Evidence:

- `../evidence/sdk-version-check.json`
- `../findings/2026-09-11-sdk-version-drift.json`

Limitations:

This verifies documentation and registry metadata only. It does not show that either
SDK version fails, and it makes no claim about authenticated API behavior.

## Confirmed observations, not defects

- The Calls guide clearly distinguishes execution status, task completion and the
  caller-defined structured business result.
- The Errors guide says Calls API `failure_code` is not a published enum and should
  remain diagnostic context rather than a retry branch.
- The Regions page warns that listed destinations may be temporarily restricted and
  that a valid E.164 number can still be rejected.
- The official authentication check requires a project API key, so it was not run.

## Untested suggestions

These are product/documentation ideas, not observed CALL-E defects.

### Add a no-call validation or dry-run endpoint

User problem: a developer can locally validate JSON shape but cannot, from the core
Calls documentation reviewed, ask CALL-E to validate key permissions, current region
availability, locale support and result-schema compatibility without creating a call
task.

Suggested change: provide a read-only `POST /v1/calls/validate` or documented dry-run
mode returning normalized recipients, coverage, schema validity and permission
problems without reserving balance or dialing.

Potential impact: safer onboarding, easier CI checks, fewer accidental calls and
cleaner separation between configuration errors and live call behavior.

Validation needed: confirm with an authorized key that no equivalent endpoint exists
in the complete API reference or dashboard before presenting this as a gap rather
than a suggestion.

### Expose current coverage as machine-readable metadata

User problem: the documentation warns that destinations can be temporarily
restricted, while applications otherwise discover coverage problems through request
errors.

Suggested change: publish a read-only capabilities endpoint with region, locale,
line type and temporary-availability fields, plus a `checked_at` timestamp.

Potential impact: applications can block unsupported attempts before collecting a
phone number or asking a user to authorize a call.

Validation needed: confirm that an authenticated capability endpoint is not already
available but omitted from the reviewed guides.

### Add a feedback-testing quickstart

User problem: feedback entrants need to preserve idempotency, distinguish lifecycle
from business outcome, sanitize transcripts and prove what was actually tested.

Suggested change: add a short feedback/evaluation recipe with a no-call smoke test,
one consented call, an ambiguous-answer schema, recovery steps and a sanitized
evidence template.

## Documentation-only entry

The official feedback form explicitly permits “None - documentation review only.” This report uses that route. No API key or phone call is required to support the documentation finding. Authenticated API testing would be a separate future activity requiring access and a consenting recipient; it is not claimed here.

Public source and evidence: https://github.com/lavu1/call-e-feedback-lab

## Survey completion note

The rules allow one Feedback Submission per entrant and judge feedback on
completeness, viability and potential impact. Consolidate any future confirmed live
findings into this report before the entrant submits the official survey. Repository
creation is not survey submission, and this draft has not accepted terms or entered
the hackathon on the user's behalf.
