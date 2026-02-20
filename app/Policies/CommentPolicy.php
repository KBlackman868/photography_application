<?php

namespace App\Policies;

use App\Models\PhotoComment;
use App\Models\User;

class CommentPolicy
{
    public function create(User $user): bool
    {
        return true; // all authenticated users can comment
    }

    public function update(User $user, PhotoComment $comment): bool
    {
        return $comment->user_id === $user->id;
    }

    public function delete(User $user, PhotoComment $comment): bool
    {
        return $comment->user_id === $user->id || $user->isAdmin();
    }

    public function resolve(User $user, PhotoComment $comment): bool
    {
        return $user->isAdmin() || $user->isEditor();
    }

    public function markInternal(User $user): bool
    {
        // Only admins/editors can create internal notes
        return $user->isAdmin() || $user->isEditor();
    }

    public function viewInternal(User $user): bool
    {
        return $user->isAdmin() || $user->isEditor();
    }
}
