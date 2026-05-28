---
title: to-prd
summary: "지금까지 나눈 대화와 코드를 그대로 기획서(PRD, 무엇을 왜 만드는지 정리한 문서)로 바꿔서 팀 작업 목록(이슈 트래커)에 올려준다. 다시 질문하지 않고 이미 아는 내용으로 정리해 준다."
summary_en: "Converts your current conversation and code into a PRD (product requirements doc) and posts it to the issue tracker — no extra questions asked."
tags: [skill, prd, planning, requirements, mattpocock]
source: https://github.com/mattpocock/skills/tree/main/skills/engineering/to-prd
author: mattpocock
license: mattpocock/skills 참조
order: 33
trigger: "to-prd / write a PRD / 현재 컨텍스트로 PRD / synthesize PRD / publish PRD"
install: "npx skills add https://github.com/mattpocock/skills --skill to-prd"
---

## 한 줄

추가 질문을 **하지 않는다** — 이미 아는 것(대화 + 코드)만으로 기획서(PRD)를 만든다. `setup-matt-pocock-skills`를 먼저 실행하고, 작업 목록(트래커)에 `ready-for-agent` 라벨을 붙여 올린다.
*EN: No interview — it drafts the PRD from what's already in the conversation and code, then files it on the tracker.*

## 프로세스

1. Repo explore (이미 했으면 skip). 도메인 glossary 어휘 사용, ADR 존중.
2. Build/modify할 major module sketch — deep module 추출 기회를 적극적으로 찾기. 사용자에게 module 매핑이 기대와 맞는지, 어느 module에 테스트 쓸지 확인.
3. PRD를 템플릿대로 작성 → 트래커에 publish, `ready-for-agent` 라벨 적용.

## PRD 템플릿

```
## Problem Statement
사용자 관점의 문제.

## Solution
사용자 관점의 해결책.

## User Stories
LONG numbered list. "As a <actor>, I want <feature>, so that <benefit>"

## Implementation Decisions
- Built/modified module들
- 그 module들의 interface 변경
- 기술적 clarification, architecture, schema, API contract, specific interaction
(파일 경로/코드 스니펫 X. 예외: prototype의 결정-encoding snippet만 inline.)

## Testing Decisions
- 좋은 테스트의 정의 (external behavior only)
- 테스트할 module
- prior art

## Out of Scope

## Further Notes
```

## 원문 SKILL.md (전문)

````markdown
---
name: to-prd
description: Turn the current conversation context into a PRD and publish it to the project issue tracker. Use when user wants to create a PRD from the current context.
---

This skill takes the current conversation context and codebase understanding and produces a PRD. Do NOT interview the user — just synthesize what you already know.

The issue tracker and triage label vocabulary should have been provided to you — run `/setup-matt-pocock-skills` if not.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Use the project's domain glossary vocabulary throughout the PRD, and respect any ADRs in the area you're touching.

2. Sketch out the major modules you will need to build or modify to complete the implementation. Actively look for opportunities to extract deep modules that can be tested in isolation.

A deep module (as opposed to a shallow module) is one which encapsulates a lot of functionality in a simple, testable interface which rarely changes.

Check with the user that these modules match their expectations. Check with the user which modules they want tests written for.

3. Write the PRD using the template below, then publish it to the project issue tracker. Apply the `ready-for-agent` triage label - no need for additional triage.

<prd-template>

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

A description of the things that are out of scope for this PRD.

## Further Notes

Any further notes about the feature.

</prd-template>
````
