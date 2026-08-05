---
title: writing-for-agents
summary: "에이전트가 읽는 문서(SKILL.md, AGENTS.md, CLAUDE.md)를 '예측 가능하게' 쓰는 법을 담은 레퍼런스 — 포인터 문구를 날카롭게 다듬고, no-op 문장은 지우고, 되풀이 표현은 leading word로 압축하고, 잘 안 쓰는 reference는 포인터 뒤로 내려 본문을 가볍게 유지한다."
summary_en: "The vocabulary and principles that make any agent-facing document predictable — sharpen the pointer wording, cut no-op lines, compress repeated phrasing into leading words, and disclose reference behind pointers. Read it before you write or edit a SKILL.md, AGENTS.md, or CLAUDE.md."
tags: [skill, meta, authoring, mattpocock, reference, prompt-engineering]
source: https://github.com/mattpocock/skills/tree/main/skills/productivity/writing-for-agents
author: mattpocock
license: mattpocock/skills 참조
order: 29
trigger: "스킬 작성/개선 기준 / writing for agents / how to write a SKILL.md / AGENTS.md·CLAUDE.md 수정 / no-op 제거 / progressive disclosure"
install: "npx skills add https://github.com/mattpocock/skills --skill writing-for-agents"
---

## 한 줄

에이전트가 소비하는 **모든** 문서를 위한 어휘집 겸 원칙집. 포장(스킬이냐 `AGENTS.md`냐 포인터로 도달하는 문서냐)은 달라도 글쓰기는 같다 — 같은 지렛대가 셋 모두를 predictable(예측 가능)하게 만든다. 여기서 예측 가능이란 **출력이 같은 것이 아니라 매번 같은 *과정*을 밟는 것**이다.

*EN: One reference for every agent-facing document. The packaging differs; the writing does not.*

> **이름·범위가 바뀌었습니다.** 원래 `writing-great-skills`였고, 업스트림에서 `writing-for-agents`로 개명되며 대상이 스킬에서 "에이전트가 읽는 모든 문서"로 넓어졌습니다. frontmatter·호출 방식·라우터 스킬 같은 **스킬 고유 사항은 같은 폴더의 `SKILL-MECHANICS.md`로 분리**됐습니다. 예전 이름으로 설치돼 있다면 다시 설치해야 합니다.

## 언제 쓰는가

- 새 SKILL.md를 처음 잡을 때 — 구조와 description(포인터)을 어떻게 짤지 기준이 필요할 때
- `AGENTS.md` / `CLAUDE.md`를 손볼 때 — 매 턴 context load(맥락 부담)를 내는 줄이라 더 혹독한 가지치기가 필요
- 기존 문서가 안 불려 나오거나(triggering 문제) 너무 길어졌을 때(sprawl, 군더더기 비대) 진단·정리

## 핵심 개념 다섯

| 개념 | 뜻 |
|---|---|
| **context pointer** | 맥락 밖 자료를 가리키며 "언제 꺼낼지"를 담은 참조. 스킬의 description도, `AGENTS.md`의 한 줄도 같은 물건. **대상이 아니라 문구가** 도달 시점과 신뢰도를 정한다 |
| **두 가지 load** | **context load**(맥락 부담, 에이전트 창에 매 턴 얹히는 비용) vs **cognitive load**(인지 부담, "어떤 문서가 있고 언제 꺼내는가"를 사람이 기억하는 비용). 후자는 사람의 판단이 필요한 곳에만 쓰고 아닌 곳에선 없앤다 |
| **information hierarchy** | 자료를 급한 순으로 세 칸에 배치: ① 본문 step(순서대로 하는 일) ② 본문 reference(필요할 때 참조) ③ **disclosed reference**(포인터 뒤로 밀어낸 별도 파일). 내리는 행위가 **progressive disclosure**(점진적 공개) |
| **completion criterion** | 각 step이 "끝났다"고 판정하는 조건. **clarity**(끝/안 끝을 구분할 수 있나)와 **demand**(얼마나 요구하나) 둘 다가 지렛대 |
| **leading word** | 모델의 사전학습에 이미 사는 압축 개념(_lesson_, _fog of war_, _tracer bullets_). 문장이 아니라 **토큰으로 반복**하면 최소 토큰으로 행동 영역 전체를 고정한다 |

## 함정

