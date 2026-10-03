<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CompanyInvitation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $companyName,
        public string $contactPerson,
        public string $email,
        public string $industry,
        public string $location,
        public string $phone,
        public ?string $moaStartDate,
        public ?string $moaEndDate,
        public string $moaStatus,
        public string $status,
        public string $setPasswordUrl,
        public string $registeredBy = 'CHMSU CIER Admin',
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Welcome to CHMSU HireMe — Complete Company Registration for {$this->companyName}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.company-invitation',
        );
    }
}
