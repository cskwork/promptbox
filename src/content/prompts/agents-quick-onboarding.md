---
title: 코딩 에이전트 온보딩 한 방 설치
title_en: One-shot coding agent setup
summary: "공통 시스템 프롬프트와 스킬, CLI 도구(officecli·herdr·rtk), 에이전트용 기본 브라우저(ego lite, macOS)를 ~/.agents/ 한곳에 모아 설치하고, 설치된 모든 코딩 CLI(Claude Code·Codex·Jcode·Pi·Gemini·Cursor·Kiro·OpenCode)에 자동으로 연결·MCP 구성하는 복사-붙여넣기 프롬프트. 기본 구성에는 prompter(https://github.com/cskwork/prompter)가 포함돼, 에이전트가 물어보면 내 과거 결정 패턴으로 답장 초안을 만들고 y/yes 확인 전에는 보내지 않는다. ai-memory(https://github.com/akitaonrails/ai-memory)도 기본이라, 모든 에이전트가 로컬 서버 하나를 공유해 세션 기억을 주고받는다 — 임베딩·벡터DB·로컬 LLM은 깔지 않는 구성이 기본값이다. 이미 있으면 그대로 두고, 빠졌거나 깨진 항목만 복구한다."
summary_en: "One paste-and-go prompt that installs shared skills, instructions, CLI tools, and the ego lite browser — the kit's default on macOS — into ~/.agents/, then safely wires only the missing pieces into Claude Code, Codex, Jcode, Pi, Gemini, Cursor, Kiro, and OpenCode without replacing user-owned work. The default setup includes prompter (https://github.com/cskwork/prompter), which drafts your reply to an agent's question from rules learned locally and never sends it without an explicit y/yes, and ai-memory (https://github.com/akitaonrails/ai-memory), one shared local memory server every agent reads and writes — with no embeddings, vector database, or local LLM in the default configuration."
tags: [onboarding, install, skills, system-prompt, symlink, agents-dir, dotfiles, mcp, cli-tools, idempotent, jcode, pi, rtk, ai-memory, shared-memory, token-savings]
author: cskwork
order: 5
use_case: "새 머신을 세팅하거나 여러 코딩 CLI의 스킬·규칙을 한곳에서 관리하고 싶을 때. 에이전트 채팅창에 그대로 붙여넣으면 끝. 이미 설치된 환경이 깨졌을 때 복구용으로도 그대로 쓴다."
use_case_en: "Set up a new machine, manage shared skills and rules across coding CLIs, or repair an existing installation by pasting one prompt into your agent."
---

## 한 줄

스킬 묶음과 공통 시스템 프롬프트를 `~/.agents/` **한 폴더**에 모으고, 설치된 모든 코딩 CLI에
심링크(symlink, 한 파일을 여러 위치에서 가리키게 하는 바로가기)로 연결하는 단일 설치 프롬프트.
**멱등**이라 몇 번을 돌려도 안전하고, 두 번째 실행은 복구 도구가 된다.

## 무엇이 설치되나 (한눈에)

스킬은 `~/.agents/skills/`에 심링크로 놓이고, 원본은 `~/.agents/sources/<owner>/<repo>`에 클론된다.
`git pull` 한 번이면 설치된 스킬이 전부 최신이 되는 구조다.

