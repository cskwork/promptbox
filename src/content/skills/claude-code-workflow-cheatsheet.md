---
title: claude-code-workflow-cheatsheet
summary: "어떤 명령어를 언제 써야 할지 매번 까먹는 문제를 해결 — 자주 쓰는 작업 순서를 정리해 Claude가 모든 세션 시작 때 알려주게 한다. 인기 도구 모음 5종 기본 설정 제공."
summary_en: "Stop forgetting which commands to run — pin a workflow cheat sheet so Claude reminds you at the start of every session. Includes 5 built-in presets."
tags: [skill, claude-code, workflow, settings, company-announcements, cheatsheet, cskwork]
source: https://github.com/cskwork/claude-code-workflow-cheatsheet
author: cskwork
license: MIT
order: 42
trigger: "slash command 잊어버려 / setup-announcements / workflow cheatsheet / 매 세션마다 워크플로우 리마인드 / harness preset"
install: "cp -r ~/Downloads/Code/claude-code-workflow-cheatsheet ~/.claude/skills/company-announcements"
hidden: true
---

## 한 줄

40개 넘는 슬래시 커맨드를 깔아놓고 정작 3개만 쓰는 문제를 해결 — Claude Code가 매번 띄워주는 공지 자리(`companyAnnouncements`)에 "이 작업엔 이 순서" 식의 워크플로우 안내를 넣어, 세션을 열 때마다 Claude가 그대로 보게 한다.
*EN: Turn Claude's per-session announcement field into a permanent reminder of which commands to chain for each task.*

## 언제 쓰는가

- Superpowers · Everything Claude Code · Oh My Claude Code · Matt Pocock skills 같은 하니스(harness, Claude Code 위에 명령·스킬을 얹는 도구 모음)를 깔았는데 명령어를 자꾸 잊는다
- 팀이 권장 워크플로우 체인(`/plan -> /tdd -> /code-review -> /verify`)을 공통으로 쓰게 하고 싶다
- 신규 합류자에게 매번 "어떤 슬래시 쓰지?" 설명하는 게 지친다

## 무엇을 하는가

1. `~/.claude/commands/`와 프로젝트 `.claude/commands/`를 스캔해 설치된 슬래시 커맨드 인벤토리
2. 카테고리별 워크플로우 체인으로 분류 (Dev / Quality / Docs / Learn / Session / Meta …)
3. `[Workflows]` / `[OMC]` / `[Superpowers]` / `[Matt]` 접두사로 라벨링된 한 줄짜리 cheatsheet(빠르게 훑어보는 요약표) 생성
4. `~/.claude/settings.json`의 `companyAnnouncements`에 단일 string(하나의 문자열)으로 박아넣음 (`\n`으로 라인 분리)

## 함정

- `companyAnnouncements`가 **배열에 여러 string**이면 Claude Code가 세션마다 **랜덤 하나**만 고른다. 매 세션 전부 보이게 하려면 **단일 배열 원소** + `\n` 줄바꿈으로 합쳐야 한다
- Matt Pocock 프리셋은 사전에 `npx skills add https://github.com/mattpocock/skills` + `/setup-matt-pocock-skills` 1회 실행 필요
- OMCC 매직 키워드(`autopilot:`, `ralph:`, `ulw`)는 슬래시 커맨드가 아니라 Claude Code 프롬프트 — 셸 명령으로 오해 금지

## 5개 하니스 프리셋

| Harness | Preset ID | 스타일 |
|---|---|---|
| Everything Claude Code (ECC) | `ecc` | `/plan`, `/tdd`, `/verify` 표준 슬래시 |
| Oh My Claude Code (OMCC) | `omcc` | 네임스페이스 `/oh-my-claudecode:*` + 매직 키워드 |
| Superpowers (obra) | `superpowers` | 스킬 기반 `/brainstorming`, `/writing-plans` |
| Matt Pocock skills | `mattpocock` | `/diagnosing-bugs`, `/tdd`, `/to-spec`, `/to-tickets`, `/triage` |
| Vanilla Claude Code | `minimal` | 내장 `/plan`, `/code-review` |
| Custom | `custom` | 사용자가 직접 선택 |

