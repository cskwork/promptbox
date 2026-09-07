---
title: codex-cli (claude-codex-skill)
summary: "Claude Code 안에서 코드 검토·코드 작성·이미지 생성을 Codex에 바로 넘길 수 있는 스킬. 이미지 생성은 ChatGPT 로그인만 있으면 충분하고 별도 API 키가 필요 없습니다."
summary_en: "Hand off code review, coding tasks, or image generation to OpenAI Codex without leaving Claude Code — and images work with just a ChatGPT login, no API key."
tags: [skill, claude-code, codex, image-gen, code-review, sandbox, openai]
source: https://github.com/cskwork/claude-codex-skill
author: cskwork
license: MIT
order: 35
trigger: "/codex-cli / use codex / ask codex / have codex / second-opinion review / generate image"
install: "curl -fsSL https://raw.githubusercontent.com/cskwork/claude-codex-skill/main/install.sh | bash  # PowerShell: iwr -useb .../install.ps1 | iex"
hidden: true
---

## 한 줄

Claude Code 안에서 Codex에게 코드 검토(review)·코드 작성(impl)·이미지 생성(image)을 넘기는 스킬. 잘 알려지지 않은 사실 — 이미지 생성은 `codex login`(ChatGPT 로그인) 하나면 되고 별도 API key가 필요 없습니다.

*EN: Delegate review, coding, and image generation to Codex from inside Claude Code — images need only a ChatGPT login, no API key.*

## 세 가지 모드

| Invocation | What | Example |
|---|---|---|
| `/codex-cli review` | diff를 Codex에 second-opinion review(다른 관점에서 한 번 더 검토)로 | `/codex-cli review --base main` |
| `/codex-cli impl <prompt>` | Codex에 non-interactive(사람 입력 없이 한 번에 실행) 코딩 작업 위임 | `/codex-cli impl "add JWT refresh to api/auth.ts"` |
| `/codex-cli image <prompt>` | Codex 내장 image gen(이미지 생성) — API key 불필요 | `/codex-cli image "isometric CPU diagram, neon"` |

자연어로도 트리거 가능 — "ask codex to review my diff", "have codex generate an isometric CPU diagram" (스킬의 `when_to_use` 필드가 감지).

## 핵심 함정 (스킬이 알아서 처리)

1. **이미지 생성의 디스커버리(어떤 도구를 쓸지 찾아내는) 문제** — 모델이 `OPENAI_API_KEY`나 `curl`/`python`을 언급한 prompt를 받으면 shell-out(셸 명령으로 외부 실행) 경로로 빠지고 실패. 스킬은 "generate and save"라고만 시켜 내장 툴을 고르게 한다.
2. **Windows sandbox(격리 실행 환경) copy bug** — codex-cli 0.128.0 Windows에서 이미지 생성은 성공하나 workspace(작업 폴더) 복사가 `CreateProcessAsUserW failed: 5`로 실패. 스킬이 `~/.codex/generated_images/<session>/ig_*.png`에서 직접 찾아 복사
3. **Sandbox safety** — `-s danger-full-access` / `--dangerously-bypass-approvals-and-sandbox`는 명시 per-run approval(실행할 때마다 받는 승인) 없이 절대 사용 X

## 설치

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/cskwork/claude-codex-skill/main/install.sh | bash

