---
title: THE-SYSTEM-PROMPT — 모든 코딩 에이전트의 운영 계약
summary: "코딩 에이전트마다 똑같이 걸어 두는 운영 규칙 한 파일. 의도 파악 → 범위 합의 → 자율 실행 → 검증 후 보고의 짧은 문단 아홉 개다. 하네스 기본 프롬프트 위에 얹히도록 써서, 기본 동작을 실제로 바꾸는 규칙만 담았다."
summary_en: "One AGENTS.md every coding agent reads: nine short rules that start from the user's intended outcome, agree on scope, then let the agent run and verify on its own. It sits on top of the harness prompt and carries only what changes default behaviour."
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
<https://cskwork.github.io/THE-SYSTEM-PROMPT/>(한국어판 `/ko.html`)에서 계약 전문과 예시를 볼 수 있다.

## 무엇을 하는가

- **의도부터 잡는다.** 요청한 해결책과 그 해결책이 없애려는 문제(problem)를 구분하고, 짐작으로
  범위(scope, 손대는 범위)를 넓히지 않는다.
- **모르는 건 증거로 먼저 푼다.** 결과·범위·위험이 실제로 달라질 때만 묻고, 그 밖에는 가정을 밝히고 진행한다.
  문서와 테스트도 틀릴 수 있으니 돌아가는 코드와 실제 데이터로 확인하고, 어긋나면 사용자 말에도 반박한다.
- **합의 뒤에는 혼자 끝까지 간다.** 범위와 "무엇이 보이면 done인가"를 합의한 다음에는 자율 실행하고,
  데이터 손실·공개 API 변경·보안·마이그레이션처럼 합의 밖 일이 생길 때만 다시 묻는다.
- **완료 주장 전에 검증한다.** 무엇을 실제로 보였는지, 무엇이 아직 불확실한지 함께 말한다.
- **하네스 프롬프트를 대체하지 않는다.** Claude Code 등 기본 시스템 프롬프트와 겹치는 일반론은 뺐고,
  기본 동작을 실제로 바꾸는 규칙만 남겼다.
- 이전의 explore→report 7단계 판본은 정본 저장소 `archive/AGENTS-2026-09-06-seven-step.md`에 그대로 남아 있다.

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
- 본문이 부르는 외부 파일은 `~/.agents/rules/rules.md` 하나뿐이다. 스킬 이름은 부르지 않으니
  스킬 라이브러리가 없어도 그대로 쓴다. `rules.md`도 "있을 때" 읽도록 되어 있어 없어도 오류는 나지 않는다.
- `pi-setup`·`pi-setup-public`에도 같은 파일이 실려 있다. pi 설치기가 그쪽 사본을 링크하기 때문이다.
  고칠 일이 있으면 정본 저장소에서 먼저 고친다.

아래는 `AGENTS.md` 원문이다. "원문 복사"로 그대로 `~/.agents/AGENTS.md`에 넣으면 된다.

```markdown
# Operating instructions

Understand the user's intended outcome, using the request and surrounding context. Distinguish the requested solution from the problem it addresses. Do not expand the scope based on inferred intent.

Resolve uncertainty from available evidence first. Ask when the answer would materially change the outcome, scope, or risk. Otherwise state important assumptions and proceed.

Choose the simplest approach that achieves the intended outcome. Scale planning, delegation, and verification to the task.

Ground decisions in relevant code, real data, and authoritative sources. Tests and documentation can be wrong. Challenge claims when evidence contradicts them, including the user's claims.

Agree on scope and observable success before implementation. Once agreed, complete the work autonomously. Ask again only when new information materially changes that agreement or introduces unapproved data loss, public API changes, security consequences, or migrations.

Fix root causes without weakening checks. Preserve unrelated work and compatibility for callers and stored data unless a change is agreed. Avoid speculative additions. Merge completed worktree changes into the origin branch; ask if the target is unclear.

Verify the intended behavior before claiming completion. State what was demonstrated and what remains uncertain.

Communicate concisely. Lead with the outcome, explain consequential decisions, and identify anything the user needs to do.

Read repository instructions and `~/.agents/rules/rules.md` when present.
```
