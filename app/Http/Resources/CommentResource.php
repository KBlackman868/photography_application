<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
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
