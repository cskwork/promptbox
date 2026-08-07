---
title: Prime Agent
summary: "영구 IPython 커널(대화형 파이썬 환경)을 모델의 유일한 도구로 삼는 오픈소스 코딩·연구 에이전트. 컨텍스트를 변수로 다루고(RLM), 재귀 서브에이전트를 코드처럼 호출하며, 사용된 교훈을 자동으로 저장·개선하는 Continual Harness(지속 학습 장치)가 달려 있다. 터미널을 닫아도 백그라운드 데몬이 세션을 유지한다."
summary_en: "An open-source coding/research agent where a persistent IPython kernel is the model's only tool — context is treated as variables (Recursive Language Model), subagents are native code calls, and a Continual Harness persists and refines lessons across sessions."
tags: [harness, prime-agent, rlm, ipython, recursive-subagent, continual-harness, daemon, persistent-session, multi-provider, pi-fork]
source: https://github.com/PrimeIntellect-ai/prime-agent
author: Prime Intellect
license: MIT
order: 15
base_agent: "pi-mono (fork → standalone product)"
base_agent_en: "pi-mono (fork → standalone product)"
languages: [TypeScript, Python]
platforms: [macOS, Linux, Windows (Git Bash), Termux]
install: "curl -fsSL https://app.primeintellect.ai/prime-agent/install.sh | sh"
---

## 한 줄

"모든 것을 코드로." 모델에게 파일 읽기·쉘 명령·서브에이전트 호출을 각각 별도 도구로 주는 대신, **영구 IPython 커널 하나**만 주고 그 안에서 다 한다. 커널 안의 파이썬 변수·함수·데이터는 턴이 바뀌고 컨텍스트가 압축돼도 살아남아서, 긴 작업이 중간에 상태를 잃지 않는다.

*EN: One persistent IPython kernel is the only tool — file ops, shell, and subagents all happen as code inside it, and Python state survives across turns and compaction.*

## 핵심 개념

**RLM (Recursive Language Model)** — 컨텍스트를 변수로, 서브에이전트를 함수 호출로 취급하는 프로그래밍 모델. `await rlm("하위 작업")` 한 줄로 실제 자식 에이전트를 띄우고 핸들을 받는다. 부모는 자신의 컨텍스트를 작게 유지하고, 자식은 필요한 만큼의 컨텍스트만 받는다.

**Continual Harness (지속 학습 장치)** — `/refine` 명령으로 세션 진행 중 얻은 교훈을 작고 증거 기반의 업데이트로 저장한다. 보충 프롬프트·메모리·스킬 설명·서브에이전트 명세가 durable state(사라지지 않는 상태)로 쌓이며, 기본 system prompt는 변경하지 않고 스냅샷으로 롤백할 수 있다.

**데몬 백업 세션** — 터미널을 닫아도 worker 프로세스가 세션·커널·스케줄·서브에이전트를 그대로 유지한다. `prime-agent attach`로 다시 붙거나 `--resume`으로 복귀.

**에이전트 간 직접 통신** — 실행 중인 에이전트들이 서로 메시지를 주고받고 조율할 수 있다. 모든 것을 사용자가 중계할 필요 없음.

## 기본 설치 & 온보딩 (default setup)

```bash
# 1. 설치 (macOS / Linux) — 버전이 지정된 릴리스를 받아 SHA-256 검증 후 prime-agent 명령 설치
curl -fsSL https://app.primeintellect.ai/prime-agent/install.sh | sh

# 2. 작업할 프로젝트 디렉터리로 이동 후 실행
cd /path/to/project
prime-agent
```

**첫 실행 인증** — 두 가지 경로 중 하나:

```text
# 옵션 A: 구독 로그인 (TUI에서 /login → 제공자 선택)
/login
#   Claude Pro/Max · ChatGPT Plus/Pro (Codex) · GitHub Copilot

# 옵션 B: API 키 (환경변수로 사전 설정)
export ANTHROPIC_API_KEY=sk-ant-...
prime-agent
```

**첫 세션** — 프롬프트를 입력하고 Enter. 모델은 IPython 커널 하나를 도구로 받아 파일 읽기·편집·프로젝트 명령·서브에이전트 호출을 모두 그 안에서 수행한다.

```text
Summarize this repository and tell me how to run its checks.
```

**프로젝트 지시사항 (선택)** — `AGENTS.md`(또는 `CLAUDE.md`)를 프로젝트 루트에 두면 시작 시 자동 로드. 글로벌은 `~/.prime/agent/AGENTS.md`. 수정 후 `/reload`.

```markdown
# Project Instructions
- Run `npm run check` after code changes.
- Do not run production migrations locally.
```

**주요 CLI 명령:**

```bash
prime-agent agents              # 실행 중 / 대기 / 저장된 세션 브라우징
prime-agent attach <agent>      # 실행 중인 세션에 다시 연결
prime-agent --resume <path|id>  # 저장된 세션 재개
prime-agent status              # 백그라운드 서비스 상태
prime-agent doctor [--fix]      # 서비스 진단 / 수리
prime-agent update [--force]    # Prime Agent 업데이트
prime-agent shutdown [--force]  # 모든 에이전트·서비스 중지
```

**주요 TUI 슬래시 명령:**

| 명령 | 용도 |
|---|---|
| `/login`, `/logout` | 구독 또는 API 키 인증 |
| `/model` | 모델 전환 |
| `/refine` | Continual Harness 상태 업데이트 / 롤백 |
| `/compact` | 컨텍스트 수동 압축 |
| `/goal` | 턴을 넘어 유지되는 목표 설정 |
| `/heartbeat` | 주기적 재진입 예약 |
| `/autonomous` | bounded 자율 모드 (턴·토큰·시간 예산 내) |
| `/usage`, `/context` | 토큰·비용·컨텍스트 분석 |
| `/tree`, `/fork`, `/clone` | 세션 분기·복제 |
| `/export`, `/share` | HTML 내보내기 / GitHub Gist 공유 |

## 함정

- **보안 샌드박스가 아니다.** Prime Agent는 모델이 생성한 파이썬과 프로젝트 명령을 사용자 권한으로 실행한다. worker·커널 분리는 lifecycle 격리용이지 보안용이 아님. 신뢰할 수 있는 저장소·스킬·명령만 사용하고, 신뢰할 수 없는 코드는 외부 샌드박스에서 실행.
- **Claude 구독 서드파티 사용량** — Claude Pro/Max로 `/login`해도 하네스(제3자 도구) 사용분은 plan 한도가 아니라 [extra usage](https://claude.ai/settings/usage)에서 토큰당 과금된다.
- **Windows는 bash 필수** — Git Bash(`C:\Program Files\Git\bin\bash.exe`) 또는 MSYS2/WSL. `settings.json`의 `shellPath`로 커스텀 경로 지정 가능.
- **소스 트리의 npm workspace 이름은 공개 설치 경로가 아니다.** 공개 릴리스는 위 install 스크립트로만 설치. 소스에서 실행하려면 Node.js 22.8+ 필요.
- **`prime-agent`는 pi-mono 하드 포크에서 시작했지만 이제는 독립 제품.** pi는 코딩 에이전트 베이스, Prime Agent가 그 위에 RLM 런타임·Continual Harness·데몬 아키텍처를 얹었다.
