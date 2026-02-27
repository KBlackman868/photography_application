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

/**
 * Handles the upload pipeline when the photographer adds new photos to a gallery.
 * Stores the original file immediately, creates the database record, then kicks off
 * background jobs for the heavier processing (thumbnails, web previews, EXIF extraction)
 * so the upload feels instant even with large batches.
 */
class PhotoIngestService
{
    /**
     * Process a single uploaded photo: save the original, create the database record,
     * and dispatch background jobs for thumbnail generation, web-sized preview creation,
     * and EXIF metadata extraction (camera model, lens, settings, etc.).
     */
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

        // Dispatch background processing so the upload returns quickly
        GenerateThumbnailsJob::dispatch($photo);    // Creates the 500px grid thumbnail
        GenerateWebPreviewJob::dispatch($photo);     // Creates the 1800px gallery viewing version
        ExtractExifJob::dispatch($photo);            // Reads camera/lens/settings metadata from the file

        // Update gallery photo count
        $gallery->increment('photo_count');

        return $photo;
    }

    /**
     * Upload multiple photos at once -- used when the photographer drags a batch
     * of files into a gallery. Each photo goes through the same ingest pipeline.
     */
    public function ingestBatch(array $files, Gallery $gallery, User $uploader): array
    {
        $photos = [];
        foreach ($files as $file) {
            $photos[] = $this->ingest($file, $gallery, $uploader);
        }

        return $photos;
    }
}
