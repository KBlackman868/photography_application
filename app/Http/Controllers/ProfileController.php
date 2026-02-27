<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * User Profile Controller
 *
 * Manages personal account settings for both photographers and clients.
 * Users can update their name, email, and avatar -- the avatar appears
 * throughout the app in comments, activity logs, and the navigation bar,
 * giving a personal touch to all interactions.
 */
class ProfileController extends Controller
{
    /**
     * Show the profile editing form.
     * If the user's email requires verification (e.g., after changing it),
     * the view will display a verification notice.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's name and email.
     * If the email address changes, the verification status is reset so the
     * user must re-verify their new email. This protects against typos and
     * ensures the studio can always reach the user.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Upload or replace the user's avatar photo.
     * The old avatar is deleted from storage to avoid accumulating orphaned
     * files. Accepts common image formats up to 5MB.
     */
    public function updateAvatar(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $user = $request->user();

        // Clean up the old avatar file to save storage space
        if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar_path' => $path]);

        return Redirect::route('profile.edit')->with('status', 'Avatar updated successfully.');
    }

    /**
     * Permanently delete the user's account.
     * Requires the current password as confirmation to prevent accidental
     * deletion. Logs the user out and invalidates their session before
     * removing the account, then redirects to the public landing page.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
