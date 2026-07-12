---
title: handoff (cskwork/handoff-skill)
summary: "코딩 에이전트의 작업 상태를 사라지지 않게 packet(사실 스냅샷 + 실행 가능한 이어가기 계획)으로 저장하는 스킬. 새 컨텍스트의 다음 에이전트가 대화를 다시 읽지 않고도 추측 없이 재개하도록, 무엇이 참인지·무엇이 바뀌었는지·무엇을 검증했는지·정확히 무엇을 할지를 담는다."
summary_en: "Creates a durable handoff packet — a factual state snapshot plus an executable continuation plan — so a fresh agent can resume without re-reading the whole conversation."
tags: [skill, handoff, state, continuation, resume, agent-transfer, cskwork]
source: https://github.com/cskwork/handoff-skill
author: cskwork
license: MIT
order: 32
trigger: "handoff · save current state · continue later · pause here · resume in a new session · pass this to another agent · 이어서 작업 · 상태 저장"
install: "git clone https://github.com/cskwork/handoff-skill && cd handoff-skill && ./install.sh"
---

## 한 줄

코딩 에이전트의 작업 상태를 사라지지 않게 **packet**(사실 스냅샷 + 실행 가능한 이어가기 계획)으로 저장하는 스킬. 새 컨텍스트(fresh context: 대화 기록이 없는 새 세션)의 다음 에이전트가 추측 없이 재개할 수 있도록 충분한 ground truth(실제 사실)를 담는다.

*EN: a factual state snapshot plus an executable plan, so the next agent resumes without guessing.*

## 언제 쓰는가

- 작업을 잃지 않고 중단할 때
- 새 세션에서 이어서 작업할 때
- 다른 코딩 에이전트에게 작업을 넘길 때
- QA·리뷰 에이전트에게 정확한 이어가기 브리프를 줄 때
- 결정·기각한 선택지·검증 증거를 보존하고 싶을 때

## 무엇을 하는가

6단계 워크플로: (1) 수신자 확정(같은 에이전트 later / 다른 에이전트 / 리뷰어 / QA / 사람) → (2) durable 사실 인벤토리(목표·브랜치·바뀐 파일·실행한 명령·결정) → (3) 민감정보 마스킹(토큰·비밀번호를 `[REDACTED_*]`로) → (4) 순서 있는 이어가기 계획(각 단계에 why·대상 파일·명령·완료 조건) → (5) 가장 durable한 위치에 저장(`docs/handoffs/<날짜>-<주제>.md` 등) → (6) 새 에이전트 관점 재개 점검. 표준 packet 템플릿을 포함한다.

## 함정

- 비밀·토큰·세션 쿠키는 **반드시 redact**(가리기) — 어디서 안전하게 가져올지만 표기.
- 증거 없는 상태는 지어내지 말고 "unknown"으로 명시(`git status`가 멈추면 그 사실을 기록).
- 기존 PRD·plan·ADR·티켓·diff·커밋을 **중복 복사하지 말고 링크**만 — 재시작에 필요한 요약만.

````markdown
---
name: handoff
description: Handoff packet workflow for saving agent state, pausing work, resuming later, or transferring a task to another agent. Use when the user says handoff, save current state, continue later, pause here, resume in a new session, pass this to another agent, write a continuation plan, or asks for detailed next steps before stopping.
argument-hint: "Optional: what the next session or agent should focus on"
---

# Handoff

Create a handoff packet: a factual state snapshot plus an executable continuation plan. The packet is for a future agent with fresh context, so it must carry enough ground truth to resume without guessing.

## Workflow

1. **Fix the handoff target.**
   Infer whether the recipient is the same agent later, another coding agent, a reviewer, QA, or a human. If the user supplied arguments, treat them as the next session focus. Ask one question only when the recipient or purpose changes what must be captured.

   Done when the packet has a clear recipient, focus, and success condition.

