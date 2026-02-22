<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class ImageService
{
    /**
     * Process an uploaded image into 3 versions: original, display (1800px WebP), thumbnail (500px WebP).
     *
     * @return array{original_path: string, display_path: string, thumb_path: string}
     */
    public function process(UploadedFile $file, string $folder): array
    {
        $uniqueId = uniqid();

        // 1. Store original untouched
        $originalName = $uniqueId . '.' . $file->getClientOriginalExtension();
        $originalPath = $file->storeAs("{$folder}/originals", $originalName, 'public');

        $absolutePath = Storage::disk('public')->path($originalPath);

        // 2. Generate display version (1800px wide, 85% quality, WebP)
        $displayName = $uniqueId . '.webp';
        $displayDir = "{$folder}/display";
        Storage::disk('public')->makeDirectory($displayDir);

        $displayImage = Image::read($absolutePath);
        $displayImage->scaleDown(width: 1800);
        $displayPath = "{$displayDir}/{$displayName}";
        Storage::disk('public')->put($displayPath, $displayImage->toWebp(quality: 85)->toString());

        // 3. Generate thumbnail (500px wide, 80% quality, WebP)
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
