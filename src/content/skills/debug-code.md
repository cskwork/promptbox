---
title: debug-code
summary: "증거 기반 진단으로 가장 먼저 깨진 invariant(불변 조건)을 찾고 최소 안전 패치를 만드는 디버깅 스킬. 프로덕션 전용·간헐적·성능·레거시 버그를 제한된 접근 환경에서도 잡는다."
summary_en: "Evidence-first debugging that hunts the earliest violated invariant and ships the smallest safe fix, even with codebase-only access."
tags: [skill, debugging, production, legacy, evidence, invariant]
author: debug-code
order: 61
trigger: "behavior is broken / incorrect / failing / slow / flaky / production-only bug / debug this"
install: "debug-code 디렉토리를 당신의 에이전트 skills 폴더에 복사"
---

## 한 줄

**실패가 튀어나온 줄이 아니라, 가장 먼저 깨진 invariant(불변 조건)을 찾아라.** 최소한의 안전한 패치를 만들고, 가용한 접근 수준에 비례하는 증거를 제시한다. 코드만 볼 수 있어도 조사는 멈추지 않는다.

*EN: Find the earliest violated invariant, not the line where the failure surfaces; ship the smallest safe fix with proof proportionate to available access.*

## 9단계 흐름

0. **Incident gate(사고 관문)** — 보안 침해·데이터 오염·중복 결제·무한 리소스 소모가 의심되면, 증거 보존과 containment(봉쇄)를 먼저 권고. 허가 없는 mutation(변경) 금지.
1. **사례와 접근 확정** — 핵심만 한 문단으로 묻고, expected vs actual·에러·영향 범위·최초 발생·마지막 정상 시점·접근 맵을 기록.
2. **가설 이전에 방향 잡기** — entrypoint(진입점) → validation → 비즈니스 로직 → persistence/외부 호출 → async/retry/cache → 응답/사이드이펙트 순으로 실제 실행 경로 추적. bug chain(버그 연쇄): trigger → first invalid state → propagation → symptom.
3. **가장 강한 신호 구축** — Red loop(실패 테스트) > Production evidence loop(운영 증거) > Surrogate loop(대리 재현) > Static-only analysis(정적 분석). 30초 flaky보다 2초 deterministic이 superpower.
4. **재현·특성화·최소화** — 입력 형태·테넌트·locale/timezone·상태 순서·동시성·배포 버전을 한 번에 하나씩만 변경하며 시나리오를 줄인다.
5. **반증 가능한 가설 랭킹** — 3~5개 가설을 표로 정리. 각 가설은 falsifiable(반증 가능)한 prediction(예측)을 가져야 함. 병렬 read-only subagent 지원.
6. **외과적 탐침** — 한 번에 한 변수. debugger > targeted log > bounded read-only query > 임시 instrumentation(승인 시). 모든 임시 로그에 unique marker(`[DEBUG-7f3a]`) 부여.
7. **버그 잠그고 수정** — fix 이전에 regression test(회귀 테스트)를 correct seam에서 작성. 최소 패치로 가장 먼저 깨진 invariant 수리. 코드 수정과 데이터 복구/마이그레이션은 분리.
8. **적대적 검증** — 원본 신호·회귀 테스트·인접 통합 테스트·lint/build·동시성 반복·diff 리뷰. "원인을 고쳤는가, 아니면 증상만 가렸는가?" 질문.
9. **보고** — Status(CONFIRMED/PROBABLE/POSSIBLE/INCONCLUSIVE)·Confidence·Finding·Evidence(Fact/Inference/Unknown)·Fix·Validation·Impact·Prevention 템플릿 사용.

## 함정

- **Fact / Inference / Unknown 분리** — 코드 기반 추론을 운영 관측 사실로 표현하지 말 것. 접근이 제한되면 confidence label(CONFIRMED→PROBABLE→POSSIBLE→INCONCLUSIVE)이 바뀔 뿐, 조사 의무는 사라지지 않는다.
- **증상 은폐 금지** — catch-all(전역 예외 삼킴)·silent default(조용한 기본값)·광범위 retry(재시도)·swallowed exception(삼킨 예외)·larger timeout(시간 늘리기)로 버그를 숨기지 말 것. 그 행위가 명시적 계약이 아니라면.
- **loop이 없어도 멈추지 않는다** — static-only analysis(정적 분석만 가능)여도 코드 포렌식을 계속하되, confirmation(확정)을 주장하지 말고 `STATIC-ONLY`로 표시할 것.
- **성능 회귀는 로그가 아니라 baseline 먼저** — latency distribution·throughput·CPU/memory·pool saturation·query plan을 fix 이전에 측정.

