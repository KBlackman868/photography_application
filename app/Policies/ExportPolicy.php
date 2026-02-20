<?php

namespace App\Policies;

use App\Models\ExportJob;
use App\Models\User;

class ExportPolicy
{
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isEditor();
    }

    public function download(User $user, ExportJob $export): bool
    {
        return $user->isAdmin() || $export->user_id === $user->id;
    }
}
