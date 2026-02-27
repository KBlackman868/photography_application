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

/**
 * Gallery Review Panel Controller
 *
 * Powers the interactive photo review experience where clients browse, comment on,
 * and select their favorite photos from a shoot. This is one of the most important
 * client-facing features -- it replaces the old workflow of emailing low-res proofs
 * back and forth with a modern, real-time review panel.
 *
 * The review panel supports filtering, threaded comments, progress tracking, and
 * photo selection with configurable limits (e.g., "pick your 50 favorites").
 */
class GalleryReviewController extends Controller
{
    public function __construct(
        private GalleryProgressService $progressService,
        private SelectionLockService $selectionService,
    ) {}

    /**
     * Render the review panel for a gallery.
     * This single method does a lot because the review panel is a rich, interactive
     * page that needs photos, comments, filters, progress data, and selection state
     * all at once to avoid multiple round-trips.
     */
    public function show(Request $request, Gallery $gallery)
    {
        $user = $request->user();

        $gallery->load(['project.client', 'studio']);

        // Build photo query with filters -- clients can narrow down large
        // galleries to find specific photos or focus on photos that need attention
        $photoQuery = $gallery->photos()->visible();

        // Search by filename or tags so clients can find specific shots
        // (e.g., searching "ceremony" or "group" in a wedding gallery)
        if ($search = $request->input('search')) {
            $photoQuery->where(function ($q) use ($search) {
                $q->where('filename', 'like', "%{$search}%")
                    ->orWhereJsonContains('tags', $search);
            });
        }

        // Filter options help both photographer and client focus their review:
        // - favorited: show only photos the user has hearted
        // - has_comments: show photos with feedback that may need attention
        // - unresolved_only: show photos with open discussion threads
        // - rating: filter by star rating (photographer's quality rating)
        // - color_label: filter by color-coded categories set by the photographer
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

        // Load threaded comments for the currently selected photo.
        // Defaults to the first photo so the comment panel is never empty.
        $selectedPhotoId = $request->input('photo_id', $photos->first()?->id);
        $comments = [];

        if ($selectedPhotoId) {
            $commentQuery = \App\Models\PhotoComment::where('photo_id', $selectedPhotoId)
                ->whereNull('parent_id')
                ->with(['user', 'replies.user', 'resolver'])
                ->orderBy('created_at');

            // Internal comments are photographer-only notes (e.g., editing reminders)
            // that clients should never see
            if ($user->isClient()) {
                $commentQuery->where('is_internal', false);
            }

            $comments = CommentResource::collection($commentQuery->get());
        }

        // Progress tracking shows how far along the review is -- helpful for both
        // the photographer (to know when the client is done) and the client
        // (to see how many photos they still need to review/select)
        $progress = $this->progressService->calculate($gallery);
        $selectionProgress = $this->progressService->selectionProgress($gallery, $user->id);

        // Load which photos the client has already selected so the UI can
        // show checkmarks and enforce the selection limit
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
