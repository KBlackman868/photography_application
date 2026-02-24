<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use App\Models\PortfolioPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PortfolioController extends Controller
{
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

    public function uploadPhotos(Request $request, Portfolio $portfolio)
    {
        $request->validate([
            'photos' => 'required|array|min:1',
            'photos.*' => 'required|image|max:51200',
        ]);

        $maxOrder = $portfolio->portfolioPhotos()->max('sort_order') ?? 0;

        foreach ($request->file('photos') as $file) {
            // Store file directly to disk as a reliable fallback
            $path = $file->store("portfolios/{$portfolio->id}", 'public');

            $photo = PortfolioPhoto::create([
                'portfolio_id' => $portfolio->id,
                'photo_path' => $path,
                'sort_order' => ++$maxOrder,
            ]);

            // Also add to Spatie for image conversions
            try {
                $photo->copyMedia(storage_path("app/public/{$path}"))
                    ->toMediaCollection('photo');
            } catch (\Throwable $e) {
                // Spatie failed, but photo_path fallback still works
                \Log::warning("Media conversion failed for photo {$photo->id}: " . $e->getMessage());
            }
        }

        // Set cover photo if none exists
        if (! $portfolio->cover_photo_path) {
            $first = $portfolio->portfolioPhotos()->with('media')->orderBy('sort_order')->first();
            if ($first) {
                $coverUrl = $first->thumb_url ?? $first->original_url;
                $portfolio->update(['cover_photo_path' => $coverUrl]);
            }
        }

        return back()->with('success', count($request->file('photos')) . ' photo(s) uploaded.');
    }

    public function deletePhoto(Portfolio $portfolio, PortfolioPhoto $photo)
    {
        $photo->clearMediaCollection('photo');
        $photo->delete();

        // Update cover if deleted photo was the cover
        $next = $portfolio->portfolioPhotos()->with('media')->orderBy('sort_order')->first();
        $portfolio->update(['cover_photo_path' => $next?->thumb_url]);

        return back()->with('success', 'Photo deleted.');
    }

    public function setCover(Request $request, Portfolio $portfolio)
    {
        $request->validate(['photo_id' => 'required|exists:portfolio_photos,id']);

        $photo = PortfolioPhoto::with('media')->findOrFail($request->photo_id);
        $portfolio->update(['cover_photo_path' => $photo->thumb_url ?? $photo->original_url]);

        return back()->with('success', 'Cover photo updated.');
    }

    public function updatePhotoCaption(Request $request, Portfolio $portfolio, PortfolioPhoto $photo)
    {
        $request->validate(['caption' => 'nullable|string|max:500']);
        $photo->update(['caption' => $request->caption]);

        return back()->with('success', 'Caption updated.');
    }

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

    public function destroy(Portfolio $portfolio)
    {
        // Spatie will clean up media when models are deleted
        $portfolio->portfolioPhotos->each(fn ($photo) => $photo->clearMediaCollection('photo'));
        $portfolio->delete();

        return redirect()->route('portfolios.index')->with('success', 'Portfolio deleted.');
    }
}
