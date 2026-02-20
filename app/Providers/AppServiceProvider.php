<?php

namespace App\Providers;

use App\Models\Gallery;
use App\Models\GallerySelection;
use App\Models\Photo;
use App\Models\PhotoComment;
use App\Policies\CommentPolicy;
use App\Policies\GalleryPolicy;
use App\Policies\PhotoPolicy;
use App\Policies\SelectionPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Register policies
        Gate::policy(Gallery::class, GalleryPolicy::class);
        Gate::policy(Photo::class, PhotoPolicy::class);
        Gate::policy(PhotoComment::class, CommentPolicy::class);
        Gate::policy(GallerySelection::class, SelectionPolicy::class);
    }
}
