---
title: grilling
summary: "계획·결정·아이디어를 끝까지 캐물어 흐릿한 부분을 없애는 인터뷰 도구. 지금 답할 수 있는 질문을 한 번에 번호 매겨 묶어 던지고, 답을 받으면 다음 묶음을 다시 계산한다. 사실은 에이전트가 직접 찾아보고, 결정만 사람에게 묻는다."
summary_en: "Interviews you relentlessly about a plan until nothing is silently assumed — asking every answerable question in one numbered round, then recomputing the next round from your answers."
tags: [skill, interview, planning, decision, mattpocock]
source: https://github.com/mattpocock/skills/tree/main/skills/productivity/grilling
author: mattpocock
license: mattpocock/skills 참조
order: 28
trigger: "grill me / 이 계획 캐물어 줘 / stress-test my thinking / 계획 검증 인터뷰"
install: "npx skills add https://github.com/mattpocock/skills --skill grilling"
---

## 한 줄

**shared understanding(같은 그림을 보고 있는 상태)에 도달할 때까지 캐묻는 인터뷰 primitive(다른 스킬들이 갖다 쓰는 기본 부품).** 결정들을 **design tree**(결정 나무 — 한 결정에서 갈라져 나오는 다음 결정들)로 그려 두고, 그 나무를 **round(묶음)** 단위로 훑는다.

*EN: Interview until shared understanding — mapped as a design tree, worked round by round.*

## 언제 쓰는가

- 계획을 실행에 옮기기 전에 숨은 가정을 털어내고 싶을 때
- `grill-me`(작업 디렉터리 밖) / `grill-with-docs`(작업 디렉터리 안)가 내부적으로 부르는 부품이 필요할 때
- 소프트웨어에 국한되지 않는다 — 어떤 계획·결정·아이디어든 스트레스 테스트 대상

## 무엇을 하는가 — frontier와 round

**frontier(최전선)** 는 "선행 조건이 이미 정해져서 **지금** 물을 수 있는" 결정 전부다. 아직 못 들은 답을 넘겨짚지 않아도 되는 질문들.

1. frontier 전체를 **한 라운드에 몰아서** 묻는다. 질문마다 번호를 붙이고 **권장 답**을 같이 준다.
2. 사용자 답을 기다린다.
3. 답이 나무를 재구성 → frontier가 바깥으로 밀리며 새 질문이 열린다 → 다음 라운드.
4. frontier가 비면 세션 종료.

이 라운드 방식 덕에 13개짜리 질문이 13턴이 아니라 약 3라운드에 끝난다. 이번 라운드의 다른 질문에 답이 달린 질문은 **다음** 라운드 소속이다.

질문 형식은 고정이다:

```
❓ **Q1** - **<질문 제목>**: <질문 본문, 선택지 포함 가능>

➡️ <권장 답>
```

## 함정

- **사실(fact)과 결정(decision)을 가른다.** 환경에서 찾을 수 있는 사실은 **에이전트 몫** — 서브에이전트를 띄워 알아본다. 사용자에게 물어보면 안 된다. 결정은 **사용자 몫** — 반드시 물어보고 기다린다. (다른 스킬이 이걸 감싸 쓸 때 이 구분이 없으면 에이전트가 제 결정을 제가 답해 버린다.)
- **서브에이전트를 기다리며 라운드를 멈추지 않는다.** 그 조사에 달린 질문만 기다리고 나머지 frontier는 지금 묻는다.
- **확인 게이트.** 사용자가 "같은 그림을 봤다"고 확인하기 전까지 실행에 옮기지 않는다.
- 한 번에 한 질문씩 받고 싶다면, 글로벌 `CLAUDE.md`에 그 취지의 한 줄을 넣으면 된다.

## 원문 SKILL.md (전문)

````markdown
---
name: grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
---

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled — the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask the whole frontier in one round: number each question and give your recommended answer. Then wait for the user's answers before the next round.

Each question should be formatted like so:

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

Each round the user answers reshapes the tree — settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it — don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to report — ask the rest of the frontier now. The _decisions_ are the user's — put each to them and wait.

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Do not act on it until the user confirms you have reached a shared understanding.
````