## 사용법

```bash
# 1. 스킬 설치
cp -r . ~/.claude/skills/company-announcements

# 2. Claude Code에서
/setup-announcements                         # 설치된 커맨드 auto-detect
/setup-announcements --harness superpowers   # Superpowers 프리셋
/setup-announcements --harness ecc           # Everything Claude Code 프리셋
/setup-announcements --harness omcc          # Oh My Claude Code 프리셋
/setup-announcements --harness mattpocock    # Matt Pocock skills 프리셋
/setup-announcements --harness minimal       # Vanilla 프리셋
/setup-announcements --harness custom        # 대화형 선택
```

또는 수동 — `templates/*.json`에서 `companyAnnouncements` 배열을 꺼내 `~/.claude/settings.json`에 paste.

## 문법 컨벤션

| 기호 | 의미 | 예 |
|---|---|---|
| `->` | 순차 단계 | `/plan -> /tdd -> /verify` |
| `\|` | 대안 커맨드 | `/verify \| /quality-gate` |
| `,` | 관련 커맨드 | `/save-session, /resume-session` |

## 원문 SKILL.md (전문)

````markdown
# Company Announcements Skill

Configure `companyAnnouncements` in `~/.claude/settings.json` with workflow cheat sheets tailored to your installed harness and commands.

## What It Does

1. **Detects** installed slash commands in `~/.claude/commands/` and project `.claude/commands/`
2. **Categorizes** them into workflow chains (dev, debug, docs, learning, etc.)
3. **Generates** a `companyAnnouncements` block for `settings.json`
4. Cross-platform: macOS, Windows, Linux compatible

## Usage

```
/setup-announcements                        # Auto-detect installed commands
/setup-announcements --harness ecc          # ECC (Everything Claude Code) preset
/setup-announcements --harness omcc         # Oh My Claude Code preset
/setup-announcements --harness superpowers  # Superpowers (obra) preset
/setup-announcements --harness mattpocock   # Matt Pocock's engineering skills preset
/setup-announcements --harness minimal      # Vanilla Claude Code preset
/setup-announcements --harness custom       # Interactive custom selection
```

## Supported Harnesses

| Harness | Command Style | Key Workflows | Preset ID |
|---------|--------------|---------------|-----------|
| Everything Claude Code (ECC) | Standard slash: `/plan`, `/tdd`, `/verify` | orchestrate, TDD, multi-model, eval | `ecc` |
| Oh My Claude Code (OMCC) | Namespaced: `/oh-my-claudecode:autopilot` + magic keywords: `autopilot:`, `ralph:`, `ulw` | autopilot, team, ralph, ultrawork | `omcc` |
| Superpowers (obra) | Skill-based: `/brainstorming`, `/writing-plans`, `/executing-plans` | brainstorm, plan, TDD, review, worktrees | `superpowers` |
| Matt Pocock's skills | Engineering slash: `/diagnose`, `/tdd`, `/to-spec`, `/to-tickets`, `/triage` | setup, plan, bug, feature, triage, architecture | `mattpocock` |
| Vanilla Claude Code | Built-in only: `/plan`, `/code-review` | plan, review | `minimal` |
| Custom | User-selected | Any combination | `custom` |

## Harness-Specific Workflow Patterns

### ECC (Everything Claude Code)

Standard slash commands without namespace prefix.

```
Dev/Bug:    /orchestrate feature|bugfix "desc" -> /e2e
Manual:     /plan -> /tdd -> /e2e -> /code-review -> /verify
Reproduce:  /e2e (as-is) -> /orchestrate bugfix -> /e2e (to-be)
Build:      /build-fix -> /verify
Quality:    /code-review -> /refactor-clean -> /verify | /quality-gate
Docs:       /update-docs, /update-codemaps | /docs "lib"
Multi:      /multi-plan -> /multi-execute | /devfleet "task"
Learn:      /learn -> /learn-eval -> /skill-create
Session:    /save-session, /resume-session
Meta:       /harness-audit, /skill-health, /context-budget
Instincts:  /instinct-status -> /evolve -> /promote | /prune
Lang:       /{lang}-review, /{lang}-build, /{lang}-test
```

