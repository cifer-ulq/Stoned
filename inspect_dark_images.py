from PIL import Image

for name in [
    'Supervisor_01_AddSupervisorAdmin.png',
    'Supervisor_02_TempPasswordLogin.png',
    'Supervisor_03_ChangeTempPassword.png',
    'Supervisor_06_ImportStudents.png',
    'Supervisor_09_IssueEndorsement.png',
    'Supervisor_12_DispatchEvaluation.png',
    'Student_02_TermsGate.png',
    'Student_12_EmergencyNotice.png',
    'Student_13_PullOutModal.png',
    'Company_08_ScheduleInterview.png',
    'Company_12_EvaluationForm.png',
    'Graduate_06_JobDetailApply.png',
    'Admin_04_PromoteGraduates.png',
    'Admin_05_BroadcastNotice.png',
    'Admin_07_MoaApproval.png',
    'Admin_09_DeanPullOutLetter.png'
]:
    im = Image.open(f'manual_screenshots/{name}')
    print(f"{name}: size={im.size}, center_pixel={im.getpixel((960, 540))}, corner={im.getpixel((20, 20))}")
