---
title: context-diet
summary: "Claude Code의 도구 정의와 스킬 목록이 차지하는 입력을 측정하고, 필요한 기능을 보존하며 사용하지 않는 설정을 조정합니다."
summary_en: "Measure prompt overhead and trim unused capabilities while preserving the workflows you need."
tags: [skill, claude-code, tokens, cost, settings, optimization, proxy]
source: https://github.com/cskwork/context-diet-skill
author: cskwork
license: MIT
order: 18
trigger: "토큰 줄여줘 / 컨텍스트 줄이기 / 시스템 프롬프트 다이어트 / disableBundledSkills / permissions.deny"
install: "npx skills add cskwork/context-diet-skill"
---

## 한 줄

Claude Code가 요청에 싣는 도구 정의와 스킬 목록을 측정하고, 쓰지 않는 기능의 설정을 조정합니다. 필요한 작업이 계속 가능한지 변경 전후에 확인합니다.

## 확인할 점

토큰 수가 줄어든 만큼 요금이 줄어드는 것은 아닙니다. 확인 가능한 경우 캐시된 입력, 캐시되지 않은 입력, 출력을 구분합니다. 전역 설정 변경과 프록시(요청을 중계하는 프로그램)의 로그 저장 범위를 확인한 뒤 사용합니다.

## 스킬 원문

````markdown
---
name: context-diet
description: Measure Claude Code prompt overhead and disable unused tools or features while preserving required workflows. Use for context-size analysis or settings-based reduction.
---

# context-diet

Measure the tool definitions, skill catalogue, and feature instructions included in the current Claude Code configuration, then trim unused capabilities. Payload size is not billing: report cached input, uncached input, and output separately when available, and do not infer cost savings from raw token reductions.

Method adapted from aihero.dev, "How to kill the bloat in Claude Code's system prompt." Bare-name versus scoped deny behavior is documented in the [official Agent SDK permissions guide](https://code.claude.com/docs/en/agent-sdk/permissions).

## The idea in one line

A **bare tool name** in `permissions.deny` (e.g. `"NotebookEdit"`) removes the tool's
*definition* from the payload. A **scoped rule** (e.g. `"Skill(dataviz)"`) only blocks
the call but keeps the definition. To shrink tokens, deny bare names and flip `disable*` flags.

## Measure — record the baseline first

1. `/context` in a session prints the system / tools / MCP / memory / message token
   split. Write those numbers down; they are the only "before" you get. It reports one
   combined "tools" number, not a per-tool ranking.
2. For a per-tool ranking, run the logging proxy:
   ```bash
   node proxy.mjs                                   # repo root; :8787 → api.anthropic.com
   ANTHROPIC_BASE_URL=http://localhost:8787 claude  # in another terminal
   ```
   Each request is logged to `./logs/*.md` and a ranked tool-size table prints live.
   If port 8787 is already taken (e.g. an existing token proxy), use `PORT=9000 node proxy.mjs`
   and point `ANTHROPIC_BASE_URL` at the same port.

## Apply the diet

Paths below are relative to the skill directory `skills/context-diet`, so run there —
except `--project`, which writes `.claude/settings.json` into the *current* directory:
run that one from your project root and give the script's full path.

```bash
node scripts/apply-config.mjs            # merge into ~/.claude/settings.json (global)
node scripts/apply-config.mjs --project  # into ./.claude/settings.json (this project)
node scripts/apply-config.mjs --dry-run  # preview, write nothing
```

Inspect the current settings and preview with `--dry-run` first. Choose only capabilities the user does not need and preserve unrelated configuration. The script backs up the target, appends deduplicated deny rules, and sets disable flags; use `--template templates/settings.conservative.json` for the smaller subset. A template is a menu, not permission to disable everything it contains.

Done when Claude Code has been restarted, `/context` shows the measured before/after difference, and representative retained workflows still work. A lower count alone does not prove a successful configuration change.

## What the config does

- `permissions.deny: [bare tool names]` — drops those tool definitions from every request.
- `disableBundledSkills` — drops all Anthropic-bundled skills at once. Your own
  `~/.claude/skills` and plugin skills stay; bundled slash commands stay typable.
- `disableWorkflows` — drops the multi-agent `Workflow` tool (typically the single
  largest line in the table).
- `disableRemoteControl`, `disableClaudeAiConnectors`, `disableArtifact` — drop those
  feature surfaces and their instructions.
- Trim skills selectively instead of all-or-nothing: `skillOverrides` → `"off"` or
  `"user-invocable-only"` per skill.

## Menu, not prescription

Keep anything you use. Denying `EnterPlanMode`/`ExitPlanMode` removes plan mode;
`AskUserQuestion` removes clarifying questions; `NotebookEdit` breaks notebook edits;
`SendMessage`/`ScheduleWakeup` are used by multi-agent and `/loop` runs. Read
`REFERENCE.md` at the repo root before denying anything on that list — it carries the
full 6-step method and the per-item cost table.

## Templates

- `templates/settings.aggressive.json` — the full menu, biggest savings.
- `templates/settings.conservative.json` — keeps plan mode + AskUserQuestion + bundled skills.
````
