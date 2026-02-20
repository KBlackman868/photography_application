import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Camera, Play, ArrowRight, ChevronDown, Shield, Users, Layout, Menu, X } from 'lucide-react';
import { PageProps } from '@/types';

const NAV_LINKS = ['Features', 'Portfolio', 'Pricing'];

const FEATURES = [
    {
        icon: Layout,
        title: 'Client Galleries',
        description:
            'Deliver stunning proof galleries. Clients can favorite, comment, and select their final images — all in one beautiful, branded experience.',
    },
    {
        icon: Shield,
        title: 'Smart Workflows',
        description:
            'Automate bookings, contracts, and invoicing. Spend less time on admin and more time behind the lens doing what you love.',
    },
    {
        icon: Users,
        title: 'Team Collaboration',
        description:
            'Assign editors, track retouching progress, and manage your entire creative team from a single, intuitive dashboard.',
    },
];

const STATS = [
    { value: '5M+', label: 'Photos delivered' },
    { value: '10K+', label: 'Studios worldwide' },
    { value: '99.9%', label: 'Uptime guaranteed' },
    { value: '4.9\u2605', label: 'Average rating' },
];

const FOOTER_LINKS = ['Twitter', 'Instagram', 'Support', 'Terms'];

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
            <Head title="Professional Photography Studio Management" />

            {/* Navbar */}
            <header
                className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                    scrolled
                        ? 'bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm'
                        : 'bg-transparent'
                }`}
            >
                <nav className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <Camera className={`w-6 h-6 transition-colors duration-300 ${scrolled ? 'text-slate-900' : 'text-white'}`} />
                        <span className={`font-display font-bold text-lg tracking-tight transition-colors duration-300 ${scrolled ? 'text-slate-900' : 'text-white'}`}>
                            Lumina Studios
                        </span>
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
                                    {canRegister && (
                                        <Link
                                            href={route('register')}
                                            className="text-sm font-medium rounded-full bg-slate-900 text-white px-5 py-2 hover:bg-slate-800 transition-colors"
                                        >
                                            Start Free Trial
                                        </Link>
                                    )}
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
                                        {canRegister && (
                                            <Link
                                                href={route('register')}
                                                className="text-sm font-medium text-center rounded-full bg-slate-900 text-white px-5 py-2.5"
                                            >
                                                Start Free Trial
                                            </Link>
                                        )}
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
                        alt="Professional photographer at work in a studio"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/80" />

                    <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                        <p className="text-xs uppercase tracking-[0.25em] text-white/60 mb-6 font-medium">
                            Studio Management Platform
                        </p>
                        <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6">
                            Capture. Curate.
                            <br />
                            <em className="italic font-normal">Deliver.</em>
                        </h1>
                        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
                            The all-in-one platform for professional photographers. Client galleries,
                            proofing, contracts, and invoicing — beautifully unified.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href={canRegister ? route('register') : '#'}
                                className="rounded-full bg-white text-slate-900 px-8 py-3.5 text-sm font-semibold hover:bg-white/90 transition-colors inline-flex items-center gap-2"
                            >
                                Start Free Trial
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <button
                                onClick={() => scrollToSection('features')}
                                className="rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-3.5 text-sm font-semibold hover:bg-white/20 transition-colors inline-flex items-center gap-2"
                            >
                                <Play className="w-4 h-4" />
                                Watch Demo
                            </button>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                        <ChevronDown className="w-6 h-6 text-white/40" />
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="py-24 md:py-32 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-20">
                            <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">
                                Everything you need
                            </p>
                            <h2 className="font-display text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                                Run your studio, effortlessly
                            </h2>
                            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                                From shoot to delivery, Lumina handles every step of your photography workflow
                                so you can focus on your craft.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                            {FEATURES.map((feature) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={feature.title} className="group">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                            <Icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <h3 className="font-display text-2xl font-bold text-slate-900 mb-3">
                                            {feature.title}
                                        </h3>
                                        <p className="text-slate-500 leading-relaxed mb-4">
                                            {feature.description}
                                        </p>
                                        <button className="text-sm font-medium text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
                                            Learn more
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Social Proof / Stats */}
                <section className="bg-gray-50 py-24 md:py-32 px-6">
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                        {/* Left column */}
                        <div className="flex-1">
                            <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">
                                Trusted worldwide
                            </p>
                            <h2 className="font-display text-3xl md:text-5xl font-bold text-slate-900 mb-8">
                                Trusted by 10,000+ professional photographers worldwide.
                            </h2>
                            <div className="grid grid-cols-2 gap-8 mb-10">
                                {STATS.map((stat) => (
                                    <div key={stat.label}>
                                        <p className="font-display text-3xl md:text-4xl font-bold text-slate-900">
                                            {stat.value}
                                        </p>
                                        <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                            <Link
                                href={canRegister ? route('register') : '#'}
                                className="text-sm font-semibold text-primary inline-flex items-center gap-2 hover:gap-3 transition-all"
                            >
                                Join them today
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Right column — image grid */}
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            <div className="translate-y-8">
                                <img
                                    src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600&q=80"
                                    alt="Couple during a wedding photography session"
                                    className="rounded-2xl object-cover w-full h-64 shadow-lg"
                                />
                            </div>
                            <div>
                                <img
                                    src="https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80"
                                    alt="Portrait photography session in natural light"
                                    className="rounded-2xl object-cover w-full h-64 shadow-lg"
                                />
                            </div>
                            <div className="translate-y-8">
                                <img
                                    src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80"
                                    alt="Photographer editing photos on a laptop"
                                    className="rounded-2xl object-cover w-full h-64 shadow-lg"
                                />
                            </div>
                            <div>
                                <img
                                    src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&q=80"
                                    alt="Camera equipment on a studio desk"
                                    className="rounded-2xl object-cover w-full h-64 shadow-lg"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing placeholder */}
                <section id="pricing" className="py-24 md:py-32 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">
                                Simple pricing
                            </p>
                            <h2 className="font-display text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                                Plans that grow with your studio
                            </h2>
                            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                                Start free. Upgrade when you're ready. No hidden fees, ever.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {[
                                {
                                    name: 'Starter',
                                    price: 'Free',
                                    description: 'Perfect for getting started',
                                    features: ['5 client galleries', 'Basic proofing', '1 GB storage', 'Email support'],
                                    cta: 'Get Started',
                                    highlighted: false,
                                },
                                {
                                    name: 'Professional',
                                    price: '$29/mo',
                                    description: 'For growing studios',
                                    features: ['Unlimited galleries', 'Advanced proofing', '100 GB storage', 'Contracts & invoicing', 'Custom branding', 'Priority support'],
                                    cta: 'Start Free Trial',
                                    highlighted: true,
                                },
                                {
                                    name: 'Studio',
                                    price: '$79/mo',
                                    description: 'For large teams',
                                    features: ['Everything in Pro', 'Unlimited storage', 'Team management', 'API access', 'Dedicated account manager'],
                                    cta: 'Contact Sales',
                                    highlighted: false,
                                },
                            ].map((plan) => (
                                <div
                                    key={plan.name}
                                    className={`rounded-2xl p-8 ${
                                        plan.highlighted
                                            ? 'bg-slate-900 text-white ring-2 ring-slate-900 scale-105'
                                            : 'bg-white border border-slate-200'
                                    }`}
                                >
                                    <h3 className={`font-display text-lg font-bold mb-1 ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                                        {plan.name}
                                    </h3>
                                    <p className={`text-sm mb-4 ${plan.highlighted ? 'text-white/60' : 'text-slate-500'}`}>
                                        {plan.description}
                                    </p>
                                    <p className={`font-display text-4xl font-bold mb-6 ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                                        {plan.price}
                                    </p>
                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((f) => (
                                            <li key={f} className={`text-sm flex items-center gap-2 ${plan.highlighted ? 'text-white/80' : 'text-slate-600'}`}>
                                                <svg className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? 'text-primary' : 'text-primary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        href={canRegister ? route('register') : '#'}
                                        className={`block text-center text-sm font-semibold rounded-full py-3 transition-colors ${
                                            plan.highlighted
                                                ? 'bg-white text-slate-900 hover:bg-white/90'
                                                : 'bg-slate-900 text-white hover:bg-slate-800'
                                        }`}
                                    >
                                        {plan.cta}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-24 md:py-32 px-6 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="font-display text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                            Ready to elevate your studio?
                        </h2>
                        <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto">
                            Join thousands of photographers who manage their entire business with Lumina.
                            Start your free trial today — no credit card required.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href={canRegister ? route('register') : '#'}
                                className="rounded-full bg-slate-900 text-white px-8 py-3.5 text-sm font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
                            >
                                Start Free Trial
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <button
                                onClick={() => scrollToSection('features')}
                                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                Learn more about features
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-100 py-8 px-6">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-400">Lumina Studios</span>
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
                        &copy; {new Date().getFullYear()} Lumina Studios. All rights reserved.
                    </p>
                </div>
            </footer>
        </>
    );
}
