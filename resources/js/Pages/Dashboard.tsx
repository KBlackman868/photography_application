import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Gallery, Project, PageProps } from '@/types';
import { useCountUp } from '@/hooks/useCountUp';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useTheme } from '@/hooks/useTheme';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

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

interface ActivityItem {
    id: number;
    description: string;
    event: string;
    subject_type: string;
    causer_name: string;
    created_at: string;
}

interface Props extends PageProps {
    recentProjects?: Project[];
    recentBookings?: BookingData[];
    upcomingBookings?: BookingData[];
    galleries?: Gallery[];
    stats?: {
        total_projects: number;
        total_photos: number;
        active_galleries: number;
        pending_reviews: number;
        total_bookings: number;
        upcoming_sessions: number;
        pending_inquiries: number;
    };
    uploadsChart?: { month: string; count: number }[];
    galleryStatuses?: { status: string; count: number }[];
    recentActivity?: ActivityItem[];
    isAdmin: boolean;
}

function extractFromNotes(notes: string | undefined, field: string): string {
    if (!notes) return '';
    const match = notes.match(new RegExp(`${field}:\\s*(.+)`, 'i'));
    return match ? match[1].trim() : '';
}

function timeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
    const years = Math.floor(months / 12);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
}

const STATUS_COLORS: Record<string, string> = {
    inquiry: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    quoted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    deposit_paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    completed: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    cancelled: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    booked: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    archived: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500',
};

const GALLERY_STATUS_COLORS: Record<string, string> = {
    draft: '#94a3b8',
    published: '#22c55e',
    review: '#f59e0b',
    approved: '#3b82f6',
    archived: '#6b7280',
};

