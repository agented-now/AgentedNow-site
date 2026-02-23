#!/usr/bin/env python3
"""
Convert all SVG files in this folder to PNG and JPG.
Outputs are saved in the same folder with the same base name.
Renders via a headless browser (Playwright) so fonts, filters, and
effects match the SVG. No Cairo/system libs.
Requires: pip install playwright Pillow && playwright install chromium
"""

import re
import tempfile
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    raise SystemExit("Install Playwright: pip install playwright && playwright install chromium")

try:
    from PIL import Image
except ImportError:
    raise SystemExit("Install Pillow: pip install Pillow")

# Folder where this script lives (logos off-site)
FOLDER = Path(__file__).resolve().parent

# Output width in pixels. Height follows SVG viewBox aspect ratio.
OUTPUT_WIDTH = 1000

# Google Font used by the logo SVGs (so it loads when rendering from file://)
FONT_LINK = (
    'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@600&display=swap'
)


def get_viewbox_size(svg_content: str) -> tuple[int, int]:
    """Parse viewBox from SVG; return (width, height). Default (380, 72) if missing."""
    m = re.search(
        r'viewBox\s*=\s*["\']?\s*[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)',
        svg_content,
        re.IGNORECASE,
    )
    if m:
        return int(float(m.group(1))), int(float(m.group(2)))
    return 380, 72


def convert_svg_to_png(svg_path: Path, png_path: Path) -> None:
    """Render SVG to PNG using headless browser so fonts and filters are correct."""
    svg_content = svg_path.read_text(encoding="utf-8")
    vb_w, vb_h = get_viewbox_size(svg_content)
    out_h = max(1, round(vb_h * OUTPUT_WIDTH / vb_w))

    # Inline SVG in HTML so file:// can load it; add font in head so it applies
    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link href="{FONT_LINK}" rel="stylesheet">
<style>
  * {{ margin: 0; padding: 0; }}
  body {{ width: {OUTPUT_WIDTH}px; height: {out_h}px; overflow: hidden; }}
  svg {{ width: 100%; height: 100%; display: block; }}
</style>
</head>
<body>
{svg_content}
</body>
</html>"""

    with tempfile.NamedTemporaryFile(
        mode="w",
        suffix=".html",
        delete=False,
        encoding="utf-8",
        dir=str(FOLDER),
    ) as f:
        f.write(html)
        html_path = f.name

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(
                viewport={"width": OUTPUT_WIDTH, "height": out_h},
                device_scale_factor=1,
            )
            page.goto(Path(html_path).as_uri(), wait_until="networkidle")
            page.wait_for_timeout(400)  # allow web font to paint
            # Screenshot with transparent background where possible
            page.screenshot(
                path=str(png_path),
                type="png",
                omit_background=True,
            )
            browser.close()
    finally:
        Path(html_path).unlink(missing_ok=True)


def convert_png_to_jpg(png_path: Path, jpg_path: Path, bg_white: bool = True) -> None:
    """Convert PNG to JPG. Use white background for transparent pixels if bg_white."""
    img = Image.open(png_path)
    if img.mode in ("RGBA", "P"):
        if bg_white:
            background = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "P":
                img = img.convert("RGBA")
            background.paste(img, mask=img.split()[-1])
            img = background
        else:
            img = img.convert("RGB")
    elif img.mode != "RGB":
        img = img.convert("RGB")
    img.save(jpg_path, "JPEG", quality=95)


def main() -> None:
    svg_files = list(FOLDER.glob("*.svg"))
    if not svg_files:
        print("No SVG files found in", FOLDER)
        return

    print(f"Converting {len(svg_files)} SVG(s) in: {FOLDER}\n")

    for svg_path in sorted(svg_files):
        base = svg_path.stem
        png_path = FOLDER / f"{base}.png"
        jpg_path = FOLDER / f"{base}.jpg"

        try:
            print(f"  {svg_path.name} -> {png_path.name}, {jpg_path.name}")
            convert_svg_to_png(svg_path, png_path)
            convert_png_to_jpg(png_path, jpg_path)
        except Exception as e:
            print(f"  ERROR: {e}")

    print("\nDone.")


if __name__ == "__main__":
    main()
