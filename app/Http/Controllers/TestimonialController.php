<?php

namespace App\Http\Controllers;

use App\Models\Testimonial;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Testimonial Controller
 *
 * Manages client testimonials -- the social proof that helps convert website
 * visitors into paying clients. Happy client quotes with star ratings are
 * one of the most effective marketing tools for a photography business.
 * Featured testimonials get priority placement on the landing page.
 */
class TestimonialController extends Controller
{
    /**
     * List all testimonials for the studio.
     * Ordered by sort position first, then by newest, so the photographer
     * can control which testimonials appear first while newer ones
     * naturally bubble up within each sort group.
     */
    public function index(Request $request)
    {
        $studio = $request->user()->studio;

        $testimonials = $studio->testimonials()
            ->with('media')
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Testimonial $t) => [
                ...$t->toArray(),
                'photo_url' => $t->photo_url,
            ]);

        return Inertia::render('Testimonials/Index', [
            'testimonials' => $testimonials,
        ]);
    }

    /**
     * Add a new testimonial.
     * The photographer typically adds these after receiving positive feedback
     * from a client. Key fields: the client's name and optional role (e.g.,
     * "Bride", "Marketing Director"), their quote, a 1-5 star rating, and
     * whether to feature it prominently on the landing page.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'client_role' => 'nullable|string|max:255',
            'content' => 'required|string|max:2000',
            'rating' => 'required|integer|between:1,5',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $studio = $request->user()->studio;
        $maxSort = $studio->testimonials()->max('sort_order') ?? 0;

        $studio->testimonials()->create([
            ...$validated,
            'sort_order' => $maxSort + 1,
        ]);

        return back()->with('success', 'Testimonial created.');
    }

    /**
     * Update a testimonial's content, rating, or visibility.
     * Allows toggling is_featured (highlighted on the landing page) and
     * is_active (visible vs hidden) without deleting.
     */
    public function update(Request $request, Testimonial $testimonial)
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'client_role' => 'nullable|string|max:255',
            'content' => 'required|string|max:2000',
            'rating' => 'required|integer|between:1,5',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $testimonial->update($validated);

        return back()->with('success', 'Testimonial updated.');
    }

    /**
     * Delete a testimonial and its associated photo.
     * Cleans up the Spatie media collection before removing the record
     * to avoid orphaned files on disk.
     */
    public function destroy(Testimonial $testimonial)
    {
        $testimonial->clearMediaCollection('photo');
        $testimonial->delete();

        return back()->with('success', 'Testimonial deleted.');
    }

    /**
     * Upload a client photo to display alongside their testimonial.
     * A photo of the happy client (or their event) adds authenticity and
     * makes the testimonial more personal and trustworthy for visitors.
     */
    public function uploadPhoto(Request $request, Testimonial $testimonial)
    {
        $request->validate([
            'photo' => 'required|image|max:5120',
        ]);

        $testimonial->addMediaFromRequest('photo')->toMediaCollection('photo');

        return back()->with('success', 'Photo uploaded.');
    }
}
