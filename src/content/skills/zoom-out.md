---
title: zoom-out
summary: 낯선 코드에서 길을 잃었을 때, AI에게 한 발 물러나 관련된 코드 덩어리와 그 호출 관계를 프로젝트가 쓰는 쉬운 용어로 지도처럼 정리해 달라고 요청하는 한 문장짜리 도구.
summary_en: Asks the AI to step back and sketch a map of the surrounding code in your project's own vocabulary.
tags: [skill, exploration, mental-model, navigation, mattpocock]
source: https://github.com/mattpocock/skills/tree/main/skills/engineering/zoom-out
author: mattpocock
license: mattpocock/skills 참조
order: 36
trigger: "zoom out / 한 단계 위로 / unfamiliar code / give me a map / 이 영역 전체 그림 / higher-level perspective"
install: "npx skills add https://github.com/mattpocock/skills --skill zoom-out"
---

## 한 줄

본문은 단 두 문장이다 — 이 영역을 잘 모르니, 한 단계 위로 물러나서 관련 코드 덩어리와 그것을 호출하는 곳들의 지도를 프로젝트의 쉬운 용어로 그려달라는 부탁.

*EN: Ask the AI to zoom out one level and sketch a map of the surrounding code in the project's own words.*

## 언제 쓰는가

- 낯선 영역에서 코드를 읽기 시작했지만 어디부터 봐야 할지 막막할 때
- bigger picture(큰 그림)에 어떻게 맞물리는지 모를 때
- 직속 호출자만 아니라 전체 호출 그래프 윤곽이 필요할 때

## 함정

- `disable-model-invocation: true` — 사용자가 명시적으로 호출. 자동 트리거되지 않음.
- map(지도)은 **도메인 glossary(용어집) 어휘**로 — "FooBarHandler"가 아니라 "Order intake module".

## 원문 SKILL.md (전문)

````markdown
---
name: zoom-out
description: Tell the agent to zoom out and give broader context or a higher-level perspective. Use when you're unfamiliar with a section of code or need to understand how it fits into the bigger picture.
disable-model-invocation: true
---

I don't know this area of code well. Go up a layer of abstraction. Give me a map of all the relevant modules and callers, using the project's domain glossary vocabulary.
````
