import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Camera, ArrowRight } from 'lucide-react';
import { Portfolio, PortfolioPhoto } from '@/types';

interface Props {
    portfolios: (Portfolio & { portfolio_photos: PortfolioPhoto[] })[];
}

const CATEGORY_LABELS: Record<string, string> = {
    wedding: 'Weddings',
    portrait: 'Portraits',
    event: 'Events',
    commercial: 'Commercial',
    newborn: 'Newborn',
    landscape: 'Landscape',
    other: 'Other',
};

export default function PublicPortfolio({ portfolios }: Props) {
    const categories = [...new Set(portfolios.map((p) => p.category))];
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const filtered = activeCategory
        ? portfolios.filter((p) => p.category === activeCategory)
        : portfolios;

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
                {/* Hero */}
                <section className="py-20 px-6 text-center bg-gray-50">
                    <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">
                        My Work
                    </p>
                    <h1 className="font-display text-4xl md:text-6xl font-bold text-slate-900 mb-4">
                        Portfolio
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Browse through my recent work organized by category. Every session tells a unique story.
                    </p>
                </section>

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
                                        {/* Section header */}
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

                                        {/* Photo grid */}
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
                                                                src={photo.photo_path.startsWith('http') ? photo.photo_path : `/storage/${photo.photo_path}`}
                                                                alt={photo.caption || portfolio.title}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
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
