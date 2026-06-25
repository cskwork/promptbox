---
title: writing-great-skills
summary: "스킬을 '예측 가능하게' 쓰고 다듬는 법을 담은 레퍼런스 — description은 트리거만 남기고, no-op 문장은 지우고, 되풀이 표현은 leading word로 압축하고, 잘 안 쓰는 reference는 포인터 뒤로 내려 본문을 가볍게 유지한다. 스킬을 만들거나 고칠 때 먼저 펴 보는 기준."
summary_en: "The vocabulary and principles that make a skill predictable — keep descriptions to triggers, cut no-op lines, compress repeated phrasing into leading words, and disclose reference behind pointers. Read it before you write or edit a SKILL.md."
tags: [skill, meta, authoring, mattpocock, reference, prompt-engineering]
source: https://github.com/mattpocock/skills/tree/main/skills/productivity/writing-great-skills
author: mattpocock
license: mattpocock/skills 참조
order: 29
trigger: "스킬 작성/개선 기준 / writing great skills / how to write a SKILL.md / description 다듬기 / no-op 제거 / progressive disclosure"
install: "npx skills add https://github.com/mattpocock/skills --skill writing-great-skills"
---

## 한 줄

스킬을 잘 쓰고 고치기 위한 **어휘집 겸 원칙집**. 뿌리 가치는 predictability(예측 가능성 — 매번 같은 *과정*을
밟게 하는 것)이고, 아래 모든 지렛대는 이걸 위해 존재한다. description은 트리거만 남기고, 본문은 no-op(기본값으로
이미 지키는 문장)을 문장째 지우고, 되풀이되는 표현은 leading word(모델이 이미 아는 한 단어)로 압축하고, 자주
안 쓰는 reference(참고 자료)는 포인터 뒤로 내려(progressive disclosure, 점진적 공개) 윗단을 가볍게 유지한다.

*EN: a glossary + principles for predictable skills. Choose model- vs user-invocation deliberately, keep descriptions to triggers, delete no-op lines, compress repeated phrasing into leading words, and push reference behind pointers.*

## 언제 쓰는가

- 새 스킬의 SKILL.md를 처음 잡을 때 — 구조와 description을 어떻게 짤지 기준이 필요할 때
- 기존 스킬이 안 불려 나오거나(triggering 문제) 너무 길어졌을 때(sprawl, 군더더기 비대) 진단·정리
- skill-creator로 뽑은 초안을 다듬어 토큰을 줄이고 트리거 정확도를 올릴 때

## 함정

- **description은 정체성이 아니라 트리거**: 한 branch(쓰임새 갈래)당 트리거 하나. 같은 갈래를 동의어로 다시
  쓰면 duplication(중복)이다 — 합친다. 본문에 이미 있는 정체성 설명은 description에서 뺀다.
- **no-op 사냥은 문장 단위로**: '꼼꼼히 하라'처럼 모델이 기본으로 따르는 문장은 토큰만 먹는다. 단어를 다듬지
  말고 문장째 지운다. 약한 leading word(_be thorough_)는 더 센 단어(_relentless_)로 교체.
- **model-invoked는 공짜가 아니다**: description이 매 턴 context(맥락 창)에 올라가 context load(맥락 부담)를
  낸다. 손으로만 부를 거면 user-invoked(`disable-model-invocation: true`)로 두고 그 부담을 0으로.
- 이 스킬 자체가 user-invoked 레퍼런스다 — 모델이 자동으로 부르지 않으니 스킬을 손볼 때 **사람이 직접 펴 본다**.
  굵게 표시된 용어의 정의는 같은 폴더의 `GLOSSARY.md` 참조.

## 원문 SKILL.md (전문)

