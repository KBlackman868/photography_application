<?php

namespace App\Http\Controllers;

use App\Mail\BookingConfirmation;
use App\Mail\BookingNotification;
use App\Mail\BookingResponse;
use App\Mail\BookingStatusUpdate;
use App\Models\Booking;
use App\Models\Package;
use App\Models\Studio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

/**
 * Booking Controller
 *
 * Manages the complete booking lifecycle for the photography studio, from the
 * moment a potential client fills out the public inquiry form through to session
 * completion. This is the lead generation and scheduling backbone of the business.
 *
 * The booking flow:
 *   1. Client submits public form -> booking created as "inquiry"
 *   2. Both client and studio receive email notifications
 *   3. Admin manages bookings via list view or calendar
 *   4. Status advances: inquiry -> quoted -> confirmed -> deposit_paid -> completed
 *   5. Admin can reply directly to clients via email from the booking page
 *   6. Clients can check their booking status using a reference number
 */
class BookingController extends Controller
{
    /**
     * Show the public booking request form.
     * This is the page potential clients land on when they want to book a session.
     * It loads the studio's active packages so clients can optionally select one,
     * and passes availability hours so the frontend can suggest open time slots.
     */
    public function create()
    {
        $studio = Studio::first();
        $packages = Package::where('studio_id', $studio->id)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Bookings/Create', [
            'packages' => $packages,
            'studioName' => $studio->name,
            'availabilityHours' => $studio->availability_hours,
        ]);
    }

    /**
     * Process a new booking request from the public form.
     * Creates the booking as an "inquiry" (the first stage in the pipeline) and
     * sends two emails: a confirmation to the client so they know their request
     * was received, and a notification to the studio owner so the lead is not missed.
     * Client details are stored in the notes field as a structured text block
     * since public submissions don't require an account.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:30',
            'session_type' => 'required|string|max:100',
            'preferred_date' => 'required|date|after:today',
            'preferred_time' => 'required|string|max:20',
            'location' => 'nullable|string|max:500',
            'message' => 'nullable|string|max:2000',
            'package_id' => 'nullable|exists:packages,id',
        ]);

        $studio = Studio::first();

        // Store client contact info in the notes field since public bookings
        // don't require the client to have an account
        $booking = Booking::create([
            'studio_id' => $studio->id,
            'status' => 'inquiry',
            'session_date' => $validated['preferred_date'] . ' ' . $validated['preferred_time'] . ':00',
            'location' => $validated['location'] ?? 'TBD',
            'notes' => "Name: {$validated['name']}\nEmail: {$validated['email']}\nPhone: {$validated['phone']}\nSession Type: {$validated['session_type']}\nMessage: " . ($validated['message'] ?? 'N/A'),
            'package_id' => $validated['package_id'] ?? null,
            'total_amount' => 0,
            'deposit_amount' => 0,
        ]);

        // Load relationships for email
        $booking->load(['studio', 'package']);

        // Send confirmation email to the client so they know their
        // inquiry was received and the studio will be in touch
        try {
            Mail::to($validated['email'])->send(new BookingConfirmation(
                booking: $booking,
                clientName: $validated['name'],
                clientEmail: $validated['email'],
            ));
        } catch (\Exception $e) {
            report($e);
        }

        // Notify the studio owner about the new lead so they can
        // follow up quickly -- fast response times win more bookings
        if ($studio->email) {
            try {
                Mail::to($studio->email)->send(new BookingNotification(
                    booking: $booking,
                    clientName: $validated['name'],
                    clientEmail: $validated['email'],
                    clientPhone: $validated['phone'],
                    sessionType: $validated['session_type'],
                    message: $validated['message'] ?? null,
                ));
            } catch (\Exception $e) {
                report($e);
            }
        }

        return redirect()->back()->with('success', 'Your booking request has been submitted! We\'ll be in touch within 24 hours.');
    }

    /**
     * Admin: list all bookings for the studio.
     * Shows every booking with client details and package info, sorted by
     * session date so the photographer can see their upcoming schedule.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $studioId = $user->studio_id;

        $bookings = Booking::where('studio_id', $studioId)
            ->with(['client', 'package'])
            ->latest('session_date')
            ->get();

        return Inertia::render('Bookings/Index', [
            'bookings' => $bookings,
        ]);
    }

    /**
     * Admin: visual calendar view of all bookings.
     * Displays sessions on a calendar so the photographer can see their
     * schedule at a glance and spot conflicts or busy periods. Cancelled
     * bookings are excluded to keep the calendar clean.
     */
    public function calendar(Request $request)
    {
        $user = $request->user();
        $studioId = $user->studio_id;

        $bookings = Booking::where('studio_id', $studioId)
            ->whereNotIn('status', ['cancelled'])
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    // Extract the client name from notes to display on the calendar
                    'title' => $this->extractName($booking->notes) ?: 'Booking #' . $booking->id,
                    'session_date' => $booking->session_date?->toISOString(),
                    'status' => $booking->status,
                    'location' => $booking->location,
                    'notes' => $booking->notes,
                ];
            });

        return Inertia::render('Bookings/Calendar', [
            'bookings' => $bookings,
        ]);
    }

    /**
     * Public API: returns booked dates for the availability checker.
     * The public booking form uses this to show which dates/times are already
     * taken, helping clients pick an available slot without back-and-forth.
     */
    public function availability(Request $request)
    {
        $studio = Studio::first();

        $bookings = Booking::where('studio_id', $studio->id)
            ->whereNotIn('status', ['cancelled'])
            ->where('session_date', '>=', now())
            ->get(['session_date', 'status'])
            ->map(fn ($b) => [
                'date' => $b->session_date?->format('Y-m-d'),
                'time' => $b->session_date?->format('H:i'),
                'status' => $b->status,
            ]);

        return response()->json([
            'bookings' => $bookings,
            'availability_hours' => $studio->availability_hours,
        ]);
    }

    /**
     * Admin: update a booking's status.
     * Advances the booking through the pipeline (inquiry -> quoted -> confirmed
     * -> deposit_paid -> completed, or cancelled at any stage). Automatically
     * sends a status update email to the client so they stay informed without
     * the photographer having to manually notify them.
     */
    public function update(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'status' => 'required|in:inquiry,quoted,confirmed,deposit_paid,completed,cancelled',
        ]);

        $oldStatus = $booking->status;
        $newStatus = $validated['status'];

        $booking->update($validated);

        // Only send an email if the status actually changed -- avoids
        // duplicate notifications if the form is submitted twice
        if ($oldStatus !== $newStatus) {
            $clientEmail = $this->extractField($booking->notes, 'Email');
            $clientName = $this->extractField($booking->notes, 'Name');

            if ($clientEmail) {
                $booking->load('studio');
                try {
                    Mail::to($clientEmail)->send(new BookingStatusUpdate(
                        booking: $booking,
                        clientName: $clientName ?: 'Valued Client',
                        oldStatus: $oldStatus,
                        newStatus: $newStatus,
                    ));
                } catch (\Exception $e) {
                    report($e);
                }
            }
        }

        return back()->with('success', 'Booking status updated.');
    }

    /**
     * Admin: send a personal reply/message to the client about their booking.
     * This lets the photographer respond to inquiries, send quotes, or answer
     * questions directly from the booking management page. The reply-to header
     * is set to the photographer's email so the client can respond naturally.
     */
    public function reply(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        // Extract the client's email from the booking notes
        $clientEmail = $this->extractField($booking->notes, 'Email');
        $clientName = $this->extractField($booking->notes, 'Name');

        if (!$clientEmail) {
            return back()->with('error', 'No client email found for this booking.');
        }

        $booking->load('studio');

        try {
            Mail::to($clientEmail)
                ->replyTo($request->user()->email, $request->user()->name)
                ->send(new BookingResponse(
                    booking: $booking,
                    clientName: $clientName ?: 'Valued Client',
                    responseMessage: $validated['message'],
                    senderName: $request->user()->name,
                ));
        } catch (\Exception $e) {
            report($e);
            return back()->with('error', 'Failed to send email. Please try again.');
        }

        return back()->with('success', 'Response sent to ' . $clientEmail);
    }

    /**
     * Public: show the booking status lookup page.
     * Clients who submitted a booking can check on its status without
     * needing to create an account or log in.
     */
    public function statusLookup()
    {
        return Inertia::render('Bookings/StatusLookup');
    }

    /**
     * Public: verify a booking's status using reference number and email.
     * This provides a simple, secure way for clients to track their booking.
     * The email check ensures only the original requester can view the status,
     * preventing unauthorized lookups by guessing reference numbers.
     */
    public function statusCheck(Request $request)
    {
        $validated = $request->validate([
            'reference_number' => 'required|string|max:20',
            'email' => 'required|email|max:255',
        ]);

        $booking = Booking::where('reference_number', $validated['reference_number'])->first();

        if (! $booking) {
            return back()->with('error', 'No booking found with that reference number.');
        }

        // Verify email matches to prevent unauthorized status lookups
        $bookingEmail = $this->extractField($booking->notes, 'Email');
        if (strtolower($bookingEmail) !== strtolower($validated['email'])) {
            return back()->with('error', 'The email address does not match our records for this booking.');
        }

        // Human-friendly status labels for the client-facing display
        $statusLabels = [
            'inquiry' => 'Inquiry Received',
            'quoted' => 'Quote Sent',
            'confirmed' => 'Confirmed',
            'deposit_paid' => 'Deposit Paid',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
        ];

        return back()->with('booking', [
            'reference_number' => $booking->reference_number,
            'status' => $booking->status,
            'status_label' => $statusLabels[$booking->status] ?? ucfirst($booking->status),
            'session_date' => $booking->session_date?->format('l, F j, Y'),
            'session_time' => $booking->session_date?->format('g:i A'),
            'location' => $booking->location,
            'package_name' => $booking->package?->name,
            'created_at' => $booking->created_at->format('F j, Y'),
        ]);
    }

    /**
     * Helper: extract the client name from the structured notes field.
     */
    private function extractName(?string $notes): string
    {
        return $this->extractField($notes, 'Name');
    }

    /**
     * Helper: parse a specific field value from the "Key: Value" format
     * stored in the booking notes. Used to retrieve client contact info
     * for sending emails since public bookings don't have a linked user account.
     */
    private function extractField(?string $notes, string $field): string
    {
        if (!$notes) return '';
        if (preg_match("/{$field}:\s*(.+)/i", $notes, $matches)) {
            return trim($matches[1]);
        }
        return '';
    }
}
