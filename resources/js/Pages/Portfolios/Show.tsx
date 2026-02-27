import { Head, Link } from '@inertiajs/react';
import { Camera, ArrowLeft } from 'lucide-react';
import { Portfolio, PortfolioPhoto } from '@/types';

interface Props {
    portfolio: Portfolio & { portfolio_photos: PortfolioPhoto[] };
}

// Public view of a single portfolio. Visitors browse all photos in a masonry
// layout with hover captions, and can navigate back to the full portfolio page.

const CATEGORY_LABELS: Record<string, string> = {
    wedding: 'Weddings',
    portrait: 'Portraits',
    event: 'Events',
    commercial: 'Commercial',
    newborn: 'Newborn',
    landscape: 'Landscape',
    other: 'Other',
};

export default function PortfolioShow({ portfolio }: Props) {
    return (
        <>
            <Head title={`${portfolio.title} - Kyle Blackman Photography`} />

            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Camera className="w-5 h-5 text-slate-900" />
                        <span className="font-display font-bold text-sm">Kyle Blackman Photography</span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link href="/portfolio" className="text-sm text-slate-500 hover:text-slate-900 inline-flex items-center gap-1">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            All Portfolios
                        </Link>
                        <Link href="/book" className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-full hover:bg-slate-800">
                            Book Now
                        </Link>
                    </div>
                </div>
            </header>

            <main className="min-h-screen bg-white">
                {/* Hero */}
                <section className="py-16 px-6 text-center">
                    <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
                        {CATEGORY_LABELS[portfolio.category] || portfolio.category}
                    </span>
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900 mt-2 mb-4">
                        {portfolio.title}
                    </h1>
                    {portfolio.description && (
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto">{portfolio.description}</p>
                    )}
                </section>

                {/* Photos */}
                <section className="px-6 pb-20">
                    <div className="max-w-7xl mx-auto">
                        {portfolio.portfolio_photos && portfolio.portfolio_photos.length > 0 ? (
                            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                                {portfolio.portfolio_photos.map((photo) => (
                                    <div key={photo.id} className="break-inside-avoid group relative overflow-hidden rounded-xl">
                                        <img
                                            src={photo.display_url || photo.original_url || (photo.photo_path ? `/storage/${photo.photo_path}` : '')}
                                            alt={photo.caption || portfolio.title}
                                            className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" fill="%23f1f5f9"><rect width="400" height="400"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-size="14" font-family="system-ui">Image not found</text></svg>')}`;
                                                e.currentTarget.onerror = null;
                                            }}
                                        />
                                        {photo.caption && (
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                <p className="text-white text-sm">{photo.caption}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-slate-400">
                                <p>Photos coming soon</p>
                            </div>
                        )}
                    </div>
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
