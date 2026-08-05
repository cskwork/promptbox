---
title: to-tickets
summary: "긴 계획서나 스펙을, 하나씩 따로 작업할 수 있는 작은 티켓으로 쪼개 이슈 트래커에 등록해 줍니다. 각 티켓은 화면부터 데이터까지 한 기능이 통째로 동작하는 단위이고, 먼저 끝나야 할 티켓이 무엇인지도 함께 적힙니다."
summary_en: "Breaks a plan or spec into small, independently-workable tickets — each a full end-to-end slice, each declaring what blocks it."
tags: [skill, planning, tickets, vertical-slice, tracer-bullet, mattpocock]
source: https://github.com/mattpocock/skills/tree/main/skills/engineering/to-tickets
author: mattpocock
license: mattpocock/skills 참조
order: 32
trigger: "to-tickets / break this plan into tickets / 티켓으로 쪼개 / create implementation tickets / vertical slice 분할"
install: "npx skills add https://github.com/mattpocock/skills --skill to-tickets"
---

## 한 줄

스펙이나 계획을 작은 작업 단위로 쪼개되, "DB만" 또는 "화면만" 같은 한쪽 층이 아니라 데이터→API→화면→테스트가 한 줄로 다 이어지는 얇은 한 기능(**vertical slice**, 세로로 자른 조각)으로 나눕니다. 그래야 각 티켓을 단독으로 시연하고 확인할 수 있습니다. `setup-matt-pocock-skills` 먼저 실행 필요.

*EN: Each ticket is one thin feature that runs end to end — not a single layer — so it can be demoed and checked by itself.*

> **이름이 바뀌었습니다.** 원래 `to-issues`였고, 업스트림에서 `to-plan`과 병합돼 `to-tickets`가 됐습니다. 예전 이름으로 설치돼 있다면 다시 설치해야 합니다.

## 슬라이스 규칙

- 각 슬라이스는 narrow(좁지만)하되 **COMPLETE**한 path — 모든 층(스키마·API·UI·테스트)을 관통
- 완료된 슬라이스는 단독으로 demoable(혼자서도 시연 가능한)
- 각 슬라이스는 **fresh context window(새 맥락 창) 하나에 들어가는 크기**
- prefactoring(나중 작업을 쉽게 만드는 사전 정리)은 맨 앞에

각 티켓에는 **blocking edge**(이 티켓이 시작되기 전에 끝나야 하는 다른 티켓)를 적습니다. blocker가 없는 티켓은 바로 시작 가능 — 그게 **frontier**(지금 집을 수 있는 최전선)입니다.

## wide refactor는 예외

컬럼 이름 바꾸기처럼 기계적이지만 **blast radius**(파급 범위)가 코드베이스 전체에 퍼지는 변경은 vertical slice로 못 쪼갭니다. 한 번 고치는 순간 수천 개 호출부가 동시에 깨져 어떤 조각도 초록(CI 통과) 상태로 못 끝나기 때문입니다. 이때는 **expand–contract**로 순서를 잡습니다.

1. **expand** — 새 형태를 옛 형태 **옆에** 추가. 아무것도 안 깨짐.
2. **migrate** — 호출부를 blast radius 크기에 맞춰(패키지별·디렉터리별) 배치로 옮김. 배치마다 티켓 하나, 전부 expand에 blocked. 옛 형태가 아직 살아 있으므로 배치마다 CI가 초록.
3. **contract** — 남은 호출부가 없어지면 옛 형태 삭제. 모든 migrate 배치에 blocked.

배치조차 단독으로 초록일 수 없다면 순서는 유지하되 공용 integration 브랜치를 쓰고, 마지막 "통합·검증" 티켓에서만 초록을 약속합니다.

## 함정

- **`disable-model-invocation: true`** — `/to-tickets`로 직접 호출.
- **로컬 트래커일 때 파일 하나에 티켓 하나.** `.scratch/<feature-slug>/issues/<NN>-<slug>.md`로 의존 순서대로 번호를 매깁니다. 합본 `tickets.md`는 금지 — 예전 스펙에서 바뀐 부분입니다.
- **부모 이슈는 닫거나 수정하지 않습니다.**
- 파일 경로·코드 조각은 넣지 않습니다(금방 낡음). 예외는 prototype이 만들어 낸, 결정 그 자체를 담은 조각뿐.

