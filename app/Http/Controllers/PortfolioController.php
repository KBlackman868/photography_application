<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use App\Models\PortfolioPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

/**
 * Portfolio Controller
 *
 * Portfolios are the photographer's public showcase -- curated collections of
 * their best work organized by category (wedding, portrait, commercial, etc.).
 * These appear on the public website to attract new clients and demonstrate
 * the studio's style and capabilities.
 *
 * This controller handles both the public-facing display and the admin-side
 * management of portfolios, including photo uploads via Spatie Media Library,
 * cover photo selection, caption editing, and sort ordering.
 */
class PortfolioController extends Controller
{
    /**
     * Public portfolio listing page.
     * This is what potential clients see -- all published portfolios with their
     * photos, ready for browsing. Appends multiple image size URLs (display,
     * thumb, original) so the frontend can use the right size for each context.
     */
    public function publicIndex()
    {
        $portfolios = Portfolio::published()
            ->withCount('portfolioPhotos')
            ->with(['portfolioPhotos.media'])
            ->orderBy('sort_order')
            ->get()
            ->each(function (Portfolio $p) {
                $p->portfolioPhotos->each(function (PortfolioPhoto $photo) {
                    $photo->append(['display_url', 'thumb_url', 'original_url']);
                });
            });

        return Inertia::render('Portfolios/Public', [
            'portfolios' => $portfolios,
        ]);
    }

    /**
     * Admin portfolio listing.
     * Shows all portfolios (published and unpublished) so the photographer
     * can manage their collections and see photo counts at a glance.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $portfolios = Portfolio::where('studio_id', $user->studio_id)
            ->withCount('portfolioPhotos')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Portfolios/Index', [
            'portfolios' => $portfolios,
        ]);
    }

    /**
     * View a single portfolio with all its photos.
     * Used by both the admin detail view and portfolio previews.
     */
    public function show(Portfolio $portfolio)
    {
        $portfolio->load(['portfolioPhotos.media']);
        $portfolio->portfolioPhotos->each(function (PortfolioPhoto $photo) {
            $photo->append(['display_url', 'thumb_url', 'original_url']);
        });

        return Inertia::render('Portfolios/Show', [
            'portfolio' => $portfolio,
        ]);
    }

    /**
     * Create a new portfolio collection.
     * The category helps organize portfolios on the public site so visitors
     * can filter by the type of photography they are looking for.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'category' => 'required|in:wedding,portrait,event,commercial,newborn,landscape,other',
            'is_published' => 'boolean',
        ]);

        Portfolio::create([
            ...$validated,
            'studio_id' => $request->user()->studio_id,
            'slug' => Str::slug($validated['title']).'-'.Str::random(6),
        ]);

        return redirect()->route('portfolios.index')->with('success', 'Portfolio created.');
    }

    /**
     * Load the portfolio editor with photos in sort order.
     * This is where the photographer arranges photos, sets captions,
     * and chooses the cover image.
     */
    public function edit(Portfolio $portfolio)
    {
        $portfolio->load(['portfolioPhotos' => fn ($q) => $q->orderBy('sort_order'), 'portfolioPhotos.media']);
        $portfolio->portfolioPhotos->each(function (PortfolioPhoto $photo) {
            $photo->append(['display_url', 'thumb_url', 'original_url']);
        });

        return Inertia::render('Portfolios/Edit', [
            'portfolio' => $portfolio,
        ]);
    }

