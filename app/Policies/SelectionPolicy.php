<?php

namespace App\Policies;

use App\Models\GallerySelection;
use App\Models\User;

class SelectionPolicy
{
    public function view(User $user, GallerySelection $selection): bool
    {
        return $user->isAdmin() || $selection->user_id === $user->id;
    }

    public function submit(User $user, GallerySelection $selection): bool
    {
        return $selection->user_id === $user->id && $selection->isEditable();
    }

    public function approve(User $user, GallerySelection $selection): bool
    {
        return $user->isAdmin();
    }

    public function overrideLock(User $user): bool
    {
        return $user->isAdmin();
    }
}
