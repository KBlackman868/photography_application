import { Head, router } from '@inertiajs/react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import ThumbnailSidebar from '@/Components/ReviewPanel/ThumbnailSidebar';
import PhotoPreviewStage from '@/Components/ReviewPanel/PhotoPreviewStage';
import CommentsSidebar from '@/Components/ReviewPanel/CommentsSidebar';
import ProgressHeader from '@/Components/ReviewPanel/ProgressHeader';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { usePrefetch } from '@/hooks/usePrefetch';
import {
    Gallery,
    Photo,
    Comment,
    GalleryProgress,
    SelectionProgress,
    FilterState,
    PageProps,
} from '@/types';
import axios from 'axios';

interface Props extends PageProps {
    gallery: Gallery;
    photos: { data: Photo[] };
    comments: { data: Comment[] };
    selectedPhotoId: number;
    progress: GalleryProgress;
    selectionProgress: SelectionProgress;
    selectedPhotoIds: number[];
    filters: FilterState;
}

export default function ReviewPanel({
    auth,
    gallery,
    photos: photosResponse,
    comments: commentsResponse,
    selectedPhotoId: initialPhotoId,
    progress: initialProgress,
    selectionProgress: initialSelectionProgress,
    selectedPhotoIds: initialSelectedIds,
    filters: initialFilters,
}: Props) {
    const [photos, setPhotos] = useState<Photo[]>(photosResponse.data || []);
    const [comments, setComments] = useState<Comment[]>(commentsResponse.data || []);
    const [selectedPhotoId, setSelectedPhotoId] = useState<number>(initialPhotoId);
    const [progress, setProgress] = useState<GalleryProgress>(initialProgress);
    const [selectionProgress, setSelectionProgress] = useState<SelectionProgress>(initialSelectionProgress);
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [commentFocused, setCommentFocused] = useState(false);

    const currentIndex = useMemo(
        () => photos.findIndex((p) => p.id === selectedPhotoId),
        [photos, selectedPhotoId],
    );

    const currentPhoto = useMemo(
        () => photos.find((p) => p.id === selectedPhotoId) || null,
        [photos, selectedPhotoId],
    );

    // Prefetch adjacent images
    usePrefetch(photos, currentIndex);

    // Load comments when photo changes
    const loadComments = useCallback(async (photoId: number) => {
        try {
            const response = await axios.get(`/api/photos/${photoId}/comments`);
            setComments(response.data.data);
        } catch (err) {
            console.error('Failed to load comments:', err);
        }
    }, []);

    // Load filtered photos
    const loadPhotos = useCallback(async (newFilters: FilterState) => {
        try {
            const params = new URLSearchParams();
            if (newFilters.search) params.set('search', newFilters.search);
            if (newFilters.favorited) params.set('favorited', '1');
            if (newFilters.has_comments) params.set('has_comments', '1');
            if (newFilters.unresolved_only) params.set('unresolved_only', '1');
            if (newFilters.rating) params.set('rating', String(newFilters.rating));
            if (newFilters.color_label) params.set('color_label', newFilters.color_label);

            const response = await axios.get(
                `/api/galleries/${gallery.id}/photos?${params.toString()}`
            );
            setPhotos(response.data.data);
        } catch (err) {
            console.error('Failed to load photos:', err);
        }
    }, [gallery.id]);

    // Debounced filter change
    useEffect(() => {
        const timeout = setTimeout(() => {
            loadPhotos(filters);
        }, 300);
        return () => clearTimeout(timeout);
    }, [filters, loadPhotos]);

    // Refresh progress
    const refreshProgress = useCallback(async () => {
        try {
            const response = await axios.get(`/api/galleries/${gallery.id}/progress`);
            setProgress(response.data.comments);
            setSelectionProgress(response.data.selection);
        } catch (err) {
            console.error('Failed to refresh progress:', err);
        }
    }, [gallery.id]);

    // Polling for real-time updates (fallback)
    useEffect(() => {
        const interval = setInterval(() => {
            if (selectedPhotoId) {
                loadComments(selectedPhotoId);
            }
            refreshProgress();
        }, 15000); // Poll every 15 seconds

        return () => clearInterval(interval);
    }, [selectedPhotoId, loadComments, refreshProgress]);

    // Navigation
    const goToNext = useCallback(() => {
        if (currentIndex < photos.length - 1) {
            const nextPhoto = photos[currentIndex + 1];
            setSelectedPhotoId(nextPhoto.id);
            loadComments(nextPhoto.id);
        }
    }, [currentIndex, photos, loadComments]);

    const goToPrev = useCallback(() => {
        if (currentIndex > 0) {
            const prevPhoto = photos[currentIndex - 1];
            setSelectedPhotoId(prevPhoto.id);
            loadComments(prevPhoto.id);
        }
    }, [currentIndex, photos, loadComments]);

    // Select photo
    const selectPhoto = useCallback(
        (id: number) => {
            setSelectedPhotoId(id);
            loadComments(id);
        },
        [loadComments],
    );

    // Favorite toggle (optimistic update)
    const handleFavorite = useCallback(async () => {
        if (!currentPhoto) return;

        // Optimistic update
        setPhotos((prev) =>
            prev.map((p) =>
                p.id === currentPhoto.id
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
            await axios.post(`/api/photos/${currentPhoto.id}/favorite`);
        } catch (err) {
            // Revert on failure
            setPhotos((prev) =>
                prev.map((p) =>
                    p.id === currentPhoto.id
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
    }, [currentPhoto]);

    // Comment handlers
    const handleCommentAdded = useCallback(
        (comment: Comment) => {
            if (comment.parent_id) {
                // Add reply to existing thread
                setComments((prev) =>
                    prev.map((c) =>
                        c.id === comment.parent_id
                            ? { ...c, replies: [...(c.replies || []), comment] }
                            : c,
                    ),
                );
            } else {
                setComments((prev) => [...prev, comment]);
            }
            // Update comment count on photo
            setPhotos((prev) =>
                prev.map((p) =>
                    p.id === comment.photo_id
                        ? { ...p, comments_count: p.comments_count + 1 }
                        : p,
                ),
            );
            refreshProgress();
        },
        [refreshProgress],
    );

    const handleCommentResolved = useCallback(
        (commentId: number, resolved: boolean) => {
            setComments((prev) =>
                prev.map((c) =>
                    c.id === commentId
                        ? { ...c, is_resolved: resolved, resolved_at: resolved ? new Date().toISOString() : undefined }
                        : c,
                ),
            );
            refreshProgress();
        },
        [refreshProgress],
    );

    const handleCommentDeleted = useCallback(
        (commentId: number) => {
            setComments((prev) => prev.filter((c) => c.id !== commentId));
            if (currentPhoto) {
                setPhotos((prev) =>
                    prev.map((p) =>
                        p.id === currentPhoto.id
                            ? { ...p, comments_count: Math.max(0, p.comments_count - 1) }
                            : p,
                    ),
                );
            }
            refreshProgress();
        },
        [currentPhoto, refreshProgress],
    );

    // Export handler
    const handleExport = useCallback(
        async (type: string) => {
            try {
                const response = await axios.post(`/api/galleries/${gallery.id}/exports`, { type });
                alert(`Export queued: ${response.data.message}`);
            } catch (err) {
                console.error('Export failed:', err);
                alert('Failed to create export.');
            }
        },
        [gallery.id],
    );

    // Approve selection handler
    const handleApproveSelection = useCallback(async () => {
        try {
            await axios.post(`/api/galleries/${gallery.id}/selection/submit`);
            refreshProgress();
            alert('Selection submitted for review.');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to submit selection.');
        }
    }, [gallery.id, refreshProgress]);

    // Keyboard shortcuts
    useKeyboardShortcuts(
        {
            onNext: goToNext,
            onPrev: goToPrev,
            onFavorite: handleFavorite,
            onComment: () => setCommentFocused(true),
        },
        !commentFocused,
    );

    return (
        <>
            <Head title={`Review - ${gallery.name}`} />

            <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark font-display">
                {/* Top nav */}
                <nav className="bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 h-14 flex items-center justify-between shrink-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary text-white p-1.5 rounded-lg">
                            <span className="material-symbols-outlined text-lg">
                                photo_camera
                            </span>
                        </div>
                        <div>
                            <h1 className="font-bold text-sm tracking-tight">
                                {gallery.project?.name || gallery.name}
                            </h1>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                                Review Panel
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">
                            Photo {currentIndex + 1} of {photos.length}
                        </span>
                        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-xs font-bold">
                            {auth.user.name.charAt(0)}
                        </div>
                    </div>
                </nav>

                {/* Progress header */}
                <ProgressHeader
                    gallery={gallery}
                    progress={progress}
                    selectionProgress={selectionProgress}
                    onExport={handleExport}
                    onApproveSelection={handleApproveSelection}
                />

                {/* Three-column layout */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Thumbnails */}
                    <ThumbnailSidebar
                        photos={photos}
                        selectedPhotoId={selectedPhotoId}
                        onSelectPhoto={selectPhoto}
                        filters={filters}
                        onFiltersChange={setFilters}
                    />

                    {/* Center: Preview */}
                    <PhotoPreviewStage
                        photo={currentPhoto}
                        onPrev={goToPrev}
                        onNext={goToNext}
                        hasPrev={currentIndex > 0}
                        hasNext={currentIndex < photos.length - 1}
                        onFavorite={handleFavorite}
                    />

                    {/* Right: Comments */}
                    <CommentsSidebar
                        comments={comments}
                        photoId={selectedPhotoId}
                        currentUser={auth.user}
                        onCommentAdded={handleCommentAdded}
                        onCommentResolved={handleCommentResolved}
                        onCommentDeleted={handleCommentDeleted}
                    />
                </div>
            </div>
        </>
    );
}
