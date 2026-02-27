<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Sent to the client immediately after they submit a booking request.
 * Lets them know the studio received their inquiry and gives them a reference
 * for follow-up. This is the first touchpoint after a potential client reaches out.
 */
class BookingConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Booking $booking,
        public string $clientName,
        public string $clientEmail,
    ) {}

    public function envelope(): Envelope
    {
        $studioName = $this->booking->studio->name ?? 'Our Studio';

        return new Envelope(
            subject: "Booking Confirmation - {$studioName}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.booking-confirmation',
        );
    }
}
