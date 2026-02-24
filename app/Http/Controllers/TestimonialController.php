<?php

namespace App\Http\Controllers;

use App\Models\Testimonial;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TestimonialController extends Controller
{
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

    public function destroy(Testimonial $testimonial)
    {
        $testimonial->clearMediaCollection('photo');
        $testimonial->delete();

        return back()->with('success', 'Testimonial deleted.');
    }

    public function uploadPhoto(Request $request, Testimonial $testimonial)
    {
        $request->validate([
            'photo' => 'required|image|max:5120',
        ]);

        $testimonial->addMediaFromRequest('photo')->toMediaCollection('photo');

        return back()->with('success', 'Photo uploaded.');
    }
}
