---
title: ask-matt
summary: "스킬이 많아져 뭘 언제 쓸지 기억 안 날 때 물어보는 라우터. Matt Pocock 스킬 묶음 전체를 '아이디어 → 출시' 하나의 주 흐름으로 엮어, 지금 상황에 맞는 다음 스킬을 짚어준다."
summary_en: "A router over the Matt Pocock skill set. You do not remember every skill, so ask — it maps your situation onto one main idea-to-ship flow and names the next step."
tags: [skill, router, workflow, mattpocock, planning, meta]
source: https://github.com/mattpocock/skills
author: mattpocock
license: MIT
order: 12
trigger: "ask matt / 어떤 스킬 써야 해 / 이 상황에 맞는 흐름 / which skill should I use"
install: "npx skills add mattpocock/skills"
---

## 한 줄

"모든 스킬을 다 기억할 수는 없으니, 물어보라." 스킬 20여 개가 깔린 뒤 생기는 진짜 문제 — **뭘 언제 쓰는지 모른다** — 를 푸는 라우터 스킬.

*EN: You don't remember every skill, so ask. A router over the skills in the repo.*

## 언제 쓰는가

- 스킬을 잔뜩 깔았는데 정작 상황마다 뭘 불러야 할지 모를 때
- 버그·기능·리팩터링·막막한 대형 과제 중 어디에 해당하는지부터 정리하고 싶을 때
- 전역 규칙에 "설계·디버깅·테스트·트레이드오프 판단은 ask-matt으로"를 넣어 두고 습관화하고 싶을 때

## 무엇을 하는가

스킬들을 **하나의 주 흐름 + 두 개의 진입로**로 배치한다.

**주 흐름 (아이디어 → 출시)**

| 단계 | 스킬 | 하는 일 |
|---|---|---|
| 1 | `grill-with-docs` | 인터뷰로 아이디어를 벼린다. `CONTEXT.md`·ADR에 기록을 남긴다 |
| 2 | `prototype` + `handoff` | 대화로 못 정하는 질문은 버리는 코드로 답하고, 결과만 들고 돌아온다 |
| 3 | `to-spec` → `to-tickets` | 여러 세션짜리면 스펙으로, 다시 티켓으로 쪼갠다 |
| 4 | `implement` | 티켓 하나씩 구현. 내부에서 `tdd`를 돌리고 `code-review`로 닫는다 |

**진입로**

- 이슈가 쌓였다 → `triage` (내가 만들지 않은 이슈 전용. `to-tickets` 산출물은 넣지 않는다)
- 뭔가 고장났다 → `diagnosing-bugs` (재현되는 빨간 명령을 확보하기 전엔 가설을 세우지 않는다)
- 안개 낀 대형 과제 → `wayfinder` (결정 티켓을 만들어 하나씩 해소. 산출물이 아니라 **결정**을 만든다)

**밑에 깔리는 어휘 레이어** — `domain-modeling`(도메인 용어), `codebase-design`(깊은 모듈 어휘).

## 함정

- **컨텍스트 위생이 핵심**: 1~3단계는 **끊기지 않은 한 컨텍스트 창** 안에서 끝내야 한다. `to-tickets` 전에 compact·clear 하면 grilling·스펙·티켓이 서로 다른 사고 위에 쌓인다. 이후 `implement`는 티켓마다 새 컨텍스트로 시작한다.
- **smart zone(~120k 토큰)** 을 넘기면서 밀어붙이지 않는다. 한계에 닿으면 `handoff`로 넘기고 새 스레드에서 잇는다.
- `wayfinder`는 가장 비싼 흐름이다. 범위가 잡힌 기능에 쓰면 과잉이다 — 정말 길이 안 보일 때만.
- `disable-model-invocation: true`라 **모델이 알아서 부르지 않는다**. 사용자가 명시적으로 불러야 한다.
