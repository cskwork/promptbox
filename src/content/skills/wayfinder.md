---
title: wayfinder
summary: "한 세션에 담기지 않는 큰 작업을, 이슈 트래커 위의 '지도' 하나와 그에 딸린 결정 티켓들로 만들어 한 번에 하나씩 풀어 나간다. 아직 또렷하지 않은 부분은 억지로 쪼개지 않고 안개로 남겨 두었다가, 앞이 트이는 만큼 티켓으로 승격시킨다."
summary_en: "Charts a huge chunk of work — more than one session can hold — as a shared map of decision tickets on your tracker, resolving them one at a time until the way to the destination is clear."
tags: [skill, planning, greenfield, decision-map, issue-tracker, mattpocock]
source: https://github.com/mattpocock/skills/tree/main/skills/engineering/wayfinder
author: mattpocock
license: mattpocock/skills 참조
order: 31
trigger: "greenfield 프로젝트 시작 / 한 세션에 안 들어가는 큰 기능 / 어디서부터 손대야 할지 모르겠는 덩어리 / wayfinder"
install: "npx skills add https://github.com/mattpocock/skills --skill wayfinder"
---

## 한 줄

**목적지로 돌진하는 게 아니라 목적지까지 가는 *길*을 찾는 스킬.** 만들어 내는 건 deliverable(산출물)이 아니라 **결정**이고, "누가 가서 만들기 전에 정해야 할 게 더는 없을 때" 끝난다.

*EN: Wayfinding finds the way to a destination; it doesn't charge at building it. The map produces decisions, not deliverables.*

## 언제 쓰는가

- greenfield(맨바닥) 프로젝트를 시작할 때
- 한 에이전트 세션에 도저히 안 들어가는 큰 기능을 계획할 때

**이건 이 저장소에서 가장 무겁고 인지 부담이 큰 흐름이다.** 한 세션에 들어가는 잘 정의된 기능이라면 `/grill-with-docs`가 맞고, 여기가 아니다. 반대로 지도가 걷히고 나면 곧장 `/implement`로 가지 말고 `/to-spec`으로 합류한다 — 지도의 연결된 결정들을 만들 수 있는 계획으로 접는 게 그 스킬이다.

## 핵심 개념

| 개념 | 뜻 |
|---|---|
| **destination(목적지)** | 이 지도가 도달하려는 것. 넘겨줄 스펙일 수도, 잠가야 할 결정일 수도, 제자리에서 하는 변경(데이터 구조 이전)일 수도. **가장 먼저 정한다** — scope를 고정하고 모든 티켓의 모양을 정하므로 |
| **map(지도)** | `wayfinder:map` 라벨이 붙은 이슈 하나. 티켓들은 그 자식 이슈. 지도는 **색인이지 저장소가 아니다** — 결정은 오직 자기 티켓에만 살고, 지도는 요지만 적고 링크한다 |
| **frontier(최전선)** | 열려 있고 · 막혀 있지 않고 · 아무도 안 집은 자식 티켓들. 알려진 것의 가장자리 |
| **fog of war(전장의 안개)** | 올 것 같지만 아직 못 박을 수 없는 결정들. 지도의 **Not yet specified** 절에 느슨하게 적어 둔다 |
| **out of scope** | 목적지 **너머**의 일. 안개가 아니라 범위 밖 — 승격되지 않고 닫힌다 |

**안개인가 티켓인가?** 기준은 "지금 답할 수 있나"가 아니라 **"지금 질문을 정확히 진술할 수 있나"** 다. 진술할 수 있으면 막혀 있어도 티켓, 못 하면 안개.

## 티켓 유형 — HITL / AFK

모든 티켓은 **HITL**(human in the loop — 사람이 자기 몫을 직접 말해야 풀림) 아니면 **AFK**(에이전트 단독)다.

