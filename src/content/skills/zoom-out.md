---
title: zoom-out
summary: 모르는 코드 영역에 들어갔을 때 agent에게 한 단계 위 추상화로 올라가서 관련 module과 caller의 map을 도메인 glossary 어휘로 그려달라고 요청하는 미니 스킬.
tags: [skill, exploration, mental-model, navigation, mattpocock]
source: https://github.com/mattpocock/skills/tree/main/skills/engineering/zoom-out
author: mattpocock
license: mattpocock/skills 참조
order: 36
trigger: "zoom out / 한 단계 위로 / unfamiliar code / give me a map / 이 영역 전체 그림 / higher-level perspective"
install: "npx skills add https://github.com/mattpocock/skills --skill zoom-out"
---

## 한 줄

스킬 본문이 단 두 문장 — 이 영역을 잘 모를 때, 한 단계 추상화 위로 올라가서 관련 module + caller의 map을 도메인 어휘로 그려달라.

## 언제 쓰는가

- 낯선 영역에서 코드를 읽기 시작했지만 어디부터 봐야 할지 막막할 때
- bigger picture에 어떻게 맞물리는지 모를 때
- 직속 호출자만 아니라 전체 호출 그래프 윤곽이 필요할 때

## 함정

- `disable-model-invocation: true` — 사용자가 명시적으로 호출. 자동 트리거되지 않음.
- map은 **도메인 glossary 어휘**로 — "FooBarHandler"가 아니라 "Order intake module".

## 원문 SKILL.md (전문)

````markdown
---
name: zoom-out
description: Tell the agent to zoom out and give broader context or a higher-level perspective. Use when you're unfamiliar with a section of code or need to understand how it fits into the bigger picture.
disable-model-invocation: true
---

I don't know this area of code well. Go up a layer of abstraction. Give me a map of all the relevant modules and callers, using the project's domain glossary vocabulary.
````
