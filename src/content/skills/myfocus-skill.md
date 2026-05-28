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
---

## 한 줄

여러 AI 코딩 도구 사이를 옮겨 다니다 보면 "다음에 뭐 하지" 결정 피로가 쌓인다. `/myfocus`는 최근 대화 기록을 보고 지금 할 일 **하나**를 골라준다.

*EN: Bounced between coding tools all day? `/myfocus` looks at your recent sessions and names the single next thing to do.*

## 무엇을 하는가

1. 등록된 스캐너로 최근 N시간 세션 로그 수집 (Claude Code, Codex, Gemini 내장 · 추가 가능)
2. cwd로 클러스터 → 토픽 추출
3. 우선순위 휴리스틱 적용
4. **TOP PRIORITY 하나** + 2–4개 deferred + context를 렌더
5. (`--save`) `~/.claude/myfocus/YYYY-MM-DD-HHMM.md`로 스냅샷

## 우선순위 신호

| Signal | 위치 | Δ |
|---|---|---|
| 블로커 키워드 (`blocked`, `stuck`, `fails`, `error 5xx`) in 마지막 assistant turn | last excerpt | +3 |
| 시간 민감 (`today`, `tomorrow`, ISO date ≤3일, `deadline`, `ASAP`) | any excerpt | +3 |
| 마지막 assistant가 TODO나 미해결 질문으로 끝남 | last excerpt | +2 |
| 같은 토픽이 ≥3 세션에 등장 | 세션 수 | +2 |
| 같은 토픽이 ≥2 에이전트에 걸침 | agent diversity | +1 |
| "Done"/commit/PR-merge 신호 | last excerpt | −3 |
| 세션 1개 + 총 길이 <500자 | session count | −1 |

Tie-break: 가장 최근 `mtime` → 현재 스킬이 도는 에이전트.

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
description: Use when the user asks what to work on next after context-switching across coding agents. Scans recent session logs from any registered agent (bundled, Claude Code / Codex / Gemini; extensible via scripts/scanners/) and surfaces the single highest-priority next task with one concrete entry-point. Triggers on "/myfocus", "myfocus", "what next", "next task", "다음 작업", "prioritize".
argument-hint: "[--window 5h] [--cwd PATH] [--agents claude_code,codex,gemini] [--sections LIST] [--brief] [--list-agents] [--save] [--json]"
level: 2
---

# MyFocus Skill

Surface the single highest-priority next task across recent coding-agent sessions.
The skill never executes the task — it just points you to the one thing that
deserves your next 30 minutes.

## What this skill does (when invoked)

1. Run the scanner:
   python3 -m scripts.collect --window <window> [--cwd <cwd>] [--agents <list>]
   Forward whatever flags the user passed. If --json was passed, print stdout
   verbatim and stop.

2. Parse and cluster: Group sessions[] by cwd. Within each cwd, infer the
   dominant topic from the most recent user_excerpts and assistant_excerpts.

3. Apply the priority heuristic (see signal table above).

4. Render the composable sections (top_priority, description, why_now,
   first_step, references, deferred, context, commands).

5. Save snapshot if --save → ~/.claude/myfocus/YYYY-MM-DD-HHMM.md

## Boundaries
- Never execute the task itself.
- Never write to source code (only the optional snapshot file).
- Single laptop only. No remote fetching.
- No external services. All processing is local.

## Failure modes
- collect.py exits non-zero → print stderr verbatim, do not synthesize.
- Scanner JSON parse fails → surface error + first 200 chars of stdout.
- All agents return zero sessions → "No activity in last <window>".
- Unknown agent in --agents → scanner records in errors[]; mention once.

(Full SKILL.md with heuristic table, section catalog, templates:
https://github.com/cskwork/myfocus-skill/blob/main/SKILL.md)
````
