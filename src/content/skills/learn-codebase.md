---
title: learn-codebase
summary: "코드와 테스트를 근거로 실행 흐름과 설계 이유를 설명하는 학습 스킬. 요청한 범위와 깊이에 맞추고 퀴즈는 원할 때 진행합니다."
summary_en: "Explain code flows and design decisions from source evidence, at the depth requested. Quiz only when invited."
tags: [skill, claude-code, codex, code-review, onboarding, intent]
source: https://github.com/cskwork/learn-codebase
author: cskwork
license: MIT
order: 30
hidden: true
trigger: "AI shipped this PR / there's a 40-page spec and 100 files / onboard junior to one feature / did implementation match spec / scared to change behavior X"
install: "git clone https://github.com/cskwork/learn-codebase ~/.claude/skills/learn-codebase"
---

## 한 줄

코드의 실행 흐름과 설계 이유를 실제 파일과 테스트에 연결해 설명합니다. 요청한 범위와 깊이를 우선하며, 확인된 사실과 추론을 구분합니다.

## 설명과 퀴즈

Map(구조), Walk(실행 흐름), Probe(설계 판단), Master(불변 조건) 중 필요한 깊이로 설명합니다. 전체 설명을 요청했으면 메뉴 선택을 기다리지 않습니다. 퀴즈는 사용자가 원할 때 별도 스킬로 진행하며, 정답 공개나 종료 요청을 따릅니다. 참고 파일과 템플릿은 원본 저장소에서 함께 설치합니다.

## 스킬 원문

````markdown
---
name: learn-codebase
description: Explain unfamiliar code by pairing intended behavior with source, tests, and design decisions. Use for feature onboarding, understanding AI-written changes, investigating spec/code drift, or assessing change impact.
---

# learn-codebase — Intent-Anchored Reading

Connect what a feature is meant to do with the code that implements it. Read-only analysis is the default; findings do not authorize fixes or issue creation.

## Scope and delivery

Start with the feature or question the user named. Use the shallowest level that answers it, and complete the requested explanation without forcing menu selections between sections. For an open-ended learning session, begin with a short map and offer a focused next step.

Match the user's language and demonstrated knowledge. In Korean, use `정상 흐름`, `진입점`, `판단 근거`, and `규칙 지도`; preserve source identifiers and exact errors. Explain unfamiliar terms once when needed. A plain summary usually suffices; use an analogy only if it clarifies the behavior. Do not assume a question proves a knowledge gap.

Lead with the answer, then the evidence. Keep tables and excerpts focused on the question; put extensive detail in a linked artifact when useful. [templates/plain-speech-checklist.md](templates/plain-speech-checklist.md) is a review aid for substantial explanations.

## Pair intent with implementation

For each important behavior or decision, capture:

| What this means | Intent (document section) | Code (file:line) | Test or contract | Rejected alternative and reason |
|---|---|---|---|---|
| A reviewer approves a candidate before it becomes a real item. | spec.md § Approval | review.py:42 | test_review.py::test_approval | Auto-approval rejected in ADR-3 |

Use [templates/sidebyside.md](templates/sidebyside.md) for a full walk. Mark missing evidence `?`; distinguish observed behavior, documented intent, and inference. Never invent rationale or claim a test ran merely because it exists.

Start from the canonical spec for **Forward (spec→code)** reading. Start from an entry function for **Reverse (code→spec)** reading when intent is sparse, drifted, or absent. Missing intent is a finding, not a reason to fabricate a spec or stop explaining the code.

Use the project's stated authority. Otherwise look for canonical specifications, ADRs and clarifications, contracts/schemas, tests, and relevant issue/commit history. Current code establishes implemented behavior; a conflicting document establishes a discrepancy to report. Read [references/finding-intent.md](references/finding-intent.md) when the source of intent is unclear or using Reverse reading.

## Choose the useful depth

| Level | Question | Evidence and result |
|---|---|---|
| 1 — Map | What does this feature do? | Overview, central user story, and an anchored entry function; short purpose/scope explanation. |
| 2 — Walk | How does the normal flow work? | Trace one story end to end, pairing meaningful stops with intent and tests/contracts; include relevant error paths and unknowns. |
| 3 — Probe | Why is it built this way? | Map relevant clarifications and ADRs to enforcing code, protecting tests, and recorded rejected alternatives. |
| 4 — Master | What breaks if X changes? | Map domain invariants to validators, schemas, assertions, and tests; identify module boundaries and affected contracts. |

These are depth choices, not mandatory sequential gates. Use a decision matrix or invariant map only when it answers the request. [templates/progression-checklist.md](templates/progression-checklist.md) helps review a substantial artifact; [examples/twin-question-platform.md](examples/twin-question-platform.md) demonstrates Levels 1–3.

## Drift and completion

For a drift investigation, use [references/diagnostic.md](references/diagnostic.md) to check required behavior, enforcement, boundary tests, and code without documented intent. Report discrepancies with both citations and the next check that would resolve uncertainty. Do not automatically implement, descope, create issues, or back-fill decisions.

Before reporting, confirm the explanation answers the requested question, cites the relevant intent and code, and labels missing evidence. Change-impact predictions remain predictions until verified. Stop when the requested depth is satisfied; expand only for an unresolved concern or user request.
````
