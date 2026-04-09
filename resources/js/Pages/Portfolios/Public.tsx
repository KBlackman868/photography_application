import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Camera, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Portfolio, PortfolioPhoto } from '@/types';
import { RadialScrollGallery } from '@/Components/ui/portfolio-and-image-gallery';
import { Badge } from '@/Components/ui/badge';

interface Props {
    portfolios: (Portfolio & { portfolio_photos: PortfolioPhoto[] })[];
}

// Public-facing portfolio gallery that website visitors see. The hero section uses a
// scroll-driven radial wheel to showcase portfolio covers. Below the wheel, visitors
// can filter by category and browse the full grid of portfolios.

const CATEGORY_LABELS: Record<string, string> = {
    wedding: 'Weddings',
    portrait: 'Portraits',
    event: 'Events',
    commercial: 'Commercial',
    newborn: 'Newborn',
    landscape: 'Landscape',
    other: 'Other',
};

const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&q=80',
    'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80',
    'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&q=80',
    'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&q=80',
    'https://images.unsplash.com/photo-1505932794465-147d1f1b2c97?w=400&q=80',
];

function getPortfolioImage(
    portfolio: Portfolio & { portfolio_photos: PortfolioPhoto[] },
    fallbackIndex: number
): string {
    const photo = portfolio.portfolio_photos[0];
    if (photo) {
        return photo.display_url || photo.original_url || (photo.photo_path ? `/storage/${photo.photo_path}` : '');
    }
    return FALLBACK_IMAGES[fallbackIndex % FALLBACK_IMAGES.length];
}