- **Research** (AFK) — 문서·외부 API·지식베이스를 읽어 결정이 기다리는 사실 하나를 캐낸다. `/research` 서브에이전트로 해결.
- **Prototype** (HITL) — 반응할 수 있는 싸고 거친 구체물을 만들어 논의의 해상도를 올린다.
- **Grilling** (HITL) — 대화. **기본값.** 항상 `/grilling`과 `/domain-modeling`을 부른다.
- **Task** (HITL 또는 AFK) — 결정 전에 반드시 끝나야 하는 수작업(서비스 가입, 접근 권한 확보, 데이터 이동). 유일하게 *결정하지 않고 하는* 유형이며, 결정을 풀어 준다는 점으로 자리를 얻는다.

## 함정

- **한 세션에 티켓 하나만 해결한다.** research 티켓만 예외.
- **HITL 티켓에서 에이전트가 사람 몫을 대신 답하면 안 된다.** 자기 질문에 자기가 답하는 grilling 에이전트는 정의상 HITL을 깬 것이다. (`/wayfinder`가 스스로를 grilling한다는 제보가 이래서 나왔다.)
- **이름으로 부른다.** `#42, #43, #44` 나열은 읽을 수 없다. 사람이 읽는 모든 곳에서 티켓은 제목으로 지칭하고 링크를 그 이름에 건다.
- **claim(선점)이 먼저다.** 작업 시작 전에 티켓을 담당자에게 배정한다 — 그 배정 자체가 선점이다. 열려 있는데 배정 안 된 티켓은 아직 아무도 안 집은 것.
- **처음 grilling에서 안개가 안 나오면 지도를 만들지 않는다.** 한 세션에 들어갈 만큼 작다는 뜻이니, 멈추고 어떻게 진행할지 물어본다.
- 트래커별 표현 방식(지도·자식 티켓·blocking·frontier 질의)은 `docs/agents/issue-tracker.md`의 "Wayfinding operations" 절을 따른다. 트래커가 없으면 로컬 마크다운으로 기본 동작.

## 원문 SKILL.md (전문)

````markdown
---
name: wayfinder
description: Plan a huge chunk of work — more than one agent session can hold — as a shared map of decision tickets on your issue tracker, and resolve them one at a time until the way to the destination is clear.
disable-model-invocation: true
---

A loose idea has arrived — too big for one agent session, and wrapped in fog: the way from here to the **destination** isn't visible yet. Wayfinding is about finding that way, not charging at the destination. This skill charts the way as a **shared map** on the repo's issue tracker, then works its **decision tickets** — questions whose resolution is a decision, not slices of a build to execute — one at a time until the route is clear.

The destination varies per effort, and naming it is the first act of charting — it shapes every ticket. It might be a spec to hand off and iterate on, a decision to lock before planning starts, or a change made in place like a data-structure migration. The map is domain-agnostic — engineering work, course content, whatever fits the shape.

## Plan, don't do

Wayfinder is **planning** by default: each ticket resolves a decision, and the map is done when the way is clear — nothing left to decide before someone goes and does the thing. The pull to just do the work is usually the signal you've reached the edge of the map and it's time to hand off. An effort can override this in its **Notes** — carrying execution into the map itself — but absent that, produce decisions, not deliverables.

## Refer by name

Every map and ticket is an issue, so it has a **name** — its title. In everything the human reads — narration, the map's Decisions-so-far — refer to it by that name, never by a bare id, number, or slug. A wall of `#42, #43, #44` is illegible; names read at a glance. The id and URL don't vanish — a name wraps its link — but they ride _inside_ the name, never stand in for it.

## The Map

The map is a single issue on this repo's issue tracker, labelled `wayfinder:map` — the canonical artifact. Its tickets are child issues of the map.

The map is an **index**, not a store. It lists the decisions made and points at the tickets that hold their detail; a decision lives in exactly one place — its ticket — so the map never restates it, only gists it and links.

