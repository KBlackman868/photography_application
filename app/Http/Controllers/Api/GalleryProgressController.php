<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use App\Services\GalleryProgressService;
use Illuminate\Http\Request;

class GalleryProgressController extends Controller
{
    public function __construct(private GalleryProgressService $progressService) {}

    public function __invoke(Request $request, Gallery $gallery)
    {
        $progress = $this->progressService->calculate($gallery);
        $selectionProgress = $this->progressService->selectionProgress($gallery, $request->user()->id);

        return response()->json([
            'comments' => $progress,
            'selection' => $selectionProgress,
        ]);
    }
}
