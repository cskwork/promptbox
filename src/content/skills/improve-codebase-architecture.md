---
title: improve-codebase-architecture
summary: "코드에서 쓸데없이 복잡하게 얽혀 유지보수하기 어려운 부분을 찾아내, 정리 전후를 한눈에 보여주는 시각 리포트로 만들어 주고, 고른 곳을 어떻게 단순하게 고칠지 질문을 주고받으며 함께 다듬어 주는 스킬."
summary_en: "Finds over-complex code, produces a before/after visual report per candidate, and walks you through whichever refactor you choose."
tags: [skill, architecture, refactor, deep-modules, html-report, mattpocock]
source: https://github.com/mattpocock/skills/tree/main/skills/engineering/improve-codebase-architecture
author: mattpocock
license: mattpocock/skills 참조
order: 28
trigger: "improve architecture / find refactoring opportunities / 아키텍처 개선 / shallow module 찾기 / make codebase more testable"
install: "npx skills add https://github.com/mattpocock/skills --skill improve-codebase-architecture"
---

## 핵심 어휘 (이 단어들을 그대로 써야 함)

- **Module** — interface(호출자에게 노출되는 사용 규약) + implementation(내부 구현)을 가진 모든 것
- **Interface** — 호출자가 알아야 하는 모든 것 (타입, 불변식, 에러, 순서, config)
- **Depth(모듈의 깊이)** — 작은 interface 뒤의 많은 동작. **Deep = high leverage(작은 interface로 큰 효용)**, **Shallow(얕음, interface가 implementation만큼 복잡)**
- **Seam(테스트를 끼워 넣는 이음새)** — interface가 사는 곳 (`boundary` 쓰지 말 것)
- **Deletion test(삭제해 보는 검증)** — 모듈을 삭제했을 때 복잡도가 사라지면 pass-through(그냥 거쳐 가기만 하던 모듈), N개 호출자에 다시 나타나면 제 몫을 한 것

## 워크플로우

1. **Explore** — Explore agent로 코드베이스를 organic하게(정해진 순서 없이 자연스럽게) 탐색하면서 friction(걸리적거리는 지점)을 기록. shallow한 곳, 깊이 vs locality(변경·버그·지식이 한곳에 모이는 정도)가 깨진 곳, untested(테스트가 없는) 영역을 찾기.
2. **HTML 리포트** — `$TMPDIR/architecture-review-<ts>.html`에 self-contained(외부 의존 없이 한 파일로 완결된) 리포트 작성. Tailwind CDN + Mermaid CDN. 각 후보마다 before/after 시각화 + `Strong`/`Worth exploring`/`Speculative` 배지.
3. **Grilling loop(파고드는 문답 반복)** — 사용자가 후보를 고르면 design tree(설계 선택지의 갈래)를 함께 걷는다. 결정이 crystallize되면(명확히 굳어지면) `CONTEXT.md` 인라인 업데이트, 후보가 reject되면(기각되면) ADR(아키텍처 결정 기록) 제안 (단, 미래 explorer가 같은 후보를 재제안하지 않기 위한 reason일 때만).

## 함정

- "component / service / API / boundary" 단어 쓰지 말 것. 어휘 일관성 자체가 스킬의 포인트.
- HTML 리포트는 **repo 밖**(temp dir)에 — repo 오염 방지.
- 기존 ADR과 충돌하는 후보는 friction이 진짜로 클 때만 surface(겉으로 드러내 제안). 워닝 callout(강조 박스)으로 표시.

## 원문 SKILL.md (전문)

````markdown
---
name: improve-codebase-architecture
description: Find deepening opportunities in a codebase, informed by the domain language in CONTEXT.md and the decisions in docs/adr/. Use when the user wants to improve architecture, find refactoring opportunities, consolidate tightly-coupled modules, or make a codebase more testable and AI-navigable.
---

# Improve Codebase Architecture

Surface architectural friction and propose **deepening opportunities** — refactors that turn shallow modules into deep ones. The aim is testability and AI-navigability.

## Glossary

Use these terms exactly in every suggestion. Consistent language is the point — don't drift into "component," "service," "API," or "boundary." Full definitions in [LANGUAGE.md](LANGUAGE.md).

- **Module** — anything with an interface and an implementation (function, class, package, slice).
- **Interface** — everything a caller must know to use the module: types, invariants, error modes, ordering, config. Not just the type signature.
- **Implementation** — the code inside.
- **Depth** — leverage at the interface: a lot of behaviour behind a small interface. **Deep** = high leverage. **Shallow** = interface nearly as complex as the implementation.
- **Seam** — where an interface lives; a place behaviour can be altered without editing in place. (Use this, not "boundary.")
- **Adapter** — a concrete thing satisfying an interface at a seam.
- **Leverage** — what callers get from depth.
- **Locality** — what maintainers get from depth: change, bugs, knowledge concentrated in one place.

