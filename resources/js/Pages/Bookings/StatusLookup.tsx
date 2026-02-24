import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

interface BookingResult {
    reference_number: string;
    status: string;
    status_label: string;
    session_date: string | null;
    session_time: string | null;
    location: string | null;
    package_name: string | null;
    created_at: string;
}

const STATUS_STEPS = ['inquiry', 'quoted', 'confirmed', 'deposit_paid', 'completed'];

const STATUS_COLORS: Record<string, string> = {
    inquiry: 'bg-blue-500',
    quoted: 'bg-purple-500',
    confirmed: 'bg-emerald-500',
    deposit_paid: 'bg-amber-500',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500',
};

export default function StatusLookup() {
    const { flash } = usePage().props as any;
    const booking: BookingResult | null = flash?.booking || null;
    const error: string | null = flash?.error || null;

    const { data, setData, post, processing } = useForm({
        reference_number: '',
        email: '',
    });

    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        post('/booking-status', { preserveScroll: true });
    };

    const currentStepIndex = booking ? STATUS_STEPS.indexOf(booking.status) : -1;

    return (
        <>
            <Head title="Check Booking Status">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@400;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-background-dark text-white">
                {/* Header */}
                <header className="bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
                    <nav className="max-w-4xl mx-auto px-4 md:px-8 flex items-center justify-between h-20">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-300">
                                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                                </svg>
                            </div>
                            <div>
                                <span className="font-display font-bold text-white text-sm tracking-tight">Kyle Blackman</span>
                                <span className="block text-[10px] text-accent/80 uppercase tracking-[0.2em] font-medium">Photography</span>
                            </div>
                        </Link>
                        <Link href="/" className="text-[13px] font-medium text-white/60 hover:text-accent transition-colors duration-300">
                            Back to Home
                        </Link>
                    </nav>
                </header>

                <main className="max-w-2xl mx-auto px-4 md:px-8 py-16 md:py-24">
                    {/* Title */}
                    <div className="text-center mb-12">
                        <span className="inline-block text-[11px] uppercase tracking-[0.3em] font-semibold text-accent mb-4">
                            Track Your Session
                        </span>
                        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight leading-none mb-4">
                            Booking Status
                        </h1>
                        <p className="text-white/40 text-lg font-light">
                            Enter your reference number and email to check the status of your booking.
                        </p>
                    </div>

                    {/* Lookup Form */}
                    <form onSubmit={handleSubmit} className="rounded-2xl bg-white/5 border border-white/10 p-6 md:p-8 backdrop-blur-xl mb-8">
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Reference Number</label>
                                <input
                                    type="text"
                                    value={data.reference_number}
                                    onChange={(e) => setData('reference_number', e.target.value.toUpperCase())}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-lg font-mono tracking-wider placeholder-white/20 focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                                    placeholder="KB-00001"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                                    placeholder="you@email.com"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={processing || !data.reference_number || !data.email}
                                className="w-full rounded-xl bg-accent text-background-dark px-6 py-4 text-sm font-bold uppercase tracking-widest hover:bg-accent/90 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Checking...
                                    </span>
                                ) : (
                                    'Check Status'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Error */}
                    {error && submitted && (
                        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6 mb-8 animate-fade-in">
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                </svg>
                                <p className="text-red-300 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Booking Result */}
                    {booking && (
                        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden backdrop-blur-xl booking-result-animate">
                            {/* Status Header */}
                            <div className="p-6 md:p-8 border-b border-white/10">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Reference</p>
                                        <p className="font-mono text-2xl font-bold text-accent tracking-wider">{booking.reference_number}</p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                                        booking.status === 'cancelled'
                                            ? 'bg-red-500/20 text-red-300'
                                            : booking.status === 'completed'
                                                ? 'bg-green-500/20 text-green-300'
                                                : 'bg-accent/20 text-accent'
                                    }`}>
                                        {booking.status_label}
                                    </div>
                                </div>

                                {/* Progress Steps */}
                                {booking.status !== 'cancelled' && (
                                    <div className="relative">
                                        <div className="flex items-center justify-between relative z-10">
                                            {STATUS_STEPS.map((step, idx) => {
                                                const isActive = idx <= currentStepIndex;
                                                const isCurrent = idx === currentStepIndex;
                                                const labels: Record<string, string> = {
                                                    inquiry: 'Received',
                                                    quoted: 'Quoted',
                                                    confirmed: 'Confirmed',
                                                    deposit_paid: 'Deposit',
                                                    completed: 'Complete',
                                                };
                                                return (
                                                    <div key={step} className="flex flex-col items-center gap-2">
                                                        <div
                                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                                                                isCurrent
                                                                    ? 'bg-accent text-background-dark scale-125 shadow-lg shadow-accent/30'
                                                                    : isActive
                                                                        ? 'bg-accent/80 text-background-dark'
                                                                        : 'bg-white/10 text-white/30'
                                                            }`}
                                                        >
                                                            {isActive ? (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                                </svg>
                                                            ) : (
                                                                idx + 1
                                                            )}
                                                        </div>
                                                        <span className={`text-[10px] uppercase tracking-wider font-medium ${
                                                            isActive ? 'text-accent' : 'text-white/30'
                                                        }`}>
                                                            {labels[step]}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {/* Progress bar behind steps */}
                                        <div className="absolute top-4 left-4 right-4 h-[2px] bg-white/10 -translate-y-1/2">
                                            <div
                                                className="h-full bg-accent transition-all duration-700 rounded-full"
                                                style={{ width: `${Math.max(0, (currentStepIndex / (STATUS_STEPS.length - 1)) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Booking Details */}
                            <div className="p-6 md:p-8 space-y-4">
                                {booking.session_date && (
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-white/40 text-xs uppercase tracking-wider">Session Date</p>
                                            <p className="text-white font-medium">{booking.session_date}</p>
                                            {booking.session_time && (
                                                <p className="text-white/60 text-sm">{booking.session_time}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {booking.location && booking.location !== 'TBD' && (
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-white/40 text-xs uppercase tracking-wider">Location</p>
                                            <p className="text-white font-medium">{booking.location}</p>
                                        </div>
                                    </div>
                                )}

                                {booking.package_name && (
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-white/40 text-xs uppercase tracking-wider">Package</p>
                                            <p className="text-white font-medium">{booking.package_name}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-white/40 text-xs uppercase tracking-wider">Submitted</p>
                                        <p className="text-white font-medium">{booking.created_at}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Help text */}
                    <div className="text-center mt-12">
                        <p className="text-white/30 text-sm">
                            Can't find your booking? <a href="mailto:kyle@kyleblackmanphoto.com" className="text-accent hover:underline">Contact us</a>
                        </p>
                    </div>
                </main>
            </div>

            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.4s ease-out forwards;
                }
                .booking-result-animate {
                    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
}