## 원문 (전문: SKILL.md + references 2종)

````markdown
---
name: debug-code
description: Evidence-first diagnosis and minimal repair of hard, intermittent, production-only, performance, and legacy-code bugs under constrained access. Use when behavior is broken, incorrect, failing, slow, flaky, or only reproducible in production.
---

# Debug Code

Find the **earliest violated invariant**, not merely the line where the failure surfaces. Produce the smallest safe fix and proof proportionate to the available access.

## Non-negotiables

- The codebase is the only guaranteed source of truth. Read it deeply; never wait for ideal production access.
- Separate **Fact**, **Inference**, and **Unknown**. Never present code-only reasoning as an observed production fact.
- Prefer the smallest maintainable, reversible change. Preserve existing behavior outside the confirmed bug.
- Do not refactor, rename broadly, add dependencies, or change public APIs, schemas, or migrations unless the root cause requires it.
- Never hide a bug with a catch-all, silent default, broad retry, swallowed exception, or larger timeout unless that behavior is the explicit contract.
- Protect secrets, credentials, personal data, and customer payloads in logs, fixtures, screenshots, queries, and reports.
- Never claim "fixed" without rerunning the strongest available signal. State what remains unverified.

## 0. Incident gate

When the symptom suggests active security compromise, data corruption, duplicate financial effects, or unbounded resource exhaustion:

1. Recommend containment and evidence preservation first.
2. Avoid mutations, restarts, cleanup, or instrumentation that could destroy evidence without authorization.
3. Continue diagnosis only through safe, read-only actions until the incident owner approves more.

**Done when:** the task is safe to investigate, or the required containment decision is explicit.

## 1. Establish the case and access

Use details already supplied. Ask **one compact question** for only the missing high-leverage information:

> What exact symptom remains unexplained, and which access is available: local/dev run, dev DB, Grafana/APM/traces, production logs on request, reviewed read-only production SQL, deploy/CI history, or temporary instrumentation?

Do not block if the user cannot answer. Record:

- expected vs actual behavior;
- exact error, wrong value, latency, or user action;
- affected scope, frequency, first known occurrence, and last known good state;
- incident timestamp **with timezone**, request/trace/correlation ID, service/version, and relevant input shape when available;
- access available now, access available only on request, and prohibited access.

For safe, targeted evidence requests, read `references/production-access.md`.

**Done when:** there is a one-sentence bug statement and an explicit access map, even if the map is "codebase only."

## 2. Orient before theorizing

Read repository instructions, `README`, architecture/context documents, ADRs, tests, and the closest analogous working path. Then trace the actual execution path:

`entrypoint → validation → business rules → persistence/external calls → async/retry/cache → response or side effect`

Also inspect:

- configuration and feature-flag resolution;
- schema/migration expectations;
- error handling and observability;
- recent relevant history with `git log`, `git blame`, and diffs;
- callers and downstream consumers, not only the crashing function.

Build a **bug chain**:

`trigger → first invalid state → propagation → visible symptom`

**Done when:** every link in the proposed path cites concrete code, and unknown links are named rather than guessed.

## 3. Build the strongest available signal

Use the highest achievable level:

1. **Red loop** — a failing unit, integration, end-to-end, CLI, HTTP, or browser test reproduces the exact symptom.
2. **Production evidence loop** — a repeatable log, trace, metric, or bounded read-only query demonstrates the violated invariant.
3. **Surrogate loop** — a local/dev fixture preserves the production-relevant condition and fails at the same invariant.
4. **Static-only analysis** — code, history, and contracts support hypotheses, but no runtime signal is available.

Useful loops include request replay, captured payload fixtures, synthetic dev-DB rows, old-vs-new differential runs, `git bisect run`, deterministic stress loops, and targeted performance baselines.

Tighten the signal: pin time and randomness, isolate network/filesystem state, narrow setup, and assert the exact symptom. For flaky bugs, increase reproduction rate through repetition, concurrency, load, or controlled scheduling.

Static-only analysis **does not block investigation**. It lowers confidence: continue code forensics, request the smallest missing artifact, and do not claim confirmation.

**Done when:** one repeatable command or probe is recorded, or the investigation is explicitly marked `STATIC-ONLY` with the reason.

## 4. Reproduce, characterise, and minimise

Confirm the signal matches the user's bug rather than a nearby failure. Vary one dimension at a time:

- input shape and boundary values;
- tenant/account/role;
- locale, encoding, timezone, and clock boundary;
- state sequence, retries, duplicate delivery, and cache state;
- concurrency and ordering;
- deployment version, schema version, config, and feature flags.

