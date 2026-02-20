import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
    onNext?: () => void;
    onPrev?: () => void;
    onFavorite?: () => void;
    onComment?: () => void;
    onResolve?: () => void;
    onFullscreen?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers, enabled = true) {
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            // Don't trigger when typing in inputs
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                e.target instanceof HTMLSelectElement
            ) {
                return;
            }

            switch (e.key.toLowerCase()) {
                case 'j':
                case 'arrowright':
                    e.preventDefault();
                    handlers.onNext?.();
                    break;
                case 'k':
                case 'arrowleft':
                    e.preventDefault();
                    handlers.onPrev?.();
                    break;
                case 'f':
                    e.preventDefault();
                    handlers.onFavorite?.();
                    break;
                case 'c':
                    e.preventDefault();
                    handlers.onComment?.();
                    break;
                case 'r':
                    e.preventDefault();
                    handlers.onResolve?.();
                    break;
                case 'escape':
                    handlers.onFullscreen?.();
                    break;
            }
        },
        [handlers],
    );

    useEffect(() => {
        if (!enabled) return;
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown, enabled]);
}
