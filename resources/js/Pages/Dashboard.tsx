import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Gallery, Project, PageProps } from '@/types';

interface BookingData {
    id: number;
    status: string;
    session_date?: string;
    location?: string;
    notes?: string;
    total_amount?: string;
    package?: { name: string; type: string } | null;
    client?: { id: number; name: string } | null;
}

interface Props extends PageProps {
    recentProjects?: Project[];
    recentBookings?: BookingData[];
    upcomingBookings?: BookingData[];
    galleries?: Gallery[];
    stats?: {
        total_projects: number;
        active_galleries: number;
        pending_reviews: number;
        total_bookings: number;
        upcoming_sessions: number;
        pending_inquiries: number;
    };
    isAdmin: boolean;
}

function extractFromNotes(notes: string | undefined, field: string): string {
    if (!notes) return '';
    const match = notes.match(new RegExp(`${field}:\\s*(.+)`, 'i'));
    return match ? match[1].trim() : '';
}

const STATUS_COLORS: Record<string, string> = {
    inquiry: 'bg-amber-100 text-amber-700',
    quoted: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-green-100 text-green-700',
    deposit_paid: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-red-100 text-red-600',
    booked: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-amber-100 text-amber-700',
    delivered: 'bg-green-100 text-green-700',
    archived: 'bg-slate-100 text-slate-500',
};

export default function Dashboard({ auth, recentProjects, recentBookings, upcomingBookings, galleries, stats, isAdmin }: Props) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-6">
                    {/* Welcome */}
                    <div className="mb-8">
                        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">
                            Welcome back, {auth.user.name}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {isAdmin
                                ? "Here's an overview of your business."
                                : 'Here are your galleries and selections.'}
                        </p>
                    </div>

                    {isAdmin && stats && (
                        <>
                            {/* Stats cards - 6 cards in 2 rows */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                            <span className="material-symbols-outlined">folder</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{stats.total_projects}</p>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Projects</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                                            <span className="material-symbols-outlined">photo_library</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{stats.active_galleries}</p>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Active Galleries</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                            <span className="material-symbols-outlined">rate_review</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{stats.pending_reviews}</p>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Pending Reviews</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                            <span className="material-symbols-outlined">calendar_month</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{stats.total_bookings}</p>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Total Bookings</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <span className="material-symbols-outlined">event_upcoming</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{stats.upcoming_sessions}</p>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Upcoming</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                                            <span className="material-symbols-outlined">pending_actions</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{stats.pending_inquiries}</p>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Inquiries</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Two-column layout: Recent Bookings + Upcoming Sessions */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                                {/* Recent Bookings */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold">Recent Booking Inquiries</h3>
                                        <Link href="/bookings" className="text-sm text-primary hover:underline font-medium">
                                            View all
                                        </Link>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                                        {recentBookings && recentBookings.length > 0 ? (
                                            recentBookings.map((booking) => (
                                                <div key={booking.id} className="p-4 flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-semibold text-sm">
                                                            {extractFromNotes(booking.notes, 'Name') || `Booking #${booking.id}`}
                                                        </h4>
                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                            {extractFromNotes(booking.notes, 'Session Type') || 'General'} &middot;{' '}
                                                            {booking.session_date
                                                                ? new Date(booking.session_date).toLocaleDateString()
                                                                : 'No date'}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${STATUS_COLORS[booking.status] || 'bg-slate-100 text-slate-600'}`}>
                                                        {booking.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-slate-400 text-sm">
                                                No booking inquiries yet.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Upcoming Sessions */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold">Upcoming Sessions</h3>
                                        <Link href="/bookings/calendar" className="text-sm text-primary hover:underline font-medium">
                                            Calendar
                                        </Link>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                                        {upcomingBookings && upcomingBookings.length > 0 ? (
                                            upcomingBookings.map((booking) => (
                                                <div key={booking.id} className="p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-sm">event</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-sm">
                                                                {extractFromNotes(booking.notes, 'Name') || `Booking #${booking.id}`}
                                                            </h4>
                                                            <p className="text-xs text-slate-500 mt-0.5">
                                                                {booking.session_date
                                                                    ? new Date(booking.session_date).toLocaleDateString('en-US', {
                                                                        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                                                                    })
                                                                    : 'TBD'}{' '}
                                                                &middot; {booking.location || 'TBD'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${STATUS_COLORS[booking.status] || 'bg-slate-100 text-slate-600'}`}>
                                                        {booking.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-slate-400 text-sm">
                                                No upcoming sessions.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Recent projects */}
                            {recentProjects && recentProjects.length > 0 && (
                                <div className="mb-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold">Recent Projects</h3>
                                        <Link
                                            href="/projects"
                                            className="text-sm text-primary hover:underline font-medium"
                                        >
                                            View all
                                        </Link>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                                        {recentProjects.map((project) => (
                                            <div key={project.id} className="p-4 flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold">{project.name}</h4>
                                                    <p className="text-sm text-slate-500">
                                                        {project.type} &middot;{' '}
                                                        {project.client?.name || 'No client'}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${STATUS_COLORS[project.status] || 'bg-slate-100 text-slate-600'}`}
                                                >
                                                    {project.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Client view: galleries */}
                    {!isAdmin && galleries && (
                        <div>
                            <h3 className="font-bold mb-4">Your Galleries</h3>
                            {galleries.length === 0 ? (
                                <div className="text-center py-16 text-slate-400">
                                    <span className="material-symbols-outlined text-5xl mb-4 block">
                                        photo_library
                                    </span>
                                    <p>No galleries available yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {galleries.map((gallery: any) => (
                                        <Link
                                            key={gallery.id}
                                            href={`/galleries/${gallery.id}`}
                                            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all"
                                        >
                                            <div className="aspect-[16/10] bg-slate-100 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-4xl text-slate-300">
                                                    photo_library
                                                </span>
                                            </div>
                                            <div className="p-4">
                                                <h4 className="font-bold">{gallery.name}</h4>
                                                <p className="text-sm text-slate-500 mt-0.5">
                                                    {gallery.photo_count} photos
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quick links for admin */}
                    {isAdmin && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[
                                { href: '/galleries/create', label: 'New Gallery', icon: 'add_photo_alternate' },
                                { href: '/bookings/calendar', label: 'Calendar', icon: 'calendar_month' },
                                { href: '/clients', label: 'Clients', icon: 'people' },
                                { href: '/portfolios', label: 'Portfolios', icon: 'collections' },
                                { href: '/settings', label: 'Settings', icon: 'settings' },
                            ].map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/30 hover:shadow-sm transition-all"
                                >
                                    <span className="material-symbols-outlined text-primary">
                                        {link.icon}
                                    </span>
                                    <span className="font-medium text-sm">{link.label}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