Shrink the scenario while preserving the failure. For production-only bugs, minimise the **evidence request** and the local surrogate rather than experimenting broadly in production.

**Done when:** the smallest known trigger and the invariant it violates are explicit.

## 5. Rank falsifiable hypotheses

Generate 3–5 hypotheses before editing. For each, record:

| Rank | Hypothesis | Evidence for | Evidence against | Prediction | Cheapest probe |
|---|---|---|---|---|---|

A valid prediction states what observation would strengthen or falsify the hypothesis. Prefer probes that distinguish multiple hypotheses.

When the hypothesis space is broad, read `references/bug-patterns.md`.

For complex cases, use read-only parallel investigators when supported:

- **flow tracer** — maps the real execution and data path;
- **evidence analyst** — analyses logs, traces, metrics, SQL results, and deployment timing;
- **falsifier** — searches for counterexamples and alternative causes.

Keep their findings separate until synthesis to reduce anchoring. Subagents do not edit.

**Done when:** the leading hypothesis explains the full bug chain and has survived at least one attempted falsification, or the result is honestly `INCONCLUSIVE`.

## 6. Probe surgically

Map every probe to a prediction. Change one variable at a time.

Preference order:

1. existing debugger, profiler, trace, or REPL inspection;
2. targeted boundary logs or metrics;
3. bounded read-only queries;
4. temporary instrumentation with explicit approval.

Tag temporary instrumentation with a unique marker such as `[DEBUG-7f3a]`. Log identifiers and state transitions, not secrets or full payloads. Define sampling, performance budget, expiry/removal, and success criteria before deployment.

For performance problems, establish a baseline first: latency distribution, throughput, CPU/memory, allocation, pool/queue saturation, query count, and query plan as applicable. Measure before changing code.

Production actions are user-executed or explicitly authorized. Never improvise write queries, restarts, feature-flag changes, or broad data exports.

**Done when:** evidence selects a cause, falsifies the current leader, or identifies the exact missing observation needed next.

## 7. Lock the bug down, then fix

Create a regression test **before** the fix at the closest truthful seam:

- Prefer a test that exercises the real call pattern.
- If production data cannot be used, create the smallest synthetic fixture that preserves the violated invariant.
- If only a surrogate is possible, label it as such.
- If no honest test seam exists, document that architectural limitation; do not create a shallow test that gives false confidence.

Apply the smallest patch that repairs the earliest violated invariant. Reuse existing code and platform capabilities before adding abstractions. Preserve compatibility and existing error semantics unless those semantics are the defect.

Separate code correction from data repair, backfill, migration, or operational mitigation. Consequential changes require an explicit rollout and rollback plan.

**Done when:** the regression test changes red → green and the patch contains no unrelated work.

## 8. Verify adversarially

Run, as applicable:

1. the original strongest signal;
2. the new regression test;
3. focused tests for the modified module;
4. adjacent integration tests and the full relevant suite;
5. lint, type checks, build, and static analysis;
6. repeated concurrency/flakiness runs or the same performance benchmark;
7. a diff review for compatibility, security, and unintended behavior.

Then challenge the result:

- Does the patch fix the cause or only the manifestation?
- Which plausible alternative remains?
- What input, tenant, timing, or failure mode is not covered?
- Can retry, partial failure, rollback, or old data reintroduce it?
- Is the patch safe under duplicate execution and concurrent requests?
- Is observability sufficient to detect recurrence?

Remove all temporary logs, fixtures, flags, scripts, and debug markers unless intentionally retained and documented.

**Done when:** verification evidence is recorded, residual risk is explicit, and rollback is practical.

## 9. Report

Use this closeout:

```markdown
## Debug result
Status: CONFIRMED | PROBABLE | POSSIBLE | INCONCLUSIVE
Confidence: High | Medium | Low

### Finding
Symptom:
Trigger:
Earliest violated invariant:
Root cause:
Bug chain:

### Evidence
- Fact:
- Inference:
- Unknown:

### Fix
Files changed:
Why this is the smallest safe change:

### Validation
Commands/probes:
Observed result:
Unverified production checks:

### Impact and risk
Affected scope:
Compatibility/security/performance risks:
Rollback:

### Prevention
Regression coverage:
Observability or architectural follow-up:
```

Use `CONFIRMED` only when runtime or production evidence demonstrates the cause and the same signal clears after the fix. `PROBABLE` requires strong code-path evidence with alternatives materially ruled out. `POSSIBLE` is a code-only candidate.

