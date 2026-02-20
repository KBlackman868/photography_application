<?php

namespace App\Http\Controllers;

use App\Http\Resources\CommentResource;
use App\Http\Resources\GalleryResource;
use App\Http\Resources\PhotoResource;
use App\Models\Gallery;
use App\Services\GalleryProgressService;
use App\Services\SelectionLockService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GalleryReviewController extends Controller
{
    public function __construct(
        private GalleryProgressService $progressService,
        private SelectionLockService $selectionService,
    ) {}

    public function show(Request $request, Gallery $gallery)
    {
        $user = $request->user();

        $gallery->load(['project.client', 'studio']);

        // Build photo query with filters
        $photoQuery = $gallery->photos()->visible();

        // Search by filename/tags
        if ($search = $request->input('search')) {
            $photoQuery->where(function ($q) use ($search) {
                $q->where('filename', 'like', "%{$search}%")
                    ->orWhereJsonContains('tags', $search);
            });
        }

        // Filters
        if ($request->boolean('favorited')) {
            $photoQuery->favorited($user);
        }
        if ($request->boolean('has_comments')) {
            $photoQuery->has('comments');
        }
        if ($request->boolean('unresolved_only')) {
            $photoQuery->withUnresolvedComments();
        }
        if ($rating = $request->input('rating')) {
            $photoQuery->where('rating', '>=', (int) $rating);
        }
        if ($colorLabel = $request->input('color_label')) {
            $photoQuery->withColorLabel($colorLabel);
        }

        $photos = $photoQuery
            ->with(['favorites' => fn ($q) => $q->where('user_id', $user->id)])
            ->withCount(['comments', 'favorites'])
            ->orderBy('sort_order')
            ->get();

        // Get comments for selected photo (or first photo)
        $selectedPhotoId = $request->input('photo_id', $photos->first()?->id);
        $comments = [];

        if ($selectedPhotoId) {
            $commentQuery = \App\Models\PhotoComment::where('photo_id', $selectedPhotoId)
                ->whereNull('parent_id')
                ->with(['user', 'replies.user', 'resolver'])
                ->orderBy('created_at');

            // Hide internal comments from clients
            if ($user->isClient()) {
                $commentQuery->where('is_internal', false);
            }

            $comments = CommentResource::collection($commentQuery->get());
        }

        $progress = $this->progressService->calculate($gallery);
        $selectionProgress = $this->progressService->selectionProgress($gallery, $user->id);

        $selection = $gallery->selections()->where('user_id', $user->id)->first();
        $selectedPhotoIds = $selection ? $selection->photos()->pluck('photo_id')->toArray() : [];

        return Inertia::render('Galleries/ReviewPanel', [
            'gallery' => new GalleryResource($gallery),
            'photos' => PhotoResource::collection($photos),
            'comments' => $comments,
            'selectedPhotoId' => (int) $selectedPhotoId,
            'progress' => $progress,
            'selectionProgress' => $selectionProgress,
            'selectedPhotoIds' => $selectedPhotoIds,
            'filters' => [
                'search' => $request->input('search', ''),
                'favorited' => $request->boolean('favorited'),
                'has_comments' => $request->boolean('has_comments'),
                'unresolved_only' => $request->boolean('unresolved_only'),
                'rating' => $request->input('rating'),
                'color_label' => $request->input('color_label'),
            ],
        ]);
    }
}
