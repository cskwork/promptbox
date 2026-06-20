---
title: "superpm (cskwork/superpm-skill)"
summary: "PM(제품/프로젝트 관리) 요청 하나를 받아 도메인별로 라우팅하고, 독립적인 비평가가 프레임워크와 실제 의사결정을 기준으로 검증한 가장 작은 유용한 산출물을 납품하는 Claude 스킬."
summary_en: "One PM request in, a verified artifact out — routes across 10 PM domains (PRD, OKRs, GTM, analytics, and more), applies the right framework, then red-teams the draft with an independent critic before delivery."
tags: [skill, claude-code, pm, product-management, workflow, critic, harness-agnostic]
source: https://github.com/cskwork/superpm-skill
author: cskwork
license: MIT
order: 30
trigger: "/superpm · PRD 써줘 · 가격 전략 · GTM 플랜 · OKR · 경쟁사 분석"
install: 'git clone https://github.com/cskwork/superpm-skill && ln -s "$(pwd)/superpm-skill" ~/.claude/skills/superpm'
---

## 한 줄

PM(제품/프로젝트 관리, Product/Project Management) 요청 하나를 받아 PRD·전략·GTM·분석 등 10개 도메인 중 하나로 라우팅하고, 가장 작은 유용한 산출물을 만든 뒤 독립 비평가가 프레임워크 완결성·근거·의사결정 회피 여부를 적대적으로 검증한다.

*EN: State any PM ask; the skill picks the domain, applies the framework, red-teams the draft, and stops.*

## 언제 쓰는가

- PRD(제품 요구사항 문서), OKR(목표·핵심 결과), 로드맵, 스프린트 플랜이 필요할 때 → **EXECUTE** 도메인
- TAM/SAM/SOM(시장 규모 추정), 경쟁사 분석, 페르소나, 고객 여정 지도 → **RESEARCH**
- 가격 전략, 린 캔버스(Lean Canvas), 가치 제안(Value Proposition) 정의 → **STRATEGY**
- GTM(Go-to-Market, 시장 진입 전략), ICP(이상적 고객 프로필), 성장 루프 → **GTM / GROWTH**
- SQL에서 코호트(cohort) 분석이나 A/B 테스트 판독 → **ANALYTICS**
- 화면설계서·기능명세·스토리보드 → **STORYBOARD**
- 이력서 검토, NDA, 개인정보처리방침 초안 → **TOOLKIT**

어떤 PM 요청이든 `/superpm <ask>` 하나로 도메인 선택 없이 시작할 수 있다. 68개 PM 프레임워크(phuryn/pm-skills 카탈로그 기반)가 `reference/` 폴더에 내장되어 있다.

## 무엇을 하는가

동일한 5단계 루프가 모든 도메인에 적용된다.

1. **Capture** — 요청을 도메인·산출물·의사결정으로 분류한다. 진짜 불명확할 때만 ≤5개 질문 인터뷰 게이트(`reference/intent.md`)가 작동하며, 문서·데이터로 답할 수 있는 것은 읽어서 해결한다.
2. **Frame** — `## Intent` 블록에 실제 의사결정과 "완료 기준"을 명시한다. 비평가가 이 계약에 맞춰 검증한다.
3. **Draft** — 해당 도메인 reference를 로드하고 프레임워크를 적용한다. 사용자의 실제 입력을 사용하고, 가정(assumption)은 명시적으로 표시한다.
4. **Critic** — `reference/critic.md`의 독립 비평가가 누락 섹션·근거 없는 주장·미검증 가정·회피된 의사결정을 각각 리스크로 열거한다. 자기 초안을 자기가 승인하지 않는다.
5. **Deliver** — 블로커와 갭을 접어 넣고, 사용자 소유 리스크는 `## Critic` 블록으로 남긴다. 다음 자연스러운 산출물을 제안하되 시작하지는 않는다.

## 함정

