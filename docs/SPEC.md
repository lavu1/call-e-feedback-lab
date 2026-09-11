# Task specification

## Outcome

Give CALL-E developers one complete, actionable feedback report based on a narrowly
scoped supplier-availability role-play workflow. Confirmed behavior, documentation
observations and untested suggestions must remain visibly distinct.

## Implemented operator workflow

1. Review the official rules, quickstart, authentication, Calls, Errors and Regions
   documentation.
2. Run the dependency-free local harness tests against loopback mock servers.
3. Check public SDK release metadata without invoking CALL-E.
4. Configure a server API key and one consenting recipient privately.
5. Preview the sanitized request without network activity.
6. Create at most one authorized role-play call using a stable idempotency key.
7. Read the same Call ID and events until terminal.
8. Manually sanitize the evidence and update the single consolidated report.

## Safety and evidence rules

- An unexecuted scenario is planned, never a finding.
- Mock-server behavior proves the local harness only, not CALL-E behavior.
- Do not invent bugs, timings, transcripts, screenshots or impact.
- Use a specific consenting test recipient; this project does not authorize supplier
  outreach or calls to an inferred contact.
- Keep credentials, raw phone numbers and personal consent records out of tracked
  files and submission materials.
- A top-level `completed` state is not a favorable business answer. Read the
  structured result, task-completion fields, evidence and transcript separately.
- Keep unknown or schema-null outcomes unresolved.
- Submit no more than one feedback survey per entrant.

## Acceptance status

- [x] Official rules and core direct-API documentation reviewed.
- [x] Reproducible local harness and evidence workflow implemented.
- [x] Mock tests cover request, guard, error and sanitizer behavior.
- [x] One public documentation issue recorded with reproduction steps.
- [ ] CALL-E account and project API key confirmed.
- [ ] Specific consenting recipient in a currently supported destination confirmed.
- [ ] One complete real setup-to-call-to-result test recorded.
- [ ] Every account-dependent claim backed by manually sanitized evidence.
- [ ] Devpost registration and feedback-survey access confirmed by the entrant.

The local deliverable is complete for the authority and access currently available.
It is not a finished live-test entry until the unchecked account-dependent criteria
are satisfied.
