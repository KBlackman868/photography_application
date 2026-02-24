<?php

namespace App\Http\Controllers;

use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index(Request $request)
    {
        $studio = $request->user()->studio;
        $studio?->load('media');

        return Inertia::render('Settings/Index', [
            'studio' => $studio ? [
                ...$studio->toArray(),
                'logo_url' => $studio->logo_url,
                'photographer_photo_url' => $studio->photographer_photo_url,
                'hero_image_urls' => $studio->hero_image_urls,
                'hero_media' => $studio->getMedia('hero-images')->map(fn ($m) => [
                    'id' => $m->id,
                    'url' => $m->getUrl(),
                    'display_url' => $m->hasGeneratedConversion('display') ? $m->getUrl('display') : $m->getUrl(),
                    'thumb_url' => $m->hasGeneratedConversion('thumb') ? $m->getUrl('thumb') : $m->getUrl(),
                ]),
            ] : null,
            'packages' => $studio?->packages()->orderBy('sort_order')->get() ?? [],
        ]);
    }

    public function updateStudio(Request $request)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:2000',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'timezone' => 'sometimes|string|max:50',
            'branding' => 'nullable|array',
            'branding.primary_color' => 'nullable|string|max:7',
            'branding.secondary_color' => 'nullable|string|max:7',
            'watermark_settings' => 'nullable|array',
            'watermark_settings.position' => 'nullable|in:top-left,top-right,bottom-left,bottom-right,center',
            'watermark_settings.opacity' => 'nullable|integer|between:0,100',
            'social_links' => 'nullable|array',
            'social_links.instagram' => 'nullable|string|max:255',
            'social_links.facebook' => 'nullable|string|max:255',
            'availability_hours' => 'nullable|array',
        ]);

        $studio = $request->user()->studio;
        $studio->update($validated);

        return back()->with('success', 'Settings updated.');
    }

    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|max:5120',
        ]);

        $studio = $request->user()->studio;

        // Store file directly as a reliable fallback
        $path = $request->file('logo')->store("studios/{$studio->id}", 'public');
        $studio->update(['logo_path' => $path]);

        // Also add to Spatie
        try {
            $studio->addMedia(storage_path("app/public/{$path}"))
                ->preservingOriginal()
                ->toMediaCollection('logo');
        } catch (\Throwable $e) {
            \Log::warning("Logo media upload failed: " . $e->getMessage());
        }

        return back()->with('success', 'Logo updated.');
    }

    public function deleteLogo(Request $request)
    {
        $studio = $request->user()->studio;
        $studio->clearMediaCollection('logo');

        return back()->with('success', 'Logo removed.');
    }

    public function uploadHeroImages(Request $request)
    {
        $request->validate([
            'hero_images' => 'required|array|min:1|max:10',
            'hero_images.*' => 'required|image|max:20480',
        ]);

        $studio = $request->user()->studio;
        $heroPaths = $studio->hero_images ?? [];

        foreach ($request->file('hero_images') as $file) {
            // Store file directly as a reliable fallback
            $path = $file->store("studios/{$studio->id}/hero", 'public');
            $heroPaths[] = $path;

            // Also add to Spatie for conversions
            try {
                $studio->copyMedia(storage_path("app/public/{$path}"))
                    ->toMediaCollection('hero-images');
            } catch (\Throwable $e) {
                \Log::warning("Hero image media conversion failed: " . $e->getMessage());
            }
        }

        $studio->update(['hero_images' => $heroPaths]);

        return back()->with('success', 'Hero images uploaded.');
    }

    public function deleteHeroImage(Request $request)
    {
        $request->validate([
            'media_id' => 'required|integer',
        ]);

        $studio = $request->user()->studio;
        $media = $studio->getMedia('hero-images')->firstWhere('id', $request->media_id);
        $media?->delete();

        return back()->with('success', 'Hero image removed.');
    }

    public function storePackage(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'price' => 'required|numeric|min:0',
            'type' => 'required|string|max:100',
            'includes' => 'nullable|array',
        ]);

        $studio = $request->user()->studio;
        $maxSort = $studio->packages()->max('sort_order') ?? 0;

        $studio->packages()->create([
            ...$validated,
            'sort_order' => $maxSort + 1,
            'is_active' => true,
        ]);

        return back()->with('success', 'Package created.');
    }

    public function updatePackage(Request $request, Package $package)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'price' => 'required|numeric|min:0',
            'type' => 'required|string|max:100',
            'includes' => 'nullable|array',
        ]);

        $package->update($validated);

        return back()->with('success', 'Package updated.');
    }

    public function deletePackage(Request $request, Package $package)
    {
        $package->delete();

        return back()->with('success', 'Package deleted.');
    }

    public function uploadPhotographerPhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|max:10240',
        ]);

        $studio = $request->user()->studio;

        // Store file directly as a reliable fallback
        $path = $request->file('photo')->store("studios/{$studio->id}", 'public');
        $studio->update(['photographer_photo_path' => $path]);

        // Also add to Spatie for conversions
        try {
            $studio->addMedia(storage_path("app/public/{$path}"))
                ->preservingOriginal()
                ->toMediaCollection('photographer-photo');
        } catch (\Throwable $e) {
            \Log::warning("Photographer photo media conversion failed: " . $e->getMessage());
        }

        return back()->with('success', 'Photographer photo updated.');
    }

    public function deletePhotographerPhoto(Request $request)
    {
        $studio = $request->user()->studio;
        $studio->clearMediaCollection('photographer-photo');

        return back()->with('success', 'Photographer photo removed.');
    }
}
