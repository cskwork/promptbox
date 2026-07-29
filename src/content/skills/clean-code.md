---
title: clean-code
title_en: Clean Code
summary: "레거시 코드를 동작은 바꾸지 않고 리팩터링하게 이끄는 저장소 인식 에이전트 스킬. 먼저 특성화 테스트로 현재 동작을 고정하고, 그 테스트가 계속 통과하는 동안만 작은 배치로 편집한다. 추상화를 늘리기보다 정확한 이름과 지역성을 우선한다."
summary_en: "Refactor legacy code without changing its observable behavior. Lock current behavior with retained characterization tests first, then edit only in small batches that keep them green. Favors precise names and locality over abstraction."
tags: [skill, refactoring, legacy-code, characterization-test, behavior-preserving, clean-code, codex, agent-skills]
source: https://github.com/cskwork/clean-code
author: cskwork
license: MIT
order: 36
trigger: "레거시 코드 정리 / 리팩터링 / 단순화·이름 바꾸기 / 구조 잡기 / 기술 부채 줄이기 / 동작은 그대로, 코드만 개선"
install: "git clone https://github.com/cskwork/clean-code.git"
---

## 한 줄

"클린 코드"를 **더 많은 파일·인터페이스·패턴**과 동일시하지 않는다. 핵심은 **동작을 건드리기 전에 특성화 테스트(characterization test)로 현재 동작을 고정**하고, 이후 모든 편집을 그 증거와 대조하는 것. 좁은 diff가 넓은 재작성을 이기고, 정확한 이름 하나가 추출된 프레임워크를 이긴다.

*EN: "Clean" is not more files or patterns — it's behavior locked by tests before you touch it, then every edit checked against that evidence.*

## 절대 규칙

- 특성화 테스트가 **변경 전 코드**에서 통과하기 전엔 프로덕션 코드를 손대지 않는다.
- 특성화 테스트는 **영구 회귀 테스트**로 남긴다 — 리팩터링 뒤에도 삭제·약화 금지.
- 리팩터링과 **버그 수정·기능·의존성 업그레이드·포맷팅을 섞지 않는다.**
- API가 걸려 있으면 **버저닝 게이트**를 한 번만 묻는다 — v1을 그 자리에서 보존할지, v1은 그대로 두고 병행 v2를 추가할지.
- 놀라운 레거시 동작은 **버그가 아니라 레거시 동작**으로 취급 — 명시적 승인 없이 몰래 고치지 않는다.
- 검증 보고는 **통과 / 원래 실패 / 새로 실패 / 실행 안 함**을 구분. 과장 없이.

## 워크플로우 (순서가 곧 안전)

1. **경계 설정** — 안내문(`AGENTS.md` 등) 읽기, 전체 호출 경로 추적, 실제 test/lint/build 명령 찾기, 베이스라인 기록(이미 실패 중인 테스트 포함).
2. **특성화 테스트로 동작 고정** — 가장 안정적인 관측 지점으로. 주 경로·경계·에러·레거시 특성 포착. *이 단계에서 프로덕션 diff는 0.*
3. **API 버저닝 게이트** — 외부 노출 API면 정확히 한 가지 결정만 묻고 멈춘다.
4. **가장 작은 유의미한 리팩터링 설계** — 이름 → 제어 흐름 → 중복 → 응집도 → 추출 순. 새 추상화는 구체적 문제 하나로 스스로를 증명해야 한다.
5. **작은 동작 보존 배치로 구현** — 배치마다 하나의 변환. 매번 좁은 테스트. 이전에 통과한 테스트가 놀라면 즉시 되돌린다.
6. **검증** — 해당 영역의 모든 검사 실행, 베이스라인과 비교. 설명 못 할 새 실패가 있으면 "완료" 주장을 멈춘다.
7. **보고** — 범위·API 전략·유지된 테스트·개선점·검증 증거·보존된 특성·미검증 위험. 사실과 가정을 분리한다.

## 설치 (두 가지 범위)

```bash
# 프로젝트 범위 — 저장소를 따라감
git clone https://github.com/cskwork/clean-code.git
cp -r clean-code <repository>/.agents/skills/clean-code

# 사용자 범위 — 모든 프로젝트에서
cp -r clean-code ~/.agents/skills/clean-code
```

*EN: Keep `SKILL.md` at the skill folder root — that's the whole install. Other Agent Skills-compatible clients: drop the `clean-code` folder into their configured skills directory.*

## 호출 (샘플 프롬프트)

```
$clean-code 레거시 주문 가격 책정 모듈을 동작은 바꾸지 않고 리팩터링해 줘.
```

*EN: `$clean-code Refactor the legacy order-pricing module without changing behavior.`*

