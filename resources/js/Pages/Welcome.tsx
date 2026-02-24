import { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useTextScramble } from '@/hooks/useTextScramble';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface PortfolioData {
    id: number;
    title: string;
    slug: string;
    category: string;
    cover_photo_path?: string;
    photos: { id: number; photo_path: string; display_path?: string; thumb_path?: string; caption?: string }[];
}

interface StudioData {
    name: string;
    description?: string;
    email?: string;
    phone?: string;
    logo_path?: string;
    hero_images?: string[];
    social_links?: {
        instagram?: string;
        facebook?: string;
    };
}

interface WelcomeProps extends PageProps {
    canLogin: boolean;
    canRegister: boolean;
    portfolios: PortfolioData[];
    categories: string[];
    studio: StudioData | null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const imgSrc = (p: string) => p.startsWith('http') ? p : '/storage/' + p;

const FALLBACK_IMAGES = [
    { src: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80', title: 'Weddings', category: 'Weddings' },
    { src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80', title: 'Portraits', category: 'Portraits' },
    { src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80', title: 'Events', category: 'Events' },
    { src: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80', title: 'Editorial', category: 'Commercial' },
    { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', title: 'Lifestyle', category: 'Portraits' },
    { src: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80', title: 'Creative', category: 'Commercial' },
    { src: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=80', title: 'Couples', category: 'Weddings' },
    { src: 'https://images.unsplash.com/photo-1505932794465-147d1f1b2c97?w=800&q=80', title: 'Corporate', category: 'Events' },
    { src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80', title: 'Headshots', category: 'Portraits' },
];

const HERO_FALLBACK = 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1920&q=80';

const SERVICES = [
    {
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
        ),
        title: 'Weddings',
        description: 'Timeless wedding photography that captures the emotion, beauty, and joy of your celebration.',
    },
    {
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
        ),
        title: 'Portraits',
        description: 'Personal and professional portraits that reveal character and tell your unique story.',
    },
    {
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
        ),
        title: 'Events',
        description: 'Dynamic event coverage that preserves the energy and memorable moments of your occasion.',
    },
    {
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
        ),
        title: 'Commercial',
        description: 'Brand photography and commercial work that elevates your visual identity and marketing.',
    },
];

/* ------------------------------------------------------------------ */
/*  Section label                                                      */
/* ------------------------------------------------------------------ */
function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-block text-[11px] uppercase tracking-[0.3em] font-semibold text-accent mb-6">
            {children}
        </span>
    );
}

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */
export default function Welcome({
    auth,
    canLogin,
    canRegister,
    portfolios = [],
    categories = [],
    studio,
}: WelcomeProps) {
    /* ── State ── */
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeTab, setActiveTab] = useState('All');

    /* ── Text scramble for hero title ── */
    const { text: scrambledName, done: scrambleDone } = useTextScramble('Kyle Blackman', 1800, 35);

    /* ── Scroll zoom effect refs + state ── */
    const heroRef = useRef<HTMLElement>(null);
    const heroBgRef = useRef<HTMLDivElement>(null);
    const heroContentRef = useRef<HTMLDivElement>(null);

    /* ── Smooth tabs indicator ── */
    const tabContainerRef = useRef<HTMLDivElement>(null);
    const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

    /* ── Scroll-reveal refs ── */
    const tabSectionRef = useScrollReveal(0.15);
    const portfolioGridRef = useScrollReveal(0.1);
    const portfolioLinkRef = useScrollReveal(0.15);
    const aboutLeftRef = useScrollReveal(0.2);
    const aboutRightRef = useScrollReveal(0.2);
    const servicesHeaderRef = useScrollReveal(0.2);
    const servicesGridRef = useScrollReveal(0.1);
    const ctaContentRef = useScrollReveal(0.2);

    /* ── Navbar scroll detection ── */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    /* ── Hero scroll zoom + fade effect ── */
    useEffect(() => {
        let ticking = false;

        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const heroEl = heroRef.current;
                    const bgEl = heroBgRef.current;
                    const contentEl = heroContentRef.current;
                    if (!heroEl || !bgEl || !contentEl) {
                        ticking = false;
                        return;
                    }

                    const scrollY = window.scrollY;
                    const heroHeight = heroEl.offsetHeight;
                    const progress = Math.min(scrollY / heroHeight, 1);

                    const scale = 1 + progress * 0.15;
                    const opacity = 1 - progress * 1.2;

                    bgEl.style.transform = `scale(${scale})`;
                    contentEl.style.opacity = `${Math.max(0, opacity)}`;

                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    /* ── Update tab indicator when active tab changes ── */
    const updateIndicator = useCallback((tabName: string) => {
        const btn = tabRefs.current.get(tabName);
        const container = tabContainerRef.current;
        if (btn && container) {
            const containerRect = container.getBoundingClientRect();
            const btnRect = btn.getBoundingClientRect();
            setIndicatorStyle({
                left: btnRect.left - containerRect.left + container.scrollLeft,
                width: btnRect.width,
            });
        }
    }, []);

    useEffect(() => {
        // Small delay to let DOM settle
        const timeout = setTimeout(() => updateIndicator(activeTab), 50);
        return () => clearTimeout(timeout);
    }, [activeTab, updateIndicator]);

    // Also update on resize
    useEffect(() => {
        const handleResize = () => updateIndicator(activeTab);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [activeTab, updateIndicator]);

    /* ── Build hero background image ── */
    const heroImage = (() => {
        // Use admin-uploaded hero image first
        if (studio?.hero_images && studio.hero_images.length > 0) {
            return imgSrc(studio.hero_images[0]);
        }
        if (portfolios.length > 0) {
            const first = portfolios[0];
            if (first.cover_photo_path) return imgSrc(first.cover_photo_path);
            if (first.photos.length > 0) return imgSrc(first.photos[0].photo_path);
        }
        return HERO_FALLBACK;
    })();

    /* ── Build gallery items from portfolios or fallback ── */
    type GalleryItem = { src: string; thumb: string; title: string; slug: string; category: string };
    const allGalleryImages: GalleryItem[] = [];
    if (portfolios.length > 0) {
        for (const p of portfolios) {
            if (allGalleryImages.length >= 9) break;
            if (p.photos.length > 0) {
                const ph = p.photos[0];
                const thumbSrc = ph.thumb_path ? imgSrc(ph.thumb_path) : imgSrc(ph.photo_path);
                allGalleryImages.push({
                    src: imgSrc(ph.photo_path),
                    thumb: thumbSrc,
                    title: p.title,
                    slug: p.slug,
                    category: p.category,
                });
            } else if (p.cover_photo_path) {
                allGalleryImages.push({
                    src: imgSrc(p.cover_photo_path),
                    thumb: imgSrc(p.cover_photo_path),
                    title: p.title,
                    slug: p.slug,
                    category: p.category,
                });
            }
        }
    }
    while (allGalleryImages.length < 6) {
        const fb = FALLBACK_IMAGES[allGalleryImages.length % FALLBACK_IMAGES.length];
        allGalleryImages.push({ src: fb.src, thumb: fb.src, title: fb.title, slug: '', category: fb.category });
    }

    /* ── Filter gallery by active tab ── */
    const filteredGallery = activeTab === 'All'
        ? allGalleryImages
        : allGalleryImages.filter((img) => img.category === activeTab);

    /* ── Tab list ── */
    const tabList = ['All', ...categories];

    /* ── Reusable SVG icons ── */
    const CameraIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
        </svg>
    );

    const ArrowIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
    );

    return (
        <>
            <Head title="Kyle Blackman Photography">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@400;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </Head>

            {/* ======================== NAVBAR ======================== */}
            <header
                className={`fixed top-0 w-full z-50 transition-all duration-500 ${
                    scrolled
                        ? 'bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/10'
                        : 'bg-transparent'
                }`}
            >
                <nav className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 flex items-center justify-between h-20">
                    <Link href="/" className="flex items-center gap-3 group">
                        {studio?.logo_path ? (
                            <img
                                src={imgSrc(studio.logo_path)}
                                alt="Logo"
                                className="w-10 h-10 rounded-lg object-contain"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-300">
                                <CameraIcon className="w-5 h-5 text-accent" />
                            </div>
                        )}
                        <div>
                            <span className="font-display font-bold text-white text-sm tracking-tight">Kyle Blackman</span>
                            <span className="block text-[10px] text-accent/80 uppercase tracking-[0.2em] font-medium">Photography</span>
                        </div>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {['Portfolio', 'About', 'Services'].map((label) => (
                            <a
                                key={label}
                                href={`#${label.toLowerCase()}`}
                                className="text-[13px] font-medium text-white/60 hover:text-accent transition-colors duration-300"
                            >
                                {label}
                            </a>
                        ))}
                        <a href="/portfolio" className="text-[13px] font-medium text-white/60 hover:text-accent transition-colors duration-300">
                            Gallery
                        </a>
                        <div className="flex items-center gap-3 ml-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="text-[13px] font-semibold rounded-full bg-accent text-background-dark px-6 py-2.5 hover:bg-accent/90 transition-colors duration-300"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    {canLogin && (
                                        <Link
                                            href={route('login')}
                                            className="text-[13px] font-medium text-white/60 hover:text-white transition-colors duration-300"
                                        >
                                            Log in
                                        </Link>
                                    )}
                                    <Link
                                        href="/book"
                                        className="text-[13px] font-semibold rounded-full bg-accent text-background-dark px-6 py-2.5 hover:bg-accent/90 transition-colors duration-300"
                                    >
                                        Book Now
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile toggle */}
                    <button
                        className="md:hidden w-11 h-11 flex items-center justify-center text-white/80"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                            </svg>
                        )}
                    </button>
                </nav>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/5 animate-slide-down">
                        <div className="px-4 py-6 flex flex-col gap-1">
                            {['Portfolio', 'About', 'Services'].map((label) => (
                                <a
                                    key={label}
                                    href={`#${label.toLowerCase()}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-sm font-medium text-white/70 py-3 hover:text-accent transition-colors"
                                >
                                    {label}
                                </a>
                            ))}
                            <a href="/portfolio" className="text-sm font-medium text-white/70 py-3 hover:text-accent transition-colors">
                                Gallery
                            </a>
                            <div className="border-t border-white/10 mt-3 pt-4 flex flex-col gap-3">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="text-sm font-semibold text-center rounded-full bg-accent text-background-dark px-6 py-3"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        {canLogin && (
                                            <Link href={route('login')} className="text-sm font-medium text-white/70 py-2">
                                                Log in
                                            </Link>
                                        )}
                                        <Link
                                            href="/book"
                                            className="text-sm font-semibold text-center rounded-full bg-accent text-background-dark px-6 py-3"
                                        >
                                            Book Now
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <main className="bg-background-dark text-white overflow-hidden">

                {/* ======================= 1. HERO — Scroll Zoom ======================= */}
                <section
                    ref={heroRef}
                    className="relative h-screen flex items-center justify-center overflow-hidden"
                >
                    {/* Background with scroll zoom */}
                    <div ref={heroBgRef} className="absolute inset-0 will-change-transform origin-center">
                        <img
                            src={heroImage}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="eager"
                        />
                    </div>
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/60 via-[#0a0a0f]/40 to-[#0a0a0f]" />

                    {/* Hero content — fades out on scroll */}
                    <div
                        ref={heroContentRef}
                        className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 text-center hero-animate will-change-[opacity]"
                    >
                        {/* Child 1: scramble name — animates at 0.3s */}
                        <h1 className="mb-4">
                            <span
                                className={`inline-block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-none ${
                                    scrambleDone ? 'font-display' : ''
                                }`}
                                style={{ fontFamily: scrambleDone ? undefined : 'monospace' }}
                            >
                                {scrambledName}
                            </span>
                        </h1>

                        {/* Child 2: subtitle — animates at 2.2s (after scramble finishes) */}
                        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 font-light leading-relaxed tracking-wide">
                            Photographer &bull; Visual Storyteller
                        </p>

                        {/* Child 3: CTA buttons — animates at 2.5s */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/portfolio"
                                className="group rounded-full bg-accent text-background-dark px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-accent/90 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:scale-105 transition-all duration-300 inline-flex items-center gap-3 min-h-[44px]"
                            >
                                View Portfolio
                                <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/book"
                                className="rounded-full border border-white/20 text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:scale-105 transition-all duration-300 min-h-[44px]"
                            >
                                Book a Session
                            </Link>
                        </div>

                        {/* Child 4: spacer for hero-animate nth-child(4) at 2.8s */}
                        <div aria-hidden="true" />
                    </div>

                </section>

                {/* ============== 2. SMOOTH TABS — Category Filter ============== */}
                <section id="portfolio" className="pt-24 md:pt-36 px-4 md:px-8 lg:px-16">
                    <div className="max-w-7xl mx-auto">
                        <div ref={tabSectionRef} className="stagger-children text-center mb-16 md:mb-20">
                            <div className="fade-up"><SectionLabel>Selected Work</SectionLabel></div>
                            <h2 className="fade-up font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none mb-6">
                                Featured Portfolio
                            </h2>
                            <p className="fade-up text-white/40 text-lg max-w-xl mx-auto font-light">
                                A curated selection of moments I've had the privilege of capturing.
                            </p>
                        </div>

                        {/* Tab bar */}
                        <div className="relative mb-12">
                            <div
                                ref={tabContainerRef}
                                className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-3 justify-center md:justify-center"
                            >
                                {tabList.map((tab) => (
                                    <button
                                        key={tab}
                                        ref={(el) => {
                                            if (el) tabRefs.current.set(tab, el);
                                        }}
                                        onClick={() => setActiveTab(tab)}
                                        className={`relative whitespace-nowrap px-5 py-2.5 text-sm font-medium transition-colors duration-300 min-h-[44px] ${
                                            activeTab === tab
                                                ? 'text-accent'
                                                : 'text-white/40 hover:text-white/70'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                                {/* Animated underline indicator */}
                                <div
                                    className="absolute bottom-0 h-[2px] bg-accent rounded-full"
                                    style={{
                                        transform: `translateX(${indicatorStyle.left}px)`,
                                        width: `${indicatorStyle.width}px`,
                                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============== 3. PORTFOLIO GRID — Floating Hover ============== */}
                <section
                    className="pb-24 md:pb-36 px-4 md:px-8 lg:px-16"
                >
                    <div className="max-w-7xl mx-auto">
                        <div ref={portfolioGridRef} className="stagger-children grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredGallery.slice(0, 9).map((img, idx) => (
                                <div key={`${img.slug || img.title}-${idx}`} className="fade-up">
                                    <a
                                        href={img.slug ? `/portfolio/${img.slug}` : '/portfolio'}
                                        className="group relative block aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:translate-y-[-12px] hover:scale-[1.03] hover:rotate-[1deg] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)]"
                                    >
                                        <img
                                            src={img.thumb}
                                            alt={img.title}
                                            className="w-full h-full object-cover transition-transform duration-500 ease-out"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                                            <div>
                                                <p className="text-accent text-[10px] uppercase tracking-[0.2em] font-semibold mb-1">
                                                    {img.category}
                                                </p>
                                                <p className="text-white font-display font-bold text-xl">{img.title}</p>
                                                <p className="text-white/60 text-sm mt-2 flex items-center gap-1">
                                                    View <span className="inline-block translate-x-0 group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                                                </p>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            ))}
                        </div>

                        <div ref={portfolioLinkRef} className="fade-up text-center mt-14">
                            <Link
                                href="/portfolio"
                                className="group inline-flex items-center gap-3 text-accent text-sm font-semibold uppercase tracking-[0.2em] hover:gap-4 transition-all duration-300 min-h-[44px]"
                            >
                                View All Work
                                <ArrowIcon />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ============== 5. MEET THE PHOTOGRAPHER ============== */}
                <section id="about" className="py-24 md:py-36 px-4 md:px-8 lg:px-16">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
                            {/* Photo — clip reveal */}
                            <div ref={aboutLeftRef} className="clip-reveal relative">
                                <div className="relative">
                                    <div className="absolute -inset-4 md:-inset-6 border border-accent/20 rounded-3xl -rotate-2" />
                                    <div className="absolute -inset-2 md:-inset-3 border border-accent/10 rounded-2xl rotate-1" />
                                    <div className="relative rounded-2xl overflow-hidden rotate-1 hover:rotate-0 transition-transform duration-700">
                                        <img
                                            src="/images/kyle-1.jpg"
                                            alt="Kyle Blackman — Photographer"
                                            className="w-full aspect-[3/4] object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src =
                                                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80';
                                            }}
                                        />
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-accent text-background-dark rounded-2xl px-6 py-4 shadow-xl shadow-accent/20">
                                        <p className="font-display font-extrabold text-2xl leading-none">8+</p>
                                        <p className="text-[10px] uppercase tracking-widest font-semibold mt-1">Years</p>
                                    </div>
                                </div>
                            </div>

                            {/* Text — slide right */}
                            <div ref={aboutRightRef} className="slide-right">
                                <SectionLabel>Meet the Photographer</SectionLabel>
                                <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight leading-none mb-8">
                                    Hi, I'm <span className="text-accent">Kyle Blackman</span>
                                </h2>
                                <p className="text-white/50 text-lg leading-relaxed mb-6 font-light">
                                    {studio?.description ||
                                        "I'm a professional photographer passionate about capturing authentic moments and creating timeless images. Whether it's your wedding day, a family milestone, or a professional headshot, I bring creative vision and genuine care to every session."}
                                </p>
                                <p className="text-white/50 text-lg leading-relaxed mb-10 font-light">
                                    My philosophy is simple — make you feel comfortable, have fun, and let the real moments
                                    unfold. The best photos come from genuine emotions and natural connections.
                                </p>
                                <Link
                                    href="/book"
                                    className="group inline-flex items-center gap-3 text-accent text-sm font-semibold uppercase tracking-[0.2em] hover:gap-4 transition-all duration-300 min-h-[44px]"
                                >
                                    Let's Work Together
                                    <ArrowIcon />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==================== 6. SERVICES ==================== */}
                <section id="services" className="py-24 md:py-36 px-4 md:px-8 lg:px-16 bg-white/[0.02]">
                    <div className="max-w-7xl mx-auto">
                        <div ref={servicesHeaderRef} className="stagger-children text-center mb-16 md:mb-20">
                            <div className="fade-up"><SectionLabel>What I Offer</SectionLabel></div>
                            <h2 className="fade-up font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none mb-6">
                                Services
                            </h2>
                            <p className="fade-up text-white/40 text-lg max-w-xl mx-auto font-light">
                                Every session is tailored to you. From consultation to delivery, I'm dedicated to creating
                                images you'll treasure.
                            </p>
                        </div>

                        <div ref={servicesGridRef} className="stagger-children grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {SERVICES.map((service) => (
                                <div
                                    key={service.title}
                                    className="fade-up group relative rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-8 transition-all duration-500 hover:translate-y-[-12px] hover:scale-[1.03] hover:rotate-[1deg] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] hover:border-accent/20 hover:bg-accent/[0.03]"
                                >
                                    <div className="text-accent/70 mb-6 group-hover:text-accent transition-colors duration-500">
                                        {service.icon}
                                    </div>
                                    <h3 className="font-display text-xl font-bold mb-3 tracking-tight">{service.title}</h3>
                                    <p className="text-white/40 text-sm leading-relaxed font-light">{service.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ================== 7. CTA / BOOKING ================== */}
                <section
                    className="relative py-32 md:py-44 px-4 md:px-8 lg:px-16 overflow-hidden parallax-bg"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80')`,
                    }}
                >
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-primary/80" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" />

                    <div className="relative z-10 max-w-4xl mx-auto text-center">
                        <div ref={ctaContentRef} className="stagger-children">
                            <div className="fade-up"><SectionLabel>Let's Create</SectionLabel></div>
                            <h2 className="fade-up font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none mb-8">
                                Ready to Create Something<br /><span className="text-accent">Beautiful</span>?
                            </h2>
                            <p className="fade-up text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                                Every great photograph starts with a conversation. Tell me about your vision and let's bring
                                it to life together.
                            </p>
                            <div className="fade-up flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    href="/book"
                                    className="group rounded-full bg-accent text-background-dark px-10 py-4 text-sm font-bold uppercase tracking-widest hover:bg-accent/90 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:scale-105 transition-all duration-300 inline-flex items-center gap-3 shadow-lg shadow-accent/25 min-h-[44px]"
                                >
                                    Book Your Session
                                    <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <a
                                    href={`mailto:${studio?.email || 'kyle@kyleblackmanphoto.com'}`}
                                    className="rounded-full border border-white/20 text-white px-10 py-4 text-sm font-bold uppercase tracking-widest hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:scale-105 transition-all duration-300 min-h-[44px]"
                                >
                                    Send an Inquiry
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* ========================= 8. FOOTER ========================= */}
            <footer className="bg-background-dark border-t border-white/[0.06] py-14 px-4 md:px-8 lg:px-16">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        {/* Brand */}
                        <div className="flex items-center gap-3">
                            {studio?.logo_path ? (
                                <img
                                    src={imgSrc(studio.logo_path)}
                                    alt="Logo"
                                    className="w-9 h-9 rounded-lg object-contain"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                                    <CameraIcon className="w-4 h-4 text-accent" />
                                </div>
                            )}
                            <span className="font-display font-bold text-sm text-white/60 tracking-tight">
                                Kyle Blackman Photography
                            </span>
                        </div>

                        {/* Nav links */}
                        <div className="flex items-center gap-8">
                            <Link href="/portfolio" className="text-[11px] uppercase tracking-[0.2em] text-white/30 hover:text-accent transition-colors duration-300 min-h-[44px] inline-flex items-center">
                                Portfolio
                            </Link>
                            <Link href="/book" className="text-[11px] uppercase tracking-[0.2em] text-white/30 hover:text-accent transition-colors duration-300 min-h-[44px] inline-flex items-center">
                                Book
                            </Link>
                            {canLogin && (
                                <Link href={route('login')} className="text-[11px] uppercase tracking-[0.2em] text-white/30 hover:text-accent transition-colors duration-300 min-h-[44px] inline-flex items-center">
                                    Login
                                </Link>
                            )}
                        </div>

                        {/* Social links */}
                        <div className="flex items-center gap-5">
                            <a
                                href={`https://instagram.com/${studio?.social_links?.instagram || 'kyleblackmanphotography_'}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/30 hover:text-accent transition-colors duration-300 min-w-[44px] min-h-[44px] inline-flex items-center justify-center"
                                aria-label="Instagram"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                </svg>
                            </a>
                            {studio?.social_links?.facebook && (
                                <a
                                    href={studio.social_links.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white/30 hover:text-accent transition-colors duration-300 min-w-[44px] min-h-[44px] inline-flex items-center justify-center"
                                    aria-label="Facebook"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </a>
                            )}
                            <a
                                href={`mailto:${studio?.email || 'kyle@kyleblackmanphoto.com'}`}
                                className="text-white/30 hover:text-accent transition-colors duration-300 min-w-[44px] min-h-[44px] inline-flex items-center justify-center"
                                aria-label="Email"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                                    />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-white/[0.04] text-center">
                        <p className="text-[11px] text-white/20 uppercase tracking-[0.2em]">
                            &copy; 2026 Kyle Blackman Photography. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
}
