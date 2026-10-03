<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Welcome to CHMSU HireMe — {{ $studentName }}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #EBF0F8;
      color: #1A2744;
      -webkit-font-smoothing: antialiased;
    }
    .outer  { max-width: 620px; margin: 36px auto; padding: 0 16px; }
    .card   { background: #FFFFFF; border-radius: 18px; overflow: hidden;
              box-shadow: 0 4px 40px rgba(14,30,65,0.12), 0 0 0 1px rgba(14,30,65,0.06); }

    /* Header */
    .hdr {
      background: linear-gradient(150deg, #0B1730 0%, #152549 45%, #0B1730 100%);
      padding: 44px 48px 40px; text-align: center;
    }
    .hdr-logo-row { display: block; text-align: center; margin-bottom: 20px; }
    .hdr-logo-inner { display: inline-flex; align-items: center; gap: 11px; }
    .hdr-mark {
      width: 46px; height: 46px;
      background: linear-gradient(135deg, #4A6CF7 0%, #7B9BFF 100%);
      border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .hdr-wordmark { font-size: 26px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.5px; line-height: 1; }
    .hdr-wordmark em { font-style: normal; color: #818CF8; }
    .hdr-pill {
      display: inline-block;
      background: rgba(129,140,248,0.18); border: 1px solid rgba(129,140,248,0.28); color: #A5B4FC;
      font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
      padding: 5px 15px; border-radius: 999px; margin-bottom: 20px;
    }
    .hdr-title { font-size: 27px; font-weight: 700; color: #FFFFFF; line-height: 1.3; letter-spacing: -0.4px; margin-bottom: 11px; }
    .hdr-title-name { color: #93C5FD; }
    .hdr-sub { font-size: 13.5px; color: #7E97B8; line-height: 1.7; }
    .hdr-accent { height: 3px; background: linear-gradient(90deg, #4A6CF7, #818CF8, #4A6CF7); }

    /* Body */
    .body { padding: 38px 48px; }
    .greeting { font-size: 14.5px; color: #334155; line-height: 1.78; margin-bottom: 30px; }
    .greeting strong { color: #0F172A; }

    /* Section label */
    .sec-label { display: table; width: 100%; margin-bottom: 12px; }
    .sec-label-text {
      display: table-cell; white-space: nowrap;
      font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.13em;
      color: #4A6CF7; padding-right: 12px; vertical-align: middle;
    }
    .sec-label-line { display: table-cell; width: 100%; border-bottom: 1px solid #E2E8F0; vertical-align: middle; }

    /* Credentials card */
    .creds-card {
      border: 1px solid #E2E8F0; border-radius: 14px; overflow: hidden; margin-bottom: 28px;
      background: #F8FAFF;
    }
    .creds-header {
      background: linear-gradient(135deg, #4A6CF7 0%, #6B87F9 100%);
      padding: 14px 20px;
      font-size: 11px; font-weight: 700; letter-spacing: 0.10em; text-transform: uppercase; color: #fff;
    }
    .creds-body { padding: 0; }
    .creds-row { display: flex; align-items: center; padding: 13px 20px; border-bottom: 1px solid #EEF2FF; }
    .creds-row:last-child { border-bottom: none; }
    .creds-lbl { width: 130px; font-size: 12px; color: #64748B; font-weight: 600; flex-shrink: 0; }
    .creds-val { font-size: 13.5px; color: #0F172A; font-weight: 700; font-family: 'Courier New', monospace; }
    .creds-val-email { font-family: inherit; font-weight: 500; color: #4A6CF7; }
    .creds-note { font-size: 11.5px; color: #7C8DB5; margin-left: 10px; font-style: italic; }

    /* Details table */
    .dtable-card { border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; margin-bottom: 30px; }
    .dtable-card table { width: 100%; border-collapse: collapse; }
    .dtable-card tr:nth-child(even) td { background: #F8FAFC; }
    .dtable-card tr:last-child td { border-bottom: none; }
    .dtable-card td { padding: 12px 20px; font-size: 13.5px; border-bottom: 1px solid #F1F5F9; vertical-align: middle; line-height: 1.5; }
    .dt-lbl { width: 155px; color: #64748B; font-weight: 500; white-space: nowrap; }
    .dt-val { color: #0F172A; font-weight: 500; }

    /* Warning box */
    .warn-box {
      background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px;
      padding: 14px 18px; margin-bottom: 28px; display: flex; gap: 12px; align-items: flex-start;
    }
    .warn-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
    .warn-text { font-size: 13px; color: #92400E; line-height: 1.65; }
    .warn-text strong { color: #78350F; }

    /* CTA */
    .cta {
      border-radius: 14px; border: 1px solid #DBEAFE;
      background: linear-gradient(160deg, #F0F6FF 0%, #F5F3FF 100%);
      padding: 34px 40px; text-align: center; margin-bottom: 30px; position: relative; overflow: hidden;
    }
    .cta::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0;
      height: 4px; background: linear-gradient(90deg, #4A6CF7, #818CF8);
    }
    .cta-title { font-size: 17px; font-weight: 700; color: #0F172A; margin-bottom: 8px; }
    .cta-sub { font-size: 13px; color: #64748B; line-height: 1.65; margin-bottom: 22px; }
    .cta-btn {
      display: inline-block; padding: 14px 36px;
      background: linear-gradient(135deg, #4A6CF7 0%, #6B87F9 100%);
      color: #FFFFFF !important; text-decoration: none; border-radius: 10px;
      font-size: 14.5px; font-weight: 700; letter-spacing: 0.01em;
      box-shadow: 0 4px 16px rgba(74,108,247,0.38);
    }

    /* Steps */
    .steps { margin-bottom: 30px; }
    .step { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 16px; }
    .step-num {
      width: 28px; height: 28px; border-radius: 50%;
      background: linear-gradient(135deg, #4A6CF7 0%, #6B87F9 100%);
      color: #fff; font-size: 12px; font-weight: 700;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;
    }
    .step-text { font-size: 13.5px; color: #334155; line-height: 1.7; }
    .step-text strong { color: #0F172A; }

    /* Footer */
    .footer {
      background: #F8FAFC; border-top: 1px solid #E2E8F0;
      padding: 28px 48px; text-align: center;
    }
    .footer-brand { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 14px; }
    .footer-mark {
      width: 30px; height: 30px;
      background: linear-gradient(135deg, #4A6CF7 0%, #7B9BFF 100%);
      border-radius: 8px; display: inline-flex; align-items: center; justify-content: center;
    }
    .footer-name { font-size: 14px; font-weight: 700; color: #1A2744; }
    .footer-name em { font-style: normal; color: #4A6CF7; }
    .footer-line { font-size: 12px; color: #94A3B8; line-height: 1.7; }
    .footer-line a { color: #4A6CF7; text-decoration: none; }
  </style>
</head>
<body>
  <div class="outer">
    <div class="card">

      <!-- Header -->
      <div class="hdr">
        <span class="hdr-logo-row">
          <span class="hdr-logo-inner">
            <span class="hdr-mark">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#fff"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="hdr-wordmark">Hire<em>Me</em></span>
          </span>
        </span>
        <div class="hdr-pill">✦ Student Account Created</div>
        <div class="hdr-title">
          Welcome aboard,<br>
          <span class="hdr-title-name">{{ $studentName }}!</span>
        </div>
        <div class="hdr-sub">
          Your student account has been created by the CHMSU CIER Admin.<br>
          Below are your login credentials — keep them safe.
        </div>
      </div>
      <div class="hdr-accent"></div>

      <!-- Body -->
      <div class="body">

        <div class="greeting">
          Hi <strong>{{ $studentName }}</strong>, congratulations! Your CHMSU HireMe account
          has been successfully created. This platform will help you track your OJT progress,
          explore job opportunities, and connect with partner companies.
        </div>

        <!-- Login Credentials -->
        <div class="sec-label">
          <span class="sec-label-text">Your Login Credentials</span>
          <span class="sec-label-line"></span>
        </div>
        <div class="creds-card">
          <div class="creds-header">🔐 Account Access Details</div>
          <div class="creds-body">
            <div class="creds-row">
              <span class="creds-lbl">Login Email</span>
              <span class="creds-val creds-val-email">{{ $email }}</span>
            </div>
            <div class="creds-row">
              <span class="creds-lbl">Password</span>
              <span class="creds-val">{{ $studentId }}</span>
              <span class="creds-note">⚠ Change this after first login</span>
            </div>
          </div>
        </div>

        <!-- Student Info -->
        <div class="sec-label">
          <span class="sec-label-text">Your Academic Profile</span>
          <span class="sec-label-line"></span>
        </div>
        <div class="dtable-card" style="margin-bottom: 28px;">
          <table>
            <tr>
              <td class="dt-lbl">Student ID</td>
              <td class="dt-val">{{ $studentId }}</td>
            </tr>
            <tr>
              <td class="dt-lbl">Program / Course</td>
              <td class="dt-val">{{ $program ?: '—' }}</td>
            </tr>
            <tr>
              <td class="dt-lbl">Campus</td>
              <td class="dt-val">{{ $campus ?: 'Main Campus' }}</td>
            </tr>
            <tr>
              <td class="dt-lbl">Institution</td>
              <td class="dt-val">Carlos Hilado Memorial State University</td>
            </tr>
          </table>
        </div>

        <!-- Password warning -->
        <div class="warn-box">
          <span class="warn-icon">⚠️</span>
          <div class="warn-text">
            <strong>Important:</strong> Your default password is your Student ID number
            (<strong>{{ $studentId }}</strong>). Please log in and change your password
            immediately to keep your account secure.
          </div>
        </div>

        <!-- CTA -->
        <div class="cta">
          <div class="cta-title">Ready to get started?</div>
          <div class="cta-sub">
            Log in with your email and Student ID as your password.<br>
            Complete your profile and explore job opportunities.
          </div>
          <a href="{{ $loginUrl }}" class="cta-btn">Log In to HireMe</a>
        </div>

        <!-- Getting Started Steps -->
        <div class="sec-label">
          <span class="sec-label-text">Getting Started</span>
          <span class="sec-label-line"></span>
        </div>
        <div class="steps">
          <div class="step">
            <div class="step-num">1</div>
            <div class="step-text"><strong>Log in</strong> using your email and Student ID as password.</div>
          </div>
          <div class="step">
            <div class="step-num">2</div>
            <div class="step-text"><strong>Change your password</strong> immediately from your profile settings.</div>
          </div>
          <div class="step">
            <div class="step-num">3</div>
            <div class="step-text"><strong>Complete your profile</strong> — add your bio, skills, and experience.</div>
          </div>
          <div class="step">
            <div class="step-num">4</div>
            <div class="step-text"><strong>Explore</strong> OJT postings and job opportunities from partner companies.</div>
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="footer-brand">
          <span class="footer-mark">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#fff"/>
            </svg>
          </span>
          <span class="footer-name">Hire<em>Me</em></span>
        </div>
        <div class="footer-line">
          This account was created by the CHMSU CIER Admin Office.<br>
          Carlos Hilado Memorial State University &mdash; Career Placement &amp; OJT Management System.<br>
          If you received this in error or have questions, contact your department coordinator.
        </div>
      </div>

    </div>
  </div>
</body>
</html>
