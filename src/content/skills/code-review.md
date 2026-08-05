---
title: code-review
summary: "지정한 기준점 이후의 변경을 두 축으로 나눠 리뷰한다 — 이 저장소의 코딩 규칙을 지켰는가(Standards), 원래 요청한 대로 만들었는가(Spec). 두 축을 서로 다른 서브에이전트에 병렬로 맡겨 한쪽이 다른 쪽을 가리지 않게 한다."
summary_en: "Reviews changes since a fixed point along two independent axes — repo standards and the originating spec — in parallel sub-agents, so neither masks the other."
tags: [skill, code-review, standards, code-smell, mattpocock]
source: https://github.com/mattpocock/skills/tree/main/skills/engineering/code-review
author: mattpocock
license: mattpocock/skills 참조
order: 27
trigger: "review this branch / PR 리뷰 / review since main / 변경분 리뷰해 줘 / 코드 리뷰"
install: "npx skills add https://github.com/mattpocock/skills --skill code-review"
---

## 한 줄

**한 축을 통과해도 다른 축에서 떨어질 수 있다.** 규칙은 다 지켰는데 엉뚱한 걸 만들었을 수도, 요청대로 만들었는데 저장소 관례를 깼을 수도 있다. 그래서 축을 분리해 각각 보고한다.

*EN: A change can pass one axis and fail the other — reporting them separately stops one from masking the other.*

## 언제 쓰는가

- 브랜치·PR·작업 중인 변경을 병합 전에 점검할 때
- "main 이후로 리뷰해 줘"처럼 기준점을 정해 훑고 싶을 때

## 무엇을 하는가

1. **기준점 고정** — 커밋 SHA, 브랜치, 태그, `HEAD~5` 등. `git diff <기준점>...HEAD`(점 셋 — merge-base 기준 비교)를 한 번 잡아 둔다. 잘못된 ref나 빈 diff는 **서브에이전트를 띄우기 전에** 여기서 실패시킨다.
2. **스펙 출처 찾기** — 커밋 메시지의 이슈 참조 → 사용자가 넘긴 경로 → `docs/`·`specs/`·`.scratch/`의 스펙 파일 → 그래도 없으면 사용자에게 질문. 스펙이 없으면 Spec 축은 건너뛰고 그 사실을 보고한다.
3. **규칙 출처 찾기** — `CODING_STANDARDS.md`, `CONTRIBUTING.md` 등. 여기에 더해 **항상 smell baseline이 붙는다**(아래).
4. **서브에이전트 2개 병렬 실행** — 한 메시지에 `Agent` 호출 두 개. 서로의 맥락을 오염시키지 않게 한다.
5. **집계** — `## Standards` / `## Spec` 두 제목 아래 그대로 싣는다. **병합하거나 순위를 다시 매기지 않는다** — 그게 분리한 이유다.

## smell baseline — Fowler 코드 냄새 12종

저장소가 아무것도 문서화하지 않아도 항상 적용되는 고정 목록이다(『Refactoring』 3장). 두 규칙이 이걸 묶는다: **저장소 문서가 우선**(문서가 허용하는 걸 baseline이 지적하면 억제)이고, **모든 항목은 판단의 문제**("가능성 있는 Feature Envy")이지 확정 위반이 아니다.

Mysterious Name · Duplicated Code · Feature Envy · Data Clumps · Primitive Obsession · Repeated Switches · Shotgun Surgery · Divergent Change · Speculative Generality · Message Chains · Middle Man · Refused Bequest

## 함정

- **툴이 이미 잡는 건 건너뛴다** — 린터·포매터가 강제하는 항목을 리뷰가 반복하면 노이즈다.
- **서브에이전트에 baseline 전문을 붙여 넣어야 한다.** 서브에이전트는 다른 경로로 그 목록에 접근할 수 없다.
- **축을 가로질러 "제일 심한 것"을 하나 뽑지 않는다.** 축마다 최악 하나씩만 뽑는다.
- 각 보고는 400단어 이내로 제한된다 — 길게 쓰라고 시키면 축 분리의 이점이 흐려진다.

## 원문 SKILL.md (전문)

