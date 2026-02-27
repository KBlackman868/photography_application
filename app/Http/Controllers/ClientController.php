<?php

namespace App\Http\Controllers;

use App\Models\ClientProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

/**
 * Client Management Controller
 *
 * Manages the studio's client database. Every photography business revolves around
 * its clients -- this controller lets the photographer add new clients, view their
 * full history (projects, galleries, bookings, invoices), and keep contact details
 * and notes up to date.
 */
class ClientController extends Controller
{
    /**
     * List all clients for this studio.
     * Shows each client with their profile details and a preview of their
     * most recent projects, so the photographer can quickly find who they
     * need and see how active each client relationship is.
     */
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

    /**
     * Show a single client's full profile and history.
     * This is the "client file" -- everything the photographer needs to know
     * about this client in one place: their contact info, all projects and
     * galleries, booking history with packages, and invoices.
     */
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

    /**
     * Create a new client account.
     * The photographer adds clients manually (rather than clients self-registering)
     * so the studio stays in control of who has access. A random password is
     * generated -- the client will reset it when they first log in.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:2000',
        ]);

        // Create the user account with a random password and the "client" role
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => bcrypt(Str::random(16)),
            'studio_id' => $request->user()->studio_id,
            'role' => 'client',
        ]);

        // Store extra client details (company, internal notes) in the profile
        ClientProfile::create([
            'user_id' => $user->id,
            'studio_id' => $request->user()->studio_id,
            'company' => $validated['company'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('clients.index')->with('success', 'Client created.');
    }

    /**
     * Update an existing client's details.
     * Core user fields (name, email, phone) live on the User model, while
     * business-specific fields (company, notes) live on the ClientProfile.
     * Both are updated in a single request for a smooth editing experience.
     */
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
