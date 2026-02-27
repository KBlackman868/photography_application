<?php

namespace App\Services;

use App\Models\Gallery;
use App\Models\GallerySelection;
use App\Models\User;

/**
 * Manages the photo selection workflow for client galleries.
 *
 * The flow: client picks favorites (draft) -> submits for review -> photographer
 * approves or requests revisions -> once approved the selection is locked in.
 * This prevents accidental changes after the photographer starts retouching.
 */
class SelectionLockService
{
    /**
     * Find the client's existing selection for this gallery, or create a
     * new draft if they haven't started picking photos yet.
     */
    public function getOrCreateSelection(Gallery $gallery, User $user): GallerySelection
    {
        return GallerySelection::firstOrCreate(
            ['gallery_id' => $gallery->id, 'user_id' => $user->id],
            ['status' => 'draft']
        );
    }

    /**
     * Client is done choosing -- mark the selection as submitted so the
     * photographer can review it. Locked selections cannot be submitted again.
     */
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

    /**
     * Photographer approves the client's photo picks. This locks the selection
     * so no further changes can be made, and retouching can begin.
     */
    public function approve(GallerySelection $selection, User $approver): void
    {
        $selection->approve($approver);

        activity()
            ->causedBy($approver)
            ->performedOn($selection->gallery)
            ->log('selection_approved');
    }

    /**
     * Photographer asks the client to revise their picks -- maybe they chose
     * too many similar poses or missed an important shot. Unlocks the selection
     * so the client can make changes, with optional notes explaining what to fix.
     */
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

    /**
     * Admin-only escape hatch to unlock a finalized selection. Useful when the
     * client needs to swap a photo after approval (e.g., they changed their mind
     * about a specific edit). Only admins can do this to prevent accidental unlocks.
     */
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

    /**
     * Add or remove a photo from the client's selection. Enforces the gallery's
     * selection limit so clients cannot pick more than the allowed number of photos.
     * Returns true if the photo was added, false if it was removed.
     */
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
