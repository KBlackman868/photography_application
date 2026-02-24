<?php

namespace App\Http\Controllers;

use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index(Request $request)
    {
        $studio = $request->user()->studio;

        return Inertia::render('Settings/Index', [
            'studio' => $studio,
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

        if ($studio->logo_path) {
            Storage::disk('public')->delete($studio->logo_path);
        }

        $path = $request->file('logo')->store('studio/logo', 'public');
        $studio->update(['logo_path' => $path]);

        return back()->with('success', 'Logo updated.');
    }

    public function deleteLogo(Request $request)
    {
        $studio = $request->user()->studio;

        if ($studio->logo_path) {
            Storage::disk('public')->delete($studio->logo_path);
            $studio->update(['logo_path' => null]);
        }

        return back()->with('success', 'Logo removed.');
    }

    public function uploadHeroImages(Request $request)
    {
        $request->validate([
            'hero_images' => 'required|array|min:1|max:10',
            'hero_images.*' => 'required|image|max:20480',
        ]);

        $studio = $request->user()->studio;
        $existing = $studio->hero_images ?? [];

        foreach ($request->file('hero_images') as $file) {
            $path = $file->store('studio/hero', 'public');
            $existing[] = $path;
        }

        $studio->update(['hero_images' => $existing]);

        return back()->with('success', 'Hero images uploaded.');
    }

    public function deleteHeroImage(Request $request)
    {
        $request->validate([
            'index' => 'required|integer|min:0',
        ]);

        $studio = $request->user()->studio;
        $images = $studio->hero_images ?? [];
        $index = $request->input('index');

        if (isset($images[$index])) {
            Storage::disk('public')->delete($images[$index]);
            array_splice($images, $index, 1);
            $studio->update(['hero_images' => $images]);
        }

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

        if ($studio->photographer_photo_path) {
            Storage::disk('public')->delete($studio->photographer_photo_path);
        }

        $path = $request->file('photo')->store('studio/photographer', 'public');
        $studio->update(['photographer_photo_path' => $path]);

        return back()->with('success', 'Photographer photo updated.');
    }

    public function deletePhotographerPhoto(Request $request)
    {
        $studio = $request->user()->studio;

        if ($studio->photographer_photo_path) {
            Storage::disk('public')->delete($studio->photographer_photo_path);
            $studio->update(['photographer_photo_path' => null]);
        }

        return back()->with('success', 'Photographer photo removed.');
    }
}
