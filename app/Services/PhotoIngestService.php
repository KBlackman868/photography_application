<?php

namespace App\Services;

use App\Jobs\ExtractExifJob;
use App\Jobs\GenerateThumbnailsJob;
use App\Jobs\GenerateWebPreviewJob;
use App\Models\Gallery;
use App\Models\Photo;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PhotoIngestService
{
    public function ingest(UploadedFile $file, Gallery $gallery, User $uploader): Photo
    {
        $filename = $file->getClientOriginalName();
        $basePath = "galleries/{$gallery->id}";
        $uniqueName = Str::uuid().'.'.$file->getClientOriginalExtension();

        // Store original
        $originalPath = $file->storeAs("{$basePath}/originals", $uniqueName, 'public');

        $photo = Photo::create([
            'gallery_id' => $gallery->id,
            'uploaded_by' => $uploader->id,
            'filename' => $filename,
            'original_path' => $originalPath,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'sort_order' => $gallery->photos()->count(),
        ]);

        // Dispatch processing jobs
        GenerateThumbnailsJob::dispatch($photo);
        GenerateWebPreviewJob::dispatch($photo);
        ExtractExifJob::dispatch($photo);

        // Update gallery photo count
        $gallery->increment('photo_count');

        return $photo;
    }

    public function ingestBatch(array $files, Gallery $gallery, User $uploader): array
    {
        $photos = [];
        foreach ($files as $file) {
            $photos[] = $this->ingest($file, $gallery, $uploader);
        }

        return $photos;
    }
}
