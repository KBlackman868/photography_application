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
use App\Http\Controllers\TestimonialController;
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

// Public booking status lookup
Route::get('/booking-status', [BookingController::class, 'statusLookup'])->name('bookings.status');
Route::post('/booking-status', [BookingController::class, 'statusCheck'])->name('bookings.status.check');

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
    Route::post('/bookings/{booking}/reply', [BookingController::class, 'reply'])->name('bookings.reply');

    // Settings (admin only)
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::put('/settings/studio', [SettingsController::class, 'updateStudio'])->name('settings.studio.update');
    Route::post('/settings/logo', [SettingsController::class, 'uploadLogo'])->name('settings.logo.upload');
    Route::delete('/settings/logo', [SettingsController::class, 'deleteLogo'])->name('settings.logo.delete');
    Route::post('/settings/hero-images', [SettingsController::class, 'uploadHeroImages'])->name('settings.hero.upload');
    Route::delete('/settings/hero-images', [SettingsController::class, 'deleteHeroImage'])->name('settings.hero.delete');
    Route::post('/settings/photographer-photo', [SettingsController::class, 'uploadPhotographerPhoto'])->name('settings.photographer-photo.upload');
    Route::delete('/settings/photographer-photo', [SettingsController::class, 'deletePhotographerPhoto'])->name('settings.photographer-photo.delete');

    // Packages (admin)
    Route::post('/settings/packages', [SettingsController::class, 'storePackage'])->name('settings.packages.store');
    Route::put('/settings/packages/{package}', [SettingsController::class, 'updatePackage'])->name('settings.packages.update');
    Route::delete('/settings/packages/{package}', [SettingsController::class, 'deletePackage'])->name('settings.packages.delete');

    // Testimonials (admin)
    Route::get('/testimonials', [TestimonialController::class, 'index'])->name('testimonials.index');
    Route::post('/testimonials', [TestimonialController::class, 'store'])->name('testimonials.store');
    Route::put('/testimonials/{testimonial}', [TestimonialController::class, 'update'])->name('testimonials.update');
    Route::delete('/testimonials/{testimonial}', [TestimonialController::class, 'destroy'])->name('testimonials.destroy');
    Route::post('/testimonials/{testimonial}/photo', [TestimonialController::class, 'uploadPhoto'])->name('testimonials.photo.upload');
});

require __DIR__.'/auth.php';
