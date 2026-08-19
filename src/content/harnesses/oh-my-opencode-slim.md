---
title: oh-my-opencode-slim (omo-slim)
summary: "OpenCode 위에 7명짜리 에이전트 팀을 얹는 오케스트레이션 플러그인. 지휘자(Orchestrator)가 일을 쪼개 탐색·검토·문서조사·UI·구현 담당에게 백그라운드로 던지고 결과를 합친다. 에이전트마다 다른 모델을 물릴 수 있어서, 어려운 판단은 GLM-5.3에 맡기고 잔심부름은 값싼 모델로 돌린다."
summary_en: "An OpenCode plugin that adds a seven-agent team under one Orchestrator, which splits work, dispatches specialists as background tasks, and reconciles their results. Each agent can run a different model — heavy reasoning on GLM-5.3, cheap lanes on a smaller one."
tags: [harness, opencode, plugin, orchestration, multi-agent, glm, zai-coding-plan, preset, background-agents]
source: https://github.com/alvinunreal/oh-my-opencode-slim
author: alvinunreal (Boring Dystopia Development)
license: MIT
order: 12
base_agent: OpenCode
base_agent_en: OpenCode
languages: [TypeScript]
platforms: [macOS, Linux, Windows]
install: "bunx oh-my-opencode-slim@latest install"
---

## 한 줄

OpenCode 하나에 모델 하나를 물려 전부 시키는 대신, **역할이 다른 에이전트 일곱에게 나눠 던지는** 플러그인이다. Orchestrator(지휘자)가 작업 그래프를 짜고 전문 에이전트를 background task(뒤에서 동시에 도는 작업)로 띄운 뒤 결과를 합쳐서 이어간다.

*EN: Instead of one model doing everything, an Orchestrator plans the work graph, dispatches specialists as background tasks, and reconciles their output.*

## 에이전트 구성

| 에이전트 | 하는 일 |
|---|---|
| `orchestrator` | 계획 수립·작업 분배·결과 취합. 사용자가 대화하는 상대 |
| `explorer` | 코드베이스 탐색 — 파일·패턴 찾기 |
| `oracle` | 깊은 추론·아키텍처 검토 |
| `council` | 여러 모델에게 같은 질문을 동시에 던져 답을 합성 (`@council`) |
| `librarian` | 최신 문서 조회 (context7·gh_grep 같은 MCP 사용) |
| `designer` | UI 작업 |
| `fixer` | 범위가 명확한 구현 실행 |
| `observer` | 이미지·스크린샷 판독. **기본 비활성**, 비전 모델 필요 |

## 설치 (verified 2026-08-19)

OpenCode가 먼저 설치돼 있어야 한다.

```bash
# Bun이 있으면
bunx oh-my-opencode-slim@latest install

# 없으면 npx도 동작한다 (배포본은 Node 호환 번들)
npx oh-my-opencode-slim@latest install
```

설치기가 `~/.config/opencode/opencode.json`의 `plugin` 배열에 `oh-my-opencode-slim`을 등록하고, `~/.config/opencode/oh-my-opencode-slim.json`을 만든다. 이때 생성되는 프리셋은 `openai`와 `opencode-go` 둘뿐이고 기본값은 `openai`다. **GLM 프리셋은 직접 써 넣어야 한다.**

## opencode2(v2)에서 쓰기

플러그인은 **v1·v2 양쪽에서 도는 같은 패키지**다. 패키지 기본 export가 `{ id, server, setup }`이고 v1은 `server`, v2는 `setup`을 로드한다.

v2는 호스트 설정 디렉터리가 다르므로 `~/.config/opencode2/opencode.json`에도 등록해야 한다:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["oh-my-opencode-slim@latest"],
  "mcp": {
    "gh_grep": { "type": "remote", "url": "https://mcp.grep.app" }
  }
}
```

`opencode2 plugin list`에 `oh-my-opencode-slim`이 나오면 붙은 것이다. **v2에는 플러그인이 MCP를 코드로 등록하는 경로가 없다** — 에이전트가 쓸 MCP 서버는 위처럼 `mcp` 항목에 직접 선언한다.

플러그인 자체 설정(`oh-my-opencode-slim.json`)은 호스트가 v2여도 `~/.config/opencode/`에 그대로 둔다.

## GLM-5.3 프리셋 (스키마 검증 통과)

`~/.config/opencode/oh-my-opencode-slim.json`을 아래처럼 만들면 팀 전체가 Z.ai GLM Coding Plan 위에서 돈다. 무겁게 생각해야 하는 자리에는 `glm-5.3`(컨텍스트 100만), 탐색·문서조회처럼 양이 많고 값싼 자리에는 `glm-5-turbo`를 물렸다.

```json
{
  "$schema": "https://unpkg.com/oh-my-opencode-slim@latest/oh-my-opencode-slim.schema.json",
  "preset": "glm",
  "presets": {
    "glm": {
      "orchestrator": { "model": "zai-coding-plan/glm-5.3", "skills": ["*"], "mcps": ["*"] },
      "oracle":       { "model": "zai-coding-plan/glm-5.3", "skills": [], "mcps": [] },
      "librarian":    { "model": "zai-coding-plan/glm-5-turbo", "skills": [], "mcps": ["context7"] },
      "explorer":     { "model": "zai-coding-plan/glm-5-turbo", "skills": [], "mcps": [] },
      "designer":     { "model": "zai-coding-plan/glm-5.3", "skills": [], "mcps": [] },
      "fixer":        { "model": "zai-coding-plan/glm-5.3", "skills": [], "mcps": [] }
    }
  }
}
```

저장하고 `opencode`를 다시 실행하면 적용된다. 세션 도중 팀 전체 모델을 갈아끼우려면 `/preset`.

## 프롬프트 손보기

에이전트 프롬프트는 설정 파일이 아니라 마크다운 파일로 덮어쓴다.

- `~/.config/opencode/oh-my-opencode-slim/{agent}_append.md` — 기존 프롬프트 **뒤에 덧붙임**. 작은 습관 교정은 이걸로.
- `~/.config/opencode/oh-my-opencode-slim/{agent}.md` — 번들 프롬프트 **통째로 교체**.
- `~/.config/opencode/oh-my-opencode-slim/{preset}/{agent}.md` — 특정 프리셋에서만 적용.

파일 이름은 에이전트 이름 그대로다(`orchestrator.md`, `oracle.md`, …).

## 이미지를 읽히려면 — Vision MCP (GLM-4.6V)

**Coding Plan에는 GLM-4.6V가 들어 있다 — 모델이 아니라 MCP 서버로.** Z.ai 공식 크레딧 표에 `GLM-4.6V（Vision MCP）`가 입력 1.2 / 캐시 0.3 / 출력 2.7 배수로 올라 있고 같은 구독에서 차감된다. 별도 키·별도 과금이 필요 없다.

1. 호스트 설정(v2는 `~/.config/opencode2/opencode.json`, v1은 `~/.config/opencode/opencode.json`)에 MCP를 등록한다 — Z.ai 공식 문서의 OpenCode 예시 그대로다:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "zai-mcp-server": {
      "type": "local",
      "command": ["npx", "-y", "@z_ai/mcp-server@latest"],
      "environment": {
        "Z_AI_API_KEY": "코딩플랜_키",
        "Z_AI_MODE": "ZAI"
      }
    }
  }
}
```

