<?php

namespace App\Policies;

use App\Models\Gallery;
use App\Models\User;

class GalleryPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Gallery $gallery): bool
    {
        if ($user->isAdmin() && $user->studio_id === $gallery->studio_id) {
            return true;
        }

        if ($user->isEditor() && $user->studio_id === $gallery->studio_id) {
            return true;
        }

        // Clients can only see galleries for their projects
        return $gallery->project->client_user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Gallery $gallery): bool
    {
        return $user->isAdmin() && $user->studio_id === $gallery->studio_id;
    }

    public function delete(User $user, Gallery $gallery): bool
    {
        return $user->isAdmin() && $user->studio_id === $gallery->studio_id;
    }

    public function publish(User $user, Gallery $gallery): bool
    {
        return $user->isAdmin() && $user->studio_id === $gallery->studio_id;
    }
}
