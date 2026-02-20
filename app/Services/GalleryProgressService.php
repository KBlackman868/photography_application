<?php

namespace App\Services;

use App\Models\Gallery;

class GalleryProgressService
{
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
