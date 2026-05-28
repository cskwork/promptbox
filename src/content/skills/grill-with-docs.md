---
title: grill-with-docs
summary: "내 계획을 질문으로 파고들면서, 프로젝트에서 쓰는 용어가 흔들리지 않게 그 자리에서 정리해 주는 스킬. 애매한 단어는 정확히 못 박고, 코드와 안 맞는 부분은 짚어 준다."
summary_en: "Stress-tests your plan with questions, locks in agreed terms, and flags wherever your plan and code disagree."
tags: [skill, interview, design-review, ddd, context, adr, mattpocock]
source: https://github.com/mattpocock/skills/tree/main/skills/engineering/grill-with-docs
author: mattpocock
license: mattpocock/skills 참조
order: 27
trigger: "계획 검토 + 도메인 용어 / grill against docs / stress-test plan against project language / 도메인 인터뷰"
install: "npx skills add https://github.com/mattpocock/skills --skill grill-with-docs"
---

## 한 줄

grill-me에 "용어 관리"를 더한 버전 — 인터뷰 중 내가 쓴 단어가 프로젝트 용어집(`CONTEXT.md`) 정의와 충돌하면 바로 지적하고, 합의된 뜻은 그 자리에서 `CONTEXT.md`에 적어 둔다.

*EN: grill-me, but it also keeps your project's words straight — clashes get called out, agreed meanings get written down right away.*

## 언제 쓰는가

- 새 기능을 implementation(구현) 전에 도메인 언어와 정렬
- 모호한/overloaded(한 단어에 뜻이 여럿 겹친) 용어 sharpen(뜻을 더 날카롭게) ("account"는 Customer인가 User인가?)
- 사용자가 말한 동작과 코드 동작의 contradiction(모순) 발견

## 파일 구조 가정

- 단일 컨텍스트: 루트의 `CONTEXT.md` + `docs/adr/`
- 멀티 컨텍스트: 루트의 `CONTEXT-MAP.md`가 각 컨텍스트의 `CONTEXT.md` 위치를 가리킴

파일은 lazy(필요할 때만 미루어) 생성 — 첫 용어가 resolve(뜻이 확정)될 때 `CONTEXT.md`를 만든다.

## 함정

- `CONTEXT.md`에 구현 디테일을 넣지 말 것. spec(명세)도, scratch pad(낙서장)도 아니다. **glossary(용어집)일 뿐.**
- ADR(아키텍처 결정 기록)은 **3가지 조건이 모두** 충족될 때만: hard to reverse(되돌리기 어려운) + surprising without context(맥락 없이는 의외인) + 진짜 trade-off(장단점 맞교환). 하나라도 빠지면 skip(건너뜀).
- 용어 업데이트는 batch(모아서 한꺼번에)하지 말고 그때그때 — 발견 즉시 캡처.

## 원문 SKILL.md (전문)

````markdown
---
name: grill-with-docs
description: Grilling session that challenges your plan against the existing domain model, sharpens terminology, and updates documentation (CONTEXT.md, ADRs) inline as decisions crystallise. Use when user wants to stress-test a plan against their project's language and documented decisions.
---

<what-to-do>

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time, waiting for feedback on each question before continuing.

If a question can be answered by exploring the codebase, explore the codebase instead.

</what-to-do>

<supporting-info>

## Domain awareness

During codebase exploration, also look for existing documentation:

### File structure

Most repos have a single context:

```
/
├── CONTEXT.md
├── docs/
│   └── adr/
│       ├── 0001-event-sourced-orders.md
│       └── 0002-postgres-for-write-model.md
└── src/
```

If a `CONTEXT-MAP.md` exists at the root, the repo has multiple contexts. The map points to where each one lives:

```
/
├── CONTEXT-MAP.md
├── docs/
│   └── adr/                          ← system-wide decisions
├── src/
│   ├── ordering/
│   │   ├── CONTEXT.md
│   │   └── docs/adr/                 ← context-specific decisions
│   └── billing/
│       ├── CONTEXT.md
│       └── docs/adr/
```

Create files lazily — only when you have something to write. If no `CONTEXT.md` exists, create one when the first term is resolved. If no `docs/adr/` exists, create it when the first ADR is needed.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with the existing language in `CONTEXT.md`, call it out immediately. "Your glossary defines 'cancellation' as X, but you seem to mean Y — which is it?"

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'account' — do you mean the Customer or the User? Those are different things."

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force the user to be precise about the boundaries between concepts.

### Cross-reference with code

When the user states how something works, check whether the code agrees. If you find a contradiction, surface it: "Your code cancels entire Orders, but you just said partial cancellation is possible — which is right?"

### Update CONTEXT.md inline

When a term is resolved, update `CONTEXT.md` right there. Don't batch these up — capture them as they happen. Use the format in [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md).

`CONTEXT.md` should be totally devoid of implementation details. Do not treat `CONTEXT.md` as a spec, a scratch pad, or a repository for implementation decisions. It is a glossary and nothing else.

### Offer ADRs sparingly

Only offer to create an ADR when all three are true:

1. **Hard to reverse** — the cost of changing your mind later is meaningful
2. **Surprising without context** — a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off** — there were genuine alternatives and you picked one for specific reasons

If any of the three is missing, skip the ADR. Use the format in [ADR-FORMAT.md](./ADR-FORMAT.md).

</supporting-info>
````