2. **Inventory the current state.**
   Gather only durable facts:
   - Original goal and latest user request.
   - Current repository, branch, environment, and relevant paths.
   - Files created, edited, or intentionally left untouched.
   - Commands run, tests run, outputs observed, and commands still running.
   - Decisions made, options rejected, and why.
   - Known blockers, risks, assumptions, secrets, credentials, and external dependencies.

   Prefer artifact references over pasted bulk content. Use paths, URLs, issue IDs, commit hashes, command names, and short evidence quotes. If a command such as `git status` hangs or fails, record that exact fact instead of inventing state.

   Done when every active thread of work has either a current status, a next action, or an explicit "unknown".

3. **Protect sensitive material.**
   Redact credentials, tokens, passwords, private personal data, and session cookies. Replace them with labels such as `[REDACTED_API_TOKEN]` and describe where the next agent should retrieve them safely.

   Done when the packet can be shared with a fresh agent without leaking secrets.

4. **Write the continuation plan.**
   Convert remaining work into ordered steps. Each step must include:
   - Why it exists.
   - Exact files or systems to inspect or edit.
   - Commands to run when known.
   - Completion criterion.
   - Side effects or rollback concerns.

   Keep tasks small enough that the next agent can complete or verify them one by one.

   Done when the next agent can start with step 1 without rereading the full conversation.

5. **Save the packet.**
   Use the most durable appropriate location:
   - If the current workspace has a docs convention, use it.
   - Else if a repository is active, save to `docs/handoffs/<YYYY-MM-DD-HHMM>-<topic>.md`.
   - Else save to the OS temp directory and name the file with the same timestamp and topic.

   Do not duplicate existing PRDs, plans, ADRs, tickets, diffs, or commits. Link to them and summarize only what matters for restart.

   Done when the file path is stable and included in the final response.

6. **Run the resume check.**
   Read the packet as if you are a new agent. Verify that it answers:
   - What is the task?
   - What has already been done?
   - What changed on disk?
   - What evidence proves the state?
   - What is the exact next action?
   - What should not be touched?
   - What tests or checks prove completion?

   Fix gaps before responding.

   Done when a fresh agent can continue from the packet alone plus referenced artifacts.

## Handoff Packet Template

Use this structure unless a repository already has a stricter handoff format.

```markdown
# Handoff: <task or ticket>

Generated: <YYYY-MM-DD HH:MM timezone>
Recipient: <same agent later | another coding agent | reviewer | QA | human>
Focus: <what the next session should do first>
Status: <not started | in progress | blocked | ready for review | complete except verification>

## Goal
<Original goal and latest user request in one short paragraph.>

## Current State
- Workspace: `<absolute path or URL>`
- Branch or version: `<branch, commit, release, or unknown with reason>`
- Active services or sessions: `<name, pid, URL, or none>`
- Important artifacts: `<paths or URLs>`

## Completed Work
- <Fact with file path, command evidence, or artifact reference.>

## Decisions
- <Decision>: <reason>. Rejected: <alternative and reason>.

## Files And Changes
- `<path>`: <what changed and why>
- Untouched but relevant: `<path>`: <why it matters>

## Commands And Evidence
- `<command>`: <result, exit code, important output, or failure mode>

## Remaining Plan
1. <Action>
   - Why: <reason>
   - Where: `<file, service, or artifact>`
   - Command: `<command or none>`
   - Done when: <checkable condition>
   - Risk: <side effect or none>

## Verification Plan
- <Test, lint, type check, build, manual check, or external validation>

## Risks And Assumptions
- <Risk or assumption and how to verify it>

## Suggested Skills
- `<skill-name>`: <why it should be used>

## Resume Prompt
<A concise prompt the next agent can paste into a new session. Include this handoff path and the first step.>

## Redactions
- <What was redacted and where the next agent should retrieve it, or "none">
```

## Resume Check

Before finalizing, score the packet against this checklist:

- Goal and latest request are clear.
- Current state is evidence-backed, not guessed.
- Every modified file has a reason.
- Every running command, server, or external dependency is accounted for.
- Remaining plan is ordered and each step has a completion criterion.
- Verification plan names exact commands or concrete manual checks.
- Risks, assumptions, and redactions are explicit.
- Resume prompt is ready to paste.

If any item fails, revise the packet.

## Final Response

Respond with:

1. The saved packet path.
2. The first recommended next action.
3. What verification you performed on the packet.

Keep the response short. The packet is the durable artifact.
````
