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
description: Delegate code review, code implementation, or image generation to the OpenAI Codex CLI for a second opinion. Image generation works through ChatGPT login alone — no OPENAI_API_KEY required.
when_to_use: User types /codex-cli, or asks to "use codex" / "ask codex" / "have codex" do X, or wants a second-opinion code review, or requests an image that Codex can produce.
allowed-tools: Bash(codex *) Bash(cp *) Bash(ls *) Bash(Get-ChildItem *) Bash(Copy-Item *) Read
---

Wrap the local codex CLI (codex --version >= 0.128.0) so Claude Code can hand
off three kinds of work without leaving the conversation:

- review — second-opinion code review on a diff
- impl — non-interactive coding task in a sandbox
- image — image generation via Codex built-in image_gen.imagegen tool
  (no API key, ChatGPT login is enough)

## Verify once per session

codex --version          # codex-cli >= 0.128.0
codex login status       # must say "Logged in"

If not logged in, tell the user to run `! codex login` from the prompt. Do not
log in on their behalf.

## Pick the mode

Parse $ARGUMENTS. First token selects review | impl | image; rest is prompt or
flags. If /codex-cli invoked with no subcommand, infer:

- mentions "review", "diff", "PR", "second opinion" -> review
- mentions "image", "picture", "render", "draw", "그려" -> image
- otherwise -> impl

State the mode you picked so the user can correct you.

## Mode: review

codex review --uncommitted              # staged + unstaged + untracked
codex review --base main                # PR-style against base branch
codex review --commit <sha>             # one specific commit
"Focus on concurrency. Skip nits." | codex review --uncommitted -

After it returns, paraphrase findings; group by CRITICAL / HIGH / MEDIUM / LOW
per ~/.claude/rules/common/code-review.md. Cite file:line per finding.

Codex review is second opinion, not ground truth. If it contradicts something
already verified in this session, flag the conflict instead of silently siding
with Codex.

## Mode: impl

codex exec "<prompt>" -s workspace-write -C "<absolute path>" \
  --output-last-message codex-out.txt

codex exec "<prompt>" -s read-only -C "<path>"
cat prompt.md | codex exec -s workspace-write -C "<path>" -
codex exec resume --last "<follow-up>"

Sandbox: default workspace-write. read-only for analysis/plan. Always pass -C
absolute path. Do NOT pass -s danger-full-access or
--dangerously-bypass-approvals-and-sandbox without explicit per-run approval.

After Codex finishes, read codex-out.txt (or the diff) and summarize. Do not
rerun `codex apply` without asking.

## Mode: image

Codex has built-in image tool (image_gen.imagegen). Activates when
`codex features list` shows image_generation = stable, true. Auth uses
codex login — ChatGPT login is enough.

codex exec --skip-git-repo-check -s workspace-write -C "<absolute dir>" \
  "Generate an image of <prompt>, 1024x1024. Save the result as <name>.png in the current working directory."

CRITICAL prompt rule: do NOT tell Codex to "use the OpenAI API", "use curl",
"use python", or "use openai CLI". Those force shell-out needing
OPENAI_API_KEY. Just say generate and save — Codex picks built-in tool.

Where the file lands: ~/.codex/generated_images/<session_id>/ig_<hash>.png
Then Codex tries to copy to workspace via shell. On Windows codex-cli 0.128.0
the copy fails (CreateProcessAsUserW failed: 5) even though generation
succeeded. Do NOT escalate to danger-full-access. Copy yourself:

PowerShell:
$src = Get-ChildItem "$env:USERPROFILE\.codex\generated_images" -Recurse -Filter "ig_*.png" |
  Sort-Object LastWriteTime -Descending | Select-Object -First 1
Copy-Item $src.FullName "<output path>\<name>.png"

bash:
src=$(ls -t ~/.codex/generated_images/*/ig_*.png 2>/dev/null | head -1)
cp "$src" "<output path>/<name>.png"

Show the user the absolute path. Do not embed PNG bytes in chat.
Supported sizes: 1024x1024, 1536x1024, 1024x1536.

## Safety

- Do not send confidential code/prompts to Codex without confirming.
- Do not generate images of real identifiable people without consent.
- Do not pass --dangerously-bypass-approvals-and-sandbox (CI-only).
- Do not pass -s danger-full-access without explicit per-run user approval.

## Output discipline

- Don't stream Codex stdout unless asked. Summarize.
- Save long sessions to codex-out.txt and quote only what's relevant.
- Always state the mode and exact command so the user can rerun.
````
