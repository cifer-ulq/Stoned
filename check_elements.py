import os
from PIL import Image

img_dir = os.path.join(os.getcwd(), 'manual_screenshots')

def check_image_theme(name):
    path = os.path.join(img_dir, name)
    if not os.path.exists(path):
        return f"{name}: File not found"
    im = Image.open(path).convert('RGB')
    w, h = im.size
    
    # Check sidebar area (x=100, y=300)
    sidebar = im.getpixel((100, 300))
    # Check topbar area (x=500, y=30)
    topbar = im.getpixel((500, 30))
    # Check main content area (x=600, y=300)
    main_area = im.getpixel((600, 300))
    # Check center (x=960, y=540)
    center = im.getpixel((960, 540))
    
    return f"{name:35} | sidebar:{sidebar} | top:{topbar} | main:{main_area} | center:{center}"

for f in sorted(os.listdir(img_dir)):
    if f.endswith('.png'):
        print(check_image_theme(f))
