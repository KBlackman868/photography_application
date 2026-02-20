import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Camera, ArrowRight, ChevronDown, Heart, Clock, Star, Menu, X, Calendar, MapPin, Mail, Phone } from 'lucide-react';
import { PageProps } from '@/types';

const NAV_LINKS = ['About', 'Services', 'Portfolio', 'Book'];

const SERVICES = [
    {
        icon: Heart,
        title: 'Weddings & Engagements',
        description:
            'Your love story deserves to be told beautifully. From intimate elopements to grand celebrations, I capture every heartfelt moment so you can relive them forever.',
    },
    {
        icon: Star,
        title: 'Portraits & Headshots',
        description:
            'Whether it\'s a family session, senior portraits, or professional headshots, I\'ll bring out your personality and create images you\'ll be proud to share.',
    },
    {
        icon: Clock,
        title: 'Events & Special Occasions',
        description:
            'Birthdays, graduations, corporate events, and more. I document your milestones with a candid, storytelling approach that feels natural and genuine.',
    },
];

const STATS = [
    { value: '500+', label: 'Sessions completed' },
    { value: '8+', label: 'Years of experience' },
    { value: '100%', label: 'Satisfaction guaranteed' },
    { value: '4.9★', label: 'Client rating' },
];

const FOOTER_LINKS = ['Instagram', 'Facebook', 'Contact', 'Terms'];