**Where the map, its child tickets, blocking, and frontier queries physically live is tracker-specific.** The issue tracker should have been provided to you — run `/setup-matt-pocock-skills` if not. Consult the tracker doc's "Wayfinding operations" section for how _this_ repo expresses them. If no tracker has been provided, default to the local-markdown tracker.

### The map body

The whole map at low resolution, loaded once per session. Open tickets are **not** listed — they are open child issues, found by query.

```markdown
## Destination

<what reaching the end of this map looks like — the spec, decision, or change this effort is finding its way to. One or two lines; every session orients to it before choosing a ticket.>

## Notes

<domain; skills every session should consult; standing preferences for this effort>

## Decisions so far

<!-- the index — one line per closed ticket: enough to judge relevance, then zoom the link for the detail the ticket holds -->

- [<closed ticket title>](link) — <one-line gist of the answer>

## Not yet specified

<!-- see "Fog of war": in-scope fog you can't ticket yet; graduates as the frontier advances -->

## Out of scope

<!-- see "Out of scope": work ruled beyond the destination; closed, never graduates -->
```

### Tickets

Each ticket is a **child issue** of the map; the tracker's issue id is its identity. Its body is the question, sized to one 100K token agent session:

```markdown
## Question

<the decision or investigation this ticket resolves>
```

