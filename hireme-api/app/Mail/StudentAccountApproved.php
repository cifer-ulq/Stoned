<?php

namespace App\Mail;

use App\Services\StudentIdHelper;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StudentAccountApproved extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $studentName,
        public string $email,
        public string $studentId,
        public string $program,
        public string $loginUrl = '',
    ) {
        if (empty($this->loginUrl)) {
            $this->loginUrl = StudentIdHelper::resolveLoginAppUrl();
        }
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Account Approved — Welcome to CHMSU HireMe OJT Portal',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.student-approved',
        );
    }
}
