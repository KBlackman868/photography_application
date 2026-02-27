import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Gallery, PageProps } from '@/types';

interface Props extends PageProps {
    galleries: { data: Gallery[] };
}

// Lists all photo galleries as cards with cover images and status badges.
// Admins can create new galleries and delete existing ones.

export default function GalleriesIndex({ auth, galleries }: Props) {
    const galleryList = galleries.data || [];
    const isAdmin = auth.user.role !== 'client';
    const [deleting, setDeleting] = useState<number | null>(null);

    const handleDelete = (gallery: Gallery) => {
        if (!confirm(`Are you sure you want to delete "${gallery.name}"? This cannot be undone.`)) return;
        setDeleting(gallery.id);
        router.delete(`/galleries/${gallery.id}`, {
            onFinish: () => setDeleting(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Galleries</h2>
                    {isAdmin && (
                        <Link
                            href="/galleries/create"
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:brightness-110 shadow-lg shadow-primary/20 transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            New Gallery
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Galleries" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-6">
                    {galleryList.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <span className="material-symbols-outlined text-5xl mb-4 block">
                                photo_library
                            </span>
                            <p className="text-lg font-medium">No galleries yet</p>
                            <p className="text-sm mt-1">Create your first gallery to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {galleryList.map((gallery) => (
                                <div
                                    key={gallery.id}
                                    className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all"
                                >
                                    <Link href={`/galleries/${gallery.id}`}>
                                        {/* Cover */}
                                        <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                                            {gallery.cover_photo_path ? (
                                                <img
                                                    src={gallery.cover_photo_path}
                                                    alt={gallery.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <span className="material-symbols-outlined text-4xl">
                                                        photo_library
                                                    </span>
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3">
                                                <span
                                                    className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                                                        {
                                                            draft: 'bg-slate-100 text-slate-600',
                                                            published: 'bg-green-100 text-green-700',
                                                            review: 'bg-amber-100 text-amber-700',
                                                            approved: 'bg-primary/10 text-primary',
                                                            archived: 'bg-slate-100 text-slate-500',
                                                        }[gallery.status] || 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {gallery.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="p-4">
                                            <h3 className="font-bold text-lg truncate">
                                                {gallery.name}
                                            </h3>
                                            {gallery.project && (
                                                <p className="text-sm text-slate-500 mt-0.5">
                                                    {gallery.project.name}
                                                    {gallery.project.client && (
                                                        <span> &middot; {gallery.project.client.name}</span>
                                                    )}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">
                                                        photo
                                                    </span>
                                                    {gallery.photo_count}
                                                </span>
                                                {gallery.selection_limit && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">
                                                            check_box
                                                        </span>
                                                        {gallery.selection_limit} max
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Delete button */}
                                    {isAdmin && (
                                        <button
                                            onClick={(e) => { e.preventDefault(); handleDelete(gallery); }}
                                            disabled={deleting === gallery.id}
                                            className="absolute top-3 left-3 w-8 h-8 bg-red-500/90 text-white rounded-full text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                                            title="Delete gallery"
                                        >
                                            <span className="material-symbols-outlined text-base">delete</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