명시적 호출 없이도 "레거시 정리", "기술 부채 줄이기", "이름·구조 개선", "동작 유지 리팩터링" 같은 요청에 암시적 라우팅으로 발동한다.

## 원문 SKILL.md (전문)

````markdown
---
name: clean-code
description: Safely refactor legacy code for readability and maintainability without changing its behavior. Use when asked to clean up, simplify, rename, untangle, restructure, reduce technical debt, or make existing code easier to change. First retain passing characterization tests for the unchanged legacy behavior; for an API, then ask whether to preserve v1 in place or leave v1 untouched and build a side-by-side v2; only then implement small verified refactors.
license: MIT
compatibility: Requires repository access and the ability to run the project's tests and relevant verification commands.
metadata:
  version: "1.0.0"
---

# Clean Code

Refactor legacy code so that a future maintainer can understand and change it with less risk. Preserve observable behavior unless the user explicitly approves a behavior change.

## Operating priorities

Apply these priorities in order:

1. Preserve behavior with evidence.
2. Use precise, domain-oriented names.
3. Keep related logic easy to read in one place.
4. Reduce branching, duplication, hidden state, and change coupling.
5. Introduce abstractions only when they remove demonstrated complexity.
6. Prefer a focused diff over a broad rewrite.

Do not optimize for the number of methods, classes, files, patterns, or lines. Excessive extraction can make code harder to understand by forcing readers to jump between files.

## Non-negotiable rules

- Do not change production behavior before retained characterization tests pass against the unchanged legacy code.
- Keep the characterization tests as permanent legacy regression tests. Do not delete or weaken them after the refactor.
- Do not combine a refactor with a bug fix, feature change, dependency upgrade, or unrelated formatting pass.
- If the target is an API and the versioning strategy is unresolved, complete the characterization-test gate and then ask the API versioning question before implementation.
- Work in small, reversible batches. Run the narrowest relevant tests after every batch.
- Preserve surprising behavior as legacy behavior unless the user explicitly authorizes changing it.
- Never hide pre-existing failures, skip tests, relax assertions, or claim a green suite that was not run successfully.
- Respect repository-local instructions, architecture, naming conventions, and user changes already present in the working tree.

## Workflow

### 1. Establish the refactoring boundary

Before editing:

