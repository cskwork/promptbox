---
title: Archon
summary: AI 코딩을 deterministic + repeatable하게 만드는 첫 open-source "harness builder". 개발 프로세스를 YAML workflow(`.archon/workflows/*.yaml`)로 인코딩 → CLI/Web/Slack/Telegram/GitHub 어디서나 같은 시퀀스로 실행. git worktree로 자동 격리, 병렬 5개 fix 동시 가능. Claude Code SDK · Codex SDK · Pi 어시스턴트 지원.
tags: [harness, archon, workflow-engine, yaml, worktree, claude-code, codex, slack, github, telegram]
source: https://github.com/coleam00/archon
author: Cole Medin (coleam00)
license: MIT
order: 25
base_agent: Claude Code SDK · OpenAI Codex SDK · Pi
languages: [TypeScript, Bun]
platforms: [macOS, Linux, Windows, Docker]
install: "git clone https://github.com/coleam00/Archon && cd Archon && bun install && claude  # then say: Set up Archon"
---

## 한 줄

Dockerfile이 인프라에, GitHub Actions가 CI/CD에 한 일을 **AI 코딩 워크플로우에 한다**. AI가 매번 다른 식으로 plan/test/PR 만드는 mood-dependent 문제를 — phase / validation gate / artifact가 결정적이고 사용자가 소유하는 YAML로 고정.

## 무엇이 가능한가

```yaml
# .archon/workflows/build-feature.yaml
nodes:
  - id: plan
    prompt: "Explore the codebase and create an implementation plan"
  - id: implement
    depends_on: [plan]
    loop:
      prompt: "Read the plan. Implement the next task. Run validation."
      until: ALL_TASKS_COMPLETE
      fresh_context: true
  - id: run-tests
    depends_on: [implement]
    bash: "bun run validate"
  - id: review
    depends_on: [run-tests]
    prompt: "Review all changes against the plan. Fix any issues."
  - id: approve
    depends_on: [review]
    loop:
      prompt: "Present the changes for review. Address any feedback."
      until: APPROVED
      interactive: true
  - id: create-pr
    depends_on: [approve]
    prompt: "Push changes and create a pull request"
```

코딩 에이전트에게:

```
You: Use archon to add dark mode to the settings page

Agent: I'll run the archon-idea-to-pr workflow for this.
       → Creating isolated worktree on branch archon/task-dark-mode...
       → Planning... → Implementing (1/4)...
       → Tests failing - iterating... → Tests passing after 2 iterations
       → Code review complete - 0 issues
       → PR ready: https://github.com/you/project/pull/47
```

## 핵심 특성

- **Repeatable** — 같은 workflow, 같은 시퀀스, 매번
- **Isolated** — workflow run마다 자체 git worktree. 5개 fix 병렬, 충돌 X
- **Fire and forget** — kick off → 다른 일 → 끝난 PR + review comment 받기
- **Composable** — deterministic node(bash/test/git) + AI node(plan/code/review) mix. AI는 가치 있는 곳에서만
- **Portable** — `.archon/workflows/`에 정의 + commit. CLI · Web · Slack · Telegram · GitHub 모두 같은 동작

## 설치 (full setup — 권장 5분)

```bash
# 전제: Bun, Claude Code, GitHub CLI 설치
git clone https://github.com/coleam00/Archon
cd Archon
bun install
claude
# 그리고 말하기: "Set up Archon"
```

Setup wizard가 CLI install / auth / platform 선택 / target repo에 Archon skill 복사까지 처리.

### Quick install (binary, 30초)

```bash
# macOS / Linux
curl -fsSL https://archon.diy/install | bash

# Windows PowerShell
irm https://archon.diy/install.ps1 | iex

# Homebrew
brew install coleam00/archon/archon
```

Binary는 Claude Code를 번들하지 않음 — 별도 install 후 `CLAUDE_BIN_PATH` 환경변수 또는 `~/.archon/config.yaml`의 `assistants.claude.claudeBinaryPath` 설정.

