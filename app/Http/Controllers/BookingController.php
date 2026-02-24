<?php

namespace App\Http\Controllers;

use App\Mail\BookingConfirmation;
use App\Mail\BookingNotification;
use App\Models\Booking;
use App\Models\Package;
use App\Models\Studio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class BookingController extends Controller
{
    /**
     * Public booking form
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
     * Store a new booking request (public)
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

        // Send confirmation email to client
        try {
            Mail::to($validated['email'])->send(new BookingConfirmation(
                booking: $booking,
                clientName: $validated['name'],
                clientEmail: $validated['email'],
            ));
        } catch (\Exception $e) {
            // Don't fail the booking if email fails
            report($e);
        }

        // Send notification email to studio owner
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
     * Admin: list all bookings
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
     * Admin: calendar view
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
     * API: get booked dates for availability checking
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
     * Admin: update booking status
     */
    public function update(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'status' => 'required|in:inquiry,quoted,confirmed,deposit_paid,completed,cancelled',
        ]);

        $booking->update($validated);

        return back()->with('success', 'Booking status updated.');
    }

    private function extractName(?string $notes): string
    {
        if (!$notes) return '';
        if (preg_match('/Name:\s*(.+)/i', $notes, $matches)) {
            return trim($matches[1]);
        }
        return '';
    }
}
