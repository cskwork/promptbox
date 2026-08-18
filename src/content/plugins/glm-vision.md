---
title: "glm-vision (promptbox/plugins/glm-vision)"
summary: "이미지 파일 경로만 넘기면 GLM-4.6V 비전 모델이 사진 속 텍스트·도형·차트를 읽어 돌려주는 초경량 스킬. 표준 라이브러리만 쓰는 파이썬 스크립트 하나라 pip 설치가 없고, 모델·엔드포인트·시스템 프롬프트를 플래그나 환경변수로 바꿀 수 있다."
summary_en: "Hand it an image path and GLM-4.6V reads back the text, shapes, and charts — one stdlib-only Python script, no pip installs, with model/endpoint/system-prompt all overridable."
tags: [plugin, glm-vision, vision, glm-4.6v, zai, ocr, image-reading, prime-agent]
source: https://github.com/cskwork/promptbox/tree/main/plugins/glm-vision
author: cskwork
license: MIT
order: 40
harnesses: [Prime Agent, Claude Code, Codex CLI, 모든 ~/.agents/skills/ 호환 에이전트]
install: "git clone https://github.com/cskwork/promptbox && ln -s ~/promptbox/plugins/glm-vision ~/.agents/skills/glm-vision"
---

## 한 줄

OCR(이미지 속 글자를 읽어내는 기술)이 필요한 순간, 에이전트에게 "이 이미지 읽어줘"라고만 하면 된다. `glm_vision.py`가 이미지를 base64로 감싸 GLM-4.6V(중국 Z.ai의 멀티모달 모델)에게 보내고, 모델이 읽은 텍스트를 그대로 stdout으로 돌려준다. 의존성이 전혀 없는 표준 라이브러리 파이썬이라 어떤 머신에서나 `python3` 한 줄로 즉시 동작한다.

*EN: Ask your agent to "read this image" and GLM-4.6V does the OCR — one stdlib-only script, answer on stdout.*

## 설치와 사용

```bash
# 설치: 이 repo를 클론하고 스킬 디렉터리로 심링크
git clone https://github.com/cskwork/promptbox ~/promptbox
ln -s ~/promptbox/plugins/glm-vision ~/.agents/skills/glm-vision

# API 키 (하나만 있으면 됨)
export ZAI_API_KEY=...              # GLM Coding Plan 구독 키
# 또는 prime-agent에서 /login → Z.ai 로 로그인한 적이 있으면
# ~/.prime/agent/auth.json의 키를 자동으로 재사용한다 (설정 불필요)

# 사용
python3 ~/.agents/skills/glm-vision/glm_vision.py screenshot.png
python3 ~/.agents/skills/glm-vision/glm_vision.py chart.png -q "What is the peak value?"
```

모델(`-m`), 엔드포인트(`--base-url`), 시스템 프롬프트(`--system-prompt`)는 플래그·`GLM_VISION_*` 환경변수·스크립트 상단 CONFIG 블록 어디서든 바꿀 수 있다. stdout에는 모델의 답변만 나오므로 파이프라인에 그대로 끼워 넣을 수 있고, 진단 정보는 stderr로 분리돼 있다.

**검증(실측)** — `test/run_test.py`가 알려진 텍스트(`PROMPTBOX-7742`, `ZEBRA`)와 도형 3개(파란 사각형·빨간 원·초록 삼각형)를 심은 이미지를 만들어 실제 API를 호출하고, 모델이 정확히 읽었는지 기계적으로 판정한다. 2026-08-18 실측: `glm-4.6v`, 5.2초, **PASS** — 근거는 `test/output.txt`.

## 함정

