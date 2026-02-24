<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingStatusUpdate extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Booking $booking,
        public string $clientName,
        public string $oldStatus,
        public string $newStatus,
    ) {}

    public function envelope(): Envelope
    {
        $studioName = $this->booking->studio->name ?? 'Photography Studio';

        return new Envelope(
            subject: "Booking Update - {$studioName}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.booking-status-update',
        );
    }
}