| 이름 | 종류 | 소스 | 무엇을 더해주나 |
|---|---|---|---|
| AGENTS.md | 공통 규칙 | 프롬프트 내장 운영 지침 | 모든 CLI가 공유하는 시스템 프롬프트 |
| rules/rules.md | 도메인 규칙 | 이 머신에서 직접 작성 | 환경마다 다른 도메인·안전 규칙. 지시문은 모든 머신에서 동일하게 두고 이 파일만 갈린다. 덮어쓰지 않는다 |
| **워크플로 세트 — 셋 중 하나 선택** (기본값 A) | 스킬 묶음 | A: addyosmani/agent-skills · B: obra/superpowers · C: mattpocock/skills | 에이전트가 *어떻게 일하는가*를 정하는 층. **하나만 깐다** — 라우터가 서로 같은 작업을 가로채므로 둘을 깔면 버그다. 프롬프트가 4a 단계에서 비교표를 보여주고 물어본다 (아래 [세 가지 철학 비교](#세-가지-철학-비교--무엇을-고를까) 참조) |
| **A. Agent Skills** (기본값, 24종) | 스킬 | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | 개발 전 과정을 DEFINE→PLAN→BUILD→VERIFY→REVIEW→SHIP 6단계로 강제. 단계별 슬래시 명령 8개(`/spec` `/plan` `/build` `/test` `/review` `/code-simplify` `/webperf` `/ship`), 리뷰 페르소나 4종, 라우터는 `using-agent-skills` |
| B. Superpowers (선택) | 스킬 | obra/superpowers | 앞단에서 깊게 계획하고 그 뒤는 자율 실행. git worktree 격리 + 태스크마다 새 subagent |
| C. Matt Pocock Skills (선택, 저장소 전체 35종) | 스킬 | mattpocock/skills | `ask-matt`(설계·디버깅·트레이드오프 판단), `grilling`(한 번에 한 질문으로 요구 캐기), `tdd`, `triage`, `to-spec`, `wayfinder` 등 |
| **wait-what** (세트와 무관, 항상 설치) | 스킬 | [mattpocock/skills](https://github.com/mattpocock/skills) (`skills/productivity/wait-what`) | 답이 이해가 안 될 때 내가 치는 한 방. 맥락을 붙여서, ASD-STE100 단순화 기술영어로, `CONTEXT.md`의 공통 용어로 **다시 설명하게** 한다. 6줄짜리 스킬이라 파이프라인도 라우터도 없고 어떤 세트와도 충돌하지 않아 **A·B를 골라도 깔린다**. `disable-model-invocation: true`는 의도된 값이니 그대로 둔다 — 내가 헷갈린 그 순간에 내가 부르는 스킬이다 |
| context-diet | 스킬 | cskwork/context-diet-skill | 시스템 프롬프트 비대화 측정·감축 |
| autoresearch | 스킬 | uditgoenka/autoresearch | 자율 리서치 루프 |
| call-agent | 스킬 | cskwork/call-agent | codex·agy·kiro·claude·notebooklm로 위임 라우팅 |
| archify | 스킬 | tt-a1i/archify | 아키텍처·시퀀스·데이터플로 다이어그램을 단일 HTML로 |
| impeccable | 스킬 | pbakaus/impeccable | **디자인 기본 스킬** — 프론트엔드 설계·리디자인·감사·폴리시 23개 명령과 PRODUCT.md/DESIGN.md 컨텍스트, 편집마다 도는 감지 훅으로 AI 티 나는 디자인을 원천 차단 |
| gpt-image-2 | 스킬 | agentspace-so/agent-skills | ChatGPT 구독으로 이미지 생성(별도 과금 없음) |
| clean-code | 스킬 | cskwork/clean-code | 동작을 바꾸지 않고 레거시 코드 리팩터링 — 특성화 테스트로 현재 동작을 먼저 고정하고 작은 배치로 편집 |
| **prompter** | 스킬 | [cskwork/prompter](https://github.com/cskwork/prompter) | 기본 구성에 포함. 에이전트가 "여기서 멈출까요, 더 갈까요?" 같은 질문을 던지면 내 과거 결정 패턴에서 뽑은 규칙으로 답장 초안을 만든다. 대화 원문이 아니라 재사용 가능한 규칙만 로컬에 남기고, 화면에 보인 문장 그대로에 `y`/`yes`를 받기 전에는 절대 보내지 않는다. `prompt/ init` → `prompt/` → `prompt/ update` 세 라우트뿐이고 명시 호출로만 발동한다 |
| verify | 스킬 | cskwork/verify-skill | 초록 빌드를 검증으로 인정하지 않는 5게이트 검증 — 빌드·정적검사·클린코드·시나리오 API QA·보고. 게이트마다 재실행 가능한 증거(receipt)를 남기고, 실행하지 못한 게이트는 PASS가 아니라 BLOCKED. 토큰 발급 모듈과 payload 변형(happy·boundary·negative)이 딸려 있다. curl·jq 필요 |
| **ego-browser** | 스킬 + 브라우저 앱 | citrolabs/ego-lite | 내 로그인 상태를 그대로 쓰는 에이전트용 브라우저(QA·웹 자동화)로 이 키트의 **macOS 기본 브라우저**. **macOS 전용**이며, Windows·Linux에서는 필요 시 Playwright 사용 |
| debug-code | 스킬 | cskwork/promptbox (skills/debug-code) | 증거 기반 디버깅 — 가장 먼저 깨진 invariant(불변 조건)를 찾고 최소 안전 패치. 프로덕션 전용·간헐적·성능·레거시 버그에 강함 |
| skill-curator | 스킬 | cskwork/skill-curator | 설치된 스킬 라이브러리를 점검·중복 제거·아카이브·복원. 이 프롬프트가 깔아놓은 스킬 더미를 이후에 관리하는 쪽 — 지우지 않고 아카이브하며, `--apply` 없이는 항상 드라이런(dry run, 실제로 안 바꾸고 결과만 보여주기). python3 3.9+ 필요 |
| **officecli** (11종) | 스킬 + CLI | iOfficeAI/OfficeCLI | docx·xlsx·pptx 생성·분석, 재무모델·피치덱·논문 레이어 |
| **herdr** | 스킬 + CLI | ogulcancelik/herdr | 코딩 에이전트용 터미널 멀티플렉서 |
| **rtk** | CLI + 훅 | rtk-ai/rtk | 셸 명령 출력을 압축해 컨텍스트로 들어가는 토큰을 줄인다(git·pytest·docker 등 100종+). MCP가 아니라 `PreToolUse` 훅으로 붙는다 |
| omp — oh-my-pi (감지 시) | 에이전트(하네스) | [can1357/oh-my-pi](https://github.com/can1357/oh-my-pi) | 단일 바이너리 올인원 코딩 에이전트(LSP·디버거·브라우저 내장). 기본 키트가 아니다 — 이미 깔려 있으면 감지해 허브 스킬을 `~/.omp/agent/`로 연결하고, 없으면 설치 명령만 보고한다 |
| **ai-memory** | CLI + 서버 + MCP + 훅 | [akitaonrails/ai-memory](https://github.com/akitaonrails/ai-memory) | 기본 구성에 포함. 설치된 **모든** 에이전트가 공유하는 로컬 메모리 서버 하나. 세션이 끝나면 훅이 남긴 관측을 요약 페이지로 묶고, 다음 에이전트는 첫 프롬프트 전에 "어디까지 했는지"를 받는다. 저장소는 FTS5 SQLite + 마크다운 위키라 `grep`·Obsidian·`rsync`가 그대로 통한다. **임베딩·벡터DB·로컬 LLM·Docker는 기본 구성이 아니다** — 설치하지 않는다 |

> 설치된 CLI 수를 고정하지 않는다. 각 도구가 `~/.agents/skills`를 직접 읽는지 먼저 확인하고, 필요한 어댑터만 만든다.

## 세 가지 철학 비교 — 무엇을 고를까

프롬프트는 스킬을 깔기 **전에** 이 표를 보여주고 A/B/C 중 무엇을 쓸지 묻는다. 답이 없거나
비대화 모드면 **A(Agent Skills)**로 깔고 보고서에 그렇게 적는다.

| 항목 | **A. Agent Skills** (기본값) | B. Superpowers | C. Matt Pocock Skills |
|---|---|---|---|
| 만든 사람 | Addy Osmani | Jesse Vincent (obra) | Matt Pocock |
| 한 줄 철학 | 개발 전 과정을 인코딩하고 **단계마다 사람이 확인** | 앞단에서 깊게 추론하고 **그 뒤는 손 떼고 자율 실행** | **요구사항이 먼저**, 프로세스를 소유하지 않는다 |
| 규모 | 24종 / 6단계 | 파이프라인 6단계 | 작은 모듈 스킬 다수 |
| 발동 방식 | 슬래시 명령 8개 | 파이프라인 자동 발동 | 사용자 호출 / 모델 호출 분리 |
| 실행 모델 | 단계마다 사람 체크포인트 (`/build auto`는 계획 1회 승인 후 자율) | 태스크마다 맥락이 빈 subagent(보조 에이전트) + worktree 격리 | 단일 에이전트 + 가벼운 가이드 |
| 특징 | ship 단계에서 리뷰 페르소나 4종 병렬, 스킬 자체를 검증하는 CI eval, "테스트는 나중에" 같은 합리화에 대한 반박 표 | 2~5분 단위 태스크 계획(정확한 파일 경로 포함), 태스크 사이마다 코드리뷰 | `grilling` — 한 번에 한 질문, 의존관계를 따라가며 요구를 캐는 원시 도구 |
| 강점 | 커버리지가 가장 넓다(보안·성능·관측성·CI/CD·폐기), 팀 표준 어휘 | 모호한 탐색 과제, 승인 후 방치 가능, 부분만 떼어 쓰기 쉽다 | 요구가 흐릴 때 가장 날카롭다, 읽고 고치기 쉽다 |
| 약점 | 의견이 강하고 서로 얽혀 확장하면 라우팅 충돌, 조립성 낮음 | 작고 명확한 작업엔 프로세스 과부하 | 긴 사이클 커버리지가 얕고 사람이 더 붙어야 한다 |
| 이럴 때 | 보안 리뷰를 거쳐 운영까지 가는 기능, 팀 표준화 | 아키텍처가 모호한 큰 작업, 위임하고 손 떼고 싶을 때 | 병목이 "무엇을 만들지 모른다"일 때 |

- **셋 다 안 맞는 경우**: 작고 명확한 작업. 프로세스 비용이 이득을 넘는다.
- **벤치마크는 없다.** 세 프레임워크를 스킬 없는 맨 프롬프트와 비교한 공개 실험이 아직 없다.
  컨텍스트를 잡아먹는 비용이 간단한 작업에서는 손해일 수 있다 — 성능 수치가 아니라
  "내가 얼마나 통제하고 싶은가"의 선택으로 보는 게 맞다.
- 비교 출처: [Superpowers vs Agent Skills vs Pocock — dev.to/jamilxt](https://dev.to/jamilxt/superpowers-vs-agent-skills-vs-pocock-three-philosophies-of-ai-coding-workflows-e6n)
  · 카탈로그 항목: [Agent Skills](../../plugins/agent-skills/) · [Superpowers](../../plugins/superpowers/)

## 언제 쓰는가

- 새 노트북·서버를 세팅하면서 자주 쓰는 스킬을 한 번에 깔고 싶을 때
- Claude Code·Codex·Jcode·Pi·Gemini CLI·Cursor·Kiro·OpenCode를 섞어 쓰는데, 규칙과 스킬을
  도구마다 따로 복사하기 싫을 때 — `~/.agents/` 하나만 고치면 전부 따라온다
- **환경이 깨졌을 때** — 에이전트가 "그 스킬 없다"고 하면 그대로 다시 돌린다

## 무엇을 하는가

1. 손대기 전에 **현재 상태를 전부 기록**한다 (`inventory.tsv`) — 이게 없으면 나중에 복구할 수 없다.
   같은 단계에서 **플랫폼을 확정**한다. macOS와 Windows는 같은 프롬프트의 다른 분기를 타고, 명령마다
   `macOS:` / `Windows:` 라벨이 붙는다. Windows는 클론 전에 개발자 모드(심링크 권한)·`core.longpaths`·
   `core.autocrlf` 세 가지를 먼저 확인한다.
2. **워크플로 세트를 하나 고르게 한다** — 비교표를 띄우고 A/B/C를 묻는다. 답을 받기 전에는 스킬을
   깔지 않는다. 이미 다른 세트가 깔려 있고 다른 걸 고르면 **쌓지 않고 교체**한다: 기존 링크를
   `~/.agents/disabled-skills/<세트>-<시각>/`으로 옮기고(지우지 않는다) 이름을 `skills-excluded`에
   적는다. 이 마지막 단계가 핵심이다 — 링크만 옮기면 다음 relink에서 조용히 되살아난다.
3. `~/.agents/`를 단일 출처로 만든다 — `AGENTS.md`(공통 규칙) + `skills/`(심링크) + `sources/`(클론).
4. 상류 레포를 클론하고, 각 스킬을 `~/.agents/skills/<name>`으로 심링크한다. **이미 있으면 업데이트, 깨졌으면 복구.**
5. 설치된 CLI를 감지해 각 도구의 규칙 파일·스킬 폴더를 `~/.agents/`로 심링크한다.
6. CLI 바이너리와 MCP 서버를 설치하고, **실제 핸드셰이크로 응답을 확인**한다. `rtk`도 여기서 깔고
   `rtk init -g`로 각 에이전트에 훅을 붙인다.
7. **ai-memory 서버 하나**를 네이티브로 깔고 감지된 모든 에이전트를 거기에 붙인다. **로그인할 때
   자동으로 뜨도록** 등록까지 한다(macOS LaunchAgent / Windows 로그온 예약 작업). 임베딩·리랭커·
   자동개선 스케줄러는 전부 끈 상태가 기본이고, 어시스턴트 답변 캡처도 켜지 않는다.
8. 코드베이스 인덱서 MCP(codebase-memory-mcp 등)를 **찾아서 목록만 보여주고, 사용자가 승인하면** 제거한다.
   ai-memory는 인덱서가 아니라 세션 기억이므로 이 목록에 넣지 않는다.
9. 읽기 전용 감사 스크립트를 남긴다 — 나중에 깨졌는지 확인하는 용도.

## 함정

전부 실제로 터진 것들이다. 프롬프트에 각각 방어 조항이 들어 있다.

- **디렉터리가 있다고 설치된 게 아니다 (이번 최대 함정)**: 중간에 죽은 설치기는 **이름만 맞는 빈 폴더**를
  남긴다. 에이전트는 "스킬 없음"이라 하는데 `ls`에는 보이는 상태가 된다. 실제로 심링크 43개가 이렇게
  날아갔다. 판정은 반드시 `SKILL.md`가 **읽히는지**로 해야 하고 `[ -d ... ]`는 쓰면 안 된다.
- **`git pull` 한 번에 스킬이 조용히 사라진다 (재설치보다 위험)**: 상류 레포가 루트에 있던 `SKILL.md`를
  표준 레이아웃인 `skills/<이름>/`으로 옮기면, 링크는 멀쩡하고 폴더도 그대로라 `ls`로는 아무 이상이
  없는데 스킬만 증발한다. 2026-08-07 실행에서 `context-diet`·`clean-code`·`herdr` 세 개가 한 번의
  갱신으로 이렇게 죽었다. **pull 뒤에는 반드시 링크 너머의 `SKILL.md`를 다시 확인하고**, 없으면 소스
  안에서 찾아 재타겟해야 한다. 위의 "빈 폴더" 함정과 증상이 같지만 원인은 *성공한* 업데이트다.
- **상류에 새로 생긴 스킬은 티가 안 나게 빠진다**: 깨진 링크도, 빈 폴더도 아니라서 감사 스크립트가
  전부 통과시킨다. `git pull`은 소스만 최신으로 만들 뿐, 링크를 새로 만들어주지는 않기 때문이다.
  Matt Pocock 저장소는 계속 스킬이 추가되고(실제로 `wait-what`·`writing-for-agents`가 이렇게 누락돼
  있었다), 설치 목록을 프롬프트에 박아두면 그 시점에서 굳는다. pull 뒤에는 반드시 소스의 `SKILL.md`
  전체를 다시 열거해 링크 집합과 차집합(diff)을 내고, 새로 생긴 것만 추가해야 한다.
- **설치 스크립트가 만든 백업이 스킬로 로드된다 (skill-curator)**: `install.sh`는 파괴적이지 않다 —
  기존 폴더를 지우는 대신 `skill-curator.bak.<타임스탬프>`로 옮긴다. 문제는 그 폴더가 **스킬 폴더 안에**
  남고 `SKILL.md`도 멀쩡해서, 하네스가 거의 똑같은 스킬을 하나 더 읽는다는 점이다. 게다가 심링크가 아니라
  복사본을 깔기 때문에 `~/.agents`가 더 이상 단일 출처가 아니게 된다. 그래서 이 프롬프트는 install.sh를
  쓰지 않고 클론 후 직접 심링크한다.
- **일부러 자동 호출을 꺼둔 스킬이 있다**: `skill-curator`의 `disable-model-invocation: true`는 고장이
  아니라 설계다. 스킬 라이브러리를 실제로 바꾸는 도구라 사용자가 직접 부를 때만 동작해야 한다. `ask-matt`에
  적용하는 플래그 정규화를 여기까지 넓히면 안 된다.
- **rtk가 공용 지시문 파일을 건드린다**: `rtk init -g`는 `~/.claude/CLAUDE.md`에 `@RTK.md` 한 줄을
  덧붙인다. 그런데 7단계에서 그 경로는 **정본 `~/.agents/AGENTS.md`로 가는 심링크**라, Claude 전용
  한 줄이 Codex·Jcode·Pi·Gemini·OpenCode·Kiro가 함께 읽는 파일에 박힌다. 그 에이전트들에는 `RTK.md`가
  없어 매 세션이 깨진 include로 시작한다. rtk는 7단계 **전에** 돌리고, 끝난 뒤 정본이 규정된 내용
  그대로인지 다시 확인한다. 훅은 `settings.json`에 있으므로 그 줄을 지워도 rtk는 정상 동작한다.
- **폴더 이름이 달라도 스킬 이름은 겹칠 수 있다**: 판정 기준은 폴더명이 아니라 `SKILL.md`의 `name:`이다.
  `debug-code`와 `debug-code-skill`처럼 이름이 다른 두 폴더가 같은 `name: debug-code`를 선언하면 둘 중
  하나만 로드되고, 어느 쪽이 이길지는 알 수 없다. 지우지 말고 한쪽을 `skills-bak`으로 아카이브한다.
- **검증 스크립트가 거짓말을 한다 (zsh 카운터)**: zsh/bash에서 `local n=0` 뒤에 `n+=1`은 덧셈이 아니라
  **문자열 이어붙이기**다. 그래서 "엔트리 1111111111111111111개" 같은 수치가 나오는데 나머지 줄은
  멀쩡해 보인다. 카운터는 `local -i n=0`으로 선언한다.
- **감사 실패 조건을 넓게 잡으면 신호가 죽는다**: 스킬 폴더에는 스킬이 아닌 것(개인 메모, 도구가 관리하는
  번들)도 산다. 이걸 손상으로 세면 매번 "DAMAGE FOUND"가 뜨고, 두세 번 지나면 아무도 안 본다. 실패
  판정은 **빈 폴더와 깨진 링크 0** 두 가지로만 하고 나머지는 사람이 읽을 경고로 남긴다.
- **상류 설치 스크립트가 `rm -rf`를 한다**: `mattpocock/skills/scripts/link-skills.sh`는 dev 전용이라
  기존 실디렉터리를 지운다. 설치기는 실행 전에 읽고, 파괴적이면 백업 방식으로 다시 구현한다.
- **MCP 설치기가 에이전트 설정도 바꾼다**: MCP 설치 스크립트는 감지한 코딩 에이전트의
  MCP 설정·지침·스킬·훅까지 구성할 수 있다. 실행 전에 설치 스크립트를 읽고, 자동 설정이 불필요하면
  바이너리만 설치한 뒤 기존 설정 규칙에 맞춰 수동 등록한다.
- **MCP `cwd` 하드코딩**: 설치기가 실행된 디렉터리를 전역 설정에 박아버린다. 지워야 어느 프로젝트에서든
  올바르게 동작한다.
- **사용자 소유 심링크가 같이 날아간다**: `~/.agents` 밖 개인 레포를 가리키는 링크는 복구 대상에서
  누락되기 쉽다. 그래서 손대기 전 인벤토리가 필수다.
- **버전 매니저가 비대화형 셸에서 안 깨어난다**: `node`가 nvm shim으로 잡혀 `command not found: _load_nvm`이
  나는데 `/opt/homebrew/bin/node`는 멀쩡하다. 인터프리터는 절대경로로 고정한다.
- **자기 안에서 도는 도구는 자기를 업데이트 못 한다**: herdr 세션 안에서 `herdr update`를 하면 다운로드만
  되고 교체가 막힌다. 우회하지 말고 사용자에게 명령을 넘긴다.
- **브라우저는 에이전트가 끝까지 못 깐다 (ego lite)**: DMG 설치까지는 스크립트로 되지만, `ego-browser`
  명령을 `~/.local/bin`에 등록하는 건 앱 **첫 실행 GUI 온보딩**이다. 사람이 끝내기 전에는 "설치됨"이
  아니고, Chrome 데이터 이관 여부는 에이전트가 대신 답하면 안 된다. 그래서 프롬프트는 5b에서 멈추고
  기다린다. macOS 전용이라 Windows·Linux에서는 ego lite만 `SKIPPED-UNSUPPORTED`로 기록한다.
  브라우저 자동화가 필요하면 해당 플랫폼에서 Playwright를 설치해도 된다.
- **이전 설정의 형제 파일이 남는다**: 지시문 정본을 바꿔도 `~/.kiro/steering/`에 남은 옛 파일이 같이
  로드된다. 디렉터리를 훑어 잔재를 정리해야 한다.
- **심링크 권한 + 파일/폴더 구분 (Windows 핵심 함정)**: 심볼릭 링크는 개발자 모드나 관리자 권한이 필요하다.
  없으면 **파일은 하드링크**, **폴더(skills)는 정션(junction)** 으로 갈라야 한다. `mklink /H`는 폴더에
  안 통한다. macOS·Linux는 `ln -s` 하나로 둘 다 된다.
- **검증 스크립트가 상태를 바꾸면 안 된다**: 인자를 무시하는 스크립트에 `--dry-run`을 넘기면 점검이 아니라
  실행이 된다. 감사는 반드시 별도의 읽기 전용 스크립트로 한다.
- **rtk와 코드 인덱서 MCP는 목적이 겹친다**: rtk는 셸 출력을 압축해 토큰을 줄이는데, 코드베이스
  인덱서 MCP(codebase-memory-mcp 등)는 반대로 상시 도구 스키마와 인덱스 응답으로 컨텍스트를 채운다.
  그래서 프롬프트는 인덱서 MCP를 **찾아서 목록만 보여주고 제거는 사용자 승인을 받은 뒤** 실행한다.
  승인 없이는 아무것도 지우지 않고 `PENDING-USER`로 남긴다. 제거는 설정에서 항목을 떼어내기 전
  타임스탬프 백업을 먼저 뜬다.
  다만 **이름만 보고 찾으면 오탐이 난다**. `~/.claude/settings.json`의 `"mcp__serena"`는 서버 등록이
  아니라 context-diet가 그 서버를 **차단**해 둔 규칙이라, 지우면 사용자가 꺼둔 걸 다시 켜는 셈이 된다.
  주석 처리된 블록과 `enabled: false` 항목도 등록이 아니다. `mcpServers`/`[mcp_servers.*]` 아래
  살아있는 등록인지 확인한 것만 목록에 올린다.
  **ai-memory는 이 목록에 넣지 않는다.** 레포를 인덱싱하는 게 아니라 세션 관측과 핸드오프를 저장하는
  쪽이고, 6단계에서 방금 기본 구성으로 깐 것이다.
- **`ai-memory-wrapper.ps1`/`.cmd`는 런처가 아니다**: 이름만 보면 네이티브 실행 래퍼 같지만 실제로는
  모든 명령을 `akitaonrails/ai-memory` **Docker 컨테이너로 넘긴다**. Docker가 없으면 exit 127이다.
  이 프롬프트는 네이티브 설치를 지시하므로 이 두 파일은 쓰지 않는다.
- **Windows 재시작 보장은 macOS와 다르다**: launchd `KeepAlive`와 systemd `Restart=always`는 어떤
  종료든 무한 재기동하지만, 예약 작업의 `-RestartCount 3`은 **실패했을 때만** 3번까지다. 정상 종료는
  실패가 아니라서 Windows만 서버가 안 돌아온다. 동등하게 하려면 5분 반복 트리거 + `IgnoreNew`를 건다.
- **Windows에서 조용히 무너지는 세 가지**: ① 심링크는 개발자 모드나 관리자 셸 없이는 거부된다 —
  폴백(Junction·복사)으로 흘러가면 "허브 하나" 모델 자체가 깨지므로 먼저 켜라고 말해야 한다.
  ② `~/.agents/sources/<owner>/<repo>/skills/<name>/references/...`는 260자를 넘겨 clone이
  `Filename too long`으로 죽는다(`core.longpaths true`). ③ `core.autocrlf=true`면 클론된 훅 `.sh`가
  CRLF가 되어 Git Bash·WSL에서 `bad interpreter`로 죽는다(`core.autocrlf input`).
- **PowerShell에서 `Test-Path`는 링크를 따라간다**: 끊어진 심링크와 없는 경로가 똑같이 False다.
  9단계가 게이트로 삼는 broken link 카운트가 항상 0이 되어 감사 스크립트가 거짓말을 한다.
  `Get-Item -Force`의 `.LinkType`·`.Target`으로 분류하고, `Junction`도 링크로 세야 한다.
- **Windows 로그온 작업은 S4U로 걸어야 한다**: 평범한 `AtLogOn` 작업은 콘솔 실행 파일을 대화형 세션에
  띄워서 로그인마다 검은 창이 뜨고, 그 창을 닫으면 서버가 죽는다. `-LogonType S4U`는 같은 계정·같은
  프로필로 창 없이 돈다. SYSTEM이나 `-RunLevel Highest`는 금지 — 데이터 디렉터리가 사용자 프로필
  안이라 빈 기억이 하나 더 생긴다.
- **omp(oh-my-pi)는 Pi와 별개 에이전트다**: `~/.pi`를 읽지 않고 `~/.omp/agent/` 트리를 쓴다. 기본 키트가
  아니므로 설치하지 않고, 있으면 감지해 연결만 한다. 스킬 로딩은 디렉터리 확인이 아니라 omp 엔진에 스킬
  목록을 직접 물어봐야 검증이다 — 2026-08 Windows 실행에서 "omp 스킬 로딩 미확정"이 남은 이유가 정확히 이
  검증 생략이었다. 또한 ai-memory 로그온 작업 등록에는 관리자 셸이 필요하다: 일반 셸에서는 액세스 거부로
  실패하며, 이게 전체 설치에서 유일한 상승 명령이다.
- **ai-memory 포트 49374는 임시 포트 대역 안이다**: macOS는 49152–65535를 아무 프로세스에나 먼저
  나눠 준다. 실제로 OpenCode 백그라운드 서비스(`opencode2 serve --service`)가 49374를 잡고 있어
  서버가 못 떴다. 그 프로세스를 죽이면 붙어 있던 세션이 끊기므로 죽이지 말고, `config.toml`의
  `bind`와 `server_url`을 대역 밖(예: `39374`)으로 옮긴다. 그러면 재부팅해도 다시 안 겹친다.
- **서버가 안 떠 있으면 조용히 실패한다**: ai-memory는 스스로 뜨지 않는다. 훅은 그대로 발사되지만 갈
  곳이 없어 그냥 실패하고, 에이전트는 공유 기억이 없는 채로 계속 일한다. 그래서 프롬프트는 자동 시작
  등록(macOS `~/Library/LaunchAgents` plist, Windows 로그온 예약 작업)을 **묻지 않고** 하도록 되어
  있다. plist를 만든 것과 서버가 도는 것은 다르다 — `launchctl bootstrap` 뒤에
  `lsof -nP -iTCP:39374 -sTCP:LISTEN`로 LISTEN을 눈으로 확인한다. `kickstart` 없이 `bootstrap`만으로
  떴다면 로그인 때도 뜬다는 뜻이다(같은 RunAtLoad 경로).
- **launchd는 `~`도 로그인 셸도 모른다**: plist에 `ai-memory`나 `~/.local/bin/...`를 쓰면 exit 127로
  30초마다 영원히 재시도한다. 절대 경로(`/Users/<me>/.local/bin/ai-memory`)와 `PATH`·`HOME`을 plist
  안에 직접 박아야 한다. 반대로 **포트는 plist에 쓰지 않는다** — `config.toml`의 `bind`만 단일 출처로
  두어야 나중에 포트를 옮겨도 둘이 어긋나지 않는다.
- **죽은 LaunchAgent는 계속 되살아난다**: 프로그램이 사라진 plist도 `KeepAlive`가 붙어 있으면
  `ThrottleInterval`마다 재시도하며 CPU를 태운다. 실제로 이 머신에는 `~/.agentmemory/start.sh`(없는
  파일)를 가리키는 `dev.agentmemory.server`가 202번 exit 127을 반복하고 있었다. `launchctl list`의
  종료 코드 열이 0이 아니면 도는 게 아니라 크래시 루프다.
- **ai-memory는 LLM 로그인 전에 provider를 켜면 기동을 거부한다**: `llm_provider`만 써두고
  `auth login`을 안 하면 `provider not configured`로 죽는다. 순서가 곧 함정이다 — 로그인을 먼저
  끝내거나, 두 키를 아예 빼면 된다. LLM 없이도 검색과 규칙 기반 요약은 정상 동작한다.
- **`~/.local/bin` 심링크로 부르면 훅 설치기가 훅을 못 찾는다**: `install-hooks`는 *호출된 경로* 옆의
  `hooks/`를 찾기 때문에 `could not locate hooks directory`로 실패한다. 압축을 푼 `hooks/` 트리를
  데이터 디렉터리(`~/Library/Application Support/ai-memory/hooks`)로 복사해 두면 어느 경로로 불러도 된다.
- **`--project-strategy repo-root`를 빼면 기억이 쪼개진다**: 기본값은 현재 폴더 이름이라, 세션 도중
  하위 폴더로 `cd` 한 번만 해도 그 뒤 관측이 유령 프로젝트에 쌓인다. 증상이 조용해서 나중에야 안다.

아래 프롬프트를 에이전트 채팅창에 그대로 붙여넣으세요.

<div class="copy-cta">
  <div class="copy-cta__row">
    <div>
      <div class="copy-cta__title"><span data-lang="en">Copy the full prompt</span><span data-lang="ko">프롬프트 전문 복사</span></div>
      <div class="copy-cta__sub"><span data-lang="en">Copies only the code block below (the prompt itself, without the notes) — no dragging needed.</span><span data-lang="ko">아래 코드블록(설명 제외, 프롬프트 본문만)을 통째로 클립보드에 담습니다. 드래그할 필요 없습니다.</span></div>
    </div>
    <button type="button" class="btn btn-primary pc-copy copy-cta__btn" data-target="#pc-mainblock" aria-label="Copy the full prompt" data-aria-en="Copy the full prompt" data-aria-ko="프롬프트 전문 복사">
      <svg class="pc-ico-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
      <svg class="pc-ico-check hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
      <span class="pc-copy-label"><span data-lang="en">Copy prompt</span><span data-lang="ko">프롬프트 복사</span></span>
    </button>
  </div>
</div>

```text
Set up and maintain a global coding-agent environment on native macOS or native Windows PowerShell.
ONE PROMPT, TWO BRANCHES: section 0b resolves the platform once, and every platform-specific step is
labelled 'macOS:' / 'Windows:'. Run only your branch; never translate the other one by hand.
The process must be IDEMPOTENT and SELF-HEALING: if an item already exists, update or repair it —
never duplicate it, never delete my work to make room for it.

=== 0. GROUND RULES (apply to every phase) ===

DEFINITION OF "INSTALLED". A skill counts as installed only if <skills-dir>/<name>/SKILL.md is
READABLE and non-empty. A directory that exists is not evidence of anything — an interrupted
installer leaves empty directories with correct names, and every agent then reports the skill as
missing while the filesystem claims it is there. Never test with [ -d ... ].

NEVER DESTROY TO INSTALL. Do not run rm -rf, git clean, or any recursive delete on a path you did
not create in this run. To replace something, mv it into the timestamped backup directory first.
This applies to upstream installer scripts too: read them before running them, and if one does
rm -rf on existing targets, do not run it — reimplement its linking step with backup semantics.

GLOBAL SCOPE ONLY. Many tools ship an "install" command that claims to be global but writes into
the current working directory's repository. Before running any third-party installer, run its
--dry-run and read the file list. If it would touch a file inside a git repository you did not
create, do not run it in that mode; restrict it to global-only flags/platforms. If a repo file is
modified anyway, revert that hunk and report it.

DO NOT PASS FLAGS TO YOUR OWN SCRIPTS THAT THEY DO NOT IMPLEMENT. A script that ignores an
unrecognised --dry-run will silently perform its real, mutating work while you believe you are
inspecting. Verification must use a separate, provably read-only script.

RESOLVE INTERPRETERS TO ABSOLUTE PATHS. Version managers (nvm, pyenv, rbenv) frequently do not
initialise in a non-interactive shell — 'node' may resolve to a broken shim. Detect the real
binary path once and use it everywhere.

=== 0b. PLATFORM BRANCH (resolve once, then obey it everywhere) ===

Resolve PLATFORM = macos | windows | linux in step 1 and record it in ~/.agents/install-manifest.json.
Every step below that offers two forms labels them 'macOS:' and 'Windows:'. THE LABELS ARE THE
INSTRUCTION, NOT A COURTESY — run only the branch that matches PLATFORM, and never hand-translate a
macOS command when a Windows branch is printed a few lines away.

Where a command is unlabelled, this table is the translation. Use it instead of guessing:

  home                macOS  ~                          Windows  $HOME  (see the ~ warning below)
  scripts you write   *.sh (bash)                       *.ps1 (write for 5.1, prefer 7)
  process list        ps -axo pid,%cpu,rss,command      Get-Process / Get-CimInstance Win32_Process
  listening port      lsof -nP -iTCP:<p> -sTCP:LISTEN   Get-NetTCPConnection -LocalPort <p> -State Listen
  checksum            shasum -a 256                     Get-FileHash -Algorithm SHA256
  archive             tar -xzf <a>.tar.gz               Expand-Archive <a>.zip   (Windows assets are ZIP)
  python              python3                           py -3, python, python3 — first one that runs
  directory link      ln -s                             New-Item -ItemType SymbolicLink, else Junction
  file link           ln -s                             New-Item -ItemType SymbolicLink, else HardLink
  service at login    ~/Library/LaunchAgents plist      Scheduled Task, AtLogOn trigger, S4U principal

'~' IS NOT PORTABLE INTO A NATIVE BINARY. PowerShell expands ~ for its own cmdlets, so Get-Content
~/x.md works — but 'ai-memory.exe --data-dir ~/x' passes a LITERAL tilde to the .exe, which then
creates a folder actually named '~'. Every path you hand to a native binary or write into a config
file must be fully expanded first. The same applies to 'python3' on Windows: resolve the interpreter
once (py -3, python, python3 — whichever runs) and store the ABSOLUTE path, per section 0's
interpreter rule. A bare 'python3' may be the Microsoft Store app-execution alias, which opens the
Store instead of running your script.

WINDOWS PREREQUISITES — CHECK ALL THREE IN STEP 1, BEFORE THE FIRST CLONE. They cause most of the
silent failures on Windows, and every one of them looks like something else:
 - SYMLINK PRIVILEGE. PROVE IT BY CREATING ONE, NOT BY READING A REGISTRY KEY. Make a throwaway link
   in a temp directory, check it, delete it, and branch on the ACTUAL error. Developer Mode
   (HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock -> AllowDevelopmentWithoutDevLicense = 1)
   is necessary but NOT sufficient: Windows PowerShell 5.1 does not request unprivileged symlink
   creation, so the same command that works in PowerShell 7 still fails with "required privilege is
   not held" in 5.1 with Developer Mode on. If the probe fails, report BOTH facts (Developer Mode
   state and $PSVersionTable.PSVersion) and TELL ME — turning on Developer Mode or running the
   linking step under pwsh 7 is a ten-second fix, whereas quietly falling through to junctions and
   copies ends the one-canonical-hub model this whole kit is built on.
 - LONG PATHS. ~/.agents/sources/<owner>/<repo>/skills/<name>/references/<file>.md passes 260
   characters routinely, and git aborts mid-clone with "Filename too long".
     git config --global core.longpaths true
 - LINE ENDINGS. core.autocrlf=true rewrites every cloned .sh to CRLF, and those hooks then die with
   "bad interpreter: no such file or directory" under Git Bash and WSL.
     git config --global core.autocrlf input
   A repo already checked out with CRLF must be re-checked-out, not hand-edited.

LINUX FOLLOWS THE macOS BRANCH, WITH THREE SUBSTITUTIONS. The labels below say 'macOS:' because that
is the platform this kit is written on; a macOS-labelled command is the POSIX branch and Linux runs it
unchanged UNLESS it names something macOS-only. Substitute those:
  brew install <x>                     -> the distro package manager, or the project's install.sh
  ~/Library/Application Support/<app>  -> ~/.local/share/<app>   (XDG data dir)
  ~/Library/LaunchAgents plist         -> a systemd --user unit  (recipe in 5c.9)
Release archives: use the linux-<arch> asset, never the macos-<arch> one. ego lite stays
SKIPPED-UNSUPPORTED, exactly as on Windows.

WSL IS A SEPARATE INSTALL AND THE HOST IS THE DEFAULT. Detect it independently, but do NOT install on
both sides unless I ask: install where my agents actually run, and report the other side as
NOT-INSTALLED with the single command that would install it. Two hubs across that boundary is the
same duplicate-skill failure as two workflow sets, plus /mnt/c path drift, CRLF drift, and symlinks
that resolve on only one side.

=== 1. DETECTION ===

Detect OS, architecture, Git, Node.js, Python 3.10+, and available package managers. For each
interpreter record the ABSOLUTE PATH THAT ACTUALLY WORKS IN A NON-INTERACTIVE SHELL.

Identify installed agents: Claude Code, Codex, Jcode, Pi, Hermes, Kiro, Antigravity/agy, Gemini CLI, OpenCode,
Cursor, Oh My Pi (omp — its config tree is ~/.omp and is SEPARATE from Pi's ~/.pi; never treat one as the other).
For each, record its global instruction file path and its global skills directory path — and
whether each is currently a real file/directory, a symlink, or absent.

Record PLATFORM (macos | windows | linux) and, on Windows, the result of all three prerequisite
checks from section 0b — symlink privilege, core.longpaths, core.autocrlf — BEFORE any clone. Report
them in step 11 even when they pass. Treat WSL as a separate environment and detect independently
within it, then apply the one-side rule from section 0b.

=== 2. PRE-FLIGHT INVENTORY (before touching anything) ===

Write ~/.agents/setup-backups/<timestamp>/inventory.tsv recording, for EVERY entry in every agent
skills directory and for every instruction file:

  path <TAB> kind(symlink|dir|file|absent) <TAB> target(if symlink) <TAB> has_SKILL.md

This inventory is the restore manifest. I keep my own symlinks pointing at personal repositories
outside ~/.agents; without this record you cannot tell a skill you installed from one I hand-linked,
and a later repair will silently drop mine. Treat any symlink whose target lies outside
~/.agents/sources as USER-OWNED: never retarget it, and restore it verbatim if a later step
removes it.

=== 3. LAYOUT AND BACKUP ===

  ~/.agents/sources/<owner>/<repo>     upstream repositories (shallow clones)
  ~/.agents/skills/                    canonical skills — one entry per skill
  ~/.agents/work/                      setup scripts and subagent briefs
  ~/.agents/docs/                      operator notes
  ~/.agents/install-manifest.json      machine-readable state
  ~/.agents/setup-backups/<timestamp>/ everything replaced this run

Back up every file BEFORE modifying it. Backups are timestamped and additive; never overwrite a
previous run's backup directory. Record the active backup path in ~/.agents/.last-backup.

=== 4a. WORKFLOW SET — ASK ME, THEN INSTALL EXACTLY ONE ===

A workflow set is the meta-skill layer that decides HOW the agent works: which phase it is in, which
skill to load, and when to stop for me. Three sets solve that same problem in incompatible ways, so
INSTALLING TWO IS A BUG, NOT A BONUS. Their routers (using-agent-skills, using-superpowers, ask-matt)
each claim the same incoming task and send it down a different pipeline; whichever loads first wins,
arbitrarily, and the other set's rules leak into it.

BEFORE INSTALLING ANY SKILL, SHOW ME THIS TABLE AND ASK WHICH SET I WANT. Present the default, wait
for my answer, and do not start step 4 until I answer. If I do not answer, or you are running
non-interactively, install A (Agent Skills) and say so in the report.

  Aspect        | A. Agent Skills (DEFAULT)      | B. Superpowers               | C. Matt Pocock Skills
  --------------|--------------------------------|------------------------------|--------------------------
  Source        | addyosmani/agent-skills        | obra/superpowers             | mattpocock/skills
  Philosophy    | encode the whole lifecycle,    | reason deeply up front, then | requirements first; refuses
                | human checkpoint each phase    | hands-off autonomous run     | to own your process
  Size          | 24 skills over 6 phases        | 6 pipeline stages            | many small modular skills
  Invocation    | 8 slash commands               | pipeline activates itself    | user-invoked and
                | /spec /plan /build /test       |                              | model-invoked kept separate
                | /review /code-simplify         |                              |
                | /webperf /ship                 |                              |
  Execution     | stop at each phase for me      | fresh subagent per task      | one agent, light guidance
                | (/build auto runs a whole      | in an isolated git worktree  |
                | approved plan on its own)      |                              |
  Signature     | 4 review personas fan out in   | 2-5 minute task granularity  | grilling: one question at a
                | parallel at ship; CI evals     | with exact file paths; code  | time, dependency-aware
                | that test the skills; explicit | review between every task    | requirements interrogation
                | rebuttals to rationalizations  |                              |
  Strongest     | breadth — security, perf,      | ambiguous exploratory work;  | when the bottleneck is an
                | observability, CI/CD,          | approve once and walk away;  | unclear spec; easy to read
                | deprecation; team vocabulary   | cherry-pick the pieces       | and rewrite yourself
  Weakest       | opinionated and interlinked;   | heavy overhead on small,     | thinner coverage on long
                | extending it risks routing     | well-defined tasks           | lifecycles; needs you in
                | conflicts; least composable    |                              | the loop more often
  Pick it when  | production features that go    | big task, fuzzy architecture,| you know roughly what to
                | through security review to     | you want to delegate and     | build but not exactly what
                | deploy; team standardization   | stop supervising             | it should do
  --------------|--------------------------------|------------------------------|--------------------------
  None of them fits a small, well-defined task — the process overhead outweighs the benefit.
  No published benchmark compares any of the three against plain prompting, so treat the choice as a
  preference about how much control you want, not as a measured performance claim.
  Comparison source: https://dev.to/jamilxt/superpowers-vs-agent-skills-vs-pocock-three-philosophies-of-ai-coding-workflows-e6n

RECORD MY ANSWER as WORKFLOW_SET=A|B|C in ~/.agents/install-manifest.json and in the step 11 report.
Every later step that says "the chosen set" reads that value.

IF A SET IS ALREADY INSTALLED AND I CHOOSE A DIFFERENT ONE, SWITCH — DO NOT STACK. Move the old set's
links out of ~/.agents/skills into ~/.agents/disabled-skills/<set>-<timestamp>/ (mv, never delete),
leave its source clone in place so the choice stays reversible, and add each moved skill name to
~/.agents/skills-excluded if that file exists. THAT LAST STEP IS THE ONE THAT MATTERS: a relink pass
walks the source tree and re-links every SKILL.md it finds, so a set that was only unlinked comes
back on the next run with no broken link or empty directory to reveal it.

=== 4. INSTALL SKILLS ===

Install the workflow set I chose in 4a, then every set-independent skill below it.

Clone or update once into ~/.agents/sources/<owner>/<repo>. Prefer each repository's official Agent
Skills installer ONLY IF it is non-interactive and non-destructive; otherwise clone and link yourself.

  --- THE WORKFLOW SET (install ONLY the one chosen in 4a) ---

  A. Agent Skills (DEFAULT)           https://github.com/addyosmani/agent-skills
                                      24 skills under skills/<name>/SKILL.md, all of them, no
                                      hand-picking. Router is using-agent-skills; the lifecycle is
                                      DEFINE -> PLAN -> BUILD -> VERIFY -> REVIEW -> SHIP.
                                      Clone to ~/.agents/sources/addyosmani-agent-skills and link each
                                      skills/<name>/ directory into ~/.agents/skills/<name>, so Codex and
                                      OpenCode pick them up through the hub with no second install.
                                      THREE CLAUDE-CODE-ONLY ASSETS DO NOT LIVE IN THE HUB, so link them
                                      separately or they are simply missing:
                                        - the 8 slash commands from .claude/commands/*.md into
                                          ~/.claude/commands/agent-skills/ — the SUBDIRECTORY NAME BECOMES
                                          THE COMMAND PREFIX (/agent-skills:build), which is what keeps
                                          /build from colliding with a command you already own
                                        - the 4 review personas from agents/*.md into ~/.claude/agents/
                                        - hooks/ stays OPT-IN: do not register its SessionStart hook
                                          unless I ask, and never on top of an existing session banner
                                      For Codex and OpenCode, the slash commands have no equivalent. If I
                                      want them, generate adapted copies (Codex: ~/.codex/prompts/,
                                      OpenCode: ~/.config/opencode/command/) with the 'agent-skills:'
                                      plugin prefix STRIPPED from the skill names in the body — copied
                                      verbatim, the prefixed name resolves to nothing on those agents.
                                      Do NOT use per-skill installs (npx skills add … --skill <name>):
                                      they copy skills/<name>/ without the repo-root references/
                                      directory, so the skill loads but its checklist links dangle.
                                      If the marketplace route is used instead, note it clones over SSH
                                      and fails with 'Permission denied (publickey)' without GitHub SSH
                                      keys; force HTTPS rather than generating keys unattended.

  B. Superpowers                      https://github.com/obra/superpowers
                                      Pipeline set: brainstorming -> git worktrees -> writing-plans ->
                                      subagent-driven-development -> TDD -> code review -> finish.
                                      Install only if I chose B in 4a.

  C. Matt Pocock Skills, incl. ask-matt  https://github.com/mattpocock/skills
                                      Install only if I chose C in 4a.
                                      INSTALL EVERY SKILL IN THIS REPO — do not hand-pick. After the
                                      clone/pull, enumerate every directory containing a SKILL.md under
                                      skills/ (today: skills/engineering, skills/misc, skills/productivity
                                      and skills/in-progress — 35 skills) and link all of them, including
                                      the in-progress ones and any category added later. Do not hardcode
                                      a skill list: upstream adds skills continuously, and a link set
                                      created by an earlier run goes stale without any broken link or
                                      empty directory to reveal it (wait-what and writing-for-agents
                                      landed this way and were simply absent). On every rerun, diff the
                                      enumerated upstream set against the existing links and install the
                                      difference — an install that is merely intact is not up to date.

  --- SET-INDEPENDENT SKILLS (install these whichever set was chosen) ---

  wait-what                           https://github.com/mattpocock/skills
                                      INSTALL THIS ONE FOR EVERY SET, INCLUDING A AND B. It lives in the
                                      Matt Pocock repo but it is not part of that workflow set: it is a
                                      six-line skill I type when a reply did not land, and it asks the
                                      agent to re-pitch with context, in Simplified Technical English,
                                      using the ubiquitous language from CONTEXT.md. It owns no
                                      pipeline and declares no router, so it cannot conflict with the
                                      chosen set.
                                      Clone the repo (shallow is enough) and link ONLY
                                      skills/productivity/wait-what as ~/.agents/skills/wait-what. Do not
                                      enumerate the rest of that repo unless set C was chosen.
                                      LEAVE 'disable-model-invocation: true' ALONE. It is deliberate —
                                      the skill exists for me to invoke at the moment I am confused, and
                                      a model that can invoke it will re-pitch on its own initiative. The
                                      router normalization further down applies to the chosen set's
                                      router only, never to this skill.
                                      IF SET C WAS CHOSEN, the full-repo enumeration already links this
                                      skill. Do not link it twice: two directories declaring
                                      'name: wait-what' means only one loads and which one is arbitrary,
                                      which is the duplicate family step 8 archives.
  Context Diet                        https://github.com/cskwork/context-diet-skill
  Autoresearch                        https://github.com/uditgoenka/autoresearch
  Call Agent                          https://github.com/cskwork/call-agent
  Archify                             https://github.com/tt-a1i/archify
  Impeccable (design default)         https://github.com/pbakaus/impeccable
                                      THE DEFAULT DESIGN SKILL for every frontend/UI task —
                                      replaces any earlier design skill in this kit.
                                      Use its official installer at GLOBAL scope with explicit
                                      providers so it never prompts:
                                        npx -y impeccable install --scope=global --providers=<detected>
                                      Run it from the home directory, never inside a repo, or it
                                      writes project-local files. This skill is NOT hub-symlinked:
                                      its installer owns the layout and writes per-agent copies
                                      plus detector hooks straight into each agent config — treat
                                      those writes like any other agent config (back up before,
                                      diff after). Update later with:  npx impeccable update
                                      (Codex must then reopen /hooks and re-approve the hook).
  GPT Image 2                         https://github.com/agentspace-so/agent-skills/tree/main/gpt-image-2
  Clean Code                          https://github.com/cskwork/clean-code
  Prompter                            https://github.com/cskwork/prompter
                                      SKILL.md sits at the repo ROOT, so link the repo directory itself
                                      as ~/.agents/skills/prompter. Learns your reply patterns locally
                                      and gates every proposal behind an explicit y/yes.
  Canvas UI Design                    https://github.com/cskwork/canvas-ui-skill
                                      SKILL.md at the repo ROOT; link as ~/.agents/skills/canvas-ui-design
                                      (the directory name must match the skill's name:, which is
                                      canvas-ui-design, not the repo name).
  Verify                              https://github.com/cskwork/verify-skill
                                      Clone and link as ~/.agents/skills/verify. SKILL.md sits at the
                                      repo ROOT, not under a skills/ subdirectory, so link the repo
                                      directory itself. After linking, run scripts/selftest.sh — it
                                      stands up a throwaway server and checks the harness in about 20
                                      seconds; 22/22 means the install works. Needs curl and jq.
                                      Windows: the selftest is a bash script. Run it under Git Bash
                                      (bash scripts/selftest.sh) with jq present
                                      (winget install jqlang.jq). If there is no bash, link the skill
                                      anyway and report the selftest as SKIPPED-UNSUPPORTED — do NOT
                                      claim 22/22 you did not run.
  Debug Code                          https://github.com/cskwork/promptbox
                                      Clone the promptbox repo, then link src/content/skills/debug-code
                                      as a skill directory. The skill ships its SKILL.md and two reference
                                      files embedded in the promptbox .md body; materialise them into
                                      ~/.agents/skills/debug-code/ with the SKILL.md frontmatter
                                      (name: debug-code) and a references/ subfolder. Take the reference
                                      FILENAMES from the links inside SKILL.md, not from this prompt —
                                      they are currently production-probes.md and production-bug-patterns.md,
                                      and inventing names here silently breaks every link in the skill.
  Skill Curator                       https://github.com/cskwork/skill-curator
                                      Inventories, validates, deduplicates, archives, and restores the
                                      skill library this prompt builds — the maintenance counterpart to
                                      the step 9 audit. Clone the repo and link skills/skill-curator like
                                      any other skill. Do NOT use its install.sh for a hub install: it
                                      COPIES the package instead of linking, so the hub stops being the
                                      single source, and when a copy already exists it renames it to
                                      skill-curator.bak.<timestamp> INSIDE the skills root — a dated
                                      directory carrying a valid SKILL.md, which every harness then loads
                                      as a second, near-identical skill. That is exactly the duplicate
                                      family step 8 archives.
                                      Its frontmatter sets 'disable-model-invocation: true' BY DESIGN: it
                                      mutates a skill library and must stay user-invoked. Leave that flag
                                      alone — the normalization above applies to ask-matt only.
                                      Requires Python 3.9+. Verify with the engine, not the directory:
                                        macOS:   python3 ~/.agents/skills/skill-curator/scripts/curator.py --help
                                        Windows: py -3 $HOME\.agents\skills\skill-curator\scripts\curator.py --help
                                      On Windows 'python3' normally resolves to the Microsoft Store
                                      stub, which exits 9009 without running anything — that looks
                                      like a missing skill, not a missing interpreter.
  OfficeCLI                           https://github.com/iOfficeAI/OfficeCLI
  Herdr                               https://github.com/ogulcancelik/herdr
  ego-browser (browser QA + web automation)  https://github.com/citrolabs/ego-lite
    macOS ONLY. This is the browser layer for this kit — see step 5b for the app install.
    On non-macOS, skip both the app and the ego-browser skill and report SKIPPED-UNSUPPORTED.
    Skill-only route (macOS only): npx skills add citrolabs/ego-lite
    Installing the ego lite app also registers the skill into every agent skills directory, so run
    step 5b FIRST and then reconcile: if <skills-dir>/ego-browser already exists and points at
    ~/.local/share/ego/ego-skills, treat it as INSTALLED and do not clone a second copy.
    On non-macOS, Playwright MAY be installed as the browser-automation fallback when needed. It is
    separate from ego lite and must be reported by its own name. If Playwright or SuperQA already
    exists, inspect and reuse or update it rather than marking it SUPERSEDED or suggesting uninstall.

Derive each skill's canonical name from its SKILL.md frontmatter 'name:' field, not from the
directory name, and fail loudly on a collision instead of silently overwriting. Two directories with
different names can still declare the same 'name:' (a hand-installed standalone copy alongside the
one this prompt materialises). Only one of them will ever load, and which one is arbitrary. Report
both with their paths, keep the copy this prompt installs, and ARCHIVE the other to
~/.agents/skills-bak/<timestamp>/ — archive, never delete.

AFTER EVERY CLONE OR PULL, RE-VERIFY THE LINK — DO NOT ASSUME AN UPDATE IS SAFE. Upstream
repositories relocate SKILL.md as they adopt the standard skills/<name>/ layout. When that happens
the symlink still resolves, the directory still exists, and `ls` looks perfectly healthy — but
SKILL.md is gone and the skill has silently disappeared from every agent. This is the same
"directory is not evidence" failure as an interrupted installer, except a successful `git pull`
causes it. For each linked skill, after updating its source, confirm <link>/SKILL.md is readable and
non-empty; if it is not, search the source repo (skills/<name>/, then any SKILL.md within a few
levels, excluding .git) and retarget the link to the directory that actually holds it.

THE CHOSEN SET'S ROUTER MUST BE MODEL-INVOKABLE, or the global rules in step 7 point at a skill the
agent never loads. The router is using-agent-skills for set A, using-superpowers for set B, ask-matt
for set C. For set C only, upstream ships ask-matt as user-invoked, so after every clone/update
resolve the canonical ask-matt SKILL.md through its installed link and flip that one flag:
  - Back up the file before the first change.
  - If frontmatter says 'disable-model-invocation: true', change only that value to false.
  - If it is already false or the field is absent, leave it unchanged.
  - Do not change this flag for any other skill.
Treat this normalization as part of installation and repair, so reruns cannot restore the upstream
user-invoked default and silently hide ask-matt from an agent's available-skills catalog.
Sets A and B ship their routers model-invokable already — verify the frontmatter, change nothing.

=== 5. INSTALL STANDALONE TOOLS ===

Install or update via the official package manager. USE THE SAME MECHANISM THE TOOL IS ALREADY
INSTALLED WITH — switching from a curl installer to Homebrew (or pip to uv) leaves two binaries on
PATH and the wrong one wins.

  OfficeCLI           macOS:   brew install officecli
                      Windows: scoop install officecli
                               or  irm https://raw.githubusercontent.com/iOfficeAI/OfficeCLI/main/install.ps1 | iex
                      Either platform: npm install -g @officecli/officecli fetches the native binary.
                      Windows ships x64 AND arm64 builds, so ARM Windows is supported here.
  Herdr               macOS:   official installer (curl -fsSL https://herdr.dev/install.sh | sh),
                               brew install herdr, or 'herdr update'
                      Windows: powershell -ExecutionPolicy Bypass -c "irm https://herdr.dev/install.ps1 | iex"

  rtk                 https://github.com/rtk-ai/rtk — CLI proxy that compresses shell command
                      output (git, pytest, docker, kubectl, cargo, eslint, 100+ commands) before it
                      reaches the model's context.
                        macOS/Linux:  brew install rtk
                                      or  curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
                        Windows:      download the x86_64-msvc release binary, or cargo install --git https://github.com/rtk-ai/rtk
                      Do NOT 'cargo install rtk' from crates.io — an unrelated crate owns that name.
                      Ensure ripgrep is on PATH; some rtk filters shell out to it.
                        macOS:   brew install ripgrep
                        Windows: winget install BurntSushi.ripgrep.MSVC  (or scoop install ripgrep)
                      Wire it into every detected agent with:  rtk init -g
                      This writes hooks (Claude Code PreToolUse, Gemini CLI BeforeTool, OpenCode/Pi
                      plugins, Windsurf/Cline rules), NOT an MCP server. Treat those hook files like
                      any other agent config: back up before it writes, and if 'rtk init -g' would
                      overwrite an existing hook you did not create, back that hook up first and
                      report the diff.
                      IT ALSO EDITS THE GLOBAL INSTRUCTION FILE. 'rtk init -g' writes ~/.claude/RTK.md
                      and appends an '@RTK.md' line to ~/.claude/CLAUDE.md. Under step 7 that path is
                      a symlink to the single canonical ~/.agents/AGENTS.md, so this one line lands in
                      the file EVERY agent reads — and Jcode, Pi, Gemini, OpenCode, and Kiro have no
                      RTK.md next to their instruction file, so they each start every session with a
                      dangling include. Therefore: run this step BEFORE step 7, and after it re-verify
                      that the canonical file still contains exactly the step 7 content. If '@RTK.md'
                      (or any other agent-specific include) was appended, back the file up and remove
                      that line — the PreToolUse hook in settings.json is what makes rtk work; the
                      instruction-file include is not required for it.
                      Verify:  rtk --version   and   rtk gain
                      Restart each agent afterwards, or the hook is not loaded.

If a tool cannot update because the current session is running inside it (Herdr does this), do not
work around it. Report the exact command for me to run after I exit.

=== 5b. INSTALL THE ego lite BROWSER (macOS only) ===

ego lite is the browser both I and the agent drive. There is no Homebrew formula; it is a DMG.

 1. Skip this ego lite step on non-macOS and say so. On Windows and Linux, record only ego lite and
    its skill as SKIPPED-UNSUPPORTED. Do not improvise an ego lite install. Playwright may be installed
    separately as the browser-automation fallback when needed.
 2. If /Applications/'ego lite.app' or ~/Applications/'ego lite.app' already exists, do not
    reinstall — log UNCHANGED and go to 5b.5.
 3. Otherwise run the skill's own installer, which downloads the arch-correct DMG, installs the app,
    clears the quarantine attribute, and opens it:
      sh ~/.agents/skills/ego-browser/scripts/install.sh
    (read ego-browser/references/install.md before running it)
 4. STOP AND WAIT. First-run onboarding is a GUI step only I can complete: it asks whether to import
    Chrome data and it is what registers the 'ego-browser' command under ~/.local/bin. Do not click
    through it, do not answer the Chrome-migration question for me, and do not report this step as
    done before I confirm. If I am not present, mark it PENDING-USER and continue with the rest.
 5. Verify, without launching any browsing task:
      command -v ego-browser            (if missing: export PATH="$HOME/.local/bin:$PATH" and retry)
      ego-browser nodejs <<'EOF'
      cliLog('ego-browser ready')
      EOF
    Printing 'ego-browser ready' is the only acceptable proof. An app that exists is not proof.
 6. Do not open any site, log into anything, or run any task in my session while verifying.

=== 5c. INSTALL ai-memory (ONE SHARED MEMORY FOR EVERY AGENT) ===

ai-memory (https://github.com/akitaonrails/ai-memory) is part of the default kit: one local server
that every installed agent reads and writes, so what Claude Code worked out, Codex already knows.
Install it NATIVE. Do NOT install Docker, Ollama, LM Studio, vLLM, an embedding model, or any local
LLM for it. The default retrieval path is SQLite FTS5 + entities + graph neighbours and needs none
of those.

 1. INSTALL THE BINARY, THEN RECORD ITS ABSOLUTE PATH AS AI_MEMORY_BIN in the manifest. Every later
    step (hooks, MCP registration, autostart) uses that recorded value — do not re-guess the path.
    macOS: download ai-memory-macos-<arch>.tar.gz into ~/Applications/ai-memory, verify the published
      .sha256 BEFORE extracting (shasum -a 256 -c), extract, and symlink the binary onto PATH at
      ~/.local/bin/ai-memory. aarch64 = Apple Silicon, x86_64 = Intel.
    Windows: the asset is ai-memory-windows-x86_64.ZIP, not a tarball, so tar/shasum instructions do
      not apply — verify with Get-FileHash -Algorithm SHA256 against the published .sha256, then
      Expand-Archive into $env:LOCALAPPDATA\Programs\ai-memory. THERE IS NO windows-aarch64 BUILD:
      on ARM Windows stop here and report SKIPPED-UNSUPPORTED instead of downloading the x86_64
      archive. PROBE BEFORE CHOOSING THE PATH STRATEGY: on many Windows machines ~/.local/bin IS on
      the user Path (any machine with a Unix-style toolchain), and a copy of ai-memory.exe there is
      then the simplest route — check the actual user Path, do not assume either way. When it is not
      on PATH, append the install directory to the USER Path instead
      ([Environment]::SetEnvironmentVariable('Path', <old>+';'+<dir>, 'User')), and remember the
      change only reaches shells started afterwards. IGNORE ai-memory-wrapper.ps1 and
      ai-memory-wrapper.cmd in the release assets. Despite the names they are NOT launchers for the
      native binary — they forward every command into the akitaonrails/ai-memory Docker container and
      exit 127 when Docker is missing. Wiring a config to them contradicts the NATIVE rule at the top
      of this section and turns a working install into a Docker dependency.
    If ai-memory is already installed, update in place and PRESERVE the existing data dir, wiki, and
    config. Never run a destructive reset.

 2. STAGE THE HOOKS NEXT TO THE DATA DIR — READ THE RENDERED CONFIG FIRST. install-hooks looks for a
    hooks/ directory beside the path it was invoked as, so calling it through the ~/.local/bin symlink
    fails with "could not locate hooks directory". The data dir is
      macOS:   ~/Library/Application Support/ai-memory
      Linux:   ~/.local/share/ai-memory
      Windows: %LOCALAPPDATA%\ai-memory
    macOS: copy the extracted hooks/ tree to <data-dir>/hooks. That path is on the probe list, so every
      later invocation works no matter which path was used.
    Windows: run install-hooks WITHOUT --apply first and read what it renders. Recent releases emit the
      native 'ai-memory hook' invocation (the WindowsNative config) instead of hooks/<agent>/<event>.sh,
      and in that case there is nothing to stage. Copy the tree ONLY if the rendered config actually
      references a hooks/ path. If it does, copy it to %LOCALAPPDATA%\ai-memory\hooks and remember the
      .sh files inside must keep LF endings (section 0b) or the shell shims break.
      v1.30.0 and later self-stage on Windows: install-hooks --apply verifies and copies the hook
      scripts into <data-dir>\hooks\<agent> itself (log line 'verified N hook script(s) →'). Treat
      that line as staging DONE — do not copy the tree twice on top of it.

 3. INITIALISE ONLY IF NOT ALREADY INITIALISED:   ai-memory init

 4. PICK A PORT THAT IS STILL FREE NEXT WEEK. The documented default is 127.0.0.1:49374, but 49374
    sits INSIDE the macOS ephemeral range (49152-65535), so the OS can hand it to any process that
    asks first — OpenCode's background service takes it in practice. Check with
    the listener probe for this platform (section 0b): lsof -nP -iTCP:49374 -sTCP:LISTEN on macOS,
    Get-NetTCPConnection -LocalPort 49374 -State Listen on Windows. Windows has its own ephemeral
    range (dynamic ports start at 49152 there too), so this collision is not a macOS-only problem.
    If something holds the port, do NOT kill that process: set both
    bind and server_url in <data-dir>/config.toml to a port below the ephemeral range (39374 works)
    and use that port everywhere afterwards. Bind to 127.0.0.1 only, never 0.0.0.0, and do not
    expose it to the LAN.

 5. NO EMBEDDINGS — THAT IS THE DEFAULT, NOT AN OPTIMISATION. Leave every one of these UNSET:
    AI_MEMORY_EMBEDDING_PROVIDER, AI_MEMORY_EMBEDDING_BASE_URL, AI_MEMORY_EMBEDDING_MODEL,
    AI_MEMORY_EMBEDDING_DIM, AI_MEMORY_RERANKER. Absent IS disabled; there is no "off" value to
    write. Never run 'ai-memory embed'. If an embedding setting already exists specifically for
    ai-memory, back up the config first, then remove it. Afterwards 'ai-memory status' must report
    "embedding: disabled" and the models/ directory must still be empty.

 6. TURN OFF THE BACKGROUND SCHEDULER. The generated config.toml ships [auto_improve.scheduler] with
    enabled = true, which sweeps every project through an LLM once an hour. Set it to false and
    preserve every unrelated value in that file.

 7. LEAVE ASSISTANT CAPTURE OFF. Do not set capture_assistant and do not pass --capture-assistant to
    install-hooks. Assistant turns can quote code and secrets, and they would flow straight into a
    cloud LLM prompt.

 8. AN LLM PROVIDER IS OPTIONAL. Zero-LLM is a fully working tier: FTS5 + entity + graph retrieval
    with rule-based session summaries. Only if I ask for LLM-written summaries, use my existing
    ChatGPT/Codex subscription rather than a platform API key:
      ai-memory auth login openai-oauth      device-code flow — STOP AND WAIT, only I can approve it
    then set llm_provider = "openai-oauth" and llm_model = "gpt-5-mini" in config.toml. A mini-class
    model is correct here; consolidation and lint are summarisation, not reasoning.
    ORDER MATTERS: if a provider is configured and no token is stored, the server REFUSES TO START
    with "provider not configured". Finish the login first, or leave both keys out entirely.
    Never substitute OPENAI_API_KEY for this, and never print an access or refresh token.

 9. RUN EXACTLY ONE SERVER, AND MAKE IT START ITSELF AT LOGIN. Everything above is inert while the
    server is down: the hooks still fire, they just fail, and every agent silently loses the shared
    memory. Autostart is part of the default kit — INSTALL IT WITHOUT ASKING ME. Check for an
    existing listener before starting anything (section 0b's listener probe for this platform), and
    never end
    up with one process per agent, one data store per agent, or one wiki per agent.

    macOS — a LaunchAgent. It loads at LOGIN, not at boot, which is what I want: the data dir lives
    in my home. Write ~/Library/LaunchAgents/com.github.akitaonrails.ai-memory.plist:

      <?xml version="1.0" encoding="UTF-8"?>
      <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
        "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
      <plist version="1.0">
      <dict>
        <key>Label</key>             <string>com.github.akitaonrails.ai-memory</string>
        <key>ProgramArguments</key>  <array>
          <string>/Users/<me>/.local/bin/ai-memory</string>
          <string>serve</string><string>--transport</string><string>http</string>
        </array>
        <key>RunAtLoad</key>         <true/>
        <key>KeepAlive</key>         <true/>
        <key>ThrottleInterval</key>  <integer>10</integer>
        <key>EnvironmentVariables</key> <dict>
          <key>HOME</key> <string>/Users/<me></string>
          <key>PATH</key> <string>/Users/<me>/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
        </dict>
        <key>StandardOutPath</key>   <string>/Users/<me>/Library/Logs/ai-memory.out.log</string>
        <key>StandardErrorPath</key> <string>/Users/<me>/Library/Logs/ai-memory.err.log</string>
      </dict>
      </plist>

    ABSOLUTE PATHS ONLY — launchd expands no ~ and reads no login shell, so a bare 'ai-memory' or a
    tilde path exits 127 on every retry, forever. OMIT --bind: config.toml already carries bind and
    server_url, and a port repeated in the plist is how the two drift apart after step 4 moves it.
    Then load it and PROVE it, because a plist on disk is not a running server:
      plutil -lint ~/Library/LaunchAgents/com.github.akitaonrails.ai-memory.plist
      launchctl bootout   gui/$(id -u)/com.github.akitaonrails.ai-memory 2>/dev/null
      launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.github.akitaonrails.ai-memory.plist
      lsof -nP -iTCP:<port> -sTCP:LISTEN      -> must show ai-memory LISTEN
      ai-memory status                        -> same bind + data-dir as config.toml
    Use bootstrap, not kickstart, as that proof: bootstrap alone runs the same RunAtLoad path login
    uses, so a listener appearing after it IS the login evidence. Read the exit-status column of
    'launchctl list | grep ai-memory' too — a non-zero value there means crash-looping, not running.

    Windows — a per-user Scheduled Task with an AtLogOn trigger, registered AS ME. Use AI_MEMORY_BIN
    from step 1; do not invent a path here:
      $me  = "$env:USERDOMAIN\$env:USERNAME"          # bare USERNAME is ambiguous on domain-joined PCs
      $exe = <AI_MEMORY_BIN recorded in step 1>
      $act = New-ScheduledTaskAction -Execute $exe -Argument 'serve --transport http'
      $trg = New-ScheduledTaskTrigger -AtLogOn -User $me
      $pri = New-ScheduledTaskPrincipal -UserId $me -LogonType S4U -RunLevel Limited
      $opt = @{ AllowStartIfOnBatteries = $true; DontStopIfGoingOnBatteries = $true
                RestartCount = 3; RestartInterval = (New-TimeSpan -Minutes 1)
                ExecutionTimeLimit = (New-TimeSpan -Seconds 0) }   # 0 = never time out
      $set = New-ScheduledTaskSettingsSet @opt
      Register-ScheduledTask -TaskName ai-memory -Action $act -Trigger $trg -Principal $pri -Settings $set -Force
      Start-ScheduledTask -TaskName ai-memory
    REGISTERING AN S4U PRINCIPAL NEEDS AN ELEVATED SHELL — this is the ONE elevated command the whole
    setup requires. From a plain session Register-ScheduledTask fails with Access denied / 액세스가
    거부되었습니다; that is the elevation requirement, not a broken command. Write the block above to a
    .ps1 file and register it elevated exactly once:
      Start-Process pwsh -Verb RunAs -Wait -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File','<that .ps1>'
    (I approve the single UAC prompt), or print the script and hand it to me. After registration,
    Start-ScheduledTask, state checks, and repairs all run fine unelevated.
    -LogonType S4U IS THE POINT, NOT A DETAIL. A plain AtLogOn task launches a console executable in my
    interactive session, so a black console window pops up at every single logon and closing it kills
    the server. S4U runs the same task as me, with my profile and my data dir, without an interactive
    window and without storing a password. -RunLevel Limited keeps it unelevated on purpose.
    Verify: (Get-ScheduledTask ai-memory).State, (Get-ScheduledTaskInfo ai-memory).LastTaskResult
    (0 = ran cleanly), Get-Process ai-memory, and
    Get-NetTCPConnection -LocalPort <port> -State Listen. Do NOT register it under SYSTEM or with
    -RunLevel Highest: the data dir, config, and wiki live in my profile, and a SYSTEM copy would
    quietly build a second, empty memory next to mine.

    Linux (and WSL when systemd is running) — a user unit at ~/.config/systemd/user/ai-memory.service:
      [Unit]
      Description=ai-memory
      [Service]
      ExecStart=%h/.local/bin/ai-memory serve --transport http
      Restart=always
      RestartSec=10
      [Install]
      WantedBy=default.target
    Then: systemctl --user daemon-reload && systemctl --user enable --now ai-memory
    and loginctl enable-linger $USER — WITHOUT LINGER the unit is killed when my last session closes,
    which looks exactly like "it never started". Verify with systemctl --user is-active ai-memory plus
    the listener probe. On a WSL distro with no systemd there is no supported autostart: say so and
    give me the manual command instead of inventing one.

    THE THREE BRANCHES DO NOT RESTART ALIKE — SAY WHICH ONE I GOT. launchd KeepAlive and systemd
    Restart=always both relaunch after ANY exit, forever. A Scheduled Task's -RestartCount 3 fires
    only when the task FAILS, and gives up after three tries — a clean exit(0) is not a failure, so
    Windows alone will not bring the server back. If I want launchd-equivalent behaviour on Windows,
    add a repeating trigger (New-ScheduledTaskTrigger ... -RepetitionInterval (New-TimeSpan -Minutes 5))
    and leave MultipleInstances at IgnoreNew, so a five-minute tick restarts a stopped server and does
    nothing while one is already running.

    ONE SUPERVISOR, NOT TWO. No pm2, no brew services, no login-item wrapper script, and never an
    'ai-memory serve' line in my shell profile or PowerShell $PROFILE — that starts one server per
    terminal window. If a supervisor entry for ai-memory already exists, repair it in place instead of
    adding a second one. Then sweep for DEAD memory-server entries and report what you find — an
    entry whose program no longer exists respawns on every retry interval forever and burns CPU:
      macOS:   ~/Library/LaunchAgents (a plist whose ProgramArguments path is gone)
      Linux:   systemctl --user list-units '*memor*' and ~/.config/systemd/user
      Windows: Get-ScheduledTask | Where-Object TaskName -like '*memory*', the Startup folder
               ([Environment]::GetFolderPath('Startup')), and Get-CimInstance Win32_StartupCommand
    Give me the label or task name and the missing path, and ask before removing it.

10. WIRE EVERY DETECTED AGENT TO THAT ONE SERVER. For each agent found in step 1's detection, run
    BOTH commands, substituting the identifier:
      ai-memory install-mcp   --client <id> --apply
      ai-memory install-hooks --agent  <id> --project-strategy repo-root --apply
    Identifiers in current releases: claude-code, codex, open-code, cursor, gemini-cli,
    antigravity-cli, omp, kiro-cli, pi (hooks only), plus kimi-code, grok, devin, command-code,
    openclaw, and zero when those are installed. Do NOT invent an identifier: read
    'ai-memory install-mcp --help' and 'ai-memory install-hooks --help' first and use only what the
    installed version lists. Configure ONLY the agents actually present; do not install a new agent
    just because ai-memory supports it.
    ALWAYS pass --project-strategy repo-root. The default resolves the project from the current
    folder name, so one 'cd' into a subdirectory mid-session files the rest of that session under a
    phantom project and splits the memory. Run each command once WITHOUT --apply and read the
    rendered output before applying. --apply is idempotent, writes a timestamped backup first, and
    preserves unrelated MCP servers, hooks, permissions, models, and plugins — verify that by
    diffing against the pre-flight inventory, not by trusting the message.

11. TWO EXCEPTIONS.
    Pi has no mcp.json. 'install-mcp --client pi' deliberately prints guidance instead of writing an
    ignored file; the extension written by 'install-hooks --agent pi' carries lifecycle capture AND
    the MCP bridge. Do not hand-write ~/.pi/agent/mcp.json. Oh My Pi (omp) is a separate target with
    its own .omp paths — never conflate the two. Respect PI_CODING_AGENT_DIR when it is set.
    Hermes has no first-party installer. Do NOT run 'install-hooks --agent hermes' — that agent
    value does not exist. Merge an HTTP MCP entry into Hermes' own config instead, preferring its
    native command ('hermes mcp add ai-memory --url http://127.0.0.1:<port>/mcp'), preserve every
    existing mcp_servers entry and provider setting, and verify with 'hermes mcp list' and
    'hermes mcp test ai-memory'. Do not install the third-party ai-memory-hermes-plugin without
    asking me first.

12. RESTARTS AND TRUST PROMPTS ARE NOT OPTIONAL DETAILS. OpenCode, Pi, and Oh My Pi are wired
    through a generated TypeScript file and load it only on restart. Codex asks me to trust the new
    hooks on its next start. Report both as actions left for me rather than claiming capture is
    already live.

13. DO NOT TOUCH MY REPOSITORIES. This is a machine-level install. Do not insert ai-memory routing
    text into arbitrary AGENTS.md, CLAUDE.md, or README.md files across my projects.

=== 5d. Oh My Pi (omp) — DETECT AND WIRE ONLY; NEVER A DEFAULT INSTALL ===

omp (https://github.com/can1357/oh-my-pi) is a Pi-fork coding agent shipped as one native binary
with LSP, a real debugger drive, and browser automation built in. It is NOT part of the default
kit on any platform: this step only detects an EXISTING omp and wires it to the hub. Installing it
is my decision — if it is absent, report NOT-INSTALLED with the one command that would install it
  (macOS/Linux: curl -fsSL https://omp.sh/install | sh · Windows: irm https://omp.sh/install.ps1 | iex,
   bun >= 1.3.14 required) and move on. Never install it just because ai-memory or this kit knows
its identifier.

 1. DETECT: omp --version. Absent → report NOT-INSTALLED + the command above; done.
    Present → repair in place, never reinstall over it. Do NOT remove the standard Pi
    (@earendil-works/pi-coding-agent) either: omp is a separate agent with a separate config tree.
 2. omp DOES NOT READ ~/.pi. Its own tree lives under ~/.omp/agent/. Confirm the actual skills
    directory from 'omp --help' or its docs instead of assuming a name, then wire it to the hub
    exactly like every other agent: ~/.agents/skills is the single source, one link per entry (or
    one directory link) using this platform's link rules — junction, not symlink, when symlink
    privilege is absent (section 0b).
 3. VERIFY SKILL LOADING WITH THE ENGINE, NOT THE FILESYSTEM: start omp, ask it to list its
    available skills, and confirm hub skills appear. A linked directory omp cannot parse fails
    silently at startup and looks identical to a missing one in `ls`. This engine-level check is
    mandatory — 'directory exists' was never acceptable proof anywhere in this kit.
 4. Wire ai-memory with identifier 'omp' in step 10 (it writes ~/.omp/agent/), and report that omp
    loads generated extensions only on restart (step 12).

=== 6. MCP INTEGRATION ===

For any tool registering an MCP server:

 1. Set 'command' to the ABSOLUTE PATH OF THE BINARY YOU ACTUALLY INSTALLED. Installers routinely
    guess the wrong runner (writing 'uvx' for a pipx install), which makes the client download the
    package on every cold start and time out during handshake. This presents as "loading forever",
    not as an error.
 2. Remove any 'cwd' the installer hardcoded. A global config must not pin to whatever directory
    setup happened to run in.
 3. VALIDATE WITH A REAL HANDSHAKE BEFORE DECLARING SUCCESS: drive the server over stdio with
    initialize -> notifications/initialized -> tools/list, and report the measured time and tool
    count. A server that starts is not the same as a server that answers.

=== 6b. CODEBASE-INDEXER MCP SERVERS — FIND, THEN ASK BEFORE REMOVING ===

This kit's token strategy is rtk (compress shell output on the way in). Codebase-indexer MCP
servers pull the opposite way: they keep a large tool schema resident in every context window and
return long index payloads. Running both is redundant, so this step retires the indexers — but
REMOVAL IS NOT AUTOMATIC.

 1. Scan every detected agent's MCP config for codebase-indexing / code-graph / semantic-code-search
    servers. Match on purpose, not just on name. Known examples: codebase-memory-mcp, serena,
    claude-context, code-index-mcp, codegraph, sourcegraph/cody MCP, repomix-style whole-repo
    indexers. If a server's description says it indexes, embeds, or graphs a repository for search,
    it belongs on the list.
    ai-memory IS NOT ONE OF THESE. It stores session observations, summaries, and handoffs — it
    never indexes, embeds, or graphs a repository for code search, and step 5c just installed it as
    part of the default kit. Never put it on this list, and never remove it here.
    A NAME IS NOT A REGISTRATION. Grepping for these names hits things that are not servers, and
    "removing" them breaks unrelated configuration. Before listing an entry, confirm it is a live
    registration under an mcpServers / mcp / [mcp_servers.*] key. Specifically exclude: strings in a
    permissions.deny or allow list (e.g. "mcp__serena" in ~/.claude/settings.json is context-diet
    BLOCKING that server, not enabling it — deleting the line re-enables what the user chose to turn
    off), commented-out config blocks, and entries already marked disabled/enabled:false. Also note
    that MCP servers can be registered per-project rather than globally (~/.claude.json stores them
    under projects.<path>.mcpServers); report the project path so I can tell global from local.
 2. Report the list: server name, which agent config file, and the exact lines. Also report any
    SessionStart hook or instruction-file paragraph that tells agents to prefer those tools
    (e.g. a "Code Discovery Protocol" block) — leaving that behind after removing the server makes
    every session start with instructions for tools that no longer exist.
 3. STOP AND ASK ME. Do not remove, disable, comment out, or rename anything until I say yes.
    Ask once, listing everything, and let me approve all / some / none. If I am not present or do
    not answer, change nothing and mark each entry PENDING-USER-CONSENT.
 4. Only for the entries I approve: back up each config file into the timestamped backup directory
    FIRST, then remove just those server entries and the hook/instruction text that references them.
    Leave every other server untouched. Do not delete the tool's own cache, index database, or
    installed binary unless I explicitly ask — removing the registration is enough and is
    reversible.
 5. Report the exact rollback command (restore file from ~/.agents/setup-backups/<timestamp>/), and
    verify each edited config still parses as valid JSON/TOML before finishing.

=== 7. GLOBAL INSTRUCTION FILES ===

Replace every detected agent's global instruction file with the following content, from
"# Operating Instructions" through the end of the "8. Report" paragraph.

KEEP THIS FILE LEAN. Every agent loads it on every session, so it is the most expensive text in the
setup. State the pipeline as one line of phase-to-command mapping; do not draw the ASCII box diagram
from the upstream README into it. Diagrams belong in documentation, not in a per-session prompt.

THE ROUTER NAME IN THE "Skill routing" LINE AND IN STEP 1 DEPENDS ON THE SET CHOSEN IN 4a. The text below is written for set A. For
set B write using-superpowers, for set C write ask-matt, and in step 4 swap interview-me and
documentation-and-adrs for that set's equivalents (set C: grilling and domain-modeling). A router
name that does not match the installed set is a silent failure: the agent finds no such skill, skips
orientation, and nothing in the file reveals why.

# Operating Instructions

**Stance** — Domain data first: get the domain model and real data shapes right before code or tests — tests verify the model, they never define it. Make the smallest verified, maintainable change. Make maintainable code; no unrelated refactoring. Prefer reversible choices. Ask only about consequential data loss, public API, security, or migration decisions; otherwise state assumptions and proceed. Never claim what you did not verify. Always merge worktree after done ask user if unsure target branch.

**Domain rules** — Always read `~/.agents/rules/rules.md` (Windows: `%USERPROFILE%\.agents\rules\rules.md`).

**Skill routing** — `~/.agents/skills/` is the skill hub; `using-agent-skills` is the router. Place the task in one phase and drive it with that phase's command: DEFINE `/spec` → PLAN `/plan` → BUILD `/build` → VERIFY `/test` → REVIEW `/review` → SHIP `/ship`. Steps 1–8 below are how a phase is executed, not a second pipeline.

**1. Orient** — Read repo instructions, the domain model and real data shapes, then relevant tests/contracts, and the closest analogous code. Route through `using-agent-skills`. Map entry points, callers, dependencies, side effects, and real verification commands. Batch independent reads.

**2. Options** — Right after exploration, before any plan or code, give exactly three genuinely distinct approaches — different in strategy, not in wording. One line each: approach · main tradeoff · cost/risk. Rank them 1/2/3, mark 1 as recommended with one clause of why. Then stop and ask the user to pick. No code, no long prose. Skip only when one approach is obviously the only sane one.

**3. Delegate** — As an orchestrator use subagents for plan, review, execute, and verify tasks. As soon as the question is framed, fan out fresh-context subagents. Each gets a narrow brief: goal, candidate paths, constraints, expected output.
Skip delegation only when you already know the exact file and symbol, or the change is a single trivial edit.

**4. Plan** — State: `task type · goal · files · contracts · verification · assumptions`.

After stating the plan, run `interview-me` — one question at a time until the user's intent is clear and confirmed at ~95% confidence — and record the hard-to-reverse decisions and glossary terms with `documentation-and-adrs`. Do not start implementation before this confirmation. Skip the interview for trivial or unambiguous changes — state assumptions and proceed.

**5. Adversarial review** — After every plan, challenge:

- does the plan match the domain logic?
- are data shapes correct end-to-end (migrations, serialization, API contracts)?
- does it fix the relevant issues and match the user request?
- is this clean code?

Pass only after a concrete objection and revision, or the strongest counterargument and why the plan survives.

**6. Execute** — Follow the reviewed plan; rerun the gate if reality differs. Prefer intuitive names, clear control flow, cohesive local code. Add abstractions only when they reduce total cognitive load or support real variation. Preserve behavior unless the requested feature or fix changes it.

Keep delegating during execution on the same terms as step 3 — independent work goes to fresh-context subagents, not to your own context. Pass large results through files and independently verify them.

**7. Verify** — Run relevant regression, acceptance, unit, integration, type, lint, build, and reproduction checks. Show commands and real output. Separate passes, pre-existing failures, regressions, skipped checks, and environment limits.

**8. Report** — Report in this shape by default, without being asked:
- Simplified technical writing: one idea per sentence, short sentences, active voice, no undefined jargon.
- Use the project's ubiquitous language (`CONTEXT.md`, glossary, ADRs). Flag any term where code and glossary disagree.
- Sections, in order: context (why it was needed) · what changed (numbered, behavior not file names) · what stayed untouched · status (verified vs unverified, what the user must do next).
- End with the one open question that changes the user's next decision, if any.

Targets include Claude `~/.claude/CLAUDE.md`, Codex `~/.codex/AGENTS.md`, Jcode `~/AGENTS.md`,
Pi `~/.pi/agent/AGENTS.md`, Gemini `~/.gemini/GEMINI.md`, OpenCode instructions, and Kiro steering.
Preserve only a timestamped backup of the previous content.

Prefer ONE canonical file (~/.agents/AGENTS.md) with each agent's path symlinked to it, so a single
write propagates everywhere.
  macOS:   ln -sfn ~/.agents/AGENTS.md <agent path>
  Windows: New-Item -ItemType SymbolicLink -Path <agent path> -Target $HOME\.agents\AGENTS.md
           If that is denied, fall back to -ItemType HardLink (these are FILES and a hardlink keeps
           one write propagating, unlike a copy) — same volume only. Real copies are the last resort,
           and if you fall back to copies you must SAY SO: from then on every future edit has to be
           written N times, and a partial rewrite leaves agents disagreeing with each other.
After writing, verify by comparing checksums across all target paths — they must be identical, and the
count must equal the number of detected agents.
  macOS: shasum -a 256    Windows: Get-FileHash -Algorithm SHA256

Sweep for STALE SIBLING INSTRUCTION FILES the previous configuration left behind (for example an
extra file in Kiro's steering directory). One of them silently re-injects the old rules alongside
the new ones. Back up, then remove.

If an agent has no documented global instruction file, skip it and say so. Do not invent a config path.

=== 7b. DOMAIN RULES FILE ===

Create ~/.agents/rules/rules.md if absent. NEVER overwrite it — it holds rules this prompt does not
know about. On a rerun, leave existing content alone and only append what is missing. Do not delete
a rule to "clean up": a rule you cannot source is still a rule the user relies on.

Keep it to rules only — one line each, no rationale, no workflow prose. The workflow lives in the
instruction file; this file is the environment's domain and safety rules, grouped by area.

This is the seam that keeps the instruction file byte-identical across machines while the rules
differ per environment. Do not inline these rules into the instruction file.

=== 8. LINKING ===

Link each canonical skill into ~/.agents/skills from its source repository. Preserve every complete
skill directory — SKILL.md, scripts, hooks, references, templates, schemas, galleries, assets.

For each target, branch on the current state and log which branch ran:

  symlink -> correct source   leave alone            log UNCHANGED
  symlink -> different target retarget               log REPAIRED
  real directory              mv to backup, then link log REPLACED
  empty directory             rmdir, then link       log REPAIRED
  absent                      link                   log INSTALLED

Never create duplicate repositories, nested copies, or alternate names such as skill-2,
skill.bak-<date>, or skill.backup-<YYYYMMDD-HHMMSS>. If prior runs left such duplicates, ARCHIVE
them to ~/.agents/skills-bak/<timestamp>/ — do not delete, and do not leave them in place where they
load as separate skills and bloat every agent's context. Match the whole family of suffixes, not the
two examples above: a dated backup directory still carries a valid SKILL.md, so the harness happily
loads four near-identical copies of the same skill and none of them looks broken.

Only create a per-agent skills-directory adapter when the installed harness requires one. Current Jcode
and Pi versions load `~/.agents/skills` natively. For them, verify that behavior and preserve existing
`~/.jcode/skills`, `~/.pi/skills`, and `~/.pi/agent/skills` directories in place; they may contain
user-owned or tool-managed skills that are not in the canonical hub.

PER-SKILL LINKS FOR HARNESSES WITH A POPULATED SKILLS DIRECTORY. Do not take "loads ~/.agents/skills
natively" on trust — verify it by listing a skill from the running harness. Observed reality on a real
machine: `~/.claude/skills`, `~/.codex/skills` and `~/.config/opencode/skills` were each a
directory symlink to `~/.agents/skills` (so one link covers all three), while `~/.hermes/skills`
held 185 real entries and `~/.pi/skills` held per-skill relative symlinks. Newly hubbed skills were
absent from both until linked individually.

NEVER convert a populated skills directory into a symlink to the hub. Doing so hides every skill that
harness installed for itself — 185 of them, in the case above. Link PER SKILL and leave the rest alone:

  Hermes,  macOS:   ln -sfn ~/.agents/skills/<name> ~/.hermes/skills/<name>
           Windows: New-Item -ItemType SymbolicLink -Path $HOME\.hermes\skills\<name>
                             -Target $HOME\.agents\skills\<name>
                    denied -> the same command with -ItemType Junction (directories only)
  Pi,      macOS:   ln -sfn ../../.agents/skills/<name> ~/.pi/skills/<name>  (match its relative style)
           Windows: use an ABSOLUTE SymbolicLink or Junction. Do not copy Pi's relative style across —
                    a relative Windows link resolves against the process working directory, not the
                    link's own directory, so it works when you create it and dangles afterwards.

THE LINK NAME IS THE SKILL'S name:, NOT THE REPO NAME. `cskwork/canvas-ui-skill` must be linked as
`canvas-ui-design`. A mismatch loads nothing and reports nothing — it fails silently.

Verify each link the same way as everything else: `<skills-dir>/<name>/SKILL.md` readable and non-empty.

For agents that require an adapter, link the documented global skills directory to ~/.agents/skills:
  macOS/Linux: directory symlink (ln -s handles both files and directories).
  Windows, a FILE:      New-Item -ItemType SymbolicLink; if denied, fall back to HardLink (same drive).
  Windows, a DIRECTORY: New-Item -ItemType SymbolicLink; if denied, fall back to Junction.
                        NEVER hardlink a directory — mklink /H does not work on folders.
  Copying is a documented last resort only. A 350 MB copy that drifts from canonical is worse than
  no installation.
  Never replace an unrelated user-owned directory, and never create a link that resolves inside
  itself. Before linking X -> Y, confirm Y does not resolve under X.

If an adapter path is ALREADY a real directory holding a full copy of the hub (a previous run that
fell back to copying), converting it to a link is a repair, not a rewrite — but prove it is safe
first. List the entries present in the copy but absent from the hub. If anything survives that is
not an archive leftover, STOP and report it: those are skills that exist only there and linking
would hide them. If the only extras are duplicates you are archiving anyway, move the whole copy
into the timestamped backup directory (mv, never rm -rf), create the link, then confirm SKILL.md is
readable through the new link for a few known skills before calling it repaired.

=== 9. VERIFICATION ===

Produce a SEPARATE, READ-ONLY audit script that mutates nothing and
classifies every entry: symlink-with-SKILL.md, realdir-with-SKILL.md, broken link, empty directory,
missing SKILL.md. Write it in the platform's own language — macOS: ~/.agents/work/audit-skills.sh,
Windows: ~/.agents/work/audit-skills.ps1. A bash audit is not runnable in native PowerShell, and an
unrunnable audit means nothing in this section was ever verified. Run it and report the counts. Have
it also list any two entries whose SKILL.md declares the same frontmatter 'name:'.
EMPTY DIRECTORIES AND BROKEN LINKS MUST BOTH BE ZERO.

Gate the exit status on those two counts only. A skills directory legitimately contains folders that
are not skills — user notes, a tool-managed bundle — and they have no SKILL.md by design. If they
count as damage, every run ends in DAMAGE FOUND, and after the second or third time nobody reads the
result, which is how real breakage gets missed. Report missing-SKILL.md as a WARN list for a human
to read, and never auto-delete those directories.

A verification script that lies is worse than none, and each language has its own way of lying here:
  bash/zsh: declare counters with `local -i n=0`. A plain `local n=0` followed by `n+=1` performs
    STRING CONCATENATION, so counts come out as "1111111111111111111" or a garbage negative number
    while every other line looks correct.
  PowerShell: Test-Path FOLLOWS the link, so a broken symlink and an absent path both report False —
    the "broken link" class silently becomes zero, which is exactly the count this section gates on.
    Classify with Get-Item -Force and read .LinkType and .Target instead. Also treat LinkType
    'Junction' as a link, not as a real directory: on Windows the junction fallback from section 0b is
    a normal outcome, and an audit that calls every junction a realdir reports the whole hub as
    unlinked.

Also verify:
  - EXACTLY ONE workflow set is live. Count the routers present in ~/.agents/skills:
    using-agent-skills, using-superpowers, ask-matt. The count must be 1, and it must be the set
    recorded as WORKFLOW_SET. Two routers is the failure mode section 4a exists to prevent, and it
    produces no broken link, no empty directory, and no error — only inconsistent behaviour.
  - The chosen set's skill count matches upstream. Enumerate every directory holding a SKILL.md in
    that set's source and confirm each has a link in ~/.agents/skills. Report the upstream count, the
    linked count, and any name present upstream but missing locally. These must be equal; a smaller
    local count is a stale install, not a healthy one. Set A is 24 skills today; set C enumerates all
    categories including in-progress. Do not hardcode either number — read the source tree.
  - For set A: the 8 slash commands resolve under ~/.claude/commands/agent-skills/ and the 4 personas
    under ~/.claude/agents/, and the agent-skills SessionStart hook is NOT registered unless I asked.
  - For set C only: the canonical ask-matt SKILL.md does not contain 'disable-model-invocation: true',
    and every installed ask-matt link resolves to that same file.
  - The router named in step 1 of the instruction file is the router that is actually installed.
  - Every CLI responds to --version / --help.
  - Every MCP server passes the handshake probe from step 6.3.
  - Instruction-file checksums are identical across all documented agent paths, including Jcode's
    `~/AGENTS.md` and Pi's `~/.pi/agent/AGENTS.md`.
  - The instruction file carries the `~/.agents/rules/rules.md` line, that file is readable and
    non-empty, and every rule it held before this run is still there.
  - No autonomous loop was started, no Context Diet restriction was activated, no paid service was
    authenticated, and no credits were spent.
  - gpt-image-2 is configured but not wired to trigger on anything except an explicit request.
  - On macOS, ego-browser resolves on PATH and answers the heredoc probe from 5b.5, or is reported
    as PENDING-USER because GUI onboarding is unfinished. On other platforms, ego lite is reported
    as SKIPPED-UNSUPPORTED; Playwright is allowed as a separate fallback and, if installed, its
    package and browser versions are reported.
  - ai-memory: EXACTLY ONE server process, listening on 127.0.0.1 and not 0.0.0.0
      macOS:   ps -axo pid,%cpu,rss,command | grep ai-memory
               lsof -nP -iTCP:<port> -sTCP:LISTEN
      Windows: Get-Process ai-memory
               Get-NetTCPConnection -LocalPort <port> -State Listen | Select-Object LocalAddress,OwningProcess
    plus the autostart entry from 5c.9 present and healthy (launchctl print ... state = running /
    (Get-ScheduledTaskInfo ai-memory).LastTaskResult = 0), 'ai-memory status' reporting
    "embedding: disabled", an empty models/ directory, [auto_improve.scheduler] disabled,
    capture_assistant unset on both the server and the installed hooks, and a real
    initialize -> tools/list handshake against http://127.0.0.1:<port>/mcp returning the memory_*
    tools. Then confirm each wired agent sees it with that agent's own MCP command where one exists
    (claude mcp list, codex mcp list, hermes mcp test ai-memory). A config file that contains the
    right string is NOT evidence that anything connected.
  - No git repository outside ~/.agents has new modified or untracked files attributable to this
    run. Check git status in each repo you entered.

Rerun the ENTIRE setup to confirm idempotency: the second run must report UNCHANGED for every item
and produce no new backup entries.

=== 10. LEAVE A REPAIR PATH ===

Empty-directory damage is caused by OTHER tools after setup finishes, so the environment needs a
repair path that outlives this run. Leave behind:
  - audit-skills.sh / audit-skills.ps1   read-only, safe to run any time
  - link-skills.sh  / link-skills.ps1    idempotent repair, safe to re-run
    Write the pair for THIS platform only. A .sh left on a Windows machine is a repair path that
    cannot be run on the day it is needed.
  - a note in ~/.agents/docs/: if an agent reports a skill as missing, run the audit first; if it
    shows empty directories, run the linker.

=== 11. REPORT ===

Report every item as installed / updated / unchanged / repaired / skipped / failed, with the backup
directory and the exact rollback command. State plainly what was verified and by what evidence, what
was skipped and why, and what remains for me to run manually. Do not describe an unverified step as
done. Do not commit or push anything.
```
