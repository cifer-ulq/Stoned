import os
from PIL import Image

img_dir = os.path.join(os.getcwd(), 'manual_screenshots')
files = sorted([f for f in os.listdir(img_dir) if f.endswith('.png')])

print(f"Total screenshots: {len(files)}")

for f in files:
    path = os.path.join(img_dir, f)
    im = Image.open(path).convert('RGB')
    w, h = im.size
    
    # Sample various areas: top bar (100, 25), main content (600, 400), background (1800, 900)
    top_bar = im.getpixel((600, 30))
    bg_sample = im.getpixel((1800, 800))
    center = im.getpixel((960, 540))
    
    # Calculate overall luminance of the corners / background
    corners = [
        im.getpixel((20, 20)),
        im.getpixel((w - 20, 20)),
        im.getpixel((20, h - 20)),
        im.getpixel((w - 20, h - 20))
    ]
    avg_corner = sum(sum(c)/3 for c in corners) / 4
    
    # Check if dark (luminance < 100)
    is_dark = avg_corner < 120 or (sum(bg_sample)/3 < 100 and sum(top_bar)/3 < 100)
    
    status = "DARK" if is_dark else "LIGHT"
    print(f"{status:5} | {f:40} | corner_lum: {avg_corner:5.1f} | top: {top_bar} | bg: {bg_sample}")
