import { Photo, FilterState } from '@/types';
import { useState, useMemo } from 'react';

// Thumbnail grid sidebar for the review panel. Provides search, quick-filter
// buttons (favorites, comments, unresolved), and color-label filters so
// clients and admins can quickly find specific photos during review.

interface Props {
    photos: Photo[];
    selectedPhotoId: number;
    onSelectPhoto: (id: number) => void;
    filters: FilterState;
    onFiltersChange: (filters: FilterState) => void;
}

export default function ThumbnailSidebar({
    photos,
    selectedPhotoId,
    onSelectPhoto,
    filters,
    onFiltersChange,
}: Props) {
    const [searchFocused, setSearchFocused] = useState(false);

    const colorLabels = [
        { value: '', label: 'All', color: 'bg-slate-300' },
        { value: 'red', label: 'Red', color: 'bg-red-500' },
        { value: 'green', label: 'Green', color: 'bg-green-500' },
        { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
        { value: 'yellow', label: 'Yellow', color: 'bg-yellow-500' },
        { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    ];

    return (
        <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Search photos..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        value={filters.search}
                        onChange={(e) =>
                            onFiltersChange({ ...filters, search: e.target.value })
                        }
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                    />
                </div>

                {/* Quick filters */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                    <button
                        onClick={() =>
                            onFiltersChange({
                                ...filters,
                                favorited: !filters.favorited,
                            })
                        }
                        className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                            filters.favorited
                                ? 'bg-primary text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                    >
                        <span className="material-symbols-outlined text-xs align-middle mr-0.5" style={{ fontSize: '14px', fontVariationSettings: filters.favorited ? "'FILL' 1" : "'FILL' 0" }}>
                            favorite
                        </span>
                        Favorites
                    </button>
                    <button
                        onClick={() =>
                            onFiltersChange({
                                ...filters,
                                has_comments: !filters.has_comments,
                            })
                        }
                        className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                            filters.has_comments
                                ? 'bg-primary text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                    >
                        <span className="material-symbols-outlined text-xs align-middle mr-0.5" style={{ fontSize: '14px' }}>
                            chat_bubble
                        </span>
                        Comments
                    </button>
                    <button
                        onClick={() =>
                            onFiltersChange({
                                ...filters,
                                unresolved_only: !filters.unresolved_only,
                            })
                        }
                        className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                            filters.unresolved_only
                                ? 'bg-amber-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                    >
                        Unresolved
                    </button>
                </div>

                {/* Color label filter */}
                <div className="flex gap-1 mt-2">
                    {colorLabels.map((cl) => (
                        <button
                            key={cl.value}
                            onClick={() =>
                                onFiltersChange({
                                    ...filters,
                                    color_label: filters.color_label === cl.value ? undefined : cl.value,
                                })
                            }
                            className={`w-5 h-5 rounded-full ${cl.color} transition-all ${
                                filters.color_label === cl.value
                                    ? 'ring-2 ring-offset-1 ring-primary scale-110'
                                    : 'opacity-60 hover:opacity-100'
                            }`}
                            title={cl.label}
                        />
                    ))}
                </div>
            </div>

            {/* Thumbnail grid */}
            <div className="flex-1 overflow-y-auto p-2">
                <div className="grid grid-cols-2 gap-1.5">
                    {photos.map((photo) => (
                        <ThumbnailItem
                            key={photo.id}
                            photo={photo}
                            isSelected={photo.id === selectedPhotoId}
                            onClick={() => onSelectPhoto(photo.id)}
                        />
                    ))}
                </div>

                {photos.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        No photos match your filters.
                    </div>
                )}
            </div>

            {/* Photo count */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-center font-medium">
                {photos.length} photo{photos.length !== 1 ? 's' : ''}
            </div>
        </aside>
    );
}

function ThumbnailItem({
    photo,
    isSelected,
    onClick,
}: {
    photo: Photo;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`relative rounded-lg overflow-hidden aspect-square group transition-all ${
                isSelected
                    ? 'ring-2 ring-primary ring-offset-1 shadow-lg'
                    : 'hover:ring-1 hover:ring-slate-300'
            }`}
        >
            <img
                src={photo.thumb_url}
                alt={photo.filename}
                className="w-full h-full object-cover"
                loading="lazy"
            />

            {/* Badges */}
            <div className="absolute top-1 right-1 flex flex-col gap-0.5">
                {photo.is_favorited && (
                    <span className="size-5 rounded-full bg-primary text-white flex items-center justify-center">
                        <span className="material-symbols-outlined" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>
                            favorite
                        </span>
                    </span>
                )}
                {photo.comments_count > 0 && (
                    <span className="size-5 rounded-full bg-white/90 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                        {photo.comments_count}
                    </span>
                )}
            </div>

            {/* Color label indicator */}
            {photo.color_label && (
                <div
                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                        {
                            red: 'bg-red-500',
                            green: 'bg-green-500',
                            blue: 'bg-blue-500',
                            yellow: 'bg-yellow-500',
                            purple: 'bg-purple-500',
                        }[photo.color_label] || 'bg-slate-400'
                    }`}
                />
            )}

            {/* Filename on hover */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-[10px] font-medium truncate block">
                    {photo.filename}
                </span>
            </div>
        </button>
    );
}
