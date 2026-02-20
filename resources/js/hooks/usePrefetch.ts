import { useEffect, useRef } from 'react';
import { Photo } from '@/types';

export function usePrefetch(photos: Photo[], currentIndex: number) {
    const prefetchedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const prefetchImage = (url: string) => {
            if (prefetchedRef.current.has(url)) return;
            const img = new Image();
            img.src = url;
            prefetchedRef.current.add(url);
        };

        // Prefetch next and previous images
        const nextIndex = currentIndex + 1;
        const prevIndex = currentIndex - 1;

        if (nextIndex < photos.length) {
            prefetchImage(photos[nextIndex].preview_url);
        }
        if (prevIndex >= 0) {
            prefetchImage(photos[prevIndex].preview_url);
        }

        // Prefetch two ahead for smoother browsing
        const nextNext = currentIndex + 2;
        if (nextNext < photos.length) {
            prefetchImage(photos[nextNext].preview_url);
        }
    }, [photos, currentIndex]);
}
