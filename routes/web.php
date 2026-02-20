<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\GalleryReviewController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public routes
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

// Public portfolio routes
Route::get('/portfolio', [PortfolioController::class, 'index'])->name('portfolio.public');
Route::get('/portfolio/{portfolio:slug}', [PortfolioController::class, 'show'])->name('portfolio.public.show');

// Authenticated routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Galleries
    Route::resource('galleries', GalleryController::class);
    Route::get('/galleries/{gallery}/review', [GalleryReviewController::class, 'show'])->name('galleries.review');

    // Projects (admin only)
    Route::resource('projects', ProjectController::class)->except(['show', 'edit']);

    // Clients (admin only)
    Route::resource('clients', ClientController::class)->except(['edit', 'destroy']);

    // Portfolios (admin management)
    Route::resource('portfolios', PortfolioController::class)->except(['show']);

    // Settings (admin only)
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::put('/settings/studio', [SettingsController::class, 'updateStudio'])->name('settings.studio.update');
});

require __DIR__.'/auth.php';