export default function PublicPortfolio({ portfolios }: Props) {
    const categories = [...new Set(portfolios.map((p) => p.category))];
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const filtered = activeCategory
        ? portfolios.filter((p) => p.category === activeCategory)
        : portfolios;

    // Pick up to 8 portfolios for the radial gallery hero
    const galleryItems = portfolios.slice(0, 8).map((p, i) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        cat: CATEGORY_LABELS[p.category] || p.category,
        img: getPortfolioImage(p, i),
    }));

    return (
        <>
            <Head title="Portfolio - Kyle Blackman Photography" />

            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Camera className="w-5 h-5 text-slate-900" />
                        <span className="font-display font-bold text-sm">Kyle Blackman Photography</span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">Home</Link>
                        <Link href="/book" className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-full hover:bg-slate-800">
                            Book Now
                        </Link>
                    </div>
                </div>
            </header>

            <main className="min-h-screen bg-white">
                {/* ── Radial Gallery Hero ── */}
                <div className="bg-background min-h-[600px] text-foreground overflow-hidden w-full">
                    <div className="h-[280px] flex flex-col items-center justify-center space-y-4 pt-8">
                        <div className="space-y-1 text-center">
                            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                Portfolio
                            </span>
                            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tighter text-slate-900">
                                My Work
                            </h1>
                            <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
                                Scroll to explore — hover to focus
                            </p>
                        </div>
                        <div className="animate-bounce text-muted-foreground text-xs">↓ Scroll</div>
                    </div>

                    {galleryItems.length > 0 ? (
                        <RadialScrollGallery
                            className="!min-h-[600px]"
                            baseRadius={400}
                            mobileRadius={250}
                            visiblePercentage={50}
                            scrollDuration={2000}
                            onItemSelect={(index) => {
                                const item = galleryItems[index];
                                if (item) window.location.href = `/portfolio/${item.slug}`;
                            }}
                        >
                            {(hoveredIndex) =>
                                galleryItems.map((item, index) => {
                                    const isActive = hoveredIndex === index;
                                    return (
                                        <div
                                            key={item.id}
                                            className="group relative w-[180px] h-[250px] sm:w-[220px] sm:h-[300px] overflow-hidden rounded-xl bg-slate-100 border border-slate-200 shadow-lg"
                                        >
                                            <div className="absolute inset-0 overflow-hidden">
                                                <img
                                                    src={item.img}
                                                    alt={item.title}
                                                    className={`h-full w-full object-cover transition-transform duration-700 ease-out ${
                                                        isActive ? 'scale-110' : 'scale-100 grayscale-[20%]'
                                                    }`}
                                                    onError={(e) => {
                                                        e.currentTarget.src = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
                                                        e.currentTarget.onerror = null;
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-70" />
                                            </div>

                                            <div className="absolute inset-0 flex flex-col justify-between p-4">
                                                <div className="flex justify-between items-start">
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px] px-2 py-0 bg-white/80 backdrop-blur text-slate-700 border-0"
                                                    >
                                                        {item.cat}
                                                    </Badge>
                                                    <div className={`w-6 h-6 rounded-full bg-white text-slate-900 flex items-center justify-center transition-all duration-500 ${isActive ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-45'}`}>
                                                        <ArrowUpRight size={12} />
                                                    </div>
                                                </div>

                                                <div className={`transition-transform duration-500 ${isActive ? 'translate-y-0' : 'translate-y-2'}`}>
                                                    <h3 className="text-lg font-bold leading-tight text-white">{item.title}</h3>
                                                    <div className={`h-0.5 bg-white mt-2 transition-all duration-500 ${isActive ? 'w-full opacity-100' : 'w-0 opacity-0'}`} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </RadialScrollGallery>
                    ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center text-slate-400">
                            <Camera className="w-12 h-12 mb-4 opacity-30" />
                            <p className="text-lg">No portfolios yet — check back soon.</p>
                        </div>
                    )}
                </div>

                {/* Category filters */}
                <section className="px-6 py-8 border-b border-slate-100 sticky top-[65px] bg-white z-40">
                    <div className="max-w-7xl mx-auto flex gap-3 overflow-x-auto pb-2">
                        <button
                            onClick={() => setActiveCategory(null)}
                            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                                activeCategory === null
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            All Work
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                                    activeCategory === cat
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {CATEGORY_LABELS[cat] || cat}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Portfolio sections */}
                <section className="px-6 py-16">
                    <div className="max-w-7xl mx-auto">
                        {filtered.length === 0 ? (
                            <div className="text-center py-20 text-slate-400">
                                <p className="text-lg">No portfolios available yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-20">
                                {filtered.map((portfolio) => (
                                    <div key={portfolio.id}>
                                        <div className="flex items-end justify-between mb-8">
                                            <div>
                                                <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
                                                    {CATEGORY_LABELS[portfolio.category] || portfolio.category}
                                                </span>
                                                <h2 className="font-display text-3xl font-bold text-slate-900 mt-1">
                                                    {portfolio.title}
                                                </h2>
                                                {portfolio.description && (
                                                    <p className="text-slate-500 mt-2 max-w-lg">{portfolio.description}</p>
                                                )}
                                            </div>
                                            <Link
                                                href={`/portfolio/${portfolio.slug}`}
                                                className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
                                            >
                                                View all
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>

                                        {portfolio.portfolio_photos && portfolio.portfolio_photos.length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {portfolio.portfolio_photos.slice(0, 8).map((photo, index) => (
                                                    <div
                                                        key={photo.id}
                                                        className={`group relative overflow-hidden rounded-xl ${
                                                            index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                                                        }`}
                                                    >
                                                        <div className={`aspect-square bg-slate-100 ${index === 0 ? 'md:aspect-auto md:h-full' : ''}`}>
                                                            <img
                                                                src={photo.display_url || photo.original_url || (photo.photo_path ? `/storage/${photo.photo_path}` : '')}
                                                                alt={photo.caption || portfolio.title}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                loading="lazy"
                                                                onError={(e) => {
                                                                    e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" fill="%23f1f5f9"><rect width="400" height="400"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-size="14" font-family="system-ui">Image not found</text></svg>')}`;
                                                                    e.currentTarget.onerror = null;
                                                                }}
                                                            />
                                                        </div>
                                                        {photo.caption && (
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                                <p className="text-white text-sm">{photo.caption}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-slate-50 rounded-2xl py-16 text-center text-slate-400">
                                                <p>Photos coming soon</p>
                                            </div>
                                        )}

                                        <Link
                                            href={`/portfolio/${portfolio.slug}`}
                                            className="md:hidden inline-flex items-center gap-1.5 text-sm font-medium text-primary mt-4 hover:gap-2.5 transition-all"
                                        >
                                            View all photos
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-slate-900 py-20 px-6 text-center">
                    <h2 className="font-display text-3xl font-bold text-white mb-4">
                        Love what you see?
                    </h2>
                    <p className="text-white/60 mb-8 max-w-md mx-auto">
                        Let's create something beautiful together. Book your session today.
                    </p>
                    <Link
                        href="/book"
                        className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-white/90 transition-colors"
                    >
                        Book a Session
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-100 py-8 px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-400">Kyle Blackman Photography</span>
                    </div>
                    <p className="text-xs text-slate-400">
                        &copy; {new Date().getFullYear()} All rights reserved.
                    </p>
                </div>
            </footer>
        </>
    );
}
