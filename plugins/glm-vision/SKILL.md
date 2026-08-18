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