# Windows PowerShell
iwr -useb https://raw.githubusercontent.com/cskwork/claude-codex-skill/main/install.ps1 | iex
```

수동: `SKILL.md`를 `~/.claude/skills/codex-cli/SKILL.md` (또는 Windows `%USERPROFILE%\.claude\skills\codex-cli\SKILL.md`)에 복사 → Claude Code 재시작 → `/codex-cli` 확인.

## 전제

- Claude Code 설치
- Codex CLI ≥ 0.128.0 (`codex --version`)
- `codex login status` = "Logged in" (ChatGPT 로그인이면 충분, API key 로그인도 OK)

## SKILL.md 본문 (그대로 복사)

````markdown
---
name: codex-cli
description: Delegate a bounded review, implementation, or image task to local Codex CLI when the user requests Codex or its capabilities are needed.
---

# codex-cli

Wrap the local `codex` CLI so Claude Code can hand off three kinds of work without leaving the conversation:

- **review** — second-opinion code review on a diff
- **impl** — non-interactive coding task in a sandbox
- **image** — image generation via Codex's built-in `image_gen.imagegen` tool (no API key, ChatGPT login is enough)

## Verify once per session

```bash
codex --version          # codex-cli ≥ 0.128.0
codex login status       # must say "Logged in"
```

If not logged in, tell the user to run `! codex login` from the prompt. Do not log in on their behalf.

## Pick the mode

The first word of the invocation selects the mode (`review | impl | image`); everything after it is the prompt or flags. With no mode word, infer:

- mentions "review", "diff", "PR", "second opinion" → review
- mentions "image", "picture", "render", "draw", "그려" → image
- otherwise → impl

State the mode you picked in your reply so the user can correct you.

## Mode: review

```bash
codex review --uncommitted              # staged + unstaged + untracked
codex review --base main                # PR-style against base branch
codex review --commit <sha>             # one specific commit
printf '%s\n' "Focus on concurrency. Skip nits." | codex review --uncommitted -
```

After it returns, group the findings by **CRITICAL / HIGH / MEDIUM / LOW** and cite `file:line` per finding.

Codex's review is a second opinion, not ground truth. If it contradicts something already verified in this session, flag the conflict to the user instead of silently siding with Codex.

## Mode: impl

```bash
# One-shot non-interactive (preferred)
codex exec "<prompt>" \
  -s workspace-write \
  -C "<absolute path>" \
  --output-last-message codex-out.txt

# Read-only research / planning
codex exec "<prompt>" -s read-only -C "<path>"

# Long prompt via stdin
cat prompt.md | codex exec -s workspace-write -C "<path>" -

# Continue most recent session
codex exec resume --last "<follow-up>"
```

Sandbox policy:

- Default `workspace-write` (network on, writes inside `-C` only).
- Use `read-only` when the user wants analysis or a written plan with no edits.
- Pass `-C` with the intended absolute project path so the task cannot run in an accidental working directory.
- Escalating past the sandbox needs explicit per-run user approval: `-s danger-full-access` turns off the sandbox, and `--dangerously-bypass-approvals-and-sandbox` turns off both the sandbox and the approval gate (it exists for externally-sandboxed CI).

After Codex finishes, inspect the diff, generated artifacts, and verification evidence before reporting the outcome. Apply a separate returned patch only when the user authorized that target; do not reapply changes already present.

## Mode: image

Codex has a built-in image tool (`image_gen.imagegen`). It activates automatically when `codex features list` shows `image_generation = stable, true`. Authentication uses your `codex login` — ChatGPT login is enough; no `OPENAI_API_KEY` needed.

Invoke:

```bash
codex exec --skip-git-repo-check \
  -s workspace-write \
  -C "<absolute path to output dir>" \
  "Generate an image of <prompt>, 1024x1024. Save the result as <name>.png in the current working directory."
```

**Critical prompt rule.** Do NOT tell Codex to "use the OpenAI API", "use curl", "use python", or "use openai CLI". Those instructions force a shell-out path that needs `OPENAI_API_KEY`. Just say *generate and save* — Codex picks its built-in tool.

**Where the file lands.** Codex writes the PNG to `~/.codex/generated_images/<session_id>/ig_<hash>.png`, then tries to copy it to the workspace via shell. On Windows codex-cli 0.128.0 the copy step often fails (`CreateProcessAsUserW failed: 5`) even though generation succeeded. Do NOT escalate to `-s danger-full-access` for this — copy the file yourself:

Use the exact generated image path returned by this invocation and copy it to the requested output path. Verify the file exists and inspect it before reporting success. Do not select the globally newest generated image: another session may have created it. If the invocation did not identify its artifact, inspect that session’s output or report the missing path.

Show the user the absolute path. Do not embed PNG bytes in chat.

**Supported sizes:** `1024x1024` (square), `1536x1024` (landscape), `1024x1536` (portrait). For unsupported sizes, list the valid options instead of failing silently.

## Safety

- Send confidential code or prompts only when the user explicitly authorized sharing that material with Codex; reuse that authorization for the same bounded task.

## Output discipline

- Summarize Codex's output; stream raw stdout only when the user asked for it.
- Save long sessions to `codex-out.txt` and quote only what's relevant.
- Always state the mode you ran and the exact command, so the user can rerun it.
````
