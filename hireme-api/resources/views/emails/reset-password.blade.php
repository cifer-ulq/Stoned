<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password — CHMSU HireMe</title>
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
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 89, 48, 0.08);
      border: 1px solid #E2E8F0;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        border-radius: 0 !important;
      }
      .content-padding {
        padding: 24px 20px !important;
      }
      .header-padding {
        padding: 28px 20px !important;
      }
    }
  </style>
</head>
<body style="background-color: #F0F7F4; padding: 36px 12px; margin: 0;">
  <div class="email-container">
    
    <!-- ══ HEADER ══ -->
    <div class="header-padding" style="background: linear-gradient(135deg, #005930 0%, #007A43 100%); padding: 36px 32px; text-align: center; color: #FFFFFF;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
        <tr>
          <td style="vertical-align: middle;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(255, 255, 255, 0.2); display: inline-block; line-height: 44px; font-size: 22px; font-weight: 800; color: #FFFFFF; margin-right: 12px; text-align: center;">
              H
            </div>
          </td>
          <td style="vertical-align: middle; text-align: left;">
            <div style="font-size: 22px; font-weight: 700; letter-spacing: -0.3px; color: #FFFFFF;">CHMSU HireMe</div>
            <div style="font-size: 13px; opacity: 0.9; color: #E0F2E9;">OJT & Career Management Platform</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- ══ BODY CONTENT ══ -->
    <div class="content-padding" style="padding: 36px 32px;">
      
      <!-- Status Badge -->
      <div style="display: inline-block; padding: 6px 14px; background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 20px; color: #065F46; font-size: 13px; font-weight: 600; margin-bottom: 20px;">
        🔑 Password Reset Request
      </div>

      <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 700; color: #111827; letter-spacing: -0.3px;">
        Hello, {{ $userName }}!
      </h2>

      <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #4B5563;">
        We received a request to reset the password for your <strong>CHMSU HireMe</strong> account. Click the button below to choose a new, secure password.
      </p>

      <!-- Account Summary Card -->
      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 16px 20px; margin-bottom: 26px;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 5px 0; color: #64748B; width: 140px;">Registered Email:</td>
            <td style="padding: 5px 0; font-weight: 600; color: #0F172A;">{{ $userEmail }}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #64748B;">Account Role:</td>
            <td style="padding: 5px 0; font-weight: 600; color: #005930; text-transform: capitalize;">{{ $userRole }}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #64748B;">Link Validity:</td>
            <td style="padding: 5px 0; font-weight: 600; color: #D97706;">{{ $expireMinutes }} Minutes</td>
          </tr>
        </table>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin: 32px 0;">
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{ $resetUrl }}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="18%" stroke="f" fillcolor="#005930">
          <w:anchorlock/>
          <center style="color:#ffffff;font-family:sans-serif;font-size:15px;font-weight:bold;">Reset Your Password &rarr;</center>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-- -->
        <a href="{{ $resetUrl }}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #005930 0%, #1A7A4A 100%); color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 34px; border-radius: 10px; box-shadow: 0 4px 14px rgba(0, 89, 48, 0.3); text-align: center;">
          Reset Your Password &rarr;
        </a>
        <!--<![endif]-->
      </div>

      <!-- Expiry Notice Alert -->
      <div style="background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; font-size: 13px; color: #92400E; line-height: 1.5;">
        ⏳ <strong>Security Notice:</strong> This password reset link is valid for <strong>{{ $expireMinutes }} minutes</strong> only and can only be used once. If it expires, you can request a new link at any time from the login page.
      </div>

      <!-- Fallback Raw Link -->
      <div style="border-top: 1px solid #E2E8F0; padding-top: 20px; margin-top: 20px;">
        <p style="margin: 0 0 8px; font-size: 12px; color: #64748B;">
          Having trouble clicking the button? Copy and paste the URL below into your web browser:
        </p>
        <p style="margin: 0; font-size: 12px; word-break: break-all; color: #005930; background: #F1F5F9; padding: 10px 12px; border-radius: 6px; font-family: monospace;">
          <a href="{{ $resetUrl }}" style="color: #005930; text-decoration: underline;">{{ $resetUrl }}</a>
        </p>
      </div>

      <!-- Safety Disclaimer -->
      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #E2E8F0;">
        <p style="margin: 0; font-size: 13px; color: #94A3B8; line-height: 1.5;">
          If you did not request a password reset, please ignore this email or notify your system administrator. Your password will remain unchanged and your account is completely safe.
        </p>
      </div>

    </div>

    <!-- ══ FOOTER ══ -->
    <div style="background-color: #F8FAFC; padding: 22px 32px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 12px; color: #94A3B8;">
      <p style="margin: 0 0 4px;">Carlos Hilado Memorial State University &bull; CIER</p>
      <p style="margin: 0;">CHMSU HireMe &mdash; Center for Internationalization and External Relations</p>
    </div>

  </div>
</body>
</html>
