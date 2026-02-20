<?php

namespace App\Http\Controllers;

use App\Models\ClientProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $clients = User::where('studio_id', $request->user()->studio_id)
            ->where('role', 'client')
            ->with(['clientProfile', 'projects' => fn ($q) => $q->latest()->take(3)])
            ->withCount('projects')
            ->paginate(20);

        return Inertia::render('Clients/Index', [
            'clients' => $clients,
        ]);
    }

    public function show(Request $request, User $client)
    {
        $client->load([
            'clientProfile',
            'projects.galleries',
            'bookings.package',
            'invoices',
        ]);

        return Inertia::render('Clients/Show', [
            'client' => $client,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:2000',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => bcrypt(Str::random(16)),
            'studio_id' => $request->user()->studio_id,
            'role' => 'client',
        ]);

        ClientProfile::create([
            'user_id' => $user->id,
            'studio_id' => $request->user()->studio_id,
            'company' => $validated['company'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('clients.index')->with('success', 'Client created.');
    }

    public function update(Request $request, User $client)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,'.$client->id,
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:2000',
        ]);

        $client->update(collect($validated)->only(['name', 'email', 'phone'])->toArray());

        if ($client->clientProfile) {
            $client->clientProfile->update(collect($validated)->only(['company', 'notes'])->toArray());
        }

        return back()->with('success', 'Client updated.');
    }
}
