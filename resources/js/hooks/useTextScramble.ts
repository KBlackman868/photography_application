import { useState, useEffect, useRef } from 'react';

const CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Scramble-resolve text animation.
 * Characters start random and lock in left-to-right over the given duration.
 */
export function useTextScramble(
    finalText: string,
    duration = 1800,
    tickInterval = 35,
): { text: string; done: boolean } {
    const [text, setText] = useState('');
    const [done, setDone] = useState(false);
    const frameRef = useRef<number>(0);

    useEffect(() => {
        let locked = 0;
        const totalChars = finalText.length;
        const lockInterval = duration / totalChars;
        const startTime = performance.now();

        function tick() {
            const elapsed = performance.now() - startTime;
            locked = Math.min(totalChars, Math.floor(elapsed / lockInterval));

            let result = '';
            for (let i = 0; i < totalChars; i++) {
                if (i < locked) {
                    result += finalText[i];
                } else if (finalText[i] === ' ') {
                    result += ' ';
                } else {
                    result += CHARS[Math.floor(Math.random() * CHARS.length)];
                }
            }

            setText(result);

            if (locked >= totalChars) {
                setText(finalText);
                setDone(true);
                return;
            }

            frameRef.current = window.setTimeout(tick, tickInterval);
        }

        // Kick off with a small delay so the component mounts first
        frameRef.current = window.setTimeout(tick, 100);

        return () => {
            window.clearTimeout(frameRef.current);
        };
    }, [finalText, duration, tickInterval]);

    return { text, done };
}
