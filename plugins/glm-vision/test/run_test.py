#!/usr/bin/env python3
"""End-to-end glm-vision test: generate a known image, call the real API,
assert the model read the planted text/shapes. Writes evidence to output.txt.

Exit 0 = PASS. Requires an API key (env ZAI_API_KEY / GLM_VISION_API_KEY /
PRIME_API_KEY, or prime-agent auth.json) and network access.
"""
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
SCRIPT = HERE.parent / "glm_vision.py"
OUTPUT = HERE / "output.txt"

QUESTION = ("List every shape with its color, then transcribe ALL text in "
            "the image exactly as written.")
REQUIRED = ["promptbox-7742", "zebra", "blue", "rectangle",
            "red", "circle", "green", "triangle"]


def main() -> int:
    subprocess.run([sys.executable, str(HERE / "make_test_image.py")], check=True)
    cmd = [sys.executable, str(SCRIPT), str(HERE / "vision_test.png"), "-q", QUESTION]
    started = time.time()
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    wall = round(time.time() - started, 1)
    answer = proc.stdout.strip()
    lowered = answer.lower()
    missing = [k for k in REQUIRED if k not in lowered]
    verdict = "PASS" if proc.returncode == 0 and not missing else "FAIL"

    report = [
        f"$ {' '.join(str(c) for c in cmd)}",
        f"exit={proc.returncode} wall={wall}s verdict={verdict}",
        "--- stdout ---", answer,
        "--- stderr ---", proc.stderr.strip(),
    ]
    if missing:
        report.append(f"--- missing keywords: {missing} ---")
    OUTPUT.write_text("\n".join(report) + "\n")
    print("\n".join(report))
    print(f"evidence: {OUTPUT}")
    return 0 if verdict == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())
