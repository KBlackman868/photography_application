<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommentResource;
use App\Models\Photo;
use App\Models\PhotoComment;
use Illuminate\Http\Request;

class PhotoCommentController extends Controller
{
    public function index(Request $request, Photo $photo)
    {
        $user = $request->user();

        $query = $photo->rootComments()
            ->with(['user', 'replies.user', 'resolver']);

        if ($user->isClient()) {
            $query->where('is_internal', false);
        }

        return CommentResource::collection($query->get());
    }

    public function store(Request $request, Photo $photo)
    {
        $user = $request->user();

        $validated = $request->validate([
            'body' => 'required|string|max:2000',
            'parent_id' => 'nullable|exists:photo_comments,id',
            'is_internal' => 'boolean',
            'pin_position' => 'nullable|array',
            'pin_position.x' => 'nullable|numeric|between:0,1',
            'pin_position.y' => 'nullable|numeric|between:0,1',
        ]);

        // Clients cannot create internal notes
        if ($user->isClient()) {
            $validated['is_internal'] = false;
        }

        $comment = $photo->comments()->create([
            'user_id' => $user->id,
            'parent_id' => $validated['parent_id'] ?? null,
            'body' => $validated['body'],
            'is_internal' => $validated['is_internal'] ?? false,
            'pin_position' => $validated['pin_position'] ?? null,
        ]);

        // Update cached count
        $photo->update(['comments_count' => $photo->comments()->count()]);

        // Log activity
        activity()
            ->causedBy($user)
            ->performedOn($photo)
            ->withProperties(['comment_id' => $comment->id, 'is_internal' => $comment->is_internal])
            ->log('comment_added');

        $comment->load(['user', 'replies.user']);

        return new CommentResource($comment);
    }

    public function update(Request $request, PhotoComment $comment)
    {
        if ($comment->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $comment->update($validated);
        $comment->load(['user', 'replies.user']);

        return new CommentResource($comment);
    }

    public function destroy(Request $request, PhotoComment $comment)
    {
        $user = $request->user();

        if ($comment->user_id !== $user->id && ! $user->isAdmin()) {
            abort(403);
        }

        $photo = $comment->photo;
        $comment->delete();

        $photo->update(['comments_count' => $photo->comments()->count()]);

        return response()->json(['message' => 'Comment deleted.']);
    }

    public function resolve(Request $request, PhotoComment $comment)
    {
        $user = $request->user();

        if (! $user->isAdmin() && ! $user->isEditor()) {
            abort(403, 'Only admins/editors can resolve comments.');
        }

        $comment->resolve($user);

        activity()
            ->causedBy($user)
            ->performedOn($comment->photo)
            ->withProperties(['comment_id' => $comment->id])
            ->log('comment_resolved');

        $comment->load(['user', 'replies.user', 'resolver']);

        return new CommentResource($comment);
    }

    public function unresolve(Request $request, PhotoComment $comment)
    {
        $user = $request->user();

        if (! $user->isAdmin() && ! $user->isEditor()) {
            abort(403);
        }

        $comment->unresolve();

        $comment->load(['user', 'replies.user']);

        return new CommentResource($comment);
    }
}
