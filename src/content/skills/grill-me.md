---
title: grill-me
summary: 코드를 짜기 전에 내 계획의 빈틈을 잡아주는 AI 면접관. 한 번에 한 질문씩, 매 질문마다 추천 답을 함께 던지며 놓친 결정들을 끝까지 캐묻는다.
summary_en: An AI that stress-tests your plan before you write code — one probing question at a time, each with a suggested answer.
tags: [skill, interview, planning, design-review, mattpocock, socratic]
source: https://github.com/mattpocock/skills/tree/main/skills/productivity/grill-me
author: mattpocock
license: mattpocock/skills 참조
order: 25
hidden: true
trigger: "내 계획 검토해줘 / grill me / stress-test this plan / design review / 디자인 결정 점검"
install: "npx skills add https://github.com/mattpocock/skills --skill grill-me"
---

## 한 줄

스킬 본문이 단 5문장 — *한 번에 한 질문씩, 매 질문에 권장 답까지, 코드로 답할 수 있는 질문이면 코드부터 본다*. 이 단순함이 본질.
*EN: The whole skill is five sentences — one question at a time, a suggested answer each time, and check the code first when the code can answer it.*

## 언제 쓰는가

- 새 기능 구현 직전 — 다운스트림 이슈 막기 위해 plan을 vet(검증)
- 아키텍처 결정 검증
- "내 plan에 빈 곳 있나" 확인하고 싶을 때

## 어떻게 동작하는가

매번 한 가지 질문만. 그리고 추천 답을 같이 제시. 사용자가 동의하거나 다른 선택을 해야 다음 branch(결정 트리의 갈래)로 진행. 코드베이스에서 답을 찾을 수 있는 질문은 묻기 전에 직접 탐색.

## 함정

스킬 본문이 5문장뿐이라 "이게 다야?" 싶지만 — 이 단순함이 의도된 것. 더 많은 룰을 넣으면 인터뷰가 mechanical(기계적)해진다.

## 원문 SKILL.md (전문)

````markdown
---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
---

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time.

If a question can be answered by exploring the codebase, explore the codebase instead.
````
