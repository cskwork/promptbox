# glm-vision

A tiny vision skill for coding agents (prime-agent, Claude Code, Codex CLI, …):
give it an image path, get back what **GLM-4.6V** reads — text, shapes, charts,
screenshots.

- `glm_vision.py` — stdlib-only CLI (Python 3.9+, zero dependencies)
- `SKILL.md` — agent-facing skill definition (triggers + usage)
- `test/` — generates a known test image and verifies the model really reads it

## Install

```bash
# from a clone of this repo
ln -s "$(pwd)/plugins/glm-vision" ~/.agents/skills/glm-vision
```

(or copy the directory; any skills dir your agent reads works —
`~/.agents/skills/` is the cross-agent convention prime-agent uses)

Needs an API key: `ZAI_API_KEY` (GLM Coding Plan or pay-as-you-go),
`PRIME_API_KEY` (+ `--base-url https://api.pinference.ai/api/v1`), or a prior
`prime-agent` `/login` → Z.ai (key reused from `~/.prime/agent/auth.json`).

## Usage

```bash
python3 ~/.agents/skills/glm-vision/glm_vision.py image.png -q "read the text"
```

Model, endpoint, system prompt are customizable via flags, `GLM_VISION_*` env
vars, or the CONFIG block at the top of the script. See `SKILL.md`.
