<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

/**
 * Converts a single uploaded photo into the three sizes the studio needs:
 * the untouched original for archival/print, a 1800px display version for
 * client gallery viewing, and a 500px thumbnail for grid layouts and previews.
 * Display and thumbnail versions are converted to WebP for fast page loads.
 */
class ImageService
{
    /**
     * Take an uploaded photo and produce all three size variants.
     * The original stays in its native format for maximum quality,
     * while the display and thumbnail versions are optimized WebP files.
     *
     * @return array{original_path: string, display_path: string, thumb_path: string}
     */
    public function process(UploadedFile $file, string $folder): array
    {
        $uniqueId = uniqid();

        // 1. Store original untouched -- this is the full-resolution master for print/download
        $originalName = $uniqueId . '.' . $file->getClientOriginalExtension();
        $originalPath = $file->storeAs("{$folder}/originals", $originalName, 'public');

        $absolutePath = Storage::disk('public')->path($originalPath);

        // 2. Generate display version (1800px wide, 85% quality, WebP) -- what clients see in the gallery viewer
        $displayName = $uniqueId . '.webp';
        $displayDir = "{$folder}/display";
        Storage::disk('public')->makeDirectory($displayDir);

        $displayImage = Image::read($absolutePath);
        $displayImage->scaleDown(width: 1800);
        $displayPath = "{$displayDir}/{$displayName}";
        Storage::disk('public')->put($displayPath, $displayImage->toWebp(quality: 85)->toString());

        // 3. Generate thumbnail (500px wide, 80% quality, WebP) -- used in gallery grids and preview strips
        $thumbDir = "{$folder}/thumbs";
        Storage::disk('public')->makeDirectory($thumbDir);

        $thumbImage = Image::read($absolutePath);
        $thumbImage->scaleDown(width: 500);
        $thumbPath = "{$thumbDir}/{$displayName}";
        Storage::disk('public')->put($thumbPath, $thumbImage->toWebp(quality: 80)->toString());

        return [
            'original_path' => $originalPath,
            'display_path' => $displayPath,
            'thumb_path' => $thumbPath,
        ];
    }
}
