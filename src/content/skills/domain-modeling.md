---
title: domain-modeling
summary: "설계하면서 프로젝트의 용어와 개념을 실시간으로 다듬어 기록하는 스킬. 애매한 말을 붙잡아 정확한 이름을 제안하고, 코드와 어긋나면 즉시 지적하고, 정해지는 순간 CONTEXT.md에 적는다. 되돌리기 어려운 결정만 골라 ADR로 남긴다."
summary_en: "Actively sharpens your project's vocabulary while you design — challenging fuzzy terms, cross-checking against the code, and writing the glossary and decisions down the moment they crystallise."
tags: [skill, domain-modeling, glossary, adr, ddd, mattpocock]
source: https://github.com/mattpocock/skills/tree/main/skills/engineering/domain-modeling
author: mattpocock
license: mattpocock/skills 참조
order: 28
trigger: "용어 정리하자 / ubiquitous language / 도메인 모델 / ADR 남겨 줘 / glossary 만들기"
install: "npx skills add https://github.com/mattpocock/skills --skill domain-modeling"
---

## 한 줄

**용어집을 *읽는* 게 아니라 *바꾸는* 스킬.** 그냥 `CONTEXT.md`를 참고하는 건 어느 스킬이나 하는 한 줄짜리 습관이고, 이건 설계 도중에 용어를 붙잡고 따지고 그 자리에서 적어 내리는 능동적 규율이다.

*EN: The active discipline — challenging terms and writing them down as they crystallise. Merely reading CONTEXT.md is not this skill.*

## 언제 쓰는가

- 설계 대화 중 같은 단어를 서로 다른 뜻으로 쓰고 있다는 낌새가 들 때
- `ubiquitous language`(팀 전체가 같은 뜻으로 쓰는 하나의 어휘)를 못 박아야 할 때
- 되돌리기 어려운 아키텍처 결정을 기록으로 남겨야 할 때
- `/grilling`, `/wayfinder` 같은 다른 스킬이 도메인 모델을 유지해야 할 때 (내부적으로 이 스킬을 부른다)

> 업스트림에서 별도로 있던 `ubiquitous-language` 스킬은 이 스킬에 흡수돼 삭제됐습니다. 한 대화에서 용어집을 덤프하는 대신 도메인 모델 전체를 만들고 유지하는 쪽이 낫다는 판단입니다.

## 파일 구조

대부분의 저장소는 단일 컨텍스트다 — 루트에 `CONTEXT.md`, `docs/adr/`에 결정 기록. 루트에 `CONTEXT-MAP.md`가 있으면 다중 컨텍스트이고, 그 지도가 각 컨텍스트(`src/ordering/CONTEXT.md` 등)의 위치를 가리킨다.

**파일은 게으르게 만든다** — 적을 게 생겼을 때만. 첫 용어가 정해지면 그때 `CONTEXT.md`를 만들고, 첫 ADR이 필요할 때 `docs/adr/`을 만든다.

## 세션 중에 하는 일

| 상황 | 행동 |
|---|---|
| 사용자가 기존 용어집과 충돌하는 말을 씀 | 즉시 지적 — "용어집엔 '취소'가 X인데 지금은 Y를 말씀하시는 것 같은데요, 어느 쪽인가요?" |
| 애매하거나 과부하된 단어 | 정확한 canonical term(정식 명칭) 제안 — "'계정'이라 하셨는데 Customer인가요 User인가요? 다른 것들입니다" |
| 도메인 관계를 논의 중 | 경계를 찌르는 구체적 시나리오를 지어내 압박 |
| 사용자가 동작 방식을 진술 | 코드와 대조 — 어긋나면 표면화 |
| 용어가 확정됨 | **그 자리에서** `CONTEXT.md` 갱신. 모아 뒀다 하지 않는다 |

## 함정

- **`CONTEXT.md`에 구현 세부는 절대 넣지 않는다.** 스펙도, 메모장도, 구현 결정 저장소도 아니다. **용어집, 그것뿐이다.**
- **ADR은 아껴서 제안한다.** 세 조건이 **모두** 참일 때만: ① 되돌리기 어렵고 ② 맥락 없이 보면 의아하고 ③ 진짜 트레이드오프의 결과일 것. 하나라도 빠지면 만들지 않는다.
- 형식은 같은 폴더의 `CONTEXT-FORMAT.md` / `ADR-FORMAT.md` 참조 — 아래 원문에는 포함되지 않는다.

## 원문 SKILL.md (전문)

````markdown
---
name: domain-modeling
description: Build and sharpen a project's domain model. Use when the user wants to pin down domain terminology or a ubiquitous language, record an architectural decision, or when another skill needs to maintain the domain model.
---

# Domain Modeling

Actively build and sharpen the project's domain model as you design. This is the *active* discipline — challenging terms, inventing edge-case scenarios, and writing the glossary and decisions down the moment they crystallise. (Merely *reading* `CONTEXT.md` for vocabulary is not this skill — that's a one-line habit any skill can do. This skill is for when you're changing the model, not just consuming it.)

## File structure

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
````
