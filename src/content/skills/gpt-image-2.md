---
title: gpt-image-2
summary: "이미 결제 중인 ChatGPT Plus / Pro 구독만으로 GPT Image 2 이미지를 새로 만들거나 편집 — OpenAI API 키 발급도, 이미지 장당 추가 결제도 필요 없다."
summary_en: "Generate and edit images via your existing ChatGPT Plus or Pro subscription — no API key needed, no per-image charges."
tags: [skill, codex, image-generation, chatgpt, gpt-image-2, agentspace]
source: https://github.com/agentspace-so/agent-skills/tree/main/gpt-image-2
author: agentspace.so
license: MIT
order: 35
trigger: "use gpt image 2 / use gpt-image-2 / use ChatGPT Images 2.0 / image 2 this / 첨부 이미지 remix·edit·restyle"
install: "npx skills add https://github.com/agentspace-so/agent-skills --skill gpt-image-2"
---

## 한 줄

유료 이미지 서비스를 따로 결제하거나 API 키를 발급받지 않고, 이미 결제 중인 **ChatGPT 구독**만으로 GPT Image 2를 부른다. `codex exec --enable image_generation`이 핵심.

*EN: No separate image service or API key — just the ChatGPT subscription you already have.*

## 언제 쓰는가

사용자가 명시적으로 "GPT Image 2 / image 2 / ChatGPT Images 2.0"이라고 지정했을 때만. 평범한 "이미지 만들어줘"에는 자동 발동 금지 — 다른 라우트(DALL·E, Midjourney, HTML mockup)로 silently fallback도 금지.

## 함정

- `codex-cli 0.111.0+`에서 `--enable image_generation` 플래그 **필수** (기본 off).
- `--ephemeral`은 **쓰면 안 됨** — ephemeral 세션은 rollout이 안 남아서 base64 이미지 페이로드를 추출할 곳이 사라진다.
- ChatGPT 구독에 image-generation 권한이 없으면 exit code 7 (skill이 capability를 부여하는 게 아니라 노출만).

## 원문 SKILL.md

````markdown
---
name: gpt-image-2
displayName: "🪞 GPT Image 2 — Image Generation via Your ChatGPT Subscription"
description: >
  Generate images with GPT Image 2 (ChatGPT Images 2.0) inside Claude Code,
  using your existing ChatGPT Plus or Pro subscription — no separate OpenAI
  access, no per-image billing. Supports text-to-image, image-to-image
  editing, style transfer, and multi-reference composition via the local
  Codex CLI. Triggers on "gpt image 2", "gpt-image-2", "ChatGPT Images 2.0",
  "image 2", or any explicit ask to generate or edit an image through the
  user's ChatGPT plan.
emoji: "🪞"
homepage: https://agentspace.so
license: MIT
---

# 🪞 GPT Image 2 — Image Generation via Your ChatGPT Subscription

Generate images with **GPT Image 2** (ChatGPT Images 2.0) inside your agent, using your existing ChatGPT Plus or Pro subscription — **no separate OpenAI access, no Fal or Replicate tokens, no per-image billing.**

Text-to-image, image-to-image editing, style transfer, and multi-reference composition. Runs entirely through the local `codex` CLI you're already logged into.

## When to trigger

Trigger when the user explicitly asks for GPT Image 2 via their ChatGPT subscription, for example:

- "use GPT Image 2" / "use gpt-image-2" / "use ChatGPT Images 2.0"
- "use Image 2" / "image 2 this"
- attached a reference image and asked to remix / edit / restyle it

Do **not** auto-trigger for a plain "generate an image" request if the user didn't specify this route. If they did specify it, do not silently fall back to HTML mockups, screenshots, or a different image model.

## How to invoke

A single bash script handles everything: runs `codex exec` with the right flags, then decodes the generated image from the persisted session rollout.

**Text-to-image:**

```bash
bash scripts/gen.sh \
  --prompt "<user's raw prompt>" \
  --out <absolute/path/to/output.png>
```

**Image-to-image** (reference flag is repeatable for multi-reference composition):

```bash
bash scripts/gen.sh \
  --prompt "<user's raw prompt, e.g. 'repaint in watercolor'>" \
  --ref /absolute/path/to/reference.png \
  --out <absolute/path/to/output.png>
```

Optional: `--timeout-sec 300` (default 300).

## Default behavior

- **Pass the user's prompt through raw.** Do not translate, polish, or add style modifiers unless the user asked for it.
- **Choose the output path.** Default to `./image-<YYYYMMDD-HHMMSS>.png` in the current working directory if the user didn't specify.
- **Deliver the image.** After the script succeeds, display / attach the output file. Do not stop at "done, see path X".
- **Text-heavy layouts are fine.** Image 2 handles infographics and timeline prompts well. Do not preemptively warn just because a prompt has a lot of text.

## Hard constraints

- Do not switch routes without permission. If the user said "use GPT Image 2", do not substitute DALL·E, Midjourney, an HTML mockup, or a manual screenshot workflow.
- Do not rewrite the prompt unless asked.
- Do not imply this skill works without a local `codex` login and a valid ChatGPT subscription with image-generation entitlement.

## Prerequisites

1. `codex` CLI installed — `brew install codex` or see [openai/codex](https://github.com/openai/codex).
2. Logged in with a ChatGPT plan that includes Image 2 — `codex login`.
3. `python3` on PATH.

## Exit codes

| code | meaning |
|------|---------|
| 0    | success — output path printed on stdout |
| 2    | bad args |
| 3    | `codex` or `python3` CLI missing |
| 4    | `--ref` file does not exist |
| 5    | `codex exec` failed (auth? network? model?) |
| 6    | no new session file detected |
| 7    | imagegen did not produce an image payload (feature not enabled, quota, or capability refused) |

## How it works

The `codex` CLI reuses the logged-in ChatGPT session and exposes an `imagegen` tool (gated behind the `image_generation` feature flag). The script:

1. snapshots `~/.codex/sessions/` before the run
2. runs `codex exec --enable image_generation --sandbox read-only ...` (with `-i <file>` for each reference image)
3. diffs the sessions directory, then scans every new rollout JSONL for a base64 image payload
4. decodes the largest matching blob and writes it to `--out`

Two non-obvious flags other wrappers get wrong on codex-cli 0.111.0+:

- `--enable image_generation` is **required**; the feature is still under-development and off by default.
- `--ephemeral` **must not** be used — ephemeral sessions aren't persisted, so the image payload has nowhere to live.
````
