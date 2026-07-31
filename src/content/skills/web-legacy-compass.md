---
title: web-legacy-compass
summary: "레거시 웹 기능을 고치거나 디버깅하기 전, 실제 사용자 플로우를 브라우저부터 DB까지 한 줄의 증거 체인으로 추적해 기록한다. 코드를 먼저 손대지 않는다."
summary_en: "Before touching a single line of legacy web code, traces the real user flow end-to-end — browser, API, business rule, database — and records one evidence chain."
tags: [skill, legacy-web, debugging, browser-tracing, evidence, playwright, chrome-devtools, claude-code]
source: https://github.com/cskwork/web-legacy-compass
author: cskwork
license: MIT
order: 65
trigger: "레거시 웹 플로우 추적 / browser-to-db evidence chain / feature work or debugging on legacy web / request order · payload · console · business exception · DB read-write 정합 / web-legacy-compass"
install: "git clone https://github.com/cskwork/web-legacy-compass.git && cd web-legacy-compass && ./install.sh /path/to/your/project"
---

## 한 줄

코드를 고치기 전에 **실제 사용자 플로우를 먼저 관찰**한다. 클릭 한 번이 어떤 요청 순서·페이로드·콘솔·비즈니스 예외·DB 읽기/쓰기로 이어지는지 증거(evidence) 체인으로 엮어 `docs/web-flows/` 에 Markdown 으로 남긴다. 그 위에서 최초 분기점(earliest divergence)을 찾고, 최소 변경만 가한다.

*EN: The prime directive is observe before modify — build a browser-to-database evidence chain before changing any legacy code.*

## 언제 쓰는가

- 레거시 웹 앱에서 **기능 추가** 또는 **버그 수정** 을 해야 할 때
- 요청 순서·중복·폴링·리다이렉트가 결과에 영향을 주는 복잡한 플로우
- 프론트엔드 콘솔·백엔드 비즈니스 예외·DB 읽기/쓰기를 **하나의 시간선** 에서 정합해야 할 때
- "유닛 테스트는 통과하는데 실제 화면에선 안 된다" 는 상황

## 무엇을 하는가

1. **플로우 레코드 즉시 생성** — `docs/web-flows/YYYY-MM-DD-<slug>.md`, `templates/FLOW-RECORD.md` 시작
2. **베이스라인 캡처** — 첫 액션 전에 네트워크/트레이스/콘솔 녹화 시작
3. **정확한 사용자 여정 재현** — 한 액션씩, 순서대로. 모든 결과 요청(redirect·retry·poll·background 포함) 기록
4. **브라우저→데이터 체인 구축** — DOM event → store → API client → controller → domain rule → transaction → query → DB write → side effect
5. **최초 분기점 찾기** — 버그라면 가장 먼저 틀어진 단계, 기능이라면 현 체인에서 목표 체인까지 최소 delta
6. **반박 가능한 가설** — Observed fact · Inference · Disproof check · Proposed change
7. **같은 플로우로 재현(replay)** — 변경 후 동일 role·input·시작 상태로 before/after 비교

## 함정

- **HTTP 200 ≠ 비즈니스 정상.** 상태 코드만 보고 판단 금지
- **엔드포인트 이름으로 DB 동작 추론 금지.** 실제 repository/query 코드나 런타임 증거 추적
- **증거 수준 구분 필수.** `runtime verified` · `code inferred` · `assumed` · `unavailable` 을 명시. 코드 추론을 프로덕션 행 변경 증거로 둔갑하지 말 것
- **한 브라우저 세션 = 한 명 소유자.** 병렬 에이전트는 같은 세션을 동시에 조작하면 안 됨

## 브라우저 도구 라우팅 (요약)

| 우선순위 | 도구 | 역할 |
|---|---|---|
| 1차 | Playwright CLI | 컴팩트 재현·트레이스·요청 순서 캡처 (기본 도구) |
| 2차 | Chrome DevTools MCP | 정밀 검사·에스컬레이션 (정확한 body·소스맵·성능) |
| 옵션 | Ego Lite | 공유 로그인 상속이 하드 제약일 때만 |
| 옵션 | agent-browser | 이미 표준화된 repo 에서만, 네비게이션 캡처 한계 검증 후 |

