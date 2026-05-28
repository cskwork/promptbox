---
title: oh-my-codex (OMX)
summary: 터미널 AI 코딩 도구 Codex CLI에 정해진 작업 순서(질문으로 다듬기 → 계획 → 실행)와 더 강한 기본 설정을 입혀, 매번 똑같은 방식으로 일하고 작업 내용이 사라지지 않게 해 주는 도구.
summary_en: Wraps Codex CLI with a fixed clarify-plan-execute routine, sane defaults, and session-persistent work logs.
tags: [harness, codex, npm, workflow, tmux, ultragoal, deep-interview, ralplan]
source: https://github.com/Yeachan-Heo/oh-my-codex
author: Yeachan Heo (Yeachan-Heo)
license: MIT
order: 20
base_agent: OpenAI Codex CLI
languages: [TypeScript, Node.js]
platforms: [macOS, Linux, Windows (secondary), WSL2]
install: "npm install -g oh-my-codex && omx setup && omx --madmax --high"
---

## 한 줄

Codex가 실제 코드를 짜는 엔진이고, OMX는 그 위에 정해진 작업 순서·역할·기록 보관을 얹는다. Codex를 매일 쓰는 사람이 "더 강한 기본값 + 일관된 작업 흐름 + 사라지지 않는 기록"을 원할 때 쓰는 도구다.

*EN: Codex does the actual coding; OMX adds a consistent workflow, roles, and durable records on top.*

## 표준 워크플로우 (외워두기)

1. **`$deep-interview "..."`** — 요구·boundary(경계)가 모호할 때. 질문으로 다듬기
2. **`$ralplan "..."`** — 명확해진 scope(범위)를 architecture(설계 구조) + implementation plan(구현 계획)으로
3. **`$ultragoal "..."`** — 승인된 plan을 sequential(순차적) Codex goal + `.omx/ultragoal` ledger(작업 기록 장부) checkpoint(중간 저장점)로 durable(사라지지 않게)화

옵션:
- **`$prometheus-strict`** — high-risk(위험도 높은) plan stricter interview/critique(비평)/synthesis(종합)
- **`$team "..."`** — Ultragoal 스토리 안에서 coordinated parallel execution(여러 작업을 조율해 동시 실행)이 필요할 때만
- **`$ralph "..."`** — durable multi-goal(여러 목표) 대신 single-owner(한 주체가 끝까지 맡는) 완료 루프

## 설치 (recommended default — macOS / Linux + Codex CLI)

```bash
# Codex CLI 이미 있으면
codex --version
npm install -g oh-my-codex
omx setup
omx --madmax --high

# Codex가 없고 npm으로 같이 관리하고 싶으면
npm install -g @openai/codex
npm install -g oh-my-codex
omx setup
```

**중요한 함정**: Homebrew가 `/opt/homebrew/bin/codex`를 이미 소유하면, `@openai/codex`를 npm으로 같이 install하면 `EEXIST`. OMX는 **PATH의 authenticated `codex`만 있으면** 충분 — npm이 Codex를 소유할 필요 없음.

## 첫 세션 체크

```bash
omx doctor                                                 # install / hook / runtime
codex login status
omx exec --skip-git-repo-check -C . "Reply with exactly OMX-EXEC-OK"  # real auth smoke
```

`omx doctor`만 green이면 install은 OK, 그러나 actual model call이 다른 profile/proxy/base-url 문제로 실패할 수 있어 real exec smoke test가 진짜 검증.

## Launch 정책

```bash
omx --madmax --high          # 기본: tmux 사용 가능하면 detached tmux + HUD
omx --direct --yolo          # one-off, OMX tmux/HUD 관리 없이
OMX_LAUNCH_POLICY=direct omx --yolo  # 영속적 preference
# CLI flag > env, 마지막 CLI policy flag wins
```

`OMX_LAUNCH_POLICY` 값: `direct | tmux | detached-tmux | auto`.

## 정신 모델

OMX는 Codex를 **대체하지 않는다**. layer만 추가:

- **Codex** — 실제 에이전트 작업
- **OMX role keywords** — 재사용 가능한 역할
- **OMX skills** — 재사용 가능한 workflow
- **`.omx/`** — plan / log / memory / runtime state

대부분의 사용자는 OMX를 *수동 운영 surface*가 아니라 **better task routing + workflow + runtime**으로 생각하면 된다.

## 주요 슬래시 surface

| Surface | 용도 |
|---|---|
| `$deep-interview` | intent / boundary / non-goal 명확화 |
| `$ralplan` | implementation plan 승인 + tradeoff |
| `$ultragoal` | 승인된 plan을 durable multi-goal로 |
| `$ralph` | 영속 completion + verification loop |
| `$team` | 코디네이트된 병렬 실행 |
| `/skills` | 설치된 skill 브라우징 |
| `$best-practice-research` | 사전 plan 단계 공식 evidence 수집 |
| `$autoresearch[-goal]` | bounded validator-gated research artifact |

## Team 런타임 (필요할 때만)

```bash
omx team 3:executor "fix the failing tests with verification"
omx team status <team-name>
omx team resume <team-name>
omx team shutdown <team-name>
```

macOS / Linux + `tmux` best. Windows는 `psmux`. WSL2가 Windows-host setup엔 better.

## Codex plugin layout

OMX는 official Codex plugin 레이아웃을 `plugins/oh-my-codex`에, marketplace metadata를 `.agents/plugins/marketplace.json`에 동봉. 그래도 **`npm install -g oh-my-codex` + `omx setup`을 대체하지 않는다**. plugin install 시 cache 위치: `${CODEX_HOME:-~/.codex}/plugins/cache/$MARKETPLACE_NAME/oh-my-codex/$VERSION/`.

## 함정

- Intel Mac startup에서 `syspolicyd` / `trustd` CPU spike (Gatekeeper validation) → `xattr -dr com.apple.quarantine $(which omx)`, 터미널을 Developer Tools allowlist에, `--madmax --high` 회피
- 자동 업데이트 prompt는 `OMX_AUTO_UPDATE=0`로 off, `=defer`로 prompt 없이 schedule
- Codex App 안 / plain outside-tmux 세션에선 `omx team`이 tmux-runtime shell surface — directly available in-app workflow 아님. CLI에서 launch
- false-green readiness: green `omx doctor`는 install + 로컬 runtime wiring만 확인. real exec가 실패하면 active `~/.codex`(또는 `CODEX_HOME`) profile / auth / proxy `openai_base_url` 확인

## 추가 surface

- **`omx explore --prompt "..."`** — read-only repository lookup. `omx_wiki/` 있으면 wiki-first context injection
- **`omx sparkshell <command>`** — shell-native inspection + bounded verification. env overrides 좁게 한정 (`OMX_SPARKSHELL_BIN`, `_MODEL`, `_FALLBACK_MODEL`, `_MODEL_INSTRUCTIONS_FILE`, `_SUMMARY_TIMEOUT_MS`)
- **`omx wiki`** — JSON CLI surface. `omx_wiki/`에 markdown-first / search-first 저장

## 참고

- Website: <https://yeachan-heo.github.io/oh-my-codex-website/>
- Discord: <https://discord.gg/PUwSMR9XNk>
- 공식 npm: [`oh-my-codex`](https://www.npmjs.com/package/oh-my-codex) — "OMX v2" 같은 third-party 이름은 공식 후속 아님
