<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Formats individual photo data for the frontend. Provides appropriately-sized
 * image URLs for gallery grids (thumb) and full viewing (preview), while keeping
 * the high-resolution original restricted to admin users only.
 */
class PhotoResource extends JsonResource
{
    /**
     * Convert a storage path to a full URL. Handles both local paths and
     * absolute URLs (e.g., from a CDN) so the frontend always gets a usable link.
     */
    private function toUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        return str_starts_with($path, 'http') ? $path : asset('storage/'.$path);
    }

    /**
     * Shape the photo data for the API response.
     *
     * - preview_url / thumb_url: Sized-down versions for fast gallery loading
     * - original_url: Full-resolution file -- only exposed to admin users to protect the master files
     * - is_favorited: Whether the current logged-in client has favorited this photo
     * - exif_data: Camera settings (aperture, shutter speed, ISO, etc.) for photography enthusiasts
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $this->id,
            'gallery_id' => $this->gallery_id,
            'filename' => $this->filename,
            'preview_url' => $this->toUrl($this->preview_path ?: $this->original_path),
            'thumb_url' => $this->toUrl($this->thumb_path ?: $this->original_path),
            'original_url' => $user?->isAdmin() ? $this->toUrl($this->original_path) : null,
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