## 원문 SKILL.md (전문)

```markdown
---
name: to-tickets
description: Break a plan, spec, or the current conversation into a set of tracer-bullet tickets, each declaring its blocking edges, published to the configured tracker — edges as text in one file per ticket locally, or native blocking links on a real tracker.
disable-model-invocation: true
---

# To Tickets

Break a plan, spec, or conversation into a set of **tickets** — tracer-bullet vertical slices, each declaring the tickets that **block** it.

The issue tracker and triage label vocabulary should have been provided to you — run `/setup-matt-pocock-skills` if not.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes a reference (a spec path, an issue number or URL) as an argument, fetch it and read its full body and comments.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code. Ticket titles and descriptions should use the project's domain glossary vocabulary, and respect ADRs in the area you're touching.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the easy change."

### 3. Draft vertical slices

Break the work into **tracer bullet** tickets.

<vertical-slice-rules>

- Each slice cuts a narrow but COMPLETE path through every layer (schema, API, UI, tests) — vertical, NOT a horizontal slice of one layer
- A completed slice is demoable or verifiable on its own
- Each slice is sized to fit in a single fresh context window
- Any prefactoring should be done first

</vertical-slice-rules>

Give each ticket its **blocking edges** — the other tickets that must complete before it can start. A ticket with no blockers can start immediately.

**Wide refactors are the exception to vertical slicing.** A **wide refactor** is one mechanical change — rename a column, retype a shared symbol — whose **blast radius** fans across the whole codebase, so a single edit breaks thousands of call sites at once and no vertical slice can land green. Don't force it into a tracer bullet; sequence it as **expand–contract**. First expand: add the new form beside the old so nothing breaks. Then migrate the call sites over in batches sized by blast radius (per package, per directory), each batch its own ticket blocked by the expand, keeping CI green batch to batch because the old form still exists. Finally contract: delete the old form once no caller remains, in a ticket blocked by every migrate batch. When even the batches can't stay green alone, keep the sequence but let them share an integration branch that all block a final integrate-and-verify ticket — green is promised only there.

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each ticket, show:

- **Title**: short descriptive name
- **Blocked by**: which other tickets (if any) must complete first
- **What it delivers**: the end-to-end behaviour this ticket makes work

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the blocking edges correct — does each ticket only depend on tickets that genuinely gate it?
- Should any tickets be merged or split further?

Iterate until the user approves the breakdown.

### 5. Publish the tickets to the configured tracker

Publish the approved tickets. **How** depends on the tracker `/setup-matt-pocock-skills` configured — the tickets are the same either way, only the shape of the blocking edges changes:

- **Local files** → write one file per ticket under `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01` in dependency order (blockers first). Each file's "Blocked by" lists the numbers/titles it depends on. Use the per-ticket file template below — one ticket per file, never a single combined file.
- **A real issue tracker (GitHub, Linear, …)** → publish one issue per ticket in dependency order (blockers first) so each ticket's blocking edges can reference real identifiers. Use the platform's native blocking / sub-issue relationship where it has one; otherwise set each ticket's "Blocked by" to the blocking issues. Apply the `ready-for-agent` triage label unless instructed otherwise — the tickets are agent-grabbable by construction.

Work the **frontier**: any ticket whose blockers are all done. For a purely linear chain that means top to bottom.

Do NOT close or modify any parent issue.

<local-ticket-template>

# <NN> — <Ticket title>

**What to build:** the end-to-end behaviour this ticket makes work, from the user's perspective — not a layer-by-layer implementation list.

**Blocked by:** the numbers/titles of the tickets that gate this one, or "None — can start immediately".

**Status:** ready-for-agent

- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2

</local-ticket-template>

<issue-template>

## Parent

A reference to the parent issue on the tracker (if the source was an existing issue, otherwise omit this section).

## What to build

The end-to-end behaviour this ticket makes work, from the user's perspective — not layer-by-layer implementation.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Blocked by

- A reference to each blocking ticket, or "None — can start immediately".

</issue-template>

In either form, avoid specific file paths or code snippets — they go stale fast. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it and note briefly that it came from a prototype. Trim to the decision-rich parts — not a working demo, just the important bits.
```
