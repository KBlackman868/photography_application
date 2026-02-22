<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\GalleryReviewController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/', WelcomeController::class);

// Public portfolio routes
Route::get('/portfolio', [PortfolioController::class, 'publicIndex'])->name('portfolio.public');
Route::get('/portfolio/{portfolio:slug}', [PortfolioController::class, 'show'])->name('portfolio.public.show');

// Public booking routes
Route::get('/book', [BookingController::class, 'create'])->name('bookings.create');
Route::post('/book', [BookingController::class, 'store'])->name('bookings.store');

// API: booking availability (public)
Route::get('/api/availability', [BookingController::class, 'availability'])->name('bookings.availability');

// Authenticated routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar');
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
    Route::post('/portfolios/{portfolio}/photos', [PortfolioController::class, 'uploadPhotos'])->name('portfolios.photos.upload');
    Route::delete('/portfolios/{portfolio}/photos/{photo}', [PortfolioController::class, 'deletePhoto'])->name('portfolios.photos.delete');
    Route::post('/portfolios/{portfolio}/cover', [PortfolioController::class, 'setCover'])->name('portfolios.cover');
    Route::patch('/portfolios/{portfolio}/photos/{photo}/caption', [PortfolioController::class, 'updatePhotoCaption'])->name('portfolios.photos.caption');

    // Bookings (admin)
    Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');
    Route::get('/bookings/calendar', [BookingController::class, 'calendar'])->name('bookings.calendar');
    Route::put('/bookings/{booking}', [BookingController::class, 'update'])->name('bookings.update');

    // Settings (admin only)
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::put('/settings/studio', [SettingsController::class, 'updateStudio'])->name('settings.studio.update');
});

require __DIR__.'/auth.php';
