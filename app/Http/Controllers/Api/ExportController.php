<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExportJob;
use App\Models\Gallery;
use App\Services\ExportService;
use Illuminate\Http\Request;

class ExportController extends Controller
{
    public function __construct(private ExportService $exportService) {}

    public function create(Request $request, Gallery $gallery)
    {
        $user = $request->user();

        if (! $user->isAdmin() && ! $user->isEditor()) {
            abort(403);
        }

        $validated = $request->validate([
            'type' => 'required|in:zip_originals,zip_previews,lightroom_csv,editing_brief,selection_list',
        ]);

        $exportJob = $this->exportService->createExport($gallery, $user, $validated['type']);

        return response()->json([
            'id' => $exportJob->id,
            'status' => $exportJob->status,
            'type' => $exportJob->type,
            'message' => 'Export queued.',
        ]);
    }

    public function status(ExportJob $exportJob)
    {
        return response()->json([
            'id' => $exportJob->id,
            'status' => $exportJob->status,
            'type' => $exportJob->type,
            'file_path' => $exportJob->status === 'completed' ? asset('storage/'.$exportJob->file_path) : null,
            'file_size' => $exportJob->file_size,
            'error_message' => $exportJob->error_message,
            'expires_at' => $exportJob->expires_at?->toISOString(),
        ]);
    }

    public function index(Request $request, Gallery $gallery)
    {
        $exports = $this->exportService->getActiveExports($gallery);

        return response()->json($exports);
    }
}
