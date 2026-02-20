<?php

namespace App\Services;

use App\Jobs\BuildExportZipJob;
use App\Models\ExportJob;
use App\Models\Gallery;
use App\Models\User;

class ExportService
{
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
