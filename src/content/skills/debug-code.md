---
title: debug-code
summary: "증거 기반 진단으로 symptom(증상)에서 causal chain(인과 사슬)을 세우고 최소 안전 패치를 만드는 디버깅 스킬. 프로덕션 전용·간헐적·성능·레거시 버그를 제한된 접근 환경에서도 잡는다."
summary_en: "Evidence-first debugging that turns a symptom into an evidenced causal chain and the smallest safe fix, even with codebase-only access."
tags: [skill, debugging, production, legacy, evidence, invariant, root-cause, triage]
author: debug-code
order: 61
trigger: "behavior is broken / incorrect / failing / slow / flaky / production-only bug / intermittent / data-dependent / debug this / root-cause analysis"
install: "debug-code 디렉토리를 당신의 에이전트 skills 폴더에 복사"
---

## 한 줄

**symptom(증상)에서 causal chain(인과 사슬)을 세우고, 가장 먼저 깨진 invariant(불변 조건)를 최소 패치로 수리하라.** 코드베이스만 볼 수 있어도 조사는 멈추지 않는다. 프로덕션 접근은 가속기일 뿐 전제 조건이 아니다.

*EN: Turn a symptom into an evidenced causal chain and the smallest safe fix. The codebase is the only guaranteed source; production access is optional.*

## 핵심 개념

- **Proof levels(증명 수준)** — Confirmed / Strongly supported / Provisional 세 단계로 진단을 표시한다. Confirmed은 직접 runtime 증거 + falsifiable prediction 성공 + regression test 제거로만 도달. 신뢰도를 가짜 퍼센트로 바꾸지 말 것.
- **Evidence ledger(증거 장부)** — 조사 내내 관찰·추론·불명·배제 상태가 표시된 증거 표를 유지. "로그에 없다"는 "발생하지 않았다"가 아니다.
- **Causal chain(인과 사슬)** — `trigger → violated invariant → faulty state/control flow → propagation → symptom`. 첫 번째 exception이 아니라 첫 번째 깨진 invariant를 찾아라.
- **Fake fixes(가짜 수정) 거부** — catch-all 삼키기, 임의 sleep/timeout, 멱등성 없는 retry, corrupt 데이터 기본값 대입, 캐시 영구 삭제는 증거 없이 쓰면 금지.

## 함정

- **"Bad data"가 root cause가 아닌 경우** — 코드가 안전한 처리를 계약으로 요구하면, 데이터가 trigger일 뿐 root defect는 코드에 있다.
- **Deploy가 원인이 아닐 수 있다** — 배포가 latent defect를 노출했을 뿐일 수 있다. temporal correlation은 lead이지 proof가 아니다.
- **Wrapper exception** — 사용자에게 보이는 exception이 첫 번째 실패를 숨기는 wrapper일 수 있다.
- **Resource saturation** — 포화 자체가 effect일 수 있다. retry storm·lock contention·leak·unbounded work가 cause인지 확인.

## 원문 (전문: SKILL.md + references 2종 + evals 1종)

````markdown
---
name: debug-code
description: Diagnoses and fixes hard production and legacy-code bugs using runtime evidence, code-path tracing, reproducible tests, and safe human-run probes when production access is restricted. Use when a user reports broken, intermittent, slow, data-dependent, environment-only, or production-only behavior; provides an error or log; asks for root-cause analysis; or requests a focused hunt for a production defect in a legacy path. Not for general style review or unrelated refactoring.
license: MIT
compatibility: Requires repository access. Production access is optional; the workflow can use logs, metrics, traces, dev or staging environments, dev databases, and operator-run read-only production queries when available.
metadata:
  version: "1.0.0"
---

# Debug Code

Turn a symptom into an evidenced causal chain and the smallest safe fix. The codebase is the only guaranteed source; production access is optional.

## Proof levels

Use these labels exactly:

- **Confirmed** — direct evidence ties the symptom to the code path, a falsifiable prediction succeeds, and a counterfactual or regression test removes the symptom.
- **Strongly supported** — multiple independent facts fit one causal chain, but production reproduction or a decisive probe is unavailable.
- **Provisional** — the best current hypothesis under limited evidence. Safe to investigate; not safe to present as root cause.