- **GLM Coding Plan 키는 전용 엔드포인트에서만** — 기본값 `https://api.z.ai/api/coding/paas/v4`. 종량제 엔드포인트(`/api/paas/v4`)에 코딩 플랜 키를 쓰면 "Insufficient balance" 429가 뜬다. 스크립트가 이 경우 힌트를 출력한다.
- **Prime Inference에는 GLM 비전 변종이 없다** — `z-ai/glm-4.6`은 텍스트 전용이고 비전은 `qwen/qwen3-vl-*` 계열이다. Prime Inference로 쓰려면 `--base-url https://api.pinference.ai/api/v1` + `PRIME_API_KEY`에 qwen3-vl 모델을 지정하면 된다(스크립트는 OpenAI 호환 엔드포인트라면 어디든 동작).
- **API 키는 절대 출력되지 않는다** — 해석 순서는 `--api-key` → `GLM_VISION_API_KEY` → `ZAI_API_KEY` → `PRIME_API_KEY` → prime-agent `auth.json`.

## 원문 (SKILL.md)

아래 블록이 스킬의 전부다. 복사해서 `~/.agents/skills/glm-vision/SKILL.md`로 붙여넣어도 동일하게 동작한다.

````markdown
---
name: glm-vision
description: Read text, shapes, charts, screenshots, or photos with a GLM-4.6V vision model. Use when the user asks to read/OCR/see/describe an image, extract text from a screenshot, identify shapes or colors, or says "glm-vision" / "GLM-4.6V".
---

# glm-vision

Send an image to **GLM-4.6V** and return what the model reads. Works with any
OpenAI-compatible vision endpoint (Z.ai GLM, Prime Inference, OpenRouter, …).
Stdlib-only Python — no `pip install` needed.

## Usage

```bash
# default: GLM-4.6V via the Z.ai GLM Coding Plan endpoint
python3 glm_vision.py screenshot.png

# ask a specific question
python3 glm_vision.py chart.png -q "What is the peak value and which month?"

# other models / endpoints (any OpenAI-compatible vision API)
python3 glm_vision.py photo.jpg -m glm-4.6v --temperature 0
python3 glm_vision.py scan.png --base-url https://api.pinference.ai/api/v1 \
  -m qwen/qwen3-vl-30b-a3b-instruct
```

stdout is the model's answer (safe to pipe/capture). A one-line
`[glm-vision] model=… elapsed=…s` diagnostic goes to stderr. `--json` prints the
raw API response instead.

## API key (never printed, never written)

First hit wins:

1. `--api-key`
2. `$GLM_VISION_API_KEY`
3. `$ZAI_API_KEY`
4. `$PRIME_API_KEY` — pair with `--base-url https://api.pinference.ai/api/v1`
5. `~/.prime/agent/auth.json` — prime-agent users who logged in with `/login` →
   Z.ai are zero-config; the stored `zai` key is reused.

## Customization

| What | CLI flag | Env var | Default (top of `glm_vision.py`) |
|---|---|---|---|
| Model | `-m` | `GLM_VISION_MODEL` | `glm-4.6v` |
| Endpoint | `--base-url` | `GLM_VISION_BASE_URL` | `https://api.z.ai/api/coding/paas/v4` |
| System prompt | `--system-prompt` | `GLM_VISION_SYSTEM_PROMPT` | precise transcription assistant |
| Max tokens | `--max-tokens` | — | `1024` |
| Temperature | `--temperature` | — | `0.2` |

### Endpoints

- **GLM Coding Plan** (default): `https://api.z.ai/api/coding/paas/v4` — included
  in a Z.ai Coding Plan subscription; `glm-4.6v` works here.
- **Z.ai pay-as-you-go**: `https://api.z.ai/api/paas/v4` — needs wallet balance;
  same models.
- **Prime Inference**: `https://api.pinference.ai/api/v1` + `$PRIME_API_KEY` —
  hosts `z-ai/glm-4.6` (text) and `qwen/qwen3-vl-*` (vision) models.

## Verify your setup

```bash
python3 test/make_test_image.py   # generates test/vision_test.png with known text/shapes
python3 test/run_test.py          # calls the real API, asserts the model read it
```

`test/run_test.py` exits 0 only if the model reads the planted text
(`PROMPTBOX-7742`, `ZEBRA`) and all three shapes. Evidence lands in
`test/output.txt`.
````
