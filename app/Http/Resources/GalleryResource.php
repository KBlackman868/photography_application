<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Formats gallery data for the frontend. This is what the client and admin
 * see when loading a gallery -- its name, settings, photo count, and cover image.
 */
class GalleryResource extends JsonResource
{
    /**
     * Shape the gallery data for the API response.
     *
     * Key fields:
     * - cover_photo_path: Resolves to a full URL whether stored locally or on a CDN
     * - selection_limit: How many photos the client is allowed to pick as favorites
     * - allow_downloads/favorites/comments: Per-gallery feature toggles the photographer sets
     * - expires_at: Optional deadline after which the gallery link stops working
     * - project + client: Included only when the relationship is eager-loaded (admin views)
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'studio_id' => $this->studio_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'cover_photo_path' => $this->cover_photo_path
                ? (str_starts_with($this->cover_photo_path, 'http') ? $this->cover_photo_path : asset('storage/'.$this->cover_photo_path))
                : null,
            'status' => $this->status,
            'is_public' => $this->is_public,
            'allow_downloads' => $this->allow_downloads,
            'allow_favorites' => $this->allow_favorites,
            'allow_comments' => $this->allow_comments,
            'selection_limit' => $this->selection_limit,
            'photo_count' => $this->photo_count,
            'expires_at' => $this->expires_at?->toISOString(),
            'published_at' => $this->published_at?->toISOString(),
            'project' => $this->when($this->relationLoaded('project'), fn () => [
                'id' => $this->project->id,
                'name' => $this->project->name,
                'type' => $this->project->type,
                'client' => $this->when($this->project->relationLoaded('client'), fn () => [
                    'id' => $this->project->client->id,
                    'name' => $this->project->client->name,
                ]),
            ]),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
