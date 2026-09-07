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
description: Refactor legacy code for readability and maintainability while preserving observable behavior and externally consumed contracts.
---

# Clean Code

Make the requested code easier to understand and change. Preserve observable behavior unless the user authorizes a behavior change. Prefer precise names, simpler local control flow, cohesive ownership, and removal of proven duplication over new abstractions.

## Establish the boundary

Read relevant repository instructions, inspect the working tree, and discover verification commands from configuration and CI. Trace the target, its callers, state changes, and external effects. Record the relevant test baseline, including pre-existing failures; preserve unrelated work.

State the scope, observable behavior to preserve, and the evidence that will protect it. Reuse scope already established in the conversation. Keep bug fixes, new features, upgrades, and unrelated formatting outside a behavior-preserving refactor unless the user includes them.

## Protect current behavior

Use [characterization-tests.md](../../references/characterization-tests.md) when existing tests do not protect behavior at risk. Add retained tests through a stable observable seam and run them against unchanged production code before refactoring. Cover meaningful boundaries, errors, output shape, side effects, and consumer-dependent legacy quirks. Control nondeterminism only where needed.

Reuse adequate existing coverage instead of adding tests that repeat it. Do not weaken assertions or replace behavioral tests with implementation mirrors. When unrelated tests already fail, record that baseline and verify the affected behavior without claiming the whole repository is green.

## Preserve API contracts

For an externally consumed endpoint, library, CLI, event, or data contract, default to preserving the existing interface while refactoring internals. An ordinary behavior-preserving refactor does not require a new version or a repeated approval question.

If the requested result requires a contract change or the user wants v1 frozen, resolve the versioning choice before those changes; consult [api-versioning.md](../../references/api-versioning.md). Honor an existing choice:

- **Preserve v1:** protect the public contract with tests and refactor behind it.
- **Side-by-side v2:** keep v1 production files untouched, use the repository’s versioning mechanism, and retain v1 tests. Do not deprecate or redirect v1 or modify it for code sharing without authorization.

## Choose and apply the smallest useful change

For each change, identify the observed friction, smallest transformation, protecting check, and effect on navigation. Consult [refactoring-heuristics.md](../../references/refactoring-heuristics.md) when choosing a transformation.

Prefer renaming and simplifying local control flow before extracting or moving logic. Consolidate duplicated responsibilities only when sharing improves locality. A new abstraction must remove more complexity than its files, interfaces, and navigation add; existing variation or coupling must justify it.

Work in small coherent batches. Inspect the diff and run focused checks after each batch. Correct or revert a new regression without discarding unrelated changes. Avoid wholesale rewrites unless requested and adequately protected.

Do not alter validation, authorization, transactions, errors, logging, serialization, accessibility, or trust-boundary behavior as a simplification shortcut. Do not add dependencies, wrappers, interfaces, or extension points without a demonstrated need.

## Verify and report

Use [verification-and-reporting.md](../../references/verification-and-reporting.md) for the final review. Run required checks for the touched surface and broaden coverage when shared behavior or compatibility risk warrants it. Reuse evidence for unchanged state; rerun after relevant changes or unresolved failures.

Compare against the baseline. Check the diff for contract changes, changed defaults or side effects, weakened tests, unrelated edits, and unjustified abstractions. Under side-by-side v2, verify v1 production files remain untouched.

Report the main readability improvement, retained behavior, verification results, and any pre-existing failures or unverified risks. State API strategy only when relevant. Test and runtime evidence support compatibility claims; visual inspection alone does not prove equivalence.
````
