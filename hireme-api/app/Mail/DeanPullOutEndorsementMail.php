<?php

namespace App\Mail;

use App\Models\OjtPullOutRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DeanPullOutEndorsementMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public OjtPullOutRequest $pullOut,
        public string $deanName,
        public string $deanEmail,
        public string $programChairName,
        public string $letterBodyText,
        public ?string $remarks = null,
    ) {}

    public function envelope(): Envelope
    {
        $studentName = $this->pullOut->student?->name ?? 'Student';
        return new Envelope(
            subject: "OFFICIAL MEMORANDUM: Endorsement for OJT Pull-Out — {$studentName}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.dean-pull-out-endorsement',
        );
    }
}
