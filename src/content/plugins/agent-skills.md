---
title: Agent Skills (addyosmani/agent-skills)
summary: "코딩 에이전트에게 소프트웨어 개발 전 과정(정의→계획→구현→검증→리뷰→배포)을 단계별 슬래시 명령으로 강제하는 스킬 24종 묶음. 이 사이트 온보딩 키트의 기본 워크플로 세트."
summary_en: "24 skills that walk a coding agent through the whole lifecycle — define, plan, build, verify, review, ship — one slash command per phase. The default workflow set in this site's onboarding kit."
tags: [plugin, agent-skills, lifecycle, sdlc, slash-commands, multi-harness, default-kit]
source: https://github.com/addyosmani/agent-skills
author: Addy Osmani
license: MIT
order: 5
harnesses: [Claude Code, Codex CLI, Gemini CLI, OpenCode, Cursor, Antigravity CLI, GitHub Copilot CLI]
install: "npx skills add addyosmani/agent-skills  (70+ 하네스 공통) — 하네스별 네이티브 설치는 본문 참조"
---

## 한 줄

에이전트가 "일단 코드부터" 가는 걸 막고, 개발 **한 사이클(lifecycle, 요구 정의부터 배포까지의 전 과정)**을
6단계로 쪼개 단계마다 사람이 확인하고 넘어가게 만드는 스킬 24종. 단계별로 슬래시 명령이 하나씩 붙어 있다.

*EN: 24 skills that split delivery into six phases and put a human checkpoint at each one, with a slash command per phase.*

## 6단계 파이프라인

```
  DEFINE          PLAN           BUILD          VERIFY         REVIEW          SHIP
 ┌──────┐      ┌──────┐      ┌──────┐      ┌──────┐      ┌──────┐      ┌──────┐
 │ Idea │ ───▶ │ Spec │ ───▶ │ Code │ ───▶ │ Test │ ───▶ │  QA  │ ───▶ │  Go  │
 │Refine│      │  PRD │      │ Impl │      │Debug │      │ Gate │      │ Live │
 └──────┘      └──────┘      └──────┘      └──────┘      └──────┘      └──────┘
  /spec          /plan          /build        /test         /review       /ship
```

| 단계 | 명령 | 주력 스킬 | 원칙 |
|---|---|---|---|
| DEFINE | `/spec` | `spec-driven-development` · `interview-me` · `idea-refine` | 코드보다 명세가 먼저 |
| PLAN | `/plan` | `planning-and-task-breakdown` | 작고 원자적인 태스크 |
| BUILD | `/build` | `incremental-implementation` · `frontend-ui-engineering` · `api-and-interface-design` · `source-driven-development` · `doubt-driven-development` · `context-engineering` | 한 번에 수직 한 조각 |
| VERIFY | `/test` | `test-driven-development` · `browser-testing-with-devtools` · `debugging-and-error-recovery` · `observability-and-instrumentation` | 테스트가 증거 |
| REVIEW | `/review` `/code-simplify` `/webperf` | `code-review-and-quality` · `code-simplification` · `security-and-hardening` · `performance-optimization` | 5축 리뷰로 코드 건강 개선 |
| SHIP | `/ship` | `shipping-and-launch` · `git-workflow-and-versioning` · `ci-cd-and-automation` · `documentation-and-adrs` · `deprecation-and-migration` | 자주 내보내는 게 더 안전하다 |

라우터는 `using-agent-skills`다. 태스크가 들어오면 어느 단계인지 판정해서 해당 스킬로 보낸다.
`/build auto`는 계획을 한 번만 승인받고 모든 태스크를 자율로 돌린다 — 사람이 태스크 *사이*에서
빠지는 것이고, 검증이 빠지는 게 아니다(태스크별 TDD와 개별 커밋은 그대로, 실패하면 멈춘다).

`/ship`은 리뷰 페르소나 4개(`code-reviewer`, `security-auditor`, `test-engineer`,
`web-performance-auditor`)를 병렬로 띄워 go/no-go를 합산한다.

## 언제 쓰는가

- 보안 리뷰와 배포까지 거쳐야 하는 **운영 기능**을 만들 때.
- 팀에서 **같은 용어와 같은 순서**로 일하게 표준을 깔고 싶을 때.
- 보안·성능·관측성·CI/CD·폐기(deprecation)까지 **폭이 필요한** 경우.
- 반대로 한 줄짜리 버그 수정에는 과하다. 프로세스 비용이 이득을 넘는다.

## 세 가지 철학 비교 — Superpowers · Agent Skills · Matt Pocock

같은 문제(에이전트가 절차를 건너뛴다)를 서로 다르게 푼다. 온보딩 프롬프트가 셋 중 하나를 고르라고 묻는 이유다.

