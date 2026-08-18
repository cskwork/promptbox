#!/usr/bin/env python3
"""glm-vision — send an image to a GLM-4.6V (or any OpenAI-compatible) vision model.

Given an image path (+ optional question), prints what the model reads.
Stdlib only — no dependencies beyond Python 3.9+.

Usage:
    python3 glm_vision.py photo.png
    python3 glm_vision.py chart.jpg -q "What is the peak value?"
    python3 glm_vision.py scan.png -m glm-4.6v --temperature 0
    python3 glm_vision.py img.png --base-url https://api.pinference.ai/api/v1 \
        -m qwen/qwen3-vl-30b-a3b-instruct          # any OpenAI-compatible endpoint

API key resolution (first hit wins, key is never printed):
    1. --api-key
    2. $GLM_VISION_API_KEY
    3. $ZAI_API_KEY
    4. $PRIME_API_KEY            (pair with --base-url https://api.pinference.ai/api/v1)
    5. ~/.prime/agent/auth.json  (prime-agent users: reuses the stored zai key)
"""

import argparse
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

# ---------------------------------------------------------------- CONFIG ----
# Customize here, or override per-call with args / GLM_VISION_* env vars.
DEFAULT_MODEL = "glm-4.6v"
# GLM Coding Plan subscription endpoint. Pay-as-you-go: https://api.z.ai/api/paas/v4
DEFAULT_BASE_URL = "https://api.z.ai/api/coding/paas/v4"
DEFAULT_SYSTEM_PROMPT = (
    "You are a precise vision assistant. Answer only from what is actually "
    "visible in the image. Transcribe text verbatim, including exact digits "
    "and capitalization. Count shapes carefully. Never guess beyond the image."
)
DEFAULT_MAX_TOKENS = 1024
DEFAULT_TEMPERATURE = 0.2
TIMEOUT_SECONDS = 120
# ---------------------------------------------------------------------------

MIME_BY_EXT = {
    ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".webp": "image/webp", ".gif": "image/gif", ".bmp": "image/bmp",
}

PRIME_INFERENCE_BASE = "https://api.pinference.ai/api/v1"
PRIME_AGENT_AUTH = Path.home() / ".prime" / "agent" / "auth.json"


def resolve_api_key(explicit: str) -> str:
    if explicit:
        return explicit
    for var in ("GLM_VISION_API_KEY", "ZAI_API_KEY", "PRIME_API_KEY"):
        if os.environ.get(var):
            return os.environ[var]
    if PRIME_AGENT_AUTH.is_file():  # prime-agent stores provider keys here
        try:
            auth = json.loads(PRIME_AGENT_AUTH.read_text())
            key = auth.get("zai", {}).get("key")
            if key:
                return key
        except (json.JSONDecodeError, OSError):
            pass
    sys.exit(
        "glm-vision: no API key. Pass --api-key, export ZAI_API_KEY / "
        "GLM_VISION_API_KEY / PRIME_API_KEY, or log in once with prime-agent "
        "(/login → Z.ai) so ~/.prime/agent/auth.json exists."
    )


def image_to_data_uri(image_ref: str) -> str:
    if image_ref.startswith(("http://", "https://")):
        return image_ref  # remote URL: let the provider fetch it
    path = Path(image_ref).expanduser()
    if not path.is_file():
        sys.exit(f"glm-vision: image not found: {path}")
    mime = MIME_BY_EXT.get(path.suffix.lower())
    if mime is None:
        sys.exit(f"glm-vision: unsupported extension {path.suffix!r} "
                 f"(supported: {', '.join(sorted(MIME_BY_EXT))})")
    b64 = base64.b64encode(path.read_bytes()).decode()
    return f"data:{mime};base64,{b64}"


def run(args: argparse.Namespace) -> dict:
    base_url = args.base_url.rstrip("/")
    payload = {
        "model": args.model,
        "messages": [
            {"role": "system", "content": args.system_prompt},
            {
                "role": "user",
                "content": [
                    {"type": "image_url",
                     "image_url": {"url": image_to_data_uri(args.image)}},
                    {"type": "text", "text": args.question},
                ],
            },
        ],
        "max_tokens": args.max_tokens,
        "temperature": args.temperature,
    }
    request = urllib.request.Request(
        f"{base_url}/chat/completions",
        data=json.dumps(payload).encode(),
        headers={
            "Authorization": f"Bearer {resolve_api_key(args.api_key)}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    started = time.time()
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as resp:
            body = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")[:500]
        hint = ""
        if e.code in (401, 403):
            hint = "\n  hint: check that the API key is valid for this endpoint."
        elif e.code == 429 and "balance" in detail.lower():
            hint = ("\n  hint: the GLM Coding Plan key only works on "
                    "https://api.z.ai/api/coding/paas/v4 — you are probably on "
                    "the pay-as-you-go base URL (or vice versa).")
        elif e.code == 400 and "does not exist" in detail:
            hint = "\n  hint: unknown model id for this endpoint — try -m glm-4.6v."
        sys.exit(f"glm-vision: HTTP {e.code} from {base_url}\n  {detail}{hint}")
    except urllib.error.URLError as e:
        sys.exit(f"glm-vision: cannot reach {base_url}: {e.reason}")
    body["_elapsed_s"] = round(time.time() - started, 1)
    return body


def main() -> None:
    env = os.environ.get
    p = argparse.ArgumentParser(
        prog="glm-vision",
        description="Send an image to a GLM-4.6V / OpenAI-compatible vision model "
                    "and print what it reads.",
    )
    p.add_argument("image", help="local image path (png/jpg/jpeg/webp/gif/bmp) "
                                 "or http(s) URL")
    p.add_argument("-q", "--question", default=(
        "Describe this image. Transcribe every piece of visible text verbatim, "
        "then list every shape with its color and position."),
        help="what to ask about the image")
    p.add_argument("-m", "--model", default=env("GLM_VISION_MODEL", DEFAULT_MODEL),
                   help=f"model id (default: {DEFAULT_MODEL})")
    p.add_argument("--base-url", default=env("GLM_VISION_BASE_URL", DEFAULT_BASE_URL),
                   help=f"OpenAI-compatible base URL (default: {DEFAULT_BASE_URL})")
    p.add_argument("--system-prompt",
                   default=env("GLM_VISION_SYSTEM_PROMPT", DEFAULT_SYSTEM_PROMPT),
                   help="system prompt for the model")
    p.add_argument("--api-key", help="API key (else env / prime-agent auth.json)")
    p.add_argument("--max-tokens", type=int, default=DEFAULT_MAX_TOKENS)
    p.add_argument("--temperature", type=float, default=DEFAULT_TEMPERATURE)
    p.add_argument("--json", action="store_true",
                   help="print the raw API response JSON instead of the answer")
    args = p.parse_args()

    body = run(args)
    if args.json:
        print(json.dumps(body, ensure_ascii=False, indent=2))
        return
    try:
        content = body["choices"][0]["message"]["content"] or ""
    except (KeyError, IndexError):
        sys.exit(f"glm-vision: unexpected response shape: "
                 f"{json.dumps(body, ensure_ascii=False)[:400]}")
    print(content.strip())
    print(f"[glm-vision] model={body.get('model', args.model)} "
          f"elapsed={body.get('_elapsed_s')}s", file=sys.stderr)


if __name__ == "__main__":
    main()
