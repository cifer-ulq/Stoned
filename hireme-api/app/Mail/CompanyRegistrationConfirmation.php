<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CompanyRegistrationConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $companyName,
        public string $contactPerson,
        public string $email,
        public string $industry,
        public string $location,
        public string $phone,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'CHMSU HireMe — Company Registration Received',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.company-registration-confirmation',
        );
    }
}
