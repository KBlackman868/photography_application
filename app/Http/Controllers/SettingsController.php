<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
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
        ]);

        $studio = $request->user()->studio;
        $studio->update($validated);

        return back()->with('success', 'Settings updated.');
    }
}
