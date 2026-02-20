<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Gallery;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return $this->adminDashboard($user);
        }

        return $this->clientDashboard($user);
    }

    private function adminDashboard($user)
    {
        $studioId = $user->studio_id;

        $recentProjects = Project::where('studio_id', $studioId)
            ->with('client')
            ->latest()
            ->take(5)
            ->get();

        $recentBookings = Booking::where('studio_id', $studioId)
            ->latest('created_at')
            ->take(5)
            ->get();

        $upcomingBookings = Booking::where('studio_id', $studioId)
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->where('session_date', '>=', now())
            ->orderBy('session_date')
            ->take(5)
            ->get();

        $stats = [
            'total_projects' => Project::where('studio_id', $studioId)->count(),
            'active_galleries' => Gallery::where('studio_id', $studioId)->whereIn('status', ['published', 'review'])->count(),
            'pending_reviews' => Gallery::where('studio_id', $studioId)->where('status', 'review')->count(),
            'total_bookings' => Booking::where('studio_id', $studioId)->count(),
            'upcoming_sessions' => Booking::where('studio_id', $studioId)
                ->whereNotIn('status', ['cancelled', 'completed'])
                ->where('session_date', '>=', now())
                ->count(),
            'pending_inquiries' => Booking::where('studio_id', $studioId)->where('status', 'inquiry')->count(),
        ];

        return Inertia::render('Dashboard', [
            'recentProjects' => $recentProjects,
            'recentBookings' => $recentBookings,
            'upcomingBookings' => $upcomingBookings,
            'stats' => $stats,
            'isAdmin' => true,
        ]);
    }

    private function clientDashboard($user)
    {
        $galleries = Gallery::whereHas('project', fn ($q) => $q->where('client_user_id', $user->id))
            ->with('project')
            ->whereIn('status', ['published', 'review', 'approved'])
            ->latest()
            ->get();

        return Inertia::render('Dashboard', [
            'galleries' => $galleries,
            'isAdmin' => false,
        ]);
    }
}
