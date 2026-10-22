<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StudentWelcome extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $studentName,
        public string $email,
        public string $studentId,
        public string $program,
        public string $campus,
        public string $temporaryPassword = '',
        public string $loginUrl = '',
    ) {
        if (empty($this->temporaryPassword)) {
            $this->temporaryPassword = $this->studentId;
        }

        if (empty($this->loginUrl)) {
            $this->loginUrl = config('app.login_app_url', env('LOGIN_APP_URL', 'https://stoned-two.vercel.app/login/'));
        }
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to CHMSU HireMe — Your Student Account is Ready',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.student-welcome',
        );
    }
}