Never convert confidence into invented percentages. Separate **trigger**, **root defect**, **contributing conditions**, and **user-visible symptom**.

## Non-negotiables

1. **Mitigate active harm first.** For ongoing data loss, security exposure, financial harm, or severe outage, preserve evidence and propose the safest reversible containment before deep diagnosis. Production actions require an authorized human.
2. **Ask about access once, then continue.** Request only missing evidence sources in one grouped question. Do not block codebase analysis while waiting.
3. **Evidence over plausibility.** Mark every material statement as observed, inferred, unknown, or ruled out. No evidence means hypothesis, not fact.
4. **Production is read-only by default.** Never execute or request writes, locks, schema changes, broad exports, or unbounded production queries for diagnosis.
5. **Protect sensitive data.** Do not request or expose secrets, tokens, cookies, connection strings, passwords, full personal records, or unnecessary payloads. Ask for redacted or pseudonymized artifacts.
6. **Fix the cause, not the screenshot.** Trace all relevant callers and sibling paths. A local guard is wrong when the violated invariant belongs at a shared seam.
7. **Make the smallest maintainable change.** No unrelated refactoring, dependency changes, API redesign, schema migration, or speculative hardening.
8. **Preserve legitimate legacy behavior.** Existing behavior is evidence, not automatically correct; characterize unaffected contracts before changing shared code.
9. **Change one variable per probe.** Record negative results; they narrow the search space.
10. **Do not say "fixed" early.** Distinguish diagnosis, local verification, rollout readiness, and production verification.

## Workflow

### 0. Triage impact and mode

Classify the task:

- **Incident mode** — harm is active. Contain first, diagnose second.
- **Reproduction mode** — the symptom can be driven in dev, test, staging, or a safe harness.
- **Restricted-evidence mode** — the bug is production-only or access is limited. Continue with code-derived predictions and targeted human-run probes, but downgrade claims honestly.

For active incidents, identify a reversible mitigation such as rollback, feature disablement, traffic isolation, queue pause, or write freeze. Do not recommend a blunt mitigation without stating its likely collateral impact and rollback condition.

### 1. Establish the symptom and access map

Summarize what is already known before asking anything:

- expected versus actual behavior;
- affected scope and frequency;
- exact error, wrong output, or latency symptom;
- earliest known occurrence and relevant timezone;
- known request, trace, job, tenant, user, or record identifier using a safe pseudonym;
- recent release, configuration, schema, dependency, or traffic changes.

Ask one compact access question, omitting anything already answered:

> Which evidence can be accessed now or supplied on request: dev/staging reproduction, dev DB, Grafana/metrics, application logs, traces/error tracker, deployment/config history, or operator-run read-only production SQL? Code-only is acceptable. If available, include the smallest safe locator: timestamp plus timezone, request/trace/job ID, pseudonymous tenant/user ID, and deployed version.

Start repository work immediately while the user answers. Never repeat this questionnaire.

### 2. Orient in the codebase

Before theorizing:

1. Read repository instructions, tests, architecture notes, `CONTEXT.md`, and relevant ADRs if present.
2. Search the exact error text, status code, log event, UI label, endpoint, job name, table, and feature flag.
3. Trace the real path end to end: boundary input → normalization/validation → authorization/tenant scope → domain state → DB/cache/queue/external dependency → response or side effect.
4. Enumerate callers of any function proposed for modification and find the closest working sibling path.
5. Inspect relevant configuration, migrations, serializers, retry policies, transaction boundaries, and recent changes around the reported onset. Treat recent change as a lead, not proof.
6. Run the smallest existing tests and commands that establish the current baseline. Capture exact commands and outcomes.

Produce a concise investigation map: suspected path, evidence sources, commands, assumptions, and safety constraints.

Before any intrusive probe or edit, run a plan gate: are we solving the reported symptom; does a reproduction, helper, or fix already exist; is any assumption being treated as fact; is there a cheaper or safer discriminator; and are verification and rollback explicit? Proceed without waiting unless a consequential permission or production-risk decision is genuinely missing.

### 3. Build a feedback or evidence loop

Prefer the first feasible loop that exercises the actual symptom:

1. existing failing test;
2. new regression test at the real seam;
3. API, CLI, UI, worker, or scheduled-job script;
4. dev/staging reproduction with production-shaped configuration;
5. sanitized request, event, trace, or payload replay;
6. minimal harness with mocked external dependencies;
7. synthetic fixture matching the relevant production data shape;
8. stress, fuzz, concurrency, clock, or repetition loop for intermittent faults;
9. old/new version, config, or dataset differential;
10. automated `git bisect` check;
11. structured human-in-the-loop probe using logs, metrics, or read-only SQL.

A useful loop must assert the **exact symptom**, not merely "did not crash." Tighten it until it is as deterministic, fast, and unattended as practical. For flaky bugs, raise and measure the reproduction rate rather than pretending one passing run is meaningful.

In restricted-evidence mode, build an **evidence loop** instead of stopping:

- derive observable predictions from the code path;
- request the smallest log, metric, trace, or query result that splits the leading hypotheses;
- construct synthetic fixtures from shape, cardinality, nullability, encoding, timing, ordering, and state—not from sensitive production values;
- compare an affected case with a known-good case whenever possible.

No loop means no confirmed root cause. It does not prevent continued investigation.

### 4. Maintain an evidence ledger

Keep a compact ledger throughout:

| ID | Statement | Status | Source | Diagnostic implication |
|---|---|---|---|---|
| E1 | Exact observed fact | observed / inferred / unknown / ruled out | command, file, log, metric, query, user report | what it supports or rejects |

Prefer primary evidence. Treat user reports as valid symptom evidence but not automatically as causal evidence. Treat missing logs as "not observed," not "did not happen."

### 5. Rank falsifiable hypotheses

Generate 3–5 hypotheses before editing code. For each use:

> **H# — Cause:** …  
> **Evidence for / against:** …  
> **Prediction:** If this is the cause, probe X will produce Y; otherwise it will produce Z.  
> **Cheapest discriminating probe:** …  
> **Risk if wrong:** …

Rank by explanatory power, evidence fit, probe cost, and production risk—not familiarity. Share the ranking when useful, but continue unless user input is required for a consequential action.

Test the highest-value discriminator first. Prefer probes at component boundaries. Use a debugger or profiler when available; otherwise add narrowly targeted instrumentation with a unique marker such as `[DEBUG-d3f7]`. Never "log everything and grep."

For performance regressions, establish a baseline and use timing, profiling, traces, query plans, lock/wait evidence, or bisection before changing code.

Load `references/production-probes.md` before requesting production logs, dashboards, traces, temporary instrumentation, or SQL.

### 6. Establish the causal chain

A root-cause statement must explain:

`trigger → violated invariant → faulty state/control flow → propagation → user-visible symptom`

Challenge easy misattributions:

- Production data may trigger a code defect; "bad data" is not the root cause when the contract requires safe handling.
- A deployment may expose a latent defect rather than introduce it.
- Resource saturation may be the effect of retry storms, lock contention, leaks, or unbounded work.
- An exception shown to the user may be a wrapper that hides the first failure.

Confirm the cause with the strongest available combination of:

- reproduction of the exact symptom or runtime evidence tied to the exact path;
- a successful falsifiable prediction;
- a counterfactual that removes or intensifies the symptom as predicted;
- a minimal regression test that fails before the fix and passes after it;
- proportionate rejection of plausible alternatives.

If these are unavailable, report **strongly supported** or **provisional**, plus the missing decisive evidence.

### 7. Implement the fix

1. Convert the minimal reproduction into a failing regression test at the real behavioral seam. If no correct seam exists, create the smallest honest harness and document the testability gap.
2. Watch the test fail for the user's symptom—not a nearby setup error.
3. Apply the smallest root-cause fix. Reuse existing patterns, standard-library features, platform guarantees, or database constraints where they are already the correct ownership boundary.
4. Check every relevant caller and sibling path. Add characterization coverage for unaffected legacy behavior when shared code changes.
5. Watch the regression test pass, then rerun the original, non-minimized loop.
6. Keep emergency mitigation, durable fix, cleanup, and optional hardening as separate changes when mixing them increases risk.

Reject common fake fixes unless evidence specifically justifies them:

- catch-all exception swallowing;
- arbitrary sleeps or timeouts;
- retries without idempotency and bounded backoff;
- defaulting corrupt or missing data into a plausible value;
- clearing caches as the permanent fix;
- adding capacity without finding why demand or work exploded;
- broad refactoring around an unconfirmed theory.

A provisional fix may proceed only when it is reversible, low risk, covered by a meaningful test, paired with explicit rollout/rollback signals, and the user has authorized acting under uncertainty. Never call it confirmed.

### 8. Adversarial review gate

Before declaring the diagnosis or fix complete, independently challenge it:

- Are we reproducing the reported bug or a convenient neighbor?
- Is the stated root cause actually only a trigger or correlation?
- Could the test pass while the production bug remains?
- Is the fix placed at the correct ownership boundary for all callers?
- What concurrency, retry, transaction, cache, authorization, compatibility, or data-integrity edge remains?
- What evidence contradicts the preferred theory?
- Could the diagnostic query or instrumentation itself harm production or expose data?
- What exact signal triggers rollback?

For high-impact, ambiguous, security-sensitive, financial, or data-integrity bugs, use an independent read-only subagent as the skeptic when available. Give it the symptom, evidence ledger, relevant code, tests, and diff; ask it to find disconfirming evidence and alternative causal chains. Do not treat agent agreement as proof.

### 9. Verify, clean up, and prepare rollout

Run and report exact commands for:

- the regression test;
- the original reproduction/evidence loop;
- relevant integration or end-to-end tests;
- static checks, lint, and type checks used by the repository;
- full or broader tests when the shared surface warrants them;
- concurrency, load, performance, migration, or backward-compatibility checks when relevant.

Before closure:

- remove all temporary `[DEBUG-…]` instrumentation and throwaway artifacts, or isolate intentionally retained diagnostic tools;
- verify no secrets or sensitive production data were added to code, tests, fixtures, logs, or reports;
- state rollout scope: canary, feature flag, tenant slice, job subset, or normal deployment;
- define the production success signal and a concrete rollback trigger;
- verify over representative occurrences, not one lucky request;
- document any remaining uncertainty or production verification still owned by a human operator.

## Output contract

Use this structure for substantive updates and the final result:

```text
Status: investigating | provisional cause | strongly supported cause | root cause confirmed | fix verified locally | production verification pending | verified in production
Symptom and impact:
Access and constraints:
Observed evidence:
Ruled out:
Root cause or leading hypothesis:
Causal chain:
Change made:
Verification commands and results:
Rollout and rollback:
Remaining uncertainty:
Next evidence request, if any:
```

When requesting human-run evidence, provide one exact, minimal, copy-pasteable probe and state:

- what question it answers;
- what result supports or rejects each hypothesis;
- safety bounds and redaction requirements;
- exactly which sanitized fields or counts to return.

Do not bury uncertainty. A precise unresolved report is better than a persuasive false RCA.

## Reference loading

- Read `references/production-probes.md` when any production evidence must be requested or instrumentation/query safety matters.
- Read `references/production-bug-patterns.md` after the initial code-path trace when a focused checklist would help identify hidden data, timing, concurrency, distributed-system, or resource bugs.
````

### references/production-probes.md

````markdown
# Production Evidence Probes

Use this file only when runtime evidence is needed. Ask for the smallest artifact that discriminates between hypotheses. Direct production actions remain human-operated unless the environment explicitly grants safe read-only access.

## 1. One-time access prompt

Omit sources already known:

> Available now or on request: dev/staging reproduction, dev DB, Grafana/metrics, application logs, distributed traces/error tracker, deployment/config history, or operator-run read-only production SQL? Code-only is valid. For localization, provide only safe identifiers: timestamp plus timezone, request/trace/job ID, pseudonymous tenant/user ID, and deployed version.

Do not ask again unless a newly identified probe requires a specific permission.

## 2. Probe design rules

Every request must state:

1. **Question** — the single uncertainty being tested.
2. **Prediction** — what each materially different result means.
3. **Scope** — service, operation, cohort, identifiers, and exact bounded time range.
4. **Safety** — read-only, timeout, row/event limit, sampling, redaction, and operator review.
5. **Return shape** — only the fields, counts, or plan nodes needed.

