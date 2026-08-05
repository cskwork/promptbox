---
title: to-spec
summary: "지금까지 나눈 대화와 코드를 그대로 스펙(무엇을 왜 만드는지 정리한 문서)으로 바꿔서 팀 작업 목록(이슈 트래커)에 올려준다. 다시 질문하지 않고 이미 아는 내용으로 정리해 준다."
summary_en: "Converts your current conversation and code into a spec and posts it to the issue tracker — no extra questions asked."
tags: [skill, spec, planning, requirements, mattpocock]
source: https://github.com/mattpocock/skills/tree/main/skills/engineering/to-spec
author: mattpocock
license: mattpocock/skills 참조
order: 33
trigger: "to-spec / write a spec / 현재 컨텍스트로 스펙 / synthesize spec / publish spec"
install: "npx skills add https://github.com/mattpocock/skills --skill to-spec"
---

## 한 줄

추가 질문을 **하지 않는다** — 이미 아는 것(대화 + 코드)만으로 스펙을 만든다. `setup-matt-pocock-skills`를 먼저 실행하고, 작업 목록(트래커)에 `ready-for-agent` 라벨을 붙여 올린다.
*EN: No interview — it drafts the spec from what's already in the conversation and code, then files it on the tracker.*

> **이름이 바뀌었습니다.** 원래 `to-prd`였고 업스트림에서 `to-spec`으로 개명됐습니다. 산출물을 부르는 말도 PRD 대신 **spec**으로 통일됐습니다. 예전 이름으로 설치돼 있다면 다시 설치해야 합니다.

## 프로세스

1. Repo explore (이미 했으면 skip). 도메인 glossary(용어 사전) 어휘 사용, ADR(아키텍처 결정 기록) 존중.
2. **테스트를 끼워 넣을 seam(이음새)을 먼저 스케치.** 새 seam보다 기존 seam을 우선하고, 가능한 한 **높은 위치**의 seam을 고른다. 코드베이스 전체를 통틀어 seam은 적을수록 좋고 이상적인 개수는 하나다. 이 seam 배치가 기대와 맞는지 사용자에게 확인받는다.
3. 스펙을 템플릿대로 작성 → 트래커에 publish, `ready-for-agent` 라벨 적용. 별도 triage(분류) 불필요.

## 함정

- **`disable-model-invocation: true`** — 모델이 알아서 부르지 않는다. `/to-spec`으로 직접 호출.
- **파일 경로와 코드 조각은 넣지 않는다** — 금방 낡는다. 예외는 prototype이 만들어 낸, 산문보다 결정을 더 정확히 담은 조각(상태 기계, reducer, 스키마, 타입 모양)뿐이고 그마저 결정에 해당하는 부분만 잘라 넣는다.
- User Stories는 **아주 길게** — 기능의 모든 측면을 덮어야 한다. 여기서 아끼면 뒤의 `/to-tickets`가 쪼갤 재료가 없다.

## 원문 SKILL.md (전문)

```markdown
---
name: to-spec
description: Turn the current conversation into a spec and publish it to the project issue tracker — no interview, just synthesis of what you've already discussed.
disable-model-invocation: true
---

This skill takes the current conversation context and codebase understanding and produces a spec. Do NOT interview the user — just synthesize what you already know.

The issue tracker and triage label vocabulary should have been provided to you — run `/setup-matt-pocock-skills` if not.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Use the project's domain glossary vocabulary throughout the spec, and respect any ADRs in the area you're touching.

2. Sketch out the seams at which you're going to test the feature. Existing seams should be preferred to new ones. Use the highest seam possible. If new seams are needed, propose them at the highest point you can. The fewer seams across the codebase, the better - the ideal number is one.

Check with the user that these seams match their expectations.

3. Write the spec using the template below, then publish it to the project issue tracker. Apply the `ready-for-agent` triage label - no need for additional triage.

<spec-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list of user stories should be extremely extensive and cover all aspects of the feature.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype. Trim to the decision-rich parts — not a working demo, just the important bits.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are out of scope for this spec.

## Further Notes

Any further notes about the feature.

</spec-template>
```
