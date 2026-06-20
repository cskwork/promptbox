---
title: superdesign (cskwork/superdesign-skill)
summary: "의도(intent)를 읽고 트렌드를 점검한 뒤 어울리는 미학(aesthetic)으로 라우팅해 결정론적 anti-slop 게이트와 렌더링 검증 게이트를 통과한 우아한 UI를 만드는 Claude 스킬. 디자이너가 자기 결과물을 직접 승인하지 않으며, playwright-cli로 화면을 실제 렌더링해서 증거를 남긴다."
summary_en: "Intent-driven master web/mobile designer skill — routes to the right aesthetic, enforces anti-slop and WCAG contrast via deterministic gates, and renders every built surface with playwright-cli before declaring done. The designer never self-approves."
tags: [skill, claude-code, design, ui-ux, anti-slop, quality-gate, wcag]
source: https://github.com/cskwork/superdesign-skill
author: cskwork
license: MIT
order: 30
trigger: "/superdesign · design X · make this beautiful · landing page · redesign UI · design system / tokens · critique this design · explore directions · generate image / icon / logo"
install: 'git clone https://github.com/cskwork/superdesign-skill && ln -s "$(pwd)/superdesign-skill" ~/.claude/skills/superdesign'
---

## 한 줄

의도 하나를 받아 CREATE / REDESIGN / SYSTEM / CRITIQUE / EXPLORE / ASSET 여섯 모드 중 하나로 분류하고, 트렌드를 점검한 뒤 어울리는 미학(aesthetic family)으로 UI를 빌드한다. 정적 preflight 게이트(anti-slop + WCAG 명암비)와 playwright-cli(헤드리스 브라우저 렌더 드라이버) 렌더 게이트를 모두 통과해야 "완료"를 선언한다. 디자이너와 비평가(critic) 역할을 분리해 자기 승인을 원천 차단한다.

*EN: One design intent in, a gate-verified surface out — designer and critic are always separate roles.*

## 언제 쓰는가

- "개발자 도구 스타트업 랜딩 페이지" 처럼 새 UI를 처음 만들 때 (CREATE 모드)
- "이 어드민 대시보드(admin dashboard, 관리 화면)가 너무 평범해 보여" 같은 기존 UI 개선 (REDESIGN — 감사 우선)
- 디자인 토큰(token, 색상·타이포그래피·간격 등 디자인 변수), 팔레트, 테마 파일만 뽑을 때 (SYSTEM)
- 코드·URL·스크린샷을 붙여넣고 품질 리뷰만 받을 때 (CRITIQUE — 빌드 없음)
- 방향성 후보 2~4개를 비교하고 선택할 때 (EXPLORE — 확정 없음)
- 아이콘·일러스트·SVG·로고 에셋(asset, 이미지 파일)만 생성할 때 (ASSET — 폴백 체인)

트렌드 검색(`WebSearch`)이 실패하면 `reference/trend-snapshot.md`(날짜 명기 오프라인 스냅샷)로 자동 폴백(fallback, 대체 경로)한다. Stitch / gpt-image-2가 없어도 플레이스홀더(placeholder, 임시 대체물)로 우아하게 대체하되 **playwright-cli 렌더링만은 필수 — 설치 불가 시 즉시 중단하고 사용자에게 묻는다**.

## 무엇을 하는가 / 함정

기본 루프(CREATE/REDESIGN)는 Read → Trend pulse → Direction → Build(Designer) → Critique(독립) → Verify 6단계로 진행된다. 핵심 게이트:

- `templates/preflight-gate.sh` — anti-slop-gate.mjs(AI 티(tell) 탐지) + contrast-gate.mjs(WCAG AA 명암비) 정적 스캔.
- `templates/render-gate.sh` — playwright-cli로 화면을 실제 렌더링한 뒤 hero 배치·오버플로·콘솔 오류를 검사. 코드 블록 눈으로 보는 것은 검증으로 인정하지 않는다.
- 비즈니스 앱(admin/dashboard/console)이면 `reference/dashboard.md`가 마케팅 히어로를 제거하고 밀도 우선(density-first) 다이얼로 전환.
- 전환율이 중요한 브리프(sign up / buy / book)면 `reference/engagement.md`가 적용돼 CTA(Call to Action, 행동 유도 문구) 등 컨버전 메커니즘을 추가.

**함정**: 이 스킬은 멀티파일 스킬이다 — `agents/`(역할 페르소나), `reference/`(단계별 지침), `templates/`(게이트 스크립트)가 모두 동작에 필요하다. **SKILL.md만 복사하면 게이트 스크립트와 레퍼런스 파일이 빠져 스킬이 동작하지 않는다.** 위 `install` 명령처럼 repo 전체를 clone하고 symlink(심볼릭 링크)로 연결해야 한다(supergoal과 동일한 패턴). 아래 코드 블록은 SKILL.md 본문(spine)이다.

