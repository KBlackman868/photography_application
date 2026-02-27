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

/*
|--------------------------------------------------------------------------
| Public Routes -- No login required
|--------------------------------------------------------------------------
| These pages are what prospective clients see: the studio landing page,
| portfolio galleries, and the booking form. Anyone on the internet can
| access these.
*/

// Studio landing / home page
Route::get('/', WelcomeController::class);

// Public portfolio -- showcases the photographer's best work to attract new clients
Route::get('/portfolio', [PortfolioController::class, 'publicIndex'])->name('portfolio.public');
Route::get('/portfolio/{portfolio:slug}', [PortfolioController::class, 'show'])->name('portfolio.public.show');

// Booking form -- where potential clients request a photography session
Route::get('/book', [BookingController::class, 'create'])->name('bookings.create');
Route::post('/book', [BookingController::class, 'store'])->name('bookings.store');

// Booking status lookup -- lets clients check on their booking without logging in
Route::get('/booking-status', [BookingController::class, 'statusLookup'])->name('bookings.status');
Route::post('/booking-status', [BookingController::class, 'statusCheck'])->name('bookings.status.check');

// Calendar availability API -- the booking form calls this to show open dates
Route::get('/api/availability', [BookingController::class, 'availability'])->name('bookings.availability');

/*
|--------------------------------------------------------------------------
| Authenticated Routes -- Login required (clients + admin)
|--------------------------------------------------------------------------
| Everything behind the login wall. Clients see their galleries and profile.
| Admin/photographer sees the full studio management dashboard.
*/
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard -- overview of recent activity, pending bookings, gallery stats
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    /*
     * Profile -- users manage their own account (name, email, avatar).
     * Both clients and admin use these routes.
     */
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    /*
     * Galleries -- the core of the client delivery experience.
     * Clients view their photo galleries here; admin can create and manage them.
     * The review route opens the interactive proofing/selection interface.
     */
    Route::resource('galleries', GalleryController::class);
    Route::get('/galleries/{gallery}/review', [GalleryReviewController::class, 'show'])->name('galleries.review');

    // Projects -- admin groups related galleries under a project (e.g., "Smith Wedding 2025")
    Route::resource('projects', ProjectController::class)->except(['show', 'edit']);

    // Clients -- admin manages client records (contact info, linked projects)
    Route::resource('clients', ClientController::class)->except(['edit', 'destroy']);

    /*
     * Portfolios (admin) -- curate which photos appear on the public portfolio page.
     * Upload photos, set a cover image, and add captions for each portfolio collection.
     */
    Route::resource('portfolios', PortfolioController::class)->except(['show']);
    Route::post('/portfolios/{portfolio}/photos', [PortfolioController::class, 'uploadPhotos'])->name('portfolios.photos.upload');
    Route::delete('/portfolios/{portfolio}/photos/{photo}', [PortfolioController::class, 'deletePhoto'])->name('portfolios.photos.delete');
    Route::post('/portfolios/{portfolio}/cover', [PortfolioController::class, 'setCover'])->name('portfolios.cover');
    Route::patch('/portfolios/{portfolio}/photos/{photo}/caption', [PortfolioController::class, 'updatePhotoCaption'])->name('portfolios.photos.caption');

    /*
     * Bookings (admin) -- manage incoming session requests.
     * List view, calendar view, update status, and reply to clients.
     */
    Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');
    Route::get('/bookings/calendar', [BookingController::class, 'calendar'])->name('bookings.calendar');
    Route::put('/bookings/{booking}', [BookingController::class, 'update'])->name('bookings.update');
    Route::post('/bookings/{booking}/reply', [BookingController::class, 'reply'])->name('bookings.reply');

    /*
     * Settings (admin) -- studio branding and configuration.
     * Studio name/bio, logo, homepage hero images, and photographer about-page photo.
     */
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::put('/settings/studio', [SettingsController::class, 'updateStudio'])->name('settings.studio.update');
    Route::post('/settings/logo', [SettingsController::class, 'uploadLogo'])->name('settings.logo.upload');
    Route::delete('/settings/logo', [SettingsController::class, 'deleteLogo'])->name('settings.logo.delete');
    Route::post('/settings/hero-images', [SettingsController::class, 'uploadHeroImages'])->name('settings.hero.upload');
    Route::delete('/settings/hero-images', [SettingsController::class, 'deleteHeroImage'])->name('settings.hero.delete');
    Route::post('/settings/photographer-photo', [SettingsController::class, 'uploadPhotographerPhoto'])->name('settings.photographer-photo.upload');
    Route::delete('/settings/photographer-photo', [SettingsController::class, 'deletePhotographerPhoto'])->name('settings.photographer-photo.delete');

    // Packages (admin) -- pricing packages shown on the booking page (e.g., "Mini Session $250")
    Route::post('/settings/packages', [SettingsController::class, 'storePackage'])->name('settings.packages.store');
    Route::put('/settings/packages/{package}', [SettingsController::class, 'updatePackage'])->name('settings.packages.update');
    Route::delete('/settings/packages/{package}', [SettingsController::class, 'deletePackage'])->name('settings.packages.delete');

    // Testimonials (admin) -- manage client reviews displayed on the public site
    Route::get('/testimonials', [TestimonialController::class, 'index'])->name('testimonials.index');
    Route::post('/testimonials', [TestimonialController::class, 'store'])->name('testimonials.store');
    Route::put('/testimonials/{testimonial}', [TestimonialController::class, 'update'])->name('testimonials.update');
    Route::delete('/testimonials/{testimonial}', [TestimonialController::class, 'destroy'])->name('testimonials.destroy');
    Route::post('/testimonials/{testimonial}/photo', [TestimonialController::class, 'uploadPhoto'])->name('testimonials.photo.upload');
});

require __DIR__.'/auth.php';
