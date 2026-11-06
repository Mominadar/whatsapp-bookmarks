#!/usr/bin/env python3
"""Render assets/icon.svg's geometry to the PNG sizes Chrome and the Web Store need.

Usage: python3 scripts/make-icons.py   (requires Pillow)
"""
from pathlib import Path
from PIL import Image, ImageDraw

SCALE = 8  # supersampling for clean edges
OUT = Path(__file__).resolve().parent.parent / 'assets'


def render(size: int) -> Image.Image:
    unit = 128 * SCALE
    s = lambda v: v * SCALE
    mask_tile = Image.new('L', (unit, unit), 0)
    d = ImageDraw.Draw(mask_tile)
    d.rounded_rectangle((s(8), s(8), s(120), s(108)), radius=s(28), fill=255)
    d.polygon([(s(22), s(100)), (s(14), s(124)), (s(48), s(106))], fill=255)

    gradient = Image.new('RGB', (unit, unit))
    top, bottom = (0x22, 0xC9, 0x97), (0x0B, 0x8A, 0x69)
    gd = ImageDraw.Draw(gradient)
    for y in range(unit):
        t = max(0, min(1, (y - s(8)) / (s(116))))
        gd.line([(0, y), (unit, y)], fill=tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))

    image = Image.new('RGBA', (unit, unit), (0, 0, 0, 0))
    image.paste(gradient, (0, 0), mask_tile)

    d = ImageDraw.Draw(image)
    d.rounded_rectangle((s(40), s(28), s(88), s(62)), radius=s(6), fill='white')
    d.polygon([(s(40), s(50)), (s(88), s(50)), (s(88), s(92)), (s(64), s(76)), (s(40), s(92))], fill='white')
    return image.resize((size, size), Image.LANCZOS)


if __name__ == '__main__':
    for size in (16, 32, 48, 128, 512):
        render(size).save(OUT / f'icon-{size}.png')
        print('wrote', OUT / f'icon-{size}.png')