### Oh My Claude Code (OMCC)

Namespaced commands (`/oh-my-claudecode:*`) plus magic keywords for quick access.

```
Autonomous: /oh-my-claudecode:autopilot "desc" (or keyword: autopilot: desc)
Persistent: /oh-my-claudecode:ralph "desc" (or keyword: ralph: desc)
Team:       /oh-my-claudecode:team 3:executor "task"
Parallel:   /oh-my-claudecode:ultrawork "tasks" (or keyword: ulw tasks)
Plan:       /oh-my-claudecode:omc-plan (or keyword: ralplan)
Clarify:    /oh-my-claudecode:deep-interview "vague idea"
Investigate:/oh-my-claudecode:trace "ambiguous problem"
QA:         /oh-my-claudecode:ultraqa "goal"
Visual QA:  /oh-my-claudecode:visual-verdict
Tri-Model:  /oh-my-claudecode:ccg "query" (Codex+Gemini+Claude)
Cleanup:    /oh-my-claudecode:ai-slop-cleaner (or keyword: deslop)
Skills:     /oh-my-claudecode:skill list|add|remove|search
Learn:      /oh-my-claudecode:learner
Session:    /oh-my-claudecode:psm (project session manager)
Release:    /oh-my-claudecode:release
Setup:      /oh-my-claudecode:setup | /oh-my-claudecode:omc-doctor

Pipeline:   deep-interview -> omc-plan --consensus -> autopilot
```

### Superpowers (obra)

Skill-based commands for structured development methodology.

```
Design:     /brainstorming -> /writing-plans
Execute:    /using-git-worktrees -> (/executing-plans or /subagent-driven-development)
Per Task:   /test-driven-development -> /requesting-code-review -> /receiving-code-review
Finish:     /verification-before-completion -> /finishing-a-development-branch
Tools:      /systematic-debugging (bugs) | /dispatching-parallel-agents (parallel)
Meta:       /writing-skills, /using-superpowers
```

### Matt Pocock's skills

Disciplined engineering workflows. Install: `npx skills add https://github.com/mattpocock/skills`, then `/setup-matt-pocock-skills` once per repo (one-time scaffolding — kept out of the persistent cheatsheet so it doesn't add noise after the first run).

```
Plan:       /grill-with-docs -> /to-spec -> /to-tickets
Bug:        /diagnose (6-phase: feedback loop -> reproduce -> hypothesise -> instrument -> fix+regression -> cleanup)
Feature:    /tdd (vertical tracer bullets) | /prototype (LOGIC or UI)
Triage:     /triage — sort new issues into needs-info / ready-for-agent / ready-for-human / wontfix; run when issues pile up or before handing one to an agent
Explore:    /improve-codebase-architecture
```

### Vanilla Claude Code (Minimal)

Built-in commands only, no harness required.

```
Dev:        /plan -> /code-review
Docs:       /docs "lib"
Session:    /save-session, /resume-session
```

## Output Format

The skill generates a JSON array for `companyAnnouncements` in settings.json. Each entry is one workflow category line:
- Prefixed with `[Workflows]` (ECC/minimal), `[OMC]` (OMCC), `[Superpowers]` (obra), or `[Matt]` (mattpocock)
- Arrow `->` for sequential steps
- Comma `,` for alternatives
- Pipe `|` to separate sub-categories
- Max ~120 chars per line for readability

## Cross-Platform Notes

- All commands use forward slashes (Claude Code convention, not OS paths)
- No shell-specific syntax in announcement strings
- JSON uses escaped quotes for inner quotes: `\"desc\"`
- Works identically on macOS (zsh/bash), Windows (PowerShell/cmd), Linux (bash/zsh)
- Magic keywords (OMCC) work on all platforms -- they are Claude Code prompts, not shell commands
````
