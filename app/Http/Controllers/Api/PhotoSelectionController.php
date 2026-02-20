<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use App\Services\SelectionLockService;
use Illuminate\Http\Request;

class PhotoSelectionController extends Controller
{
    public function __construct(private SelectionLockService $selectionService) {}

    public function togglePhoto(Request $request, Gallery $gallery)
    {
        $user = $request->user();

        $validated = $request->validate([
            'photo_id' => 'required|exists:photos,id',
            'retouching_notes' => 'nullable|string|max:1000',
        ]);

        $selection = $this->selectionService->getOrCreateSelection($gallery, $user);

        try {
            $added = $this->selectionService->togglePhoto(
                $selection,
                $validated['photo_id'],
                $validated['retouching_notes'] ?? null
            );

            $selectedIds = $selection->photos()->pluck('photo_id')->toArray();

            return response()->json([
                'added' => $added,
                'selected_count' => count($selectedIds),
                'selected_photo_ids' => $selectedIds,
                'limit' => $gallery->selection_limit,
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function submit(Request $request, Gallery $gallery)
    {
        $user = $request->user();
        $selection = $this->selectionService->getOrCreateSelection($gallery, $user);

        $request->validate([
            'notes' => 'nullable|string|max:2000',
        ]);

        if ($request->has('notes')) {
            $selection->update(['notes' => $request->input('notes')]);
        }

        try {
            $this->selectionService->submit($selection);

            return response()->json(['message' => 'Selection submitted for review.', 'status' => 'submitted']);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function approve(Request $request, Gallery $gallery)
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $selection = $gallery->selections()->where('user_id', $validated['user_id'])->firstOrFail();
        $this->selectionService->approve($selection, $user);

        return response()->json(['message' => 'Selection approved and locked.']);
    }

    public function status(Request $request, Gallery $gallery)
    {
        $user = $request->user();
        $selection = $gallery->selections()->where('user_id', $user->id)->first();

        if (! $selection) {
            return response()->json([
                'status' => 'none',
                'selected_count' => 0,
                'selected_photo_ids' => [],
            ]);
        }

        return response()->json([
            'status' => $selection->status,
            'is_locked' => $selection->is_locked,
            'selected_count' => $selection->photos()->count(),
            'selected_photo_ids' => $selection->photos()->pluck('photo_id')->toArray(),
            'submitted_at' => $selection->submitted_at?->toISOString(),
            'approved_at' => $selection->approved_at?->toISOString(),
        ]);
    }
}
