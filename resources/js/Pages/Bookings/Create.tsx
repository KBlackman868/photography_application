import { useState, useEffect, useMemo } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Camera, ArrowLeft, Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';

interface Package {
    id: number;
    name: string;
    description: string;
    price: number;
    type: string;
}

interface AvailabilityHours {
    [day: string]: { start: string; end: string; enabled: boolean };
}

interface Props {
    packages: Package[];
    studioName: string;
    availabilityHours: AvailabilityHours | null;
}

const SESSION_TYPES = [
    'Wedding',
    'Engagement',
    'Portrait',
    'Family',
    'Headshot',
    'Event',
    'Newborn',
    'Maternity',
    'Other',
];

const FALLBACK_TIME_SLOTS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00',
];

// Map JS getDay() (0=Sun) to day names
const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function generateTimeSlots(start: string, end: string): string[] {
    const slots: string[] = [];
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let h = startH;
    let m = startM;
    while (h < endH || (h === endH && m <= endM)) {
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        m += 30;
        if (m >= 60) {
            h += 1;
            m = 0;
        }
    }
    return slots;
}

interface BookedSlot {
    date: string;
    time: string;
    status: string;
}

export default function BookingCreate({ packages, studioName, availabilityHours: initialAvailability }: Props) {
    const [submitted, setSubmitted] = useState(false);
    const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
    const [availabilityHours, setAvailabilityHours] = useState<AvailabilityHours | null>(initialAvailability);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        session_type: '',
        preferred_date: '',
        preferred_time: '',
        location: '',
        message: '',
        package_id: '' as string,
    });

    useEffect(() => {
        fetch('/api/availability')
            .then((r) => r.json())
            .then((d) => {
                setBookedSlots(d.bookings || d);
                if (d.availability_hours) {
                    setAvailabilityHours(d.availability_hours);
                }
            })
            .catch(() => {});
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/book', {
            onSuccess: () => setSubmitted(true),
        });
    };

    // Calendar helpers
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

    const getDateStr = (day: number) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const getBookingsForDate = (dateStr: string) => {
        return bookedSlots.filter((s) => s.date === dateStr);
    };

    const isDateFullyBooked = (dateStr: string) => {
        const bookings = getBookingsForDate(dateStr);
        return bookings.length >= 4;
    };

    const isTimeBooked = (dateStr: string, time: string) => {
        return bookedSlots.some((s) => s.date === dateStr && s.time === time);
    };

    // Check if a date's day-of-week is available
    const isDayAvailable = (dateStr: string) => {
        if (!availabilityHours) return true;
        const dateObj = new Date(dateStr + 'T12:00:00');
        const dayName = DAY_NAMES[dateObj.getDay()];
        const dayConfig = availabilityHours[dayName];
        return dayConfig ? dayConfig.enabled : true;
    };

    // Get time slots for a selected date based on availability hours
    const timeSlotsForDate = useMemo(() => {
        if (!data.preferred_date) return FALLBACK_TIME_SLOTS;
        if (!availabilityHours) return FALLBACK_TIME_SLOTS;

        const dateObj = new Date(data.preferred_date + 'T12:00:00');
        const dayName = DAY_NAMES[dateObj.getDay()];
        const dayConfig = availabilityHours[dayName];

        if (!dayConfig || !dayConfig.enabled) return [];
        return generateTimeSlots(dayConfig.start, dayConfig.end);
    }, [data.preferred_date, availabilityHours]);

    if (submitted) {
        return (
            <>
                <Head title="Booking Confirmed" />
                <div className="min-h-screen bg-gray-50 dark:bg-background-dark flex items-center justify-center px-6">
                    <div className="max-w-md text-center">
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-3">
                            Booking Request Sent!
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-3">
                            Thank you for your interest! I'll review your request and get back to you within 24 hours
                            to confirm your session details.
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
                            A confirmation email has been sent to your inbox.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to home
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Book a Session" />

            <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
                {/* Header */}
                <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <Camera className="w-5 h-5 text-slate-900 dark:text-white" />
                            <span className="font-display font-bold text-sm dark:text-white">{studioName}</span>
                        </Link>
                        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white">
                            Back to site
                        </Link>
                    </div>
                </header>

                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="text-center mb-12">
                        <h1 className="font-display text-4xl font-bold text-slate-900 dark:text-white mb-3">
                            Book Your Session
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
                            Choose your preferred date and time, and I'll confirm your booking within 24 hours.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                        {/* Calendar - left side */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sticky top-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-display font-bold text-lg">
                                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </h3>
                                    <div className="flex gap-1">
                                        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                            <ArrowLeft className="w-4 h-4" />
                                        </button>
                                        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rotate-180">
                                            <ArrowLeft className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                                        <div key={d} className="text-center text-xs font-medium text-slate-400 py-2">{d}</div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-1">
                                    {Array.from({ length: firstDay }).map((_, i) => (
                                        <div key={`empty-${i}`} />
                                    ))}
                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const day = i + 1;
                                        const dateStr = getDateStr(day);
                                        const dateObj = new Date(year, month, day);
                                        const isPast = dateObj < today;
                                        const isSelected = data.preferred_date === dateStr;
                                        const isFullyBooked = isDateFullyBooked(dateStr);
                                        const hasBookings = getBookingsForDate(dateStr).length > 0;
                                        const dayUnavailable = !isDayAvailable(dateStr);
                                        const isDisabled = isPast || isFullyBooked || dayUnavailable;

                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                disabled={isDisabled}
                                                onClick={() => {
                                                    setData('preferred_date', dateStr);
                                                    // Reset time when date changes
                                                    setData('preferred_time', '');
                                                }}
                                                className={`aspect-square rounded-lg text-sm font-medium transition-all relative ${
                                                    isSelected
                                                        ? 'bg-primary text-white'
                                                        : isDisabled
                                                        ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                                }`}
                                            >
                                                {day}
                                                {hasBookings && !isSelected && !isFullyBooked && !dayUnavailable && (
                                                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />
                                                )}
                                                {isFullyBooked && !isPast && (
                                                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-400" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Legend */}
                                <div className="mt-4 flex gap-4 text-xs text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-amber-400" /> Partial
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-red-400" /> Full
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-primary" /> Selected
                                    </div>
                                </div>

                                {/* Time slots */}
                                {data.preferred_date && (
                                    <div className="mt-6 border-t border-slate-200 pt-6">
                                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            Available Times
                                        </h4>
                                        {timeSlotsForDate.length === 0 ? (
                                            <p className="text-sm text-slate-400">No available times for this date.</p>
                                        ) : (
                                            <div className="grid grid-cols-3 gap-2">
                                                {timeSlotsForDate.map((time) => {
                                                    const booked = isTimeBooked(data.preferred_date, time);
                                                    const isSelected = data.preferred_time === time;
                                                    return (
                                                        <button
                                                            key={time}
                                                            type="button"
                                                            disabled={booked}
                                                            onClick={() => setData('preferred_time', time)}
                                                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                                                isSelected
                                                                    ? 'bg-primary text-white'
                                                                    : booked
                                                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed line-through'
                                                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                            }`}
                                                        >
                                                            {time}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Booking form - right side */}
                        <div className="lg:col-span-3">
                            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
                                <h3 className="font-display font-bold text-lg dark:text-white mb-6">Your Information</h3>

                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                                                placeholder="Your name"
                                            />
                                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                                                placeholder="your@email.com"
                                            />
                                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone *</label>
                                            <input
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                                                placeholder="(123) 456-7890"
                                            />
                                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Session Type *</label>
                                            <select
                                                value={data.session_type}
                                                onChange={(e) => setData('session_type', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                                            >
                                                <option value="">Select type...</option>
                                                {SESSION_TYPES.map((t) => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                            {errors.session_type && <p className="text-red-500 text-xs mt-1">{errors.session_type}</p>}
                                        </div>
                                    </div>

                                    {/* Selected date/time display */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                                                Preferred Date *
                                            </label>
                                            <input
                                                type="date"
                                                value={data.preferred_date}
                                                onChange={(e) => setData('preferred_date', e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                                            />
                                            {errors.preferred_date && <p className="text-red-500 text-xs mt-1">{errors.preferred_date}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                <Clock className="w-3.5 h-3.5 inline mr-1" />
                                                Preferred Time *
                                            </label>
                                            <select
                                                value={data.preferred_time}
                                                onChange={(e) => setData('preferred_time', e.target.value)}
                                                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                                            >
                                                <option value="">Select time...</option>
                                                {timeSlotsForDate.map((t) => (
                                                    <option
                                                        key={t}
                                                        value={t}
                                                        disabled={data.preferred_date ? isTimeBooked(data.preferred_date, t) : false}
                                                    >
                                                        {t} {data.preferred_date && isTimeBooked(data.preferred_date, t) ? '(Booked)' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.preferred_time && <p className="text-red-500 text-xs mt-1">{errors.preferred_time}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            <MapPin className="w-3.5 h-3.5 inline mr-1" />
                                            Preferred Location
                                        </label>
                                        <input
                                            type="text"
                                            value={data.location}
                                            onChange={(e) => setData('location', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                                            placeholder="Address, park, venue, etc."
                                        />
                                    </div>

                                    {packages.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Package (Optional)</label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {packages.map((pkg) => (
                                                    <button
                                                        key={pkg.id}
                                                        type="button"
                                                        onClick={() => setData('package_id', data.package_id === String(pkg.id) ? '' : String(pkg.id))}
                                                        className={`text-left p-4 rounded-xl border-2 transition-all ${
                                                            data.package_id === String(pkg.id)
                                                                ? 'border-primary bg-primary/5'
                                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                        }`}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <h4 className="font-semibold text-sm">{pkg.name}</h4>
                                                            <span className="font-bold text-primary text-sm">${pkg.price}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-1">{pkg.description}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message / Special Requests</label>
                                        <textarea
                                            value={data.message}
                                            onChange={(e) => setData('message', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-primary focus:border-primary"
                                            rows={4}
                                            placeholder="Tell me about your vision, any special requests, or questions..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'Submitting...' : 'Submit Booking Request'}
                                    </button>

                                    <p className="text-xs text-slate-400 text-center">
                                        By submitting, you agree to be contacted regarding your booking request.
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
