---
title: OpenCode
summary: "터미널에서 도는 공급자 독립 오픈소스 코딩 에이전트. Z.ai·OpenAI·Anthropic 등을 붙여 쓰며 LSP로 코드를 이해하고 실행 권한을 제어한다. GLM-5.3-Flash를 연결하면 컨텍스트 100만 토큰과 네이티브 이미지 입력을 함께 쓴다."
summary_en: "A provider-agnostic open-source terminal coding agent with LSP-aware editing and configurable permissions. GLM-5.3-Flash adds a 1M-token context and native image input."
tags: [harness, opencode, terminal, tui, provider-agnostic, glm, zai-coding-plan, lsp, agents-md]
source: https://github.com/anomalyco/opencode
author: anomalyco
license: MIT
order: 10
base_agent: "자체 하네스 (모델 공급자 무관)"
base_agent_en: "Standalone harness (provider-agnostic)"
languages: [TypeScript]
platforms: [macOS, Linux, Windows]
install: "npm install -g @opencode-ai/cli@beta   # 실행 명령은 opencode2"
---

## 한 줄

터미널 창 하나에서 도는 코딩 에이전트다. 모델을 내장하지 않고 **공급자(provider, 모델을 파는 회사)를 골라 붙이는** 구조라, Z.ai GLM Coding Plan 키 하나만 있으면 바로 쓸 수 있다. 붙일 수 있는 모델 목록은 [models.dev](https://models.dev) 카탈로그에서 가져온다.

*EN: A terminal-native coding agent with no built-in model — you attach a provider. One Z.ai coding-plan key is enough to start.*

## 언제 쓰는가

- 구독한 모델을 **아무 에이전트에서나** 쓰고 싶을 때. 하네스와 모델이 분리돼 있어 나중에 모델만 갈아끼울 수 있다.
- 실행 권한을 손에 쥐고 싶을 때. `permissions` 설정으로 셸 명령마다 `ask`(물어봄) / `allow`(허용)를 지정한다.
- `AGENTS.md`(프로젝트 지시사항 파일)를 이미 쓰고 있을 때. 시작할 때 자동으로 읽는다.

## 설치와 첫 실행 (verified 2026-08-19)

두 계열이 있다. **v2 프리뷰(`opencode2`)** 가 현재 권장 경로이고, **v1 안정판(`opencode`)** 이 기존 경로다.

```bash
# ── v2 프리뷰 (권장) ── 패키지 @opencode-ai/cli 의 beta 태그, 실행 명령은 opencode2
npm install -g @opencode-ai/cli@beta
opencode2 --version            # 실측: v0.0.0-beta-17595

opencode2 auth login           # 목록에서 zai-coding-plan 선택 → 키 붙여넣기
opencode2 models | grep zai    # glm-5.3-flash 가 보이면 구독이 열린 것

cd ~/my-project && opencode2

# ── v1 안정판 ── 패키지 opencode-ai, 실행 명령은 opencode
curl -fsSL https://opencode.ai/install | bash   # macOS / Linux / WSL
npm install -g opencode-ai@latest               # 같은 것, Windows는 이쪽
opencode auth login
opencode models --refresh      # --refresh 는 v1에만 있다
cd ~/my-project && opencode
```

키는 로컬 `~/.local/share/opencode/auth.json`에 `{"type":"api","key":"..."}` 형태로 저장된다.

에이전트 안에서 `/models`로 모델을 고른다. 기본 추천은 `zai-coding-plan/glm-5.3-flash`다.
컨텍스트 100만 토큰과 텍스트·이미지 입력을 지원한다.

## 설정 파일

**계열마다 디렉터리가 다르다.** v1은 `~/.config/opencode/opencode.json`, v2는 `~/.config/opencode2/opencode.json`을 읽는다. 프로젝트 단위 설정은 `.opencode/`. 모델별 옵션을 고정하려면:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "lsp": true,
  "provider": {
    "zai-coding-plan": {
      "models": {
        "glm-5.3-flash": {
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

- **패키지 이름과 명령 이름이 어긋난다.** v1은 패키지 `opencode-ai` → 명령 `opencode`, v2는 패키지 `@opencode-ai/cli@beta` → 명령 `opencode2`. `@opencode-ai/cli`의 `latest` 태그는 명령 이름이 `lildax`인 다른 물건이므로 **반드시 `@beta`를 붙인다.**
- **`--refresh`는 v1 전용이다.** v2의 `opencode2 models`에는 `--refresh` 플래그가 없다.
- **v2는 프리뷰다.** 버전이 `0.0.0-beta-*`이며, 플러그인이 MCP를 코드로 등록하는 경로가 없어 MCP 서버는 v2 설정에 직접 선언해야 한다.