Prefer affected-versus-unaffected and before-versus-after comparisons. Align timestamps and timezones before correlating systems.

## 3. Log request template

```text
Probe ID: LOG-H2-01
Question: Did dependency timeout occur before the application wrapper exception?
Service/component: <service>
Time range: <start> to <end> <timezone>
Selectors: request_id=<id>, trace_id=<id>, job_id=<id>, tenant_hash=<safe-id>
Need: timestamp, event/error name, exception type and sanitized stack, request/trace ID,
      release/version, dependency status, duration, retry attempt, outcome
Comparison: one failed and one successful execution with the same operation
Limit: <=50 relevant events per case, preserving order
Redact: credentials, auth headers, cookies, tokens, connection strings, full payloads,
        direct personal identifiers, payment/health data, and unrelated records
Return: raw structured events or text lines, not a paraphrase, after redaction
```

Ask for surrounding events only when ordering matters. Do not request an entire log file when a correlation ID or narrow time window exists. Missing log entries are ambiguous unless logging coverage is independently verified.

## 4. Grafana or metrics request

Request exact panels and a bounded window around onset:

- request volume, error rate, and latency distribution—not only averages;
- CPU, memory, disk, file descriptors, thread/event-loop saturation;
- DB connection-pool use, query latency, locks/waits, replica lag;
- queue depth, age, retries, dead letters, consumer throughput;
- dependency latency/error rate;
- deployment, configuration, feature-flag, and migration annotations.

Ask for:

```text
Probe ID: METRIC-H1-01
Question:
Dashboard/panel or metric name:
Window and timezone:
Breakdown: endpoint/job/tenant-safe cohort/status/version/region as applicable
Comparison: prior healthy window and affected window
Return: values or exported series plus deploy/config annotations
```

A correlation narrows hypotheses; it is not a causal conclusion by itself.

## 5. Trace or error-tracker request

Minimum useful fields:

- trace or event ID;
- release/version and environment;
- ordered spans with status and duration;
- exception type and sanitized stack;
- retry/attempt count;
- relevant non-sensitive tags and breadcrumbs;
- one comparable successful trace when available.

Do not request request/response bodies unless their exact shape is the hypothesis and they can be safely minimized and redacted.

## 6. Deployment and configuration evidence

Request identifiers, not secrets:

- commit SHA, artifact/image digest, release ID;
- deploy start/end and rollback times;
- migration version and execution status;
- feature-flag names and evaluated states for an affected safe cohort;
- dependency/runtime versions;
- environment-variable **names** and normalized non-secret values only when required;
- infrastructure or traffic-routing changes.

Compare effective runtime configuration, not only repository defaults.

## 7. Dev/staging and dev-DB use

A dev DB proves code behavior against its own data, not production equivalence. Check parity in:

- schema and migrations;
- indexes and constraints;
- engine/version and isolation settings;
- feature flags and configuration;
- data shape: nullability, cardinality, size, encoding, legacy formats, timestamps, ordering, and state transitions;
- concurrency, load, retry, cache, queue, and dependency behavior.

Build synthetic fixtures from these characteristics. Never copy sensitive production rows into tests or chat.

## 8. Production SQL protocol

Use SQL only when the result will materially distinguish hypotheses. Prefer an existing dashboard, read replica, or approved diagnostic view when it answers the same question.

### Query card

```text
Probe ID: SQL-H3-01
Question answered:
DB engine/version:
Expected discriminator:
Tables and known indexes:
Bounded keys/cohort/time range:
Columns or aggregate returned:
Expected maximum rows:
Operator-enforced timeout:
Sensitive data omitted or transformed:
Why this is safe and cheaper alternatives considered:
```

### Guardrails

- Use a read-only account or read replica when available.
- Use an explicit read-only transaction where supported.
- Use `SELECT` only. No DML, DDL, stored procedures, temporary tables, advisory locks, `FOR UPDATE`, or `FOR SHARE`.
- Select named, non-sensitive columns; never `SELECT *`.
- Start with aggregates or existence checks when rows are unnecessary.
- Bound by indexed identifiers and/or a narrow time range, then apply a small `LIMIT`.
- Parameterize values. Never concatenate untrusted input.
- Avoid broad joins, unbounded scans, wildcard-leading searches, and functions on indexed filter columns unless a reviewed plan proves safety.
- Use plain `EXPLAIN` only when a plan is needed. `EXPLAIN ANALYZE` executes the statement and requires explicit DBA approval and production-risk review.
- Apply a short statement timeout using the organization's approved mechanism.
- The DBA/operator must review the exact query and may reject or rewrite it.
- Return only the count or sanitized fields needed for the hypothesis.

