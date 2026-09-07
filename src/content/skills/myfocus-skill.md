---
title: myfocus
summary: 여러 AI 코딩 도구(Claude Code · Codex · Gemini)를 오가며 일하다 "이제 뭘 하지" 싶을 때, 최근 대화 기록을 훑어 지금 가장 먼저 할 작업 하나를 짚어 준다. 직접 실행은 안 하고 알려만 줌.
summary_en: Juggling Claude Code, Codex, and Gemini? It scans your recent sessions and names the one task to tackle next — it advises, it doesn't act.
tags: [skill, claude-code, codex, gemini, focus, session-logs, prioritization]
source: https://github.com/cskwork/myfocus-skill
author: cskwork
license: MIT
order: 50
trigger: "/myfocus / what next / next task / 다음 작업 / 다음에 뭐 할까 / prioritize"
install: "git clone https://github.com/cskwork/myfocus-skill ~/myfocus-skill && ln -s ~/myfocus-skill ~/.claude/skills/myfocus"
hidden: true
---

## 한 줄

여러 AI 코딩 도구 사이를 옮겨 다니다 보면 "다음에 뭐 하지" 결정 피로가 쌓인다. `/myfocus`는 최근 대화 기록을 보고 지금 할 일 **하나**를 골라준다.

*EN: Bounced between coding tools all day? `/myfocus` looks at your recent sessions and names the single next thing to do.*

## 무엇을 하는가

1. 등록된 스캐너로 최근 N시간 세션 로그 수집 (Claude Code, Codex, Gemini 내장 · 추가 가능)
2. cwd(현재 작업 디렉토리)로 클러스터(비슷한 것끼리 묶기) → 토픽 추출
3. 우선순위 휴리스틱(경험적 규칙) 적용
4. **TOP PRIORITY 하나** + 2–4개 deferred(미뤄둘 후보) + context를 렌더(화면에 그려냄)
5. (`--save`) `~/.claude/myfocus/YYYY-MM-DD-HHMM.md`로 스냅샷

## 우선순위 신호

| Signal | 위치 | Δ |
|---|---|---|
| 블로커(진행을 막는 장애물) 키워드 (`blocked`, `stuck`, `fails`, `error 5xx`) in 마지막 assistant turn | last excerpt(마지막 발췌) | +3 |
| 시간 민감 (`today`, `tomorrow`, ISO date ≤3일, `deadline`, `ASAP`) | any excerpt | +3 |
| 마지막 assistant가 TODO나 미해결 질문으로 끝남 | last excerpt | +2 |
| 같은 토픽이 ≥3 세션에 등장 | 세션 수 | +2 |
| 같은 토픽이 ≥2 에이전트에 걸침 | agent diversity(에이전트 다양성) | +1 |
| "Done"/commit/PR-merge 신호 | last excerpt | −3 |
| 세션 1개 + 총 길이 <500자 | session count | −1 |

Tie-break(동점일 때 가르기): 가장 최근 `mtime`(파일 수정 시각) → 현재 스킬이 도는 에이전트.

## 사용

```bash
/myfocus                              # last 5h, all agents, 친절한 verbose
/myfocus --window 24h                 # 윈도우 확장
/myfocus --cwd $(pwd)                 # 현재 디렉토리 트리만
/myfocus --agents claude_code,codex   # 일부만
/myfocus --brief                      # 한 화면 terse
/myfocus --sections top,first_step    # 정확히 어떤 섹션만
/myfocus --save                       # 스냅샷
/myfocus --json                       # 스캐너 JSON raw (LLM 합성 스킵)
```

## 출력 (verbose default)

```
🎯 TOP PRIORITY: <one-sentence task title>

📝 What this task is
   <2-4 sentences in plain language; name the code/file/concept>

🔍 Why this is the top priority right now
   1. <signal>: <one sentence>
   2. <signal>: <one sentence>

🚶 First step you can take in the next 30 seconds
   1. <concrete action: cd path, command>

🔗 References · Session · Repo · Ticket · IDs

📦 Deferred candidates (do these later)

📊 Context
   Window · Sessions scanned · Cross-cutting theme
```

## 경계 (절대 금지)

- 작업 자체를 **실행하지 않음** — 가리키기만
- `/myfocus`로 소스 코드에 쓰지 않음 (스냅샷 파일만 예외)
- **단일 랩탑** 가정. 원격 fetch·크로스머신 집계 없음
- **외부 서비스 호출 없음** — 세션 내용이 머신을 벗어나지 않음

