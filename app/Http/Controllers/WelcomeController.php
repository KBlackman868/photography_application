<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use App\Models\Studio;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

class WelcomeController extends Controller
{
    public function __invoke()
    {
        $portfolios = Portfolio::published()
            ->with(['portfolioPhotos' => fn ($q) => $q->orderBy('sort_order')->limit(6)])
            ->orderBy('sort_order')
            ->limit(6)
            ->get()
            ->map(fn (Portfolio $p) => [
                'id' => $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'category' => $p->category,
                'cover_photo_path' => $p->cover_photo_path,
                'photos' => $p->portfolioPhotos->map(fn ($photo) => [
                    'id' => $photo->id,
                    'photo_path' => $photo->photo_path,
                    'caption' => $photo->caption,
                ]),
            ]);

        $studio = Studio::first();

        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'portfolios' => $portfolios,
            'studio' => $studio ? [
                'name' => $studio->name,
                'description' => $studio->description,
                'email' => $studio->email,
                'phone' => $studio->phone,
            ] : null,
        ]);
    }
}
