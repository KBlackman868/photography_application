<?php

namespace App\Http\Controllers;

use App\Http\Resources\GalleryResource;
use App\Models\Gallery;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

/**
 * Photo Gallery Controller
 *
 * Galleries are how photographers deliver photos to their clients. Each gallery
 * belongs to a project and contains the curated photos from a shoot. The gallery
 * system supports a full workflow: draft (uploading/editing), published (client
 * can view), review (client is selecting favorites), approved (selections finalized),
 * and archived (project complete).
 *
 * Access control is key here -- admins see everything in their studio, while
 * clients only see galleries that have been explicitly shared with them.
 */
class GalleryController extends Controller
{
    /**
     * List galleries with role-based filtering.
     * Admins see all galleries across their studio (including drafts and archives).
     * Clients only see galleries from their own projects that are ready for viewing --
     * this prevents them from seeing incomplete work or other clients' photos.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Gallery::with(['project.client']);

        if ($user->isAdmin()) {
            // Admins see every gallery in their studio, regardless of status
            $query->where('studio_id', $user->studio_id);
        } else {
            // Clients only see galleries for their own projects, and only
            // those that are published, in review, or approved
            $query->whereHas('project', fn ($q) => $q->where('client_user_id', $user->id));
            $query->whereIn('status', ['published', 'review', 'approved']);
        }

        $galleries = $query->latest()->paginate(12);

        return Inertia::render('Galleries/Index', [
            'galleries' => GalleryResource::collection($galleries),
        ]);
    }

    /**
     * Show a single gallery with its photos.
     * Loads only visible photos (hidden/rejected photos are excluded), along
     * with the current user's favorites and comment/favorite counts per photo.
     * Photos are paginated at 50 to keep large galleries performant.
     */
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

    /**
     * Show the gallery creation form.
     * Loads the studio's projects so the photographer can assign the new
     * gallery to the right shoot/client.
     */
    public function create(Request $request)
    {
        $projects = Project::where('studio_id', $request->user()->studio_id)
            ->with('client')
            ->get();

        return Inertia::render('Galleries/Create', [
            'projects' => $projects,
        ]);
    }

    /**
     * Create a new gallery for a project.
     * The photographer can configure client permissions at creation time:
     * whether clients can download originals, mark favorites, or leave comments.
     * A selection_limit caps how many photos the client can pick (useful for
     * packages that include a set number of edited images). A unique share_token
     * is generated for shareable gallery links.
     */
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

    /**
     * Update gallery settings or advance its status.
     * Status transitions control the client experience:
     *   draft -> published (client can view) -> review (client selects photos)
     *   -> approved (selections locked in) -> archived (done)
     * Permissions (downloads, favorites, comments) can be toggled at any time.
     */
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

    /**
     * Delete a gallery and its associated data.
     */
    public function destroy(Gallery $gallery)
    {
        $gallery->delete();

        return redirect()->route('galleries.index')
            ->with('success', 'Gallery deleted.');
    }

    /**
     * Verify the current user is allowed to view this gallery.
     * Three roles can access a gallery:
     *   1. Admin of the same studio -- full access to manage everything
     *   2. Editor of the same studio -- can help manage photos
     *   3. The client who owns the project -- can view their own photos
     * Everyone else gets a 403 to protect client privacy.
     */
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
