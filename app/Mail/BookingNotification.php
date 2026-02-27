<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Sent to the studio/photographer when a new booking request comes in from the website.
 * Includes the client's contact info, desired session type, and any message they wrote,
 * so the photographer can respond quickly and not miss a lead.
 */
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
