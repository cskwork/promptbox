---
title: clone-personalize
summary: 남이 만든 AI 앱(GitHub 주소나 웹사이트)을 내 컴퓨터로 가져와, 돈 내야 하는 AI 호출을 내가 이미 쓰는 도구(Claude Code, Codex, Gemini)로 바꿔서 API 키 없이 돌려준다.
summary_en: Pull any AI app onto your machine and rewire its paid API calls to the CLI tools you already pay for, so it runs with no API keys.
tags: [skill, claude-code, codex, gemini, oauth, personalize]
source: https://github.com/cskwork/clone-personalize
author: cskwork
license: 원본 레포 참조
order: 10
trigger: "clone X and make it use my CLIs / personalize this AI app / OAuth-replace this app / GitHub URL + CLI substitution"
install: "git clone https://github.com/cskwork/clone-personalize ~/.claude/skills/clone-personalize"
---

## 핵심 아이디어

남이 만든 AI 앱을 내 컴퓨터에서 돌리되, 돈을 내야 하는 AI 호출(OpenAI, Anthropic, Google AI Studio, Replicate, ElevenLabs 등)을 내가 이미 로그인/구독해 둔 명령줄 도구(`claude`, `codex`, `gemini`)로 바꿔 끼운다. 그래서 결과물은 **API 키 없이** 돌아간다.

*EN: Run someone else's AI app on your own accounts — no per-call API bills.*

두 가지 입력 모드:

- **Repo mode** — Git 레포 URL → `git clone` 후 AI 콜 재배선
- **Site-clone mode** — 라이브 사이트만 있을 때 → UX/기능을 역설계해서 로컬로 재구현

## 능력 라우팅 기본 표

| Capability | 기본 CLI | 이유 |
|---|---|---|
| Chat / 추론 | `claude` (Claude Code) | 가장 강한 reasoning(추론), 세션 호스트 |
| Code 생성 | `codex` (Codex CLI) | 코드 특화, 별도 quota(사용 한도) |
| Image 생성 | `codex` (image mode) 또는 브라우저 브릿지 | |
| Video 생성 | `gemini` (Gemini Omni) | 멀티모달 출력 |
| Audio / TTS / STT | `gemini` 또는 브라우저 브릿지 | |
| Web search / grounding | `gemini` (내장 grounding(검색 근거 연결)) | |
| Embeddings(의미를 숫자 벡터로 변환) | local model 또는 `gemini` | paid embedding API 회피 |
| OAuth(제3자 로그인 인증 방식)-gated SaaS (Drive, Notion, Slack) | `mcp__claude-in-chrome__*` | 로그인 브라우저 재사용 |

## 워크플로우 8단계 요약

1. 설치된 CLI 검증 (`which claude codex gemini`)
2. 소스 해결 (clone 또는 site 추출)
3. AI 콜 사이트 인벤토리 (SDK import 부분을 grep(텍스트 검색)으로 찾기)
4. 치환 계획을 `PERSONALIZATION.md`에 먼저 기록
5. `lib/ai-cli/` 어댑터 레이어(CLI를 감싸는 변환 모듈) 구축 (`claude.ts`, `codex.ts`, `gemini.ts`)
6. 콜 사이트 재배선 + `.env.example`에서 vendor(외부 AI 서비스 제공사) 키 제거
7. (site 모드) UX 재구성
8. 로컬에서 각 능력 1회씩 검증, 결과를 `PERSONALIZATION.md`에 기록

## 절대 하지 말 것

- CLI 명령어 가공 (`--help`로 먼저 검증)
- 시크릿 하드코딩 (스킬의 존재 이유와 정반대)
- 원본 UX 재디자인 (능력 치환만 수행)
- 사이트 모드에서 재구성 불가능한 기능을 조용히 드롭

## 전체 SKILL.md (복사용)

