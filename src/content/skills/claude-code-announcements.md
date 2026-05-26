---
title: claude-code-announcements
summary: Claude Code의 `companyAnnouncements`(매 세션 시작 시 Claude가 보는 워크플로우 cheatsheet)를 자동 구성하는 스킬. ECC·OMCC·Superpowers·Minimal 프리셋 + 사용자 설치 슬래시 커맨드 auto-detect.
tags: [skill, claude-code, workflow, settings, company-announcements, cskwork]
source: https://github.com/cskwork/claude-code-announcements
author: cskwork
license: MIT
order: 41
trigger: "setup-announcements / company announcements / 슬래시 커맨드 잊어버려 / workflow cheatsheet / harness preset"
install: "cp -r ~/Downloads/Code/claude-code-announcements ~/.claude/skills/company-announcements"
---

## 문제

Superpowers, Everything Claude Code, Oh My Claude Code, 또는 직접 만든 커맨드 40+ 개를 깔아놓고 매번 3개만 쓴다. 나머지 명령어가 있다는 것조차 잊어버린다.

## 해결책

`~/.claude/settings.json`의 `companyAnnouncements` 필드에 워크플로우 cheatsheet를 박아두면 Claude가 매 세션 시작 시 본다 → Claude가 *알아서* 적절한 커맨드를 제안.

```
[Workflows] Dev: /orchestrate feature "desc" -> /e2e
[Workflows] Quality: /code-review -> /refactor-clean -> /verify
[OMC] Auto: autopilot: desc | Persist: ralph: desc
[Superpowers] Design: /brainstorming -> /writing-plans
```

## 4개 하니스 프리셋

| Harness | Preset ID | 스타일 |
|---|---|---|
| Everything Claude Code (ECC) | `ecc` | `/plan`, `/tdd`, `/verify` 표준 슬래시 |
| Oh My Claude Code (OMCC) | `omcc` | 네임스페이스 `/oh-my-claudecode:*` + 매직 키워드 (`autopilot:`, `ralph:`, `ulw`) |
| Superpowers (obra) | `superpowers` | 스킬 기반 `/brainstorming`, `/writing-plans` |
| Vanilla Claude Code | `minimal` | 내장 `/plan`, `/code-review` |
| Custom | `custom` | 사용자가 직접 선택 |

## 사용법

```bash
# 1. 스킬 설치
cp -r . ~/.claude/skills/company-announcements

# 2. Claude Code에서
/setup-announcements                       # auto-detect
/setup-announcements --harness superpowers # 프리셋 적용
/setup-announcements --harness ecc
/setup-announcements --harness omcc
/setup-announcements --harness minimal
/setup-announcements --harness custom      # interactive
```

또는 수동 — `templates/*.json` 중 하나(예: `superpowers.json`)에서 `companyAnnouncements` 배열을 꺼내 `~/.claude/settings.json`에 paste.

## 출력 포맷

`companyAnnouncements`는 JSON 배열, 각 엔트리는 `\n`으로 카테고리 line을 구분:

- 접두사 `[Workflows]` / `[OMC]` / `[Superpowers]` / `[Matt]` 등
- `->` 순차 단계, `,` 대안, `|` 서브카테고리 구분
- 한 줄 ~120자 이하

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
/setup-announcements                      # Auto-detect installed commands
/setup-announcements --harness ecc        # ECC (Everything Claude Code) preset
/setup-announcements --harness omcc       # Oh My Claude Code preset
/setup-announcements --harness superpowers # Superpowers (obra) preset
/setup-announcements --harness minimal    # Vanilla Claude Code preset
/setup-announcements --harness custom     # Interactive custom selection
```

## Supported Harnesses

| Harness | Command Style | Key Workflows | Preset ID |
|---------|--------------|---------------|-----------|
| Everything Claude Code (ECC) | Standard slash: `/plan`, `/tdd`, `/verify` | orchestrate, TDD, multi-model, eval | `ecc` |
| Oh My Claude Code (OMCC) | Namespaced: `/oh-my-claudecode:autopilot` + magic keywords: `autopilot:`, `ralph:`, `ulw` | autopilot, team, ralph, ultrawork | `omcc` |
| Superpowers (obra) | Skill-based: `/brainstorming`, `/writing-plans`, `/executing-plans` | brainstorm, plan, TDD, review, worktrees | `superpowers` |
| Vanilla Claude Code | Built-in only: `/plan`, `/code-review` | plan, review | `minimal` |
| Custom | User-selected | Any combination | `custom` |

## Output Format

The skill generates a JSON array for `companyAnnouncements` in settings.json. Each entry is one workflow category line:
- Prefixed with `[Workflows]` (ECC/minimal), `[OMC]` (OMCC), or `[Superpowers]` (obra)
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
