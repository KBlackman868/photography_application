<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

/**
 * Photography Project Controller
 *
 * A "project" represents a photography shoot or engagement -- wedding, portrait
 * session, commercial shoot, etc. Projects are the central organizing unit that
 * ties together clients, galleries, and the overall workflow from initial inquiry
 * through final delivery.
 */
class ProjectController extends Controller
{
    /**
     * List all projects for the studio.
     * Shows each project with its assigned client and galleries, giving the
     * photographer a clear picture of their workload and project pipeline.
     */
    public function index(Request $request)
    {
        $projects = Project::where('studio_id', $request->user()->studio_id)
            ->with(['client', 'galleries'])
            ->withCount('galleries')
            ->latest()
            ->paginate(20);

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
        ]);
    }

    /**
     * Create a new photography project.
     * Supports all common shoot types: wedding, portrait, event, commercial,
     * newborn, engagement, and other. A URL-friendly slug is auto-generated
     * with a random suffix to avoid collisions (e.g., two "Smith Wedding" projects).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'client_user_id' => 'nullable|exists:users,id',
            'type' => 'required|in:wedding,portrait,event,commercial,newborn,engagement,other',
            'description' => 'nullable|string|max:2000',
            'shoot_date' => 'nullable|date',
            'location' => 'nullable|string|max:255',
        ]);

        Project::create([
            ...$validated,
            'studio_id' => $request->user()->studio_id,
            'slug' => Str::slug($validated['name']).'-'.Str::random(6),
        ]);

        return redirect()->route('projects.index')->with('success', 'Project created.');
    }

    /**
     * Update a project's details or advance its status.
     * The status lifecycle tracks the project from first contact to final delivery:
     * inquiry -> booked -> in_progress -> delivered -> completed -> archived.
     * This helps the photographer manage their workflow at a glance.
     */
    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:inquiry,booked,in_progress,delivered,completed,archived',
            'description' => 'nullable|string|max:2000',
            'shoot_date' => 'nullable|date',
            'location' => 'nullable|string|max:255',
        ]);

        $project->update($validated);

        return back()->with('success', 'Project updated.');
    }

    /**
     * Delete a project.
     * Use with care -- this removes the project record. Associated galleries
     * may need to be handled separately depending on cascade settings.
     */
    public function destroy(Project $project)
    {
        $project->delete();

        return redirect()->route('projects.index')->with('success', 'Project deleted.');
    }
}
