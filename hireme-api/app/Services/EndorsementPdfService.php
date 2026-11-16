<?php

namespace App\Services;

use App\Models\CompanyProfile;
use App\Models\StudentOjtInterest;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EndorsementPdfService
{
    /**
     * Map student program to appropriate College and Department.
     */
    public static function resolveCollegeAndDepartment(?string $program): array
    {
        $prog = strtolower($program ?? '');

        if (
            str_contains($prog, 'information technology') ||
            str_contains($prog, 'computer science') ||
            str_contains($prog, 'information systems') ||
            str_contains($prog, 'bsit') ||
            str_contains($prog, 'bscs') ||
            str_contains($prog, 'bsis')
        ) {
            $dept = 'Department of Information Technology';
            if (str_contains($prog, 'information systems') || str_contains($prog, 'bsis')) {
                $dept = 'Department of Information Systems';
            } elseif (str_contains($prog, 'computer science') || str_contains($prog, 'bscs')) {
                $dept = 'Department of Computer Science';
            }

            return [
                'college'    => 'College of Computer Studies',
                'department' => $dept,
            ];
        }

        if (str_contains($prog, 'engineering') || str_contains($prog, 'cpe') || str_contains($prog, 'ece')) {
            $dept = 'Department of Computer Engineering';
            if (str_contains($prog, 'electronics')) {
                $dept = 'Department of Electronics Engineering';
            }

            return [
                'college'    => 'College of Engineering',
                'department' => $dept,
            ];
        }

        if (
            str_contains($prog, 'industrial technology') ||
            str_contains($prog, 'automotive') ||
            str_contains($prog, 'drafting') ||
            str_contains($prog, 'mechanical') ||
            str_contains($prog, 'food trades')
        ) {
            return [
                'college'    => 'College of Industrial Technology',
                'department' => 'Department of Industrial Technology',
            ];
        }

        if (str_contains($prog, 'business') || str_contains($prog, 'accountancy') || str_contains($prog, 'hospitality') || str_contains($prog, 'management')) {
            return [
                'college'    => 'College of Business Management and Accountancy',
                'department' => 'Department of Business Administration',
            ];
        }

        if (str_contains($prog, 'teacher education') || str_contains($prog, 'btvted') || str_contains($prog, 'education')) {
            return [
                'college'    => 'College of Education',
                'department' => 'Department of Technical-Vocational Education',
            ];
        }

        return [
            'college'    => 'College of Computer Studies',
            'department' => 'Department of Information Technology',
        ];
    }

    /**
     * Escape strings for PDF text streams.
     */
    public static function escape(string $str): string
    {
        $str = str_replace(
            ['’', '‘', '“', '”', '—', '–', '•'],
            ["'", "'", '"', '"', '-', '-', '*'],
            $str
        );

        if (function_exists('iconv')) {
            $converted = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $str);
            if ($converted !== false) {
                $str = $converted;
            }
        }

        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $str);
    }

    /**
     * Word wrap text into lines with a maximum character width.
     */
    public static function wrap(string $text, int $maxChars = 86): array
    {
        $words = preg_split('/\s+/', trim($text));
        $lines = [];
        $current = '';

        foreach ($words as $w) {
            if ($w === '') continue;
            if (strlen($current . ($current === '' ? '' : ' ') . $w) <= $maxChars) {
                $current .= ($current === '' ? '' : ' ') . $w;
            } else {
                if ($current !== '') $lines[] = $current;
                $current = $w;
            }
        }
        if ($current !== '') $lines[] = $current;
        return $lines;
    }

    /**
     * Generate standard PDF-1.4 binary content with official CHMSU layout.
     */
    public static function generatePdf(array $data): string
    {
        $studentName     = self::escape($data['student_name'] ?? 'Student');
        $studentId       = self::escape($data['student_id'] ?? 'CHMSU-STU-001');
        $program         = self::escape($data['program'] ?? 'Bachelor of Science in Information Technology');
        $yearLevel       = self::escape($data['year_level'] ?? '4th Year');
        $section         = self::escape($data['section'] ?? 'A');
        $companyName     = self::escape($data['company_name'] ?? 'Host Partner Company');
        $companyAddress  = self::escape($data['company_address'] ?? 'Negros Occidental, Philippines');
        $contactPerson   = self::escape($data['contact_person'] ?? 'The Internship Director / Human Resources Management');
        $contactTitle    = self::escape($data['contact_title'] ?? '');
        $positionTitle   = self::escape($data['position_title'] ?? 'OJT Industry Trainee');
        $durationHours   = self::escape($data['duration_hours'] ?? '600 Hours');
        $coordinatorName = self::escape($data['coordinator_name'] ?? 'Prof. Mariene Labrador');
        $coordinatorTitle= self::escape($data['coordinator_title'] ?? 'OJT Academic Coordinator');
        $coordinatorEmail= self::escape($data['coordinator_email'] ?? 'ojt.coordinator@chmsu.edu.ph');
        $college         = self::escape($data['college'] ?? 'College of Industrial Technology');
        $department      = self::escape($data['department'] ?? 'Department of Information Technology');
        $coordinatorNote = trim((string)($data['coordinator_note'] ?? ''));
        $customBody      = trim((string)($data['custom_body'] ?? ''));
        $dateStr         = self::escape($data['date'] ?? date('F d, Y'));
        $refNo           = self::escape($data['ref_no'] ?? ('CHMSU-CIER-OJT-' . date('Y') . '-' . str_pad((string)($data['interest_id'] ?? 1), 4, '0', STR_PAD_LEFT)));

        $stream = [];

        // Top Green Accent Bar
        $stream[] = 'q';
        $stream[] = '0.00 0.35 0.19 rg'; // CHMSU Forest Green
        $stream[] = '50 754 512 4 re f';
        $stream[] = '0.85 0.65 0.13 rg'; // Gold Accent Line
        $stream[] = '50 751 512 1.5 re f';
        $stream[] = 'Q';

        // Header Text
        $stream[] = 'BT';
        $stream[] = '/F1 13 Tf'; // Bold
        $stream[] = '0.00 0.35 0.19 rg';
        $stream[] = '50 732 Td (' . self::escape('CARLOS HILADO MEMORIAL STATE UNIVERSITY') . ') Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F2 9 Tf'; // Regular
        $stream[] = '0.25 0.28 0.32 rg';
        $stream[] = '50 720 Td (' . self::escape('Center for Internationalization and External Relations (CIER)') . ') Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F1 9 Tf'; // Bold
        $stream[] = '0.15 0.20 0.25 rg';
        $stream[] = '50 708 Td (' . $college . ' - ' . $department . ') Tj';
        $stream[] = 'ET';

        $stream[] = 'BT';
        $stream[] = '/F2 8 Tf';
        $stream[] = '0.45 0.50 0.55 rg';
        $stream[] = '50 696 Td (' . self::escape('Mabini Street, Talisay City, Negros Occidental 6115, Philippines • www.chmsu.edu.ph') . ') Tj';
        $stream[] = 'ET';

        // Header Divider
        $stream[] = 'q';
        $stream[] = '0.80 0.85 0.88 RG 1 w 50 686 m 562 686 l S';
        $stream[] = 'Q';

        // Document Title
        $stream[] = 'BT';
        $stream[] = '/F1 11 Tf';
        $stream[] = '0.00 0.35 0.19 rg';
        $stream[] = '50 668 Td (' . self::escape('OFFICIAL ENDORSEMENT MEMORANDUM FOR ON-THE-JOB TRAINING') . ') Tj';
        $stream[] = 'ET';

        // Metadata Strip (Date & Ref)
        $stream[] = 'BT';
        $stream[] = '/F2 8.5 Tf';
        $stream[] = '0.30 0.35 0.40 rg';
        $stream[] = '50 652 Td (Date: ' . $dateStr . '   |   Reference Code: ' . $refNo . ') Tj';
        $stream[] = 'ET';

        // Addressee Block
        $y = 632;
        $stream[] = 'BT';
        $stream[] = '/F1 9.5 Tf';
        $stream[] = '0.10 0.15 0.20 rg';
        $stream[] = '50 ' . $y . ' Td (TO: ' . strtoupper($contactPerson . ($contactTitle ? ' (' . $contactTitle . ')' : '')) . ') Tj';
        $y -= 13;
        $stream[] = '0 -13 Td (' . strtoupper($companyName) . ') Tj';
        if ($companyAddress) {
            $stream[] = '/F2 8.5 Tf';
            $stream[] = '0.30 0.35 0.40 rg';
            $stream[] = '0 -12 Td (' . $companyAddress . ') Tj';
            $y -= 12;
        }
        $stream[] = 'ET';

        // Salutation
        $y -= 18;
        $stream[] = 'BT';
        $stream[] = '/F2 9.5 Tf';
        $stream[] = '0.10 0.15 0.20 rg';
        $stream[] = '50 ' . $y . ' Td (Dear Industry Partner,) Tj';
        $stream[] = 'ET';

        // Intro paragraph
        $y -= 14;
        $introText = $customBody !== ''
            ? $customBody
            : "Carlos Hilado Memorial State University, through the {$college} and CIER, is pleased to officially endorse our qualified bona fide student for deployment in your organization:";
        
        $introLines = self::wrap($introText, 88);
        $stream[] = 'BT';
        $stream[] = '/F2 9 Tf';
        $stream[] = '0.20 0.25 0.30 rg';
        $stream[] = '50 ' . $y . ' Td';
        foreach ($introLines as $idx => $line) {
            if ($idx > 0) $stream[] = '0 -12 Td';
            $stream[] = '(' . self::escape($line) . ') Tj';
            if ($idx > 0) $y -= 12;
        }
        $stream[] = 'ET';

        // Student Highlight Card Box
        $y -= 18;
        $boxHeight = 44;
        $stream[] = 'q';
        $stream[] = '0.96 0.98 0.96 rg'; // pale green fill
        $stream[] = '50 ' . ($y - $boxHeight) . ' 512 ' . $boxHeight . ' re f';
        $stream[] = '0.00 0.35 0.19 RG 1 w'; // green left accent border
        $stream[] = '50 ' . ($y - $boxHeight) . ' 4 ' . $boxHeight . ' re f';
        $stream[] = '0.85 0.90 0.86 RG 0.5 w';
        $stream[] = '54 ' . ($y - $boxHeight) . ' 508 ' . $boxHeight . ' re S';
        $stream[] = 'Q';

        // Inside Student Box Text
        $stream[] = 'BT';
        $stream[] = '/F1 10 Tf';
        $stream[] = '0.00 0.35 0.19 rg';
        $stream[] = '64 ' . ($y - 14) . ' Td (STUDENT TRAINEE: ' . strtoupper($studentName) . ') Tj';
        $stream[] = '/F2 8.5 Tf';
        $stream[] = '0.25 0.30 0.35 rg';
        $stream[] = '0 -13 Td (Student ID: ' . $studentId . '   |   Degree: ' . $program . ') Tj';
        $stream[] = '0 -12 Td (Academic Standing: ' . $yearLevel . ' - Section ' . $section . '   |   Batch: 2026-2027) Tj';
        $stream[] = 'ET';
        $y -= $boxHeight;

        // Paragraph 2: Clearance & Hours
        $y -= 14;
        $p2 = "The student has successfully cleared all pre-deployment prerequisites and university academic requirements. The student is officially cleared and authorized to render a required minimum of {$durationHours} of On-the-Job Training / Industry Internship for the position of \"{$positionTitle}\".";
        $p2Lines = self::wrap($p2, 88);
        $stream[] = 'BT';
        $stream[] = '/F2 9 Tf';
        $stream[] = '0.20 0.25 0.30 rg';
        $stream[] = '50 ' . $y . ' Td';
        foreach ($p2Lines as $idx => $line) {
            if ($idx > 0) $stream[] = '0 -12 Td';
            $stream[] = '(' . self::escape($line) . ') Tj';
            if ($idx > 0) $y -= 12;
        }
        $stream[] = 'ET';

        // Paragraph 3: MOA & Standards
        $y -= 15;
        $p3 = "This endorsement is executed under the active Memorandum of Agreement (MOA) between CHMSU and your esteemed organization. The student is instructed to uphold strict workplace professionalism, data privacy standards, and company operating policies.";
        $p3Lines = self::wrap($p3, 88);
        $stream[] = 'BT';
        $stream[] = '/F2 9 Tf';
        $stream[] = '0.20 0.25 0.30 rg';
        $stream[] = '50 ' . $y . ' Td';
        foreach ($p3Lines as $idx => $line) {
            if ($idx > 0) $stream[] = '0 -12 Td';
            $stream[] = '(' . self::escape($line) . ') Tj';
            if ($idx > 0) $y -= 12;
        }
        $stream[] = 'ET';

        // Optional Coordinator Notes Box
        if ($coordinatorNote !== '') {
            $y -= 15;
            $noteLines = self::wrap("COORDINATOR SPECIAL NOTE: " . $coordinatorNote, 84);
            $noteHeight = count($noteLines) * 12 + 10;
            $stream[] = 'q';
            $stream[] = '0.98 0.98 0.98 rg';
            $stream[] = '50 ' . ($y - $noteHeight) . ' 512 ' . $noteHeight . ' re f';
            $stream[] = '0.85 0.65 0.13 RG 1.5 w';
            $stream[] = '50 ' . ($y - $noteHeight) . ' 3 ' . $noteHeight . ' re f';
            $stream[] = '0.88 0.88 0.88 RG 0.5 w';
            $stream[] = '53 ' . ($y - $noteHeight) . ' 509 ' . $noteHeight . ' re S';
            $stream[] = 'Q';

            $stream[] = 'BT';
            $stream[] = '/F2 8.5 Tf';
            $stream[] = '0.35 0.30 0.15 rg';
            $stream[] = '62 ' . ($y - 12) . ' Td';
            foreach ($noteLines as $idx => $line) {
                if ($idx > 0) $stream[] = '0 -12 Td';
                $stream[] = '(' . self::escape($line) . ') Tj';
            }
            $stream[] = 'ET';
            $y -= $noteHeight;
        }

        // Paragraph 4: Appreciation
        $y -= 14;
        $stream[] = 'BT';
        $stream[] = '/F2 9 Tf';
        $stream[] = '0.20 0.25 0.30 rg';
        $stream[] = '50 ' . $y . ' Td (' . self::escape('Thank you very much for your continuous dedication to mentoring our university trainees.') . ') Tj';
        $stream[] = 'ET';

        // Sign-off Block
        $y -= 26;
        $stream[] = 'BT';
        $stream[] = '/F1 8.5 Tf';
        $stream[] = '0.40 0.45 0.50 rg';
        $stream[] = '50 ' . $y . ' Td (' . self::escape('ENDORSED AND CERTIFIED BY:') . ') Tj';
        $stream[] = 'ET';

        $y -= 17;
        $stream[] = 'BT';
        $stream[] = '/F1 10.5 Tf';
        $stream[] = '0.00 0.35 0.19 rg';
        $stream[] = '50 ' . $y . ' Td (' . strtoupper($coordinatorName) . ') Tj';
        $stream[] = '/F2 8.5 Tf';
        $stream[] = '0.25 0.30 0.35 rg';
        $stream[] = '0 -12 Td (' . $coordinatorTitle . ' - ' . $department . ') Tj';
        $stream[] = '0 -11 Td (' . $college . ', CHMSU) Tj';
        $stream[] = '0 -11 Td (Email: ' . $coordinatorEmail . ') Tj';
        $stream[] = 'ET';

        // Digital Seal Badge (Right side of signature)
        $stream[] = 'q';
        $stream[] = '0.94 0.98 0.95 rg';
        $stream[] = '360 ' . ($y - 18) . ' 202 50 re f';
        $stream[] = '0.00 0.35 0.19 RG 1 w';
        $stream[] = '360 ' . ($y - 18) . ' 202 50 re S';
        $stream[] = 'Q';

        $stream[] = 'BT';
        $stream[] = '/F1 8 Tf';
        $stream[] = '0.00 0.35 0.19 rg';
        $stream[] = '372 ' . ($y + 20) . ' Td (' . self::escape('CHMSU CIER DIGITAL ENDORSEMENT') . ') Tj';
        $stream[] = '/F2 7.5 Tf';
        $stream[] = '0.25 0.35 0.30 rg';
        $stream[] = '0 -10 Td (Status: VERIFIED & OFFICIALLY SIGNED) Tj';
        $stream[] = '0 -10 Td (Security Code: ' . strtoupper(substr(md5($refNo . $studentId), 0, 16)) . ') Tj';
        $stream[] = '0 -10 Td (Issued: ' . $dateStr . ') Tj';
        $stream[] = 'ET';

        // Footer Divider & Disclaimer
        $stream[] = 'q';
        $stream[] = '0.85 0.88 0.90 RG 0.5 w 50 48 m 562 48 l S';
        $stream[] = 'Q';

        $stream[] = 'BT';
        $stream[] = '/F2 7 Tf';
        $stream[] = '0.50 0.55 0.60 rg';
        $stream[] = '50 38 Td (' . self::escape('OFFICIAL UNIVERSITY DOCUMENT • GENERATED DIGITALLY VIA CHMSU HIREME PLATFORM • ALL RIGHTS RESERVED') . ') Tj';
        $stream[] = 'ET';

        $streamText = implode("\n", $stream);
        $streamLen  = strlen($streamText);

        $objects = [];
        $objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
        $objects[2] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
        $objects[3] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>";
        $objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";
        $objects[5] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
        $objects[6] = "<< /Length " . $streamLen . " >>\nstream\n" . $streamText . "\nendstream";

        $pdf = "%PDF-1.4\n";
        $offsets = [0];

        for ($i = 1; $i <= 6; $i++) {
            $offsets[$i] = strlen($pdf);
            $pdf .= $i . " 0 obj\n" . $objects[$i] . "\nendobj\n";
        }

        $xrefOffset = strlen($pdf);
        $pdf .= "xref\n0 7\n";
        $pdf .= "0000000000 65535 f \n";
        for ($i = 1; $i <= 6; $i++) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$i]);
        }
        $pdf .= "trailer\n<< /Size 7 /Root 1 0 R >>\n";
        $pdf .= "startxref\n" . $xrefOffset . "\n%%EOF\n";

        return $pdf;
    }

    /**
     * Synthesize and store the official endorsement letter for a StudentOjtInterest record.
     */
    public static function generateAndStore(StudentOjtInterest $interest, User $supervisor, array $options = []): string
    {
        $interest->loadMissing([
            'student',
            'student.studentProfile',
            'posting',
        ]);

        $student = $interest->student;
        $sp      = $student?->studentProfile;
        $posting = $interest->posting;

        $companyProfile = null;
        if ($posting?->company_user_id) {
            $companyProfile = CompanyProfile::where('user_id', $posting->company_user_id)->first();
        }

        // Determine college & department dynamically based on student's program or supervisor's course
        $program = $sp?->program ?? $supervisor->supervisorProfile?->getAssignedCourse() ?? 'Bachelor of Science in Information Technology';
        $deptInfo = self::resolveCollegeAndDepartment($program);

        $studentName = $student?->name ?? 'Student Trainee';
        $studentId   = $sp?->student_id ?? ('CHMSU-' . $student?->id);
        $section     = $sp?->section ?? 'A';
        $yearLevel   = $sp?->year_level ?? '4th Year';

        $companyName    = $posting?->company_name ?? $companyProfile?->company_name ?? 'Host Partner Company';
        $companyAddress = $companyProfile?->full_address ?? $posting?->location ?? 'Negros Occidental, Philippines';
        $contactPerson  = $options['contact_person'] ?? $companyProfile?->contact_person ?? $posting?->contact_name ?? 'The Internship Director / Human Resources';
        $contactTitle   = $companyProfile?->contact_title ?? 'Internship Supervisor';

        $positionTitle  = $posting?->title ?? 'OJT Industry Trainee';
        $durationHours  = $posting?->duration ?? '600 Hours';

        $coordinatorName  = $supervisor->name;
        $coordinatorTitle = $supervisor->supervisorProfile?->position ?? 'OJT Academic Coordinator';
        $coordinatorEmail = $supervisor->email;

        $coordinatorNote = $options['coordinator_note'] ?? $interest->coordinator_note ?? '';
        $customBody      = $options['custom_body'] ?? '';

        $pdfBinary = self::generatePdf([
            'student_name'      => $studentName,
            'student_id'        => $studentId,
            'program'           => $program,
            'year_level'        => $yearLevel,
            'section'           => $section,
            'company_name'      => $companyName,
            'company_address'   => $companyAddress,
            'contact_person'    => $contactPerson,
            'contact_title'     => $contactTitle,
            'position_title'    => $positionTitle,
            'duration_hours'    => $durationHours,
            'coordinator_name'  => $coordinatorName,
            'coordinator_title' => $coordinatorTitle,
            'coordinator_email' => $coordinatorEmail,
            'college'           => $deptInfo['college'],
            'department'        => $deptInfo['department'],
            'coordinator_note'  => $coordinatorNote,
            'custom_body'       => $customBody,
            'interest_id'       => $interest->id,
            'date'              => date('F d, Y'),
        ]);

        $safeStudentSlug = Str::slug($studentName, '_');
        $filename = "endorsement_{$safeStudentSlug}_{$interest->id}.pdf";
        $relativePath = "endorsement-letters/{$filename}";

        Storage::disk('public')->put($relativePath, $pdfBinary);

        return $relativePath;
    }
}
