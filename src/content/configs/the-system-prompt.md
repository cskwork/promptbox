---
title: THE-SYSTEM-PROMPT — 모든 코딩 에이전트의 운영 계약
summary: "코딩 에이전트마다 똑같이 걸어 두는 운영 규칙 한 파일. 세 가지 서두 규칙과 explore→report 7단계 루프로 되어 있고, 사람이 멈추는 지점은 계획 승인 하나뿐이다. 하네스 기본 프롬프트 위에 얹히도록 써서, 기본 동작을 실제로 바꾸는 규칙만 담았다."
summary_en: "One AGENTS.md that every coding agent reads: three standing rules and a seven-step loop from explore to report, with plan approval as the only human gate. Written to sit on top of a harness prompt, so it carries only the rules that change default behaviour."
tags: [config, agents-md, system-prompt, agent-rules, claude-code, codex, gemini, opencode, pi]
source: https://github.com/cskwork/THE-SYSTEM-PROMPT
author: cskwork
order: 5
target_file: "~/.agents/AGENTS.md → 심링크: ~/.claude/CLAUDE.md · ~/.codex/AGENTS.md · ~/.gemini/GEMINI.md · ~/.config/opencode/AGENTS.md · ~/.pi/agent/AGENTS.md"
tools: [Claude Code, Codex CLI, Gemini CLI, OpenCode, Pi]
---

## 한 줄

내가 쓰는 모든 코딩 에이전트에 똑같이 걸어 두는 운영 계약. 정본은
[`cskwork/THE-SYSTEM-PROMPT`](https://github.com/cskwork/THE-SYSTEM-PROMPT)이고, 랜딩 페이지
<https://cskwork.github.io/THE-SYSTEM-PROMPT/>(한국어판 `/ko.html`)에서 7단계를 가상의 버그 하나로
따라가 볼 수 있다.

## 무엇을 하는가

- **서두 세 규칙** — 태도(승인 뒤에는 데이터 손실·공개 API·보안·마이그레이션만 묻는다, 위임은 새 컨텍스트
  서브에이전트에), 주장보다 증거(문서도 내 말도 낡는다, 돌아가는 코드로 확인하고 어긋나면 반박한다),
  도메인 규칙 파일.
- **7단계 루프** — Explore → Intent → Options → Plan → Execute → Evidence → Report. Intent가 Options
  앞에 온다: 목표를 확정한 뒤에 전략 3안을 낸다. **계획 승인이 사람이 개입하는 마지막 지점**이고
  그 뒤로는 에이전트가 혼자 끝까지 간다.
- **하네스 프롬프트를 대체하지 않는다.** Claude Code 등 기본 시스템 프롬프트와 겹치는 일반론은 뺐고,
  기본 동작을 실제로 바꾸는 규칙만 남겼다.

## 설치

정본 한 벌을 `~/.agents/AGENTS.md`에 두고 각 에이전트 설정 경로에 심링크한다.

```bash
mkdir -p ~/.agents
curl -fsSL https://raw.githubusercontent.com/cskwork/THE-SYSTEM-PROMPT/main/AGENTS.md -o ~/.agents/AGENTS.md

ln -sfn ~/.agents/AGENTS.md ~/.claude/CLAUDE.md
ln -sfn ~/.agents/AGENTS.md ~/.codex/AGENTS.md
ln -sfn ~/.agents/AGENTS.md ~/.gemini/GEMINI.md            # Gemini CLI는 GEMINI.md를 읽는다
ln -sfn ~/.agents/AGENTS.md ~/.config/opencode/AGENTS.md
ln -sfn ~/.agents/AGENTS.md ~/.pi/agent/AGENTS.md
```

## 함정

- 대상이 심링크가 아니라 일반 파일이면 먼저 타임스탬프 백업으로 옮긴다. Windows는 심링크에 개발자 모드가
  필요하니 복사하되, 사본은 원본과 어긋난다.
- 본문이 `brainstorming`, `writing-plans` 스킬과 `~/.agents/rules/rules.md`를 부른다. 없으면 그 문장을
  지운다. `rules.md`는 "있을 때" 읽도록 되어 있어 없어도 오류는 나지 않는다.
- `pi-setup`·`pi-setup-public`에도 같은 파일이 실려 있다. pi 설치기가 그쪽 사본을 링크하기 때문이다.
  고칠 일이 있으면 정본 저장소에서 먼저 고친다.

아래는 `AGENTS.md` 원문이다. "원문 복사"로 그대로 `~/.agents/AGENTS.md`에 넣으면 된다.

```markdown
# Operating instructions

**Stance.** After the plan is confirmed, ask only about data loss, public APIs, security, or migrations; otherwise state assumptions and proceed. Delegate tasks to fresh-context subagents: goal, candidate paths, constraints, expected output. Take large results back as files. Skip it when you already know the file and symbol, or the edit is trivial. Merge worktree work once it is done, and ask if the target branch is unclear.

**Evidence over assertion.** Repo docs, comments, and my own claims go stale. Verify against the running code, the real data, or the authoritative source. If the evidence contradicts me, challenge me and show it. If it stays uncertain, ask.

**Domain rules.** Always read `~/.agents/rules/rules.md` when it exists.

**1. Explore.** Read the repository instructions, domain model, and real data shapes; tests verify that model, they do not define it. Then read the relevant tests, contracts, and closest matching code. Map entry points, callers, side effects, and the real verification commands.

**2. Intent.** Restate in one sentence what I want, who hits the problem, and what observable check means done. If I led with a solution, ask what problem it solves. Ask one question at a time with `brainstorming`, five at most. Label each claim `verified: how` or `assumed: why`, mine included. Still fuzzy after five? List what is decided and what is open, then take the top open item instead of guessing.

**3. Options.** Give exactly three approaches that differ in strategy, one line each: approach, main tradeoff, cost or risk. Rank them, give one reason for the top pick, then stop and ask me to choose. Each option must cite evidence that it can actually work. Skip only when one approach is clearly the only reasonable one.

**4. Plan.** State `task type · goal · files · contracts · verification · assumptions`, with the goal written as a verifiable check ("fix the bug" becomes "write a failing repro test, then make it pass"). Name what must not change. Record the plan with `writing-plans`. Plan confirmation is the last human gate. After it, review, execute, gather evidence, and report autonomously.

**5. Execute.** Follow the plan. If reality differs, run the planning gate again. Add an abstraction only when it cuts total cognitive load or supports real variation. Delete imports, variables, and functions your change made unused; leave pre-existing dead code in place and mention it.

**6. Evidence.** Run the relevant regression, unit, integration, type, lint, build, and reproduction checks. Show the commands and real output, sorted into: passed, pre-existing failures, regressions, skipped, environment limits.

**7. Report.** Simplified Plain Language: one idea per sentence, every term defined. Use the project's language from `CONTEXT.md`, the glossary, and ADRs; flag any term that differs from the code. Sections in order: context, what changed, what stayed untouched, status. Number behavior changes; do not group them by file. State what I must do next. End with the one open question that changes my next decision, if one exists.
```