2. 눈이 필요한 에이전트에 MCP를 준다. `mcps`에 이름을 넣으면 끝이고, **모델은 비전이 아니어도 된다**:

```json
{
  "presets": {
    "glm": {
      "designer": { "model": "zai-coding-plan/glm-5.3", "skills": [], "mcps": ["zai-mcp-server"] }
    }
  }
}
```

**실측(2026-08-19)**: 이 설정에서 비전이 없는 `glm-5.3`으로 도는 `@designer`가 `analyze_image`를 호출해 테스트 PNG의 문자열과 도형을 정확히 읽었다.

도구 8종: `ui_to_artifact`(스크린샷 → 코드) · `extract_text_from_screenshot`(OCR) · `diagnose_error_screenshot`(에러 화면 진단) · `understand_technical_diagram`(아키텍처·UML·ERD) · `analyze_data_visualization`(차트·대시보드) · `ui_diff_check`(UI 두 장 비교) · `analyze_image` · `analyze_video`. 앞의 여섯은 Designer·Observer와, `diagnose_error_screenshot`은 Fixer와 잘 맞는다.

**대안 — 비전 모델을 직접 물리기.** 에이전트 `model`에 비전 모델을 넣어도 동작한다. 실측으로 `designer`에 `openai/gpt-5.6-luna`를 물리고 `--file`로 이미지를 붙였더니 그대로 읽었다. 다만 Coding Plan 안에는 비전 채팅 모델이 없어서, 이 길은 Z.ai 일반 API(`zai` 공급자, 별도 키)나 다른 공급자를 끌어와야 한다. 키 하나로 끝내려면 위의 Vision MCP가 낫다.

**함정**: 이미지를 클라이언트에 붙여넣지 마라. Z.ai 문서가 명시하듯 대부분의 클라이언트는 붙여넣은 이미지를 자체 변환해 모델을 직접 호출하므로 MCP를 타지 않는다. 파일을 디스크에 두고 프롬프트에서 경로·이름으로 지목한다. Node.js 22 이상 필요.

## 함정

- **내장 에이전트의 `prompt` 필드는 JSON에 못 쓴다.** `orchestrator`·`oracle` 같은 내장 에이전트는 모델·스킬·MCP만 JSON으로 설정하고, 프롬프트는 위의 마크다운 파일로만 바꾼다. 커스텀 에이전트(`agents.<이름>`)는 `prompt`를 직접 쓸 수 있다.
- **`image_routing`은 첨부 이미지의 자동 경로만 정한다.** `"auto"`는 Observer가 켜져 있을 때 첨부를 디스크에 저장해 `@observer`에게 위임을 유도하고, `"direct"`는 Orchestrator에게 그대로 넘긴다. 이건 *자동 라우팅* 이야기일 뿐이고, **Vision MCP나 비전 모델을 가진 에이전트는 경로를 지목받으면 누구든 이미지를 읽는다** — Designer 포함.
- **`observer`는 여전히 기본 비활성이다.** 켜려면 `disabled_agents: []`로 비우고 비전 모델 또는 Vision MCP를 붙여야 한다. Observer의 값어치는 원본 파일을 메인 컨텍스트에 올리지 않고 구조화된 관찰 결과만 돌려준다는 데 있다.
- **설정 우선순위**: 프로젝트의 `.opencode/oh-my-opencode-slim.json` → 사용자 `~/.config/opencode/oh-my-opencode-slim.jsonc` → `.json`. `.jsonc`가 있으면 `.json`을 덮는다.
- **배경 작업이 기본값이다.** 전문 에이전트가 동시에 돌기 때문에, tmux·Zellij 같은 멀티플렉서를 붙여 각 에이전트를 별도 창에서 보는 편이 상황 파악에 훨씬 낫다.
- **`oh-my-opencode`의 경량 포크다.** 원본과 설정 파일 이름이 다르니 문서를 섞어 보면 안 된다.
