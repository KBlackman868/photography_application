<?php

namespace App\Policies;

use App\Models\Photo;
use App\Models\User;

class PhotoPolicy
{
    public function view(User $user, Photo $photo): bool
    {
        $gallery = $photo->gallery;

        if ($user->isAdmin() && $user->studio_id === $gallery->studio_id) {
            return true;
        }

        if ($user->isEditor() && $user->studio_id === $gallery->studio_id) {
            return true;
        }

        return $gallery->project->client_user_id === $user->id && ! $photo->is_hidden;
    }

    public function upload(User $user): bool
    {
        return $user->isAdmin() || $user->isEditor();
    }

    public function update(User $user, Photo $photo): bool
    {
        return $user->isAdmin() && $user->studio_id === $photo->gallery->studio_id;
    }

    public function delete(User $user, Photo $photo): bool
    {
        return $user->isAdmin() && $user->studio_id === $photo->gallery->studio_id;
    }

    public function favorite(User $user, Photo $photo): bool
    {
        $gallery = $photo->gallery;

        return $gallery->allow_favorites && (
            $user->isAdmin() ||
            $gallery->project->client_user_id === $user->id
        );
    }
}
