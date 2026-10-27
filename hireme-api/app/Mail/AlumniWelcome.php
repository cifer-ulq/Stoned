<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AlumniWelcome extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $alumniName,
        public string $email,
        public string $studentId,
        public string $program,
        public string $campus,
        public string $batch,
        public string $temporaryPassword = '',
        public string $loginUrl = '',
    ) {
        if (empty($this->temporaryPassword)) {
            $rawId = trim((string) $this->studentId);
            $this->temporaryPassword = 'CHMSU@' . preg_replace('/\s+/', '', $rawId);
            if (strlen($this->temporaryPassword) < 8) {
                $this->temporaryPassword = 'CHMSU@' . str_pad($rawId, 6, '0', STR_PAD_LEFT);
            }
        }

        if (empty($this->loginUrl)) {
            $this->loginUrl = config('app.login_app_url', env('LOGIN_APP_URL', 'https://stoned-two.vercel.app/login/'));
        }
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to CHMSU HireMe — Your Alumni & Career Network Account is Ready',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.alumni-welcome',
        );
    }
}