### PostgreSQL wrapper

```sql
BEGIN TRANSACTION READ ONLY;
SET LOCAL statement_timeout = '5s';

SELECT <named_non_sensitive_columns>
FROM <schema.table>
WHERE <indexed_key> = :key
  AND created_at >= :from_ts
  AND created_at < :to_ts
ORDER BY created_at
LIMIT 100;

ROLLBACK;
```

### MySQL wrapper

```sql
START TRANSACTION READ ONLY;

SELECT <named_non_sensitive_columns>
FROM <schema.table>
WHERE <indexed_key> = ?
  AND created_at >= ?
  AND created_at < ?
ORDER BY created_at
LIMIT 100;

ROLLBACK;
```

Use the operator's approved query-timeout mechanism for the deployed MySQL version and client.

## 9. Temporary production instrumentation

Only with explicit authorization and change control:

- instrument the narrowest boundary that distinguishes hypotheses;
- use a unique marker and structured fields;
- sample or target a safe cohort;
- log identifiers as hashes/pseudonyms when possible;
- never log credentials, secrets, full payloads, or unnecessary PII;
- avoid hot-loop logging and high-cardinality labels;
- include a disable/expiry path and rollback trigger;
- remove temporary instrumentation after the investigation, or promote it deliberately into durable observability with review.

## 10. Human-run response format

Ask the operator to return:

```text
Probe ID:
Exact command/query/dashboard actually used:
Environment and deployed version:
Execution time and timezone:
Sanitized result:
Any warning, timeout, plan change, or deviation from the requested probe:
```

Never ask the user to paste credentials or grant broader access merely for convenience.
````

### references/production-bug-patterns.md

````markdown
# Production Bug Pattern Checklist

Use this only after tracing the actual code path. It is a hypothesis generator, not a substitute for evidence.

## Symptom-directed checks

| Symptom | High-value checks |
|---|---|
| Production-only | Effective config/flags, schema or index drift, runtime/dependency versions, permissions, timezone/locale, traffic/load, production data shape, cache/queue topology, network policy |
| One tenant/user/record | Tenant scoping, soft deletes, legacy formats, null/empty values, Unicode/case, oversized inputs, orphaned state, partial migrations, authorization cache |
| Intermittent | Races, check-then-act, lost updates, shared mutable state, async ordering, retry timing, duplicate delivery, clock boundaries, pool exhaustion, flaky dependency |
| Duplicate side effects | At-least-once delivery, retry after commit/timeout, missing idempotency key, non-atomic check/write, absent uniqueness constraint, consumer concurrency |
| Missing or stale data | Cache invalidation, replica lag, read-after-write, isolation level, eventual consistency, pagination/cursor bugs, swallowed partial failure, stale materialized view |
| Slow or timing out | Unbounded work, N+1, plan/cardinality change, missing/unused index, lock contention, pool saturation, retry storm, external latency, payload growth, regex/pathological input, memory/GC |
| Time/day/month boundary | UTC/local conversion, DST, inclusive/exclusive ranges, timestamp precision, clock skew, cron timezone, leap day, month/year rollover |
| Authorization mismatch | Tenant filter omission, role/policy version drift, case sensitivity, stale permission cache, object ownership, fail-open/fail-closed error mapping |
| Appeared after deploy | Code/config/schema/dependency/traffic change; compare effective versions. Also test whether the change merely activated a latent data or load defect |
| Memory/resource growth | Leaks, unbounded cache/collection, orphaned tasks, file descriptors, threads, connections, buffers, temp files, queue backlog, missing cancellation |
| Partial or corrupt writes | Transaction boundary, write ordering, outbox/dual-write gap, retry semantics, timeout after commit, compensation path, schema compatibility |
| Browser/UI only | Service worker/cache, cookies/storage/security settings, extension interference, profile state, hydration/race, network retries, stale frontend/backend contract |
| Serialization/contract failure | Enum expansion, unknown/missing fields, numeric precision, charset, date format, API version, backward/forward compatibility, null semantics |
| Wrapper exception | Broad catch/rethrow, lost cause/context, asynchronous error boundary, cleanup failure masking original exception, generic error mapper |