    /**
     * Upload photos to a portfolio.
     * Uses a dual-storage strategy for reliability: files are always saved directly
     * to disk first (so photos are never lost), then Spatie Media Library processes
     * them for optimized display/thumb conversions. If Spatie fails, the direct
     * file path still works as a fallback. Supports up to 50MB per image for
     * high-resolution portfolio shots.
     */
    public function uploadPhotos(Request $request, Portfolio $portfolio)
    {
        $request->validate([
            'photos' => 'required|array|min:1',
            'photos.*' => 'required|image|max:51200',
        ]);

        // Continue the sort order from the last photo so new uploads appear at the end
        $maxOrder = $portfolio->portfolioPhotos()->max('sort_order') ?? 0;

        foreach ($request->file('photos') as $file) {
            // Store file directly to disk as a reliable fallback
            $path = $file->store("portfolios/{$portfolio->id}", 'public');

            $photo = PortfolioPhoto::create([
                'portfolio_id' => $portfolio->id,
                'photo_path' => $path,
                'sort_order' => ++$maxOrder,
            ]);

            // Also add to Spatie for image conversions (display and thumbnail sizes)
            try {
                $photo->copyMedia(storage_path("app/public/{$path}"))
                    ->toMediaCollection('photo');
            } catch (\Throwable $e) {
                // Spatie failed, but photo_path fallback still works
                \Log::warning("Media conversion failed for photo {$photo->id}: " . $e->getMessage());
            }
        }

        // Automatically set the first photo as the cover if no cover exists yet,
        // so new portfolios always have a thumbnail in listing views
        if (! $portfolio->cover_photo_path) {
            $first = $portfolio->portfolioPhotos()->with('media')->orderBy('sort_order')->first();
            if ($first) {
                $coverUrl = $first->thumb_url ?? $first->original_url;
                $portfolio->update(['cover_photo_path' => $coverUrl]);
            }
        }

        return back()->with('success', count($request->file('photos')) . ' photo(s) uploaded.');
    }

    /**
     * Remove a photo from the portfolio.
     * Cleans up Spatie media files and, if this was the cover photo,
     * automatically promotes the next photo in sort order to be the new cover.
     */
    public function deletePhoto(Portfolio $portfolio, PortfolioPhoto $photo)
    {
        $photo->clearMediaCollection('photo');
        $photo->delete();

        // Update cover if deleted photo was the cover
        $next = $portfolio->portfolioPhotos()->with('media')->orderBy('sort_order')->first();
        $portfolio->update(['cover_photo_path' => $next?->thumb_url]);

        return back()->with('success', 'Photo deleted.');
    }

    /**
     * Set a specific photo as the portfolio's cover image.
     * The cover photo represents the entire portfolio in listing views and
     * on the landing page, so choosing the right one matters for first impressions.
     */
    public function setCover(Request $request, Portfolio $portfolio)
    {
        $request->validate(['photo_id' => 'required|exists:portfolio_photos,id']);

        $photo = PortfolioPhoto::with('media')->findOrFail($request->photo_id);
        $portfolio->update(['cover_photo_path' => $photo->thumb_url ?? $photo->original_url]);

        return back()->with('success', 'Cover photo updated.');
    }

    /**
     * Add or update a caption for a portfolio photo.
     * Captions add context for website visitors (e.g., venue name,
     * a quote from the couple, or a brief description of the moment).
     */
    public function updatePhotoCaption(Request $request, Portfolio $portfolio, PortfolioPhoto $photo)
    {
        $request->validate(['caption' => 'nullable|string|max:500']);
        $photo->update(['caption' => $request->caption]);

        return back()->with('success', 'Caption updated.');
    }

    /**
     * Update portfolio metadata.
     * Allows editing the title, description, category, published status,
     * and sort order to control how the portfolio appears on the public site.
     */
    public function update(Request $request, Portfolio $portfolio)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:2000',
            'category' => 'sometimes|in:wedding,portrait,event,commercial,newborn,landscape,other',
            'is_published' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer',
        ]);

        $portfolio->update($validated);

        return back()->with('success', 'Portfolio updated.');
    }

    /**
     * Delete a portfolio and all its photos.
     * Cleans up all Spatie media conversions for each photo before deleting
     * to avoid orphaned files on disk.
     */
    public function destroy(Portfolio $portfolio)
    {
        // Spatie will clean up media when models are deleted
        $portfolio->portfolioPhotos->each(fn ($photo) => $photo->clearMediaCollection('photo'));
        $portfolio->delete();

        return redirect()->route('portfolios.index')->with('success', 'Portfolio deleted.');
    }
}
