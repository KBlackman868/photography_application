<?php

namespace App\Http\Controllers;

use App\Http\Resources\GalleryResource;
use App\Models\Gallery;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class GalleryController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Gallery::with(['project.client']);

        if ($user->isAdmin()) {
            $query->where('studio_id', $user->studio_id);
        } else {
            $query->whereHas('project', fn ($q) => $q->where('client_user_id', $user->id));
            $query->whereIn('status', ['published', 'review', 'approved']);
        }

        $galleries = $query->latest()->paginate(12);

        return Inertia::render('Galleries/Index', [
            'galleries' => GalleryResource::collection($galleries),
        ]);
    }

    public function show(Request $request, Gallery $gallery)
    {
        $user = $request->user();
        $this->authorizeGalleryAccess($user, $gallery);

        $gallery->load(['project.client']);

        $photos = $gallery->photos()
            ->visible()
            ->with(['favorites' => fn ($q) => $q->where('user_id', $user->id)])
            ->withCount(['comments', 'favorites'])
            ->orderBy('sort_order')
            ->paginate(50);

        return Inertia::render('Galleries/Show', [
            'gallery' => new GalleryResource($gallery),
            'photos' => \App\Http\Resources\PhotoResource::collection($photos),
        ]);
    }

    public function create(Request $request)
    {
        $projects = Project::where('studio_id', $request->user()->studio_id)
            ->with('client')
            ->get();

        return Inertia::render('Galleries/Create', [
            'projects' => $projects,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'project_id' => 'required|exists:projects,id',
            'description' => 'nullable|string|max:2000',
            'selection_limit' => 'nullable|integer|min:1',
            'allow_downloads' => 'boolean',
            'allow_favorites' => 'boolean',
            'allow_comments' => 'boolean',
        ]);

        $gallery = Gallery::create([
            ...$validated,
            'studio_id' => $request->user()->studio_id,
            'slug' => Str::slug($validated['name']).'-'.Str::random(6),
            'share_token' => Str::random(32),
        ]);

        return redirect()->route('galleries.show', $gallery)
            ->with('success', 'Gallery created.');
    }

    public function update(Request $request, Gallery $gallery)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:2000',
            'status' => 'sometimes|in:draft,published,review,approved,archived',
            'selection_limit' => 'nullable|integer|min:1',
            'allow_downloads' => 'sometimes|boolean',
            'allow_favorites' => 'sometimes|boolean',
            'allow_comments' => 'sometimes|boolean',
            'is_public' => 'sometimes|boolean',
        ]);

        $gallery->update($validated);

        return back()->with('success', 'Gallery updated.');
    }

    public function destroy(Gallery $gallery)
    {
        $gallery->delete();

        return redirect()->route('galleries.index')
            ->with('success', 'Gallery deleted.');
    }

    private function authorizeGalleryAccess($user, Gallery $gallery): void
    {
        if ($user->isAdmin() && $user->studio_id === $gallery->studio_id) {
            return;
        }
        if ($user->isEditor() && $user->studio_id === $gallery->studio_id) {
            return;
        }
        if ($gallery->project->client_user_id === $user->id) {
            return;
        }
        abort(403);
    }
}
