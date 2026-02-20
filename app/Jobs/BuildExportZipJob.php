<?php

namespace App\Jobs;

use App\Models\ExportJob;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class BuildExportZipJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public int $timeout = 600;

    public function __construct(public ExportJob $exportJob) {}

    public function handle(): void
    {
        $this->exportJob->markProcessing();

        try {
            $gallery = $this->exportJob->gallery;
            $photos = $gallery->photos;

            $exportDir = "exports/{$gallery->id}";
            Storage::disk('public')->makeDirectory($exportDir);

            $zipFilename = "{$exportDir}/export_{$this->exportJob->id}.zip";
            $zipPath = Storage::disk('public')->path($zipFilename);

            $zip = new ZipArchive;
            if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
                throw new \RuntimeException('Cannot create zip file');
            }

            foreach ($photos as $photo) {
                $sourcePath = match ($this->exportJob->type) {
                    'zip_originals' => $photo->original_path,
                    'zip_previews' => $photo->preview_path ?? $photo->original_path,
                    default => $photo->preview_path ?? $photo->original_path,
                };

                $fullPath = Storage::disk('public')->path($sourcePath);
                if (file_exists($fullPath)) {
                    $zip->addFile($fullPath, $photo->filename);
                }
            }

            // For selection_list or lightroom_csv, add a CSV
            if (in_array($this->exportJob->type, ['lightroom_csv', 'selection_list', 'editing_brief'])) {
                $csv = $this->generateCsv($gallery);
                $zip->addFromString('selection.csv', $csv);
            }

            $zip->close();

            $fileSize = file_exists($zipPath) ? filesize($zipPath) : 0;
            $this->exportJob->markCompleted($zipFilename, $fileSize);

            Log::info("Export completed: {$this->exportJob->id}");
        } catch (\Exception $e) {
            Log::error("Export failed: {$this->exportJob->id}: {$e->getMessage()}");
            $this->exportJob->markFailed($e->getMessage());
            throw $e;
        }
    }

    private function generateCsv($gallery): string
    {
        $selection = $gallery->selections()->with('photos')->first();
        $photos = $selection ? $selection->photos : $gallery->photos;

        $lines = ["Filename,Rating,Color Label,Favorites,Comments,Retouching Notes"];

        foreach ($photos as $photo) {
            $notes = $photo->pivot->retouching_notes ?? '';
            $lines[] = implode(',', [
                $photo->filename,
                $photo->rating ?? '',
                $photo->color_label ?? '',
                $photo->favorites_count,
                $photo->comments_count,
                '"'.str_replace('"', '""', $notes).'"',
            ]);
        }

        return implode("\n", $lines);
    }
}
