<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use App\Models\PortfolioPhoto;
use App\Models\Studio;
use App\Models\Testimonial;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/**
 * Public Landing Page Controller
 *
 * Powers the first page potential clients see when they visit the studio website.
 * This is the studio's digital storefront -- it showcases the best work, displays
 * glowing testimonials, and provides studio contact info to convert visitors into
 * booked clients.
 */
class WelcomeController extends Controller
{
    /**
     * Load everything needed for the public landing page.
     *
     * The landing page is the studio's most important marketing tool, so we pull
     * together portfolios (to show off the work), testimonials (social proof from
     * happy clients), and studio branding (logo, hero images, contact details).
     */
    public function __invoke()
    {
        // Load published portfolios with a preview of their best photos.
        // Limited to 12 portfolios with 9 photos each to keep the page fast
        // while still giving visitors a strong impression of the studio's range.
        $portfolios = Portfolio::published()
            ->with(['portfolioPhotos' => fn ($q) => $q->with('media')->orderBy('sort_order')->limit(9)])
            ->orderBy('sort_order')
            ->limit(12)
            ->get()
            ->map(fn (Portfolio $p) => [
                'id' => $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'category' => $p->category,
                'cover_photo_path' => $p->cover_photo_path,
                // Each photo has multiple sizes -- use Spatie URLs when available,
                // fall back to direct storage paths for reliability
                'photos' => $p->portfolioPhotos->map(fn (PortfolioPhoto $photo) => [
                    'id' => $photo->id,
                    'photo_path' => $photo->original_url ?? ($photo->photo_path ? '/storage/' . $photo->photo_path : null),
                    'display_path' => $photo->display_url ?? ($photo->display_path ? '/storage/' . $photo->display_path : null),
                    'thumb_path' => $photo->thumb_url ?? ($photo->thumb_path ? '/storage/' . $photo->thumb_path : null),
                    'caption' => $photo->caption,
                ]),
            ]);

        // Extract unique categories so the frontend can build filter tabs
        // (e.g., "Wedding", "Portrait", "Event") for easy browsing
        $categories = $portfolios->pluck('category')->unique()->values()->toArray();

        $studio = Studio::with('media')->first();

        // Testimonials build trust with potential clients -- featured ones appear
        // first, and we cap at 6 to keep the page focused and scannable
        $testimonials = $studio
            ? Testimonial::where('studio_id', $studio->id)
                ->active()
                ->with('media')
                ->orderByDesc('is_featured')
                ->orderBy('sort_order')
                ->limit(6)
                ->get()
                ->map(fn (Testimonial $t) => [
                    'id' => $t->id,
                    'client_name' => $t->client_name,
                    'client_role' => $t->client_role,
                    'content' => $t->content,
                    'rating' => $t->rating,
                    'photo_url' => $t->photo_url,
                    'is_featured' => $t->is_featured,
                ])
            : [];

        // Pass studio branding details (logo, hero images, social links) so the
        // landing page reflects the photographer's unique brand identity
        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'portfolios' => $portfolios,
            'categories' => $categories,
            'studio' => $studio ? [
                'name' => $studio->name,
                'description' => $studio->description,
                'email' => $studio->email,
                'phone' => $studio->phone,
                'logo_url' => $studio->logo_url,
                'photographer_photo_url' => $studio->photographer_photo_url,
                'hero_image_urls' => $studio->hero_image_urls,
                'social_links' => $studio->social_links,
            ] : null,
            'testimonials' => $testimonials,
        ]);
    }
}
