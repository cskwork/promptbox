---
title: prototype
summary: 디자인을 commit 전에 살펴보기 위한 throwaway prototype. 질문이 가지를 결정 — "state/business-logic이 맞나" 면 terminal app, "어떤 모습이어야 하나" 면 한 라우트에서 토글되는 radically different UI variation들.
tags: [skill, prototype, ui, state-machine, throwaway, mattpocock]
source: https://github.com/mattpocock/skills/tree/main/skills/engineering/prototype
author: mattpocock
license: mattpocock/skills 참조
order: 29
trigger: "prototype this / let me play with it / try a few designs / mock up a UI / 데이터 모델 점검 / 디자인 옵션 탐색"
install: "npx skills add https://github.com/mattpocock/skills --skill prototype"
---

## 한 줄

**Prototype = 질문에 답하는 throwaway code.** 질문이 모양을 결정한다.

## 두 가지 갈래

| 질문 | 산출물 |
|---|---|
| "이 logic / state model이 맞나?" | tiny interactive terminal app — paper로 추론 어려운 case를 state machine에 밀어넣음 |
| "이건 어떻게 생겨야 하나?" | 한 라우트 + URL search param + floating bottom bar로 토글되는 radically different UI variation들 |

질문이 모호하고 사용자가 reachable 안 하면 surrounding code로 결정 (backend module → logic, page/component → UI). 가정은 prototype 상단에 명시.

## 두 갈래 공통 규칙

1. **Day 1부터 throwaway, 그렇게 표시** — 사용될 곳 옆에 두되 이름으로 prototype임이 보이게.
2. **명령 하나로 실행** — 프로젝트의 기존 task runner 사용.
3. **기본 persistence 없음** — 메모리에만. DB가 질문의 일부면 "PROTOTYPE — wipe me" scratch DB.
4. **Polish skip** — 테스트도, error handling도, 추상화도 없음. 빨리 배우고 삭제.
5. **State surface** — 매 action 후(logic) 또는 매 variant switch 후(UI) 관련 state를 print/render.
6. **끝나면 삭제 or 흡수** — 답을 얻었으면 commit message / ADR / issue / NOTES.md에 *질문과 답*을 기록 후 prototype은 제거.

## 원문 SKILL.md (전문)

````markdown
---
name: prototype
description: Build a throwaway prototype to flesh out a design before committing to it. Routes between two branches — a runnable terminal app for state/business-logic questions, or several radically different UI variations toggleable from one route. Use when the user wants to prototype, sanity-check a data model or state machine, mock up a UI, explore design options, or says "prototype this", "let me play with it", "try a few designs".
---

# Prototype

A prototype is **throwaway code that answers a question**. The question decides the shape.

## Pick a branch

Identify which question is being answered — from the user's prompt, the surrounding code, or by asking if the user is around:

- **"Does this logic / state model feel right?"** → [LOGIC.md](LOGIC.md). Build a tiny interactive terminal app that pushes the state machine through cases that are hard to reason about on paper.
- **"What should this look like?"** → [UI.md](UI.md). Generate several radically different UI variations on a single route, switchable via a URL search param and a floating bottom bar.

The two branches produce very different artifacts — getting this wrong wastes the whole prototype. If the question is genuinely ambiguous and the user isn't reachable, default to whichever branch better matches the surrounding code (a backend module → logic; a page or component → UI) and state the assumption at the top of the prototype.

## Rules that apply to both

1. **Throwaway from day one, and clearly marked as such.** Locate the prototype code close to where it will actually be used (next to the module or page it's prototyping for) so context is obvious — but name it so a casual reader can see it's a prototype, not production. For throwaway UI routes, obey whatever routing convention the project already uses; don't invent a new top-level structure.
2. **One command to run.** Whatever the project's existing task runner supports — `pnpm <name>`, `python <path>`, `bun <path>`, etc. The user must be able to start it without thinking.
3. **No persistence by default.** State lives in memory. Persistence is the thing the prototype is _checking_, not something it should depend on. If the question explicitly involves a database, hit a scratch DB or a local file with a clear "PROTOTYPE — wipe me" name.
4. **Skip the polish.** No tests, no error handling beyond what makes the prototype _runnable_, no abstractions. The point is to learn something fast and then delete it.
5. **Surface the state.** After every action (logic) or on every variant switch (UI), print or render the full relevant state so the user can see what changed.
6. **Delete or absorb when done.** When the prototype has answered its question, either delete it or fold the validated decision into the real code — don't leave it rotting in the repo.

## When done

The _answer_ is the only thing worth keeping from a prototype. Capture it somewhere durable (commit message, ADR, issue, or a `NOTES.md` next to the prototype) along with the question it was answering. If the user is around, that capture is a quick conversation; if not, leave the placeholder so they (or you, on the next pass) can fill in the verdict before deleting the prototype.
````
