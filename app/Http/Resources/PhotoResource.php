<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PhotoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $this->id,
            'gallery_id' => $this->gallery_id,
            'filename' => $this->filename,
            'preview_url' => $this->preview_path ? asset('storage/'.$this->preview_path) : asset('storage/'.$this->original_path),
            'thumb_url' => $this->thumb_path ? asset('storage/'.$this->thumb_path) : asset('storage/'.$this->original_path),
            'original_url' => $user?->isAdmin() ? asset('storage/'.$this->original_path) : null,
            'mime_type' => $this->mime_type,
            'file_size' => $this->file_size,
            'width' => $this->width,
            'height' => $this->height,
            'exif_data' => $this->exif_data,
            'sort_order' => $this->sort_order,
            'rating' => $this->rating,
            'color_label' => $this->color_label,
            'tags' => $this->tags ?? [],
            'is_featured' => $this->is_featured,
            'favorites_count' => $this->favorites_count,
            'comments_count' => $this->comments_count,
            'is_favorited' => $this->when(
                $user,
                fn () => $this->favorites->where('user_id', $user->id)->isNotEmpty(),
                false
            ),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
