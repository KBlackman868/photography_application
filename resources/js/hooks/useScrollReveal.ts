import { useEffect, useRef } from 'react';

/**
 * Adds a `.visible` class to the referenced element when it enters the viewport.
 * Fires once then disconnects the observer to keep things lightweight.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
    threshold = 0.15,
): React.RefObject<T> {
    const ref = useRef<T | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add('visible');
                    observer.unobserve(el);
                }
            },
            { threshold },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    return ref as React.RefObject<T>;
}
