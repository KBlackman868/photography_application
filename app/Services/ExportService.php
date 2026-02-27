<?php

namespace App\Services;

use App\Jobs\BuildExportZipJob;
use App\Models\ExportJob;
use App\Models\Gallery;
use App\Models\User;

/**
 * Handles creating downloadable packages of gallery photos -- for example when a
 * client wants to download their selected images or the photographer needs to
 * export a full gallery. The actual zip file is built in a background job so
 * the user does not have to wait.
 */
class ExportService
{
    /**
     * Kick off an export request. Creates a tracking record and dispatches a
     * background job to assemble the zip file. The client can check back for the
     * download link once the job finishes. Activity is logged for audit purposes.
     */
    public function createExport(Gallery $gallery, User $user, string $type): ExportJob
    {
        $photoCount = $gallery->photos()->count();

        $exportJob = ExportJob::create([
            'gallery_id' => $gallery->id,
            'user_id' => $user->id,
            'type' => $type,
            'status' => 'pending',
            'photo_count' => $photoCount,
        ]);

        BuildExportZipJob::dispatch($exportJob);

        activity()
            ->causedBy($user)
            ->performedOn($gallery)
            ->withProperties(['export_type' => $type, 'photo_count' => $photoCount])
            ->log('export_created');

        return $exportJob;
    }

    /**
     * Retrieve all current exports for a gallery that are still valid --
     * pending, in progress, or completed but not yet expired. This lets the
     * frontend show download links for recently completed exports.
     */
    public function getActiveExports(Gallery $gallery): \Illuminate\Database\Eloquent\Collection
    {
        return $gallery->exportJobs()
            ->whereIn('status', ['pending', 'processing', 'completed'])
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->orderByDesc('created_at')
            ->get();
    }
}
