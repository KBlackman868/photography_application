<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Booking $booking,
        public string $clientName,
        public string $clientEmail,
        public string $clientPhone,
        public string $sessionType,
        public ?string $message,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "New Booking Request from {$this->clientName}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.booking-notification',
        );
    }
}
