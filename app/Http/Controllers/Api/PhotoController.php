<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PhotoResource;
use App\Models\Gallery;
use App\Models\Photo;
use App\Services\PhotoIngestService;
use Illuminate\Http\Request;

class PhotoController extends Controller
{
    public function __construct(private PhotoIngestService $ingestService) {}

    public function index(Request $request, Gallery $gallery)
    {
        $user = $request->user();

        $query = $gallery->photos()->visible();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('filename', 'like', "%{$search}%")
                    ->orWhereJsonContains('tags', $search);
            });
        }

        if ($request->boolean('favorited')) {
            $query->favorited($user);
        }

        if ($request->boolean('has_comments')) {
            $query->has('comments');
        }

        if ($request->boolean('unresolved_only')) {
            $query->withUnresolvedComments();
        }

        if ($rating = $request->input('rating')) {
            $query->where('rating', '>=', (int) $rating);
        }

        if ($colorLabel = $request->input('color_label')) {
            $query->withColorLabel($colorLabel);
        }

        $photos = $query
            ->with(['favorites' => fn ($q) => $q->where('user_id', $user->id)])
            ->withCount(['comments', 'favorites'])
            ->orderBy('sort_order')
            ->get();

        return PhotoResource::collection($photos);
    }

    public function upload(Request $request, Gallery $gallery)
    {
        $user = $request->user();

        if (! $user->isAdmin() && ! $user->isEditor()) {
            abort(403);
        }

        $request->validate([
            'photos' => 'required|array',
            'photos.*' => 'required|image|max:51200', // 50MB max per file
        ]);

        $photos = $this->ingestService->ingestBatch(
            $request->file('photos'),
            $gallery,
            $user
        );

        return PhotoResource::collection($photos);
    }

    public function update(Request $request, Photo $photo)
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'rating' => 'nullable|integer|between:1,5',
            'color_label' => 'nullable|in:red,green,blue,yellow,purple',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'is_featured' => 'boolean',
            'is_hidden' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $photo->update($validated);

        return new PhotoResource($photo);
    }

    public function batchUpdate(Request $request, Gallery $gallery)
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'photo_ids' => 'required|array',
            'photo_ids.*' => 'exists:photos,id',
            'rating' => 'nullable|integer|between:1,5',
            'color_label' => 'nullable|in:red,green,blue,yellow,purple',
            'tags' => 'nullable|array',
        ]);

        $updateData = collect($validated)->except('photo_ids')->filter()->toArray();

        Photo::whereIn('id', $validated['photo_ids'])
            ->where('gallery_id', $gallery->id)
            ->update($updateData);

        return response()->json(['message' => 'Photos updated.']);
    }

    public function destroy(Request $request, Photo $photo)
    {
        if (! $request->user()->isAdmin()) {
            abort(403);
        }

        $gallery = $photo->gallery;
        $photo->delete();
        $gallery->decrement('photo_count');

        return response()->json(['message' => 'Photo deleted.']);
    }
}
