<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Gallery;
use App\Models\Photo;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

/**
 * Main Dashboard Controller
 *
 * The hub of the photography studio application. Admins get a bird's-eye view
 * of their entire business -- projects, bookings, photo uploads, and recent
 * activity -- so they can see at a glance what needs attention. Clients get
 * a simpler view focused on the galleries that have been shared with them.
 */
class DashboardController extends Controller
{
    /**
     * Route the logged-in user to the right dashboard experience.
     * Admins and clients have very different needs, so they each
     * get a tailored view of the data that matters to them.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return $this->adminDashboard($user);
        }

        return $this->clientDashboard($user);
    }

    /**
     * Build the admin dashboard with business-critical metrics and recent activity.
     * This gives the photographer a quick overview of their workload, pending client
     * reviews, upcoming sessions, and how their photo library is growing over time.
     */
    private function adminDashboard($user)
    {
        $studioId = $user->studio_id;

        // The most recent projects help the photographer pick up where they left off
        $recentProjects = Project::where('studio_id', $studioId)
            ->with('client')
            ->latest()
            ->take(5)
            ->get();

        // Recent booking inquiries so new leads are never missed
        $recentBookings = Booking::where('studio_id', $studioId)
            ->latest('created_at')
            ->take(5)
            ->get();

        // Upcoming sessions the photographer needs to prepare for
        $upcomingBookings = Booking::where('studio_id', $studioId)
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->where('session_date', '>=', now())
            ->orderBy('session_date')
            ->take(5)
            ->get();

        // Key business metrics displayed as stat cards on the dashboard
        $stats = [
            'total_projects' => Project::where('studio_id', $studioId)->count(),
            'total_photos' => Photo::whereHas('gallery', fn ($q) => $q->where('studio_id', $studioId))->count(),
            'active_galleries' => Gallery::where('studio_id', $studioId)->whereIn('status', ['published', 'review'])->count(),
            // Pending reviews require the photographer's attention -- clients are waiting for these
            'pending_reviews' => Gallery::where('studio_id', $studioId)->where('status', 'review')->count(),
            'total_bookings' => Booking::where('studio_id', $studioId)->count(),
            'upcoming_sessions' => Booking::where('studio_id', $studioId)
                ->whereNotIn('status', ['cancelled', 'completed'])
                ->where('session_date', '>=', now())
                ->count(),
            // New inquiries that haven't been responded to yet
            'pending_inquiries' => Booking::where('studio_id', $studioId)->where('status', 'inquiry')->count(),
        ];

        // Uploads per month (last 12 months) -- powers the bar chart showing
        // how productive the studio has been. Handles both SQLite and MySQL.
        $driver = DB::getDriverName();
        $monthExpr = $driver === 'sqlite'
            ? "strftime('%Y-%m', created_at) as month"
            : "DATE_FORMAT(created_at, '%Y-%m') as month";

        $uploadsChart = Photo::whereHas('gallery', fn ($q) => $q->where('studio_id', $studioId))
            ->where('created_at', '>=', now()->subMonths(12))
            ->selectRaw("$monthExpr, COUNT(*) as count")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Gallery status breakdown -- powers a pie/donut chart so the photographer
        // can see how many galleries are in draft, review, published, etc.
        $galleryStatuses = Gallery::where('studio_id', $studioId)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();

        // Recent activity from Spatie activity log -- shows who did what
        // (e.g., "Admin uploaded photos", "Client left a comment")
        $recentActivity = Activity::where('causer_id', '!=', null)
            ->with('causer')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'description' => $a->description,
                'event' => $a->event,
                'subject_type' => class_basename($a->subject_type ?? ''),
                'causer_name' => $a->causer?->name ?? 'System',
                'created_at' => $a->created_at->toISOString(),
            ]);

        return Inertia::render('Dashboard', [
            'recentProjects' => $recentProjects,
            'recentBookings' => $recentBookings,
            'upcomingBookings' => $upcomingBookings,
            'stats' => $stats,
            'uploadsChart' => $uploadsChart,
            'galleryStatuses' => $galleryStatuses,
            'recentActivity' => $recentActivity,
            'isAdmin' => true,
        ]);
    }

    /**
     * Build the client dashboard -- a simple, focused view.
     * Clients only see galleries that have been shared with them (published,
     * in review, or approved). This keeps the experience clean and prevents
     * clients from seeing draft or archived work.
     */
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