```markdown
---
name: code-review
description: Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes — Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/spec asked for?). Runs both reviews in parallel sub-agents and reports them side by side. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to "review since X".
---

Two-axis review of the diff between `HEAD` and a fixed point the user supplies:

- **Standards** — does the code conform to this repo's documented coding standards?
- **Spec** — does the code faithfully implement the originating issue / spec?

Both axes run as **parallel sub-agents** so they don't pollute each other's context, then this skill aggregates their findings.

The issue tracker should have been provided to you — run `/setup-matt-pocock-skills` if `docs/agents/issue-tracker.md` is missing.

## Process

### 1. Pin the fixed point

Whatever the user said is the fixed point — a commit SHA, branch name, tag, `main`, `HEAD~5`, etc. If they didn't specify one, ask for it.

Capture the diff command once: `git diff <fixed-point>...HEAD` (three-dot, so the comparison is against the merge-base). Also note the list of commits via `git log <fixed-point>..HEAD --oneline`.

Before going further, confirm the fixed point resolves (`git rev-parse <fixed-point>`) and the diff is non-empty. A bad ref or empty diff should fail here — not inside two parallel sub-agents.

### 2. Identify the spec source

Look for the originating spec, in this order:

1. Issue references in the commit messages (`#123`, `Closes #45`, GitLab `!67`, etc.) — fetch via the workflow in `docs/agents/issue-tracker.md`.
2. A path the user passed as an argument.
3. A spec file under `docs/`, `specs/`, or `.scratch/` matching the branch name or feature.
4. If nothing is found, ask the user where the spec is. If they say there isn't one, the **Spec** sub-agent will skip and report "no spec available".

### 3. Identify the standards sources

Anything in the repo that documents how code should be written, such as `CODING_STANDARDS.md` or `CONTRIBUTING.md`.

On top of whatever the repo documents, the Standards axis always carries the **smell baseline** below — a fixed set of Fowler code smells (_Refactoring_, ch.3) that applies even when a repo documents nothing. Two rules bind it:

- **The repo overrides.** A documented repo standard always wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation — and, like any standard here, skip anything tooling already enforces.

Each smell reads *what it is* → *how to fix*; match it against the diff:

- **Mysterious Name** — a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code** — the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- **Feature Envy** — a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps** — the same few fields or params keep travelling together (a type wanting to be born). → bundle them into one type, pass that.
- **Primitive Obsession** — a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches** — the same `switch`/`if`-cascade on the same type recurs across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery** — one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- **Divergent Change** — one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality** — abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains** — long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man** — a class or function that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest** — a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.

### 4. Spawn both sub-agents in parallel

Send a single message with two `Agent` tool calls. Use the `general-purpose` subagent for both.

**Standards sub-agent prompt** — include:

- The full diff command and commit list.
- The list of standards-source files you found in step 3, **plus the smell baseline from step 3** pasted in full — the sub-agent has no other access to it.
- The brief: "Report — per file/hunk where relevant — (a) every place the diff violates a documented standard: cite the standard (file + the rule); and (b) any baseline smell you spot: name it and quote the hunk. Distinguish hard violations from judgement calls — documented-standard breaches can be hard, but baseline smells are always judgement calls, and a documented repo standard overrides the baseline. Skip anything tooling enforces. Under 400 words."

**Spec sub-agent prompt** — include:

- The diff command and commit list.
- The path or fetched contents of the spec.
- The brief: "Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote the spec line for each finding. Under 400 words."

If the spec is missing, skip the Spec sub-agent and note this in the final report.

### 5. Aggregate

Present the two reports under `## Standards` and `## Spec` headings, verbatim or lightly cleaned. Do **not** merge or rerank findings — the two axes are deliberately separate (see _Why two axes_).

End with a one-line summary: total findings per axis, and the worst issue _within each axis_ (if any). Don't pick a single winner across axes — that's the reranking the separation exists to prevent.

## Why two axes

A change can pass one axis and fail the other:

- Code that follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Code that does exactly what the issue asked but breaks the project's conventions → **Spec pass, Standards fail.**

Reporting them separately stops one axis from masking the other.
```