const EVENT_ICONS: Record<string, { bg: string; color: string }> = {
    created: { bg: 'bg-green-100 dark:bg-green-900/30', color: 'text-green-600 dark:text-green-400' },
    updated: { bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' },
    deleted: { bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600 dark:text-red-400' },
};

function StatCard({
    value,
    label,
    subtitle,
    gradient,
    icon,
}: {
    value: number;
    label: string;
    subtitle: string;
    gradient: string;
    icon: React.ReactNode;
}) {
    const animatedValue = useCountUp(value);

    return (
        <div
            className={`relative overflow-hidden rounded-xl p-5 ${gradient} hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-3xl font-bold text-white tabular-nums">
                        {animatedValue.toLocaleString()}
                    </p>
                    <p className="text-sm font-semibold text-white/90 mt-1">{label}</p>
                    <p className="text-xs text-white/60 mt-0.5">{subtitle}</p>
                </div>
                <div className="text-white/20">{icon}</div>
            </div>
            {/* Decorative circle */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/5" />
        </div>
    );
}

export default function Dashboard({
    auth,
    recentProjects,
    recentBookings,
    upcomingBookings,
    galleries,
    stats,
    uploadsChart,
    galleryStatuses,
    recentActivity,
    isAdmin,
}: Props) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const statsRef = useScrollReveal();
    const chartsRef = useScrollReveal();
    const activityRef = useScrollReveal();
    const actionsRef = useScrollReveal();

    const safeUploadsChart = uploadsChart ?? [];
    const safeGalleryStatuses = galleryStatuses ?? [];
    const safeRecentActivity = recentActivity ?? [];
    const safeUpcomingBookings = upcomingBookings ?? [];
    const safeRecentBookings = recentBookings ?? [];

    return (
        <AuthenticatedLayout
            header={<h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-6">
                    {/* Welcome */}
                    <div className="mb-8 fade-up">
                        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">
                            Welcome back, {auth.user.name}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {isAdmin
                                ? "Here's an overview of your business."
                                : 'Here are your galleries and selections.'}
                        </p>
                    </div>

                    {isAdmin && (
                        <>
                            {/* ──────────────────────────────────────────────
                                Row 1: Animated Stats Cards
                            ────────────────────────────────────────────── */}
                            <div
                                ref={statsRef}
                                className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 fade-up"
                            >
                                <StatCard
                                    value={stats?.total_photos ?? 0}
                                    label="Total Photos"
                                    subtitle="photos uploaded"
                                    gradient="bg-gradient-to-br from-blue-600 to-indigo-700"
                                    icon={
                                        <svg
                                            className="w-12 h-12"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={1.5}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
                                            />
                                        </svg>
                                    }
                                />
                                <StatCard
                                    value={stats?.active_galleries ?? 0}
                                    label="Total Galleries"
                                    subtitle="active galleries"
                                    gradient="bg-gradient-to-br from-green-500 to-emerald-700"
                                    icon={
                                        <svg
                                            className="w-12 h-12"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={1.5}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z"
                                            />
                                        </svg>
                                    }
                                />
                                <StatCard
                                    value={stats?.pending_inquiries ?? 0}
                                    label="Pending Bookings"
                                    subtitle="awaiting response"
                                    gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                                    icon={
                                        <svg
                                            className="w-12 h-12"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={1.5}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                            />
                                        </svg>
                                    }
                                />
                                <StatCard
                                    value={stats?.upcoming_sessions ?? 0}
                                    label="Upcoming Sessions"
                                    subtitle="sessions scheduled"
                                    gradient="bg-gradient-to-br from-purple-600 to-violet-700"
                                    icon={
                                        <svg
                                            className="w-12 h-12"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={1.5}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                                            />
                                        </svg>
                                    }
                                />
                            </div>

                            {/* ──────────────────────────────────────────────
                                Row 2: Charts Side by Side
                            ────────────────────────────────────────────── */}
                            <div
                                ref={chartsRef}
                                className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 fade-up"
                            >
                                {/* Left: Uploads Over Time (AreaChart) */}
                                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">
                                        Uploads Over Time
                                    </h3>
                                    {safeUploadsChart.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <AreaChart data={safeUploadsChart}>
                                                <defs>
                                                    <linearGradient
                                                        id="colorUploads"
                                                        x1="0"
                                                        y1="0"
                                                        x2="0"
                                                        y2="1"
                                                    >
                                                        <stop
                                                            offset="5%"
                                                            stopColor="#d4af37"
                                                            stopOpacity={0.3}
                                                        />
                                                        <stop
                                                            offset="95%"
                                                            stopColor="#d4af37"
                                                            stopOpacity={0}
                                                        />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}
                                                />
                                                <XAxis
                                                    dataKey="month"
                                                    stroke={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
                                                    fontSize={12}
                                                    tick={{ fill: isDark ? '#94a3b8' : '#64748b' }}
                                                />
                                                <YAxis
                                                    stroke={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
                                                    fontSize={12}
                                                    tick={{ fill: isDark ? '#94a3b8' : '#64748b' }}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                                                        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                                                        borderRadius: '8px',
                                                        color: isDark ? '#f1f5f9' : '#1e293b',
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="count"
                                                    stroke="#d4af37"
                                                    fillOpacity={1}
                                                    fill="url(#colorUploads)"
                                                    strokeWidth={2}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm">
                                            No upload data available yet.
                                        </div>
                                    )}
                                </div>

                                {/* Right: Gallery Status Breakdown (PieChart) */}
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">
                                        Gallery Status
                                    </h3>
                                    {safeGalleryStatuses.length > 0 ? (
                                        <>
                                            <ResponsiveContainer width="100%" height={220}>
                                                <PieChart>
                                                    <Pie
                                                        data={safeGalleryStatuses}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={50}
                                                        outerRadius={80}
                                                        paddingAngle={4}
                                                        dataKey="count"
                                                        nameKey="status"
                                                    >
                                                        {safeGalleryStatuses.map((entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={
                                                                    GALLERY_STATUS_COLORS[entry.status] ??
                                                                    '#94a3b8'
                                                                }
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: isDark ? '#1e293b' : '#ffffff',
                                                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                                                            borderRadius: '8px',
                                                            color: isDark ? '#f1f5f9' : '#1e293b',
                                                        }}
                                                        formatter={(value: number | undefined, name: string | undefined) => [
                                                            value ?? 0,
                                                            name ? name.charAt(0).toUpperCase() + name.slice(1) : '',
                                                        ]}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            {/* Legend */}
                                            <div className="flex flex-wrap gap-3 mt-4 justify-center">
                                                {safeGalleryStatuses.map((entry) => (
                                                    <div
                                                        key={entry.status}
                                                        className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400"
                                                    >
                                                        <span
                                                            className="block w-2.5 h-2.5 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    GALLERY_STATUS_COLORS[entry.status] ??
                                                                    '#94a3b8',
                                                            }}
                                                        />
                                                        <span className="capitalize">
                                                            {entry.status}
                                                        </span>
                                                        <span className="text-slate-400">
                                                            ({entry.count})
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">
                                            No gallery data yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ──────────────────────────────────────────────
                                Row 3: Recent Activity + Upcoming Sessions
                            ────────────────────────────────────────────── */}
                            <div
                                ref={activityRef}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 fade-up"
                            >
                                {/* Left: Recent Activity Feed */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200">
                                            Recent Activity
                                        </h3>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                                        {safeRecentActivity.length > 0 ? (
                                            <div className="stagger-children">
                                                {safeRecentActivity.map((item, index) => {
                                                    const eventStyle =
                                                        EVENT_ICONS[item.event] ??
                                                        EVENT_ICONS.updated;

                                                    return (
                                                        <div
                                                            key={item.id}
                                                            className="p-4 flex items-start gap-3 fade-in"
                                                            style={{
                                                                animationDelay: `${index * 60}ms`,
                                                            }}
                                                        >
                                                            <div
                                                                className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${eventStyle.bg}`}
                                                            >
                                                                {item.event === 'created' && (
                                                                    <svg
                                                                        className={`w-4 h-4 ${eventStyle.color}`}
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                        strokeWidth={2}
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            d="M12 4.5v15m7.5-7.5h-15"
                                                                        />
                                                                    </svg>
                                                                )}
                                                                {item.event === 'updated' && (
                                                                    <svg
                                                                        className={`w-4 h-4 ${eventStyle.color}`}
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                        strokeWidth={2}
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z"
                                                                        />
                                                                    </svg>
                                                                )}
                                                                {item.event === 'deleted' && (
                                                                    <svg
                                                                        className={`w-4 h-4 ${eventStyle.color}`}
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                        strokeWidth={2}
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                                        />
                                                                    </svg>
                                                                )}
                                                                {!['created', 'updated', 'deleted'].includes(
                                                                    item.event,
                                                                ) && (
                                                                    <svg
                                                                        className={`w-4 h-4 ${eventStyle.color}`}
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                        strokeWidth={2}
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                                        />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                                                    {item.description}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                                                        {item.causer_name}
                                                                    </span>
                                                                    <span className="text-xs text-slate-400 dark:text-slate-500">
                                                                        {timeAgo(item.created_at)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center text-slate-400 text-sm">
                                                No recent activity.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Upcoming Sessions */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200">
                                            Upcoming Sessions
                                        </h3>
                                        <Link
                                            href="/bookings/calendar"
                                            className="text-sm text-primary hover:underline font-medium"
                                        >
                                            Calendar
                                        </Link>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                                        {safeUpcomingBookings.length > 0 ? (
                                            safeUpcomingBookings.map((booking) => (
                                                <div
                                                    key={booking.id}
                                                    className="p-4 flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                                                            <svg
                                                                className="w-5 h-5"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                                strokeWidth={1.5}
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                                                                {booking.client?.name ??
                                                                    extractFromNotes(
                                                                        booking.notes,
                                                                        'Name',
                                                                    ) ??
                                                                    `Booking #${booking.id}`}
                                                            </h4>
                                                            <p className="text-xs text-slate-500 mt-0.5">
                                                                {booking.session_date
                                                                    ? new Date(
                                                                          booking.session_date,
                                                                      ).toLocaleDateString(
                                                                          'en-US',
                                                                          {
                                                                              weekday: 'short',
                                                                              month: 'short',
                                                                              day: 'numeric',
                                                                              hour: 'numeric',
                                                                              minute: '2-digit',
                                                                          },
                                                                      )
                                                                    : 'TBD'}{' '}
                                                                &middot;{' '}
                                                                {booking.location || 'TBD'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span
                                                        className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${STATUS_COLORS[booking.status] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
                                                    >
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

                            {/* ──────────────────────────────────────────────
                                Row 4: Quick Actions
                            ────────────────────────────────────────────── */}
                            <div ref={actionsRef} className="fade-up">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">
                                    Quick Actions
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    {[
                                        {
                                            href: '/galleries/create',
                                            label: 'Create Gallery',
                                            icon: (
                                                <svg
                                                    className="w-6 h-6"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={1.5}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                                    />
                                                </svg>
                                            ),
                                        },
                                        {
                                            href: '/galleries/create',
                                            label: 'Upload Photos',
                                            icon: (
                                                <svg
                                                    className="w-6 h-6"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={1.5}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                                                    />
                                                </svg>
                                            ),
                                        },
                                        {
                                            href: '/bookings',
                                            label: 'View Bookings',
                                            icon: (
                                                <svg
                                                    className="w-6 h-6"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={1.5}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                                                    />
                                                </svg>
                                            ),
                                        },
                                        {
                                            href: '/portfolios',
                                            label: 'Manage Portfolios',
                                            icon: (
                                                <svg
                                                    className="w-6 h-6"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={1.5}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z"
                                                    />
                                                </svg>
                                            ),
                                        },
                                        {
                                            href: '/settings',
                                            label: 'Settings',
                                            icon: (
                                                <svg
                                                    className="w-6 h-6"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={1.5}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                                    />
                                                </svg>
                                            ),
                                        },
                                    ].map((action) => (
                                        <Link
                                            key={action.label}
                                            href={action.href}
                                            className="flex flex-col items-center gap-3 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-accent/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
                                        >
                                            <span className="text-slate-400 group-hover:text-accent transition-colors duration-300">
                                                {action.icon}
                                            </span>
                                            <span className="font-medium text-sm text-slate-700 dark:text-slate-300">
                                                {action.label}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* ──────────────────────────────────────────────
                        Client View: Gallery Grid
                    ────────────────────────────────────────────── */}
                    {!isAdmin && galleries && (
                        <div>
                            <h3 className="font-bold mb-4 text-slate-800 dark:text-slate-200">
                                Your Galleries
                            </h3>
                            {galleries.length === 0 ? (
                                <div className="text-center py-16 text-slate-400">
                                    <svg
                                        className="w-16 h-16 mx-auto mb-4 text-slate-300"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
                                        />
                                    </svg>
                                    <p>No galleries available yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {galleries.map((gallery) => (
                                        <Link
                                            key={gallery.id}
                                            href={`/galleries/${gallery.id}`}
                                            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                                        >
                                            <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                {gallery.cover_photo_path ? (
                                                    <img
                                                        src={gallery.cover_photo_path}
                                                        alt={gallery.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <svg
                                                        className="w-12 h-12 text-slate-300 dark:text-slate-600"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={1}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
                                                        />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h4 className="font-bold text-slate-800 dark:text-slate-200">
                                                    {gallery.name}
                                                </h4>
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