- **포인터 문구를 먼저 고친다.** 꼭 필요한 자료가 약한 문구 뒤에 있으면 그건 variance bug(매번 결과가 달라지는 버그)다. 문구를 날카롭게 하는 게 먼저고, 그래도 안 되면 그때 본문에 인라인한다.
- **negation(금지문)은 역효과.** 하지 말라고 이름을 부르는 순간 그 행동이 맥락에 끌려 들어와 **더** 가용해진다(_코끼리를 생각하지 마세요_). 목표 행동을 **긍정문**으로 쓴다.
- **premature completion(조급한 종료).** 완료 조건이 흐리면("이해에 도달") 뒤에 남은 step이 보여서 앞 step을 서둘러 끝낸다. 먼저 **조건을 날카롭게** 하고, 정말 흐릴 수밖에 없고 실제로 서두르는 게 관찰될 때만 시퀀스를 쪼갠다 — 단, 쪼개기는 진짜 맥락 경계(핸드오프·서브에이전트)를 건널 때만 효과가 있다.
- **no-op 사냥은 문장 단위로.** 모델이 기본으로 이미 지키는 문장은 토큰만 먹는다. 단어를 다듬지 말고 문장째 지운다. 판정은 독자 기준이 아니라 **모델 기준**이라, 의견이 갈리면 토론이 아니라 실행으로 결판낸다.
- **environment도 source of truth다.** `package.json` 스크립트, 설정 파일, `--help` 출력을 문서가 되뇌면 그건 **cache**(조회 결과 사본)이고, 조회가 비쌀 때만 값을 한다. 문서에는 조회로 못 찾는 것 — 안 적힌 관행, 선택의 이유, 어떤 설정도 고백 안 하는 함정 — 만 캐싱한다.
- **sediment(퇴적).** 추가는 안전해 보이고 삭제는 위험해 보여서 낡은 층이 쌓인다. 가지치기 규율이 없으면 이게 기본 운명이다.

## 원문 SKILL.md (전문)

