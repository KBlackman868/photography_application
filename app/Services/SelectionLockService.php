<?php

namespace App\Services;

use App\Models\Gallery;
use App\Models\GallerySelection;
use App\Models\User;

class SelectionLockService
{
    public function getOrCreateSelection(Gallery $gallery, User $user): GallerySelection
    {
        return GallerySelection::firstOrCreate(
            ['gallery_id' => $gallery->id, 'user_id' => $user->id],
            ['status' => 'draft']
        );
    }

    public function submit(GallerySelection $selection): void
    {
        if ($selection->is_locked) {
            throw new \RuntimeException('Selection is locked and cannot be modified.');
        }

        $selection->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        activity()
            ->causedBy($selection->user)
            ->performedOn($selection->gallery)
            ->log('selection_submitted');
    }

    public function approve(GallerySelection $selection, User $approver): void
    {
        $selection->approve($approver);

        activity()
            ->causedBy($approver)
            ->performedOn($selection->gallery)
            ->log('selection_approved');
    }

    public function requestRevision(GallerySelection $selection, User $requester, string $notes = ''): void
    {
        $selection->update([
            'status' => 'revision_requested',
            'is_locked' => false,
            'notes' => $notes,
        ]);

        activity()
            ->causedBy($requester)
            ->performedOn($selection->gallery)
            ->withProperties(['notes' => $notes])
            ->log('revision_requested');
    }

    public function overrideLock(GallerySelection $selection, User $admin): void
    {
        if (! $admin->isAdmin()) {
            throw new \RuntimeException('Only admins can override selection locks.');
        }

        $selection->update(['is_locked' => false]);

        activity()
            ->causedBy($admin)
            ->performedOn($selection->gallery)
            ->log('selection_lock_overridden');
    }

    public function togglePhoto(GallerySelection $selection, int $photoId, ?string $notes = null): bool
    {
        if ($selection->is_locked) {
            throw new \RuntimeException('Selection is locked and cannot be modified.');
        }

        $exists = $selection->photos()->where('photo_id', $photoId)->exists();

        if ($exists) {
            $selection->photos()->detach($photoId);

            return false; // removed
        }

        // Check selection limit
        $gallery = $selection->gallery;
        if ($gallery->selection_limit && $selection->photos()->count() >= $gallery->selection_limit) {
            throw new \RuntimeException("Selection limit of {$gallery->selection_limit} photos reached.");
        }

        $selection->photos()->attach($photoId, ['retouching_notes' => $notes]);

        return true; // added
    }
}