Key principles (see [LANGUAGE.md](LANGUAGE.md) for the full list):

- **Deletion test**: imagine deleting the module. If complexity vanishes, it was a pass-through. If complexity reappears across N callers, it was earning its keep.
- **The interface is the test surface.**
- **One adapter = hypothetical seam. Two adapters = real seam.**

This skill is _informed_ by the project's domain model. The domain language gives names to good seams; ADRs record decisions the skill should not re-litigate.

## Process

### 1. Explore

Read the project's domain glossary and any ADRs in the area you're touching first.

Then use the Agent tool with `subagent_type=Explore` to walk the codebase. Don't follow rigid heuristics — explore organically and note where you experience friction:

- Where does understanding one concept require bouncing between many small modules?
- Where are modules **shallow** — interface nearly as complex as the implementation?
- Where have pure functions been extracted just for testability, but the real bugs hide in how they're called (no **locality**)?
- Where do tightly-coupled modules leak across their seams?
- Which parts of the codebase are untested, or hard to test through their current interface?

Apply the **deletion test** to anything you suspect is shallow: would deleting it concentrate complexity, or just move it? A "yes, concentrates" is the signal you want.

### 2. Present candidates as an HTML report

Write a self-contained HTML file to the OS temp directory so nothing lands in the repo. Resolve the temp dir from `$TMPDIR`, falling back to `/tmp` (or `%TEMP%` on Windows), and write to `<tmpdir>/architecture-review-<timestamp>.html` so each run gets a fresh file. Open it for the user — `xdg-open <path>` on Linux, `open <path>` on macOS, `start <path>` on Windows — and tell them the absolute path.

The report uses **Tailwind via CDN** for layout and styling, and **Mermaid via CDN** for diagrams where a graph/flow/sequence reliably communicates the structure. Mix Mermaid with hand-crafted CSS/SVG visuals — use Mermaid when relationships are graph-shaped (call graphs, dependencies, sequences), and hand-built divs/SVG when you want something more editorial (mass diagrams, cross-sections, collapse animations). Each candidate gets a **before/after visualisation**. Be visual.

For each candidate, the same template as before, but rendered as a card:

- **Files** — which files/modules are involved
- **Problem** — why the current architecture is causing friction
- **Solution** — plain English description of what would change
- **Benefits** — explained in terms of locality and leverage, and how tests would improve
- **Before / After diagram** — side-by-side, custom-drawn, illustrating the shallowness and the deepening
- **Recommendation strength** — one of `Strong`, `Worth exploring`, `Speculative`, rendered as a badge

End the report with a **Top recommendation** section: which candidate you'd tackle first and why.

**Use CONTEXT.md vocabulary for the domain, and [LANGUAGE.md](LANGUAGE.md) vocabulary for the architecture.** If `CONTEXT.md` defines "Order," talk about "the Order intake module" — not "the FooBarHandler," and not "the Order service."

**ADR conflicts**: if a candidate contradicts an existing ADR, only surface it when the friction is real enough to warrant revisiting the ADR. Mark it clearly in the card (e.g. a warning callout: _"contradicts ADR-0007 — but worth reopening because…"_). Don't list every theoretical refactor an ADR forbids.

See [HTML-REPORT.md](HTML-REPORT.md) for the full HTML scaffold, diagram patterns, and styling guidance.

Do NOT propose interfaces yet. After the file is written, ask the user: "Which of these would you like to explore?"

### 3. Grilling loop

Once the user picks a candidate, drop into a grilling conversation. Walk the design tree with them — constraints, dependencies, the shape of the deepened module, what sits behind the seam, what tests survive.

Side effects happen inline as decisions crystallize:

- **Naming a deepened module after a concept not in `CONTEXT.md`?** Add the term to `CONTEXT.md` — same discipline as `/grill-with-docs` (see [CONTEXT-FORMAT.md](../grill-with-docs/CONTEXT-FORMAT.md)). Create the file lazily if it doesn't exist.
- **Sharpening a fuzzy term during the conversation?** Update `CONTEXT.md` right there.
- **User rejects the candidate with a load-bearing reason?** Offer an ADR, framed as: _"Want me to record this as an ADR so future architecture reviews don't re-suggest it?"_ Only offer when the reason would actually be needed by a future explorer to avoid re-suggesting the same thing — skip ephemeral reasons ("not worth it right now") and self-evident ones. See [ADR-FORMAT.md](../grill-with-docs/ADR-FORMAT.md).
- **Want to explore alternative interfaces for the deepened module?** See [INTERFACE-DESIGN.md](INTERFACE-DESIGN.md).
````
