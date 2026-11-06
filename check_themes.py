import os
from PIL import Image, ImageStat

img_dir = os.path.join(os.getcwd(), 'manual_screenshots')
dark_files = []
light_files = []

for f in sorted(os.listdir(img_dir)):
    if not f.endswith('.png'):
        continue
    path = os.path.join(img_dir, f)
    im = Image.open(path).convert('L')
    stat = ImageStat.Stat(im)
    avg_brightness = stat.mean[0]
    if avg_brightness < 140:
        dark_files.append((f, avg_brightness))
    else:
        light_files.append((f, avg_brightness))

print(f"Total Dark Screenshots ({len(dark_files)}):")
for f, b in dark_files:
    print(f"  [DARK] {f} (brightness: {b:.1f})")

print(f"\nTotal Light Screenshots ({len(light_files)}):")
for f, b in light_files:
    print(f"  [LIGHT] {f} (brightness: {b:.1f})")
