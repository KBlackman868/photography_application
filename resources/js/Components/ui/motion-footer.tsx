import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// -------------------------------------------------------------------------
// INLINE STYLES
// -------------------------------------------------------------------------
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.cinematic-footer-wrapper {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
  100% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.8; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.animate-footer-breathe {
  animation: footer-breathe 8s ease-in-out infinite alternate;
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 40s linear infinite;
}

.footer-bg-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

.footer-aurora {
  background: radial-gradient(
    ellipse 80% 60% at 50% 100%,
    rgba(212,175,55,0.12) 0%,
    rgba(212,175,55,0.04) 50%,
    transparent 70%
  );
}

.footer-glass-pill {
  background: rgba(255,255,255,0.05);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.2);
  box-shadow: 0 16px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
}

.footer-giant-bg-text {
  font-size: 20vw;
  line-height: 0.8;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255,255,255,0.04);
  background: linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 70%);
  -webkit-background-clip: text;
  background-clip: text;
  user-select: none;
  pointer-events: none;
  white-space: nowrap;
}

.footer-text-glow {
  background: linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.5) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 30px rgba(255,255,255,0.1));
}
`;

// -------------------------------------------------------------------------
// MAGNETIC BUTTON
// -------------------------------------------------------------------------
type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const element = localRef.current;
      if (!element) return;

      const ctx = gsap.context(() => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const h = rect.width / 2;
          const w = rect.height / 2;
          const x = e.clientX - rect.left - h;
          const y = e.clientY - rect.top - w;
          gsap.to(element, {
            x: x * 0.4,
            y: y * 0.4,
            rotationX: -y * 0.15,
            rotationY: x * 0.15,
            scale: 1.05,
            ease: "power2.out",
            duration: 0.4,
          });
        };
        const handleMouseLeave = () => {
          gsap.to(element, {
            x: 0, y: 0, rotationX: 0, rotationY: 0, scale: 1,
            ease: "elastic.out(1, 0.3)",
            duration: 1.2,
          });
        };
        element.addEventListener("mousemove", handleMouseMove as EventListener);
        element.addEventListener("mouseleave", handleMouseLeave);
        return () => {
          element.removeEventListener("mousemove", handleMouseMove as EventListener);
          element.removeEventListener("mouseleave", handleMouseLeave);
        };
      }, element);

      return () => ctx.revert();
    }, []);

    return (
      <Component
        ref={(node: HTMLElement) => {
          (localRef as React.MutableRefObject<HTMLElement | null>).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

// -------------------------------------------------------------------------
// MARQUEE
// -------------------------------------------------------------------------
const MarqueeItem = () => (
  <div className="flex items-center space-x-12 px-6 text-white/30 text-sm font-medium">
    <span>Fine Art Photography</span>
    <span className="text-amber-400/50">✦</span>
    <span>Wedding Sessions</span>
    <span className="text-amber-400/50">✦</span>
    <span>Portrait Stories</span>
    <span className="text-amber-400/50">✦</span>
    <span>Commercial Work</span>
    <span className="text-amber-400/50">✦</span>
    <span>Lifestyle &amp; Events</span>
    <span className="text-amber-400/50">✦</span>
  </div>
);

// -------------------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------------------
export function CinematicFooter() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !wrapperRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        giantTextRef.current,
        { y: "10vh", scale: 0.85, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 60%",
            end: "center center",
            scrub: 1,
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="cinematic-footer-wrapper relative overflow-hidden bg-[#0a0a0a] border-t border-white/[0.06]">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Grid background */}
      <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none" />

      {/* Aurora glow */}
      <div className="footer-aurora absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[600px] z-0 pointer-events-none animate-footer-breathe" />

      {/* Giant background text */}
      <div
        ref={giantTextRef}
        aria-hidden="true"
        className="footer-giant-bg-text absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 overflow-hidden"
      >
        KYLE BLACKMAN
      </div>

      {/* Marquee */}
      <div className="relative z-10 overflow-hidden border-b border-white/[0.06] py-4">
        <div className="animate-footer-scroll-marquee whitespace-nowrap inline-flex">
          <MarqueeItem />
          <MarqueeItem />
          <MarqueeItem />
          <MarqueeItem />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-20 md:py-32">
        <h2
          ref={headingRef}
          className="footer-text-glow text-5xl md:text-7xl lg:text-[7vw] font-black tracking-tighter leading-none mb-16 max-w-5xl"
        >
          Let's Create Something Beautiful Together
        </h2>

        <div ref={linksRef} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <MagneticButton
              as="a"
              href="/book"
              className="footer-glass-pill text-white px-8 py-4 rounded-full text-sm font-semibold inline-flex items-center gap-2 no-underline"
            >
              Book a Session
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </MagneticButton>
            <MagneticButton
              as="a"
              href="/portfolio"
              className="footer-glass-pill text-white/70 px-8 py-4 rounded-full text-sm font-semibold inline-flex items-center gap-2 no-underline hover:text-white"
            >
              View Portfolio
            </MagneticButton>
          </div>

          {/* Social + contact */}
          <div className="flex items-center gap-6">
            <a
              href="https://instagram.com/kyleblackmanphotography_"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-glass-pill w-11 h-11 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a
              href="mailto:kyle@kyleblackmanphoto.com"
              className="footer-glass-pill w-11 h-11 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors"
              aria-label="Email"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </a>
          </div>
        </div>

        {/* Divider + bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <p className="text-[11px] text-white/20 uppercase tracking-[0.2em]">
              &copy; 2026 Kyle Blackman Photography
            </p>
            <div className="hidden sm:flex items-center gap-6">
              <a href="/portfolio" className="text-[11px] text-white/20 hover:text-white/50 uppercase tracking-[0.15em] transition-colors">Portfolio</a>
              <a href="/book" className="text-[11px] text-white/20 hover:text-white/50 uppercase tracking-[0.15em] transition-colors">Book</a>
              <a href="/booking-status" className="text-[11px] text-white/20 hover:text-white/50 uppercase tracking-[0.15em] transition-colors">Track Booking</a>
            </div>
          </div>
          <MagneticButton
            onClick={scrollToTop}
            className="footer-glass-pill text-white/40 hover:text-white px-5 py-2 rounded-full text-xs font-medium uppercase tracking-widest flex items-center gap-2 transition-colors"
          >
            ↑ Back to top
          </MagneticButton>
        </div>
      </div>
    </footer>
  );
}
