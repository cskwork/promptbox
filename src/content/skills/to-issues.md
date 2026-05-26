---
title: to-issues
summary: 계획·spec·PRD를 **vertical slice tracer bullet** 이슈들로 쪼개서 이슈 트래커에 publish. 각 슬라이스는 모든 layer(schema/API/UI/test)를 관통하는 얇고 완결된 path. HITL vs AFK 구분.
tags: [skill, planning, issues, vertical-slice, tracer-bullet, mattpocock]
source: https://github.com/mattpocock/skills/tree/main/skills/engineering/to-issues
author: mattpocock
license: mattpocock/skills 참조
order: 32
trigger: "to-issues / break this plan into issues / 이슈로 쪼개 / create implementation tickets / vertical slice 분할"
install: "npx skills add https://github.com/mattpocock/skills --skill to-issues"
---

## 한 줄

PRD나 계획을 **얇은 vertical slice**로 분할 — 각 슬라이스는 단일 layer(예: schema만)가 아니라 schema→API→UI→test를 모두 cut through하고, 단독으로 demo/verify 가능해야 함. `setup-matt-pocock-skills` 먼저 실행 필요.

## 슬라이스 규칙

- 각 슬라이스는 narrow하지만 **COMPLETE** path
- 완료된 슬라이스는 단독으로 demoable
- 두꺼운 슬라이스 적게 < 얇은 슬라이스 많이
- 가능하면 **AFK** (인간 개입 없이 implement+merge), HITL는 정말 필요할 때만

## 사용자에게 quiz

각 슬라이스를 numbered list로 — Title / Type(HITL·AFK) / Blocked by / User stories covered. 이후:

- Granularity가 맞는가? (too coarse / too fine)
- Dependency가 맞는가?
- merge / split할 슬라이스가 있나?
- HITL/AFK 마킹이 맞나?

사용자 승인 후 dependency 순서대로 publish (blocker 먼저) — "Blocked by"에 진짜 이슈 ID 넣기 위해.

## 이슈 본문 템플릿

```
## Parent
(부모 이슈 reference; 없으면 생략)

## What to build
End-to-end behavior 서술 — layer-by-layer 구현 X. 파일 경로/코드 스니펫 피하라 (stale 됨). 예외: prototype에서 정확하게 결정을 encode한 snippet은 inline.

## Acceptance criteria
- [ ] ...

## Blocked by
- #123  (또는 "None - can start immediately")
```

## 함정

- Parent 이슈 close/modify 금지.
- 파일 경로 박지 말 것 — stale 보장.
- Triage label은 기본 `ready-for-agent`로 publish (별도 triage 불필요).

## 원문 SKILL.md (전문)

````markdown
---
name: to-issues
description: Break a plan, spec, or PRD into independently-grabbable issues on the project issue tracker using tracer-bullet vertical slices. Use when user wants to convert a plan into issues, create implementation tickets, or break down work into issues.
---

# To Issues

Break a plan into independently-grabbable issues using vertical slices (tracer bullets).

The issue tracker and triage label vocabulary should have been provided to you — run `/setup-matt-pocock-skills` if not.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes an issue reference (issue number, URL, or path) as an argument, fetch it from the issue tracker and read its full body and comments.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code. Issue titles and descriptions should use the project's domain glossary vocabulary, and respect ADRs in the area you're touching.

### 3. Draft vertical slices

Break the plan into **tracer bullet** issues. Each issue is a thin vertical slice that cuts through ALL integration layers end-to-end, NOT a horizontal slice of one layer.

Slices may be 'HITL' or 'AFK'. HITL slices require human interaction, such as an architectural decision or a design review. AFK slices can be implemented and merged without human interaction. Prefer AFK over HITL where possible.

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI, tests)
- A completed slice is demoable or verifiable on its own
- Prefer many thin slices over few thick ones
</vertical-slice-rules>

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each slice, show:

- **Title**: short descriptive name
- **Type**: HITL / AFK
- **Blocked by**: which other slices (if any) must complete first
- **User stories covered**: which user stories this addresses (if the source material has them)

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any slices be merged or split further?
- Are the correct slices marked as HITL and AFK?

Iterate until the user approves the breakdown.

### 5. Publish the issues to the issue tracker

For each approved slice, publish a new issue to the issue tracker. Use the issue body template below. These issues are considered ready for AFK agents, so publish them with the correct triage label unless instructed otherwise.

Publish issues in dependency order (blockers first) so you can reference real issue identifiers in the "Blocked by" field.

<issue-template>
## Parent

A reference to the parent issue on the issue tracker (if the source was an existing issue, otherwise omit this section).

## What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation.

Avoid specific file paths or code snippets — they go stale fast. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it here and note briefly that it came from a prototype. Trim to the decision-rich parts — not a working demo, just the important bits.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- A reference to the blocking ticket (if any)

Or "None - can start immediately" if no blockers.

</issue-template>

Do NOT close or modify any parent issue.
````
