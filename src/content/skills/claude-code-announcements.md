---
title: claude-code-announcements
summary: "설치된 명령어와 선택한 도구 모음에 맞춰 Claude Code 공지 설정에 작업 순서 요약표를 추가합니다."
summary_en: "Add a workflow cheat sheet to Claude Code announcements using the commands and presets you actually use."
tags: [skill, claude-code, workflow, settings, company-announcements, cskwork]
source: "https://github.com/cskwork/claude-code-workflow-cheatsheet"
author: cskwork
license: MIT
order: 41
trigger: "/claude-code-workflow-cheatsheet · workflow cheatsheet · 작업 순서 요약표 · harness preset"
install: "git clone https://github.com/cskwork/claude-code-workflow-cheatsheet.git && mkdir -p ~/.claude/skills && cp -R claude-code-workflow-cheatsheet/skills/claude-code-workflow-cheatsheet ~/.claude/skills/"
---

## 한 줄

설치된 명령어와 선택한 preset(미리 정한 구성)에 맞춰 Claude Code의 `companyAnnouncements`에 작업 순서 요약표를 넣습니다. 다른 설정과 기존 공지 내용을 보존합니다.

## 원본과 설치

원본 저장소 이름은 `claude-code-workflow-cheatsheet`입니다. 기존 항목 주소는 유지하며, 아래 원문은 해당 저장소의 스킬을 따릅니다. 템플릿도 필요하므로 저장소의 설치 안내를 사용합니다.

## 스킬 원문

````markdown
---
name: claude-code-workflow-cheatsheet
description: Configure a persistent workflow cheat sheet for Claude Code’s startup announcements using an installed-command inventory or a named harness preset.
---

# Company Announcements Skill

Configure `companyAnnouncements` in `~/.claude/settings.json` with workflow cheat sheets tailored to your installed harness and commands.

## Steps

1. **Pick the preset.** Take the preset ID named in the request — `ecc`, `omcc`, `superpowers`, `mattpocock`, `minimal`, or `custom`. With none named, list `~/.claude/commands/` and the project's `.claude/commands/`, then match what is installed against the harness table below. Done when one preset ID is chosen and named back to the user.
2. **Collect the workflow lines.** For a named harness preset, copy the `companyAnnouncements` value from `templates/<preset>.json` beside this SKILL.md verbatim. For `custom`, use the commands the user picks; for auto-detect, use the commands you found — building lines from the pattern blocks below in the Output Format shape. Done when every detected command sits in a line or was dropped on purpose.
3. **Configure settings.json.** Merge the result into `companyAnnouncements` in `~/.claude/settings.json`, leaving the file’s other keys intact and preserving unrelated existing announcement text in the combined string unless replacement was requested. Done when the file still parses as JSON and `companyAnnouncements` holds exactly one string.

## Supported Harnesses

| Harness | Command Style | Key Workflows | Preset ID |
|---------|--------------|---------------|-----------|
| Everything Claude Code (ECC) | Standard slash: `/plan`, `/tdd`, `/verify` | orchestrate, TDD, multi-model, eval | `ecc` |
| Oh My Claude Code (OMCC) | Namespaced: `/oh-my-claudecode:autopilot` + magic keywords: `autopilot:`, `ralph:`, `ulw` | autopilot, team, ralph, ultrawork | `omcc` |
| Superpowers (obra) | Skill-based: `/brainstorming`, `/writing-plans`, `/executing-plans` | brainstorm, plan, TDD, review, worktrees | `superpowers` |
| Matt Pocock's skills | Engineering slash: `/diagnose`, `/tdd`, `/to-prd`, `/to-issues`, `/triage` | setup, plan, bug, feature, triage, architecture | `mattpocock` |
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
Plan:       /grill-with-docs -> /to-prd -> /to-issues
Bug:        /diagnose (6-phase: feedback loop -> reproduce -> hypothesise -> instrument -> fix+regression -> cleanup)
Feature:    /tdd (vertical tracer bullets) | /prototype (LOGIC or UI)
Triage:     /triage — sort new issues into needs-info / ready-for-agent / ready-for-human / wontfix; run when issues pile up or before handing one to an agent
Explore:    /zoom-out | /improve-codebase-architecture
```

### Vanilla Claude Code (Minimal)

Built-in commands only, no harness required.

```
Dev:        /plan -> /code-review
Docs:       /docs "lib"
Session:    /save-session, /resume-session
```

## Output Format

`companyAnnouncements` takes a `string[]`, and Claude Code shows one randomly chosen element per session. Keep every workflow category line in a **single element**, separated by `\n` — the shape each file in `templates/` already uses.

- Prefix each line with `[Workflows]` (ECC/minimal), `[OMC]` (OMCC), `[Superpowers]` (obra), or `[Matt]` (mattpocock)
- Arrow `->` for sequential steps
- Comma `,` for related commands
- Pipe `|` for alternatives and sub-category breaks
- Max ~120 chars per line for readability
- JSON escapes inner quotes: `\"desc\"`
- Entries are Claude Code prompt text, not shell commands or OS paths: forward-slash commands and OMCC magic keywords (`autopilot:`, `ulw`) go in verbatim and read the same on macOS, Windows, and Linux
````
