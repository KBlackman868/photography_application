<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Formats threaded photo comments for the frontend. Comments let clients and
 * photographers discuss specific photos -- for example, "Can you brighten this one?"
 * or "Love this shot!" Comments can be pinned to a spot on the photo, marked as
 * internal (studio-only), and resolved once the feedback has been addressed.
 */
class CommentResource extends JsonResource
{
    /**
     * Shape the comment data for the API response.
     *
     * - is_internal: If true, only studio staff can see this comment (not the client)
     * - is_resolved / resolved_at / resolved_by: Tracks whether feedback has been handled
     * - pin_position: X/Y coordinates if the comment is pinned to a specific spot on the photo
     * - replies: Nested child comments for threaded conversations
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'photo_id' => $this->photo_id,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'avatar_path' => $this->user->avatar_path,
                'role' => $this->user->role,
            ],
            'parent_id' => $this->parent_id,
            'body' => $this->body,
            'is_internal' => $this->is_internal,
            'is_resolved' => $this->resolved_at !== null,
            'resolved_at' => $this->resolved_at?->toISOString(),
            'resolved_by' => $this->when($this->resolver, fn () => [
                'id' => $this->resolver->id,
                'name' => $this->resolver->name,
            ]),
            'pin_position' => $this->pin_position,
            'replies' => CommentResource::collection($this->whenLoaded('replies')),
            'replies_count' => $this->when(isset($this->replies_count), $this->replies_count),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