## 원문 — SKILL.md

````markdown
---
name: superdesign
description: Master web/mobile designer - read intent, pulse current trends, route to the right aesthetic, ship elegant UI past a deterministic anti-slop gate. Use for "/superdesign", "design X", "make this beautiful", "landing page", "redesign UI", "design system / tokens", "critique this design", "explore directions", "generate image / icon / logo".
---

# /superdesign - intent-driven elegance

Intent -> trend-aware direction that fits -> elegant UI -> verified against a deterministic anti-slop gate. One-line CSS tweak: skip this skill, edit directly.

## Core principles

- Elegance is baseline, not padding. Polished = correct, not extra credit.
- Read intent first. Design to the brief (kind, audience, brand, constraints), never to a default template.
- Trend-aware != trend-chasing. Apply only trends that serve the intent. Record the trend read, dated.
- Anti-slop enforced, not eyeballed. Every surface passes `anti-slop-gate.mjs` + contrast gate. Designer never self-approves.
- Diverse by intent. Route to the aesthetic family + medium that fit; no single house style.
- Self-contained + graceful fallback. Asset/trend tooling degrades: works without Stitch/gpt-image-2/WebSearch; missing tools -> documented placeholder + baked snapshot, never faked assets or invented data. Rendered verification is the one hard dependency: build modes render with `playwright-cli` (the only render driver, `reference/playwright-cli.md`); if it cannot be installed, STOP and ask - never substitute a headless render.
- Verify vs ground truth. Run the static gate AND render the built surface with `playwright-cli`, honor reduced-motion + WCAG AA, report what passed with command output.
- Hard stops. External publish (deploy/push/post) or destructive steps need explicit consent; ambiguous brief -> one question (non-interactive run: conservative read, assumption logged in the brief, proceed).

## Mode (classify the design intent, state it in one line)

| Signal | Mode | Approach |
|---|---|---|
| new UI / landing / app / screen from scratch | CREATE | default loop |
| redesign / modernize / improve / refresh existing UI | REDESIGN | audit-first (`reference/redesign.md`) |
| tokens / palette / type / theme / design system only | SYSTEM | `reference/design-system.md` |
| critique / audit / review (no build) | CRITIQUE | review-only, run detectors (`reference/critique.md`) |
| explore / moodboard / directions / "what style" | EXPLORE | divergent, trend-heavy, no commit (`reference/explore.md`) |
| image / icon / illustration / SVG / logo (asset only) | ASSET | fallback chain (`reference/assets.md`) |

Medium (web vs mobile/native) is orthogonal - decide in the loop, load `reference/web.md` or `reference/mobile.md`.

Tie-breaks (one mode wins): "critique and fix" -> REDESIGN (CRITIQUE never edits). "explore then build" -> EXPLORE; build only after the user picks. Tokens AND a page asked -> the deliverable decides (token file = SYSTEM, page = CREATE). Assets needed inside a build stay in CREATE/REDESIGN; ASSET only when the asset is the whole ask.

## Default loop (CREATE / REDESIGN) - role-separated

Author-independent roles. Single surface -> inline, switch role with a fresh re-read. 2+ surfaces or a parallel asset batch -> orchestrate agents, one Designer per surface; scaffolding may fan out, look-and-feel stays deep-and-narrow.

**Vault** = one work dir per surface, default `.superdesign/<surface>/`: holds `design-brief.md`, `trend-pulse.md`, `claims.md`, `contrast-pairs.json` (start each from `templates/`). `preflight-gate.sh <vault> <source files>` reads it - no vault, no gate. Create it at step 1.

1. **Read (brief).** Infer kind, audience, vibe, references, brand, quiet constraints (a11y/regulation override aesthetics). State: `Reading this as: <kind> for <audience>, <vibe> language, leaning <system or family>.` Two reads diverge -> ask ONE question; else do not ask; non-interactive -> conservative read + logged assumption. Record in the vault. (`reference/design-brief.md`)
2. **Trend pulse.** `WebSearch` current trend lane by default; on failure use `reference/trend-snapshot.md` (dated) and warn it may be stale. Reuse a same-kind pulse <=30 days old instead of re-searching (note the reuse). Keep only intent-serving trends. Record dated in the vault `trend-pulse.md`. (`reference/trend-research.md`)
3. **Direction.** Set dials `DESIGN_VARIANCE` / `MOTION_INTENSITY` / `VISUAL_DENSITY`. Pick official design system OR one aesthetic family (`reference/aesthetics.md`) OR one trend lane - never mix. Pick medium, load `web.md` or `mobile.md`.
4. **Build (Designer).** Implement to `reference/taste-core.md` (always authority) + chosen family/medium. Assets via `reference/assets.md`. Engagement-bearing brief (Read names a primary action - sign up/buy/book/subscribe) -> also `reference/engagement.md`. Data-dense business app (admin/dashboard/console/internal tool) -> also `reference/dashboard.md` (density-first dials, app shell, no marketing hero). Enforce anti-default + reduced-motion + computed contrast. No self-approval; append `claims.md` per surface with a `Framings:` line. (`agents/designer.md`)
5. **Critique (independent; no design edits).** Re-read `taste-core.md` + `impeccable-rules.md`. Enumerate every text/bg pair into vault `contrast-pairs.json`. Run `templates/preflight-gate.sh` (-> `anti-slop-gate.mjs` + `contrast-gate.mjs`) on the source, then render the surface with `playwright-cli` (`reference/playwright-cli.md`), write the `## Render` block, and run `templates/render-gate.sh`. Log every violation. (`agents/design-critic.md`)
6. **Verify.** Fix each violation, smallest change; re-run BOTH gates (preflight + render) until green. Report passes with output. Fresh violation loops critique -> fix; stop on green. Cap: 3 critique->fix cycles; same rule still failing -> stop, report remaining violations honestly.

