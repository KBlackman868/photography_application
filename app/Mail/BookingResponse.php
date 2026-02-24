<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingResponse extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Booking $booking,
        public string $clientName,
        public string $responseMessage,
        public string $senderName,
    ) {}

    public function envelope(): Envelope
    {
        $studioName = $this->booking->studio->name ?? 'Photography Studio';

        return new Envelope(
            subject: "Message from {$studioName} - Booking KB-" . str_pad($this->booking->id, 5, '0', STR_PAD_LEFT),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.booking-response',
        );
    }
}
