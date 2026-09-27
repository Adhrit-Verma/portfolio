"""Contact sheet of inspector shots: python scripts/sheet.py <glob> <out.jpg> [cols]"""
import glob, sys
from PIL import Image
fs = sorted(glob.glob(sys.argv[1])); cols = int(sys.argv[3]) if len(sys.argv) > 3 else 2
im0 = Image.open(fs[0]); W = 720; H = round(im0.height * W / im0.width)
rows = (len(fs) + cols - 1) // cols
sheet = Image.new("RGB", (W * cols, H * rows))
for k, f in enumerate(fs):
    sheet.paste(Image.open(f).convert("RGB").resize((W, H)), ((k % cols) * W, (k // cols) * H))
sheet.save(sys.argv[2], quality=85)
