---
title: OpenCode
summary: "터미널에서 도는 오픈소스 코딩 에이전트. 특정 모델 회사에 묶이지 않고 Z.ai·OpenAI·Anthropic 등 어느 공급자든 붙여 쓰며, LSP(코드 분석 서버)로 파일을 이해하고 명령마다 실행 권한을 물어본다. GLM-5.3(컨텍스트 100만 토큰)을 붙이면 구독 하나로 대형 코드베이스를 다룰 수 있다."
summary_en: "Open-source terminal coding agent that is provider-agnostic by design — plug in Z.ai, OpenAI, or Anthropic, get LSP-aware editing and per-command permission prompts. Paired with GLM-5.3 it gives you a 1M-token context on a single coding-plan subscription."
tags: [harness, opencode, terminal, tui, provider-agnostic, glm, zai-coding-plan, lsp, agents-md]
source: https://github.com/anomalyco/opencode
author: anomalyco
license: MIT
order: 10
base_agent: "자체 하네스 (모델 공급자 무관)"
base_agent_en: "Standalone harness (provider-agnostic)"
languages: [TypeScript]
platforms: [macOS, Linux, Windows]
install: "curl -fsSL https://opencode.ai/install | bash"
---

## 한 줄

터미널 창 하나에서 도는 코딩 에이전트다. 모델을 내장하지 않고 **공급자(provider, 모델을 파는 회사)를 골라 붙이는** 구조라, Z.ai GLM Coding Plan 키 하나만 있으면 바로 쓸 수 있다. 붙일 수 있는 모델 목록은 [models.dev](https://models.dev) 카탈로그에서 가져온다.

*EN: A terminal-native coding agent with no built-in model — you attach a provider. One Z.ai coding-plan key is enough to start.*

## 언제 쓰는가

- 구독한 모델을 **아무 에이전트에서나** 쓰고 싶을 때. 하네스와 모델이 분리돼 있어 나중에 모델만 갈아끼울 수 있다.
- 실행 권한을 손에 쥐고 싶을 때. `permissions` 설정으로 셸 명령마다 `ask`(물어봄) / `allow`(허용)를 지정한다.
- `AGENTS.md`(프로젝트 지시사항 파일)를 이미 쓰고 있을 때. 시작할 때 자동으로 읽는다.

## 설치와 첫 실행 (verified 2026-08-19)

```bash
# 1. 설치 — 공식 스크립트 (macOS / Linux / WSL). 실행 파일 이름은 opencode
curl -fsSL https://opencode.ai/install | bash

#    npm이 익숙하면 이것도 같다 (Windows 포함, darwin/linux/win32 · arm64/x64 바이너리 제공)
npm install -g opencode-ai@latest

# 2. 키 연결 — 목록에서 zai-coding-plan 선택 후 API 키 붙여넣기
opencode auth login
#    저장 위치: ~/.local/share/opencode/auth.json  ({"type":"api","key":"..."})

# 3. 이 계정이 실제로 쓸 수 있는 모델 목록 새로고침
opencode models --refresh

# 4. 작업할 폴더에서 실행
cd ~/my-project
opencode
```

에이전트 안에서 `/models`로 모델을 고른다. Z.ai GLM Coding Plan 구독으로 열리는 모델은 다음 5개다(2026-08 카탈로그 실측):

| 모델 ID | 컨텍스트 | 이미지 입력 | 메모 |
|---|---|---|---|
| `zai-coding-plan/glm-5.3` | 1,000,000 | ✗ | 2026-08-14 공개. 기본 추천 |
| `zai-coding-plan/glm-5.2` | — | ✗ | 이전 세대 주력 |
| `zai-coding-plan/glm-5.2-highspeed` | — | ✗ | 속도 우선 |
| `zai-coding-plan/glm-5-turbo` | 200,000 | ✗ | 값싼 보조 작업용 |
| `zai-coding-plan/glm-4.7` | 204,800 | ✗ | 구세대 |

## 설정 파일

`~/.config/opencode/opencode.json`(전역) 또는 프로젝트의 `.opencode/`가 설정 위치다. 모델별 옵션을 고정하려면:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "lsp": true,
  "provider": {
    "zai-coding-plan": {
      "models": {
        "glm-5.3": {
          "options": { "reasoningEffort": "max" }
        }
      }
    }
  },
  "permissions": [
    { "action": "shell", "resource": "*", "effect": "ask" },
    { "action": "read", "resource": "*", "effect": "allow" },
    { "action": "shell", "resource": "git status *", "effect": "allow" }
  ]
}
```

`permissions`는 위에서 아래로 읽으며 **구체적인 규칙이 이긴다**. 위 예시는 "셸은 기본적으로 물어보되 `git status`는 그냥 허용"이라는 뜻이다.

## 함정

- **GLM Coding Plan 모델은 이미지를 못 읽는다.** 카탈로그상 `glm-5.3`을 포함한 5개 모델 전부 `input.image: false`다. 비전이 필요하면 Z.ai **일반 API**를 별도 공급자로 붙여야 한다 — `zai` 공급자(`https://api.z.ai/api/paas/v4`)의 `glm-5v-turbo`·`glm-4.6v`가 이미지·영상을 읽는다. **코딩 플랜 키와는 별개의 키·과금이다.** 키를 하나만 쓰고 싶으면 [glm-vision 플러그인](https://cskwork.github.io/promptbox/plugins/glm-vision/)으로 우회한다.
- **`opencode auth login` 후 모델이 안 보이면 `opencode models --refresh`.** 모델 카탈로그는 캐시된다.
- **npm 패키지 이름은 `opencode-ai`, 실행 명령은 `opencode`.** `opencode`라는 이름의 npm 패키지를 설치하면 다른 물건이다.
- **`opencode2`는 별개의 v2 베타(`@opencode-ai/cli`)다.** 설정 파일과 플러그인 호환성이 v1과 다르므로, 입문자는 `opencode`(v1)로 시작하는 편이 안전하다.
