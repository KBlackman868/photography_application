<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GalleryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'studio_id' => $this->studio_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'cover_photo_path' => $this->cover_photo_path ? asset('storage/'.$this->cover_photo_path) : null,
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
