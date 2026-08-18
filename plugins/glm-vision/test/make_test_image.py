#!/usr/bin/env python3
"""Generate test/vision_test.png with planted ground truth for glm-vision.

Ground truth: text "PROMPTBOX-7742", "shape count: 3", "bottom word: ZEBRA";
shapes: blue rectangle, red circle, green triangle.
Requires Pillow (test-only dependency; the skill itself is stdlib-only).
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).with_name("vision_test.png")


def load_font(size: int) -> ImageFont.FreeTypeFont:
    for candidate in [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",       # macOS fallback
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",  # Linux fallback
    ]:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue
    return ImageFont.load_default()


W, H = 640, 400
img = Image.new("RGB", (W, H), "white")
d = ImageDraw.Draw(img)
d.rectangle([20, 20, 200, 130], fill="#1f6feb")                       # blue rect
d.ellipse([W - 210, 20, W - 20, 210], fill="#e5484d")                 # red circle
d.polygon([(110, 380), (200, 230), (290, 380)], fill="#2da44e")       # green triangle
d.text((240, 60), "PROMPTBOX-7742", font=load_font(40), fill="black")
d.text((240, 130), "shape count: 3", font=load_font(22), fill="black")
d.text((240, 170), "bottom word: ZEBRA", font=load_font(22), fill="black")
img.save(OUT)
print(f"wrote {OUT} ({W}x{H})")