- **독립 비평가 원칙**: 초안을 쓴 패스가 그 초안을 승인하지 않는다. 숫자·데이터 없는 주장은 비평가가 블로커로 분류한다.
- **가장 작은 산출물 원칙**: 가격 결정 하나에 SWOT·페르소나·로드맵을 붙이지 않는다. 요청된 의사결정에 필요한 프레임워크만 적용한다.
- **불가역 행동 차단**: 외부 발행·전송·공개가 필요하면 명시적 동의를 받은 후 진행한다.
- **멀티파일 스킬**: `SKILL.md`만 복사하면 `reference/`·`templates/`·`examples/`가 빠진다. 위 install 명령처럼 repo 전체를 clone하고 symlink(심볼릭 링크, 바로 가기)해야 정상 동작한다.

## 원문 — SKILL.md

````markdown
---
name: superpm
description: "Produce focused PM artifacts and verify them with a critic. Use for PRDs, strategy, OKRs, roadmaps, specs, research, analytics, GTM, growth, pricing, positioning, market signals, release notes, retros, and resume reviews."
---

# /superpm - one PM request, a verified artifact

One PM ask -> capture intent -> diverge by domain -> the smallest useful artifact -> an
independent critic checks it against the framework and the real decision -> stop.

68 PM frameworks live in `reference/`; this file routes the ask and names the loop. For a
one-paragraph note you could write directly, skip the skill.

## Principles

- **Serve the real decision.** Name the decision the artifact drives before drafting; a
  framework filled in for its own sake is waste.
- **Smallest useful artifact.** Only the frameworks the decision needs - no bolted-on
  SWOT/persona/roadmap when the ask was one pricing call.
- **Ground claims in evidence.** Numbers, quotes, segments come from the user's data, docs, or
  named assumptions - never invented. Market/customer claims: pull real signal via
  `reference/signal.md` (read-only, keyless) before asserting.
- **Surface hidden assumptions.** The critic names unstated assumptions and missing pieces as
  risks - never present an assumption as fact.
- **Ask only when genuinely ambiguous.** Read the repo/docs/data first; interview only
  load-bearing, user-only choices (`reference/intent.md`).
- **Hard stops.** Irreversible or outward-facing actions (publish, send, post, share
  externally) need explicit consent.

## Intent capture - signal to domain

Read the request and route to one domain (the artifact named usually decides it). When the ask
spans domains, pick the primary deliverable and pull supporting frameworks from the others.

| Signal in the request | Domain | Reference |
|---|---|---|
| brainstorm ideas / risky assumptions / opportunity tree / prioritize features / customer interview / metrics | **DISCOVER** | `reference/discover.md` |
| product strategy / vision / value proposition / lean or business model / monetization / pricing / SWOT / PESTLE / Porter / Ansoff | **STRATEGY** | `reference/strategy.md` |
| PRD / OKRs / roadmap / sprint plan / retro / pre-mortem / user or job stories / stakeholder map / prioritization framework / red-team a plan | **EXECUTE** | `reference/execute.md` |
| 화면설계서 / 기능명세 / 스토리보드 / screen design doc / screen spec / wireframe / UI spec | **STORYBOARD** | `reference/storyboard.md` |
| personas / segments / customer journey / market sizing (TAM/SAM/SOM) / competitor analysis / sentiment | **RESEARCH** | `reference/research.md` |
| SQL from a question / cohort analysis / A/B test read-out | **ANALYTICS** | `reference/analytics.md` |
| go-to-market / beachhead / ICP / growth loops / GTM motion / battlecard | **GTM** | `reference/gtm.md` |
| marketing ideas / positioning / value-prop statements / product name / North Star metric | **GROWTH** | `reference/growth.md` |
| review or tailor a resume / draft an NDA or privacy policy / proofread | **TOOLKIT** | `reference/toolkit.md` |
| document an AI-built app / shipping artifacts / intended-vs-implemented gap | **AI-SHIP** | `reference/ai-ship.md` |

The domain decides which reference loads; the loop is the same for all. Cross-cutting: asks
about *what the market/customers want* (demand, trends, voice of customer) ground the artifact
in `reference/signal.md` first.

## The loop - Capture, Frame, Draft, Critic, Deliver

