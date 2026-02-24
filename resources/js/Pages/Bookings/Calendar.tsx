import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';

interface BookingEvent {
    id: number;
    title: string;
    session_date: string | null;
    status: string;
    location: string;
    notes?: string;
}

interface Props extends PageProps {
    bookings: BookingEvent[];
}

const STATUS_COLORS: Record<string, string> = {
    inquiry: 'bg-amber-200 text-amber-800 border-amber-300',
    quoted: 'bg-blue-200 text-blue-800 border-blue-300',
    confirmed: 'bg-green-200 text-green-800 border-green-300',
    deposit_paid: 'bg-emerald-200 text-emerald-800 border-emerald-300',
    completed: 'bg-slate-200 text-slate-700 border-slate-300',
    cancelled: 'bg-red-200 text-red-700 border-red-300',
};

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7am to 7pm

export default function BookingCalendar({ bookings }: Props) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'week'>('month');
    const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToday = () => setCurrentDate(new Date());

    const getDateStr = (day: number) =>
        `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const getEventsForDate = (dateStr: string) => {
        return bookings.filter((b) => {
            if (!b.session_date) return false;
            return b.session_date.startsWith(dateStr);
        });
    };

    const getEventTime = (event: BookingEvent) => {
        if (!event.session_date) return '';
        const d = new Date(event.session_date);
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    // Week view helpers
    const getWeekStart = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - d.getDay());
        return d;
    };

    const weekStart = getWeekStart();
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
    });

    const getWeekDateStr = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const prevWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 7);
        setCurrentDate(d);
    };
    const nextWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 7);
        setCurrentDate(d);
    };

    function extractFromNotes(notes: string | undefined, field: string): string {
        if (!notes) return '';
        const match = notes.match(new RegExp(`${field}:\\s*(.+)`, 'i'));
        return match ? match[1].trim() : '';
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Calendar</h2>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                            <button
                                onClick={() => setView('month')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                    view === 'month' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'
                                }`}
                            >
                                Month
                            </button>
                            <button
                                onClick={() => setView('week')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                    view === 'week' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'
                                }`}
                            >
                                Week
                            </button>
                        </div>
                        <Link
                            href="/bookings"
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            List View
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Calendar" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-6">
                    {/* Navigation */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={view === 'month' ? prevMonth : prevWeek}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">chevron_left</span>
                            </button>
                            <h3 className="font-display text-xl font-bold min-w-[200px] text-center">
                                {view === 'month'
                                    ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                                    : `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                                }
                            </h3>
                            <button
                                onClick={view === 'month' ? nextMonth : nextWeek}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">chevron_right</span>
                            </button>
                        </div>
                        <button
                            onClick={goToday}
                            className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:brightness-110 transition-all"
                        >
                            Today
                        </button>
                    </div>

                    {/* Month View */}
                    {view === 'month' && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
                                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                                    <div key={d} className="px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center border-r last:border-r-0 border-slate-100 dark:border-slate-800">
                                        {d}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7">
                                {Array.from({ length: firstDay }).map((_, i) => (
                                    <div key={`e-${i}`} className="min-h-[120px] border-r border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30" />
                                ))}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const dateStr = getDateStr(day);
                                    const events = getEventsForDate(dateStr);
                                    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

                                    return (
                                        <div key={day} className="min-h-[120px] border-r border-b border-slate-100 dark:border-slate-800 p-2">
                                            <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                                                isToday ? 'bg-primary text-white' : 'text-slate-700 dark:text-slate-300'
                                            }`}>
                                                {day}
                                            </div>
                                            <div className="space-y-1">
                                                {events.slice(0, 3).map((event) => (
                                                    <button
                                                        key={event.id}
                                                        onClick={() => setSelectedEvent(event)}
                                                        className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium truncate border ${
                                                            STATUS_COLORS[event.status] || 'bg-slate-100 text-slate-600 border-slate-200'
                                                        }`}
                                                    >
                                                        {getEventTime(event)} {event.title}
                                                    </button>
                                                ))}
                                                {events.length > 3 && (
                                                    <p className="text-[10px] text-slate-400 px-1.5">+{events.length - 3} more</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Week View with time grid */}
                    {view === 'week' && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            {/* Header */}
                            <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800">
                                <div className="px-2 py-3 text-xs font-semibold text-slate-400 text-center border-r border-slate-100 dark:border-slate-800">
                                    Time
                                </div>
                                {weekDays.map((d) => {
                                    const isToday = d.toDateString() === today.toDateString();
                                    return (
                                        <div key={d.toISOString()} className={`px-2 py-3 text-center border-r last:border-r-0 border-slate-100 dark:border-slate-800 ${isToday ? 'bg-primary/5' : ''}`}>
                                            <div className="text-[10px] font-medium text-slate-400 uppercase">
                                                {d.toLocaleDateString('en-US', { weekday: 'short' })}
                                            </div>
                                            <div className={`text-lg font-bold ${isToday ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                                                {d.getDate()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Time grid */}
                            <div className="overflow-y-auto max-h-[600px]">
                                {HOURS.map((hour) => (
                                    <div key={hour} className="grid grid-cols-8 border-b border-slate-50 dark:border-slate-800">
                                        <div className="px-2 py-4 text-xs text-slate-400 text-right pr-3 border-r border-slate-100 dark:border-slate-800">
                                            {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                                        </div>
                                        {weekDays.map((d) => {
                                            const dateStr = getWeekDateStr(d);
                                            const events = getEventsForDate(dateStr).filter((e) => {
                                                if (!e.session_date) return false;
                                                const eHour = new Date(e.session_date).getHours();
                                                return eHour === hour;
                                            });
                                            const isToday = d.toDateString() === today.toDateString();

                                            return (
                                                <div key={d.toISOString()} className={`px-1 py-1 border-r last:border-r-0 border-slate-50 dark:border-slate-800 min-h-[60px] ${isToday ? 'bg-primary/5' : ''}`}>
                                                    {events.map((event) => (
                                                        <button
                                                            key={event.id}
                                                            onClick={() => setSelectedEvent(event)}
                                                            className={`w-full text-left px-2 py-1 rounded text-[10px] font-medium truncate border mb-1 ${
                                                                STATUS_COLORS[event.status] || 'bg-slate-100 text-slate-600 border-slate-200'
                                                            }`}
                                                        >
                                                            {event.title}
                                                        </button>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Legend */}
                    <div className="flex flex-wrap gap-3 mt-4 text-xs">
                        {Object.entries(STATUS_COLORS).map(([status, colors]) => (
                            <div key={status} className="flex items-center gap-1.5">
                                <span className={`w-3 h-3 rounded border ${colors}`} />
                                <span className="capitalize text-slate-600 dark:text-slate-400">{status.replace('_', ' ')}</span>
                            </div>
                        ))}
                    </div>

                    {/* Event detail modal */}
                    {selectedEvent && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}>
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold dark:text-white">{selectedEvent.title}</h3>
                                    <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600">
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Status</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${STATUS_COLORS[selectedEvent.status] || ''}`}>
                                            {selectedEvent.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Date & Time</span>
                                        <span className="font-medium">
                                            {selectedEvent.session_date
                                                ? new Date(selectedEvent.session_date).toLocaleString('en-US', {
                                                    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                                                })
                                                : 'TBD'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Location</span>
                                        <span className="font-medium">{selectedEvent.location || 'TBD'}</span>
                                    </div>
                                    {selectedEvent.notes && (
                                        <>
                                            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                                                <p className="text-slate-500 mb-1">Contact Info</p>
                                                <p className="text-sm">{extractFromNotes(selectedEvent.notes, 'Email')}</p>
                                                <p className="text-sm">{extractFromNotes(selectedEvent.notes, 'Phone')}</p>
                                            </div>
                                            {extractFromNotes(selectedEvent.notes, 'Message') !== 'N/A' && extractFromNotes(selectedEvent.notes, 'Message') && (
                                                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                                                    <p className="text-slate-500 mb-1">Message</p>
                                                    <p className="text-sm">{extractFromNotes(selectedEvent.notes, 'Message')}</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="mt-6 flex gap-3">
                                    <Link
                                        href="/bookings"
                                        className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium text-center hover:brightness-110"
                                    >
                                        Manage Bookings
                                    </Link>
                                    <button
                                        onClick={() => setSelectedEvent(null)}
                                        className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