## End-to-end trace points

At every boundary record the expected invariant, actual evidence, and ownership:

1. inbound request/event/file/job trigger;
2. parsing, normalization, and syntactic validation;
3. authentication, authorization, and tenant scoping;
4. domain preconditions and state transition;
5. transaction start/commit/rollback and lock behavior;
6. DB query/write, cache read/write/invalidation, queue publish/consume;
7. external dependency request, timeout, retry, and circuit behavior;
8. response mapping, side-effect confirmation, and error propagation.

The first boundary where actual behavior diverges from the invariant is usually more informative than the final exception.

## Legacy-code traps

- "Dead" branches may preserve old clients, records, migrations, or operational repair paths.
- Existing tests may characterize required behavior or accidentally encode the defect; determine which before editing.
- Hidden coupling often lives in globals, static caches, implicit transactions, framework hooks, callbacks, triggers, schedulers, and environment defaults.
- Similar functions may differ for a historical reason. Compare callers and data contracts before consolidating.
- A local null check may hide an upstream state violation and create silent corruption.
- Broad exception handling may turn a deterministic defect into intermittent symptoms.
- Production-only failures often require the combination of code + data shape + timing/configuration; reproducing only one dimension can mislead.

## Focused probes

### Data-shape probe

Vary one characteristic at a time: missing/empty/null, maximum length, Unicode, numeric boundary, old schema version, duplicate key, orphaned relation, unusual state transition, large collection, timestamp edge, ordering.

### Concurrency probe

Repeat under controlled parallelism; synchronize competing operations where possible; verify unique/idempotency guarantees; capture attempt, transaction, and commit order. Do not use arbitrary sleeps as proof.

### Retry and queue probe

Model failure before commit, after commit but before acknowledgement, duplicate delivery, out-of-order delivery, visibility timeout, redelivery, poison message, and partial downstream success.

### Performance probe

Measure baseline distribution; isolate CPU, I/O, lock/wait, pool, queue, network, allocation/GC, and query-plan contributions; compare representative input sizes and healthy versus affected versions.

### Configuration probe

Compare effective runtime values, flag evaluation, secrets/config versions, routing, schema version, and dependency endpoints. Repository defaults alone are insufficient.

## Fixes to reject without causal evidence

- catching and ignoring exceptions;
- adding retries without idempotency, limits, jitter, and a retryable classification;
- increasing timeouts or capacity as the only change;
- defaulting invalid state into a believable value;
- clearing or disabling caches permanently;
- adding an index without verifying the query and plan;
- disabling validation, authorization, constraints, or error reporting;
- rewriting the surrounding legacy module before the exact failure is proven.
````

### evals/trigger-cases.md

````markdown
# Trigger Evaluation Cases

Use these cases to sanity-check skill discovery after installation.

## Should trigger

1. "Production returns 500 only for one tenant. Here is the stack trace; find the root cause."
2. "Users sometimes get duplicate orders after the queue retries. Debug the legacy consumer."
3. "This export is fast locally but times out in production. We have Grafana and can run read-only PostgreSQL queries."
4. "Saving stopped working after yesterday's deploy. I only have the repository and can request logs."
5. "Find the likely production defect in this legacy payment path; we cannot access the production database."
6. "Here is an error message from a user. Trace the codebase and create a regression test before fixing it."
7. "A nightly job silently skips some records near month-end. Investigate."
8. "The API occasionally returns stale state immediately after an update. Diagnose the production-only behavior."

## Should not trigger

1. "Refactor this class to make it cleaner."
2. "Review this pull request for style and maintainability."
3. "Explain PostgreSQL transaction isolation."
4. "Build a new reporting endpoint."
5. "Perform a general security audit of the whole repository."
6. "Optimize this function even though there is no measured regression."
7. "Write unit tests for this utility."
8. "Summarize this incident report."
````
