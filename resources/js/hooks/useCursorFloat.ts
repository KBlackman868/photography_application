import { useEffect, useRef, useState, useCallback } from 'react';

interface CursorFloatOptions {
    defaultText?: string;
}

/**
 * Mouse-following floating text with lerp smoothing.
 * Only active on devices with a fine pointer (desktop).
 * Returns a ref to attach to the floating element and a setter for the text.
 */
export function useCursorFloat(options: CursorFloatOptions = {}) {
    const { defaultText = 'Explore' } = options;
    const floatRef = useRef<HTMLDivElement>(null);
    const [cursorText, setCursorText] = useState(defaultText);
    const [visible, setVisible] = useState(false);

    const mousePos = useRef({ x: 0, y: 0 });
    const currentPos = useRef({ x: 0, y: 0 });
    const rafRef = useRef<number>(0);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        mousePos.current = { x: e.clientX, y: e.clientY };
        if (!visible) setVisible(true);
    }, [visible]);

    const handleMouseLeave = useCallback(() => {
        setVisible(false);
    }, []);

    useEffect(() => {
        // Only enable on devices with fine pointer
        if (!window.matchMedia('(pointer: fine)').matches) return;

        function animate() {
            const el = floatRef.current;
            if (el) {
                currentPos.current.x += (mousePos.current.x - currentPos.current.x) * 0.1;
                currentPos.current.y += (mousePos.current.y - currentPos.current.y) * 0.1;

                el.style.transform = `translate(${currentPos.current.x + 16}px, ${currentPos.current.y + 16}px)`;
            }
            rafRef.current = requestAnimationFrame(animate);
        }

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);
        rafRef.current = requestAnimationFrame(animate);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(rafRef.current);
        };
    }, [handleMouseMove, handleMouseLeave]);

    return { floatRef, cursorText, setCursorText, visible };
}
