import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';

interface BookingData {
    id: number;
    status: string;
    session_date?: string;
    location?: string;
    notes?: string;
    total_amount?: string;
    deposit_amount?: string;
    package?: { name: string; type: string; price: number } | null;
    client?: { id: number; name: string } | null;
    created_at: string;
}

interface Props extends PageProps {
    bookings: BookingData[];
}

const STATUS_COLORS: Record<string, string> = {
    inquiry: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    quoted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    deposit_paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    completed: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    cancelled: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

const STATUSES = ['inquiry', 'quoted', 'confirmed', 'deposit_paid', 'completed', 'cancelled'];

function extractFromNotes(notes: string | undefined, field: string): string {
    if (!notes) return '';
    const match = notes.match(new RegExp(`${field}:\\s*(.+)`, 'i'));
    return match ? match[1].trim() : '';
}

export default function BookingsIndex({ bookings }: Props) {
    const [filter, setFilter] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [showReply, setShowReply] = useState(false);

    const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

    const updateStatus = (bookingId: number, status: string) => {
        router.put(`/bookings/${bookingId}`, { status }, {
            preserveScroll: true,
            onSuccess: () => setSelectedBooking(null),
        });
    };

    const sendReply = (bookingId: number) => {
        if (!replyMessage.trim()) return;
        setSending(true);
        router.post(`/bookings/${bookingId}/reply`, { message: replyMessage }, {
            preserveScroll: true,
            onSuccess: () => {
                setReplyMessage('');
                setShowReply(false);
                setSending(false);
            },
            onError: () => setSending(false),
        });
    };

    const refId = (id: number) => `KB-${String(id).padStart(5, '0')}`;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Bookings</h2>
                    <Link
                        href="/bookings/calendar"
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:brightness-110 shadow-lg shadow-primary/20 transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">calendar_month</span>
                        Calendar View
                    </Link>
                </div>
            }
        >
            <Head title="Bookings" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-6">
                    {/* Filter tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                                filter === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                            }`}
                        >
                            All ({bookings.length})
                        </button>
                        {STATUSES.map((s) => {
                            const count = bookings.filter((b) => b.status === s).length;
                            return (
                                <button
                                    key={s}
                                    onClick={() => setFilter(s)}
                                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors capitalize whitespace-nowrap ${
                                        filter === s ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {s.replace('_', ' ')} ({count})
                                </button>
                            );
                        })}
                    </div>

                    {/* Bookings table */}
                    {filtered.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <span className="material-symbols-outlined text-5xl mb-4 block">calendar_month</span>
                            <p className="text-lg font-medium">No bookings found</p>
                            <p className="text-sm mt-1">Bookings will appear here when clients submit requests.</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800">
                                            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Ref</th>
                                            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Client</th>
                                            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Type</th>
                                            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Date & Time</th>
                                            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Location</th>
                                            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                                            <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filtered.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className="text-xs font-mono text-slate-400">{refId(booking.id)}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-semibold text-sm">
                                                            {extractFromNotes(booking.notes, 'Name') || booking.client?.name || `#${booking.id}`}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {extractFromNotes(booking.notes, 'Email')}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm">
                                                        {extractFromNotes(booking.notes, 'Session Type') || booking.package?.type || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm">
                                                        {booking.session_date
                                                            ? new Date(booking.session_date).toLocaleString('en-US', {
                                                                month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
                                                            })
                                                            : 'TBD'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">{booking.location || '-'}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${STATUS_COLORS[booking.status] || 'bg-slate-100'}`}>
                                                        {booking.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => { setSelectedBooking(booking); setShowReply(false); setReplyMessage(''); }}
                                                        className="text-xs text-primary font-medium hover:underline"
                                                    >
                                                        Manage
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Booking detail/manage modal */}
                    {selectedBooking && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSelectedBooking(null)}>
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold">
                                            {extractFromNotes(selectedBooking.notes, 'Name') || `Booking #${selectedBooking.id}`}
                                        </h3>
                                        <p className="text-xs text-slate-400 font-mono">{refId(selectedBooking.id)}</p>
                                    </div>
                                    <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600">
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>

                                <div className="space-y-3 text-sm mb-6">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-slate-500 text-xs mb-0.5">Email</p>
                                            <p className="font-medium">{extractFromNotes(selectedBooking.notes, 'Email') || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs mb-0.5">Phone</p>
                                            <p className="font-medium">{extractFromNotes(selectedBooking.notes, 'Phone') || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs mb-0.5">Session Type</p>
                                            <p className="font-medium">{extractFromNotes(selectedBooking.notes, 'Session Type') || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs mb-0.5">Date & Time</p>
                                            <p className="font-medium">
                                                {selectedBooking.session_date
                                                    ? new Date(selectedBooking.session_date).toLocaleString('en-US', {
                                                        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
                                                    })
                                                    : 'TBD'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs mb-0.5">Location</p>
                                            <p className="font-medium">{selectedBooking.location || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs mb-0.5">Current Status</p>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${STATUS_COLORS[selectedBooking.status] || ''}`}>
                                                {selectedBooking.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                    {extractFromNotes(selectedBooking.notes, 'Message') !== 'N/A' && extractFromNotes(selectedBooking.notes, 'Message') && (
                                        <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                                            <p className="text-slate-500 text-xs mb-1">Client Message</p>
                                            <p className="text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">{extractFromNotes(selectedBooking.notes, 'Message')}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Update Status */}
                                <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Update Status</p>
                                    <div className="flex flex-wrap gap-2">
                                        {STATUSES.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => updateStatus(selectedBooking.id, s)}
                                                disabled={selectedBooking.status === s}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                                                    selectedBooking.status === s
                                                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-default'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                                                }`}
                                            >
                                                {s.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Reply to Client */}
                                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                                    {!showReply ? (
                                        <button
                                            onClick={() => setShowReply(true)}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent/10 text-accent rounded-xl text-sm font-medium hover:bg-accent/20 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">mail</span>
                                            Send Reply to Client
                                        </button>
                                    ) : (
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Reply to Client</p>
                                            <p className="text-xs text-slate-400 mb-2">
                                                Sending to: {extractFromNotes(selectedBooking.notes, 'Email')}
                                            </p>
                                            <textarea
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                                placeholder="Type your message to the client..."
                                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-sm resize-none focus:ring-2 focus:ring-accent focus:border-accent"
                                                rows={4}
                                            />
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={() => setShowReply(false)}
                                                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => sendReply(selectedBooking.id)}
                                                    disabled={sending || !replyMessage.trim()}
                                                    className="flex-1 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:brightness-110 disabled:opacity-50 transition-all"
                                                >
                                                    {sending ? 'Sending...' : 'Send Email'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