## 지원 에이전트 + 확장

| Agent | Module | 기본 세션 경로 |
|---|---|---|
| Claude Code | `scripts/scanners/claude_code.py` | `~/.claude/projects/<encoded-cwd>/*.jsonl` |
| Codex CLI | `scripts/scanners/codex.py` | `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl` |
| Gemini CLI | `scripts/scanners/gemini.py` | `~/.gemini/tmp/<alias>/logs.json` |

환경 변수로 override: `MYFOCUS_BASE_CLAUDE_CODE`, `MYFOCUS_BASE_CODEX`, `MYFOCUS_BASE_GEMINI`. `scripts/scanners/<name>.py` 추가하면 자동 등록.

## 설치 (Python 3.10+, stdlib only)

```bash
git clone https://github.com/cskwork/myfocus-skill ~/myfocus-skill
ln -s ~/myfocus-skill ~/.claude/skills/myfocus
```

## SKILL.md 본문 (복사용 — 핵심 발췌)

````markdown
---
name: myfocus
description: Rank the next task across recent local coding-agent sessions when the user asks for cross-session prioritization or invokes myfocus. A next-step question about the current task does not authorize scanning other sessions.

---


# MyFocus Skill

Surface the single highest-priority next task across recent coding-agent sessions — the one thing that deserves the user's next 30 minutes.

## Usage

```
/myfocus                                       # last 5h, all agents, verbose beginner-friendly output
/myfocus --window 24h                          # widen window
/myfocus --cwd $(pwd)                          # only sessions in current directory tree
/myfocus --agents claude_code,codex            # restrict to subset
/myfocus --brief                               # one-screen terse output (legacy minimal layout)
/myfocus --sections top_priority,first_step             # pick exactly which sections to render
/myfocus --list-agents                         # show what scanners are registered
/myfocus --save                                # snapshot to ~/.claude/myfocus/YYYY-MM-DD-HHMM.md
/myfocus --json                                # raw scanner JSON, skip LLM synthesis
```

## What this skill does

When invoked, perform these steps:

### 1. Run the scanner

Run from the repo root — walk up from this file to the directory holding `scripts/collect.py`, so the `scripts` package resolves:

```bash
python3 -m scripts.collect --window <window> [--cwd <cwd>] [--agents <list>] [--max-files-per-agent N] [--max-chars-per-session N]
```

The scanner takes those flags plus `--list-agents`; forward only those. `--brief`, `--sections`, `--save`, and `--json` are rendering flags you apply yourself after the scan — the scanner exits 2 on an unrecognized flag.

If `--json` was passed, print the script's stdout verbatim and stop.

### 2. Parse and cluster

Parse the scanner's JSON. Group `sessions[]` by `cwd` (treat `null` cwd as its own bucket). Within each cwd, infer the dominant topic from the most recent `user_excerpts` and `assistant_excerpts`. Done when every entry in `sessions[]` sits in exactly one topic.

### 3. Apply the priority heuristic

For each topic, compute a score:

| Signal | Where to look | Δ |
|---|---|---|
| Blocker keyword in latest assistant turn (`blocked`, `stuck`, `fails`, `cannot`, `error 5xx`, plus user-language equivalents the user themselves used in transcripts) | `assistant_excerpts[-1]` | +3 |
| Time-sensitive (`today`, `tomorrow`, ISO date within 3 days, `deadline`, `ASAP`, plus user-language equivalents) | any excerpt | +3 |
| Last assistant turn ends with TODO or unresolved question | `assistant_excerpts[-1]` | +2 |
| Same topic appears in ≥3 sessions in this window | session count per topic | +2 |
| Same topic appears across ≥2 different agents | agent diversity per topic | +1 |
| "Done"/commit/PR-merge signal in latest assistant turn | `assistant_excerpts[-1]` | −3 |
| Only 1 session, total length <500 chars | session count + char count | −1 |

Score every topic; the highest score becomes `top_priority`. Tie-break: most recent `mtime`, then the agent the skill is running inside.

### 4. Render — composable sections

The output is a sequence of **named sections**. Each section is independent: render any subset, in any order.

#### Section catalog (built-in)