```markdown
---
name: writing-for-agents
description: Writing documents for agents. Use when creating or editing skills, or modifying AGENTS.md or CLAUDE.md.
---

Reference for writing any document an agent consumes — a skill, an `AGENTS.md` / `CLAUDE.md`, a doc reached by a pointer. The packaging differs; the writing does not: the same levers make each one predictable — the agent taking the same _process_ every run, not producing the same output.

When the document you're writing is a skill, read [`SKILL-MECHANICS.md`](SKILL-MECHANICS.md) for frontmatter, invocation choice, and router skills.

## Context pointers

A **context pointer** is a reference held in the agent's context that names some out-of-context material and encodes the condition for reaching it. A skill's description is one; a line in `AGENTS.md` naming a doc is the same object. The pointer's _wording_, not its target, decides when the agent reaches the material — and how reliably. A must-have target behind a weakly worded pointer is a variance bug: sharpen the wording first, and inline the material only if sharpening fails.

A pointer does two jobs — state what the material is, and list the **branches** that should trigger reaching it (a branch is a distinct case the document handles, so different runs take different paths through it). Every word of an always-loaded pointer costs on every turn, so it earns even harder pruning than the body:

- **Front-load the leading word** — the pointer is where it does its triggering work.
- **One trigger per branch.** Synonyms that rename a single branch are one branch written twice; collapse them and keep only genuinely distinct branches.
- **Cut identity the body already carries.**

## The two loads

Every document and pointer you add spends one of two budgets:

- **Context load** — the cost of always-loaded material on the agent's window: an `AGENTS.md` line, a skill description, anything sitting in context every turn, spending tokens and attention whether or not it fires.
- **Cognitive load** — the cost on the human: which documents exist and when to reach for each. The human is the index. Not a cost to minimise — it is the price of human agency; spend it where human judgement matters, remove it where it does not.

Material reached only through a pointer escapes context load at the price of the pointer's own line; material with no pointer at all rides entirely on cognitive load.

## Information hierarchy

A document is built from two content types — **steps** (the ordered actions the agent performs) and **reference** (definitions, rules, facts consulted on demand) — that mix freely: all steps (a recipe), all reference (a review's rules, this skill), or both. The core decision is where each piece sits on the **information hierarchy**, a ladder ranked by how immediately the agent needs the material:

1. **In-file step** — the primary tier: what the agent does, in order.
2. **In-file reference** — consulted on demand. Often a legitimately flat peer-set (every rule of a review on one rung) — a fine arrangement, not a smell.
3. **Disclosed reference** — pushed out into a separate file, reached by a context pointer, loaded only when the pointer fires. Spans a sibling file in the same folder through fully external reference that lives anywhere and any document can point at.

Push too little down and the top bloats; push too much and you hide material the agent actually needs. That tension is the whole decision.

**Progressive disclosure** is the move down the ladder — out of the main file and behind a pointer — so the top stays legible. Not primarily a token optimisation: it is how the hierarchy is protected. Branching is the cleanest disclosure test: inline what every branch needs, and push behind a pointer what only some branches reach. When a document has steps, in-file reference that should be disclosed buries them and turns attending to them into a coin-flip — a variance lever, not just a legibility one.

**Co-location** is the within-file companion: where the ladder decides _how far down_ a piece sits, co-location decides _what sits beside it_ once there. Keep a concept's definition, rules, and caveats under one heading rather than scattered, so reading one part brings its neighbours with it. The test: the document should read like documentation written for the agent — grouped material reads that way; scattered material does not. (Distinct from duplication: that repeats one meaning in two places; scattering fragments one meaning across many.)

**Sprawl** is the failure mode here: a document simply too long, even when every line is live and unique. Attention thins across the excess, and every extra line is one more to keep relevant. The cure is the ladder: disclose reference behind pointers, and split by branch or sequence so each path carries only what it needs.

## Steps and completion criteria

Every step ends on a **completion criterion** — the condition that tells the agent the work is done. Two properties make it a lever:

- **Clarity** — can the agent tell done from not-done? A vague bound ("understanding reached") invites **premature completion**: ending the step before it is genuinely done, attention slipping to _being done_. The visible steps still ahead — the **post-completion steps** — supply the pull; the criterion's clarity is the resistance. Defend in order: **sharpen the bound first** (local and cheap); only if it is irreducibly fuzzy _and_ you observe the rush, hide the later steps by splitting the sequence — and hiding only works across a real context boundary (a hand-off or a subagent dispatch; an inline call leaves the later steps in context and clears nothing).
- **Demand** — how much it requires. "Every modified model accounted for" forces thorough work where "produce a change list" does not. Demand drives **legwork** — the digging the agent does within the work, latent in the wording rather than written as its own step — and it is not step-bound: "every rule applied" binds a body of flat reference just as "every step done" binds a sequence, which is how an all-reference document still carries an exhaustiveness bar.

The strongest criteria are both checkable and exhaustive.

## When to split

Splitting one document into two spends one of the two loads, so split only when the cut earns it:

- **By sequence** — split a run of steps where the post-completion steps tempt the agent to rush the one in front of it. Keeping them out of view drives more legwork on the current task. Beware the reverse: merging sequences exposes each step's later steps to what follows, inviting premature completion.
- **By invocation** — skill-specific: see [`SKILL-MECHANICS.md`](SKILL-MECHANICS.md).

## Leading words

A **leading word** is a compact concept already living in the model's pretraining that the agent thinks with while running the document (_lesson_, _fog of war_, _tracer bullets_). Repeated as a token, never as a sentence, it accumulates a distributed definition and anchors a whole region of behaviour in the fewest tokens, by recruiting priors the model already holds. Coining your own works if you define it clearly, but a made-up word recruits no priors — you pay in definition tokens what a pretrained word gives free; reach for an existing word first.

It anchors twice. In the body, _execution_: the agent reaches for the same behaviour every time the word appears, and inside flat reference it focuses attention on a class of thing to look for. In a pointer, _invocation_: when the same word lives in your prompts, your docs, and your codebase, the agent links that shared language to the material and reaches it more reliably.

Hunt for opportunities to refactor with leading words. A triad spelled out at three sites, a pointer spending a sentence to gesture at one idea — each is a passage begging to collapse into a single token:

- "fast, deterministic, low-overhead" → _tight_ (a _tight_ loop).
- "a loop you believe in" → _red_ — a fuzzy gate becomes a binary observable state (the loop goes _red_ on the bug, or it doesn't).

You win twice: fewer tokens, and a sharper hook for the agent to hang its thinking on. Assume every document is carrying restatements that leading words retire — go find them.

**Negation** is the failure mode beside this lever: steering by prohibition drags the forbidden behaviour into context and makes it _more_ available, not less. _Don't think of an elephant_, and the elephant is all there is; the negation is a weak modifier the strongly-activated concept overruns, so the ban half-reads as an instruction to do the thing. Prompt the **positive** — state the target behaviour ("write one-line comments") so the banned one is never spoken. A prohibition earns its place only as a hard guardrail you cannot phrase positively; even then, pair it with the positive target so attention lands on what to do.

## Pruning

- Keep each meaning in a **single source of truth**: one authoritative place, so changing the behaviour is a one-place edit. **Duplication** — the same meaning in more than one place — costs maintenance and tokens, and inflates a meaning's prominence on the ladder past its real rank. (The accidental inverse of a leading word, which repeats a token on purpose, never the meaning.)
- The **environment** is a source of truth too — `package.json` scripts, config files, the directory layout, `--help` output — and a document that restates it is a **cache**: a copy of a lookup, earning its load only when the lookup is expensive. Cache what the agent cannot find by looking: the unwritten convention, the reason behind a choice, the gotcha no config confesses. Leave the one-file, one-command lookups to the environment, where they cannot go stale.
- Check every line for **relevance**: does it still bear on what the document does? A line loses relevance by never bearing on the task (mere exposition, or a branch that should be disclosed) or by going stale as the behaviour or world it describes changes. Shorter documents are easier to keep relevant. Without a pruning discipline the default fate is **sediment**: stale layers that settle because adding feels safe and removing feels risky, until you must core down through them to find what is still live.
- Hunt **no-ops** sentence by sentence: an instruction the model already obeys by default pays load to say nothing. The test — does it change behaviour versus the default? — is model-relative, not reader-relative: two people disagreeing about a no-op disagree about the default, and settle it by running the document, not by debate. When a sentence fails, delete the whole sentence rather than trim words from it. The test also grades leading words: a word too weak to beat the default (_be thorough_ when the agent is already thorough-ish) is a no-op, and the fix is a stronger word (_relentless_), not a different technique.
```