````markdown
---
name: clone-personalize
description: Clone an AI product (GitHub repo or live site) into a local workspace and personalize every paid/API-keyed AI backend so it runs on the user's installed CLIs (Claude Code, Codex, Gemini) and logged-in browser sessions instead. Use when the user says "clone X and make it use my CLIs", "personalize this AI app to my accounts", "OAuth-replace this app", or gives a GitHub/site URL plus a list of CLI substitutions.
argument-hint: "<source-url> [--site-clone] [--map chat=claude,image=codex,video=gemini-omni] [--out <dir>]"
level: 3
---

<Purpose>
Take any third-party AI product and produce a locally-running, personally-authenticated fork of it. Two source modes:

1. **Repo mode** (default) — source is a Git repository. Clone it, then rewire its AI calls.
2. **Site-clone mode** — source is only a live website (no public source). Reverse-engineer the UX/functionality from the live site and re-implement it locally end-to-end.

In both modes, every paid AI API call (OpenAI, Anthropic, Google AI Studio, Replicate, third-party SaaS) is replaced with one of the user's installed CLIs or a browser-session bridge. The result runs without API keys.
</Purpose>

<Use_When>
- User gives a GitHub URL + a personalization spec ("make it use Gemini for X, Codex for Y, Claude Code for Z")
- User gives only a live site URL and wants a local clone with full functionality
- User wants to strip API-key dependencies from an AI app and route through CLI/browser instead
- User says "personalize", "OAuth-replace", "make it use my logged-in account"
</Use_When>

<Do_Not_Use_When>
- Source is a non-AI app — just use `git clone` directly
- User wants to use their own API keys (no personalization needed)
- Target requires a paid CLI the user does not have installed (verify first)
- A skill purpose-built for that specific product already exists
</Do_Not_Use_When>

<Contract>
- **Never invent CLI commands** — verify `claude --help`, `codex --help`, `gemini --help` (or `which`) before mapping. If a CLI is missing, report it and ask before substituting.
- **Never hardcode secrets** — the whole point is to remove them. If the original needs an API key, the rewrite must remove the env var read, not paper over it.
- **Preserve original UX** — the user wants the same product, just on their accounts. Do not redesign UI or rename features.
- **Document every substitution** in `PERSONALIZATION.md` at the workspace root: original call site → CLI replacement → invocation contract.
- **Failure mode for site-clone**: if a feature cannot be reverse-engineered with confidence, list it as a known gap rather than silently dropping it.
</Contract>

<Workflow>

**Step 0 — Verify installed CLIs.** `which claude codex gemini`, capture versions. If missing, stop and ask.

**Step 1 — Resolve source.** Repo URL → `git clone` into `--out`. Site URL only → fetch landing + primary routes, extract stack hints / feature inventory / data flow.

**Step 2 — Inventory AI call sites.** Grep for vendor SDKs (`openai`, `anthropic`, `@google/generative-ai`, `replicate`, `runwayml`, `elevenlabs`, `fal-ai`, `stability`, `cohere`, raw `fetch('https://api.*')`). Build a file:line → vendor → capability → IO-shape table.

**Step 3 — Plan substitutions.** Write to `PERSONALIZATION.md` BEFORE editing.

**Step 4 — Build CLI-bridge layer.** `lib/ai-cli/{claude,codex,gemini}.{ts,py}`. Each adapter spawns the CLI as subprocess, streams IO, normalizes output to the SDK's original shape.

**Step 5 — Rewire call sites.** Replace SDK imports with bridge adapters. Keep signatures stable. Remove vendor env vars from `.env.example`.

**Step 6 — Site-clone reconstruction (site mode only).** Scaffold same framework, recreate routes, wire bridges. Behavioral parity, not pixel parity (unless asked).

**Step 7 — Verify locally.** Run dev command, exercise each substituted capability once, record in `PERSONALIZATION.md` → Verification.

**Step 8 — Report.** Workspace path, substitution table, verified capabilities, known gaps, how to run.

</Workflow>

<Required_Artifacts>
- `PERSONALIZATION.md` (substitution plan, capability map, verification log, gaps)
- `lib/ai-cli/` adapter modules
- `.env.example` pruned
- Original source preserved in git history
</Required_Artifacts>
````
