import { Photo } from '@/types';
import { useState, useRef, useCallback } from 'react';

interface Props {
    photo: Photo | null;
    onPrev: () => void;
    onNext: () => void;
    hasPrev: boolean;
    hasNext: boolean;
    onFavorite: () => void;
}

export default function PhotoPreviewStage({
    photo,
    onPrev,
    onNext,
    hasPrev,
    hasNext,
    onFavorite,
}: Props) {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

    const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 4));
    const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
    const handleResetZoom = () => {
        setZoom(1);
        setRotation(0);
        setDragOffset({ x: 0, y: 0 });
    };
    const handleRotate = () => setRotation((r) => (r + 90) % 360);

    const handleFullscreen = useCallback(() => {
        if (!containerRef.current) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
            setIsFullscreen(false);
        } else {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        }
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom <= 1) return;
        setIsDragging(true);
        dragStart.current = {
            x: e.clientX,
            y: e.clientY,
            offsetX: dragOffset.x,
            offsetY: dragOffset.y,
        };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setDragOffset({
            x: dragStart.current.offsetX + (e.clientX - dragStart.current.x),
            y: dragStart.current.offsetY + (e.clientY - dragStart.current.y),
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (!photo) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-100 dark:bg-slate-950">
                <p className="text-slate-400">Select a photo to preview</p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950 relative overflow-hidden"
        >
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-10">
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleZoomOut}
                        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                        title="Zoom out"
                    >
                        <span className="material-symbols-outlined text-xl">zoom_out</span>
                    </button>
                    <button
                        onClick={handleResetZoom}
                        className="px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 min-w-[3rem] text-center"
                    >
                        {Math.round(zoom * 100)}%
                    </button>
                    <button
                        onClick={handleZoomIn}
                        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                        title="Zoom in"
                    >
                        <span className="material-symbols-outlined text-xl">zoom_in</span>
                    </button>
                    <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
                    <button
                        onClick={handleRotate}
                        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                        title="Rotate"
                    >
                        <span className="material-symbols-outlined text-xl">rotate_right</span>
                    </button>
                    <button
                        onClick={handleFullscreen}
                        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                        title="Fullscreen"
                    >
                        <span className="material-symbols-outlined text-xl">
                            {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                        </span>
                    </button>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-medium">{photo.filename}</span>
                    {photo.exif_data?.camera && (
                        <>
                            <span className="text-slate-300">|</span>
                            <span>{photo.exif_data.camera}</span>
                        </>
                    )}
                    {photo.exif_data?.aperture && (
                        <span>f/{photo.exif_data.aperture}</span>
                    )}
                    {photo.exif_data?.shutter_speed && (
                        <span>{photo.exif_data.shutter_speed}s</span>
                    )}
                    {photo.exif_data?.iso && <span>ISO {photo.exif_data.iso}</span>}
                    {photo.width && photo.height && (
                        <span>
                            {photo.width}x{photo.height}
                        </span>
                    )}
                </div>

                <button
                    onClick={onFavorite}
                    className={`p-1.5 rounded-md transition-colors ${
                        photo.is_favorited
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'
                    }`}
                    title="Toggle favorite (F)"
                >
                    <span
                        className="material-symbols-outlined text-xl"
                        style={{
                            fontVariationSettings: photo.is_favorited
                                ? "'FILL' 1"
                                : "'FILL' 0",
                        }}
                    >
                        favorite
                    </span>
                </button>
            </div>

            {/* Image Area */}
            <div
                className={`flex-1 flex items-center justify-center relative ${
                    zoom > 1 ? 'cursor-grab' : ''
                } ${isDragging ? 'cursor-grabbing' : ''}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <img
                    src={photo.preview_url}
                    alt={photo.filename}
                    className="max-w-full max-h-full object-contain select-none transition-transform duration-200"
                    style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg) translate(${dragOffset.x / zoom}px, ${dragOffset.y / zoom}px)`,
                    }}
                    draggable={false}
                />

                {/* Prev/Next buttons */}
                {hasPrev && (
                    <button
                        onClick={onPrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-lg text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined text-2xl">chevron_left</span>
                    </button>
                )}
                {hasNext && (
                    <button
                        onClick={onNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-lg text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined text-2xl">chevron_right</span>
                    </button>
                )}
            </div>

            {/* Bottom meta bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                        {photo.favorites_count}
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">chat_bubble</span>
                        {photo.comments_count}
                    </span>
                    {photo.rating && (
                        <span className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <span
                                    key={i}
                                    className={`material-symbols-outlined text-sm ${
                                        i < photo.rating! ? 'text-amber-400' : 'text-slate-300'
                                    }`}
                                    style={{ fontVariationSettings: i < photo.rating! ? "'FILL' 1" : "'FILL' 0" }}
                                >
                                    star
                                </span>
                            ))}
                        </span>
                    )}
                </div>
                <div className="text-xs text-slate-400">
                    <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono">J</kbd>
                    <span className="mx-1">/</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono">K</kbd>
                    <span className="ml-1 mr-3">navigate</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono">F</kbd>
                    <span className="ml-1 mr-3">favorite</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono">C</kbd>
                    <span className="ml-1">comment</span>
                </div>
            </div>
        </div>
    );
}