```markdown
---
name: writing-great-skills
description: Reference for writing and editing skills well — the vocabulary and principles that make a skill predictable.
disable-model-invocation: true
---

A skill exists to wrangle determinism out of a stochastic system. **Predictability** — the agent taking the same _process_ every run, not producing the same output — is the root virtue; every lever below serves it.

**Bold terms** are defined in [`GLOSSARY.md`](GLOSSARY.md); look them up there for the full meaning.

## Invocation

Two choices, trading different costs:

- A **model-invoked** skill keeps a **description**, so the agent can fire it autonomously _and_ other skills can reach it (you can still type its name too). It contributes to **context load** — the description sits in the window every turn. Mechanics: omit `disable-model-invocation`, and write a model-facing description with rich trigger phrasing ("Use when the user wants…, mentions…").
- A **user-invoked** skill strips the description from the agent's reach: only you, typing its name, can invoke it — and no other skill can. Zero context load, but it spends **cognitive load**: _you_ are the index that must remember it exists. Mechanics: set `disable-model-invocation: true`; the `description` becomes human-facing — a one-line summary, trigger lists stripped.

Pick model-invocation only when the agent must reach the skill on its own, or another skill must. If it only ever fires by hand, make it user-invoked and pay no context load.

When user-invoked skills multiply past what you can remember, that piled-up cognitive load is cured by a **router skill**: one user-invoked skill that names the others and when to reach for each.

## Writing the description

A model-invoked **description** does two jobs — state what the skill is, and list the **branches** that should trigger it. Every word increases **context load**, so a description earns even harder pruning than the body:

- **Front-load the skill's leading word** — the description is where it does its invocation work.
- **One trigger per branch.** Synonyms that rename a single branch are **duplication** — "build features using TDD … asks for test-first development" is one branch written twice. Collapse them; keep only genuinely distinct branches.
- **Cut identity that's already in the body.** Keep the description to triggers, plus any "when another skill needs…" reach clause.

## Information hierarchy

A skill is built from two content types — **steps** and **reference** — that mix freely: a skill can be all steps, all reference, or both. The core decision is which to use and where each sits on the **information hierarchy**, a ladder ranked by how immediately the agent needs the material:

1. **In-skill step** — an ordered action in `SKILL.md`, the primary tier: what the agent does, in order. Each step ends on a **completion criterion**, the condition that tells the agent the work is done. Make it _checkable_ (can the agent tell done from not-done?) and, where it matters, _exhaustive_ ("every modified model accounted for", not "produce a change list") — a vague criterion invites **premature completion**.
2. **In-skill reference** — a definition, rule, or fact in `SKILL.md`, consulted on demand. Often a legitimately flat peer-set (every rule of a review on one rung) — a fine arrangement, not a smell. _This skill is all reference._
3. **External reference** — reference pushed out of `SKILL.md` into a separate file, reached by a **context pointer**, loaded only when the pointer fires. (Spans _disclosed_ reference — a sibling file like `GLOSSARY.md`, still part of the skill — through fully **external reference** that lives outside the skill system and any skill can point at.)

A demanding completion criterion drives thorough **legwork** — the digging the agent does within the work — whether the skill has steps or not, since "every rule applied" binds flat reference just as "every step done" binds a sequence.

Push too little down and the top bloats; push too much and you hide material the agent actually needs. That tension is the whole decision.

**Progressive disclosure** is the move down the ladder — out of `SKILL.md` into a linked file — so the top stays legible. Mechanics: a linked `.md` file in the skill folder, named for what it holds (this skill discloses its full definitions to `GLOSSARY.md`). Some skills are used in more than one way, and each distinct way is a **branch** — different runs taking different paths through the skill. Branching is the cleanest disclosure test: inline what every branch needs, and push behind a pointer what only some branches reach. A **context pointer**'s _wording_, not its target, decides when and how reliably the agent reaches the material.

Where the ladder decides _how far down_ a piece sits, **co-location** decides _what sits beside it_ once there: keep a concept's definition, rules, and caveats under one heading rather than scattered, so reading one part brings its neighbours with it.

## When to split

**Granularity** is how finely you divide skills, and each cut spends one of the two loads, so split only when the cut earns it. Two cuts:

- **By invocation** — split off a **model-invoked** skill when you have a distinct **leading word** that should trigger it on its own, or another skill must reach it. You pay **context load** for the new always-loaded **description**, so that independent reach has to be worth it.
- **By sequence** — split a run of **steps** when the steps still ahead (a step's **post-completion steps**) tempt the agent to rush the one in front of it (**premature completion**). Keeping them out of view encourages the agent to do more **legwork** on the current task.

## Pruning

Keep each meaning in a **single source of truth**: one authoritative place, so changing the behaviour is a one-place edit.

Check every line for **relevance**: does it still bear on what the skill does?

Then hunt **no-ops** sentence by sentence, not just line by line: run the no-op test on each sentence in isolation, and when one fails, delete the whole sentence rather than trim words from it. Be aggressive — most prose that fails should go, not be rewritten.

## Leading words

A **leading word** is a compact concept already living in the model's pretraining that the agent thinks with while running the skill (e.g. _lesson_, _fog of war_, _tracer bullets_). Repeated throughout the text (though not necessarily - a strong leading word might only be needed once), it accumulates a distributed definition and anchors a whole region of behaviour in the fewest tokens, by recruiting priors the model already holds.

It serves predictability twice. In the body it anchors _execution_: the agent reaches for the same behaviour every time the word appears. In the description it anchors _invocation_: when the same word lives in your prompts, docs, and code, the agent links that shared language to the skill and fires it more reliably.

Hunt for opportunities to refactor skills to use leading words. A triad spelled out at three sites (**duplication**), a description spending a sentence to gesture at one idea — each is a passage begging to **collapse** into a single token. Examples include:

- "fast, deterministic, low-overhead" -> _tight_ — one quality restated across a phase — into a single pretrained word (a _tight_ loop).
- "a loop you believe in" -> _red_ — converts a fuzzy gate into a binary observable state (the loop goes _red_ on the bug, or it doesn't).

You win twice over: fewer tokens, _and_ a sharper hook for the agent to hang its thinking on. Assume every skill is carrying restatements that leading words retire — go find them.

## Failure modes

Use these to diagnose issues the user may be having with the skill.

- **Premature completion** — ending a step before it's genuinely done, attention slipping to _being done_. Defence, in order: sharpen the completion criterion first (cheap, local); only if it is irreducibly fuzzy _and_ you observe the rush, hide the post-completion steps by splitting (the sequence cut).
- **Duplication** — the same meaning in more than one place. Costs maintenance and tokens, and inflates a meaning's prominence on the ladder past its real rank.
- **Sediment** — stale layers that settle because adding feels safe and removing feels risky. The default fate of any skill without a pruning discipline.
- **Sprawl** — a skill simply too long, even when every line is live and unique. Hurts readability and maintainability and wastes tokens. The cure is the ladder: disclose **reference** behind pointers, and split by **branch** or sequence so each path carries only what it needs.
- **No-op** — a line the model already obeys by default, so you pay load to say nothing. The test: does it change behaviour versus the default? A weak leading word (_be thorough_ when the agent is already thorough-ish) is a no-op; the fix is a stronger word (_relentless_), not a different technique.
```
