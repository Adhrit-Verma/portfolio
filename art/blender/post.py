"""Bloom + webp for the Blender renders. python art/blender/post.py <in.png> <out.webp>"""
import sys
from PIL import Image, ImageChops, ImageFilter

src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGBA")
rgb, a = im.convert("RGB"), im.getchannel("A")
# Bright pass: only emissive surfaces glow, the hull stays crisp.
bright = rgb.point(lambda v: max(0, v - 150) * 2.4)
glow = ImageChops.add(bright.filter(ImageFilter.GaussianBlur(22)), bright.filter(ImageFilter.GaussianBlur(6)))
out = ImageChops.screen(rgb, glow)
alpha = ImageChops.lighter(a, glow.convert("L").point(lambda v: min(255, v * 2)))
out.putalpha(alpha)
out.save(dst, "WEBP", quality=86, method=6)
