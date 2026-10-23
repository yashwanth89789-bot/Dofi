import React, { useEffect, useState, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────────
   CirculatorySystem — Living Anatomical Human Circulatory Journey

   An organic, multi-layered anatomical vascular system living quietly
   behind the Dofi landing page content.

   Visual Layers:
     BACK:       Subtle human anatomical torso silhouette (cool gray/blue)
                 with clavicles, sternum, and ribcage arches.
     MID-BACK:   Faint dormant vascular network (pale pink/rose) showing
                 the biological blueprint waiting to be activated.
     MID:        Active scroll-revealed vascular tree (deep crimson/red)
                 with 3-level hierarchy (Major Vessels, Secondary, Capillaries).
                 Includes dedicated left & right hero vascular networks
                 filling the lateral whitespace beside the hero content.
     FOREGROUND: Small flowing RBC particles strictly clipped to revealed vessels.
     FRONT:      Landing page UI (cards, text, buttons at z-10).

   Key Design Features:
   • Anatomical Heart as the origin/central hub in the upper chest.
   • Natural dendritic tree branching — NO geometric circles or border frames.
   • Side Hero Vascular Networks: subtle organic branches extending through
     the left and right empty areas beside the hero headline & buttons,
     organically curving toward the central cardiovascular trunk.
   • 3-level vessel hierarchy:
       Level 1: Major trunks (Aorta, Carotids, Iliac, Femoral) — thickest
       Level 2: Secondary branches (Hero sides, Subclavians, Brachials, Renals)
       Level 3: Capillaries (delicate terminal sprays near section content)
   • Dynamic scroll story:
       Hero         → Silhouette introduced, heart activates, aortic arch & side
                      hero vessels gently illuminated with slow-flowing RBCs
       Emergency    → Thoracic aorta & intercostal arches cradle urgent requests
       How it Works → Abdominal aorta & organ trees spray beside 4 process steps
       Blood Groups → Iliac bifurcation & capillary plexus expand
       Join Roles   → Vessels converge toward Donor & Hospital + life-saving bridge
       Finale       → Completed closed circulation loop
   • RBC particles are physically clipped via SVG clipPath so cells NEVER
     travel ahead of scroll progress or float outside vessels.
   • Accessible: respects prefers-reduced-motion.
   • Clean: no developer progress UI or debug badges.
   ───────────────────────────────────────────────────────────────── */

interface VesselDef {
  id: string;
  d: string;
  level: 1 | 2 | 3;
  w: number;   // Stroke width
  s: number;   // Scroll start (0 - 1)
  e: number;   // Scroll complete (0 - 1)
  o: number;   // Max active opacity
}

interface RBCDef {
  vid: string;
  r: number;
  dur: string;
  begin: string;
  o: number;
}

// ── 1. The 3-Level Vascular Tree (viewBox 0 0 1000 4200) ──────────
// Natural dendritic branching. All coordinates stay inward.
// ZERO continuous edge lines. ZERO geometric framing circles.

const VESSELS: VesselDef[] = [
  // ════════════════════════════════════════════════════════════════
  // LEVEL 1: MAJOR VESSELS (Thickest, Central Arterial Highway)
  // ════════════════════════════════════════════════════════════════
  {
    id: 'v-arch',
    d: 'M 488 285 C 488 245, 515 235, 502 215 C 488 198, 468 215, 472 255',
    level: 1, w: 2.6, s: 0.00, e: 0.12, o: 0.70
  },
  {
    id: 'v-carotid-l',
    d: 'M 495 215 C 490 185, 485 145, 480 95',
    level: 1, w: 2.0, s: 0.02, e: 0.14, o: 0.60
  },
  {
    id: 'v-carotid-r',
    d: 'M 502 215 C 512 185, 520 145, 525 95',
    level: 1, w: 2.0, s: 0.02, e: 0.14, o: 0.60
  },
  {
    id: 'v-thoracic-aorta',
    d: 'M 472 255 C 476 350, 482 460, 486 580 C 490 700, 495 830, 490 980',
    level: 1, w: 2.4, s: 0.08, e: 0.28, o: 0.65
  },
  {
    id: 'v-abdominal-aorta',
    d: 'M 490 980 C 486 1140, 498 1300, 494 1460 C 490 1620, 502 1780, 498 1920',
    level: 1, w: 2.2, s: 0.22, e: 0.48, o: 0.60
  },
  {
    id: 'v-iliac-l',
    d: 'M 498 1920 C 455 2020, 400 2140, 345 2280 C 315 2360, 295 2450, 285 2560',
    level: 1, w: 2.0, s: 0.42, e: 0.64, o: 0.55
  },
  {
    id: 'v-iliac-r',
    d: 'M 498 1920 C 542 2020, 598 2140, 650 2280 C 682 2360, 702 2450, 712 2560',
    level: 1, w: 2.0, s: 0.42, e: 0.64, o: 0.55
  },
  {
    id: 'v-femoral-l',
    d: 'M 285 2560 C 275 2720, 285 2880, 310 3040 C 330 3180, 355 3300, 375 3420',
    level: 1, w: 1.8, s: 0.58, e: 0.82, o: 0.50
  },
  {
    id: 'v-femoral-r',
    d: 'M 712 2560 C 722 2720, 712 2880, 688 3040 C 668 3180, 642 3300, 622 3420',
    level: 1, w: 1.8, s: 0.58, e: 0.82, o: 0.50
  },

  // ════════════════════════════════════════════════════════════════
  // LEVEL 2: SECONDARY VESSELS (Organ Branches & Hero Lateral Networks)
  // ════════════════════════════════════════════════════════════════
  // Left Hero Side Vascular Network (occupying left hero whitespace)
  {
    id: 'v-hero-l-upper',
    d: 'M 90 140 C 145 165, 210 215, 270 250 C 305 270, 330 272, 340 275',
    level: 2, w: 1.4, s: 0.00, e: 0.12, o: 0.46
  },
  {
    id: 'v-hero-l-mid',
    d: 'M 75 320 C 120 340, 175 330, 225 365 C 265 395, 280 435, 290 480',
    level: 2, w: 1.3, s: 0.02, e: 0.16, o: 0.42
  },
  {
    id: 'v-hero-l-lower',
    d: 'M 110 520 C 150 500, 195 525, 235 560',
    level: 2, w: 1.2, s: 0.04, e: 0.18, o: 0.38
  },

  // Right Hero Side Vascular Network (occupying right hero whitespace)
  {
    id: 'v-hero-r-upper',
    d: 'M 915 120 C 855 150, 785 200, 725 245 C 695 268, 675 272, 660 275',
    level: 2, w: 1.4, s: 0.00, e: 0.12, o: 0.46
  },
  {
    id: 'v-hero-r-mid',
    d: 'M 925 340 C 880 355, 825 340, 775 375 C 735 405, 720 445, 710 490',
    level: 2, w: 1.3, s: 0.02, e: 0.16, o: 0.42
  },
  {
    id: 'v-hero-r-lower',
    d: 'M 890 535 C 845 515, 795 535, 755 570',
    level: 2, w: 1.2, s: 0.04, e: 0.18, o: 0.38
  },

  // Shoulders & Upper Torso
  {
    id: 'v-subclav-l',
    d: 'M 472 255 C 410 250, 340 275, 290 315',
    level: 2, w: 1.6, s: 0.03, e: 0.16, o: 0.48
  },
  {
    id: 'v-subclav-r',
    d: 'M 502 215 C 560 250, 635 275, 685 315',
    level: 2, w: 1.6, s: 0.03, e: 0.16, o: 0.48
  },
  {
    id: 'v-brachial-l',
    d: 'M 290 315 C 265 380, 245 460, 235 560',
    level: 2, w: 1.3, s: 0.10, e: 0.28, o: 0.42
  },
  {
    id: 'v-brachial-r',
    d: 'M 685 315 C 710 380, 730 460, 740 560',
    level: 2, w: 1.3, s: 0.10, e: 0.28, o: 0.42
  },

  // Thoracic Intercostal & Visceral
  {
    id: 'v-intercostal-l',
    d: 'M 482 460 C 430 490, 360 520, 300 550',
    level: 2, w: 1.2, s: 0.14, e: 0.28, o: 0.38
  },
  {
    id: 'v-intercostal-r',
    d: 'M 482 490 C 535 515, 605 545, 670 575',
    level: 2, w: 1.2, s: 0.14, e: 0.28, o: 0.38
  },
  {
    id: 'v-celiac',
    d: 'M 486 580 C 535 610, 590 640, 645 680',
    level: 2, w: 1.4, s: 0.16, e: 0.32, o: 0.42
  },

  // Renal & Mesenteric (How-It-Works Region)
  {
    id: 'v-renal-l',
    d: 'M 490 1180 C 435 1220, 365 1260, 305 1310',
    level: 2, w: 1.4, s: 0.26, e: 0.44, o: 0.42
  },
  {
    id: 'v-renal-r',
    d: 'M 490 1220 C 545 1250, 615 1290, 675 1340',
    level: 2, w: 1.4, s: 0.26, e: 0.44, o: 0.42
  },
  {
    id: 'v-mesenteric-sup',
    d: 'M 494 1460 C 440 1510, 385 1570, 335 1640',
    level: 2, w: 1.3, s: 0.30, e: 0.48, o: 0.40
  },
  {
    id: 'v-mesenteric-inf',
    d: 'M 498 1680 C 550 1720, 605 1770, 655 1830',
    level: 2, w: 1.2, s: 0.36, e: 0.52, o: 0.38
  },

  // Pelvic Hypogastric (Blood Groups Region)
  {
    id: 'v-hypogastric-l',
    d: 'M 345 2280 C 385 2360, 420 2440, 445 2530',
    level: 2, w: 1.3, s: 0.46, e: 0.68, o: 0.40
  },
  {
    id: 'v-hypogastric-r',
    d: 'M 650 2280 C 610 2360, 575 2440, 550 2530',
    level: 2, w: 1.3, s: 0.46, e: 0.68, o: 0.40
  },

  // Role Connection (Donor & Hospital Converging Ports)
  {
    id: 'v-portal-donor',
    d: 'M 310 3040 C 330 3160, 360 3280, 395 3380',
    level: 2, w: 1.4, s: 0.60, e: 0.82, o: 0.45
  },
  {
    id: 'v-portal-hosp',
    d: 'M 688 3040 C 668 3160, 638 3280, 605 3380',
    level: 2, w: 1.4, s: 0.60, e: 0.82, o: 0.45
  },

  // Transverse Life-Saving Bridge (Donor <-> Hospital)
  {
    id: 'v-bridge',
    d: 'M 395 3380 C 455 3425, 545 3425, 605 3380',
    level: 2, w: 1.7, s: 0.68, e: 0.88, o: 0.55
  },

  // Finale Terminal Circulation
  {
    id: 'v-terminal-trunk',
    d: 'M 500 3420 C 500 3600, 498 3800, 500 4050',
    level: 2, w: 1.3, s: 0.78, e: 0.98, o: 0.40
  },

  // ════════════════════════════════════════════════════════════════
  // LEVEL 3: CAPILLARIES (Delicate Terminal Sprays into Section Margins)
  // ════════════════════════════════════════════════════════════════
  // Side Hero Capillary Twigs
  {
    id: 'v-hero-l-twig1',
    d: 'M 170 190 C 140 180, 105 195, 80 225',
    level: 3, w: 0.7, s: 0.02, e: 0.14, o: 0.25
  },
  {
    id: 'v-hero-l-twig2',
    d: 'M 225 365 C 200 410, 175 440, 140 465',
    level: 3, w: 0.7, s: 0.03, e: 0.16, o: 0.25
  },
  {
    id: 'v-hero-r-twig1',
    d: 'M 835 175 C 870 170, 905 185, 930 215',
    level: 3, w: 0.7, s: 0.02, e: 0.14, o: 0.25
  },
  {
    id: 'v-hero-r-twig2',
    d: 'M 775 375 C 805 415, 830 445, 865 470',
    level: 3, w: 0.7, s: 0.03, e: 0.16, o: 0.25
  },

  // Cranial Twigs
  {
    id: 'v-cap-cran-l',
    d: 'M 480 95 C 465 80, 450 85, 440 98',
    level: 3, w: 0.7, s: 0.05, e: 0.16, o: 0.25
  },
  {
    id: 'v-cap-cran-r',
    d: 'M 525 95 C 540 80, 555 85, 565 98',
    level: 3, w: 0.7, s: 0.05, e: 0.16, o: 0.25
  },

  // Emergency Section Twigs
  {
    id: 'v-cap-emerg-l1',
    d: 'M 300 550 C 265 570, 240 600, 225 640',
    level: 3, w: 0.8, s: 0.16, e: 0.32, o: 0.28
  },
  {
    id: 'v-cap-emerg-l2',
    d: 'M 235 560 C 220 620, 215 690, 220 760',
    level: 3, w: 0.7, s: 0.18, e: 0.35, o: 0.24
  },
  {
    id: 'v-cap-emerg-r1',
    d: 'M 670 575 C 705 595, 730 625, 745 665',
    level: 3, w: 0.8, s: 0.16, e: 0.32, o: 0.28
  },
  {
    id: 'v-cap-emerg-r2',
    d: 'M 740 560 C 755 620, 760 690, 755 760',
    level: 3, w: 0.7, s: 0.18, e: 0.35, o: 0.24
  },

  // How-It-Works (Beside Steps 1, 2, 3, 4)
  {
    id: 'v-cap-step-1',
    d: 'M 305 1310 C 275 1335, 250 1375, 235 1425',
    level: 3, w: 0.8, s: 0.28, e: 0.44, o: 0.26
  },
  {
    id: 'v-cap-step-2',
    d: 'M 335 1640 C 300 1670, 275 1715, 260 1765',
    level: 3, w: 0.8, s: 0.34, e: 0.48, o: 0.26
  },
  {
    id: 'v-cap-step-3',
    d: 'M 675 1340 C 705 1365, 730 1405, 745 1455',
    level: 3, w: 0.8, s: 0.30, e: 0.46, o: 0.26
  },
  {
    id: 'v-cap-step-4',
    d: 'M 655 1830 C 690 1860, 715 1905, 730 1955',
    level: 3, w: 0.8, s: 0.38, e: 0.52, o: 0.26
  },

  // Blood Groups Plexus
  {
    id: 'v-cap-bg-l1',
    d: 'M 345 2280 C 310 2315, 280 2355, 260 2400',
    level: 3, w: 0.7, s: 0.48, e: 0.66, o: 0.22
  },
  {
    id: 'v-cap-bg-l2',
    d: 'M 285 2560 C 255 2590, 235 2630, 225 2680',
    level: 3, w: 0.6, s: 0.52, e: 0.70, o: 0.20
  },
  {
    id: 'v-cap-bg-r1',
    d: 'M 650 2280 C 685 2315, 715 2355, 735 2400',
    level: 3, w: 0.7, s: 0.48, e: 0.66, o: 0.22
  },
  {
    id: 'v-cap-bg-r2',
    d: 'M 712 2560 C 742 2590, 762 2630, 772 2680',
    level: 3, w: 0.6, s: 0.52, e: 0.70, o: 0.20
  },

  // Role CTA Branches
  {
    id: 'v-cap-role-l',
    d: 'M 395 3380 C 365 3420, 345 3470, 335 3530',
    level: 3, w: 0.7, s: 0.64, e: 0.84, o: 0.25
  },
  {
    id: 'v-cap-role-r',
    d: 'M 605 3380 C 635 3420, 655 3470, 665 3530',
    level: 3, w: 0.7, s: 0.64, e: 0.84, o: 0.25
  },

  // Finale Terminal Twigs
  {
    id: 'v-cap-term-l',
    d: 'M 470 4050 C 480 4080, 490 4105, 500 4125',
    level: 3, w: 0.6, s: 0.84, e: 0.98, o: 0.20
  },
  {
    id: 'v-cap-term-r',
    d: 'M 530 4050 C 520 4080, 510 4105, 500 4125',
    level: 3, w: 0.6, s: 0.84, e: 0.98, o: 0.20
  }
];

// ── 2. Flowing RBC Particles Defs ─────────────────────────────────
// Small, biconcave-inspired cells flowing along vessel paths
const RBCS: RBCDef[] = [
  // Left Side Hero Flow
  { vid: 'v-hero-l-upper',    r: 1.6, dur: '4.2s', begin: '0.2s', o: 0.50 },
  { vid: 'v-hero-l-mid',      r: 1.5, dur: '4.8s', begin: '1.4s', o: 0.45 },
  { vid: 'v-hero-l-lower',    r: 1.4, dur: '4.0s', begin: '0.8s', o: 0.40 },

  // Right Side Hero Flow
  { vid: 'v-hero-r-upper',    r: 1.6, dur: '4.4s', begin: '0.6s', o: 0.50 },
  { vid: 'v-hero-r-mid',      r: 1.5, dur: '4.6s', begin: '1.8s', o: 0.45 },
  { vid: 'v-hero-r-lower',    r: 1.4, dur: '4.2s', begin: '1.0s', o: 0.40 },

  // Aortic Arch & Cranial Carotids
  { vid: 'v-arch',            r: 2.2, dur: '3.4s', begin: '0.0s', o: 0.65 },
  { vid: 'v-arch',            r: 1.8, dur: '3.9s', begin: '1.6s', o: 0.50 },
  { vid: 'v-carotid-l',       r: 1.6, dur: '3.0s', begin: '0.3s', o: 0.45 },
  { vid: 'v-carotid-r',       r: 1.6, dur: '3.2s', begin: '1.1s', o: 0.45 },

  // Thoracic Highway & Subclavians
  { vid: 'v-subclav-l',       r: 1.8, dur: '3.8s', begin: '0.5s', o: 0.50 },
  { vid: 'v-subclav-r',       r: 1.8, dur: '4.0s', begin: '1.4s', o: 0.50 },
  { vid: 'v-thoracic-aorta',  r: 2.3, dur: '4.5s', begin: '0.2s', o: 0.60 },
  { vid: 'v-thoracic-aorta',  r: 1.7, dur: '5.0s', begin: '2.2s', o: 0.48 },

  // Brachial & Intercostal Branches
  { vid: 'v-brachial-l',      r: 1.6, dur: '4.8s', begin: '0.7s', o: 0.42 },
  { vid: 'v-brachial-r',      r: 1.6, dur: '5.0s', begin: '1.7s', o: 0.42 },
  { vid: 'v-intercostal-l',   r: 1.5, dur: '3.6s', begin: '0.4s', o: 0.38 },
  { vid: 'v-intercostal-r',   r: 1.5, dur: '3.8s', begin: '1.2s', o: 0.38 },

  // Abdominal Trunk & Renal Sprays
  { vid: 'v-abdominal-aorta', r: 2.1, dur: '4.7s', begin: '0.0s', o: 0.55 },
  { vid: 'v-abdominal-aorta', r: 1.6, dur: '5.2s', begin: '2.4s', o: 0.45 },
  { vid: 'v-renal-l',         r: 1.5, dur: '3.8s', begin: '0.8s', o: 0.40 },
  { vid: 'v-renal-r',         r: 1.5, dur: '4.0s', begin: '1.5s', o: 0.40 },

  // Mesenteric Trees
  { vid: 'v-mesenteric-sup',  r: 1.5, dur: '4.2s', begin: '0.6s', o: 0.38 },
  { vid: 'v-mesenteric-inf',  r: 1.5, dur: '4.4s', begin: '1.8s', o: 0.38 },

  // Iliac Bifurcation & Blood Groups
  { vid: 'v-iliac-l',         r: 1.9, dur: '4.3s', begin: '0.2s', o: 0.50 },
  { vid: 'v-iliac-r',         r: 1.9, dur: '4.5s', begin: '1.2s', o: 0.50 },

  // Femoral & Role Convergence Ports
  { vid: 'v-femoral-l',       r: 1.8, dur: '4.8s', begin: '0.5s', o: 0.45 },
  { vid: 'v-femoral-r',       r: 1.8, dur: '5.0s', begin: '1.6s', o: 0.45 },
  { vid: 'v-portal-donor',    r: 1.7, dur: '4.6s', begin: '0.4s', o: 0.45 },
  { vid: 'v-portal-hosp',     r: 1.7, dur: '4.6s', begin: '1.5s', o: 0.45 },

  // The Life-Saving Bridge
  { vid: 'v-bridge',          r: 2.3, dur: '3.6s', begin: '0.0s', o: 0.65 },
  { vid: 'v-bridge',          r: 1.7, dur: '4.0s', begin: '1.8s', o: 0.50 },

  // Terminal Circulation
  { vid: 'v-terminal-trunk',  r: 1.6, dur: '5.2s', begin: '0.8s', o: 0.40 }
];

// ── 3. Anatomical Human Torso Silhouette (Cool Gray/Blue) ─────────
// Centered at X=500, spans upper body from head to upper pelvis.
const SILHOUETTE_BODY =
  'M 500 55 C 475 55, 455 75, 455 105 C 455 130, 470 148, 475 165 C 460 180, 415 200, 375 225 C 330 255, 305 285, 305 335 C 305 370, 325 398, 345 428 C 360 468, 370 515, 380 570 C 390 625, 410 670, 435 710 L 435 760 L 565 760 L 565 710 C 590 670, 610 625, 620 570 C 630 515, 640 468, 655 428 C 675 398, 695 370, 695 335 C 695 285, 670 255, 625 225 C 585 200, 540 180, 525 165 C 530 148, 545 130, 545 105 C 545 75, 525 55, 500 55 Z';

// Anatomical Heart Contour (oblique cardiac cone tilted to anatomical left)
const HEART_CONTOUR =
  'M 488 265 C 498 255, 516 258, 520 272 C 524 288, 512 308, 496 326 C 486 338, 476 344, 470 340 C 462 334, 454 314, 457 294 C 460 276, 474 262, 488 265 Z';

export const CirculatorySystem: React.FC = () => {
  const [sp, setSp] = useState(0);
  const [noMotion, setNoMotion] = useState(false);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setNoMotion(mq.matches);
    const mqH = (e: MediaQueryListEvent) => setNoMotion(e.matches);
    mq.addEventListener('change', mqH);

    const tick = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setSp(h > 0 ? Math.min(Math.max(y / h, 0), 1) : 0);
    };

    const onScroll = () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    tick();

    return () => {
      window.removeEventListener('scroll', onScroll);
      mq.removeEventListener('change', mqH);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  // ── Scroll Reveal Calculation ──
  const rev = (a: number, b: number) => {
    if (sp <= a) return 0;
    if (sp >= b) return 1;
    return (sp - a) / (b - a);
  };

  // Calculates dynamic active factor with a soft initial presence at hero state
  const getRFactor = (v: VesselDef) => {
    const raw = rev(v.s, v.e);
    if (v.s === 0) {
      // Gentle initial presence (35% revealed) at hero start, illuminating to 100% on scroll
      return Math.max(0.35, raw);
    }
    return raw;
  };

  // Global Y coordinate boundary strictly bounding RBC movement to revealed vessels
  const revealedY = Math.max(280, sp * 4250);

  // Subtle human silhouette opacity (cool gray/blue anchor)
  const silOpacity = 0.04 + rev(0, 0.15) * 0.04; // 4% to 8% subtle
  const heartActivation = 0.30 + rev(0, 0.12) * 0.60; // Heart gently activates

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      style={{ zIndex: 2 }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes cardiacPulse {
          0%, 100% { transform: scale(1); opacity: 0.25; }
          15% { transform: scale(1.08); opacity: 0.55; }
          30% { transform: scale(1); opacity: 0.25; }
          45% { transform: scale(1.05); opacity: 0.45; }
        }
      `}</style>

      <svg
        className="w-full h-full"
        viewBox="0 0 1000 4200"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle Torso Fill Gradient in Cool Gray/Blue */}
          <radialGradient id="torsoCoolAura" cx="50%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.06" />
            <stop offset="65%" stopColor="#64748b" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#334155" stopOpacity="0" />
          </radialGradient>

          {/* Erythrocyte (RBC) Radial Biconcave Shading */}
          <radialGradient id="rbcShading" cx="35%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#fecdd3" />
            <stop offset="45%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#be123c" />
          </radialGradient>

          {/* Soft Controlled Glow for Level 1 Major Arteries */}
          <filter id="arterialSoftGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* 
            STRICT CLIPPING MASK FOR RBC PARTICLES:
            Guarantees that blood cells exist ONLY inside the revealed portion.
            As the user scrolls down, revealedY moves down.
            As the user scrolls up, revealedY retracts smoothly.
          */}
          <clipPath id="circulatoryRevealClip">
            <rect x="0" y="0" width="1000" height={revealedY} />
          </clipPath>
        </defs>

        {/* ── LAYER 1 (BACK): RECOGNIZABLE HUMAN SILHOUETTE (Cool Gray/Blue) ── */}
        <g opacity={silOpacity} style={{ transition: 'opacity 0.2s ease-out' }}>
          {/* Torso Contour & Translucent Fill */}
          <path
            d={SILHOUETTE_BODY}
            fill="url(#torsoCoolAura)"
            stroke="#64748b"
            strokeWidth="1.2"
            strokeOpacity="0.22"
          />

          {/* Clavicle / Collarbone Arches */}
          <path d="M 490 225 C 455 230, 400 240, 345 265" fill="none" stroke="#94a3b8" strokeWidth="0.8" strokeOpacity="0.25" />
          <path d="M 510 225 C 545 230, 600 240, 655 265" fill="none" stroke="#94a3b8" strokeWidth="0.8" strokeOpacity="0.25" />

          {/* Sternum / Midline Guide */}
          <path d="M 500 235 L 500 375" fill="none" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.20" />

          {/* Anatomical Thoracic Rib Arches (faint medical-tech line art) */}
          <path d="M 470 370 C 425 375, 385 395, 365 415" fill="none" stroke="#94a3b8" strokeWidth="0.7" strokeOpacity="0.18" />
          <path d="M 475 415 C 430 425, 395 445, 375 465" fill="none" stroke="#94a3b8" strokeWidth="0.7" strokeOpacity="0.18" />
          <path d="M 480 460 C 440 475, 410 495, 390 515" fill="none" stroke="#94a3b8" strokeWidth="0.7" strokeOpacity="0.18" />
          <path d="M 500 370 C 545 375, 585 395, 605 415" fill="none" stroke="#94a3b8" strokeWidth="0.7" strokeOpacity="0.18" />
          <path d="M 495 415 C 540 425, 575 445, 595 465" fill="none" stroke="#94a3b8" strokeWidth="0.7" strokeOpacity="0.18" />
          <path d="M 490 460 C 530 475, 560 495, 580 515" fill="none" stroke="#94a3b8" strokeWidth="0.7" strokeOpacity="0.18" />
        </g>

        {/* ── LAYER 2 (MID-BACK): FAINT DORMANT VASCULAR NETWORK (Pale Rose) ── */}
        {/* Shows the living anatomical tree waiting to be awakened by scroll */}
        <g>
          {VESSELS.map((v) => {
            // Dormant opacity based on hierarchy level
            const dormantOpacity =
              v.level === 1 ? 0.12 : v.level === 2 ? 0.08 : 0.05;

            return (
              <path
                key={`dormant-${v.id}`}
                d={v.d}
                fill="none"
                stroke="#fda4af"
                strokeWidth={v.w}
                strokeOpacity={dormantOpacity}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
        </g>

        {/* ── HEART (CENTRAL ORIGIN HUB) ── */}
        <g opacity={heartActivation} style={{ transition: 'opacity 0.15s ease-out' }}>
          {/* Outer Pulsing Cardiac Aura */}
          <circle
            cx="485"
            cy="295"
            r="32"
            fill="#e11d48"
            style={{
              transformOrigin: '485px 295px',
              animation: noMotion ? 'none' : 'cardiacPulse 1.6s ease-in-out infinite'
            }}
          />
          <circle cx="485" cy="295" r="16" fill="#f43f5e" opacity="0.30" />

          {/* Anatomical Heart Chamber Outline */}
          <path
            d={HEART_CONTOUR}
            fill="#e11d48"
            fillOpacity="0.40"
            stroke="#f43f5e"
            strokeWidth="1.3"
            strokeOpacity="0.70"
          />
        </g>

        {/* ── LAYER 3 (MID): ACTIVE SCROLL-REVEALED VASCULAR TREE (Crimson) ── */}
        {VESSELS.map((v) => {
          const rFactor = getRFactor(v);
          const dashOffset = 100 - rFactor * 100;
          const activeOpacity = v.o * rFactor;

          return (
            <path
              key={v.id}
              id={v.id}
              d={v.d}
              fill="none"
              stroke="#e11d48"
              strokeWidth={v.w}
              strokeOpacity={activeOpacity}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={100}
              strokeDasharray="100"
              strokeDashoffset={dashOffset}
              filter={v.level === 1 ? 'url(#arterialSoftGlow)' : undefined}
              style={{
                transition: 'stroke-dashoffset 0.12s ease-out, stroke-opacity 0.12s ease-out'
              }}
            />
          );
        })}

        {/* ── FINALE CONVERGENCE NODE (Life-Saving Connection Node) ── */}
        {sp >= 0.88 && (
          <g opacity={rev(0.88, 0.98)} style={{ transition: 'opacity 0.2s ease-out' }}>
            <circle cx="500" cy="4125" r="12" fill="#e11d48" opacity="0.22" />
            <circle cx="500" cy="4125" r="5" fill="#f43f5e" opacity="0.55" />
            <circle cx="500" cy="4125" r="2.5" fill="#fecdd3" />
          </g>
        )}

        {/* 
          ── LAYER 4 (FOREGROUND): FLOWING RBC PARTICLES ──
          Strictly clipped to circulatoryRevealClip so particles NEVER appear ahead of scroll!
        */}
        {!noMotion && (
          <g clipPath="url(#circulatoryRevealClip)">
            {RBCS.map((p, i) => {
              const vessel = VESSELS.find((v) => v.id === p.vid);
              if (!vessel) return null;

              const rFactor = getRFactor(vessel);
              if (rFactor < 0.1) return null; // Vessel hasn't begun revealing yet

              const particleOpacity = p.o * Math.min(rFactor * 1.4, 1);

              return (
                <circle
                  key={i}
                  r={p.r}
                  fill="url(#rbcShading)"
                  opacity={particleOpacity}
                >
                  <animateMotion
                    dur={p.dur}
                    begin={p.begin}
                    repeatCount="indefinite"
                    fill="freeze"
                  >
                    <mpath href={`#${p.vid}`} />
                  </animateMotion>
                </circle>
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
};
