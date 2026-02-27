import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Gallery, Photo, PageProps } from '@/types';
import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

interface Props extends PageProps {
    gallery: Gallery;
    photos: { data: Photo[]; links: any; meta: any };
}

// View a single gallery's photos in a masonry grid. Admins can drag-and-drop
// upload new photos. Clients can favorite images and jump into the review panel.

export default function GalleryShow({ auth, gallery, photos }: Props) {
    const [photoList, setPhotoList] = useState<Photo[]>(photos.data);
    const [search, setSearch] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragOver, setDragOver] = useState(false);
    const fileInput = useRef<HTMLInputElement>(null);
    const isAdmin = auth.user.role !== 'client';

    const handleFileUpload = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const formData = new FormData();
        Array.from(files).forEach((file) => {
            formData.append('photos[]', file);
        });

        setUploading(true);
        setUploadProgress(0);
        try {
            const response = await axios.post(
                `/api/galleries/${gallery.id}/photos/upload`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (e) => {
                        if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total));
                    },
                },
            );
            setPhotoList((prev) => [...prev, ...response.data.data]);
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
            setUploadProgress(0);
            if (fileInput.current) fileInput.current.value = '';
        }
    }, [gallery.id]);

    const handleFavorite = useCallback(async (photoId: number) => {
        setPhotoList((prev) =>
            prev.map((p) =>
                p.id === photoId
                    ? {
                          ...p,
                          is_favorited: !p.is_favorited,
                          favorites_count: p.is_favorited
                              ? p.favorites_count - 1
                              : p.favorites_count + 1,
                      }
                    : p,
            ),
        );
        try {
            await axios.post(`/api/photos/${photoId}/favorite`);
        } catch {
            setPhotoList((prev) =>
                prev.map((p) =>
                    p.id === photoId
                        ? {
                              ...p,
                              is_favorited: !p.is_favorited,
                              favorites_count: p.is_favorited
                                  ? p.favorites_count - 1
                                  : p.favorites_count + 1,
                          }
                        : p,
                ),
            );
        }
    }, []);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                            <Link href="/galleries" className="hover:text-primary">
                                Galleries
                            </Link>
                            <span className="material-symbols-outlined text-xs">
                                chevron_right
                            </span>
                            <span className="text-slate-900 dark:text-white font-medium">
                                {gallery.name}
                            </span>
                        </nav>
                        <h2 className="text-2xl font-bold tracking-tight">{gallery.name}</h2>
                        {gallery.description && (
                            <p className="text-sm text-slate-500 mt-1">{gallery.description}</p>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={`/galleries/${gallery.id}/review`}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:brightness-110 shadow-lg shadow-primary/20 transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">rate_review</span>
                            Open Review Panel
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={gallery.name} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-6">
                    {/* Stats bar */}
                    <div className="flex items-center gap-6 mb-8 text-sm text-slate-600">
                        <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-primary text-lg">
                                photo_library
                            </span>
                            {gallery.photo_count} Photos
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-lg">
                                {gallery.status === 'approved' ? 'check_circle' : 'pending'}
                            </span>
                            <span className="capitalize">{gallery.status}</span>
                        </span>
                        {gallery.project?.client && (
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-lg">person</span>
                                {gallery.project.client.name}
                            </span>
                        )}
                    </div>

                    {/* Search */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="relative flex-grow max-w-xs">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                                search
                            </span>
                            <input
                                type="text"
                                placeholder="Search filenames..."
                                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none w-full"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Upload zone (admin/editor only) */}
                    {isAdmin && (
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileUpload(e.dataTransfer.files); }}
                            onClick={() => fileInput.current?.click()}
                            className={`mb-8 border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
                                dragOver
                                    ? 'border-primary bg-primary/5'
                                    : 'border-slate-200 hover:border-slate-300 bg-white dark:bg-slate-900'
                            }`}
                        >
                            <input
                                ref={fileInput}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleFileUpload(e.target.files)}
                                className="hidden"
                            />
                            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">
                                {uploading ? 'hourglass_top' : 'cloud_upload'}
                            </span>
                            {uploading ? (
                                <>
                                    <p className="font-semibold text-sm">Uploading... {uploadProgress}%</p>
                                    <div className="mt-3 mx-auto max-w-xs h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="font-semibold text-sm">Drag & drop photos here or click to browse</p>
                                    <p className="text-xs text-slate-400 mt-1">JPG, PNG, GIF, WEBP up to 50MB each</p>
                                </>
                            )}
                        </div>
                    )}

                    {/* Masonry grid */}
                    <div
                        className="columns-1 sm:columns-2 lg:columns-3 gap-6"
                        style={{ columnGap: '1.5rem' }}
                    >
                        {photoList
                            .filter(
                                (p) =>
                                    !search ||
                                    p.filename.toLowerCase().includes(search.toLowerCase()),
                            )
                            .map((photo) => (
                                <div
                                    key={photo.id}
                                    className="break-inside-avoid mb-6 group relative rounded-xl overflow-hidden cursor-zoom-in"
                                >
                                    <img
                                        src={photo.preview_url}
                                        alt={photo.filename}
                                        className="w-full h-auto block transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-white text-xs font-medium opacity-80">
                                                {photo.filename}
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.visit(
                                                            `/galleries/${gallery.id}/review?photo_id=${photo.id}`,
                                                        );
                                                    }}
                                                    className="size-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-primary transition-all flex items-center justify-center"
                                                >
                                                    <span className="material-symbols-outlined text-xl">
                                                        chat_bubble
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleFavorite(photo.id);
                                                    }}
                                                    className={`size-10 rounded-full transition-all flex items-center justify-center ${
                                                        photo.is_favorited
                                                            ? 'bg-primary text-white shadow-lg'
                                                            : 'bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-red-500'
                                                    }`}
                                                >
                                                    <span
                                                        className="material-symbols-outlined text-xl"
                                                        style={{
                                                            fontVariationSettings:
                                                                photo.is_favorited
                                                                    ? "'FILL' 1"
                                                                    : "'FILL' 0",
                                                        }}
                                                    >
                                                        favorite
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>

                    {photoList.length === 0 && (
                        <div className="text-center py-16 text-slate-400">
                            <span className="material-symbols-outlined text-5xl mb-4 block">
                                photo_library
                            </span>
                            <p className="text-lg font-medium">No photos yet</p>
                            <p className="text-sm mt-1">
                                Upload photos to this gallery to get started.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
