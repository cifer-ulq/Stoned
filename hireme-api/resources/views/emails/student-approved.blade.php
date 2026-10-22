<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Account Approved — CHMSU HireMe</title>
  <style type="text/css">
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #F0F7F4;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1A1A2E;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 89, 48, 0.08);
    }
  </style>
</head>
<body style="background-color: #F0F7F4; padding: 40px 15px;">
  <div class="email-container">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #005930 0%, #007A43 100%); padding: 36px 30px; text-align: center; color: #FFFFFF;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">CHMSU HireMe</h1>
      <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Student OJT & Career Portal</p>
    </div>

    <!-- Body -->
    <div style="padding: 36px 30px;">
      <div style="display: inline-block; padding: 6px 12px; background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 20px; color: #065F46; font-size: 13px; font-weight: 600; margin-bottom: 20px;">
        ✓ Account Verified & Approved
      </div>

      <h2 style="margin: 0 0 12px; font-size: 20px; color: #111827;">Welcome, {{ $studentName }}!</h2>
      <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #4B5563;">
        Great news! Your student registration has been reviewed and officially <strong>approved</strong> by the university OJT Coordinator / Administrator.
      </p>

      <!-- Details Card -->
      <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #6B7280; width: 120px;">Student ID:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #111827;">{{ $studentId }}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6B7280;">Program:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #111827;">{{ $program }}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6B7280;">Registered Email:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #111827;">{{ $email }}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6B7280;">Status:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #059669;">Active</td>
          </tr>
        </table>
      </div>

      <p style="margin: 0 0 28px; font-size: 14px; line-height: 1.6; color: #4B5563;">
        You can now sign in with your registered email and password to begin exploring OJT opportunities, submitting daily time records, and tracking your internship progress.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 28px;">
        <a href="{{ $loginUrl }}" style="display: inline-block; background-color: #005930; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 89, 48, 0.2);">
          Sign In to Your Account →
        </a>
      </div>

      <p style="margin: 0; font-size: 13px; color: #9CA3AF; text-align: center;">
        If you have questions, please reach out to your designated campus OJT Coordinator.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #F9FAFB; border-top: 1px solid #E5E7EB; padding: 20px 30px; text-align: center; font-size: 12px; color: #9CA3AF;">
      © {{ date('Y') }} Carlos Hilado Memorial State University. All rights reserved.
    </div>
  </div>
</body>
</html>
