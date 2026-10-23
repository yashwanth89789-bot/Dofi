import React, { useEffect, useState, useRef } from 'react';

/**
 * Subtle Anatomical Blood Vessel / Artery Scroll Track
 * 
 * - Positioned strictly in the whitespace gutter alongside the page content
 * - Never crosses or obscures headlines, text, buttons, cards, or notices
 * - Progressively reveals as the user scrolls through the Dofi journey
 * - Red blood cells (erythrocytes) visibly flow through the vessel lumen
 * - Shows subtle anatomical milestones (Request -> Match -> Pledge -> Saved)
 * - Automatically respects prefers-reduced-motion
 * - Lightweight 60fps requestAnimationFrame scroll tracking
 */
export const BloodVesselTrack: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Detect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    // High-performance scroll tracking via requestAnimationFrame
    const updateScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;
      setScrollProgress(progress);
    };

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      mediaQuery.removeEventListener('change', handleMediaChange);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Anatomical artery path confined strictly within 36px width coordinate space (viewBox 0 0 36 800)
  // Gentle organic S-curves that stay centered around X=18, never exceeding X=6 to X=30
  const arteryPath = "M 18 0 C 23 70, 13 140, 18 210 C 23 280, 13 350, 19 420 C 25 490, 14 560, 18 630 C 22 700, 16 770, 18 800";

  // Micro-capillary branches at key Dofi journey milestones
  const capillary1 = "M 18 100 C 26 108, 30 114, 34 118"; // Milestone 1: Hospital Request (~12%)
  const capillary2 = "M 18 310 C 26 318, 30 324, 34 328"; // Milestone 2: Donor Matching (~38%)
  const capillary3 = "M 19 520 C 27 528, 31 534, 34 538"; // Milestone 3: Donor Pledged (~65%)
  const capillary4 = "M 18 730 C 26 738, 30 744, 34 748"; // Milestone 4: Life Saved (~91%)

  // Scroll reveal dashoffset calculation (pathLength = 100)
  const pathTotal = 100;
  const dashOffset = Math.max(0, pathTotal - scrollProgress * pathTotal);

  return (
    <div 
      className="fixed top-20 bottom-8 right-2 sm:right-4 lg:right-[max(1rem,calc((100vw-1024px)/2-54px))] w-10 sm:w-12 pointer-events-none z-0 overflow-visible select-none flex flex-col items-center"
      aria-hidden="true"
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 36 800"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle Arterial Lumen Gradient */}
          <linearGradient id="subtleLumenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#e11d48" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#be123c" stopOpacity="0.8" />
          </linearGradient>

          {/* Erythrocyte (Red Blood Cell) Radial Gradient with Biconcave Tone */}
          <radialGradient id="rbcRadialGrad" cx="40%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#fda4af" />
            <stop offset="45%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#be123c" />
          </radialGradient>

          {/* Controlled micro-glow filter - soft and non-intrusive */}
          <filter id="softVesselGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Outer Vascular Sheath (Tunica Adventitia) - Soft translucent rose border */}
        <path
          d={arteryPath}
          fill="none"
          stroke="#fda4af"
          strokeWidth="3.4"
          strokeOpacity="0.32"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={dashOffset}
          filter="url(#softVesselGlow)"
          style={{ transition: 'stroke-dashoffset 0.05s ease-out' }}
        />

        {/* 2. Vascular Muscular Layer (Tunica Media) */}
        <path
          d={arteryPath}
          fill="none"
          stroke="#f43f5e"
          strokeWidth="2.2"
          strokeOpacity="0.45"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.05s ease-out' }}
        />

        {/* 3. Central Arterial Blood Lumen - Narrow core flow channel */}
        <path
          id="dofiJourneyArtery"
          d={arteryPath}
          fill="none"
          stroke="url(#subtleLumenGrad)"
          strokeWidth="1.3"
          strokeOpacity="0.9"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.05s ease-out' }}
        />

        {/* 4. Journey Milestones & Micro-Capillaries branching outward */}
        {/* Milestone 1: Request Created (~12%) */}
        {scrollProgress >= 0.08 && (
          <g opacity={Math.min((scrollProgress - 0.08) * 6, 1)}>
            <path
              d={capillary1}
              fill="none"
              stroke="#fb7185"
              strokeWidth="0.8"
              strokeOpacity="0.5"
              strokeLinecap="round"
            />
            <circle cx="34" cy="118" r="1.8" fill="#e11d48" opacity="0.85" />
            <circle cx="34" cy="118" r="1.0" fill="#fda4af" />
          </g>
        )}

        {/* Milestone 2: Donor Matched (~38%) */}
        {scrollProgress >= 0.32 && (
          <g opacity={Math.min((scrollProgress - 0.32) * 6, 1)}>
            <path
              d={capillary2}
              fill="none"
              stroke="#fb7185"
              strokeWidth="0.8"
              strokeOpacity="0.5"
              strokeLinecap="round"
            />
            <circle cx="34" cy="328" r="1.8" fill="#e11d48" opacity="0.85" />
            <circle cx="34" cy="328" r="1.0" fill="#fda4af" />
          </g>
        )}

        {/* Milestone 3: Donor Pledged (~65%) */}
        {scrollProgress >= 0.58 && (
          <g opacity={Math.min((scrollProgress - 0.58) * 6, 1)}>
            <path
              d={capillary3}
              fill="none"
              stroke="#fb7185"
              strokeWidth="0.8"
              strokeOpacity="0.5"
              strokeLinecap="round"
            />
            <circle cx="34" cy="538" r="1.8" fill="#e11d48" opacity="0.85" />
            <circle cx="34" cy="538" r="1.0" fill="#fda4af" />
          </g>
        )}

        {/* Milestone 4: Life Saved / Fulfilled (~91%) */}
        {scrollProgress >= 0.82 && (
          <g opacity={Math.min((scrollProgress - 0.82) * 6, 1)}>
            <path
              d={capillary4}
              fill="none"
              stroke="#fb7185"
              strokeWidth="0.8"
              strokeOpacity="0.5"
              strokeLinecap="round"
            />
            <circle cx="34" cy="748" r="2.0" fill="#e11d48" opacity="0.9" />
            <circle cx="34" cy="748" r="1.2" fill="#fda4af" />
          </g>
        )}

        {/* 5. Animated Blood Cells (Erythrocytes) visibly circulating through the vessel lumen */}
        {!prefersReducedMotion && scrollProgress > 0.03 && (
          <>
            {/* Primary Red Blood Cell Disc */}
            <circle r="1.4" fill="url(#rbcRadialGrad)">
              <animateMotion
                dur="3.2s"
                repeatCount="indefinite"
                path={arteryPath}
                keyPoints={`0;${scrollProgress}`}
                keyTimes="0;1"
              />
            </circle>

            {/* Trailing Red Blood Cell */}
            <circle r="1.2" fill="url(#rbcRadialGrad)" opacity="0.9">
              <animateMotion
                dur="3.8s"
                begin="1.1s"
                repeatCount="indefinite"
                path={arteryPath}
                keyPoints={`0;${scrollProgress}`}
                keyTimes="0;1"
              />
            </circle>

            {/* Platelet / Micro-Drop */}
            <circle r="0.9" fill="#fda4af" opacity="0.8">
              <animateMotion
                dur="4.4s"
                begin="2.1s"
                repeatCount="indefinite"
                path={arteryPath}
                keyPoints={`0;${scrollProgress}`}
                keyTimes="0;1"
              />
            </circle>

            {/* Advancing Arterial Lead Pulse at the current scroll frontier */}
            <circle r="1.6" fill="#f43f5e" opacity="0.6">
              <animateMotion
                dur="2.0s"
                repeatCount="indefinite"
                path={arteryPath}
                keyPoints={`0;${scrollProgress}`}
                keyTimes="0;1"
              />
            </circle>
          </>
        )}
      </svg>
    </div>
  );
};