| 항목 | **Agent Skills** (기본값) | Superpowers | Matt Pocock Skills |
|---|---|---|---|
| 만든 사람 | Addy Osmani | Jesse Vincent (obra) | Matt Pocock |
| 한 줄 철학 | 개발 전 과정을 인코딩하고 **단계마다 사람이 확인** | 앞단에서 깊게 추론하고 **그 뒤는 손 떼고 자율 실행** | **요구사항이 먼저**, 프로세스를 소유하지 않는다 |
| 스킬 수 | 24종 / 6단계 | 파이프라인 6단계 | 작은 모듈 스킬 다수 |
| 발동 방식 | 슬래시 명령 8개 (`/spec` … `/ship`) | 파이프라인 자동 발동 | 사용자 호출 / 모델 호출 분리 |
| 실행 모델 | 단계마다 사람 체크포인트 (`/build auto`는 예외) | 태스크마다 새 subagent(맥락이 빈 보조 에이전트) | 단일 에이전트 + 가벼운 가이드 |
| 특징 기능 | 페르소나 4종 병렬 ship 게이트, CI eval(스킬 자체 검증) 프레임워크, 합리화 반박 표 | git worktree 격리, 2~5분 단위 태스크 계획, 태스크 사이 코드리뷰 | `grilling` — 한 번에 한 질문으로 요구를 캐는 원시 도구 |
| 강점 | 커버리지가 가장 넓다(보안·성능·관측성·CI/CD), 팀 표준화 어휘 | 모호한 탐색 과제, 승인 후 방치 가능, 조립이 쉽다 | 요구가 흐릴 때 가장 날카롭다, 읽고 고치기 쉽다 |
| 약점 | 의견이 강하고 서로 얽혀 있어 확장하면 라우팅 충돌, 조립성 낮음 | 작고 명확한 작업에 프로세스 과부하 | 복잡한 사이클 커버리지가 얕고, 사람이 더 많이 붙어야 한다 |
| 이럴 때 고른다 | 운영 배포까지 가는 기능, 팀 표준, 넓은 커버리지 | 아키텍처가 모호한 큰 작업, 위임하고 손 떼고 싶을 때 | 병목이 "무엇을 만들지 모른다"일 때, 가볍게 쓰고 싶을 때 |

축으로 보면 **조립형(Superpowers, Pocock) ↔ 의견형(Agent Skills)**이고,
두 번째 축은 **자율(Superpowers) ↔ 통제(Pocock의 요구 캐묻기, Agent Skills의 체크포인트)**다.
세 개 모두 작고 명확한 작업에는 쓰지 않는 게 맞다.

> 세 프레임워크를 **스킬 없는 맨 프롬프트와 비교한 공개 벤치마크는 아직 없다.**
> 컨텍스트를 잡아먹는 비용이 간단한 작업에서는 손해일 수 있다는 점을 감안하고 고르라는 뜻이다.
> 비교 출처: [Superpowers vs Agent Skills vs Pocock — dev.to/jamilxt](https://dev.to/jamilxt/superpowers-vs-agent-skills-vs-pocock-three-philosophies-of-ai-coding-workflows-e6n)

## 함정

- **세 세트를 동시에 깔면 라우터가 싸운다.** 메타 스킬(`using-agent-skills` vs `ask-matt` vs
  `using-superpowers`)이 같은 태스크를 서로 다른 파이프라인으로 보낸다. **한 세트만 활성화**하고
  나머지는 링크를 옮겨 비활성화하되 소스는 남겨 되돌릴 수 있게 두는 게 안전하다.
- **개별 스킬만 설치하면 공용 참조가 빠진다.** `npx skills add … --skill <name>`은
  `skills/<name>/`만 복사하고 레포 루트의 `references/`는 가져오지 않는다. 스킬은 동작하지만
  체크리스트 링크가 깨진다. 레포 전체로 설치하거나 필요한 체크리스트를 스킬 안 `references/`로 복사한다.
- **마켓플레이스 설치는 SSH로 클론한다.** GitHub SSH 키가 없으면 `Permission denied (publickey)`로
  실패한다. HTTPS URL을 명시하거나 `git config --global url."https://github.com/".insteadOf git@github.com:`.
- **슬래시 명령·페르소나·훅은 Claude Code 전용이다.** Codex·OpenCode에서는 명령 대신 스킬을
  직접 호출한다(`@spec-driven-development`). 명령 파일을 그대로 복사하면 `agent-skills:` 접두사가
  남아 스킬 이름을 못 찾으니 접두사를 지운 사본을 만들어야 한다.

## 설치

````bash
# 어느 하네스든 통하는 최단 경로 (skills CLI, 70+ 에이전트 지원)
npx skills add addyosmani/agent-skills            # 24종 전부
npx skills add addyosmani/agent-skills --list     # 먼저 목록만 보기
npx skills add addyosmani/agent-skills --skill code-review-and-quality   # 하나만

# Claude Code — 플러그인 마켓플레이스 (권장)
/plugin marketplace add addyosmani/agent-skills
/plugin install agent-skills@addy-agent-skills

# Codex CLI (v0.122+)
codex plugin marketplace add addyosmani/agent-skills
codex plugin add agent-skills@agent-skills

# Gemini CLI
gemini skills install https://github.com/addyosmani/agent-skills.git --path skills

# Antigravity CLI
agy plugin install https://github.com/addyosmani/agent-skills.git

# 공용 허브(~/.agents)에 심링크로 넣고 모든 CLI가 공유하게 하는 방식
git clone https://github.com/addyosmani/agent-skills ~/.agents/sources/addyosmani-agent-skills
for d in ~/.agents/sources/addyosmani-agent-skills/skills/*/; do
  ln -sfn "${d%/}" ~/.agents/skills/"$(basename "$d")"
done
# Claude Code 전용 자산 — 하위 폴더 이름이 명령 접두사가 된다 (/agent-skills:build)
mkdir -p ~/.claude/commands/agent-skills ~/.claude/agents
ln -sfn ~/.agents/sources/addyosmani-agent-skills/.claude/commands/*.md ~/.claude/commands/agent-skills/
ln -sfn ~/.agents/sources/addyosmani-agent-skills/agents/*.md ~/.claude/agents/
````
