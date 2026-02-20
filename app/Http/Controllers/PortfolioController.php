<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use App\Models\PortfolioPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PortfolioController extends Controller
{
    /**
     * Public portfolio page - grouped by category
     */
    public function publicIndex()
    {
        $portfolios = Portfolio::published()
            ->withCount('portfolioPhotos')
            ->with('portfolioPhotos')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Portfolios/Public', [
            'portfolios' => $portfolios,
        ]);
    }

    /**
     * Admin portfolio management
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

    public function show(Portfolio $portfolio)
    {
        $portfolio->load('portfolioPhotos');

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
        $portfolio->load(['portfolioPhotos' => fn ($q) => $q->orderBy('sort_order')]);

        return Inertia::render('Portfolios/Edit', [
            'portfolio' => $portfolio,
        ]);
    }

    public function uploadPhotos(Request $request, Portfolio $portfolio)
    {
        $request->validate([
            'photos' => 'required|array|min:1',
            'photos.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:10240',
        ]);

        $maxOrder = $portfolio->portfolioPhotos()->max('sort_order') ?? 0;

        foreach ($request->file('photos') as $file) {
            $path = $file->store("portfolios/{$portfolio->id}", 'public');

            // Compress and resize the image to max 1920px wide
            $this->compressImage(Storage::disk('public')->path($path), 1920, 85);

            PortfolioPhoto::create([
                'portfolio_id' => $portfolio->id,
                'photo_path' => $path,
                'sort_order' => ++$maxOrder,
            ]);
        }

        // Set cover photo if none exists
        if (!$portfolio->cover_photo_path) {
            $first = $portfolio->portfolioPhotos()->orderBy('sort_order')->first();
            if ($first) {
                $portfolio->update(['cover_photo_path' => $first->photo_path]);
            }
        }

        return back()->with('success', count($request->file('photos')) . ' photo(s) uploaded.');
    }

    public function deletePhoto(Portfolio $portfolio, PortfolioPhoto $photo)
    {
        if (Storage::disk('public')->exists($photo->photo_path)) {
            Storage::disk('public')->delete($photo->photo_path);
        }
        if ($photo->thumb_path && Storage::disk('public')->exists($photo->thumb_path)) {
            Storage::disk('public')->delete($photo->thumb_path);
        }

        $photo->delete();

        // Update cover if deleted photo was the cover
        if ($portfolio->cover_photo_path === $photo->photo_path) {
            $next = $portfolio->portfolioPhotos()->orderBy('sort_order')->first();
            $portfolio->update(['cover_photo_path' => $next?->photo_path]);
        }

        return back()->with('success', 'Photo deleted.');
    }

    public function setCover(Request $request, Portfolio $portfolio)
    {
        $request->validate(['photo_id' => 'required|exists:portfolio_photos,id']);

        $photo = PortfolioPhoto::findOrFail($request->photo_id);
        $portfolio->update(['cover_photo_path' => $photo->photo_path]);

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

    /**
     * Compress and resize an image file in place.
     * Backs up the original so a GD failure never leaves a blank/corrupt file.
     */
    private function compressImage(string $absolutePath, int $maxWidth, int $quality): void
    {
        $info = @getimagesize($absolutePath);
        if (!$info) {
            return;
        }

        [$origW, $origH, $type] = $info;

        // Nothing to do if already within size limit
        if ($origW <= $maxWidth && $type === IMAGETYPE_JPEG) {
            return;
        }

        // Back up original before any destructive work
        $backup = $absolutePath . '.bak';
        copy($absolutePath, $backup);

        try {
            $src = match ($type) {
                IMAGETYPE_JPEG => imagecreatefromjpeg($absolutePath),
                IMAGETYPE_PNG  => imagecreatefrompng($absolutePath),
                IMAGETYPE_WEBP => imagecreatefromwebp($absolutePath),
                IMAGETYPE_GIF  => imagecreatefromgif($absolutePath),
                default => false,
            };

            if (!$src) {
                return;
            }

            // Resize if wider than max
            if ($origW > $maxWidth) {
                $newW = $maxWidth;
                $newH = (int) ($origH * ($maxWidth / $origW));
                $dst = imagecreatetruecolor($newW, $newH);
                imagecopyresampled($dst, $src, 0, 0, 0, 0, $newW, $newH, $origW, $origH);
                imagedestroy($src);
                $src = $dst;
            }

            // Save in the same format as the original to avoid MIME type mismatches
            $saved = match ($type) {
                IMAGETYPE_PNG  => imagepng($src, $absolutePath, min((int) ($quality / 10), 9)),
                IMAGETYPE_WEBP => imagewebp($src, $absolutePath, $quality),
                IMAGETYPE_GIF  => imagegif($src, $absolutePath),
                default        => imagejpeg($src, $absolutePath, $quality),
            };
            imagedestroy($src);

            // If the save failed or produced an empty file, restore the backup
            if (!$saved || filesize($absolutePath) === 0) {
                copy($backup, $absolutePath);
            }
        } catch (\Throwable $e) {
            // Restore original on any error
            if (file_exists($backup)) {
                copy($backup, $absolutePath);
            }
        } finally {
            @unlink($backup);
        }
    }

    public function destroy(Portfolio $portfolio)
    {
        $portfolio->delete();

        return redirect()->route('portfolios.index')->with('success', 'Portfolio deleted.');
    }
}
