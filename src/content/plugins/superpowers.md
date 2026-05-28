---
title: Superpowers (obra/superpowers)
summary: "AI 코딩 도구가 코드부터 쏟아내지 않고 기획→계획→테스트→리뷰 순서로 차근차근 일하게 만드는 작업 습관 모음. Claude Code 등 코딩 도구 8종에서 동작."
summary_en: "Gives AI coding agents a structured workflow — brainstorm, plan, test, review — before writing code. Works across 8 agents."
tags: [plugin, superpowers, tdd, subagent, brainstorming, multi-harness]
source: https://github.com/obra/superpowers
author: Jesse Vincent (obra) · Prime Radiant
license: MIT
order: 10
harnesses: [Claude Code, Codex CLI, Codex App, Factory Droid, Gemini CLI, OpenCode, Cursor, GitHub Copilot CLI]
install: "/plugin install superpowers@claude-plugins-official  (Claude Code) — 다른 하네스는 본문 참조"
---

## 한 줄

"코딩 에이전트한테 *일하는 방법(방법론)*을 깔아주는 플러그인". 코드를 바로 쓰지 않고 brainstorm(아이디어 정리) → spec → plan → subagent로 TDD → review → finish 순서를 강제로 거치게 하는 작업 습관 모음. 8개 코딩 도구 지원.

*EN: A plugin that installs a working method into coding agents, forcing them through brainstorm, plan, test, and review before they touch code.*

## 기본 워크플로우

1. **brainstorming** — 코드 쓰기 전. 요구를 질문으로 다듬고, 대안 탐색하고, 디자인을 섹션 단위로 validate하고 design 문서 저장.
2. **using-git-worktrees** — design 승인 후. 새 브랜치 + isolated workspace 만들고 clean test baseline 검증.
3. **writing-plans** — 작업을 2–5분짜리 bite-size 태스크로 분해. 각 태스크는 exact 파일 경로 + 완성된 코드 + 검증 단계 포함.
4. **subagent-driven-development** / **executing-plans** — 태스크당 fresh subagent dispatch + 2단계 review (spec 준수 → 코드 품질), 또는 사람 체크포인트로 batch 실행.
5. **test-driven-development** — RED-GREEN-REFACTOR 강제. 실패하는 테스트 → 최소 구현 → pass → commit. **테스트보다 먼저 쓴 코드는 삭제**.
6. **requesting-code-review** — 태스크 사이. plan 대비 review, severity별 보고. critical은 진행 차단.
7. **finishing-a-development-branch** — 태스크 완료 시. 테스트 검증 → merge/PR/keep/discard 옵션 → worktree 정리.

**에이전트가 모든 태스크 전에 관련 스킬을 자동으로 체크.** 제안 아니라 mandatory.

## 핵심 스킬 카탈로그

**Testing** — `test-driven-development`

**Debugging** — `systematic-debugging` (4-phase root cause), `verification-before-completion`

**Collaboration** — `brainstorming`, `writing-plans`, `executing-plans`, `dispatching-parallel-agents`, `requesting-code-review`, `receiving-code-review`, `using-git-worktrees`, `finishing-a-development-branch`, `subagent-driven-development`

**Meta** — `writing-skills`, `using-superpowers`

## 철학

- **TDD** — 항상 테스트 먼저
- **Systematic > ad-hoc** — guessing 대신 process
- **Complexity reduction** — 단순함이 1순위
- **Evidence over claims** — 성공 선언 전에 verify

[Original release post](https://blog.fsck.com/2025/10/09/superpowers/)

## 하네스별 설치

### Claude Code

```bash
# Official Anthropic marketplace
/plugin install superpowers@claude-plugins-official

# Or Superpowers marketplace (이 + 관련 플러그인들)
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

### Codex CLI

```bash
/plugins              # plugin search 열기
superpowers           # 검색
# "Install Plugin" 선택
```

### Codex App

Plugins 사이드바 → Coding 섹션의 Superpowers → `+` 클릭.

### Factory Droid

```bash
droid plugin marketplace add https://github.com/obra/superpowers
droid plugin install superpowers@superpowers
```

### Gemini CLI

```bash
gemini extensions install https://github.com/obra/superpowers
gemini extensions update superpowers
```

### OpenCode

```text
Fetch and follow instructions from https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.opencode/INSTALL.md
```

상세: [docs/README.opencode.md](https://github.com/obra/superpowers/blob/main/docs/README.opencode.md)

### Cursor

```text
/add-plugin superpowers
```

### GitHub Copilot CLI

```bash
copilot plugin marketplace add obra/superpowers-marketplace
copilot plugin install superpowers@superpowers-marketplace
```

## 기여 정책 (중요)

- **94% PR 거부율**. 에이전트가 만든 slop PR은 몇 시간 내 close.
- 새 스킬은 일반적으로 받지 않음. 모든 변경은 지원되는 모든 코딩 에이전트에서 동작해야 함.
- 새 harness 지원 추가 시 **세션 트랜스크립트 필수**: 깨끗한 세션에 "Let's make a react todo list"라고 보내면 `brainstorming` 스킬이 자동 트리거되어야 함. 안 되면 진짜 통합 아님.
- 도메인 특화 / 프로젝트 특화 / 서드파티 의존 스킬은 코어에 안 들어감 → standalone plugin으로 출시.

## 커뮤니티

- Discord: <https://discord.gg/35wsABTejz>
- Issues: <https://github.com/obra/superpowers/issues>
- Release 알림: <https://primeradiant.com/superpowers/>