1. Read repository instructions and nearby documentation, including files such as `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, ADRs, and module READMEs when present.
2. Inspect the working tree. Do not overwrite or reformat unrelated user changes.
3. Discover the repository's test, lint, type-check, build, and integration commands from configuration and CI files rather than guessing.
4. Trace the complete call path through the requested code, its callers, consumers, state changes, and external effects.
5. Identify the observable seam through which behavior can be tested.
6. Determine whether the target is an API: HTTP/RPC/GraphQL endpoints, a published library or SDK, a public CLI, an event/message contract, or another externally consumed interface.
7. Run the existing relevant tests and, when practical, the full suite. Record all pre-existing failures exactly.
8. State the intended scope and the behavior that must remain unchanged.

Completion criteria:

- The target, callers, consumers, observable behavior, verification commands, and baseline state are known.
- No production code has been changed.

### 2. Lock current behavior with retained characterization tests

Read characterization-tests.md, then add tests that describe what the legacy code actually does today.

Requirements:

1. Test through the most stable observable seam available. Prefer a public function, service boundary, endpoint, command, event, or persisted effect over private methods.
2. Add coverage for the main path, important boundaries, error behavior, output shape, and meaningful side effects.
3. Capture legacy quirks explicitly when consumers may depend on them. Label them as legacy behavior; do not silently correct them.
4. Make the tests deterministic. Control time, randomness, environment, network, filesystem, and concurrency only as needed.
5. Follow repository conventions while making the tests easy to retain and recognize. Prefer a `legacy` or `characterization` suite, directory, tag, or filename where the test framework permits it.
6. Run the new tests against the unchanged production code. They must pass before refactoring begins.
7. Confirm the production diff is still empty after this step, apart from test fixtures or test-only support.

Do not write assertions that merely repeat the implementation. Assert externally observable results and effects.

If unrelated tests already fail, preserve the exact baseline and require the newly added characterization suite to pass. Do not misrepresent the entire repository as green.

Completion criteria:

- Retained characterization tests pass on the unchanged legacy implementation.
- The tests cover the behavior at risk from the planned refactor.
- Production code remains unchanged.

### 3. Apply the API versioning gate

Perform this step only when the target is an API and the user has not already selected a versioning strategy.

Ask exactly one decision question:

> I found an externally consumed API. Should I **(A)** refactor its internals while preserving the existing v1 contract, or **(B)** leave the v1 production implementation untouched and add a side-by-side v2 implementation? I recommend **[A or B]** because **[one concrete repository-specific reason]**.

Stop before implementation until the user answers. Do not repeat the question if the user already gave a clear choice.

Then follow api-versioning.md:

- **A — preserve v1 in place:** refactor internals only; contract tests must prove the v1 interface and behavior remain compatible.
- **B — add v2 beside v1:** do not edit v1 production code; add a separate v2 entry point and implementation using the repository's existing versioning mechanism. Tests and documentation may be added around v1 without changing it.

Completion criteria:

- The API strategy is explicit and recorded before production changes.

### 4. Design the smallest useful refactor

Read refactoring-heuristics.md.

Create a concise change plan. For each proposed edit, record:

| Observed friction | Evidence in the code | Smallest transformation | Protecting test | Navigation impact |
|---|---|---|---|---|

Plan in this order:

1. Improve misleading or vague names using the domain language already present in requirements, tests, and neighboring code.
2. Simplify local control flow with guard clauses, clearer conditions, explicit intermediate values, and removal of dead branches.
3. Remove proven duplication and unnecessary indirection.
4. Move behavior toward the data or concept it naturally belongs to when this improves cohesion.
5. Extract a method, class, module, or pattern only when the extraction has a precise name and reduces demonstrated complexity or change coupling.

Every new abstraction must answer:

- What concrete problem does this solve now?
- Which likely change becomes localized?
- Does the reader gain more than the navigation cost introduced?
- Can the same result be achieved with a rename, deletion, or small local rewrite?

If those answers are weak, do not introduce the abstraction.

Completion criteria:

- Every planned change is behavior-preserving, test-protected, and justified by observed friction.

### 5. Implement in small behavior-preserving batches

Use this preferred sequence:

1. Rename for meaning.
2. Clarify variables, conditions, and data flow.
3. Remove dead code and redundant wrappers.
4. Consolidate real duplication.
5. Improve ownership and locality.
6. Extract or move cohesive logic only when earned.
7. Apply a design pattern only when real variation or coupling justifies its added indirection.

For each batch:

1. Make one coherent transformation.
2. Inspect the diff for accidental scope expansion.
3. Run the narrow characterization tests and relevant unit tests.
4. Keep the batch only when behavior remains protected and readability or change cost measurably improves.
5. Revert or correct the latest batch immediately if a previously passing test fails unexpectedly.

Constraints:

- Do not perform a wholesale rewrite unless the user explicitly requests one and the retained tests protect the full contract.
- Do not add speculative interfaces, factories, adapters, base classes, configuration, or extension points for hypothetical future needs.
- Do not split cohesive single-use logic across files merely to make functions shorter.
- Do not alter validation, authorization, transactions, error mapping, logging, accessibility, or other trust-boundary behavior as a simplification shortcut.
- Do not add a dependency when the repository, language, or platform already provides a clear solution.
- Under the v2 strategy, keep v1 production files untouched even when sharing code would be convenient, unless the user separately approves modifying v1.

Completion criteria:

- The production diff is focused.
- Relevant tests pass after each batch.
- The result is easier to read locally and easier to change along the identified change axis.

### 6. Verify the completed refactor

Read verification-and-reporting.md.

Run all commands applicable to the touched area:

1. Retained legacy characterization tests.
2. Relevant unit, integration, contract, and end-to-end tests.
3. The full test suite when practical.
4. Linting, formatting checks, static analysis, and type checking.
5. Build or packaging commands.
6. Security, performance, concurrency, migration, or compatibility checks when the refactor touches those risks.
7. `git diff --check` or the repository equivalent.

Compare final results with the recorded baseline. There must be no new unexplained failures.

Review the final diff for:

- accidental API or schema changes;
- changed defaults, ordering, error behavior, side effects, serialization, or null handling;
- disabled, weakened, or over-mocked tests;
- unrelated formatting or dependency changes;
- unnecessary files, wrappers, abstractions, comments, or compatibility shims;
- v1 production changes when the selected strategy was side-by-side v2.

Completion criteria:

- Verification evidence is recorded accurately.
- No new regression is known.
- Any command not run is named with the reason.

### 7. Report the result

Use this structure:

```markdown
## Refactor completed

- **Scope:**
- **API strategy:** Not applicable | v1 preserved in place | side-by-side v2
- **Legacy characterization tests retained:**
- **Main readability and change-cost improvements:**
- **Verification commands and results:**
- **Known behavior intentionally preserved:**
- **Unverified risks or pre-existing failures:**
- **Follow-up:** Only work justified by a current requirement
```

Separate verified facts from assumptions. Do not state that behavior is unchanged solely because the code looks equivalent; cite the tests and checks that support the conclusion.
````
