---
title: clone-personalize
summary: 남이 만든 AI 앱(GitHub 주소나 웹사이트)을 내 컴퓨터로 가져와, 돈 내야 하는 AI 호출을 내가 이미 쓰는 도구(Claude Code, Codex, Gemini)로 바꿔서 API 키 없이 돌려준다.
summary_en: Pull any AI app onto your machine and rewire its paid API calls to the CLI tools you already pay for, so it runs with no API keys.
tags: [skill, claude-code, codex, gemini, oauth, personalize]
source: https://github.com/cskwork/clone-personalize
author: cskwork
license: 원본 레포 참조
order: 10
hidden: true
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
description: Clones an AI product — GitHub repo or live site — into a local fork and adapts selected AI API calls to verified installed CLIs or authorized browser bridges. Use when the user gives a repo URL plus a CLI substitution spec, wants a local clone of a live AI site, wants API-key dependencies stripped from an AI app, or says "personalize", "OAuth-replace", or "make it use my logged-in account".
---


# clone-personalize

## Purpose

Take any third-party AI product and produce a locally-running, personally-authenticated fork of it. Two source modes:

1. **Repo mode** (default) — source is a Git repository. Clone it, then rewire its AI calls.
2. **Site-clone mode** — source is only a live website (no public source). Reverse-engineer the UX/functionality from the live site and re-implement it locally end-to-end.

Replace the calls included in the user's mapping. A requested full replacement requires an inventory with every call replaced or a documented gap; do not claim the fork is API-key-free until that scope is verified. Preserve unrelated services and account boundaries.

## Use When

- User gives a GitHub URL + a personalization spec ("make it use Gemini for X, Codex for Y, Claude Code for Z")
- User gives only a live site URL and wants a local clone with full functionality
- User wants to strip API-key dependencies from an AI app and route through CLI/browser instead
- User says "personalize", "OAuth-replace", "make it use my logged-in account"

## Do Not Use When

- Source is a non-AI app — just use `git clone` directly
- User wants to use their own API keys (no personalization needed)
- Target requires a paid CLI the user does not have installed (verify first)
- A skill purpose-built for that specific product already exists

## Contract

- **Never invent CLI commands** — verify `claude --help`, `codex --help`, `gemini --help` (or `which`) before mapping. If a CLI is missing, report it and ask before substituting.
- **Never hardcode secrets** — the whole point is to remove them. If the original needs an API key, the rewrite must remove the env var read, not paper over it.
- **Preserve original UX** — the user wants the same product, just on their accounts. Do not redesign UI or rename features.
- **Document every substitution** in `PERSONALIZATION.md` at the workspace root: original call site → CLI replacement → invocation contract.
- **Surface gaps, never drop them silently** — in either mode, any feature that cannot be reverse-engineered or substituted with confidence is listed as a known gap in `PERSONALIZATION.md`. Silent feature loss is the worst failure mode here.

## Capability Routing