Roles -> personas: build=`agents/designer.md`, critique=`agents/design-critic.md`, trends=`agents/trend-scout.md`, assets=`agents/asset-producer.md`.

## Mode contract (deliverable + done-when)

No-build modes (SYSTEM/CRITIQUE/EXPLORE/ASSET): load the mode's reference file, deliver its row, skip the loop. ASSET chain: `gpt-image-2` -> Stitch -> real web image/SVG -> placeholder.

| Mode | Deliverable | Verified by |
|---|---|---|
| CREATE / REDESIGN | surface code + vault | `templates/preflight-gate.sh` (static) AND `templates/render-gate.sh` (rendered via playwright-cli) green, output reported |
| SYSTEM | token file + one-screen usage example | `contrast-gate.mjs` on every pair; `anti-slop-gate.mjs` on the sample |
| CRITIQUE | findings report (severity, file:line, fix, verdict) | detectors ran on the input; URL/HTML input also rendered + `render-gate.sh` (screenshot-only input cannot render - note it); zero edits |
| EXPLORE | 2-4 divergent directions + one recommendation | directions genuinely differ; nothing built |
| ASSET | asset file(s) + manifest (tier used, substitutions) | links resolve; palette matches; placeholders flagged |

## Reference map (load only what the phase needs)

| Read | When |
|---|---|
| `reference/design-brief.md` | Read: infer brief, one-line read, single question |
| `reference/trend-research.md` | Trend pulse: search, evaluate, record |
| `reference/trend-snapshot.md` | Trend pulse fallback: dated offline snapshot + refresh |
| `reference/taste-core.md` | Build + Critique: always-on anti-slop visual authority |
| `reference/aesthetics.md` | Direction: pick <=1 aesthetic family (selection map) |
| `reference/impeccable-rules.md` | Critique: anti-pattern guardrails behind the detector |
| `reference/web.md` | Build: web stack + layout |
| `reference/mobile.md` | Build: mobile/native (iOS HIG, Material 3, RN/SwiftUI/Compose) |
| `reference/engagement.md` | Build: conversion/engagement craft when the brief names a primary action (SaaS/consumer/commerce/marketing) |
| `reference/dashboard.md` | Build: data-dense business app / admin / dashboard / internal tool (density-first overlay; no marketing hero) |
| `reference/playwright-cli.md` | Critique: the only render driver - render the built surface, then run `render-gate.sh` |
| `reference/assets.md` | Build / ASSET: image + SVG fallback chain |
| `reference/redesign.md` | REDESIGN: audit-first protocol |
| `reference/design-system.md` | SYSTEM: tokens, scales, theming |
| `reference/critique.md` | CRITIQUE: review-only flow |
| `reference/explore.md` | EXPLORE: divergent directions |
| `reference/sources.md` | Install commands, sources, attribution |

## Final checklist

- [ ] Mode + medium stated; brief read one line; trends pulsed + dated (or snapshot fallback disclosed)
- [ ] One accent, one type system, one radius, one theme strategy; dials declared
- [ ] Real/generated assets (no div-mockups); reduced-motion + WCAG AA honored
- [ ] Engagement-bearing brief -> `reference/engagement.md` applied (primary action obvious, useful states, real-data social proof, outcome-led CTA); editorial/portfolio left alone
- [ ] Data-dense business app (admin/dashboard/console/internal tool) -> `reference/dashboard.md` applied (no marketing hero; app shell + command palette; KPI north-star with deltas; tabular numerals; colorblind-safe status; per-widget loading/empty/error; tables virtualized past ~50 rows)
- [ ] Mode contract met: build modes -> `templates/preflight-gate.sh` (static) AND `templates/render-gate.sh` (rendered via playwright-cli) green with output reported; other modes -> their verified-by row
- [ ] Smallest change for intent; surrounding style matched; no unrequested rewrites
- [ ] Any external publish / destructive step had explicit consent
````
