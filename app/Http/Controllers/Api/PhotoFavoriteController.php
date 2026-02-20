<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Photo;
use Illuminate\Http\Request;

class PhotoFavoriteController extends Controller
{
    public function toggle(Request $request, Photo $photo)
    {
        $user = $request->user();
        $gallery = $photo->gallery;

        if (! $gallery->allow_favorites) {
            abort(403, 'Favorites are disabled for this gallery.');
        }

        $existing = $photo->favorites()->where('user_id', $user->id)->first();

        if ($existing) {
            $existing->delete();
            $photo->decrement('favorites_count');
            $isFavorited = false;
        } else {
            $photo->favorites()->create(['user_id' => $user->id]);
            $photo->increment('favorites_count');
            $isFavorited = true;
        }

        activity()
            ->causedBy($user)
            ->performedOn($photo)
            ->withProperties(['favorited' => $isFavorited])
            ->log($isFavorited ? 'photo_favorited' : 'photo_unfavorited');

        return response()->json([
            'is_favorited' => $isFavorited,
            'favorites_count' => $photo->fresh()->favorites_count,
        ]);
    }
}
