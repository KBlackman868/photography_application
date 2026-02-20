<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProjectController extends Controller
{
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

    public function destroy(Project $project)
    {
        $project->delete();

        return redirect()->route('projects.index')->with('success', 'Project deleted.');
    }
}
