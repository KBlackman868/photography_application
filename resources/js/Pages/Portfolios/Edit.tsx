import { useState, useRef } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Portfolio, PortfolioPhoto, PageProps } from '@/types';

interface Props extends PageProps {
    portfolio: Portfolio & { portfolio_photos: PortfolioPhoto[] };
}

// Portfolio editor. Upload photos via drag-and-drop, set a cover image,
// add captions, and toggle publish status. Changes appear on the public site.

export default function PortfolioEdit({ portfolio }: Props) {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInput = useRef<HTMLInputElement>(null);

    const { data, setData, put, processing, errors } = useForm({
        title: portfolio.title,
        description: portfolio.description || '',
        category: portfolio.category,
        is_published: portfolio.is_published,
    });

    const handleUpdateInfo = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/portfolios/${portfolio.id}`);
    };

    const handleFileUpload = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const formData = new FormData();
        Array.from(files).forEach((file) => {
            formData.append('photos[]', file);
        });

        setUploading(true);
        router.post(`/portfolios/${portfolio.id}/photos`, formData, {
            forceFormData: true,
            onFinish: () => setUploading(false),
        });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleFileUpload(e.dataTransfer.files);
    };

    const handleDeletePhoto = (photoId: number) => {
        if (!confirm('Delete this photo?')) return;
        router.delete(`/portfolios/${portfolio.id}/photos/${photoId}`);
    };

    const handleSetCover = (photoId: number) => {
        router.post(`/portfolios/${portfolio.id}/cover`, { photo_id: photoId });
    };

    const handleCaptionUpdate = (photoId: number, caption: string) => {
        router.patch(`/portfolios/${portfolio.id}/photos/${photoId}/caption`, { caption });
    };

    const photos = portfolio.portfolio_photos || [];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link href="/portfolios" className="text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{portfolio.title}</h2>
                        <p className="text-sm text-slate-500">{photos.length} photos &middot; {portfolio.is_published ? 'Published' : 'Draft'}</p>
                    </div>
                </div>
            }
        >
            <Head title={`Edit ${portfolio.title}`} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left: Photo upload & grid */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Upload area */}
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors cursor-pointer ${
                                    dragOver
                                        ? 'border-primary bg-primary/5'
                                        : 'border-slate-200 hover:border-slate-300 bg-white dark:bg-slate-900'
                                }`}
                                onClick={() => fileInput.current?.click()}
                            >
                                <input
                                    ref={fileInput}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handleFileUpload(e.target.files)}
                                    className="hidden"
                                />
                                <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">
                                    {uploading ? 'hourglass_top' : 'cloud_upload'}
                                </span>
                                <p className="font-semibold text-sm">
                                    {uploading ? 'Uploading...' : 'Drag & drop photos here or click to browse'}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    JPG, PNG, GIF, WEBP up to 10MB each. Select multiple files at once.
                                </p>
                            </div>

                            {/* Photo grid */}
                            {photos.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {photos.map((photo) => {
                                        const photoSrc = photo.thumb_url || photo.display_url || photo.original_url || (photo.photo_path ? `/storage/${photo.photo_path}` : '');
                                        const isCover = portfolio.cover_photo_path === photo.thumb_url || portfolio.cover_photo_path === photo.photo_path;
                                        return (
                                            <div key={photo.id} className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                                <div className="aspect-square overflow-hidden">
                                                    <img
                                                        src={photoSrc}
                                                        alt={photo.caption || 'Portfolio photo'}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" fill="%23f1f5f9"><rect width="400" height="400"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-size="14" font-family="system-ui">Image not found</text></svg>')}`;
                                                            e.currentTarget.onerror = null;
                                                        }}
                                                    />
                                                </div>

                                                {/* Cover badge */}
                                                {isCover && (
                                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-md uppercase">
                                                        Cover
                                                    </div>
                                                )}

                                                {/* Action buttons overlay */}
                                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!isCover && (
                                                        <button
                                                            onClick={() => handleSetCover(photo.id)}
                                                            title="Set as cover"
                                                            className="size-8 rounded-lg bg-white/90 backdrop-blur-sm text-slate-600 flex items-center justify-center hover:bg-white shadow-sm"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">star</span>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeletePhoto(photo.id)}
                                                        title="Delete photo"
                                                        className="size-8 rounded-lg bg-white/90 backdrop-blur-sm text-red-500 flex items-center justify-center hover:bg-white shadow-sm"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                    </button>
                                                </div>

                                                {/* Caption */}
                                                <div className="p-2">
                                                    <input
                                                        type="text"
                                                        defaultValue={photo.caption || ''}
                                                        placeholder="Add caption..."
                                                        onBlur={(e) => {
                                                            if (e.target.value !== (photo.caption || '')) {
                                                                handleCaptionUpdate(photo.id, e.target.value);
                                                            }
                                                        }}
                                                        className="w-full text-xs border-0 p-0 focus:ring-0 text-slate-500 placeholder:text-slate-300 bg-transparent"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-16 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                    <span className="material-symbols-outlined text-5xl mb-3 block">photo_library</span>
                                    <p className="font-medium">No photos yet</p>
                                    <p className="text-sm mt-1">Upload photos to start building this portfolio.</p>
                                </div>
                            )}
                        </div>

                        {/* Right: Portfolio info */}
                        <div className="space-y-6">
                            <form onSubmit={handleUpdateInfo} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                                <h3 className="font-bold text-lg">Portfolio Details</h3>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                                    />
                                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                    <select
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-primary"
                                    >
                                        {['wedding', 'portrait', 'event', 'commercial', 'newborn', 'landscape', 'other'].map((c) => (
                                            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary"
                                        rows={4}
                                    />
                                </div>

                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={data.is_published}
                                        onChange={(e) => setData('is_published', e.target.checked)}
                                        className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
                                    />
                                    Published (visible on public portfolio page)
                                </label>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:brightness-110 disabled:opacity-50 transition-all"
                                >
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>

                            {/* Quick info */}
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-5 text-sm space-y-2">
                                <h4 className="font-semibold text-slate-600">How it works</h4>
                                <ul className="space-y-1.5 text-slate-500 text-xs">
                                    <li>&#8226; Upload photos here and they'll appear on the public portfolio page automatically</li>
                                    <li>&#8226; Set one photo as the cover (it shows on the portfolio card)</li>
                                    <li>&#8226; Add captions for context</li>
                                    <li>&#8226; Toggle "Published" to show/hide on the public site</li>
                                    <li>&#8226; Categories group your work on the public portfolio page</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
