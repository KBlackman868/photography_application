<?php

use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\GalleryProgressController;
use App\Http\Controllers\Api\PhotoCommentController;
use App\Http\Controllers\Api\PhotoController;
use App\Http\Controllers\Api\PhotoFavoriteController;
use App\Http\Controllers\Api\PhotoSelectionController;
use Illuminate\Support\Facades\Route;

// All API routes require authentication via Sanctum
Route::middleware(['auth:sanctum'])->group(function () {
    // Photos
    Route::get('/galleries/{gallery}/photos', [PhotoController::class, 'index']);
    Route::post('/galleries/{gallery}/photos/upload', [PhotoController::class, 'upload']);
    Route::put('/photos/{photo}', [PhotoController::class, 'update']);
    Route::post('/galleries/{gallery}/photos/batch', [PhotoController::class, 'batchUpdate']);
    Route::delete('/photos/{photo}', [PhotoController::class, 'destroy']);

    // Comments
    Route::get('/photos/{photo}/comments', [PhotoCommentController::class, 'index']);
    Route::post('/photos/{photo}/comments', [PhotoCommentController::class, 'store']);
    Route::put('/comments/{comment}', [PhotoCommentController::class, 'update']);
    Route::delete('/comments/{comment}', [PhotoCommentController::class, 'destroy']);
    Route::post('/comments/{comment}/resolve', [PhotoCommentController::class, 'resolve']);
    Route::post('/comments/{comment}/unresolve', [PhotoCommentController::class, 'unresolve']);

    // Favorites
    Route::post('/photos/{photo}/favorite', [PhotoFavoriteController::class, 'toggle']);

    // Selection
    Route::post('/galleries/{gallery}/selection/toggle', [PhotoSelectionController::class, 'togglePhoto']);
    Route::post('/galleries/{gallery}/selection/submit', [PhotoSelectionController::class, 'submit']);
    Route::post('/galleries/{gallery}/selection/approve', [PhotoSelectionController::class, 'approve']);
    Route::get('/galleries/{gallery}/selection/status', [PhotoSelectionController::class, 'status']);

    // Progress
    Route::get('/galleries/{gallery}/progress', GalleryProgressController::class);

    // Exports
    Route::post('/galleries/{gallery}/exports', [ExportController::class, 'create']);
    Route::get('/galleries/{gallery}/exports', [ExportController::class, 'index']);
    Route::get('/exports/{exportJob}/status', [ExportController::class, 'status']);
});