## 사용 (target repo에서)

```bash
cd /path/to/your/project
claude

Use archon to fix issue #42
What archon workflows do I have? When would I use each one?
```

**중요**: Claude Code를 항상 **target repo에서** run, Archon repo에서 X. Setup wizard가 Archon skill을 프로젝트로 복사함.

## 17개 default workflow (대표)

| Workflow | 무엇 |
|---|---|
| `archon-assist` | 일반 Q&A / debugging / exploration (full Claude Code) |
| `archon-fix-github-issue` | issue 분류 → investigate/plan → implement → validate → PR → smart review → self-fix |
| `archon-idea-to-pr` | feature 아이디어 → plan → implement → validate → PR → 5 parallel review → self-fix |
| `archon-plan-to-pr` | 기존 plan 실행 → implement → validate → PR → review → self-fix |
| `archon-comprehensive-pr-review` | 5 parallel reviewer multi-agent PR review + 자동 fix |
| `archon-resolve-conflicts` | merge conflict 감지 → 양쪽 분석 → 해결 → validate → commit |
| `archon-architect` | 아키텍처 sweep, complexity reduction, codebase health |
| `archon-refactor-safely` | type-check hook + 동작 verification 안전 refactoring |
| `archon-validate-pr` | main · feature branch 양쪽 테스트로 thorough PR validation |
| `archon-ralph-dag` | PRD implementation loop — story 끝까지 반복 |

`archon workflow list` 또는 자연어로 describe → router가 선택. **자기만의 workflow도 정의 가능** — `.archon/workflows/defaults/`에서 복사해 customize.

## Web UI

```bash
archon serve  # binary: web UI 다운로드 + 시작
# source: bun run dev (Archon repo에서)
```

- **Chat** — real-time streaming + tool call 시각화
- **Dashboard** — running workflow 모니터링, project/status/date filter
- **Workflow Builder** — visual drag-and-drop DAG editor + loop node
- **Workflow Execution** — running/완료 workflow 단계별 progress
- Sidebar에 **모든 platform**(CLI · Slack · Telegram · GitHub)의 대화가 한 곳에

## 플랫폼 어댑터 (옵션 — 원격 접근용)

| Platform | Setup time |
|---|---|
| Telegram | 5 min |
| Slack | 15 min |
| GitHub Webhooks | 15 min |
| Discord | 5 min |

## 아키텍처

```
Platform Adapters (Web · CLI · Telegram · Slack · Discord · GitHub)
  ↓
Orchestrator (Message Routing + Context Management)
  ↓
Command Handler · Workflow Executor · AI Assistant Clients (Claude · Codex · Pi)
  ↓
SQLite / PostgreSQL (8 tables: codebases · conversations · sessions · workflow_runs · isolation_environments · messages · workflow_events · codebase_env_vars)
```

## DB

- **기본 SQLite** at `~/.archon/archon.db` — 0 setup
- **PostgreSQL** 옵션 — `DATABASE_URL` env var + `psql $DATABASE_URL < migrations/000_combined.sql`

## 텔레메트리

`workflow_invoked` 이벤트 하나만 anonymous로 전송 (workflow 이름·설명·platform·version·random install UUID). 코드 / prompt / message / git remote / file path / username / token / AI output **수집 안 함**. opt-out:

```bash
ARCHON_TELEMETRY_DISABLED=1
DO_NOT_TRACK=1  # de facto standard (Astro/Bun/Prisma/Nuxt가 honor)
```

## 함정

- **항상 target repo에서 Claude Code 실행**. Archon repo에서 X
- Compiled binary는 Claude Code 별도 install + `CLAUDE_BIN_PATH`
- v1 (Python + task management + RAG)은 [`archive/v1-task-management-rag`](https://github.com/coleam00/Archon/tree/archive/v1-task-management-rag) 브랜치에 보존

## 참고

- Docs: <https://archon.diy>
- Book of Archon: <https://archon.diy/book/>
- 10-chapter 내러티브 튜토리얼이 best 학습 경로
