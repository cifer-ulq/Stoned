<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Official Memorandum — OJT Pull-Out Endorsement</title>
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background-color: #f1f5f9;
            color: #1e293b;
            margin: 0;
            padding: 24px;
            line-height: 1.6;
        }
        .container {
            max-width: 680px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid #cbd5e1;
            box-shadow: 0 4px 15px rgba(0,0,0,0.06);
        }
        .header {
            background: linear-gradient(135deg, #005930 0%, #00361d 100%);
            color: #ffffff;
            padding: 28px 32px;
            text-align: center;
            border-bottom: 3px solid #d97706;
        }
        .header h1 {
            margin: 0;
            font-size: 19px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .header h2 {
            margin: 4px 0 0;
            font-size: 13px;
            font-weight: 400;
            opacity: 0.9;
        }
        .body-content {
            padding: 32px;
        }
        .memo-meta {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px 20px;
            margin-bottom: 24px;
            font-size: 13.5px;
        }
        .memo-meta table {
            width: 100%;
            border-collapse: collapse;
        }
        .memo-meta td {
            padding: 4px 0;
            vertical-align: top;
        }
        .memo-meta td.label {
            width: 100px;
            font-weight: 700;
            color: #475569;
        }
        .section-box {
            background: #f8fafc;
            border-left: 4px solid #005930;
            padding: 14px 18px;
            margin: 18px 0;
            border-radius: 0 6px 6px 0;
            font-size: 14px;
        }
        .reason-box {
            background: #fffbeb;
            border-left: 4px solid #d97706;
            padding: 14px 18px;
            margin: 18px 0;
            border-radius: 0 6px 6px 0;
            font-size: 14px;
            color: #78350f;
        }
        .table-info {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
            font-size: 13.5px;
        }
        .table-info th, .table-info td {
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
            text-align: left;
        }
        .table-info th {
            background: #f1f5f9;
            font-weight: 600;
            color: #334155;
            width: 35%;
        }
        .footer {
            background: #f8fafc;
            padding: 20px 32px;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #64748b;
            text-align: center;
        }
        .signatures {
            margin-top: 32px;
            display: table;
            width: 100%;
        }
        .sig-col {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding-right: 15px;
        }
        .sig-line {
            margin-top: 40px;
            border-top: 1px solid #94a3b8;
            padding-top: 4px;
            font-weight: 700;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Carlos Hilado Memorial State University</h1>
            <h2>Office of the Program Chairperson &bull; OJT &amp; Career Placement</h2>
        </div>

        <div class="body-content">
            <div class="memo-meta">
                <table>
                    <tr>
                        <td class="label">DATE:</td>
                        <td><strong>{{ now()->format('F d, Y') }}</strong></td>
                    </tr>
                    <tr>
                        <td class="label">TO:</td>
                        <td><strong>{{ $deanName }}</strong>, Dean</td>
                    </tr>
                    <tr>
                        <td class="label">THROUGH:</td>
                        <td>Office of the OJT &amp; Career Placement Coordinator</td>
                    </tr>
                    <tr>
                        <td class="label">FROM:</td>
                        <td><strong>{{ $programChairName }}</strong>, Program Chairperson / Admin</td>
                    </tr>
                    <tr>
                        <td class="label">SUBJECT:</td>
                        <td><strong style="color: #005930;">ENDORSEMENT FOR OFFICIAL OJT PULL-OUT — {{ $pullOut->student?->name }}</strong></td>
                    </tr>
                </table>
            </div>

            <p>Dear Dean {{ $deanName }},</p>

            <p>
                Respectfully submitting for your official review and approval the request for <strong>Formal Pull-Out from On-the-Job Training (OJT)</strong> for the student trainee identified below:
            </p>

            <table class="table-info">
                <tr>
                    <th>Student Name</th>
                    <td><strong>{{ $pullOut->student?->name }}</strong></td>
                </tr>
                <tr>
                    <th>Student ID / Course</th>
                    <td>{{ $pullOut->student?->studentProfile?->student_id ?? 'N/A' }} &bull; {{ $pullOut->student?->studentProfile?->program ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <th>Host Training Establishment</th>
                    <td><strong>{{ $pullOut->ojtRecord?->company_name ?? $pullOut->ojtInterest?->posting?->company_name ?? 'Host Company' }}</strong></td>
                </tr>
                <tr>
                    <th>Hours Progress</th>
                    <td><strong>{{ (float) $pullOut->hours_rendered_snapshot }}</strong> / {{ (float) $pullOut->required_hours_snapshot }} Hours Rendered</td>
                </tr>
                <tr>
                    <th>Reason Category</th>
                    <td><strong style="text-transform: capitalize;">{{ str_replace('_', ' ', $pullOut->reason_category) }}</strong></td>
                </tr>
            </table>

            <div class="reason-box">
                <strong>Student's Justification &amp; Stated Reason:</strong>
                <p style="margin: 6px 0 0; font-style: italic;">
                    &ldquo;{{ $pullOut->reason }}&rdquo;
                </p>
                @if($pullOut->student_letter_url)
                    <p style="margin: 8px 0 0; font-size: 12px;">
                        📎 <strong>Attached Student Request Letter:</strong> <a href="{{ $pullOut->student_letter_url }}" target="_blank" style="color: #0284c7; font-weight: 600;">View Uploaded Letter Document</a>
                    </p>
                @endif
            </div>

            <div class="section-box">
                <strong>Academic Coordinator's Endorsement Remarks:</strong>
                <p style="margin: 6px 0 0;">
                    {{ $pullOut->supervisor_remarks ?: 'The OJT Coordinator has audited the trainee\'s situation and confirms that a pull-out is warranted in the best interest and safety of the student.' }}
                </p>
                <p style="margin: 6px 0 0; font-size: 12px; color: #64748b;">
                    Reviewed and recommended by: <strong>{{ $pullOut->supervisor?->name ?? 'OJT Coordinator' }}</strong> on {{ $pullOut->supervisor_action_at?->format('M d, Y h:i A') ?? now()->format('M d, Y') }}.
                </p>
            </div>

            @if($remarks)
                <div style="background: #f1f5f9; padding: 12px 16px; border-radius: 6px; font-size: 13px; margin: 16px 0;">
                    <strong>Program Chair Additional Notes:</strong> {{ $remarks }}
                </div>
            @endif

            <p>
                In light of the verified circumstances, we respectfully recommend your authorization to officially pull out the trainee from the current host company and allow re-deployment to an alternative training establishment.
            </p>

            <p>
                <strong>Action Requested:</strong> Please respond to this email with your official approval (e.g., <em>&ldquo;Approved&rdquo;</em> or specific directives). The Program Chair will record your concurrence in the HireMe system to finalize the student's status.
            </p>

            <div class="signatures">
                <div class="sig-col">
                    <div class="sig-line">
                        {{ $programChairName }}<br>
                        <span style="font-weight: 400; font-size: 12px; color: #64748b;">Program Chairperson / Admin</span>
                    </div>
                </div>
                <div class="sig-col">
                    <div class="sig-line">
                        {{ $pullOut->supervisor?->name ?? 'OJT Coordinator' }}<br>
                        <span style="font-weight: 400; font-size: 12px; color: #64748b;">OJT &amp; Career Placement Coordinator</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer">
            Carlos Hilado Memorial State University (CHMSU) &bull; Integrated OJT &amp; Placement Platform<br>
            This is an official administrative transmission. Please retain for accreditation records.
        </div>
    </div>
</body>
</html>
