from PIL import Image

def analyze_box(path):
    im = Image.open(path)
    print(f"=== {path} ===")
    print("Dimensions:", im.size)
    # Check if there is a dark backdrop or if the whole page is dark
    # Check top-left (50, 50), center (960, 540), bottom-right (1850, 1000)
    print("Top-left (50, 50):", im.getpixel((50, 50)))
    print("Center (960, 540):", im.getpixel((960, 540)))
    print("Bottom-right (1850, 1000):", im.getpixel((1850, 1000)))

for f in [
    'manual_screenshots/Supervisor_01_AddSupervisorAdmin.png',
    'manual_screenshots/Supervisor_02_TempPasswordLogin.png',
    'manual_screenshots/Supervisor_03_ChangeTempPassword.png',
    'manual_screenshots/Student_02_TermsGate.png',
    'manual_screenshots/Admin_04_PromoteGraduates.png'
]:
    analyze_box(f)