| name | always-on for `/myfocus`? | content |
|---|---|---|
| `top_priority` | yes | One-sentence title of the chosen task |
| `description` | verbose default only | 2–4 sentence beginner-friendly explanation of what the task actually is, in plain language. Names the code/file/concept and why it exists. |
| `why_now` | yes | Numbered list of the heuristic signals that made this win, with each signal explained in one sentence |
| `first_step` | yes | Numbered, copy-pasteable concrete actions. Include `cd`, file paths, exact commands |
| `references` | verbose default only | Source session id, agent, repo path, ticket/issue refs, any IDs mentioned in transcripts |
| `deferred` | yes | Bulleted list with one-liner reasons per item |
| `context` | yes | Window, session counts per agent, cross-cutting theme |
| `commands` | optional | Suggested follow-up commands the user might want next (e.g., `/myfocus --save`, `git log --since`) |

Add a new section by adding a row here, defining its renderer below, and accepting its name under `--sections`. Contributors should send PRs that update only this catalog + a single Markdown template; no Python code change is required to add a section.

#### Modes

- **Default (no flag)**: emits `top_priority`, `description`, `why_now`, `first_step`, `references`, `deferred`, `context` — the beginner-friendly verbose layout.
- **`--brief`**: emits `top_priority`, `why_now`, `first_step`, `deferred`, `context` — terse single-screen output for power users.
- **`--sections a,b,c`**: emits exactly those, in that order. Overrides `--brief` and the default.

#### Verbose default — beginner-friendly template

Render exactly this layout — plain Markdown, section markers the only emoji:

```
🎯 TOP PRIORITY: <one-sentence task title>

📝 What this task is
   <2-4 sentences in plain language. Name the code/file/concept; say what
   problem it addresses. Avoid acronyms unless you immediately expand them.
   Write for someone seeing the codebase for the first time.>

🔍 Why this is the top priority right now
   1. <signal name>: <one sentence — what we observed and why it counted>
   2. <signal name>: <one sentence>
   3. <signal name>: <one sentence>
   (Include only the signals that actually fired. Skip those that didn't.)

🚶 First step you can take in the next 30 seconds
   1. <concrete action: cd path, command, or specific decision>
   2. <next action>
   3. <next action>
   (Use real shell commands the user can paste. Show file paths with line
   numbers when relevant.)

🔗 References
   · Session: <agent> / <session_id>
   · Repo: <cwd>
   · Ticket/issue: <if mentioned in transcripts>
   · IDs / artifacts: <any concrete identifiers from transcripts>

📦 Deferred candidates (do these later)
   · <topic title> — <one-liner: why it can wait>
   · <topic title> — <one-liner>
   · <topic title> — <one-liner>

📊 Context
   Window: last <window>
   Sessions scanned: <agent>=N, <agent>=M, ...
   Cross-cutting theme: <only if there is one — otherwise omit this line>
```

#### Brief template (`--brief`)

```
TOP PRIORITY
  <one-sentence task title>
  Why  <one sentence: which signals made this win>
  First step  <one concrete action — file path, command, or first sub-decision>

DEFERRED
  · <one-liner>
  · <one-liner>

CONTEXT
  Window: last <window>  ·  Sessions: <agent>=N, <agent>=M, ...
```

#### Edge cases

- If fewer than 2 distinct deferrable topics exist, omit the `deferred` section.
- If `top_priority` was forced (only one viable topic), still include `why_now` with a single line saying "Only one in-flight topic in this window — no comparison needed."
- If the scanner returned zero sessions, output:

```
No activity in last <window>. Try /myfocus --window 24h to widen the search.
```

### 5. Save snapshot (if `--save`)

Create `~/.claude/myfocus/` if missing. Write the rendered markdown to `~/.claude/myfocus/YYYY-MM-DD-HHMM.md`. Print the absolute path on a final line.

## Boundaries

- **Never execute the task itself.** The skill only points; the user (or the next skill invocation) acts.
- **Never write to source code** as part of `/myfocus`. The only write target is the optional snapshot file.
- **Single laptop only.** No remote fetching, no cross-machine aggregation.
- **No external uploads.** Do not send session contents to another service. Use only the bounded scanner output needed for synthesis and redact secrets/personal data from excerpts and errors; do not promise the active model itself is local.

## Failure modes

| Symptom | Action |
|---|---|
| `collect.py` exits non-zero | Report the relevant error with secrets redacted; do not invent a ranking. |
| Scanner JSON parse fails | Surface the parse error and the first 200 chars of stdout. |
| All agents return zero sessions | Use the "No activity" message above. |
| `--cwd` filter removes everything | Report no sessions in the requested scope; do not broaden the scan unless the user asks. |
| Unknown agent in `--agents` | The scanner records it in `errors[]`. Mention this once in the report's CONTEXT section. |
````
