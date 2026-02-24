#!/usr/bin/env python3
"""
Convert all SVG files in this folder to PNG and JPG.
Outputs are saved in the same folder with the same base name.
Renders via a headless browser (Playwright) so fonts, filters, and
effects match the SVG. No Cairo/system libs.
Requires: pip install playwright Pillow && playwright install chromium
"""

import argparse
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

# Default output width (high-res). Height follows SVG viewBox aspect ratio.
DEFAULT_OUTPUT_WIDTH = 3000

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


def convert_svg_to_png(svg_path: Path, png_path: Path, output_width: int) -> None:
    """Render SVG to PNG using headless browser so fonts and filters are correct."""
    svg_content = svg_path.read_text(encoding="utf-8")
    vb_w, vb_h = get_viewbox_size(svg_content)
    out_h = max(1, round(vb_h * output_width / vb_w))

    # Inline SVG in HTML so file:// can load it; add font in head so it applies
    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link href="{FONT_LINK}" rel="stylesheet">
<style>
  * {{ margin: 0; padding: 0; }}
  body {{ width: {output_width}px; height: {out_h}px; overflow: hidden; }}
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
                viewport={"width": output_width, "height": out_h},
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


def ask_skip_or_force_all(count: int) -> bool:
    """Ask once: skip all existing or force-convert all. Return True to skip existing."""
    while True:
        r = input(
            f"  {count} file(s) already have PNG & JPG. "
            "[S]kip all or [F]orce convert all? [s/f] (default s): "
        ).strip().lower() or "s"
        if r in ("s", "skip"):
            return True
        if r in ("f", "force"):
            return False
        print("  Enter s (skip all) or f (force convert all).")


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Convert SVG files in this folder to PNG and JPG (high-res by default)."
    )
    p.add_argument(
        "-w",
        "--width",
        type=int,
        default=DEFAULT_OUTPUT_WIDTH,
        metavar="PX",
        help=f"Output width in pixels (height from SVG aspect ratio). Default: {DEFAULT_OUTPUT_WIDTH}",
    )
    p.add_argument(
        "-f",
        "--force",
        action="store_true",
        help="Reconvert all SVGs even if PNG and JPG already exist",
    )
    p.add_argument(
        "-s",
        "--skip",
        action="store_true",
        help="Skip all files that already have PNG and JPG (no prompt)",
    )
    return p.parse_args()


def main() -> None:
    args = parse_args()
    output_width = max(1, args.width)

    svg_files = list(FOLDER.glob("*.svg"))
    if not svg_files:
        print("No SVG files found in", FOLDER)
        return

    print(f"Converting {len(svg_files)} SVG(s) at {output_width}px width in: {FOLDER}\n")

    # Which SVGs already have both PNG and JPG?
    already_have_both = []
    for svg_path in svg_files:
        base = svg_path.stem
        png_path = FOLDER / f"{base}.png"
        jpg_path = FOLDER / f"{base}.jpg"
        if png_path.exists() and jpg_path.exists():
            already_have_both.append(svg_path)

    skip_existing = args.skip
    if already_have_both and not args.force and not args.skip:
        skip_existing = ask_skip_or_force_all(len(already_have_both))
        print()

    for svg_path in sorted(svg_files):
        base = svg_path.stem
        png_path = FOLDER / f"{base}.png"
        jpg_path = FOLDER / f"{base}.jpg"

        if png_path.exists() and jpg_path.exists() and skip_existing:
            print(f"  Skipping {svg_path.name}")
            continue

        try:
            print(f"  {svg_path.name} -> {png_path.name}, {jpg_path.name}")
            convert_svg_to_png(svg_path, png_path, output_width)
            convert_png_to_jpg(png_path, jpg_path)
        except Exception as e:
            print(f"  ERROR: {e}")

    print("\nDone.")


if __name__ == "__main__":
    main()