## Ask before consequential actions

Ask before production mutation, deployment/restart, config or feature-flag change, temporary production instrumentation, data repair/backfill, destructive testing, public API/schema change, or migration. Otherwise state assumptions and continue.
````

### references/production-access.md

````markdown
# Production Access and Evidence Requests

Read this file when production evidence, observability, databases, or temporary instrumentation may be involved.

## Principle: request the narrowest evidence that can distinguish hypotheses

Production access is an accelerator, not a prerequisite. Prefer a bounded artifact over broad access. Never request credentials, full database copies, unrestricted shell access, or raw customer payloads.

Every request should name:

- service/environment/version;
- exact time window and timezone;
- request, trace, correlation, tenant, or job identifier;
- fields needed and fields to redact;
- the hypothesis or invariant the evidence will test.

## Access ladder

### Local or dev runtime

Use the same versions, flags, migrations, and dependency configuration where practical. Record known parity gaps. A dev environment that lacks production data can still reproduce schema, timing, ordering, nullability, retry, and state-transition failures with synthetic fixtures.

### Dev database

Verify schema and migration parity before trusting results. Build the smallest synthetic row set that preserves the suspected invariant. Do not copy production personal data merely for convenience.

### Grafana, APM, metrics, and traces

Request or inspect:

- the exact incident window plus a comparable healthy window;
- error rate, throughput, and latency distribution—not only averages;
- CPU, memory, connection/thread pools, queues, saturation, retries, and dependency latency;
- trace waterfall, failing span, service version, instance/pod, and correlation ID;
- deploy, config, and feature-flag annotations.

A screenshot without panel name, query, time range, and timezone is weak evidence. Ask for those details or an export.

### Production logs on request

Ask for a narrow window around one known event, normally tens of lines before and after it, plus structured fields:

- timestamp/timezone;
- service, version, instance/pod;
- request/trace/correlation ID;
- error type, stack, state transition, retry count, and duration;
- input **shape or identifiers**, not secret or personal payload content.

Template:

```text
Please provide logs for <service> from <start–end, timezone>, filtered by
<trace/request/job ID or exact error>. Include service version, instance/pod,
stack trace, retry count, and 50 lines before/after. Redact credentials,
tokens, personal data, and full request/response bodies.
```

### Reviewed read-only production SQL

The agent proposes the query; an authorized human reviews and executes it. Prefer a read replica. Keep it:

- read-only and bounded;
- explicit-column, never `SELECT *`;
- filtered by indexed identifiers and a narrow time range;
- limited and deterministically ordered;
- free of locks, DDL, DML, functions with side effects, and broad scans.

Use placeholders rather than real customer values.

PostgreSQL pattern:

```sql
BEGIN TRANSACTION READ ONLY;
SET LOCAL statement_timeout = '5s';

SELECT id, status, updated_at
FROM target_table
WHERE indexed_key = :indexed_key
  AND updated_at >= :from_utc
  AND updated_at < :to_utc
ORDER BY updated_at DESC
LIMIT 100;

ROLLBACK;
```

MySQL pattern, when the server version supports these controls:

```sql
SET SESSION MAX_EXECUTION_TIME = 5000;
START TRANSACTION READ ONLY;

SELECT id, status, updated_at
FROM target_table
WHERE indexed_key = :indexed_key
  AND updated_at >= :from_utc
  AND updated_at < :to_utc
ORDER BY updated_at DESC
LIMIT 100;

ROLLBACK;
```

Review the actual execution plan and index availability before any query that may scan materially. Avoid `EXPLAIN ANALYZE` in production unless an authorized database owner explicitly approves its execution effects and cost.

Query request format:

```text
Purpose/invariant:
Database and version:
Read source: primary | replica
SQL with placeholders:
Expected rows/scans:
Required index:
Timeout and limit:
How each possible result changes the hypotheses:
```

### Deploy and CI history

Collect commit/image version, rollout start/end, failed/retried deployments, migration version, config/secret rotation, dependency version, and feature-flag changes. Temporal correlation is a lead, not proof; verify the changed path can produce the symptom.

### Temporary production instrumentation

Require explicit approval and define:

- exact fields and boundary;
- redaction;
- sampling and rate limit;
- expected overhead;
- unique debug marker;
- deployment duration and automatic expiry;
- removal owner;
- observation that confirms or falsifies the hypothesis.

Prefer counters, timings, IDs, and state transitions over full payload logging.

## Confidence labels

