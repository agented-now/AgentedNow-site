#!/usr/bin/env python3
"""
Convert all SVG files in this folder to PNG and JPG.
Outputs are saved in the same folder with the same base name.
Requires: pip install cairosvg Pillow
"""

from pathlib import Path

try:
    import cairosvg
except ImportError:
    raise SystemExit("Install cairosvg: pip install cairosvg")

try:
    from PIL import Image
except ImportError:
    raise SystemExit("Install Pillow: pip install Pillow")

# Folder where this script lives (logos off-site)
FOLDER = Path(__file__).resolve().parent

# Default output size (width in pixels). Height follows SVG aspect ratio.
OUTPUT_WIDTH = 1000


def convert_svg_to_png(svg_path: Path, png_path: Path) -> None:
    """Render SVG to PNG at OUTPUT_WIDTH width."""
    cairosvg.svg2png(
        url=str(svg_path),
        write_to=str(png_path),
        output_width=OUTPUT_WIDTH,
    )


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