1. **Capture.** Classify and record one line - `Domain: <X> | Artifact: <Y> | Decision it
   serves: <Z>` - even when nothing is ambiguous. If genuinely underspecified, run the
   `reference/intent.md` gate (<=5 questions, one batched round, a recommended answer per
   question). Resolve doc/data-answerable questions by reading, not asking.

2. **Frame.** Extend that line into the artifact's `## Intent` block: classification, the real
   decision, and the completion bar (what "done and trustworthy" looks like for this
   framework). This block is the contract the critic checks against.

3. **Draft.** Load `reference/<domain>.md` and apply the named framework. Use the user's real
   inputs; mark gaps as explicit assumptions. Smallest useful artifact - no filler frameworks.

4. **Critic (independent).** Run `reference/critic.md`. Independence is mechanical: if the
   harness supports subagents, hand a fresh one only the `## Intent` block + the draft;
   otherwise switch stance and read cold. Red-team: missing framework sections, unsupported
   claims, unvalidated assumptions, dodged decisions - each emitted as a risk. Do not
   self-congratulate a draft to green.

5. **Deliver.** Fold blockers and gaps back in; leave user-owned risks in a `## Critic` block.
   Response shape: artifact -> remaining risks -> one line on what was checked against what ->
   the one natural next artifact in the chain (DISCOVER -> STRATEGY -> EXECUTE -> STORYBOARD ->
   GTM/GROWTH; ANALYTICS measures any) - offer it, don't start it. Inline by default; write
   files when multi-page or multi-file (storyboard: always files) and report paths.
   Outward/irreversible steps wait for explicit consent.

## Follow-up turns

The loop is per-artifact, not per-message. On iteration:

- Substantive change (new claim, section, or decision) -> re-Draft, re-run the critic on the
  delta only.
- Tone / format / length-only edits -> no critic re-run.
- New artifact or new domain -> new loop from Capture. "Another idea / different one" in
  DISCOVER follows the idea-proposal batch rule (`reference/discover.md`).
- Keep the loaded domain reference; do not re-read it each turn.

## Reference map

| Read | When |
|---|---|
| `reference/intent.md` | Capture: ambiguity-gated <=5 question interview before drafting |
| `reference/critic.md` | Critic: independent red-team verification gate (every domain) |
| `reference/signal.md` | Signal: live market & customer evidence (voice of customer), read-only + keyless; feeds RESEARCH/DISCOVER/GTM, delegates to the `last30days` skill if present |
| `reference/discover.md` | DISCOVER: ideation, assumptions, OST, prioritization, interviews, metrics |
| `reference/strategy.md` | STRATEGY: strategy canvas, vision, value prop, lean/business model, pricing, analysis frameworks |
| `reference/execute.md` | EXECUTE: PRD, OKRs, roadmap, sprint, retro, pre-mortem, stories, stakeholder map, prioritization |
| `reference/storyboard.md` | STORYBOARD: 화면설계서/기능명세 - derive screens, wireframe (Mode B) or replica (Mode A), per-element spec; standalone via bundled HTML, delegates to the `storyboard-spec` skill if present |
| `reference/research.md` | RESEARCH: personas, segments, journey map, market sizing, competitor, sentiment |
| `reference/analytics.md` | ANALYTICS: NL->SQL, cohort, A/B test |
| `reference/gtm.md` | GTM: strategy, beachhead, ICP, growth loops, motions, battlecard |
| `reference/growth.md` | GROWTH: marketing ideas, positioning, value-prop statements, naming, North Star |
| `reference/toolkit.md` | TOOLKIT: resume, NDA, privacy policy, proofread |
| `reference/ai-ship.md` | AI-SHIP: shipping artifacts, intended-vs-implemented |
| `templates/` | Reusable artifact scaffolds (PRD, strategy canvas, OST, battlecard, storyboard page/board, ...) |

## Output language

Write the artifact in the user's language. Keep framework names, metric names, and
machine-checked anchors (SQL, identifiers, file paths) in their canonical form.
````