- **Confirmed:** direct runtime/production evidence demonstrates the causal chain, and the same signal clears after the fix.
- **Probable:** code-path and available evidence support one cause while meaningful alternatives are ruled out.
- **Possible:** plausible static finding with insufficient runtime evidence.
- **Inconclusive:** evidence does not distinguish the remaining hypotheses.

Restricted access changes the label, not the obligation to investigate.
````

### references/bug-patterns.md

````markdown
# Production Bug Pattern Map

Use this only when the hypothesis space is broad. Check boundaries first; production bugs often emerge where two individually reasonable components disagree.

## Data and contract boundaries

- null, empty, missing, zero, sentinel, and optional-value confusion;
- type coercion, precision, overflow, rounding, and identifier truncation;
- schema/serializer version skew, unknown fields, enum expansion, and backward compatibility;
- locale, collation, case-folding, Unicode normalization, encoding, and line endings;
- timezone, daylight-saving transitions, clock skew, expiration boundaries, and inclusive/exclusive ranges;
- pagination, unstable ordering, duplicate keys, off-by-one limits, and partial pages;
- validation occurring after side effects or differing between entrypoints.

## State and lifecycle

- hidden mutable globals, reused request state, stale singletons, and order-dependent initialization;
- partial updates, missing compensation, exception paths that skip cleanup, and "success" returned before durable completion;
- retry without idempotency, duplicate message delivery, at-least-once processing, and non-atomic check-then-act;
- stale cache, wrong cache key/scope, invalidation gaps, negative caching, and read-after-write inconsistency;
- resources not closed on every path: connections, files, streams, locks, sessions, processes, subscriptions, and timers;
- background jobs using old config, old code, or incompatible payloads.

## Concurrency and distributed systems

- lost update, race, deadlock, lock inversion, starvation, and unsafe lazy initialization;
- transaction isolation mismatch, replica lag, non-repeatable reads, and write visibility assumptions;
- timeout/retry amplification, thundering herd, queue poison messages, and retry storms;
- cross-service contract drift, partial deployment, mixed versions, and inconsistent feature flags;
- non-monotonic events, out-of-order delivery, duplicate callbacks, and missing deduplication.

## Persistence and database

- application model diverges from deployed schema or migration order;
- `NULL` semantics, collation, timezone conversion, implicit casts, and default values;
- missing/unused index, parameter-sensitive plans, N+1 queries, accidental full scans, and lock contention;
- transaction boundary too large, too small, or absent;
- data invariant enforced only in code while multiple writers exist;
- soft-delete, tenant, authorization, or status filters omitted on one path.

## Configuration and deployment

- environment variable absent, malformed, stale, or interpreted differently;
- config precedence surprises, secret rotation, DNS/service discovery, certificate expiry, and proxy/header differences;
- build artifact or source map mismatch, stale frontend bundle/service worker, and container image drift;
- runtime, library, OS, architecture, or database-version differences;
- rollout coinciding with the symptom but not executing the affected path.

## Error handling and observability

- exception swallowed, transformed without cause, logged at wrong level, or reported as success;
- broad fallback hides corruption or permission failure;
- logs omit correlation IDs, version, tenant scope, retry count, or state transition;
- health checks pass while a dependency, queue, worker, or critical path is degraded;
- monitoring averages conceal tail latency or a small affected cohort.

## Performance and resource pressure

- connection/thread/process pool saturation, queue growth, unbounded concurrency, and backpressure gaps;
- memory leak, retained listener/cache, allocation churn, GC pressure, and large-object copies;
- synchronous work on an event loop, blocking I/O, lock contention, and serial fan-out;
- missing timeout budget, cancellation propagation, batching, or pagination;
- expensive logging/serialization, repeated parsing, and work performed after the response;
- performance "fix" that moves cost elsewhere or changes correctness.

## Security and authorization

- authentication vs authorization confusion;
- tenant/ownership check absent on one read/write path;
- trusted proxy/header assumptions and inconsistent canonicalization;
- permission cache staleness, role-version drift, and TOCTOU checks;
- sensitive data exposed through logs, traces, errors, fixtures, or debug endpoints.

## Legacy-code-specific signals

- duplicated business rules that have diverged;
- comments describing behavior the code no longer implements;
- magic values and implicit contracts with no tests;
- catch-all exception blocks and default-success returns;
- functions with many callers whose preconditions differ;
- code that depends on call order, shared mutation, or undocumented side effects;
- "temporary" compatibility branches that became permanent;
- tests that mock away the boundary where the production bug occurs.

For every suspected pattern, identify the concrete invariant, evidence, prediction, and cheapest falsifying probe. A checklist hit is not a finding.
````