상세 결정표와 운용 시퀀스는 repo 의 `references/BROWSER-TOOL-ROUTING.md` 참조.

## SKILL.md (원문)

````markdown
---
name: web-legacy-compass
description: Trace real legacy-web user flows before changing frontend or API code. Use for feature work or debugging where request order, important payload fields, browser state, frontend console output, backend business exceptions, and database reads or writes must be correlated and recorded.
---

# Web Legacy Compass

## Prime directive

**Observe the real user flow before modifying code.**

Do not start implementation until the current behavior is represented by evidence, or every unavailable evidence source is explicitly marked. At minimum, establish:

1. the ordered user actions and browser requests;
2. the request fields that select or change business behavior;
3. the relevant client-state transitions;
4. the frontend console and backend business-exception evidence;
5. the database reads used for selection and the writes or side effects caused by the flow.

Create the investigation record immediately and update it throughout the work. Use the repository's existing documentation convention; otherwise create:

```text
docs/web-flows/YYYY-MM-DD-<feature-or-bug>.md
```

Start from `templates/FLOW-RECORD.md`.

## Operating constraints

- Prefer the smallest maintainable change that explains and fixes the observed divergence.
- Reproduce in the safest available environment. Default to read-only actions until mutation is necessary and authorized.
- Never trigger destructive actions, payments, messages, deletes, bulk changes, or production writes without explicit authorization.
- Never store passwords, cookies, tokens, authorization headers, secrets, or unnecessary personal data in the record.
- Record important payload fields, not indiscriminate full payload dumps.
- Distinguish **runtime verified**, **code inferred**, **assumed**, and **unavailable** evidence.
- Do not infer database behavior from endpoint names alone. Trace repository/query code or runtime data evidence.
- Do not treat a successful HTTP status as proof of correct business behavior.

## Workflow

### 1. Frame the flow and open the record

Write the target outcome, user role, environment, entry URL, known symptom or desired behavior, safety boundaries, and available evidence sources.

Inventory access without blocking progress:

- runnable application and authentication state;
- browser automation or inspection tool;
- frontend and backend source;
- frontend console output;
- backend application/business-exception logs;
- database schema, read replica, development database, or approved query execution;
- API documentation, traces, metrics, and correlation identifiers.

Mark missing access in the record and continue with the strongest available evidence.

### 2. Capture the baseline before the first action

Record the initial URL, visible state, user/tenant/role when relevant, selected entity, filters, browser storage relevant to the behavior, and any pre-existing console errors.

Start network and trace capture **before** reproducing the flow. Use the routing rules in `references/BROWSER-TOOL-ROUTING.md`.

### 3. Reproduce the exact user journey

Perform one deliberate action at a time. For each action:

1. note visible and client state before the action;
2. perform the action;
3. capture every resulting request in chronological order, including redirects, retries, polling, preflight, and background requests that affect interpretation;
4. inspect important request and response fields;
5. record the visible/client state after the action;
6. collect relevant console messages and correlation identifiers.

Use sequence numbers shared by all evidence tables. One user action may map to zero, one, or many requests.

### 4. Build the browser-to-data chain

Trace the complete path where evidence permits:

```text
user action
→ DOM event / handler
→ validation and client state/store
→ API client
→ gateway/controller
→ application/domain service
→ business rule or exception
→ transaction
→ repository/query
→ database reads/writes
→ event, cache, audit, or downstream side effect
→ response
→ client state/render
```

For every state-changing or selection-critical request, identify:

- the code entry points;
- the branch-driving request fields;
- the business rule and exception path;
- the tables/entities read to make the selection;
- the tables/entities inserted, updated, or deleted;
- transaction boundaries and secondary effects.

Use `references/EVIDENCE-MODEL.md` for payload, data, and log rules.

### 5. Parallelize analysis without corrupting browser state

For non-trivial flows, split independent code analysis after creating a shared reproduction packet. Use one browser owner only.

Recommended roles:

- **Browser owner:** reproduces the flow and owns the canonical request/console trace.
- **Frontend analyst:** traces event → validation/store → API client → response handling → render.
- **Backend analyst:** traces controller → service/domain rule → business exception → transaction → repository.
- **Data analyst:** maps queries, predicates, joins, tables, columns, keys, writes, locks, events, caches, and audit effects.
- **Adversarial reviewer:** tests whether the claimed first divergence and proposed change are actually supported.

Give each analyst the same sequence IDs, endpoint list, important payload fields, timestamps/correlation IDs, and scoped question. Tell subagents not to delegate recursively. The main agent must verify findings against source code or runtime evidence; do not merely concatenate reports.

When parallel agents are unavailable, perform the roles sequentially in the same order. See `references/SUBAGENT-PATTERN.md`.

### 6. Find the earliest meaningful divergence

For a bug, compare expected and observed behavior at each sequence step. Stop at the earliest point where one of these first becomes wrong:

- event or client input;
- request order, duplication, omission, or payload;
- server branch or business validation;
- database selection or mutation;
- response mapping;
- client state or rendering.

Later errors may be consequences, not root causes.

For a feature, describe the smallest delta from the verified current chain to the desired chain. Identify compatibility constraints for API contracts, legacy callers, schema, transactions, and logs.

### 7. Form a testable explanation

Write:

- **Observed fact:** directly supported by trace, log, code, test, or query.
- **Inference:** the explanation connecting facts.
- **Disproof check:** the evidence that would make the inference false.
- **Proposed change:** the smallest code/config/data-contract change addressing the first divergence.

Do not implement a hypothesis that has no practical disproof check.

### 8. Implement incrementally

Before changing behavior, add or preserve a failing regression test when feasible. Change only the files necessary for the verified chain.

Logging changes must improve future diagnosis rather than add noise:

- frontend logs should identify the user action, relevant client state transition, request/correlation ID, and business-validation branch;
- backend business exceptions should include a stable error code, business condition, safe entity/tenant/actor identifiers, correlation ID, and transaction outcome;
- technical exceptions should retain stack/cause information;
- never log secrets or raw sensitive payloads;
- remove temporary debug output or convert it to appropriately leveled structured logging.

Update the Markdown record when implementation changes the proposed flow or reveals that an earlier inference was wrong.

### 9. Replay the same flow

Run the same user journey using the same role, inputs, and starting state. Compare before and after:

- request count, order, method, endpoint, important payload fields, status, and important response fields;
- client state and rendered result;
- frontend console errors and business messages;
- backend business exceptions and transaction outcome;
- database rows, columns, side effects, and idempotency behavior;
- regression and adjacent tests.

A passing unit test alone does not complete a browser-observed legacy-web change.

### 10. Finalize the evidence record

The record must state:

- verified current flow;
- desired or corrected flow;
- first divergence and root-cause evidence;
- files and contracts changed;
- tests and exact replay performed;
- before/after evidence;
- remaining assumptions, unavailable evidence, and risks.

## Completion gate

Do not declare completion until all applicable statements are true:

- [ ] Each user action is mapped to its zero-or-more ordered requests.
- [ ] Redirects, retries, polling, duplicate calls, and background calls that affect behavior are accounted for.
- [ ] Important request and response fields are recorded and secrets are redacted.
- [ ] Relevant client-state transitions and console evidence are mapped to sequence IDs.
- [ ] Backend business exceptions and technical failures are separated and correlated to the flow.
- [ ] Every selection-critical database read and state-changing operation is mapped to code/runtime evidence or marked unavailable.
- [ ] Transaction boundaries and relevant cache/event/audit/downstream side effects are documented.
- [ ] Runtime-verified facts are distinguishable from code inference and assumptions.
- [ ] The earliest divergence is supported by evidence and has a disproof check.
- [ ] The implementation is minimal, regression-tested, and replayed through the actual browser flow.
- [ ] The final Markdown record matches the implemented behavior.

## Reference loading

Read only the reference needed for the current stage:

- browser selection and commands: `references/BROWSER-TOOL-ROUTING.md`
- payload, database, state, and logging evidence: `references/EVIDENCE-MODEL.md`
- parallel-agent handoff and verification: `references/SUBAGENT-PATTERN.md`
- investigation/output document: `templates/FLOW-RECORD.md`
````