Each ticket carries a `wayfinder:<type>` label — one of `research`, `prototype`, `grilling`, `task` (see [Ticket Types](#ticket-types)).

A session **claims** a ticket by assigning it to the dev driving the map, **first**, before any work, so concurrent sessions skip it. That assignee _is_ the claim: an open, unassigned ticket is unclaimed.

Blocking uses the tracker's **native** dependency relationship — essential because it renders the frontier _visually_ in the tracker's own UI, so the human sees what's takeable without opening the map. Only a tracker that lacks native blocking falls back to a body convention. A ticket is **unblocked** when every ticket blocking it is closed; the **frontier** is the open, unblocked, unclaimed children — the edge of the known.

The answer isn't part of the body — it's recorded on resolution (see [Work through the map](#work-through-the-map)). Assets created while resolving a ticket are linked from the issue, not pasted in.

## Ticket Types

Every ticket is either **HITL** — human in the loop, worked _with_ a human who speaks for themselves — or **AFK**, driven by the agent alone. A HITL ticket only resolves through that live exchange; the agent never stands in for the human's side of it (a grilling agent that answers its own questions has broken this).

- **Research** (AFK): Reading documentation, third-party APIs, or local resources like knowledge bases to surface a fact a decision waits on. Resolved by a `/research` **subagent**. Use when knowledge outside the current working directory is required.
- **Prototype** (HITL): Raise the fidelity of the discussion by making a cheap, rough, concrete artifact to react to — an outline, a rough take, a stub, or UI/logic code via the /prototype skill. Links the prototype as an asset. Use when "how should it look" or "how should it behave" is the key question.
- **Grilling** (HITL): Conversation. The default case. Always invoke the /grilling and /domain-modeling skills.
- **Task** (HITL or AFK): Manual work that must happen before a _decision_ can be made — nothing to decide, prototype, or research, but the discussion is blocked until it's done. Signing up for a service so its API can be judged, provisioning access, moving data so its shape can be seen. This is the one type that _does_ rather than decides — and it earns its place by unblocking a decision, not by delivering the destination. The agent drives it alone where it can (AFK); otherwise it hands the human a precise checklist (HITL). Resolved when the work is done; the answer records what was done and any resulting facts (credentials location, new URLs, row counts) later tickets depend on.

## Fog of war

The map is _deliberately_ incomplete: don't chart what you can't yet see. Beyond the live tickets lies the **fog of war** — the dim view of decisions and investigations you can tell are coming but can't yet pin down, because they hang on questions still open. Resolving a ticket clears the fog ahead of it, graduating whatever's now specifiable into fresh tickets — one at a time, until the way to the destination is clear and no tickets remain.

The map's **Not yet specified** section is where that dim view is written down: the suspected question, the area to revisit later. It's the undiscovered frontier _toward_ the destination — everything here is in scope, just not sharp enough to ticket. Write as loosely or as fully as the view allows; it doubles as a signpost for collaborators reading where the effort is headed.

**Fog or ticket?** The test is whether you can state the question precisely now — _not_ whether you can answer it now.

- **Ticket when** the question is already sharp — even if it's blocked and you can't act on it yet.
- **Not yet specified when** you can't yet phrase it that sharply. Don't pre-slice the fog into ticket-sized pieces: it's coarser than a ticket, and one patch may graduate into several tickets, or none, once the frontier reaches it.

**Not yet specified** excludes what's already decided (Decisions so far), what's already a live ticket, and what's out of scope (the next section).

## Out of scope

Fog only ever gathers _toward_ the destination. The destination fixes the scope, so work beyond it is **out of scope** — it isn't fog, and it doesn't belong in **Not yet specified**. It gets its own **Out of scope** section on the map: work you've consciously ruled out of _this_ effort. Scope, not sharpness, lands it here.

Out-of-scope work never graduates — the frontier stops at the destination — so it returns only if the destination is redrawn, and then as a fresh effort, not a resumption.

Ruling something out of scope is a scoping act, not a step on the route. When a ticket that already exists turns out to sit past the destination — mis-scoped in while charting, or exposed by a resolution — **close it** (a closed ticket is unambiguously off the frontier) and leave one line in the **Out of scope** section: the gist plus why it's out of scope, linking the closed ticket. It stays out of **Decisions so far**, which records the route actually walked — a scope boundary isn't a step on it.

## Invocation

Two modes. Either way, **never resolve more than one ticket per session** — with the exception of research tickets.

### Chart the map

User invokes with a loose idea.

1. **Name the destination.** Run a `/grilling` and `/domain-modeling` session to pin down what this map is finding its way to — the spec, decision, or change. The destination fixes the scope, so it's settled first.
2. **Map the frontier.** Grill again, **breadth-first** this time: fan out across the whole space rather than deep on any one thread, surfacing the open decisions and the first steps takeable now. **If this surfaces no fog** — the way to the destination is already clear, the whole journey small enough for one session — you don't need a map. Stop and ask the user how they'd like to proceed.
3. **Create the map** (label `wayfinder:map`): Destination and Notes filled in, Decisions-so-far empty, the fog sketched into **Not yet specified**.
4. **Create the tickets you can specify now** as child issues of the map — then wire blocking edges in a **second pass** (issues need ids before they can reference each other). Wiring sorts them into the frontier and the blocked; everything you can't yet specify stays in the fog — the **Not yet specified** section.
5. **Fire the research subagents.** For each `research` ticket you just created, spin up a `/research` subagent to resolve it in parallel, capturing its findings on a throwaway `research/<name>` branch with a context pointer from the ticket.
6. Stop — charting is one session's work; it hand-resolves nothing.

### Work through the map

User invokes with a map (URL or number). A ticket is **optional** — without one, you pick the next decision, not the user.

1. Load the **map** — the low-res view, not every ticket body.
2. Choose the ticket. If the user named one, use it. Otherwise take the first frontier ticket in order. **Claim it**: assign it to yourself before any work.
3. Resolve it — **zoom as needed**: fetch the full body of any related or closed ticket on demand; invoke the skills the `## Notes` block names. If in doubt, use `/grilling` and `/domain-modeling`.
4. Record the resolution: post the answer as a **resolution comment**, **close** the issue, and **append a context pointer** to the map's Decisions-so-far.
5. Add newly-surfaced tickets (create-then-wire); graduate any fog the answer has made specifiable, clearing each graduated patch from **Not yet specified** so it lives only as its new ticket. If the answer reveals a ticket — this one or another — sits beyond the destination, **rule it out of scope** rather than resolving it on the route. If the decision invalidates other parts of the map, update or delete those tickets.

The user may run unblocked tickets in parallel, so expect other sessions to be editing the tracker concurrently.
````
