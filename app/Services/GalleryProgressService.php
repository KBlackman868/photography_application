<?php

namespace App\Services;

use App\Models\Gallery;

/**
 * Tracks how far along a gallery review is so the photographer knows
 * when a client has finished reviewing and selecting their favorites.
 */
class GalleryProgressService
{
    /**
     * Build an overview of the gallery's review status -- how many photos,
     * how many client comments, how many have been resolved, and total favorites.
     * This powers the progress dashboard so the photographer can see at a glance
     * whether a gallery still needs attention.
     *
     * @return array{total_photos: int, total_comments: int, resolved_comments: int, unresolved_comments: int, percent_resolved: int, total_favorites: int}
     */
    public function calculate(Gallery $gallery): array
    {
        $photos = $gallery->photos()
            ->withCount([
                'comments as total_comments_count' => fn ($q) => $q->whereNull('parent_id'),
                'comments as resolved_comments_count' => fn ($q) => $q->whereNull('parent_id')->whereNotNull('resolved_at'),
                'favorites as favorites_count',
            ])
            ->get();

        $totalComments = $photos->sum('total_comments_count');
        $resolvedComments = $photos->sum('resolved_comments_count');
        $totalFavorites = $photos->sum('favorites_count');

        return [
            'total_photos' => $photos->count(),
            'total_comments' => $totalComments,
            'resolved_comments' => $resolvedComments,
            'unresolved_comments' => $totalComments - $resolvedComments,
            'percent_resolved' => $totalComments > 0 ? round(($resolvedComments / $totalComments) * 100) : 0,
            'total_favorites' => $totalFavorites,
        ];
    }

    /**
     * Show how far a specific client is in picking their final photos.
     * Returns how many they have selected out of the allowed limit, the
     * percentage complete, and whether the selection is still editable or locked.
     * This helps both the client and the photographer track the selection process.
     *
     * @return array{selected: int, limit: int, percent: int, status: string, is_locked: bool}
     */
    public function selectionProgress(Gallery $gallery, int $userId): array
    {
        $selection = $gallery->selections()->where('user_id', $userId)->first();
        $selectedCount = $selection ? $selection->photos()->count() : 0;
        $limit = $gallery->selection_limit;

        return [
            'selected' => $selectedCount,
            'limit' => $limit,
            'percent' => $limit > 0 ? round(($selectedCount / $limit) * 100) : 0,
            'status' => $selection?->status ?? 'draft',
            'is_locked' => $selection?->is_locked ?? false,
        ];
    }
}