Candidate routes to verify (the user's `--map` takes precedence; a CLI name does not prove a modality is supported):

| Capability | Default CLI | Rationale |
|---|---|---|
| Chat / text generation / reasoning | `claude` (Claude Code) | Verify task/output support and authorization |
| Code generation / structured edits | `codex` (Codex CLI) | Verify the installed execution contract |
| Image generation | `codex` with image mode, or browser bridge | Codex CLI image gen; fall back to logged-in web UI via `mcp__claude-in-chrome__*` |
| Video generation | `gemini` (Gemini CLI / Gemini Omni) | Gemini handles multimodal output |
| Audio / TTS / STT | `gemini` or browser bridge | Gemini multimodal; else logged-in service |
| Web search / grounding | `gemini` (built-in grounding) or WebSearch | |
| Embeddings | local model (sentence-transformers) or `gemini` | Avoid paid embedding APIs |
| OAuth-gated SaaS (Drive, Notion, Slack…) | `mcp__claude-in-chrome__*` bridge | Reuses the user's logged-in browser session |

When the user provides a `--map` argument, it takes precedence. When the original product hardcodes a vendor (e.g. "must be GPT-4o"), substitute the **default-routed CLI** for that capability and note the swap in `PERSONALIZATION.md`.

## Workflow

**Step 0 — Verify installed CLIs.**
Run `which claude codex gemini` and capture versions. Check only required routes. If one is missing, continue unaffected inventory/work and ask only if an alternative changes the agreed mapping.

**Step 1 — Resolve source.**
- Repo URL → `git clone` into `--out` (default: `./<repo-name>-personal/`).
- Site URL only → create `./<host>-clone/`, fetch the landing page and primary user-facing routes (`ctx_fetch_and_index` if the harness exposes it, else the harness's web-fetch tool), extract: stack hints (framework, build tool), feature inventory (every interactive element), data flow (what the page sends to which endpoints).

**Step 2 — Inventory AI call sites.**
Repo mode: grep for vendor SDK imports and HTTP calls — `openai`, `anthropic`, `@google/generative-ai`, `replicate`, `runwayml`, `elevenlabs`, `fal-ai`, `stability`, `cohere`, raw `fetch('https://api.*')`. Build a table: file:line → vendor → capability → input/output shape. The inventory is complete when every grep hit is either a row in the table or marked non-AI.

Site-clone mode: derive the AI call inventory from the feature inventory — every "generate" / "summarize" / "create" affordance maps to one capability.

**Step 3 — Plan substitutions.**
For each AI call site, pick a CLI per `## Capability Routing` above. Write the plan to `PERSONALIZATION.md` *before* editing — let the user catch wrong mappings cheaply.

**Step 4 — Build a thin CLI-bridge layer.**
Create `lib/ai-cli/` (or the project's idiomatic location) with one adapter per CLI: `claude.ts`, `codex.ts`, `gemini.ts`. Each adapter:
- Spawns the CLI as a subprocess (`child_process.spawn` / `subprocess.run`)
- Streams stdin → CLI, captures stdout
- Normalizes output to the shape the original SDK returned
- Handles auth-failure / quota exhaustion by surfacing a clear error, not silent fallback

For browser bridges, verify a runtime-accessible interface exists. Host-agent MCP tools are not automatically callable from the forked app. Do not claim integration merely because the current agent can click the website; implement a permitted adapter or document the missing runtime bridge.

**Step 5 — Rewire call sites.**
Replace vendor SDK imports with the bridge adapter. Keep function signatures stable so call-site changes are mechanical. Remove env-var reads for vendor API keys. Update `.env.example` to drop the removed keys. Done when every row of the Step 2 inventory is rewired or listed as a known gap, and re-running the Step 2 grep finds no vendor SDK import outside `lib/ai-cli/`.

**Step 6 — Site-clone reconstruction (site mode only).**
After Steps 2-5 cover the AI logic, reconstruct the UX: scaffold the same framework the site appears to use (Next.js / Vite / SvelteKit / etc.), recreate the routes/pages from the feature inventory, wire the AI bridges in. Aim for behavioral parity, not pixel parity, unless the user asks for the latter.

**Step 7 — Verify locally.**
Run the app's standard dev command (`npm run dev` / `pnpm dev` / `python manage.py runserver` / etc.). For each substituted capability, exercise it once and capture: invocation log, CLI exit code, output sample. Record in `PERSONALIZATION.md` under "Verification".

**Step 8 — Report.**
Final report to the user:
- Where the workspace lives
- Substitution table (call site → CLI)
- Verified capabilities
- Known gaps (especially in site-clone mode)
- How to run the app

## Required Artifacts

At workspace root:
- `PERSONALIZATION.md` — substitution plan, capability map, verification log, known gaps
- `lib/ai-cli/` (or idiomatic equivalent) — CLI adapter modules
- `.env.example` — pruned to remove vendor API keys
- Original source preserved in git history (do not rewrite history of the clone)

## Execution Policy

- **One adapter per CLI, not per call site.** Reuse beats sprawl.
- **Repo mode:** confine edits to the agreed backend substitution and required wiring. **Site mode:** implement only the agreed reconstruction scope. Preserve unrelated work in both.
- **Match existing style** of the cloned repo (formatter, lint config, naming).
- **Browser bridge is a fallback**, not a default. Prefer a real CLI when one exists for the capability.
- **Respect rate limits and authorization.** A logged-in account does not authorize uploads, messages, publishing, or unbounded spending. Prefer sequential capability checks and bound retries to the task.

## Reference Example

Input: `clone https://github.com/HKUDS/ViMax but make it use gemini-omni for video, codex for image gen, claude for chat. Use installed CLIs and logged-in browser sessions.`

Resolution:
- Source mode: repo
- Map: `chat=claude, image=codex, video=gemini-omni`
- Workspace: `./ViMax-personal/`
- Adapters: `lib/ai-cli/{claude,codex,gemini}.{ts,py}` (match repo language)
- Browser bridge: any OAuth-gated upload/share step
- PERSONALIZATION.md documents every swap
````
