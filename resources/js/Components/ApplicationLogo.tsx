import { ImgHTMLAttributes } from 'react';

export default function ApplicationLogo(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/images/logo.png"
            alt="Kyle Blackman Photography"
            onError={(e) => {
                // Fallback to text if image not found
                const parent = e.currentTarget.parentElement;
                if (parent) {
                    e.currentTarget.style.display = 'none';
                    const fallback = document.createElement('span');
                    fallback.className = 'font-bold text-lg tracking-tight';
                    fallback.textContent = 'KB Photography';
                    parent.appendChild(fallback);
                }
            }}
        />
    );
}