export default function Welcome({
    auth,
    canLogin,
    canRegister,
}: PageProps<{ canLogin: boolean; canRegister: boolean }>) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setMobileMenuOpen(false);
    };

    return (
        <>
            <Head title="Kyle Blackman Photography" />

            {/* Navbar */}
            <header
                className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                    scrolled
                        ? 'bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm'
                        : 'bg-transparent'
                }`}
            >
                <nav className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/logo.png"
                            alt="Kyle Blackman Photography"
                            className="h-10 w-auto"
                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                        />
                        <div className={`hidden items-center gap-2`}>
                            <Camera className={`w-6 h-6 transition-colors duration-300 ${scrolled ? 'text-slate-900' : 'text-white'}`} />
                            <span className={`font-display font-bold text-lg tracking-tight transition-colors duration-300 ${scrolled ? 'text-slate-900' : 'text-white'}`}>
                                Kyle Blackman
                            </span>
                        </div>
                    </div>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {NAV_LINKS.map((link) => (
                            <button
                                key={link}
                                onClick={() => scrollToSection(link.toLowerCase())}
                                className={`text-sm font-medium transition-colors duration-300 hover:opacity-70 ${
                                    scrolled ? 'text-slate-600' : 'text-white/80'
                                }`}
                            >
                                {link}
                            </button>
                        ))}
                        <div className="flex items-center gap-3 ml-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="text-sm font-medium rounded-full bg-slate-900 text-white px-5 py-2 hover:bg-slate-800 transition-colors"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    {canLogin && (
                                        <Link
                                            href={route('login')}
                                            className={`text-sm font-medium transition-colors duration-300 hover:opacity-70 ${
                                                scrolled ? 'text-slate-600' : 'text-white/80'
                                            }`}
                                        >
                                            Log in
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => scrollToSection('book')}
                                        className="text-sm font-medium rounded-full bg-slate-900 text-white px-5 py-2 hover:bg-slate-800 transition-colors"
                                    >
                                        Book Now
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu toggle */}
                    <button
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <X className={`w-6 h-6 ${scrolled ? 'text-slate-900' : 'text-white'}`} />
                        ) : (
                            <Menu className={`w-6 h-6 ${scrolled ? 'text-slate-900' : 'text-white'}`} />
                        )}
                    </button>
                </nav>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-100">
                        <div className="px-6 py-4 flex flex-col gap-3">
                            {NAV_LINKS.map((link) => (
                                <button
                                    key={link}
                                    onClick={() => scrollToSection(link.toLowerCase())}
                                    className="text-sm font-medium text-slate-600 text-left py-2 hover:text-slate-900 transition-colors"
                                >
                                    {link}
                                </button>
                            ))}
                            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="text-sm font-medium text-center rounded-full bg-slate-900 text-white px-5 py-2.5"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        {canLogin && (
                                            <Link
                                                href={route('login')}
                                                className="text-sm font-medium text-slate-600 py-2"
                                            >
                                                Log in
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => { setMobileMenuOpen(false); scrollToSection('book'); }}
                                            className="text-sm font-medium text-center rounded-full bg-slate-900 text-white px-5 py-2.5"
                                        >
                                            Book Now
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <main>
                {/* Hero */}
                <section className="min-h-[90vh] flex items-center justify-center relative overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1920&q=80"
                        alt="Professional photography"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/80" />

                    <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                        <img
                            src="/images/logo-light.png"
                            alt="Kyle Blackman Photography"
                            className="h-20 w-auto mx-auto mb-8"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <p className="text-xs uppercase tracking-[0.25em] text-white/60 mb-6 font-medium">
                            Professional Photography
                        </p>
                        <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6">
                            Capturing Your
                            <br />
                            <em className="italic font-normal">Story.</em>
                        </h1>
                        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Professional photography for life's most meaningful moments.
                            Weddings, portraits, and events — beautifully captured, forever remembered.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => scrollToSection('book')}
                                className="rounded-full bg-white text-slate-900 px-8 py-3.5 text-sm font-semibold hover:bg-white/90 transition-colors inline-flex items-center gap-2"
                            >
                                Book a Session
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => scrollToSection('portfolio')}
                                className="rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-3.5 text-sm font-semibold hover:bg-white/20 transition-colors inline-flex items-center gap-2"
                            >
                                View Portfolio
                            </button>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                        <ChevronDown className="w-6 h-6 text-white/40" />
                    </div>
                </section>

                {/* About */}
                <section id="about" className="py-24 md:py-32 px-6">
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                        {/* Photos of Kyle */}
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            <div className="translate-y-8">
                                <img
                                    src="/images/kyle-1.jpg"
                                    alt="Kyle Blackman - Photographer"
                                    className="rounded-2xl object-cover w-full h-80 shadow-lg"
                                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&q=80'; }}
                                />
                            </div>
                            <div>
                                <img
                                    src="/images/kyle-2.jpg"
                                    alt="Kyle Blackman at work"
                                    className="rounded-2xl object-cover w-full h-80 shadow-lg"
                                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80'; }}
                                />
                            </div>
                        </div>

                        {/* About text */}
                        <div className="flex-1">
                            <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">
                                Meet the photographer
                            </p>
                            <h2 className="font-display text-3xl md:text-5xl font-bold text-slate-900 mb-6">
                                Hi, I'm Kyle Blackman
                            </h2>
                            <p className="text-slate-500 text-lg leading-relaxed mb-6">
                                I'm a professional photographer passionate about capturing authentic moments
                                and creating timeless images. Whether it's your wedding day, a family milestone,
                                or a professional headshot, I bring a creative eye and genuine care to every session.
                            </p>
                            <p className="text-slate-500 text-lg leading-relaxed mb-8">
                                My approach is simple: make you feel comfortable, have fun, and let the real
                                moments unfold. The best photos come from genuine emotions and natural connections.
                            </p>
                            <button
                                onClick={() => scrollToSection('book')}
                                className="text-sm font-semibold text-primary inline-flex items-center gap-2 hover:gap-3 transition-all"
                            >
                                Let's work together
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Services */}
                <section id="services" className="bg-gray-50 py-24 md:py-32 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-20">
                            <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">
                                What I offer
                            </p>
                            <h2 className="font-display text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                                Photography Services
                            </h2>
                            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                                Every session is tailored to you. From the initial consultation to final delivery,
                                I'm dedicated to creating images you'll treasure.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                            {SERVICES.map((service) => {
                                const Icon = service.icon;
                                return (
                                    <div key={service.title} className="group">
                                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                                            <Icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <h3 className="font-display text-2xl font-bold text-slate-900 mb-3">
                                            {service.title}
                                        </h3>
                                        <p className="text-slate-500 leading-relaxed mb-4">
                                            {service.description}
                                        </p>
                                        <button
                                            onClick={() => scrollToSection('book')}
                                            className="text-sm font-medium text-primary inline-flex items-center gap-1 hover:gap-2 transition-all"
                                        >
                                            Book this session
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Portfolio / Social Proof */}
                <section id="portfolio" className="py-24 md:py-32 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">
                                My work
                            </p>
                            <h2 className="font-display text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                                Featured Portfolio
                            </h2>
                            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                                A glimpse into the moments I've had the privilege of capturing.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="md:row-span-2">
                                <img
                                    src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600&q=80"
                                    alt="Wedding photography"
                                    className="rounded-2xl object-cover w-full h-full min-h-[280px] shadow-lg"
                                />
                            </div>
                            <div>
                                <img
                                    src="https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80"
                                    alt="Portrait photography"
                                    className="rounded-2xl object-cover w-full h-full min-h-[280px] shadow-lg"
                                />
                            </div>
                            <div>
                                <img
                                    src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80"
                                    alt="Photo editing session"
                                    className="rounded-2xl object-cover w-full h-full min-h-[280px] shadow-lg"
                                />
                            </div>
                            <div className="md:row-span-2">
                                <img
                                    src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&q=80"
                                    alt="Camera equipment"
                                    className="rounded-2xl object-cover w-full h-full min-h-[280px] shadow-lg"
                                />
                            </div>
                            <div>
                                <img
                                    src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80"
                                    alt="Event photography"
                                    className="rounded-2xl object-cover w-full h-full min-h-[280px] shadow-lg"
                                />
                            </div>
                            <div>
                                <img
                                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80"
                                    alt="Portrait session"
                                    className="rounded-2xl object-cover w-full h-full min-h-[280px] shadow-lg"
                                />
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-slate-200">
                            {STATS.map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <p className="font-display text-3xl md:text-4xl font-bold text-slate-900">
                                        {stat.value}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Booking Section */}
                <section id="book" className="bg-gray-50 py-24 md:py-32 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="max-w-3xl mx-auto text-center mb-16">
                            <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">
                                Let's create something beautiful
                            </p>
                            <h2 className="font-display text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                                Book Your Session
                            </h2>
                            <p className="text-slate-500 text-lg">
                                Ready to capture your next milestone? Reach out and let's plan your perfect session.
                                I'd love to hear your story and discuss how we can bring your vision to life.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {/* Contact Info Cards */}
                            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center hover:shadow-lg transition-shadow">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                                    <Phone className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-display text-lg font-bold text-slate-900 mb-2">Call or Text</h3>
                                <p className="text-slate-500 text-sm mb-4">Available for quick questions and scheduling</p>
                                <a href="tel:+1234567890" className="text-primary font-semibold text-sm hover:underline">
                                    (123) 456-7890
                                </a>
                            </div>

                            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center hover:shadow-lg transition-shadow">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                                    <Mail className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-display text-lg font-bold text-slate-900 mb-2">Email Me</h3>
                                <p className="text-slate-500 text-sm mb-4">For detailed inquiries and session planning</p>
                                <a href="mailto:kyle@kyleblackmanphoto.com" className="text-primary font-semibold text-sm hover:underline">
                                    kyle@kyleblackmanphoto.com
                                </a>
                            </div>

                            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center hover:shadow-lg transition-shadow">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                                    <MapPin className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-display text-lg font-bold text-slate-900 mb-2">Location</h3>
                                <p className="text-slate-500 text-sm mb-4">On-location sessions available</p>
                                <p className="text-primary font-semibold text-sm">
                                    Available for travel
                                </p>
                            </div>
                        </div>

                        {/* Booking CTA */}
                        <div className="mt-16 max-w-2xl mx-auto bg-slate-900 rounded-2xl p-10 text-center">
                            <Calendar className="w-10 h-10 text-white/60 mx-auto mb-4" />
                            <h3 className="font-display text-2xl font-bold text-white mb-3">
                                Ready to get started?
                            </h3>
                            <p className="text-white/60 mb-8 max-w-md mx-auto">
                                Send me a message with your date, location, and vision. I'll get back to you
                                within 24 hours to discuss the details.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a
                                    href="mailto:kyle@kyleblackmanphoto.com?subject=Photography%20Session%20Inquiry"
                                    className="rounded-full bg-white text-slate-900 px-8 py-3.5 text-sm font-semibold hover:bg-white/90 transition-colors inline-flex items-center gap-2"
                                >
                                    Send an Inquiry
                                    <ArrowRight className="w-4 h-4" />
                                </a>
                                <a
                                    href="tel:+1234567890"
                                    className="rounded-full bg-white/10 border border-white/30 text-white px-8 py-3.5 text-sm font-semibold hover:bg-white/20 transition-colors"
                                >
                                    Call Now
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-100 py-8 px-6">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-400">Kyle Blackman Photography</span>
                    </div>
                    <div className="flex items-center gap-6">
                        {FOOTER_LINKS.map((link) => (
                            <a
                                key={link}
                                href="#"
                                className="text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {link}
                            </a>
                        ))}
                    </div>
                    <p className="text-xs text-slate-400">
                        &copy; {new Date().getFullYear()} Kyle Blackman Photography. All rights reserved.
                    </p>
                </div>
            </footer>
        </>
    );
}
