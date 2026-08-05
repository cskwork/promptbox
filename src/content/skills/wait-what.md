---
title: wait-what
summary: "에이전트의 방금 설명이 이해되지 않을 때 한 번에 다시 설명시키는 초단문 스킬. 맥락을 조금 깔고, 쉬운 기술 영어(ASD-STE100)로, 프로젝트 용어집(CONTEXT.md)의 말로 다시 말하게 한다."
summary_en: "Six words for when the agent's last message didn't land — it re-pitches with context, in Simplified Technical English, using your project's own vocabulary."
tags: [skill, communication, clarity, mattpocock, one-liner]
source: https://github.com/mattpocock/skills/tree/main/skills/productivity/wait-what
author: mattpocock
license: mattpocock/skills 참조
order: 28
trigger: "wait what / 방금 그거 무슨 말이야 / 다시 설명해 줘 / 못 알아듣겠어"
install: "npx skills add https://github.com/mattpocock/skills --skill wait-what"
---

## 한 줄

**멈춰. 방금 그 메시지는 전달되지 않았다 — 다시 던져라.** 스킬 전체가 문장 두 개다.
*EN: Stop. That last message did not land — re-pitch it.*

## 언제 쓰는가

- 에이전트가 앞선 맥락을 다 갖고 있다는 전제로 설명해서 따라갈 수 없을 때
- "다시 설명해 줘"라고 하면 같은 말을 더 길게만 하는 걸 막고 싶을 때
- 프로젝트 용어를 놔두고 임의의 일반 용어로 설명할 때

## 무엇을 하는가

세 가지를 한꺼번에 강제한다.

1. **맥락을 조금 깔고 시작** — 어디까지 왔는지부터.
2. **ASD-STE100 Simplified Technical English** — 항공·방산 기술문서용 제한 영어 규격. 어휘와 문장 구조를 좁혀서 모호함을 없앤다.
3. **`CONTEXT.md`의 ubiquitous language(프로젝트 전체가 공유하는 용어)** 사용 — 임의 용어 금지.

## 함정

- **`disable-model-invocation: true`** — 모델이 알아서 부르지 않는다. `/wait-what`으로 직접 호출.
- **`CONTEXT.md`가 있어야 3번이 산다.** 없다면 `/domain-modeling`으로 먼저 만든다.
- 영어 규격을 지정하는 스킬이라, 한국어로 답을 받으려면 호출 뒤에 그 요청을 덧붙이는 편이 확실하다.

## 원문 SKILL.md (전문)

```markdown
---
name: wait-what
description: Stop. That last message did not land — re-pitch it.
disable-model-invocation: true
---

Wait — I don't understand where you've got to here. Re-pitch that: give me a little bit of context, talk in ASD-STE100 Simplified Technical English, and use the ubiquitous language from `CONTEXT.md`.
```
