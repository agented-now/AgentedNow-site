"""
Generate og-image.jpg from site hero: dark bg, cyan accent, hero copy.
Aspect 1:1.19, JPG < 300KB for WhatsApp/social.
"""
import math
import os
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    raise SystemExit("Install Pillow: pip install Pillow")

# Hero colors from styles.css (dark theme)
BG = "#14141c"
TEXT = "#e0e0e0"
ACCENT = "#00d4ff"
GLOW = (0, 212, 255, 80)

# 1:1.19 aspect (width : height)
WIDTH = 1000
HEIGHT = int(round(WIDTH * 1.19))  # 1190
MAX_BYTES = 300 * 1024  # 300 KB
OUT_PATH = Path(__file__).resolve().parent.parent / "visuals" / "og-image.jpg"


def hex_to_rgb(s):
    s = s.lstrip("#")
    return tuple(int(s[i : i + 2], 16) for i in (0, 2, 4))


def find_font(size):
    # Prefer JetBrains Mono; fallback to system monospace
    candidates = [
        Path(os.environ.get("LOCALAPPDATA", "")) / "Fonts" / "JetBrainsMono-Regular.ttf",
        Path(os.environ.get("USERPROFILE", "")) / "AppData" / "Local" / "Microsoft" / "Windows" / "Fonts" / "JetBrainsMono-Regular.ttf",
        Path("C:/Windows/Fonts/consola.ttf"),
        Path("C:/Windows/Fonts/arial.ttf"),
    ]
    for p in candidates:
        if p.exists():
            try:
                return ImageFont.truetype(str(p), size)
            except Exception:
                pass
    return ImageFont.load_default()


def main():
    img = Image.new("RGB", (WIDTH, HEIGHT), hex_to_rgb(BG))
    # Soft central glow
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    cx, cy = WIDTH // 2, HEIGHT // 2
    r = max(WIDTH, HEIGHT) // 2
    od.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(0, 212, 255, 18))
    r2 = max(WIDTH, HEIGHT) // 3
    od.ellipse([cx - r2, cy - r2, cx + r2, cy + r2], fill=(0, 212, 255, 8))
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(img)

    # Title lines (hero copy) – multi-line with accent words
    title_font_size = 48
    line_height = 64
    font = find_font(title_font_size)
    small_font = find_font(int(title_font_size * 0.58))

    lines_config = [
        [(TEXT, "Supercharge your "), (ACCENT, "business")],
        [(TEXT, "with "), (ACCENT, "tailored"), (TEXT, " agentic AI.")],
        [(TEXT, "Get "), (ACCENT, "agented"), (TEXT, "."), (ACCENT, "now")],
    ]
    total_h = len(lines_config) * line_height + 40
    y_start = (HEIGHT - total_h) // 2
    margin = 60

    for i, parts in enumerate(lines_config):
        line_y = y_start + i * line_height
        x = margin
        for color_hex, word in parts:
            draw.text((x, line_y), word, fill=hex_to_rgb(color_hex), font=font)
            bbox = draw.textbbox((0, 0), word, font=font)
            x += bbox[2] - bbox[0] + (2 if not word.endswith(" ") else 0)
    brand_y = y_start + len(lines_config) * line_height + 24
    draw.text((margin, brand_y), "agented.now", fill=hex_to_rgb(ACCENT), font=small_font)

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    for quality in range(88, 60, -4):
        OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
        img.save(OUT_PATH, "JPEG", quality=quality, optimize=True)
        size = OUT_PATH.stat().st_size
        if size <= MAX_BYTES:
            print(f"Saved {OUT_PATH} ({size // 1024} KB, quality={quality}, {WIDTH}x{HEIGHT})")
            return
    # If still too big, resize and try again
    scale = (MAX_BYTES / (OUT_PATH.stat().st_size or 1)) ** 0.5
    nw, nh = int(WIDTH * scale), int(HEIGHT * scale)
    img = img.resize((nw, nh), Image.Resampling.LANCZOS)
    img.save(OUT_PATH, "JPEG", quality=82, optimize=True)
    print(f"Saved resized {OUT_PATH} ({OUT_PATH.stat().st_size // 1024} KB, {nw}x{nh})")


if __name__ == "__main__":
    main()
