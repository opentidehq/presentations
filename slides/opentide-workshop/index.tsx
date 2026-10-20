import {
  type DesignSystem,
  MorphElement,
  type Page,
  type SlideMeta,
  type SlideTransition,
  Step,
  Steps,
  useIsActivePage,
  useSlidePageNumber,
} from '@open-slide/core';
import { type CSSProperties, type ReactNode, useEffect, useRef } from 'react';
import InterUrl from '@assets/fonts/Inter-Variable-latin.woff2';
import MonoUrl from '@assets/fonts/JetBrainsMono-Variable-latin.woff2';
import logoNormal from '@assets/brand/logo-normal.svg';
import mdrLifecycle from './assets/MDR_lifecycle.svg';
import qrOpentide from './assets/qr-opentide-org.svg';

// ─────────────────────────────────────────────────────────────────────────────
// opentide workshop — detection engineering with a coding agent.
// Theme: themes/opentide-coastal.md. Shared chrome, code blocks, icons and the
// ASCII tide are copied from slides/opentide (the founding deck).
// Brand: opentide.org "coastal precision", light register: white + Pantone
// Reflex Blue (#001489), Inter + JetBrains Mono. No yellow on white.
// One signature motion: the ASCII tide (a FLIP fluid whose glyphs are real
// detection content), on the cover and chapter dividers, rising each chapter.
// Terminal windows use the docs' deep-tide navy, as content, never as a page.
// ─────────────────────────────────────────────────────────────────────────────

export const design: DesignSystem = {
  palette: { bg: '#FFFFFF', text: '#0A0F24', accent: '#001489' },
  fonts: {
    display: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
    body: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  },
  typeScale: { hero: 132, body: 30 },
  radius: 16,
};

// ── Tokens ───────────────────────────────────────────────────────────────────
const DISPLAY = 'var(--osd-font-display)';
const SANS = 'var(--osd-font-body)';
const MONO = "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

const BLUE = '#001489'; // Pantone Reflex Blue (hex, for SVG/canvas)
const ACC = 'var(--osd-accent)'; // same blue, tweakable from the Design panel
const INK = 'var(--osd-text)';
const BG = 'var(--osd-bg)';

const C = {
  inkHex: '#0A0F24',
  muted: '#4C5672',
  subtle: '#6B7490',
  dim: '#8A93AA',
  line: 'rgba(0,20,137,0.13)',
  line2: 'rgba(0,20,137,0.26)',
  paper: '#F5F7FC',
  paper2: '#EDF1F9',
  tint: '#E6EBF7',
  blueMid: '#1A3A9E',
  blueSoft: 'rgba(0,20,137,0.06)',
  blueLine: 'rgba(0,20,137,0.38)',
  red: '#C62F3F',
  redSoft: 'rgba(198,47,63,0.07)',
  redLine: 'rgba(198,47,63,0.42)',
  green: '#0F7B4B',
  greenSoft: 'rgba(15,123,75,0.07)',
  greenLine: 'rgba(15,123,75,0.38)',
};

// Deep-tide navy (opentide.org docs tokens) — terminal windows only.
const NV = {
  bg: '#000B1F',
  head: '#001028',
  line: 'rgba(126,200,227,0.16)',
  ink: '#E8F0FF',
  muted: '#B8CCE8',
  subtle: '#8FA8D4',
  dim: '#5B6F94',
  foam: '#7EC8E3',
  ok: '#6EE7A8',
  bad: '#FF9494',
};

// ── Fonts + keyframes (module level, create-or-update, slide-keyed ids) ──────
const FONT_STYLE_ID = 'osd-fonts-opentide-workshop';
const FONT_CSS = `
@font-face{font-family:'Inter';src:url(${InterUrl}) format('woff2');font-weight:100 900;font-style:normal;font-display:block;}
@font-face{font-family:'JetBrains Mono';src:url(${MonoUrl}) format('woff2');font-weight:100 800;font-style:normal;font-display:block;}
`;
const MOTION_STYLE_ID = 'osd-motion-opentide-workshop';
const MOTION_CSS = `
.ot { animation-fill-mode: both; animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1); }
[data-still] .ot { animation: none !important; }
@media (prefers-reduced-motion: reduce) { .ot { animation: none !important; } }
@keyframes ot-rise { from { opacity: 0; transform: translateY(14px); } }
@keyframes ot-fade { from { opacity: 0; } }
@keyframes ot-draw { from { stroke-dashoffset: 1; } }
@keyframes ot-grow { from { transform: scaleX(0); } }
@keyframes ot-pop { from { opacity: 0; transform: scale(0.6); } }
@keyframes ot-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
@keyframes ot-ping { 0% { transform: scale(1); opacity: 0.6; } 80%, 100% { transform: scale(2.6); opacity: 0; } }
.ot-rise { animation-name: ot-rise; animation-duration: 0.7s; }
.ot-fade { animation-name: ot-fade; animation-duration: 0.8s; }
.ot-draw { stroke-dasharray: 1; stroke-dashoffset: 0; animation-name: ot-draw; animation-duration: 1.6s; }
.ot-grow { transform-origin: left center; animation-name: ot-grow; animation-duration: 1.1s; }
.ot-pop { animation-name: ot-pop; animation-duration: 0.45s; }
.ot-caret { animation: ot-blink 1.1s steps(1) infinite; }
.ot-ping { animation: ot-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
[data-still] .ot-caret, [data-still] .ot-ping { animation: none !important; }
`;
if (typeof document !== 'undefined') {
  for (const [id, css] of [
    [FONT_STYLE_ID, FONT_CSS],
    [MOTION_STYLE_ID, MOTION_CSS],
  ] as const) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      document.head.appendChild(el);
    }
    if (el.textContent !== css) el.textContent = css;
  }
}

// ── Transitions: one DNA (hold the outgoing page, fade the incoming in) ──────
const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_IN = 'cubic-bezier(0.4, 0, 1, 1)';
const MORPH = { duration: 520, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' };

// Sequential by design: the outgoing page leaves completely before the incoming
// page arrives, so two slides are never on screen together. Every page paints
// the same white --osd-bg, so dipping through it never reads as a flash.
// The brand mark (MorphElement "ot-brand") stays pinned across every cut.

// House: lift away with a hair of blur, then rise into focus.
export const transition: SlideTransition = {
  duration: 460,
  throughBackground: true,
  morph: MORPH,
  exit: {
    duration: 150,
    easing: EASE_IN,
    keyframes: [
      { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' },
      { opacity: 0, transform: 'translateY(-10px)', filter: 'blur(2px)' },
    ],
  },
  enter: {
    duration: 320,
    delay: 150,
    easing: EASE_OUT,
    keyframes: [
      { opacity: 0, transform: 'translateY(12px)', filter: 'blur(4px)' },
      { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' },
    ],
  },
};

// Tide reveal: cover, chapter dividers and close are unveiled bottom-up, the
// way the water rises.
const tideReveal: SlideTransition = {
  duration: 760,
  throughBackground: true,
  morph: MORPH,
  exit: {
    duration: 160,
    easing: EASE_IN,
    keyframes: [
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(0.985)' },
    ],
  },
  enter: {
    duration: 600,
    delay: 160,
    easing: EASE_OUT,
    keyframes: [
      { clipPath: 'inset(100% 0 0 0)', transform: 'translateY(10px)' },
      { clipPath: 'inset(0% 0 0 0)', transform: 'translateY(0)' },
    ],
  },
};

// ── Brand mark (Material "tsunami" glyph inside a circle, as on opentide.org) ─
const TSUNAMI =
  'M80-120v-80q38 0 68-14.5t65-40.5q30 25 65.5 39.5T347-201q33 0 69-14t65-40q32 28 66 41t68 13q33 0 64.5-13t69.5-41q39 30 69 42.5t62 12.5v80q-35 0-67.5-9.5T749-157q-32 20-66.5 28.5T615-120q-33 0-67.5-8.5T481-157q-29 19-64 28t-70 9q-34 0-68-9t-66-28q-31 18-64.5 27.5T80-120Zm0-180v-80q0-97 37.5-181T220-707q65-62 152.5-97.5T560-840q33 0 65.5 3.5T684-827q-21 32-32.5 67.5T640-693q0 55 39 94t94 39h107v80H773q-89 0-151-62t-62-151q0-14 2-29.5t6-30.5q-74 18-121 76.5T400-540q0 36 11.5 68.5T444-410q8-5 17-11.5t19-13.5q29 26 67 40t68 14q30 0 67-14.5t67-39.5q32 24 63.5 39.5T880-380v80q-35 0-67.5-9.5T749-337q-32 20-65 28.5t-69 8.5q-36 0-72-10t-62-27q-31 19-65 27.5t-69 9.5q-35 1-69-9t-65-28q-31 18-64.5 27.5T80-300Zm265-81h10q5 0 10-1-22-35-33.5-75T320-540q0-81 37-146.5T460-794v44q-62 16-114.5 48.5t-92 78.5Q214-577 190-520.5T161-400q15-9 26-16t26-19q37 27 67 40.5t65 13.5Zm-75-168Z';

const TideMark = ({ size = 34, bg = BLUE, fg = '#FFFFFF' }: { size?: number; bg?: string; fg?: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden style={{ display: 'block', flex: '0 0 auto' }}>
    <circle cx="50" cy="50" r="50" fill={bg} />
    <svg x="11" y="11" width="78" height="78" viewBox="0 -960 960 960">
      <path fill={fg} d={TSUNAMI} />
    </svg>
  </svg>
);

// ── Icons (24-grid line icons, currentColor) ─────────────────────────────────
type IconName =
  | 'threat' | 'objective' | 'rule' | 'signal' | 'agent' | 'lock' | 'package' | 'doc' | 'branch'
  | 'terminal' | 'graph' | 'book' | 'plug' | 'eye' | 'warn' | 'merge' | 'check' | 'x' | 'arrow'
  | 'intel' | 'layers' | 'engine' | 'clock' | 'share' | 'editor' | 'python' | 'spark' | 'flow' | 'link'
  | 'archive' | 'user' | 'search' | 'rocket' | 'globe';

const ICON_PATHS: Record<IconName, ReactNode> = {
  threat: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 1.6v4M12 18.4v4M1.6 12h4M18.4 12h4" />
    </>
  ),
  objective: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5.2" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" />
      <path d="M12 12l6.6-6.6" />
    </>
  ),
  rule: (
    <>
      <path d="M12 2.5l7.5 3v6.2c0 4.6-3.2 8.3-7.5 9.8-4.3-1.5-7.5-5.2-7.5-9.8V5.5z" />
      <path d="M8.6 12.2l2.4 2.4 4.6-4.8" />
    </>
  ),
  signal: <path d="M2 12h4l2.5-6 4 12 3-8 1.5 2H22" />,
  agent: (
    <>
      <path d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9z" />
      <path d="M19 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </>
  ),
  package: (
    <>
      <path d="M12 2.8l8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4z" />
      <path d="M3.8 7.4L12 12l8.2-4.6M12 12v9.2" />
    </>
  ),
  doc: (
    <>
      <path d="M6 2.8h8.5L19 7.3v13.9H6z" />
      <path d="M14.5 2.8v4.5H19M9 11.5h7M9 15h7M9 18.5h4.5" />
    </>
  ),
  branch: (
    <>
      <circle cx="6.5" cy="5.5" r="2.2" />
      <circle cx="6.5" cy="18.5" r="2.2" />
      <circle cx="17.5" cy="8.5" r="2.2" />
      <path d="M6.5 7.7v8.6M17.5 10.7c0 3.5-4 3.8-8.8 6" />
    </>
  ),
  terminal: (
    <>
      <rect x="2.8" y="4.5" width="18.4" height="15" rx="2" />
      <path d="M7 9.5l3 2.5-3 2.5M12.5 15h4.5" />
    </>
  ),
  graph: (
    <>
      <circle cx="5.5" cy="6" r="2.3" />
      <circle cx="18.5" cy="6" r="2.3" />
      <circle cx="12" cy="18" r="2.3" />
      <path d="M7.8 6h8.4M6.7 8.1l4.2 7.9M17.3 8.1l-4.2 7.9" />
    </>
  ),
  book: <path d="M4 4.5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 4.5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z" />,
  plug: <path d="M9 2.5v5M15 2.5v5M6.5 7.5h11v3a5.5 5.5 0 0 1-11 0zM12 16v5.5" />,
  eye: (
    <>
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  warn: (
    <>
      <path d="M12 3.2L22 20.5H2z" />
      <path d="M12 9.5v5M12 17.3v.4" />
    </>
  ),
  merge: (
    <>
      <circle cx="6" cy="5.5" r="2.2" />
      <circle cx="6" cy="18.5" r="2.2" />
      <circle cx="18" cy="15" r="2.2" />
      <path d="M6 7.7v8.6M6 7.7c0 4.5 5.5 7.3 9.8 7.3" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  x: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  arrow: <path d="M4 12h15M13.5 6.5L19 12l-5.5 5.5" />,
  intel: (
    <>
      <path d="M4.5 18.5a10.5 10.5 0 0 1 0-13M8 15.3a6 6 0 0 1 0-6.6M19.5 18.5a10.5 10.5 0 0 0 0-13M16 15.3a6 6 0 0 0 0-6.6" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3l9 5-9 5-9-5z" />
      <path d="M3 13l9 5 9-5" />
    </>
  ),
  engine: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5.5" r="2.4" />
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="18.5" r="2.4" />
      <path d="M8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1" />
    </>
  ),
  editor: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <path d="M8.5 9.5L6 12l2.5 2.5M15.5 9.5L18 12l-2.5 2.5M13 8.5l-2 7" />
    </>
  ),
  python: (
    <>
      <path d="M12 3c-4 0-4 1.8-4 3v2.5h4.2V9H6.3C4.5 9 3 10.4 3 13s1.5 4 3.3 4H8v-2.6C8 12.6 9.4 11.5 11 11.5h4.2c1.4 0 2.8-1.1 2.8-2.6V6c0-1.5-1.8-3-6-3z" />
      <path d="M12 21c4 0 4-1.8 4-3v-2.5h-4.2V15h5.9c1.8 0 3.3-1.4 3.3-4s-1.5-4-3.3-4H16" />
    </>
  ),
  spark: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" />,
  flow: (
    <>
      <rect x="2.5" y="4" width="6" height="6" rx="1.5" />
      <rect x="15.5" y="14" width="6" height="6" rx="1.5" />
      <path d="M8.5 7h4a2 2 0 0 1 2 2v6a2 2 0 0 0 2 2" />
    </>
  ),
  link: <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3.2-3.2a4.5 4.5 0 0 0-6.4-6.4L12 5.6M14 10a4.5 4.5 0 0 0-6.4 0l-3.2 3.2a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2" />,
  archive: (
    <>
      <rect x="3" y="4" width="18" height="4.5" rx="1.2" />
      <path d="M5 8.5v10.5a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5V8.5M10 12.5h4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7.5 8-7.5s8 3.1 8 7.5" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L21 21" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 2.8c3.6 2.2 5.5 6 5.2 10.6L14.5 16h-5l-2.7-2.6C6.5 8.8 8.4 5 12 2.8z" />
      <circle cx="12" cy="9.5" r="1.8" />
      <path d="M9.5 16l-2 4.5 3-1.5M14.5 16l2 4.5-3-1.5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3z" />
    </>
  ),
};

const Icon = ({ name, size = 28, color = 'currentColor', stroke = 1.8, style }: { name: IconName; size?: number; color?: string; stroke?: number; style?: CSSProperties }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    style={{ display: 'block', flex: '0 0 auto', color, ...style }}
  >
    {ICON_PATHS[name]}
  </svg>
);

// ── Chrome: top bar + footer ─────────────────────────────────────────────────
const TopBar = ({ chapter }: { chapter?: [string, string] }) => (
  <>
    <MorphElement id="ot-brand">
      <div style={{ position: 'absolute', left: 120, top: 52, display: 'flex', alignItems: 'center', gap: 12, zIndex: 3 }}>
        <TideMark size={34} />
        <span style={{ fontFamily: SANS, fontWeight: 650, fontSize: 25, letterSpacing: '-0.02em', color: ACC }}>opentide</span>
      </div>
    </MorphElement>
    {chapter && (
      <div style={{ position: 'absolute', right: 120, top: 52, height: 34, display: 'flex', alignItems: 'center', gap: 14, fontFamily: MONO, fontSize: 19, zIndex: 3 }}>
        <span style={{ color: ACC, fontWeight: 600 }}>{chapter[0]}</span>
        <span style={{ width: 22, height: 1.5, background: C.line2 }} />
        <span style={{ color: C.muted }}>{chapter[1]}</span>
      </div>
    )}
  </>
);

const Footer = ({ source, onTide }: { source?: string; onTide?: boolean }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ position: 'absolute', left: 120, right: 120, bottom: 42, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: MONO, fontSize: 17, color: C.dim, zIndex: 3 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {source && (
          <>
            <Icon name="link" size={18} color={C.dim} stroke={1.8} />
            {source}
          </>
        )}
      </span>
      <span style={onTide ? { background: '#FFFFFF', padding: '6px 14px', borderRadius: 999, border: `1px solid ${C.line}` } : undefined}>
        <span style={{ color: C.muted }}>{String(current).padStart(2, '0')}</span>
        <span> / {String(total).padStart(2, '0')}</span>
      </span>
    </div>
  );
};

// Root of every page. Inactive instances (thumbnails, overview, print, the
// outgoing snapshot) get data-still so entrance motion renders settled.
const Stage = ({ children, bg = BG }: { children: ReactNode; bg?: string }) => {
  const active = useIsActivePage();
  return (
    <div
      data-still={active ? undefined : ''}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: bg,
        color: INK,
        fontFamily: SANS,
        WebkitFontSmoothing: 'antialiased',
        fontFeatureSettings: "'cv11' on",
      }}
    >
      {children}
    </div>
  );
};

// Standard content page: chrome + a 1680×820 content box (x 120, y 150).
const Frame = ({ chapter, source, children, bg }: { chapter?: [string, string]; source?: string; children: ReactNode; bg?: string }) => (
  <Stage bg={bg}>
    <TopBar chapter={chapter} />
    <div style={{ position: 'absolute', left: 120, top: 150, width: 1680, height: 820, display: 'flex', flexDirection: 'column' }}>{children}</div>
    <Footer source={source} />
  </Stage>
);

// ── Type ─────────────────────────────────────────────────────────────────────
const H = ({ children, size = 64, maxWidth = 1640, style }: { children: ReactNode; size?: number; maxWidth?: number; style?: CSSProperties }) => (
  <h2 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 720, fontSize: size, lineHeight: 1.06, letterSpacing: '-0.035em', color: INK, maxWidth, ...style }}>{children}</h2>
);

const Lead = ({ children, maxWidth = 1360, style }: { children: ReactNode; maxWidth?: number; style?: CSSProperties }) => (
  <p style={{ margin: '22px 0 0', fontSize: 30, lineHeight: 1.45, fontWeight: 420, color: C.muted, maxWidth, letterSpacing: '-0.01em', ...style }}>{children}</p>
);

const A = ({ children }: { children: ReactNode }) => <span style={{ color: ACC }}>{children}</span>;

const M = ({ children, color, size }: { children: ReactNode; color?: string; size?: number }) => (
  <span style={{ fontFamily: MONO, fontSize: size ? size : '0.86em', color, letterSpacing: 0, fontVariantLigatures: 'none', whiteSpace: 'nowrap' }}>{children}</span>
);

const Label = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div style={{ fontFamily: MONO, fontSize: 20, color: C.muted, letterSpacing: '0.01em', ...style }}>{children}</div>
);

type ChipTone = 'plain' | 'accent' | 'solid' | 'warn' | 'ok' | 'ghost';
const CHIP: Record<ChipTone, CSSProperties> = {
  plain: { color: C.muted, border: `1px solid ${C.line2}`, background: '#FFFFFF' },
  ghost: { color: C.dim, border: `1px dashed ${C.line2}`, background: 'transparent' },
  accent: { color: BLUE, border: `1px solid ${C.blueLine}`, background: '#EEF1FA' },
  solid: { color: '#FFFFFF', border: `1px solid ${BLUE}`, background: BLUE },
  warn: { color: C.red, border: `1px solid ${C.redLine}`, background: '#FCF0F1' },
  ok: { color: C.green, border: `1px solid ${C.greenLine}`, background: '#EEF7F2' },
};
const Chip = ({ children, tone = 'plain', size = 18, style }: { children: ReactNode; tone?: ChipTone; size?: number; style?: CSSProperties }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: MONO, fontSize: size, lineHeight: 1, padding: '7px 13px', borderRadius: 999, whiteSpace: 'nowrap', fontVariantLigatures: 'none', ...CHIP[tone], ...style }}>
    {children}
  </span>
);

// ── Code blocks with a tiny highlighter ──────────────────────────────────────
type Lang = 'yaml' | 'bash' | 'json' | 'python' | 'kql' | 'text';
type Variant = 'paper' | 'navy';
type Tone = { fg: string; key: string; str: string; num: string; kw: string; com: string; punc: string; flag: string; cmd: string; out: string };
const TONE: Record<Variant, Tone> = {
  paper: { fg: '#0A0F24', key: '#001489', str: '#8A4B00', num: '#001489', kw: '#001489', com: '#8A93AA', punc: '#8A93AA', flag: '#1A3A9E', cmd: '#001489', out: '#4C5672' },
  navy: { fg: '#E8F0FF', key: '#7EC8E3', str: '#B9EBCB', num: '#B8CCE8', kw: '#7EC8E3', com: '#5B6F94', punc: '#8FA8D4', flag: '#7EC8E3', cmd: '#FFFFFF', out: '#B8CCE8' },
};
const SURF: Record<Variant, { bg: string; head: string; line: string; title: string; tag: string }> = {
  paper: { bg: C.paper, head: C.paper2, line: C.line, title: C.muted, tag: C.dim },
  navy: { bg: NV.bg, head: NV.head, line: NV.line, title: NV.muted, tag: NV.dim },
};

type CodeMark = { t: string; bg: string; fg: string; border?: string };

const RX: Record<Exclude<Lang, 'text'>, RegExp> = {
  yaml: /(#.*$)|("(?:[^"\\]|\\.)*"|'[^']*')|(\b[a-z_]+::\d+\.\d+\b)|(\b(?:true|false|null)\b)|(\b\d+(?:\.\d+)*\b)|([[\]{},|>])/g,
  bash: /(#.*$)|("(?:[^"\\]|\\.)*"|'[^']*')|((?:^|\s)--?[A-Za-z][\w-]*(?:=\S+)?)|(\|\||&&|\||\\$)|(\b\d+\b)/g,
  json: /("(?:[^"\\]|\\.)*")(?=\s*:)|("(?:[^"\\]|\\.)*")|(\b(?:true|false|null)\b)|(-?\b\d+(?:\.\d+)?\b)|([{}[\],:])/g,
  python: /(#.*$)|("(?:[^"\\]|\\.)*"|'[^']*')|(\b(?:from|import|def|return|for|in|if|else|with|as|print|True|False|None)\b)|(\b[A-Za-z_]\w*(?=\())|(\b\d+\b)/g,
  kql: /(\/\/.*$)|("(?:[^"\\]|\\.)*"|`[^`]*`)|(\b(?:where|project|summarize|extend|let|dynamic|by|count|has|has_any|in~|and|or|not|search|stats|values|NOT|IN|as|take|join|min|max)\b)|(=~|==|!in~|!=)|(\|)|(\b\d+\b)/g,
};
const RX_COLORS: Record<Exclude<Lang, 'text'>, (keyof Tone)[]> = {
  yaml: ['com', 'str', 'kw', 'kw', 'num', 'punc'],
  bash: ['com', 'str', 'flag', 'punc', 'num'],
  json: ['key', 'str', 'kw', 'num', 'punc'],
  python: ['com', 'str', 'kw', 'key', 'num'],
  kql: ['com', 'str', 'kw', 'punc', 'punc', 'num'],
};

function tokenize(text: string, lang: Lang, tone: Tone, base: string, keyBase: string): ReactNode[] {
  if (lang === 'text' || !text) return text ? [<span key={keyBase} style={{ color: base }}>{text}</span>] : [];
  const rx = new RegExp(RX[lang].source, 'g');
  const colors = RX_COLORS[lang];
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = rx.exec(text)) !== null) {
    if (m[0] === '') {
      rx.lastIndex++;
      continue;
    }
    if (m.index > last) out.push(<span key={`${keyBase}-p${i++}`} style={{ color: base }}>{text.slice(last, m.index)}</span>);
    const g = m.slice(1).findIndex((v) => v !== undefined);
    out.push(<span key={`${keyBase}-t${i++}`} style={{ color: tone[colors[g] ?? 'fg'] }}>{m[0]}</span>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(<span key={`${keyBase}-e${i++}`} style={{ color: base }}>{text.slice(last)}</span>);
  return out;
}

function withMarks(text: string, lang: Lang, tone: Tone, base: string, marks: CodeMark[] | undefined, keyBase: string): ReactNode[] {
  if (!marks?.length) return tokenize(text, lang, tone, base, keyBase);
  const out: ReactNode[] = [];
  let rest = text;
  let n = 0;
  while (rest.length) {
    let hit: { i: number; mk: CodeMark } | null = null;
    for (const mk of marks) {
      const i = rest.indexOf(mk.t);
      if (i >= 0 && (!hit || i < hit.i)) hit = { i, mk };
    }
    if (!hit) {
      out.push(...tokenize(rest, lang, tone, base, `${keyBase}-r${n++}`));
      break;
    }
    if (hit.i > 0) out.push(...tokenize(rest.slice(0, hit.i), lang, tone, base, `${keyBase}-r${n++}`));
    out.push(
      <span key={`${keyBase}-m${n++}`} style={{ background: hit.mk.bg, color: hit.mk.fg, border: hit.mk.border, borderRadius: 5, padding: '1px 5px', margin: '0 -1px' }}>
        {hit.mk.t}
      </span>,
    );
    rest = rest.slice(hit.i + hit.mk.t.length);
  }
  return out;
}

function renderLine(line: string, lang: Lang, tone: Tone, marks: CodeMark[] | undefined, k: string): ReactNode[] {
  if (lang === 'yaml') {
    const m = line.match(/^(\s*(?:-\s+)?)([A-Za-z_&][\w&.-]*)(:)(\s.*|$)/);
    if (m) {
      return [
        <span key={`${k}-i`} style={{ color: tone.punc }}>{m[1]}</span>,
        <span key={`${k}-k`} style={{ color: tone.key }}>{m[2]}</span>,
        <span key={`${k}-c`} style={{ color: tone.punc }}>{m[3]}</span>,
        ...withMarks(m[4], lang, tone, tone.fg, marks, `${k}-v`),
      ];
    }
  }
  if (lang === 'bash') {
    const p = line.match(/^(\$ )(\S+)(.*)$/);
    if (p) {
      return [
        <span key={`${k}-p`} style={{ color: tone.com }}>{p[1]}</span>,
        <span key={`${k}-c`} style={{ color: tone.cmd, fontWeight: 600 }}>{p[2]}</span>,
        ...withMarks(p[3], lang, tone, tone.fg, marks, `${k}-r`),
      ];
    }
    return withMarks(line, line.trimStart().startsWith('#') ? 'bash' : 'text', tone, tone.out, marks, k);
  }
  return withMarks(line, lang, tone, tone.fg, marks, k);
}

const Code = ({
  code,
  lang = 'text',
  title,
  tag,
  variant = 'paper',
  size = 22,
  lh = 1.55,
  marks,
  style,
  bodyStyle,
}: {
  code: string;
  lang?: Lang;
  title?: ReactNode;
  tag?: string;
  variant?: Variant;
  size?: number;
  lh?: number;
  marks?: CodeMark[];
  style?: CSSProperties;
  bodyStyle?: CSSProperties;
}) => {
  const tone = TONE[variant];
  const s = SURF[variant];
  const lines = code.replace(/^\n/, '').replace(/\n\s*$/, '').split('\n');
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.line}`, borderRadius: 14, display: 'flex', flexDirection: 'column', ...style }}>
      {(title || tag) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '11px 18px', background: s.head, borderBottom: `1px solid ${s.line}`, borderRadius: '14px 14px 0 0', fontFamily: MONO, fontSize: 16, color: s.tag }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10, color: s.title }}>{title}</span>
          {tag && <span>{tag}</span>}
        </div>
      )}
      <div style={{ padding: '16px 20px', fontFamily: MONO, fontSize: size, lineHeight: lh, whiteSpace: 'pre', color: tone.fg, letterSpacing: 0, fontVariantLigatures: 'none', ...bodyStyle }}>
        {lines.map((l, i) => (
          <div key={i} style={{ minHeight: `${lh}em` }}>
            {renderLine(l, lang, tone, marks, `l${i}`)}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── The ASCII tide: FLIP fluid (after Matthias Müller / Ten Minute Physics) ──
// Ported from opentide.org's hero. Glyphs are detection content; the fluid only
// decides which of them are lit. Live on the active page only; every other
// instance (thumbnails, overview, presenter preview, PDF) paints a still frame
// of the same water shape, so activation is continuous.
const CELL_FLUID = 0;
const CELL_AIR = 1;
const CELL_SOLID = 2;
const clampN = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

class FlipFluid {
  density = 1000;
  fNumX: number;
  fNumY: number;
  h: number;
  fInvSpacing: number;
  fNumCells: number;
  u: Float32Array;
  v: Float32Array;
  du: Float32Array;
  dv: Float32Array;
  prevU: Float32Array;
  prevV: Float32Array;
  p: Float32Array;
  s: Float32Array;
  cellType: Int32Array;
  particleDensity: Float32Array;
  particleRestDensity = 0;
  maxParticles: number;
  numParticles = 0;
  particlePos: Float32Array;
  particleVel: Float32Array;
  particleRadius: number;
  pInvSpacing: number;
  pNumX: number;
  pNumY: number;
  pNumCells: number;
  numCellParticles: Int32Array;
  firstCellParticle: Int32Array;
  cellParticleIds: Int32Array;

  constructor(
    public tankWidth: number,
    public tankHeight: number,
    spacing: number,
    maxParticles: number,
  ) {
    this.fNumX = Math.floor(tankWidth / spacing) + 1;
    this.fNumY = Math.floor(tankHeight / spacing) + 1;
    this.h = Math.max(tankWidth / this.fNumX, tankHeight / this.fNumY);
    this.fInvSpacing = 1 / this.h;
    this.fNumCells = this.fNumX * this.fNumY;
    this.u = new Float32Array(this.fNumCells);
    this.v = new Float32Array(this.fNumCells);
    this.du = new Float32Array(this.fNumCells);
    this.dv = new Float32Array(this.fNumCells);
    this.prevU = new Float32Array(this.fNumCells);
    this.prevV = new Float32Array(this.fNumCells);
    this.p = new Float32Array(this.fNumCells);
    this.s = new Float32Array(this.fNumCells);
    this.cellType = new Int32Array(this.fNumCells);
    this.particleDensity = new Float32Array(this.fNumCells);
    this.maxParticles = maxParticles;
    this.particlePos = new Float32Array(2 * maxParticles);
    this.particleVel = new Float32Array(2 * maxParticles);
    this.particleRadius = 0.3 * spacing;
    this.pInvSpacing = 1 / (2.2 * this.particleRadius);
    this.pNumX = Math.floor(tankWidth * this.pInvSpacing) + 1;
    this.pNumY = Math.floor(tankHeight * this.pInvSpacing) + 1;
    this.pNumCells = this.pNumX * this.pNumY;
    this.numCellParticles = new Int32Array(this.pNumCells);
    this.firstCellParticle = new Int32Array(this.pNumCells + 1);
    this.cellParticleIds = new Int32Array(maxParticles);
    const n = this.fNumY;
    for (let i = 0; i < this.fNumX; i++) {
      for (let j = 0; j < this.fNumY; j++) {
        this.s[i * n + j] = i === 0 || i === this.fNumX - 1 || j === 0 ? 0 : 1;
      }
    }
  }

  /** Hex-pack particles under a surface profile (normalised x → normalised height). */
  fillBelow(surf: (nx: number) => number) {
    const h = this.h;
    const r = this.particleRadius;
    const dx = 2 * r;
    const dy = (Math.sqrt(3) / 2) * dx;
    const numX = Math.max(1, Math.floor((this.tankWidth - 2 * h - 2 * r) / dx));
    let p = 0;
    let count = 0;
    for (let i = 0; i < numX && count < this.maxParticles; i++) {
      for (let j = 0; count < this.maxParticles; j++) {
        const x = h + r + dx * i + (j % 2 === 0 ? 0 : r);
        const y = h + r + dy * j;
        const top = Math.min(this.tankHeight - 2 * h, surf(x / this.tankWidth) * this.tankHeight);
        if (y > top) break;
        this.particlePos[p++] = x;
        this.particlePos[p++] = y;
        count++;
      }
    }
    this.numParticles = count;
    this.particleRestDensity = 0;
  }

  integrateParticles(dt: number, gravity: number) {
    for (let i = 0; i < this.numParticles; i++) {
      this.particleVel[2 * i + 1] += dt * gravity;
      this.particlePos[2 * i] += this.particleVel[2 * i] * dt;
      this.particlePos[2 * i + 1] += this.particleVel[2 * i + 1] * dt;
    }
  }

  pushParticlesApart(numIters: number) {
    this.numCellParticles.fill(0);
    for (let i = 0; i < this.numParticles; i++) {
      const xi = clampN(Math.floor(this.particlePos[2 * i] * this.pInvSpacing), 0, this.pNumX - 1);
      const yi = clampN(Math.floor(this.particlePos[2 * i + 1] * this.pInvSpacing), 0, this.pNumY - 1);
      this.numCellParticles[xi * this.pNumY + yi]++;
    }
    let first = 0;
    for (let i = 0; i < this.pNumCells; i++) {
      first += this.numCellParticles[i];
      this.firstCellParticle[i] = first;
    }
    this.firstCellParticle[this.pNumCells] = first;
    for (let i = 0; i < this.numParticles; i++) {
      const xi = clampN(Math.floor(this.particlePos[2 * i] * this.pInvSpacing), 0, this.pNumX - 1);
      const yi = clampN(Math.floor(this.particlePos[2 * i + 1] * this.pInvSpacing), 0, this.pNumY - 1);
      const cellNr = xi * this.pNumY + yi;
      this.firstCellParticle[cellNr]--;
      this.cellParticleIds[this.firstCellParticle[cellNr]] = i;
    }
    const minDist = 2 * this.particleRadius;
    const minDist2 = minDist * minDist;
    for (let iter = 0; iter < numIters; iter++) {
      for (let i = 0; i < this.numParticles; i++) {
        const px = this.particlePos[2 * i];
        const py = this.particlePos[2 * i + 1];
        const pxi = Math.floor(px * this.pInvSpacing);
        const pyi = Math.floor(py * this.pInvSpacing);
        const x0 = Math.max(pxi - 1, 0);
        const y0 = Math.max(pyi - 1, 0);
        const x1 = Math.min(pxi + 1, this.pNumX - 1);
        const y1 = Math.min(pyi + 1, this.pNumY - 1);
        for (let xi = x0; xi <= x1; xi++) {
          for (let yi = y0; yi <= y1; yi++) {
            const cellNr = xi * this.pNumY + yi;
            const firstId = this.firstCellParticle[cellNr];
            const lastId = this.firstCellParticle[cellNr + 1];
            for (let j = firstId; j < lastId; j++) {
              const id = this.cellParticleIds[j];
              if (id === i) continue;
              const dx = this.particlePos[2 * id] - px;
              const dy = this.particlePos[2 * id + 1] - py;
              const d2 = dx * dx + dy * dy;
              if (d2 > minDist2 || d2 === 0) continue;
              const d = Math.sqrt(d2);
              const s = (0.5 * (minDist - d)) / d;
              this.particlePos[2 * i] -= dx * s;
              this.particlePos[2 * i + 1] -= dy * s;
              this.particlePos[2 * id] += dx * s;
              this.particlePos[2 * id + 1] += dy * s;
            }
          }
        }
      }
    }
  }

  handleParticleCollisions(ox: number, oy: number, orad: number, ovx: number, ovy: number) {
    const h = this.h;
    const r = this.particleRadius;
    const minDist = orad + r;
    const minDist2 = minDist * minDist;
    const minX = h + r;
    const maxX = (this.fNumX - 1) * h - r;
    const minY = h + r;
    const maxY = (this.fNumY - 1) * h - r;
    for (let i = 0; i < this.numParticles; i++) {
      let x = this.particlePos[2 * i];
      let y = this.particlePos[2 * i + 1];
      const dx = x - ox;
      const dy = y - oy;
      if (orad > 0 && dx * dx + dy * dy < minDist2) {
        this.particleVel[2 * i] = ovx;
        this.particleVel[2 * i + 1] = ovy;
      }
      if (x < minX) {
        x = minX;
        this.particleVel[2 * i] = 0;
      }
      if (x > maxX) {
        x = maxX;
        this.particleVel[2 * i] = 0;
      }
      if (y < minY) {
        y = minY;
        this.particleVel[2 * i + 1] = 0;
      }
      if (y > maxY) {
        y = maxY;
        this.particleVel[2 * i + 1] = 0;
      }
      this.particlePos[2 * i] = x;
      this.particlePos[2 * i + 1] = y;
    }
  }

  updateParticleDensity() {
    const n = this.fNumY;
    const h = this.h;
    const h1 = this.fInvSpacing;
    const h2 = 0.5 * h;
    const d = this.particleDensity;
    d.fill(0);
    for (let i = 0; i < this.numParticles; i++) {
      const x = clampN(this.particlePos[2 * i], h, (this.fNumX - 1) * h);
      const y = clampN(this.particlePos[2 * i + 1], h, (this.fNumY - 1) * h);
      const x0 = Math.floor((x - h2) * h1);
      const tx = (x - h2 - x0 * h) * h1;
      const x1 = Math.min(x0 + 1, this.fNumX - 2);
      const y0 = Math.floor((y - h2) * h1);
      const ty = (y - h2 - y0 * h) * h1;
      const y1 = Math.min(y0 + 1, this.fNumY - 2);
      const sx = 1 - tx;
      const sy = 1 - ty;
      if (x0 < this.fNumX && y0 < this.fNumY) d[x0 * n + y0] += sx * sy;
      if (x1 < this.fNumX && y0 < this.fNumY) d[x1 * n + y0] += tx * sy;
      if (x1 < this.fNumX && y1 < this.fNumY) d[x1 * n + y1] += tx * ty;
      if (x0 < this.fNumX && y1 < this.fNumY) d[x0 * n + y1] += sx * ty;
    }
    if (this.particleRestDensity === 0) {
      let sum = 0;
      let cells = 0;
      for (let i = 0; i < this.fNumCells; i++) {
        if (this.cellType[i] === CELL_FLUID) {
          sum += d[i];
          cells++;
        }
      }
      if (cells > 0) this.particleRestDensity = sum / cells;
    }
  }

  transferVelocities(toGrid: boolean, flipRatio = 0.3) {
    const n = this.fNumY;
    const h = this.h;
    const h1 = this.fInvSpacing;
    const h2 = 0.5 * h;
    if (toGrid) {
      this.prevU.set(this.u);
      this.prevV.set(this.v);
      this.du.fill(0);
      this.dv.fill(0);
      this.u.fill(0);
      this.v.fill(0);
      for (let i = 0; i < this.fNumCells; i++) this.cellType[i] = this.s[i] === 0 ? CELL_SOLID : CELL_AIR;
      for (let i = 0; i < this.numParticles; i++) {
        const xi = clampN(Math.floor(this.particlePos[2 * i] * h1), 0, this.fNumX - 1);
        const yi = clampN(Math.floor(this.particlePos[2 * i + 1] * h1), 0, this.fNumY - 1);
        const cellNr = xi * n + yi;
        if (this.cellType[cellNr] === CELL_AIR) this.cellType[cellNr] = CELL_FLUID;
      }
    }
    for (let component = 0; component < 2; component++) {
      const dx = component === 0 ? 0 : h2;
      const dy = component === 0 ? h2 : 0;
      const f = component === 0 ? this.u : this.v;
      const prevF = component === 0 ? this.prevU : this.prevV;
      const d = component === 0 ? this.du : this.dv;
      for (let i = 0; i < this.numParticles; i++) {
        const x = clampN(this.particlePos[2 * i], h, (this.fNumX - 1) * h);
        const y = clampN(this.particlePos[2 * i + 1], h, (this.fNumY - 1) * h);
        const x0 = Math.min(Math.floor((x - dx) * h1), this.fNumX - 2);
        const tx = (x - dx - x0 * h) * h1;
        const x1 = Math.min(x0 + 1, this.fNumX - 2);
        const y0 = Math.min(Math.floor((y - dy) * h1), this.fNumY - 2);
        const ty = (y - dy - y0 * h) * h1;
        const y1 = Math.min(y0 + 1, this.fNumY - 2);
        const sx = 1 - tx;
        const sy = 1 - ty;
        const d0 = sx * sy;
        const d1 = tx * sy;
        const d2 = tx * ty;
        const d3 = sx * ty;
        const nr0 = x0 * n + y0;
        const nr1 = x1 * n + y0;
        const nr2 = x1 * n + y1;
        const nr3 = x0 * n + y1;
        if (toGrid) {
          const pv = this.particleVel[2 * i + component];
          f[nr0] += pv * d0;
          d[nr0] += d0;
          f[nr1] += pv * d1;
          d[nr1] += d1;
          f[nr2] += pv * d2;
          d[nr2] += d2;
          f[nr3] += pv * d3;
          d[nr3] += d3;
        } else {
          const offset = component === 0 ? n : 1;
          const valid0 = this.cellType[nr0] !== CELL_AIR || this.cellType[nr0 - offset] !== CELL_AIR ? 1 : 0;
          const valid1 = this.cellType[nr1] !== CELL_AIR || this.cellType[nr1 - offset] !== CELL_AIR ? 1 : 0;
          const valid2 = this.cellType[nr2] !== CELL_AIR || this.cellType[nr2 - offset] !== CELL_AIR ? 1 : 0;
          const valid3 = this.cellType[nr3] !== CELL_AIR || this.cellType[nr3 - offset] !== CELL_AIR ? 1 : 0;
          const wsum = valid0 * d0 + valid1 * d1 + valid2 * d2 + valid3 * d3;
          if (wsum > 0) {
            const v = this.particleVel[2 * i + component];
            const picV = (valid0 * d0 * f[nr0] + valid1 * d1 * f[nr1] + valid2 * d2 * f[nr2] + valid3 * d3 * f[nr3]) / wsum;
            const corr =
              (valid0 * d0 * (f[nr0] - prevF[nr0]) +
                valid1 * d1 * (f[nr1] - prevF[nr1]) +
                valid2 * d2 * (f[nr2] - prevF[nr2]) +
                valid3 * d3 * (f[nr3] - prevF[nr3])) /
              wsum;
            this.particleVel[2 * i + component] = (1 - flipRatio) * picV + flipRatio * (v + corr);
          }
        }
      }
      if (toGrid) {
        for (let i = 0; i < f.length; i++) if (d[i] > 0) f[i] /= d[i];
        for (let i = 0; i < this.fNumX; i++) {
          for (let j = 0; j < this.fNumY; j++) {
            const solid = this.cellType[i * n + j] === CELL_SOLID;
            if (solid || (i > 0 && this.cellType[(i - 1) * n + j] === CELL_SOLID)) this.u[i * n + j] = this.prevU[i * n + j];
            if (solid || (j > 0 && this.cellType[i * n + j - 1] === CELL_SOLID)) this.v[i * n + j] = this.prevV[i * n + j];
          }
        }
      }
    }
  }

  solveIncompressibility(numIters: number, dt: number, overRelaxation: number) {
    this.p.fill(0);
    this.prevU.set(this.u);
    this.prevV.set(this.v);
    const n = this.fNumY;
    const cp = (this.density * this.h) / dt;
    for (let iter = 0; iter < numIters; iter++) {
      for (let i = 1; i < this.fNumX - 1; i++) {
        for (let j = 1; j < this.fNumY - 1; j++) {
          if (this.cellType[i * n + j] !== CELL_FLUID) continue;
          const center = i * n + j;
          const left = (i - 1) * n + j;
          const right = (i + 1) * n + j;
          const bottom = i * n + j - 1;
          const top = i * n + j + 1;
          const sx0 = this.s[left];
          const sx1 = this.s[right];
          const sy0 = this.s[bottom];
          const sy1 = this.s[top];
          const s = sx0 + sx1 + sy0 + sy1;
          if (s === 0) continue;
          let div = this.u[right] - this.u[center] + this.v[top] - this.v[center];
          if (this.particleRestDensity > 0) {
            const compression = this.particleDensity[center] - this.particleRestDensity;
            if (compression > 0) div -= compression;
          }
          const p = (-div / s) * overRelaxation;
          this.p[center] += cp * p;
          this.u[center] -= sx0 * p;
          this.u[right] += sx1 * p;
          this.v[center] -= sy0 * p;
          this.v[top] += sy1 * p;
        }
      }
    }
  }

  simulate(dt: number, gravity: number, flipRatio: number, pIters: number, sepIters: number, overRelax: number, ox: number, oy: number, orad: number, ovx: number, ovy: number) {
    this.integrateParticles(dt, gravity);
    this.pushParticlesApart(sepIters);
    this.handleParticleCollisions(ox, oy, orad, ovx, ovy);
    this.transferVelocities(true);
    this.updateParticleDensity();
    this.solveIncompressibility(pIters, dt, overRelax);
    this.transferVelocities(false, flipRatio);
  }

  /** Relative density at normalised coords (0..1, y up), 0..1. */
  sampleDensity01(nx: number, ny: number): number {
    const h1 = this.fInvSpacing;
    const xi = clampN(Math.floor(clampN(nx, 0, 1) * this.tankWidth * h1), 0, this.fNumX - 1);
    const yi = clampN(Math.floor(clampN(ny, 0, 1) * this.tankHeight * h1), 0, this.fNumY - 1);
    const dens = this.particleDensity[xi * this.fNumY + yi];
    if (this.particleRestDensity <= 0) return dens > 0 ? 1 : 0;
    return clampN(dens / this.particleRestDensity, 0, 2) / 2;
  }
}

const fract = (x: number) => x - Math.floor(x);
const hash2 = (x: number, y: number, s: number) => fract(Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453);

/** Deterministic tide profile shared by the still frame and the live start. */
const tideSurface = (fill: number, seed: number) => {
  const a = seed * Math.PI * 2;
  return (x: number) =>
    fill +
    0.034 * Math.sin(Math.PI * 2 * x * 1.15 + a) +
    0.019 * Math.sin(Math.PI * 2 * x * 2.6 + a * 1.9 + 1.3) +
    0.009 * Math.sin(Math.PI * 2 * x * 6.2 + a * 0.7 + 2.1);
};

const stillDensity = (fill: number, seed: number) => {
  const surf = tideSurface(fill, seed);
  return (nx: number, ny: number) => {
    const s = surf(nx);
    if (ny > s) {
      const d = ny - s;
      if (d < 0.05) {
        const crest = clampN((s - fill) / 0.045, 0, 1);
        const r = hash2(Math.floor(nx * 160), Math.floor(ny * 90), seed);
        if (r < 0.22 * crest * (1 - d / 0.05)) return 0.1 + 0.25 * r;
      }
      return 0;
    }
    const depth = s - ny;
    const edge = clampN(depth / 0.03, 0, 1);
    const n = hash2(Math.floor(nx * 213), Math.floor(ny * 57), seed + 3);
    return 0.22 + 0.26 * edge + 0.1 * n;
  };
};

type Rgb = { r: number; g: number; b: number };
const hexRgb = (hex: string): Rgb => ({ r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) });

const BUCKETS = 16;
// Glyph grid uses true monospace cells (advance 0.6em, line 1.28em) so the
// water reads as lines of real query text rather than spaced-out letters.
function paintTide(
  ctx: CanvasRenderingContext2D,
  W: number,
  Hh: number,
  font: number,
  text: string,
  density: (nx: number, ny: number) => number,
  ink: Rgb,
  bg: string,
  maskTop: number | undefined,
) {
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, Hh);
  const cw = font * 0.6;
  const ch = font * 1.28;
  const cols = Math.ceil(W / cw);
  const rows = Math.ceil(Hh / ch);
  const len = text.length;
  const buckets: number[][] = Array.from({ length: BUCKETS }, () => []);
  for (let row = 0; row < rows; row++) {
    const ny = 1 - (row + 0.5) / rows;
    const fade = maskTop === undefined ? 1 : clampN(1 - (ny - maskTop) / 0.05, 0, 1);
    if (fade <= 0) continue;
    const rowStart = row * (cols + 7);
    for (let col = 0; col < cols; col++) {
      const dens = density((col + 0.5) / cols, ny);
      if (dens < 0.05) continue;
      const k = (rowStart + col) % len;
      if (text.charCodeAt(k) === 32) continue;
      const v = Math.min(1, dens * 1.5);
      const a = (0.2 + v * 0.8) * fade;
      if (a < 0.05) continue;
      buckets[Math.min(BUCKETS - 1, Math.floor(a * BUCKETS))].push(col, row, k);
    }
  }
  ctx.font = `500 ${font}px 'JetBrains Mono', ui-monospace, Menlo, monospace`;
  ctx.textBaseline = 'top';
  const dy = (ch - font) / 2;
  for (let b = 0; b < BUCKETS; b++) {
    const list = buckets[b];
    if (!list.length) continue;
    ctx.fillStyle = `rgba(${ink.r},${ink.g},${ink.b},${((b + 0.5) / BUCKETS).toFixed(3)})`;
    for (let i = 0; i < list.length; i += 3) ctx.fillText(text[list[i + 2]], list[i] * cw, list[i + 1] * ch + dy);
  }
}

const GRID_RES = 52;

const TideCanvas = ({
  text,
  fill,
  seed = 0.2,
  maskTop,
  font = 15,
  width = 1920,
  height = 1080,
  ink = BLUE,
  bg = '#FFFFFF',
}: {
  text: string;
  fill: number;
  seed?: number;
  maskTop?: number;
  font?: number;
  width?: number;
  height?: number;
  ink?: string;
  bg?: string;
}) => {
  const cell = font;
  const ref = useRef<HTMLCanvasElement>(null);
  const active = useIsActivePage();
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    const rgb = hexRgb(ink);
    const reduced = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let disposed = false;
    let raf = 0;

    const fit = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const ratio = r.width > 0 ? clampN((r.width * dpr) / width, 0.3, 2) : 1;
      const bw = Math.round(width * ratio);
      const bh = Math.round(height * ratio);
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const fontReady: Promise<unknown> =
      typeof document !== 'undefined' && document.fonts?.load
        ? document.fonts.load(`500 ${cell}px 'JetBrains Mono'`).catch(() => undefined)
        : Promise.resolve();

    if (!active || reduced) {
      const still = stillDensity(fill, seed);
      const draw = () => {
        if (disposed) return;
        fit();
        paintTide(ctx, width, height, cell, text, still, rgb, bg, maskTop);
        canvas.setAttribute('data-drawn', '1');
      };
      draw();
      fontReady.then(draw);
      window.addEventListener('resize', draw);
      return () => {
        disposed = true;
        window.removeEventListener('resize', draw);
      };
    }

    // Live: start from the exact still profile, then let gravity and a slow
    // autonomous swell move it. The pointer can stir the water.
    const tankH = 1;
    const tankW = width / height;
    const spacing = tankH / GRID_RES;
    const r = 0.3 * spacing;
    const cap = Math.ceil((tankW / (2 * r)) * ((fill + 0.08) / ((Math.sqrt(3) / 2) * 2 * r))) + 64;
    const fluid = new FlipFluid(tankW, tankH, spacing, Math.min(14000, cap));
    fluid.fillBelow(tideSurface(fill, seed));
    const density = (nx: number, ny: number) => fluid.sampleDensity01(nx, ny);
    const mouse = { x: 0, y: 0, vx: 0, vy: 0, on: false, last: 0, lx: 0, ly: 0 };
    let t = seed * 10;
    const step = () => {
      const dt = (1 / 60) * 0.9;
      t += dt;
      let ox = 0;
      let oy = 0;
      let ovx = 0;
      let ovy = 0;
      let orad = 0;
      if (mouse.on) {
        ox = mouse.x;
        oy = mouse.y;
        orad = 0.16;
        ovx = clampN(mouse.vx, -40, 40) * 0.9;
        ovy = clampN(mouse.vy, -40, 40) * 0.9;
      } else if (performance.now() - mouse.last > 1200) {
        ox = tankW * (0.5 + 0.34 * Math.sin(t * 0.55));
        oy = tankH * (fill + 0.05 + 0.03 * Math.sin(t * 1.3));
        orad = 0.12;
        ovx = Math.cos(t * 0.55) * 11;
        ovy = Math.sin(t * 1.6) * 4;
      }
      fluid.simulate(dt, -25, 0.3, 30, 3, 1.5, ox, oy, orad, ovx, ovy);
    };
    const frame = () => {
      if (disposed) return;
      step();
      paintTide(ctx, width, height, cell, text, density, rgb, bg, maskTop);
      raf = requestAnimationFrame(frame);
    };
    fit();
    step();
    paintTide(ctx, width, height, cell, text, density, rgb, bg, maskTop);
    canvas.setAttribute('data-drawn', '1');
    raf = requestAnimationFrame(frame);

    const host = canvas.parentElement ?? canvas;
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0) return;
      const x = clampN((e.clientX - rect.left) / rect.width, 0, 1) * tankW;
      const y = (1 - clampN((e.clientY - rect.top) / rect.height, 0, 1)) * tankH;
      const now = performance.now();
      const dt = Math.max(0.008, (now - mouse.last) / 1000);
      mouse.vx = (x - mouse.lx) / dt;
      mouse.vy = (y - mouse.ly) / dt;
      mouse.lx = x;
      mouse.ly = y;
      mouse.x = x;
      mouse.y = y;
      mouse.last = now;
      mouse.on = true;
    };
    const onLeave = () => {
      mouse.on = false;
      mouse.vx = 0;
      mouse.vy = 0;
    };
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', fit);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', fit);
    };
  }, [active, text, fill, seed, maskTop, cell, width, height, ink, bg]);

  return (
    <div data-waitfor="canvas[data-drawn]" style={{ position: 'absolute', inset: 0 }}>
      <canvas ref={ref} aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
};


// ── Glyph sources for the tide: each chapter's water is made of its material ─
const Q_COVER = [
  'opentide setup --yes --name "SOC Detections" --platform sentinel --ci github',
  'opentide setup mcp --claude-code --yes  opentide setup skills --claude-code --yes',
  'detection_model: f8817f95-c43e-402b-83a1-5157ce46e670  techniques: [T1003.001]',
  'DeviceProcessEvents | where FileName =~ "lsass.exe" | where ActionType == "OpenProcessApiCall"',
  'opentide validate --strict && opentide deploy --platform sentinel --dry-run',
  'schema: rule::1.1  status: STAGING  tlp: clear',
].join('   ') + '   ';
const Q_SETUP = [
  "pip install 'opentide==0.15.0'  opentide setup --yes --platform sentinel --ci github",
  'opentide setup mcp --claude-code --yes  opentide setup skills --yes --claude-code',
  'opentide setup hooks --yes  opentide generate  opentide validate --strict',
  '.mcp.json  CLAUDE.md  .claude/skills/opentide-detection-rule  .opentide/configurations/platforms/sentinel.toml',
].join('   ') + '   ';
const Q_SPEC = [
  'name: metadata: uuid: schema: threat::1.0 version: tlp: clear',
  'threat: severity: impact: leverage: viability: terrain: surface: mitre_attack: actors:',
  'objective: priority: composition: strategy: threats: signals: methodology: entities: data:',
  'rule: status: STAGING severity: techniques: detection_model: configurations: sentinel: query:',
].join('   ') + '   ';
const Q_LOOP = [
  'search(query="T1003")  get_chaining(uuid)  coverage(technique="T1059")',
  'validation_report()  validate_rule(uuid)  deploy_rule(uuid, platform="sentinel", dry_run=true)',
  "vocab_unknown  invalid_ref  suggestion: Data Breach  yaml_line: 17  field_path: [threat, impact]",
].join('   ') + '   ';
const Q_SHIP = [
  'git switch -c detections/lsass-access  gh pr create --fill',
  'opentide validate --strict  opentide lint --strict  opentide validate query --platform sentinel --live',
  'opentide deploy --plan STAGING --skip-unconfigured  opentide deploy --plan PRODUCTION',
  'opentide generate docs --changed  opentide generate exports navigator  opentide generate explorer',
  'opentide share preview  opentide share targets  max_tlp  explorer.bundle.json  layer 4.5',
].join('   ') + '   ';
const Q_PLAY = [
  'intel → threat → objective → rule  coverage gaps  port to splunk  fix validation',
  'review dates  tune false positives  migrate from CoreTide  one chain per pull request',
].join('   ') + '   ';
const Q_CLOSE = [Q_COVER, Q_SPEC, Q_LOOP].join('   ');

// ─────────────────────────────────────────────────────────────────────────────
// Shared page patterns
// ─────────────────────────────────────────────────────────────────────────────
// Chapter divider. The water rises chapter by chapter (fill), and the text
// block sits at `top` so it always clears the crests.
const Divider = ({ n, title, sub, fill, text, seed, chapter, top = 196 }: { n: string; title: ReactNode; sub: ReactNode; fill: number; text: string; seed: number; chapter: string; top?: number }) => (
  <Stage>
    <TideCanvas text={text} fill={fill} seed={seed} maskTop={fill + 0.065} ink={BLUE} bg="#FFFFFF" />
    <TopBar chapter={[n, chapter]} />
    <div style={{ position: 'absolute', left: 120, top, width: 1560, zIndex: 2 }}>
      <div style={{ fontFamily: MONO, fontSize: 26, color: ACC, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span>{n}</span>
        <span style={{ color: C.dim }}>/ 05</span>
      </div>
      <h2 style={{ margin: '26px 0 0', fontFamily: DISPLAY, fontWeight: 800, fontSize: 132, lineHeight: 0.98, letterSpacing: '-0.048em', color: INK }}>{title}</h2>
      <p style={{ margin: '34px 0 0', fontSize: 34, lineHeight: 1.4, color: C.muted, maxWidth: 1280, letterSpacing: '-0.01em' }}>{sub}</p>
    </div>
    <Footer onTide />
  </Stage>
);


const CTerm = ({ title, parts, size = 21, lh = 1.55, style }: { title: ReactNode; parts: { lang: Lang; code: string }[]; size?: number; lh?: number; style?: CSSProperties }) => (
  <div style={{ background: NV.bg, border: `1px solid ${NV.line}`, borderRadius: 14, display: 'flex', flexDirection: 'column', ...style }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px', background: NV.head, borderBottom: `1px solid ${NV.line}`, borderRadius: '14px 14px 0 0', fontFamily: MONO, fontSize: 16, color: NV.muted }}>
      <Icon name="terminal" size={18} color={NV.foam} />
      {title}
    </div>
    <div style={{ padding: '16px 20px', fontFamily: MONO, fontSize: size, lineHeight: lh, whiteSpace: 'pre', color: NV.ink, fontVariantLigatures: 'none' }}>
      {parts.map((p, pi) =>
        p.code.split('\n').map((l, i) => (
          <div key={`${pi}-${i}`} style={{ minHeight: `${lh}em` }}>
            {renderLine(l, p.lang, TONE.navy, undefined, `c${pi}-${i}`)}
          </div>
        )),
      )}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
type DKind = 'input' | 'agent' | 'gate' | 'env' | 'prod';
const D_KIND: Record<DKind, { bg: string; border: string; icon: string; fg: string; sub: string }> = {
  input: { bg: '#FFFFFF', border: `1.5px dashed ${BLUE}`, icon: BLUE, fg: C.inkHex, sub: C.muted },
  agent: { bg: '#FFFFFF', border: `1.5px solid ${BLUE}`, icon: BLUE, fg: C.inkHex, sub: C.muted },
  gate: { bg: '#FFFFFF', border: `1.5px solid ${C.inkHex}`, icon: C.inkHex, fg: C.inkHex, sub: C.muted },
  env: { bg: C.paper2, border: `1.5px solid ${C.inkHex}`, icon: C.inkHex, fg: C.inkHex, sub: C.muted },
  prod: { bg: C.inkHex, border: `1.5px solid ${C.inkHex}`, icon: '#FFFFFF', fg: '#FFFFFF', sub: 'rgba(255,255,255,0.74)' },
};
// Diagram geometry (px, diagram-local). Rows: 1 draft (L→R), 2 check (R→L), 3 promote (L→R).
const D_NH = 90; // node height
const D_R1 = 80; // row 1 top
const D_R2 = 256; // row 2 top
const D_AH = 380; // agent zone height
const D_HT = 442; // human zone top
const D_R3 = 522; // row 3 top
const D_DH = 646; // diagram height
const D_Y1 = D_R1 + D_NH / 2;
const D_Y2 = D_R2 + D_NH / 2;
const D_Y3 = D_R3 + D_NH / 2;

const DNode = ({ x, y, w, kind, icon, label, sub }: { x: number; y: number; w: number; kind: DKind; icon: IconName; label: string; sub: string }) => {
  const k = D_KIND[kind];
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: D_NH,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '0 18px',
        borderRadius: 14,
        background: k.bg,
        border: k.border,
      }}
    >
      <Icon name={icon} size={28} color={k.icon} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, whiteSpace: 'nowrap' }}>
        <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 600, lineHeight: 1.1, color: k.fg }}>{label}</span>
        <span style={{ fontFamily: MONO, fontSize: 17, lineHeight: 1.1, color: k.sub }}>{sub}</span>
      </div>
    </div>
  );
};

// Arrowhead chevron at (x, y) pointing r/l/u/d.
const DHead = ({ x, y, dir, color }: { x: number; y: number; dir: 'l' | 'r' | 'u' | 'd'; color: string }) => {
  const d =
    dir === 'r'
      ? `M${x - 9} ${y - 7} L${x} ${y} L${x - 9} ${y + 7}`
      : dir === 'l'
        ? `M${x + 9} ${y - 7} L${x} ${y} L${x + 9} ${y + 7}`
        : dir === 'u'
          ? `M${x - 7} ${y + 9} L${x} ${y} L${x + 7} ${y + 9}`
          : `M${x - 7} ${y - 9} L${x} ${y} L${x + 7} ${y - 9}`;
  return <path d={d} fill="none" stroke={color} strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" />;
};

const DZoneHead = ({ top, icon, color, name, scope, note }: { top: number; icon: IconName; color: string; name: string; scope: string; note: string }) => (
  <div style={{ position: 'absolute', left: 64, right: 64, top, display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 19, whiteSpace: 'nowrap' }}>
    <Icon name={icon} size={22} color={color} />
    <span style={{ color, fontWeight: 600 }}>{name}</span>
    <span style={{ color: C.muted }}>· {scope}</span>
    <span style={{ marginLeft: 'auto', color: C.subtle, fontSize: 18 }}>{note}</span>
  </div>
);

// Straight horizontal connector from x1 to x2 at y, arrowhead at x2.
const DArrowH = ({ x1, x2, y, color }: { x1: number; x2: number; y: number; color: string }) => {
  const right = x2 > x1;
  return (
    <>
      <path d={`M${x1} ${y} H${right ? x2 - 3 : x2 + 3}`} stroke={color} strokeWidth={2.25} />
      <DHead x={x2} y={y} dir={right ? 'r' : 'l'} color={color} />
    </>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// Workshop patterns: prompt cards, expectation rows, cards, link rows
// ─────────────────────────────────────────────────────────────────────────────
// A prompt the participant types, verbatim. Blue header = "you → agent".
const Prompt = ({ n, title, children, size = 27, style }: { n: string; title: string; children: ReactNode; size?: number; style?: CSSProperties }) => (
  <div style={{ background: '#FFFFFF', border: `1.5px solid ${BLUE}`, borderRadius: 16, display: 'flex', flexDirection: 'column', ...style }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 22px', background: BLUE, borderRadius: '14px 14px 0 0', fontFamily: MONO, fontSize: 17, color: '#FFFFFF', whiteSpace: 'nowrap' }}>
      <Icon name="user" size={18} color="#FFFFFF" />
      <span style={{ fontWeight: 600 }}>prompt {n}</span>
      <span style={{ opacity: 0.55 }}>·</span>
      <span>{title}</span>
      <span style={{ marginLeft: 'auto', opacity: 0.7 }}>you → agent</span>
    </div>
    <div style={{ padding: '22px 26px 24px', fontSize: size, lineHeight: 1.46, color: INK, letterSpacing: '-0.01em' }}>{children}</div>
  </div>
);

// One "what to expect" row: what the agent does, and the call or file behind it.
const Expect = ({ icon = 'check', children, cmd, first }: { icon?: IconName; children: ReactNode; cmd?: ReactNode; first?: boolean }) => (
  <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', padding: '16px 0', borderTop: first ? undefined : `1px solid ${C.line}` }}>
    <Icon name={icon} size={26} color={BLUE} style={{ marginTop: 3 }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={{ fontSize: 25, lineHeight: 1.35, color: INK, letterSpacing: '-0.01em' }}>{children}</span>
      {cmd && <span style={{ fontFamily: MONO, fontSize: 18, color: C.muted, fontVariantLigatures: 'none' }}>{cmd}</span>}
    </div>
  </div>
);

// Right-hand column header: "what to expect".
const ColHead = ({ icon, children }: { icon: IconName; children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 20, color: ACC, fontWeight: 600, paddingBottom: 6 }}>
    <Icon name={icon} size={22} color={BLUE} />
    {children}
  </div>
);

// A quiet one-line note under a layout ("watch for", "tip").
const Note = ({ tag, children, style }: { tag: string; children: ReactNode; style?: CSSProperties }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, padding: '18px 24px', borderRadius: 14, background: C.paper, border: `1px solid ${C.line}`, ...style }}>
    <span style={{ fontFamily: MONO, fontSize: 18, color: ACC, fontWeight: 600, whiteSpace: 'nowrap' }}>{tag}</span>
    <span style={{ fontSize: 23, lineHeight: 1.4, color: C.muted }}>{children}</span>
  </div>
);

const ELink = ({ icon, label, value }: { icon: IconName; label: string; value: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '15px 0', borderTop: `1px solid ${C.line}` }}>
    <Icon name={icon} size={28} color={BLUE} />
    <span style={{ width: 150, fontFamily: MONO, fontSize: 18, color: C.dim }}>{label}</span>
    <span style={{ fontFamily: MONO, fontSize: 21, color: INK }}>{value}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// 00 · COVER
// ─────────────────────────────────────────────────────────────────────────────
const Cover: Page = () => (
  <Stage>
    <TideCanvas text={Q_COVER} fill={0.22} seed={0.31} maskTop={0.29} ink={BLUE} bg="#FFFFFF" />
    <img src={logoNormal} alt="opentide" style={{ position: 'absolute', left: 120, top: 92, height: 62, display: 'block' }} />
    <div style={{ position: 'absolute', right: 120, top: 92, height: 62, display: 'flex', alignItems: 'center', gap: 14, fontFamily: MONO, fontSize: 20, color: C.muted }}>
      <span>workshop</span>
      <span style={{ color: C.dim }}>·</span>
      <span>90 minutes</span>
      <span style={{ color: C.dim }}>·</span>
      <span>opentide 0.15.0</span>
    </div>
    <h1 style={{ position: 'absolute', left: 120, top: 208, margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 'var(--osd-size-hero)', lineHeight: 0.98, letterSpacing: '-0.05em', color: INK }}>
      Detection engineering
      <br />
      with a <span style={{ color: ACC }}>coding agent</span>.
    </h1>
    <p style={{ position: 'absolute', left: 120, top: 520, width: 1300, margin: 0, fontSize: 32, lineHeight: 1.45, color: C.muted, letterSpacing: '-0.01em' }}>
      Ninety minutes, hands on: from an empty folder to your own operational detection platform, with one threat-aligned, validated
      rule in a pull request. You bring the intent, the agent does the typing, the engine checks, you approve.
    </p>
  </Stage>
);

// ─────────────────────────────────────────────────────────────────────────────
// 00 · WHAT TO BRING — first content page, so the room can fix laptops early.
// ─────────────────────────────────────────────────────────────────────────────
const Bring: Page = () => (
  <Frame chapter={['00', 'overview']} source="opentide.org/docs/usage/quickstart · workshop prerequisites">
    <H>What to bring. Check it now.</H>
    <Lead maxWidth={1560}>Everything runs on your laptop. The agent is the fast path, not the requirement.</Lead>
    <div style={{ display: 'flex', gap: 56, marginTop: 36 }}>
      <div style={{ width: 812, display: 'flex', flexDirection: 'column' }}>
        <ColHead icon="check">required</ColHead>
        <Expect first icon="python" cmd="a laptop where pip install is allowed">
          Python 3.10 or later, and the rights to install packages.
        </Expect>
        <Expect icon="branch" cmd="branch · commit · pull request">
          git, and enough familiarity to push a branch.
        </Expect>
        <Expect icon="editor" cmd="VS Code · Kiro · any schema-aware editor">
          An IDE that reads JSON Schema, for YAML completion.
        </Expect>
        <Expect icon="globe" cmd="pypi.org · github.com · opentide.org">
          Network egress. Test your proxy before the session.
        </Expect>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ColHead icon="spark">bring it if you want the full loop</ColHead>
        <Expect first icon="agent" cmd="MCP support is what wires the opentide tools in">
          An agent: any harness, any model. Claude Code, Cursor, Codex, Kiro, VS Code with Copilot, Continue with a local model.
        </Expect>
        <Expect icon="user" cmd="github or gitlab · SaaS or self-managed">
          A git account, to push a branch and watch CI run.
        </Expect>
        <Expect icon="lock" cmd="your tenant, never ours · a dry run needs nothing">
          Platform or MISP credentials, for a real deploy.
        </Expect>
        <Expect icon="intel" cmd="otherwise we hand you one">
          A threat report you actually care about.
        </Expect>
      </div>
    </div>
    <Note tag="no agent" style={{ marginTop: 'auto' }}>
      The workshop still works. Every prompt in this deck maps to a CLI command and the slides show both, so you can type what the
      agent would have typed. Or pair up with someone who brought one.
    </Note>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// 00 · OUTCOMES + AGENDA
// ─────────────────────────────────────────────────────────────────────────────
const AgendaRow = ({ n, title, sub, last }: { n: string; title: string; sub: string; last?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 28, padding: '24px 0', borderTop: `1px solid ${C.line}`, borderBottom: last ? `1px solid ${C.line}` : undefined }}>
    <span style={{ fontFamily: MONO, fontSize: 22, color: ACC, width: 40 }}>{n}</span>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ fontSize: 36, fontWeight: 650, letterSpacing: '-0.025em', color: INK, lineHeight: 1.1 }}>{title}</span>
      <span style={{ fontFamily: MONO, fontSize: 19, color: C.subtle }}>{sub}</span>
    </div>
  </div>
);

const Outcome = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', padding: '15px 0' }}>
    <div style={{ width: 30, height: 30, flex: '0 0 auto', borderRadius: 8, background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 3 }}>
      <Icon name="check" size={20} color="#FFFFFF" stroke={2.4} />
    </div>
    <span style={{ fontSize: 27, lineHeight: 1.38, color: INK, letterSpacing: '-0.012em' }}>{children}</span>
  </div>
);

const Agenda: Page = () => (
  <Frame chapter={['00', 'overview']} source="opentide.org/docs/usage/workflows/agentic-setup">
    <div style={{ display: 'flex', gap: 110, height: '100%', alignItems: 'center' }}>
      <div style={{ width: 800 }}>
        <Label>what you leave with</Label>
        <H size={56} style={{ marginTop: 20 }}>
          One detection, end to end, <A>built by your agent</A>.
        </H>
        <div style={{ marginTop: 30 }}>
          <Outcome>a detection repo your agent scaffolded: Sentinel, GitHub CI, hooks</Outcome>
          <Outcome>the opentide MCP server and skills wired into your agent</Outcome>
          <Outcome>
            a threat → objective → rule chain that passes <M>validate --strict</M>
          </Outcome>
          <Outcome>a dry-run deploy plan and a pull request CI re-checks</Outcome>
          <Outcome>a prompt playbook you can reuse on Monday</Outcome>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <AgendaRow n="01" title="Set up" sub="one prompt · repo, mcp, skills, house rules" />
        <AgendaRow n="02" title="Spec first" sub="threat → objective → rule, in that order" />
        <AgendaRow n="03" title="Close the loop" sub="validate · fix · coverage · dry-run" />
        <AgendaRow n="04" title="Ship it" sub="pull request · ci gates · promotion" />
        <AgendaRow n="05" title="Your playbook" sub="prompts to keep · patterns · labs" last />
      </div>
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// 00 · THREE ROLES + PREREQUISITES
// ─────────────────────────────────────────────────────────────────────────────
const Role = ({ icon, who, line, items, solid }: { icon: IconName; who: string; line: string; items: string[]; solid?: boolean }) => (
  <div style={{ flex: 1, borderRadius: 18, border: `1.5px solid ${solid ? BLUE : C.line2}`, background: solid ? C.blueSoft : '#FFFFFF', padding: '30px 32px', display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 52, height: 52, borderRadius: 13, background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={30} color="#FFFFFF" />
      </div>
      <span style={{ fontSize: 38, fontWeight: 720, letterSpacing: '-0.03em', color: INK }}>{who}</span>
    </div>
    <span style={{ marginTop: 18, fontFamily: MONO, fontSize: 19, color: ACC }}>{line}</span>
    <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column' }}>
      {items.map((t) => (
        <span key={t} style={{ fontSize: 24, lineHeight: 1.35, color: C.muted, padding: '11px 0', borderTop: `1px solid ${C.line}` }}>
          {t}
        </span>
      ))}
    </div>
  </div>
);

const Roles: Page = () => (
  <Frame chapter={['00', 'overview']} source="opentide.org/docs/usage/choosing-an-interface">
    <H>Three roles. Keep them separate.</H>
    <Lead>The workshop works because nobody does someone else's job.</Lead>
    <div style={{ display: 'flex', gap: 28, marginTop: 40 }}>
      <Role icon="user" who="You" line="intent and judgment" items={['bring the intel and pick the platform', 'choose which signals are worth building', 'review the diff, approve promotion']} />
      <Role icon="agent" who="The agent" line="drafts and runs" items={['searches the catalogue before writing', 'drafts YAML from the templates', 'runs the CLI, fixes what the engine flags']} solid />
      <Role icon="engine" who="opentide" line="the spec and the gates" items={['ontology and taxonomy: schemas, vocabularies', 'validation, chaining, coverage', 'deploy plans, CI pipelines, docs']} />
    </div>
    <Note tag="no agent" style={{ marginTop: 'auto' }}>
      You take the first two columns: you draft the YAML and run the CLI yourself. The third column does not change, and neither does
      a single gate in it.
    </Note>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// 01 · SET UP
// ─────────────────────────────────────────────────────────────────────────────
const DividerSetup: Page = () => (
  <Divider
    n="01"
    chapter="set up"
    title="Set up."
    sub="One prompt turns an empty folder into a detection repo your agent understands."
    fill={0.26}
    seed={0.44}
    text={Q_SETUP}
  />
);

const T_SETUP = `$ pip install 'opentide==0.15.0'
$ opentide setup --yes --name "SOC Detections" \\
    --org "Example Corp" --platform sentinel --ci github
OK Setup complete
$ opentide setup mcp --claude-code --yes
OK MCP configuration generated
$ opentide setup skills --yes --claude-code \\
    --name "SOC Detections" --org "Example Corp"
OK Agent skills installed
$ opentide setup hooks --yes
OK Validate-on-commit hooks configured
$ opentide generate
OK Full generation pipeline completed
$ opentide validate --strict
OK Validation passed, but no detection objects were found`;

const PromptSetup: Page = () => (
  <Frame chapter={['01', 'set up']} source="opentide.org/docs/cli/setup · run against opentide 0.15.0">
    <H>Let the agent scaffold the repo.</H>
    <div style={{ display: 'flex', gap: 48, marginTop: 40 }}>
      <div style={{ width: 760, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Prompt n="01" title="scaffold">
          Install <M>opentide==0.15.0</M>{' in a virtualenv.'}<br />{'Create an empty folder `Hacklu2026_ws` do `git init`and by using only opentide CLI in this empty folder,'}<br />{'- set up an opentide detection repository called "SOC Detections" for Example Corp.'}<br />{'- Configure Microsoft Sentinel and Splunk as platforms'}<br />{'and GitHub Actions.'}<br />{'- Wire the opentide MCP server and skills for Claude Code and G'}{''}eneric agent<br />{'add the pre-commit hook, then run '}<M>generate</M> and <M>validate --strict</M>. Use non-interactive flags.
        </Prompt>
        <Note tag="expect">
          The interactive wizard needs a terminal. Agents pass explicit flags and <M>--yes</M>; without them opentide fails fast instead
          of waiting for input.
        </Note>
      </div>
      <CTerm title="what the agent runs · real output" parts={[{ lang: 'bash', code: T_SETUP }]} size={19.5} lh={1.5} style={{ flex: 1 }} />
    </div>
  </Frame>
);

const TREE: [string, string][] = [
  ['objects/threats/', 'threat vectors: what you defend against'],
  ['objects/objectives/', 'detection objectives: what you must see'],
  ['objects/rules/', 'platform rules: how a platform sees it'],
  ['.opentide/templates/', 'object templates the agent drafts from'],
  ['.opentide/schemas/', 'JSON schemas validate checks against'],
  ['.opentide/configurations/platforms/sentinel.toml', 'platform config and tenants'],
  ['.github/workflows/opentide.yml', 'validate → generate → deploy'],
  ['.pre-commit-config.yaml', 'validate --strict on every commit'],
  ['.mcp.json', 'the opentide MCP server, for Claude Code'],
  ['CLAUDE.md · .claude/skills/', 'house rules and opentide skills'],
];

const WhatYouGet: Page = () => (
  <Frame chapter={['01', 'set up']} source="the tree opentide 0.15.0 writes for the prompt above">
    <H>What the agent just built.</H>
    <Lead>A repository the engine, the CI and the agent all read the same way.</Lead>
    <div style={{ marginTop: 34, display: 'flex', flexDirection: 'column' }}>
      {TREE.map(([p, note], i) => (
        <div key={p} style={{ display: 'flex', alignItems: 'baseline', gap: 40, padding: '13px 0', borderTop: `1px solid ${C.line}`, borderBottom: i === TREE.length - 1 ? `1px solid ${C.line}` : undefined }}>
          <span style={{ width: 760, fontFamily: MONO, fontSize: 23, color: i < 3 ? ACC : INK, fontWeight: i < 3 ? 600 : 450 }}>{p}</span>
          <span style={{ fontSize: 24, color: C.muted }}>{note}</span>
        </div>
      ))}
    </div>
  </Frame>
);

const MCP_JSON = `{
  "mcpServers": {
    "opentide": {
      "command": "opentide",
      "args": ["mcp", "start"],
      "env": {
        "OPENTIDE_REPO_ROOT": "\${CLAUDE_PROJECT_DIR}"
      }
    }
  }
}`;

const TOOLS: [string, string][] = [
  ['search', 'objects by text, technique, actor, platform'],
  ['get_chaining', 'threat → objective → rule links'],
  ['coverage', 'rules per ATT&CK technique'],
  ['validation_report', 'structured issues to act on'],
  ['validate_rule', 'one rule, by UUID'],
  ['validate_query', 'tenant check, with live: true'],
  ['deploy_rule', 'deploy plan, dry_run=true'],
  ['deployment_status', 'where a rule is deployed'],
];

const WireAgent: Page = () => (
  <Frame chapter={['01', 'set up']} source="opentide.org/docs/mcp/tools · opentide.org/docs/usage/workflows/agentic-setup">
    <H>Restart the agent. Check its tools.</H>
    <div style={{ display: 'flex', gap: 56, marginTop: 38 }}>
      <div style={{ width: 680, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Code lang="json" title=".mcp.json" tag="written by setup mcp" code={MCP_JSON} size={18.5} lh={1.45} />
        <Prompt n="02" title="sanity check" size={25}>
          List the opentide MCP tools and skills you can use, and say which ones you would use to add a detection.
        </Prompt>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ColHead icon="plug">the opentide MCP tools</ColHead>
        {TOOLS.map(([t, d]) => (
          <div key={t} style={{ display: 'flex', alignItems: 'baseline', gap: 24, padding: '12px 0', borderTop: `1px solid ${C.line}` }}>
            <span style={{ width: 290, fontFamily: MONO, fontSize: 22, color: ACC, fontWeight: 600 }}>{t}()</span>
            <span style={{ fontSize: 23, color: C.muted }}>{d}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, padding: '14px 0', borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
          <span style={{ width: 290, fontFamily: MONO, fontSize: 22, color: INK, fontWeight: 600 }}>skills</span>
          <span style={{ fontSize: 23, color: C.muted }}>
            two by default, more with <M>--install</M>
          </span>
        </div>
      </div>
    </div>
  </Frame>
);

const HOUSE_RULES = `## Detection workflow
- Order: threat → objective → rule, linked by UUID.
- Vocabulary values come from .opentide/schemas,
  never from memory.
- New UUIDs come from uuid4. Never edit existing ones.
- Done means validation_report is clean and
  \`opentide validate --strict\` exits 0.
- New rules start in STAGING.
- Deploys are dry_run=true. A human promotes.
- Never edit .opentide/configurations/ credentials.`;

const HouseRules: Page = () => (
  <Frame chapter={['01', 'set up']} source="opentide.org/docs/usage/workflows/agentic-setup · recommended guardrails">
    <H>Write the house rules once.</H>
    <Lead>CLAUDE.md (or AGENTS.md) is read at the start of every session. Put the gates there, not in every prompt.</Lead>
    <div style={{ display: 'flex', gap: 48, marginTop: 36 }}>
      <div style={{ width: 760, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Prompt n="03" title="house rules" size={25}>
          Add a "Detection workflow" section to the relevant file: AGENTS.md or CLAUDE.md . Threats, then objectives, then rules. Never invent vocabulary values or UUIDs. Nothing is done until validate --strict passes. Rules start in STAGING<M>{''}</M>{' deploys are dry-run only, and you never touch credentials or promote to PRODUCTION.'}
        </Prompt>
        <Note tag="tip">
          <M>setup skills</M> also writes CLAUDE.md. Pass <M>--name</M> and <M>--org</M>, or the header falls back to the folder name.
        </Note>
      </div>
      <Code lang="text" title="CLAUDE.md" tag="the section it adds" code={HOUSE_RULES} size={20.5} lh={1.55} style={{ flex: 1 }} />
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// 02 · SPEC FIRST
// ─────────────────────────────────────────────────────────────────────────────
const DividerSpec: Page = () => (
  <Divider
    n="02"
    chapter="spec first"
    title="Spec first."
    sub="Threat, then objective, then rule. The agent drafts each one; the ontology and the taxonomy keep them aligned."
    fill={0.3}
    seed={0.66}
    text={Q_SPEC}
  />
);

const ObjCard = ({ icon, kind, schema, question, fields }: { icon: IconName; kind: string; schema: string; question: string; fields: string[] }) => (
  <div style={{ width: 470, borderRadius: 18, border: `1.5px solid ${BLUE}`, background: '#FFFFFF', padding: '28px 30px', display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={28} color="#FFFFFF" />
      </div>
      <span style={{ fontSize: 36, fontWeight: 720, letterSpacing: '-0.03em', color: INK }}>{kind}</span>
      <Chip tone="accent" size={17} style={{ marginLeft: 'auto' }}>
        {schema}
      </Chip>
    </div>
    <span style={{ marginTop: 22, fontSize: 28, lineHeight: 1.3, fontWeight: 600, letterSpacing: '-0.02em', color: ACC }}>{question}</span>
    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column' }}>
      {fields.map((f) => (
        <span key={f} style={{ fontFamily: MONO, fontSize: 19, color: C.muted, padding: '9px 0', borderTop: `1px solid ${C.line}` }}>
          {f}
        </span>
      ))}
    </div>
  </div>
);

const LinkArrow = ({ label }: { label: string }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 30 }}>
    <span style={{ fontFamily: MONO, fontSize: 18, color: C.muted }}>{label}</span>
    <svg width="120" height="20" viewBox="0 0 120 20" aria-hidden>
      <path d="M118 10 H6" stroke={BLUE} strokeWidth={2.25} />
      <path d="M15 3 L6 10 L15 17" fill="none" stroke={BLUE} strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span style={{ fontFamily: MONO, fontSize: 16, color: C.dim }}>by uuid</span>
  </div>
);

const ObjectModel: Page = () => (
  <Frame chapter={['02', 'spec first']} source="opentide.org/docs/usage/concepts/object-model">
    <H>Three objects. Three questions. Ask in this order.</H>
    <Lead>A rule without an objective is a query with no reason to exist. Make the agent earn each step.</Lead>
    <div style={{ display: 'flex', alignItems: 'stretch', marginTop: 44 }}>
      <ObjCard icon="threat" kind="threat" schema="threat::1.0" question="What are we defending against?" fields={['severity · impact · leverage', 'surface · mitre_attack', 'actors (vocabulary ids)']} />
      <LinkArrow label="covers" />
      <ObjCard icon="objective" kind="objective" schema="objective::1.0" question="What must we be able to see?" fields={['priority · threats[uuid]', 'signals · methodology', 'entities · data requirements']} />
      <LinkArrow label="implements" />
      <ObjCard icon="rule" kind="rule" schema="rule::1.1" question="How does a platform see it?" fields={['status · severity · techniques', 'detection_model[uuid]', 'configurations.sentinel.query']} />
    </div>
    <Note tag="next" style={{ marginTop: 'auto' }}>
      Prompt 04 writes the threat, 05 the objective, 06 the rule. Each one starts from the UUID the previous one produced.
    </Note>
  </Frame>
);

const PromptThreat: Page = () => (
  <Frame chapter={['02', 'spec first']} source="skill: opentide-threat-vector · opentide.org/docs/usage/tutorial">
    <H>From intel to a threat object.</H>
    <div style={{ display: 'flex', gap: 56, marginTop: 40, flex: 1 }}>
      <div style={{ width: 800, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Prompt n="04" title="threat">
          Here is the advisory: <M>[paste the text or the URL]</M>. Using the opentide-threat-vector skill, create one threat object under{' '}
          <M>objects/threats/</M>. Map the ATT&CK techniques the text supports, and take impact, leverage, surface and actors from the
          opentide vocabularies only. Validate it and fix anything the engine reports.
        </Prompt>
        <Note tag="watch for">
          Techniques the advisory never mentions. Ask the agent to quote the sentence behind each one.
        </Note>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ColHead icon="eye">what to expect</ColHead>
        <Expect first cmd="search(query=&quot;LSASS&quot;)">It searches first, so it does not duplicate a threat you already have.</Expect>
        <Expect cmd=".opentide/templates/threat.1.0.template.yaml">It drafts from the generated template, not from memory.</Expect>
        <Expect cmd="python -c &quot;import uuid; print(uuid.uuid4())&quot;">A fresh UUID, plus tlp, author and organisation.</Expect>
        <Expect cmd="validation_report(file=…)">It validates and loops until the report is clean.</Expect>
      </div>
    </div>
  </Frame>
);

const SignalRow = ({ name, method, entities, data, keep, head }: { name: string; method: string; entities: string; data: string; keep?: boolean; head?: boolean }) => {
  const s: CSSProperties = head ? { fontFamily: MONO, fontSize: 17, color: C.dim } : { fontSize: 22, color: keep === false ? C.subtle : INK };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 228px 112px', gap: 20, alignItems: 'baseline', padding: head ? '0 0 10px' : '14px 0', borderTop: head ? undefined : `1px solid ${C.line}` }}>
      <span style={{ ...s, fontWeight: head ? 400 : 600, textDecoration: keep === false ? 'line-through' : undefined }}>{name}</span>
      <span style={{ ...s, fontFamily: MONO, fontSize: head ? 17 : 19 }}>{method}</span>
      <span style={{ ...s, fontFamily: MONO, fontSize: head ? 17 : 19 }}>{entities}</span>
      {head ? <span style={s}>{data}</span> : <Chip tone={keep ? 'ok' : 'plain'} size={16}>{data}</Chip>}
    </div>
  );
};

const PromptObjective: Page = () => (
  <Frame chapter={['02', 'spec first']} source="skill: opentide-detection-objective · opentide.org/docs/usage/concepts/object-model">
    <H>Ask for the plan before the YAML.</H>
    <div style={{ display: 'flex', gap: 56, marginTop: 40 }}>
      <Prompt n="05" title="objective" style={{ width: 760, alignSelf: 'flex-start' }}>
        Design a detection objective for that threat. Before writing any file, propose the signals: for each one the methodology, the
        entities, the data it needs, and whether Sentinel has that data. Wait for my OK, then write it under <M>objects/objectives/</M>{' '}
        and link the threat by UUID.
      </Prompt>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ColHead icon="signal">what comes back first</ColHead>
        <div style={{ marginTop: 14 }}>
          <SignalRow head name="signal" method="method" entities="entities" data="data" />
          <SignalRow name="LSASS process access" method="Behavioural" entities="Process, Hostname" data="have it" keep />
          <SignalRow name="Dump file written" method="Behavioural" entities="File, Hostname" data="have it" keep />
          <SignalRow name="Web shell spawn" method="Behavioural" entities="Process, URL" data="no data" keep={false} />
        </div>
        <span style={{ marginTop: 22, fontFamily: MONO, fontSize: 19, color: C.muted }}>
          <span style={{ color: ACC }}>you</span> · keep the first two, log the third as a data gap
        </span>
      </div>
    </div>
    <Note tag="why" style={{ marginTop: 'auto' }}>
      The signals decide what gets built. This is where your judgment matters most, so make the agent stop and ask.
    </Note>
  </Frame>
);

const U_OBJ = 'f8817f95-c43e-…';
const MARK_OBJ: CodeMark = { t: U_OBJ, bg: 'rgba(0,20,137,0.08)', fg: BLUE, border: `1.5px solid ${BLUE}` };
const MARK_STATUS: CodeMark = { t: 'STAGING', bg: BLUE, fg: '#FFFFFF' };

const YAML_RULE = `name: LSASS process access
metadata:
  uuid: c8f282eb-0286-…
  schema: rule::1.1
status: STAGING
severity: High
techniques: [T1003.001]
detection_model: ${U_OBJ}
configurations:
  sentinel:
    query: |
      DeviceEvents
      | where ActionType == "OpenProcessApiCall"
      | where FileName =~ "lsass.exe"
    scheduling:
      frequency: PT1H
      lookback: PT2H`;

const PromptRule: Page = () => (
  <Frame chapter={['02', 'spec first']} source="skill: opentide-detection-rule · opentide.org/docs/usage/tutorial">
    <H>Then the rule, in STAGING</H>
    <div style={{ display: 'flex', gap: 56, marginTop: 40 }}>
      <div style={{ width: 800, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Prompt n="06" title="rule">
          Implement the "LSASS process access" signal as a Sentinel rule under <M>objects/rules/</M>, schema <M>rule::1.1</M>{', status STAGING Set '}<M>detection_model</M> to the objective's UUID and take techniques from the threat. Schedule it hourly with a
          two-hour lookback. Validate, then show me the dry-run deploy plan.
        </Prompt>
        <Note tag="expect">
          The agent writes the KQL well. What it cannot tell you is whether the query returns data in your tenant: that check is yours, or
          CI's with <M>validate query --live</M>.
        </Note>
      </div>
      <Code lang="yaml" title="objects/rules/lsass-process-access.yaml" tag="trimmed" code={YAML_RULE} marks={[MARK_OBJ, MARK_STATUS]} size={20} lh={1.5} style={{ flex: 1 }} />
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// 03 · CLOSE THE LOOP
// ─────────────────────────────────────────────────────────────────────────────
const DividerLoop: Page = () => (
  <Divider
    n="03"
    chapter="close the loop"
    title="Close the loop."
    sub="The agent is done when the engine says so, not when the YAML exists."
    fill={0.34}
    seed={0.83}
    text={Q_LOOP}
  />
);

const AgentLoop: Page = () => (
  <Frame chapter={['03', 'close the loop']} source="opentide.org/docs/usage/workflows/agentic-setup">
    <H size={60} maxWidth={1680}>
      The loop: the agent drafts, the engine checks, you promote.
    </H>
    <div style={{ position: 'relative', flex: '0 0 auto', width: 1680, height: D_DH, marginTop: 46 }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1680, height: D_AH, boxSizing: 'border-box', borderRadius: 22, background: C.blueSoft, border: `1.5px solid ${C.blueLine}` }} />
      <div style={{ position: 'absolute', left: 0, top: D_HT, width: 1680, height: D_DH - D_HT, boxSizing: 'border-box', borderRadius: 22, background: '#FFFFFF', border: `1.5px solid ${C.inkHex}` }} />
      <DZoneHead top={26} icon="agent" color={BLUE} name="agent zone" scope="mcp tools, skills, cli" note="nothing here deploys" />
      <DZoneHead top={D_HT + 26} icon="lock" color={C.inkHex} name="your gates" scope="review, merge, approve" note="every real deploy follows a human decision" />

      <svg width={1680} height={D_DH} viewBox={`0 0 1680 ${D_DH}`} aria-hidden style={{ position: 'absolute', left: 0, top: 0 }}>
        <DArrowH x1={410} x2={462} y={D_Y1} color={BLUE} />
        <DArrowH x1={814} x2={866} y={D_Y1} color={BLUE} />
        <DArrowH x1={1218} x2={1270} y={D_Y1} color={BLUE} />
        <path d={`M1616 ${D_Y1} H1630 Q1648 ${D_Y1} 1648 ${D_Y1 + 18} V${D_Y2 - 18} Q1648 ${D_Y2} 1630 ${D_Y2} H1625`} fill="none" stroke={BLUE} strokeWidth={2.25} />
        <DHead x={1622} y={D_Y2} dir="l" color={BLUE} />
        <path d={`M1446 ${D_R2 - 4} V${D_R1 + D_NH + 10}`} stroke={BLUE} strokeWidth={2.25} strokeDasharray="6 6" />
        <DHead x={1446} y={D_R1 + D_NH + 6} dir="u" color={BLUE} />
        <DArrowH x1={1270} x2={1218} y={D_Y2} color={BLUE} />
        <DArrowH x1={866} x2={814} y={D_Y2} color={BLUE} />
        <DArrowH x1={462} x2={410} y={D_Y2} color={BLUE} />
        <path d={`M64 ${D_Y2} H50 Q32 ${D_Y2} 32 ${D_Y2 + 18} V${D_Y3 - 18} Q32 ${D_Y3} 50 ${D_Y3} H58`} fill="none" stroke={BLUE} strokeWidth={2.25} />
        <DHead x={61} y={D_Y3} dir="r" color={BLUE} />
        <DArrowH x1={338} x2={379} y={D_Y3} color={C.inkHex} />
        <DArrowH x1={659} x2={700} y={D_Y3} color={C.inkHex} />
        <DArrowH x1={980} x2={1021} y={D_Y3} color={C.inkHex} />
        <DArrowH x1={1301} x2={1342} y={D_Y3} color={C.inkHex} />
      </svg>

      <DNode x={64} y={D_R1} w={340} kind="input" icon="doc" label="your prompt" sub="intel or ask" />
      <DNode x={468} y={D_R1} w={340} kind="agent" icon="search" label="search()" sub="mcp · what exists" />
      <DNode x={872} y={D_R1} w={340} kind="agent" icon="graph" label="get_chaining()" sub="mcp · threat → rule" />
      <DNode x={1276} y={D_R1} w={340} kind="agent" icon="editor" label="draft YAML" sub="skills · templates" />
      <DNode x={1276} y={D_R2} w={340} kind="agent" icon="check" label="validation_report()" sub="mcp · concrete errors" />
      <DNode x={872} y={D_R2} w={340} kind="agent" icon="terminal" label="validate --strict" sub="cli · the CI gate" />
      <DNode x={468} y={D_R2} w={340} kind="agent" icon="eye" label="deploy_rule()" sub="mcp · dry_run=true" />
      <DNode x={64} y={D_R2} w={340} kind="agent" icon="branch" label="pull request" sub="the diff, for review" />
      <DNode x={64} y={D_R3} w={268} kind="gate" icon="lock" label="your review" sub="reads the diff" />
      <DNode x={385} y={D_R3} w={268} kind="env" icon="layers" label="STAGING" sub="ci · on the PR" />
      <DNode x={706} y={D_R3} w={268} kind="gate" icon="lock" label="merge" sub="a maintainer" />
      <DNode x={1027} y={D_R3} w={268} kind="gate" icon="lock" label="approval" sub="protected env" />
      <DNode x={1348} y={D_R3} w={268} kind="prod" icon="signal" label="PRODUCTION" sub="live detections" />

      <span style={{ position: 'absolute', right: 252, top: (D_R1 + D_NH + D_R2) / 2 - 13, fontFamily: MONO, fontSize: 18, color: C.muted, whiteSpace: 'nowrap' }}>
        <span style={{ color: C.red }}>fail</span> → edit again
      </span>
      <span style={{ position: 'absolute', left: 54, top: (D_AH + D_HT) / 2 - 13, fontFamily: MONO, fontSize: 18, color: C.muted, whiteSpace: 'nowrap' }}>
        handoff · the agent's output is a pull request
      </span>
    </div>
  </Frame>
);

const T_FAIL = `$ opentide validate
## objects/threats/simulated-actor.yaml
  [error] simulated-actor.yaml:18: threat.impact:
    Value 'Data Leak' is not a valid 'impact::1.0'
    vocabulary entry (suggestion: Data Breach)
## objects/rules/sentinel-kql-rule.yaml
  [error] sentinel-kql-rule.yaml:17: detection_model:
    Unknown objective or signal reference
    '00000000-0000-4000-8002-deadbeef0000'
FATAL: Validation failed          # exit 1`;

const J_ISSUE = `{
  "code": "vocab_unknown",
  "severity": "error",
  "object_type": "threat",
  "yaml_line": 17,
  "field_path": ["threat", "impact"],
  "message": "Value 'Data Leak' is not a valid
              'impact::1.0' vocabulary entry",
  "suggestion": "Data Breach"
}`;

const Failure: Page = () => (
  <Frame chapter={['03', 'close the loop']} source="opentide --json validate · run against the tutorial repo, opentide 0.15.0">
    <H>When validation fails, the agent gets a fix list.</H>
    <div style={{ display: 'flex', gap: 40, marginTop: 40 }}>
      <CTerm title="two mistakes an agent makes · real output" parts={[{ lang: 'bash', code: T_FAIL }]} size={19} lh={1.5} style={{ width: 820, alignSelf: 'flex-start' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Code lang="json" title="validation_report · one issue" code={J_ISSUE} size={18.5} lh={1.45} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Expect first icon="check">Applies the vocabulary suggestion.</Expect>
          <Expect icon="check">
            Restores the real objective UUID with <M>search()</M>. It never invents an objective to satisfy the reference.
          </Expect>
        </div>
      </div>
    </div>
  </Frame>
);

const J_COVERAGE = `{
  "coverage": {
    "technique": "T1059",
    "rules": ["00000000-0000-4000-8003-000000000001"],
    "count": 1
  }
}`;

const Trace = ({ call, result }: { call: ReactNode; result: string }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, padding: '13px 0', borderTop: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 20, whiteSpace: 'nowrap' }}>
    <span style={{ color: ACC, fontWeight: 600 }}>{call}</span>
    <span style={{ color: C.dim }}>→</span>
    <span style={{ color: C.muted }}>{result}</span>
  </div>
);

const Coverage: Page = () => (
  <Frame chapter={['03', 'close the loop']} source="opentide --json info --technique T1059 coverage · opentide.org/docs/mcp/tools">
    <H>Ask the catalogue, not the model.</H>
    <div style={{ display: 'flex', gap: 56, marginTop: 40 }}>
      <div style={{ width: 760, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Prompt n="07" title="coverage">
          What do we cover for T1059 and T1003? For each technique, list the rules with their objectives and threats, then tell me which
          objectives still have no rule.
        </Prompt>
        <Note tag="expect">
          Coverage counts rules. Chaining tells you why each one exists. Ask for both, and answers come from the repository, not from
          the model's memory.
        </Note>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ColHead icon="agent">the calls behind the answer</ColHead>
        <Trace call='coverage(technique="T1059")' result="1 rule" />
        <Trace call="get_chaining(uuid=…8003…0001)" result="rule → objective → threat" />
        <Trace call='search(type="objective")' result="objectives with no rule" />
        <Code lang="json" title="the same answer from the CLI" tag="real output" code={J_COVERAGE} size={19} lh={1.45} style={{ marginTop: 22 }} />
      </div>
    </div>
  </Frame>
);

const T_DRY = `$ opentide deploy --platform sentinel --dry-run
== MDR Deployment ==
OK Deployment completed
  advice: add (or uncomment) a [[tenants]] entry in
  .opentide/configurations/platforms/sentinel.toml
WARNING sentinel has no tenants configured, so a
real deploy would stop`;

const DryRun: Page = () => (
  <Frame chapter={['03', 'close the loop']} source="opentide.org/docs/cli/deploy · run against opentide 0.15.0">
    <H>Preview every deploy.</H>
    <div style={{ display: 'flex', gap: 56, marginTop: 40 }}>
      <div style={{ width: 860, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Prompt n="08" title="preview">
          Preview the Sentinel deployment for everything in STAGING. Do not deploy for real. Summarise what would change.
        </Prompt>
        <CTerm title="fresh repo, no tenant yet · real output" parts={[{ lang: 'bash', code: T_DRY }]} size={19.5} lh={1.5} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ColHead icon="eye">what to expect</ColHead>
        <Expect first cmd='deploy_rule(uuid, platform="sentinel", dry_run=true)'>Through MCP it previews one rule at a time.</Expect>
        <Expect cmd="[[tenants]] · GitHub secrets">The plan names what is missing. Tenants and credentials are yours to add, never the agent's.</Expect>
        <Expect cmd="pip install 'opentide[sentinel]==0.15.0'">
          With credentials, <M>validate query --live</M> checks the catalogue queries against your workspace.
        </Expect>
      </div>
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// 04 · SHIP IT
// ─────────────────────────────────────────────────────────────────────────────
const DividerShip: Page = () => (
  <Divider
    n="04"
    chapter="ship it"
    title="Ship it."
    sub="The agent's output is a pull request. CI runs every gate again; humans promote."
    fill={0.38}
    seed={0.12}
    text={Q_SHIP}
  />
);

const PR_BODY = `detections: LSASS process access (T1003.001)

intel     advisory, ransomware crew dumping LSASS
chain     threat    aa36f6de-4cc8-…
          objective f8817f95-c43e-…
          rule      c8f282eb-0286-…  (STAGING)
skipped   web shell spawn: no web telemetry yet
gates     opentide validate --strict     exit 0
          deploy --platform sentinel --dry-run   ok`;

// Moved here from the hack.lu lightning deck: the status progression a rule
// walks, and where the hand-over gate sits.
const MdrLifecycle: Page = () => (
  <Frame chapter={['04', 'ship it']} source="EC CSOC · managed detection rule lifecycle">
    <img
      src={mdrLifecycle}
      alt="Managed detection rule lifecycle: a signal leaves the backlog into DESIGN, DEVELOPMENT and STAGING on the detection-as-code pipeline, passes the ACCEPTANCE hand-over gate into PRODUCTION, loops back through IMPROVING when it needs rework, and is explicitly DISABLED then REMOVED on retirement."
      style={{ width: '100%', flex: 1, minHeight: 0, objectFit: 'contain', display: 'block' }}
    />
    <Note tag="gate" style={{ marginTop: 18 }}>
      Backlog to <M>PRODUCTION</M>. ACCEPTANCE is the hand-over gate: the alert handling manager
      reviews the rule before it goes live, and <M>IMPROVING</M> is the loop back when it needs
      rework. No rule leaves the lifecycle silently.
    </Note>
  </Frame>
);

const PromptPR: Page = () => (
  <Frame chapter={['04', 'ship it']} source="opentide.org/docs/usage/workflows/detection-as-code">
    <H>One chain, one pull request.</H>
    <div style={{ display: 'flex', gap: 56, marginTop: 40 }}>
      <div style={{ width: 760, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Prompt n="09" title="pull request">
          Create a branch, commit the threat, the objective and the rule, and open a pull request. In the description: the intel source,
          the chain with UUIDs, the signals we chose not to build and why, and the result of <M>opentide validate --strict</M>.
        </Prompt>
        <Note tag="expect">The pre-commit hook runs validate on the commit itself, so a broken object never reaches the branch.</Note>
      </div>
      <Code lang="text" title="what lands in the PR description" code={PR_BODY} size={19.5} lh={1.55} style={{ flex: 1 }} />
    </div>
  </Frame>
);

const Job = ({ name, cmds, tone = 'agent' }: { name: string; cmds: string[]; tone?: 'agent' | 'gate' | 'prod' }) => (
  <div
    style={{
      width: 336,
      boxSizing: 'border-box',
      borderRadius: 14,
      padding: '18px 20px',
      border: `1.5px solid ${tone === 'agent' ? BLUE : C.inkHex}`,
      background: tone === 'prod' ? C.inkHex : '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}
  >
    <span style={{ fontSize: 25, fontWeight: 700, letterSpacing: '-0.02em', color: tone === 'prod' ? '#FFFFFF' : INK }}>{name}</span>
    {cmds.map((c) => (
      <span key={c} style={{ fontFamily: MONO, fontSize: 15.5, lineHeight: 1.3, color: tone === 'prod' ? 'rgba(255,255,255,0.78)' : C.muted, fontVariantLigatures: 'none' }}>
        {c}
      </span>
    ))}
  </div>
);

const JobArrow = () => (
  <svg width="36" height="20" viewBox="0 0 36 20" aria-hidden style={{ flex: '0 0 auto', alignSelf: 'center' }}>
    <path d="M2 10 H30" stroke={BLUE} strokeWidth={2.25} />
    <path d="M23 3 L32 10 L23 17" fill="none" stroke={BLUE} strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Lane = ({ label, sub, children }: { label: string; sub: string; children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, padding: '22px 0', borderTop: `1px solid ${C.line}` }}>
    <div style={{ width: 170, flex: '0 0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
      <span style={{ fontFamily: MONO, fontSize: 20, color: ACC, fontWeight: 600 }}>{label}</span>
      <span style={{ fontFamily: MONO, fontSize: 16, color: C.dim }}>{sub}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 8 }}>{children}</div>
  </div>
);

const CI: Page = () => (
  <Frame chapter={['04', 'ship it']} source=".github/workflows/opentide.yml · written by opentide setup --ci github (0.15.0)">
    <H>CI runs the gates the agent already ran.</H>
    <Lead>Same engine, same version pin, no agent in the loop. A pass on the laptop is a pass in CI.</Lead>
    <div style={{ marginTop: 34 }}>
      <Lane label="pull request" sub="into main">
        <Job name="Validate" cmds={['validate --strict', 'lint --strict', 'validate query --live']} />
        <JobArrow />
        <Job name="Generate" cmds={['opentide generate']} />
        <JobArrow />
        <Job name="Deploy Staging" cmds={['deploy --dry-run --plan STAGING', 'deploy --plan STAGING']} tone="gate" />
        <JobArrow />
        <Job name="Inflight shards" cmds={['preview of the changed objects', 'for reviewers']} />
      </Lane>
      <div style={{ borderBottom: `1px solid ${C.line}` }}>
        <Lane label="merge" sub="push to main">
          <Job name="Validate" cmds={['validate --strict', 'lint --strict']} />
          <JobArrow />
          <Job name="Generate" cmds={['opentide generate']} />
          <JobArrow />
          <Job name="Deploy Production" cmds={['deploy --plan PRODUCTION', 'promotion per deployment.toml']} tone="prod" />
          <JobArrow />
          <Job name="Document" cmds={['generated object docs']} />
        </Lane>
      </div>
    </div>
    <span style={{ marginTop: 'auto', fontFamily: MONO, fontSize: 19, color: C.muted }}>
      credentials come from GitHub secrets · --skip-unconfigured keeps a repo with no tenant green · put production behind a protected
      environment
    </span>
  </Frame>
);

// Activity 10: the artefacts that fall out of the validated objects — markdown
// docs, the explorer graph, the ATT&CK layer, and a MISP preview.
const PromptArtefacts: Page = () => (
  <Frame chapter={['04', 'ship it']} source="opentide.org/docs/cli/generate · opentide.org/docs/cli/share">
    <H>Documentation nobody has to write.</H>
    <Lead>
      The markdown wiki, the explorer graph, the ATT&CK layer and the MISP event all fall out of the objects you just validated, so
      none of them can drift from what you run.
    </Lead>
    <div style={{ display: 'flex', gap: 56, marginTop: 36 }}>
      <div style={{ width: 800, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Prompt n="10" title="artefacts" size={25}>
          Generate the documentation and the exports for this repository, then preview what sharing to MISP would publish. Show me the
          markdown page for our rule, the ATT&CK layer, and the share preview. Push nothing.
        </Prompt>
        <Note tag="watch for">
          Sharing is not deployment: a destination is a MISP instance, not a platform. <M>max_tlp</M> is a hard ceiling per destination,
          so a TLP:AMBER object cannot leave.
        </Note>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ColHead icon="package">what gets generated</ColHead>
        <Expect first icon="doc" cmd="opentide generate docs --changed">
          A markdown page per threat, objective and rule, with Mermaid coverage and chaining diagrams, backlinked both ways.
        </Expect>
        <Expect icon="graph" cmd=".opentide/exports/explorer.bundle.json">
          The whole catalogue as a graph you can browse, with a prebuilt search index and no backend to patch.
        </Expect>
        <Expect icon="layers" cmd="opentide generate exports navigator · layer 4.5">
          An ATT&CK layer: green is full coverage, red a threat with no rule, blue a rule with no threat behind it.
        </Expect>
        <Expect icon="share" cmd="opentide share preview · sharing.toml">
          One MISP Event per object. Preview makes the same decision as push, with no request and no ledger write.
        </Expect>
      </div>
    </div>
  </Frame>
);

const Keep = ({ who, icon, tone, items }: { who: string; icon: IconName; tone: 'agent' | 'you'; items: ReactNode[] }) => (
  <div style={{ flex: 1, borderRadius: 18, border: `1.5px solid ${tone === 'agent' ? BLUE : C.inkHex}`, background: tone === 'agent' ? C.blueSoft : '#FFFFFF', padding: '28px 32px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 14 }}>
      <Icon name={icon} size={30} color={tone === 'agent' ? BLUE : C.inkHex} />
      <span style={{ fontSize: 34, fontWeight: 720, letterSpacing: '-0.03em', color: INK }}>{who}</span>
    </div>
    {items.map((t, i) => (
      <div key={i} style={{ fontSize: 25, lineHeight: 1.38, color: INK, padding: '14px 0', borderTop: `1px solid ${C.line}` }}>
        {t}
      </div>
    ))}
  </div>
);

const Guardrails: Page = () => (
  <Frame chapter={['04', 'ship it']} source="opentide.org/docs/usage/workflows/agentic-setup · safe vs unsafe edit patterns">
    <H>What the agent does. What you keep.</H>
    <div style={{ display: 'flex', gap: 32, marginTop: 40 }}>
      <Keep
        who="Let the agent"
        icon="agent"
        tone="agent"
        items={[
          'search, read and summarise objects and coverage',
          'draft new objects from the templates',
          'fix dangling references and vocabulary errors the validator flags',
          <>
            preview deploys with <M>dry_run=true</M>
          </>,
          'open the pull request and describe it',
        ]}
      />
      <Keep
        who="Keep for yourself"
        icon="lock"
        tone="you"
        items={[
          'real deploys, and any promotion to PRODUCTION',
          <>
            credentials and plans in <M>.opentide/configurations/</M>
          </>,
          'deciding that a query works: look at results in the tenant',
          'resolving UUID conflicts; never regenerate UUIDs',
          'which signals are worth building',
        ]}
      />
    </div>
    <Note tag="enforce" style={{ marginTop: 'auto' }}>
      Write the right-hand column into CLAUDE.md (prompt 03), and protect main and the production environment in GitHub.
    </Note>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// 05 · YOUR PLAYBOOK
// ─────────────────────────────────────────────────────────────────────────────
const DividerPlay: Page = () => (
  <Divider
    n="05"
    chapter="your playbook"
    title="Your playbook."
    sub="Prompts that work, what to expect from them, and four labs to run today."
    fill={0.42}
    seed={0.52}
    text={Q_PLAY}
  />
);

const Recipe = ({ icon, title, prompt, expect }: { icon: IconName; title: string; prompt: string; expect: string }) => (
  <div style={{ borderRadius: 16, border: `1.5px solid ${C.line2}`, background: '#FFFFFF', padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 14 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Icon name={icon} size={26} color={BLUE} />
      <span style={{ fontSize: 27, fontWeight: 700, letterSpacing: '-0.02em', color: INK }}>{title}</span>
    </div>
    <span style={{ fontSize: 24, lineHeight: 1.42, color: INK }}>"{prompt}"</span>
    <span style={{ marginTop: 'auto', fontFamily: MONO, fontSize: 17, color: C.muted, paddingTop: 12, borderTop: `1px solid ${C.line}` }}>{expect}</span>
  </div>
);

const Cookbook: Page = () => (
  <Frame chapter={['05', 'your playbook']} source="opentide.org/docs/mcp/tools · agent workflows">
    <H>Six prompts to keep.</H>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: '1fr', gap: 24, marginTop: 36, flex: 1 }}>
      <Recipe icon="intel" title="Intel to detection" prompt="Here is an advisory. Build the threat, propose objectives and signals, wait for my OK, then write the rules. One pull request." expect="threat · objective · rules · one PR" />
      <Recipe icon="graph" title="Coverage gaps" prompt="Which ATT&CK techniques in our threats have no rule yet? Rank them by threat criticality." expect="coverage() · get_chaining() · search()" />
      <Recipe icon="share" title="Port a rule" prompt="Enable Splunk, then add a splunk configuration to rule <uuid> with the same logic in SPL." expect="setup platforms --splunk · one new config block" />
      <Recipe icon="warn" title="Fix the build" prompt="CI failed. Read opentide --json validate and fix every issue. Do not touch any UUID." expect="validation_report() until clean" />
      <Recipe icon="clock" title="Review sweep" prompt="List rules whose review date is missing or past. For each: summarise it and propose keep, tune or retire." expect="rule::1.1 review dates · a triage list" />
      <Recipe icon="archive" title="Leave CoreTide" prompt="Migrate this CoreTide repository to opentide, following the migration prompt in the opentide docs." expect="opentide.org/docs/usage/migration/prompt" />
    </div>
  </Frame>
);

const Patterns: Page = () => (
  <Frame chapter={['05', 'your playbook']} source="opentide.org/docs/usage/workflows/agentic-setup">
    <H>Prompt like a spec, not a wish.</H>
    <div style={{ display: 'flex', gap: 32, marginTop: 40 }}>
      <Keep
        who="Do"
        icon="check"
        tone="agent"
        items={[
          'name the object and the order: threat, objective, rule',
          'give the intel, ask for the mapping, check the mapping',
          'ask for the signals before the objective is written',
          <>
            end every prompt with the gate: <M>validate --strict</M> passes
          </>,
          'keep one chain per pull request',
        ]}
      />
      <Keep
        who="Don't"
        icon="x"
        tone="you"
        items={[
          'ask for "a rule for T1059" with no threat behind it',
          'let it pick vocabulary values or UUIDs from memory',
          'accept "done" without the validation output',
          'let it deploy for real or flip a status to PRODUCTION',
          'paste credentials into the chat',
        ]}
      />
    </div>
    <Note tag="test" style={{ marginTop: 'auto' }}>
      If a prompt would not survive as a line in a pull request description, it is too vague for the agent too.
    </Note>
  </Frame>
);

const Lab = ({ n, title, mins, steps, done }: { n: string; title: string; mins: string; steps: string[]; done: ReactNode }) => (
  <div style={{ flex: 1, borderRadius: 18, border: `1.5px solid ${BLUE}`, background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', background: BLUE, borderRadius: '16px 16px 0 0', fontFamily: MONO, fontSize: 18, color: '#FFFFFF' }}>
      <span style={{ fontWeight: 600 }}>lab {n}</span>
      <span style={{ opacity: 0.75 }}>{mins}</span>
    </div>
    <div style={{ padding: '24px 24px 26px', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
      <span style={{ fontSize: 34, fontWeight: 720, letterSpacing: '-0.03em', color: INK }}>{title}</span>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {steps.map((t, i) => (
          <div key={t} style={{ display: 'flex', gap: 12, alignItems: 'baseline', padding: '10px 0', borderTop: `1px solid ${C.line}` }}>
            <span style={{ fontFamily: MONO, fontSize: 17, color: ACC, width: 20 }}>{i + 1}</span>
            <span style={{ fontSize: 22, lineHeight: 1.35, color: C.muted }}>{t}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: `1px solid ${C.line}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontFamily: MONO, fontSize: 17, color: C.dim }}>done when</span>
        <span style={{ fontSize: 22, lineHeight: 1.4, color: INK }}>{done}</span>
      </div>
    </div>
  </div>
);

// One stop on the running clock under the lab cards.
const Clock = ({ at, what, last }: { at: string; what: string; last?: boolean }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 20 }}>
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 9 }}>
      <span style={{ color: INK, fontWeight: 600 }}>{at}</span>
      <span>{what}</span>
    </span>
    {!last && <span style={{ width: 18, height: 1.5, background: C.line2 }} />}
  </span>
);

// The lab plan, shown twice: once in the overview so the room knows what the
// session actually is, and again in chapter 05 when the labs start. One body,
// so the two can never drift — only the chapter badge differs.
const LabsBody = ({ chapter }: { chapter: [string, string] }) => (
  <Frame chapter={chapter} source="opentide.org/docs/usage/tutorial">
    <H>Four labs. Seventy-five minutes.</H>
    <Lead>Pair up: one person prompts, one person reviews. Swap at every lab.</Lead>
    <div style={{ display: 'flex', gap: 24, marginTop: 36, flex: 1 }}>
      <Lab n="01" title="Set up" mins="15 min" steps={['prompt 01: scaffold the repo', 'restart the agent, prompt 02', 'prompt 03: house rules']} done={<>validate --strict exits 0 and the agent lists the opentide tools</>} />
      <Lab n="02" title="First chain" mins="30 min" steps={['pick an advisory', 'prompt 04: the threat', 'prompt 05: choose the signals', 'prompt 06: the rule']} done={<>a threat, an objective and a rule, linked by UUID, all green</>} />
      <Lab n="03" title="Break it" mins="10 min" steps={["set an impact to 'Data Leak'", 'point detection_model at a UUID that does not exist', "prompt: 'fix the build'"]} done={<>green again, with no new UUIDs and no invented objects</>} />
      <Lab n="04" title="Ship it" mins="20 min" steps={['prompt 07: coverage', 'prompt 08: preview the deploy', 'prompt 09: the pull request', 'prompt 10: the artefacts']} done={<>a pull request with the chain in its description, Validate job green</>} />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 24, fontFamily: MONO, fontSize: 19, color: C.muted }}>
      <span style={{ color: ACC, fontWeight: 600 }}>the clock</span>
      <Clock at="00:00" what="set up" />
      <Clock at="00:15" what="first chain" />
      <Clock at="00:45" what="break it" />
      <Clock at="00:55" what="ship it" />
      <Clock at="01:15" what="debrief" last />
    </div>
  </Frame>
);

const LabsPreview: Page = () => <LabsBody chapter={['00', 'overview']} />;
const Labs: Page = () => <LabsBody chapter={['05', 'your playbook']} />;

const T_START = `$ pip install 'opentide==0.15.0'
$ opentide setup --yes --name "SOC Detections" \\
    --platform sentinel --ci github
$ opentide setup mcp --claude-code --yes
$ opentide setup skills --yes --claude-code
$ opentide generate && opentide validate --strict`;

const Resources: Page = () => (
  <Frame chapter={['05', 'your playbook']} source="opentide.org/docs/usage/quickstart">
    <H>Take it home.</H>
    <Lead>The same five commands, then hand the keyboard to your agent.</Lead>
    <div style={{ display: 'flex', gap: 64, marginTop: 40 }}>
      <Code
        lang="bash"
        variant="navy"
        size={22}
        lh={1.6}
        title={
          <>
            <Icon name="terminal" size={18} color={NV.muted} /> a new detection repo
          </>
        }
        tag="python 3.10+"
        code={T_START}
        style={{ width: 920, alignSelf: 'flex-start' }}
        bodyStyle={{ padding: '20px 26px' }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ELink icon="book" label="tutorial" value="opentide.org/docs/usage/tutorial" />
        <ELink icon="agent" label="agents" value="…/usage/workflows/agentic-setup" />
        <ELink icon="plug" label="mcp tools" value="opentide.org/docs/mcp/tools" />
        <ELink icon="spark" label="skills" value="github.com/opentidehq/skills" />
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 28, marginTop: 26, paddingTop: 26, borderTop: `1px solid ${C.line}` }}>
          <div style={{ padding: 16, background: '#FFFFFF', border: `1px solid ${C.line2}`, borderRadius: 16 }}>
            <img src={qrOpentide} alt="QR code: opentide.org" style={{ width: 200, height: 200, display: 'block' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 6 }}>
            <Label>scan</Label>
            <span style={{ fontSize: 34, fontWeight: 720, letterSpacing: '-0.025em', color: ACC }}>opentide.org</span>
          </div>
        </div>
      </div>
    </div>
  </Frame>
);

const ECloseLink = ({ icon, children }: { icon: IconName; children: ReactNode }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
    <Icon name={icon} size={24} color={BLUE} />
    {children}
  </span>
);

const Close: Page = () => (
  <Stage>
    <TideCanvas text={Q_CLOSE} fill={0.3} seed={0.12} maskTop={0.365} ink={BLUE} bg="#FFFFFF" />
    <img src={logoNormal} alt="opentide" style={{ position: 'absolute', left: 120, top: 92, height: 62, display: 'block' }} />
    <div style={{ position: 'absolute', left: 120, top: 226, width: 1680, zIndex: 2 }}>
      <h2 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 114, lineHeight: 1.0, letterSpacing: '-0.048em', color: INK }}>
        Agents write the queries.
        <br />
        <span style={{ color: ACC }}>The spec keeps them aligned.</span>
      </h2>
      <p style={{ margin: '36px 0 0', fontSize: 32, lineHeight: 1.4, color: C.muted, letterSpacing: '-0.01em' }}>
        Threat first, plan before YAML, the gate before done, a human before production.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginTop: 30, fontFamily: MONO, fontSize: 23, color: INK }}>
        <ECloseLink icon="globe">opentide.org</ECloseLink>
        <ECloseLink icon="branch">github.com/opentidehq</ECloseLink>
        <ECloseLink icon="terminal">pip install opentide</ECloseLink>
      </div>
    </div>
    <Footer onTide />
  </Stage>
);

Cover.transition = tideReveal;
DividerSetup.transition = tideReveal;
DividerSpec.transition = tideReveal;
DividerLoop.transition = tideReveal;
DividerShip.transition = tideReveal;
DividerPlay.transition = tideReveal;
Close.transition = tideReveal;

// ─────────────────────────────────────────────────────────────────────────────
// Deck
// ─────────────────────────────────────────────────────────────────────────────
export const meta: SlideMeta = {
  title: 'opentide workshop — detection engineering with a coding agent',
  createdAt: '2026-10-16T08:30:00.000Z',
  theme: 'opentide-coastal',
};

export const notes: (string | undefined)[] = [
  // Cover
  `Welcome. This is a hands-on workshop: by the end, every pair has built one detection end to end with a coding agent.
The split we will practise all session: you bring the intent, the agent does the typing, opentide checks, and you approve.
Everything on the slides was run against opentide 0.15.0, the current release.`,
  // Bring
  `Do this slide before anything else, and tell the room to start fixing their laptop now rather than listening to me.
Required, left column, and the first one is the real blocker: Python 3.10 or later on a machine where pip install actually works. Corporate laptops are where this workshop dies. Then git, an IDE that reads JSON Schema — VS Code, Kiro, anything schema-aware — and network egress to pypi.org, github.com and opentide.org. Ask out loud who is behind a proxy, and deal with it now.
Right column is optional and it is where the "full loop" lives. An agent: any harness, any model, there is no house preference — Claude Code, Cursor, Codex, Kiro, VS Code with Copilot, Continue against a local model. MCP support is the thing that matters, because that is what wires the opentide tools in. A git account if they want to push a branch and watch CI. Credentials only if they want a real deploy or a real share, and make the point that a dry run needs nothing at all. And their own threat report, because lab two is much better with intel they care about — we have one ready for anyone without.
Land the bottom note properly, because somebody always asks: you do not need an agent. Every prompt in this deck maps to a CLI command and the slides show both. Working by hand is slower to type and identical in result. Invite anyone without one to pair with a neighbour.`,
  // Agenda
  `Five things you leave with. A repo your agent scaffolded, the MCP server and skills wired in, one threat to objective to rule chain that passes the strict gate, a dry-run deploy and a pull request, and a set of prompts you can reuse.
Five chapters: set up, spec first, close the loop, ship it, and your playbook with the labs.`,
  // Labs preview
  `Before anything else, show them the shape of the session, because this is what they came for. Seventy-five minutes of hands-on work in four labs: set up, the first chain, break it, ship it. Point at the clock and say the switch times out loud now, so nobody is surprised later: fifteen, forty-five, fifty-five, and we debrief at one hour fifteen.
Two things to flag here. The "done when" line on each card is the contract, so a pair knows when to stop and move on. And the pairing: one person prompts, one reviews, and you swap every lab, so everybody drives at least twice.
We come back to this exact slide before lab one. For now it is just the map — do not read the individual prompts, keep it to about a minute.`,
  // Roles
  `Three roles, and the workshop works because nobody does someone else's job.
You own intent and judgment: the intel, the platform, which signals are worth building, and every approval.
The agent drafts and runs: it searches before writing, drafts from templates, runs the CLI and fixes what the engine flags.
opentide owns the spec: the ontology and taxonomy, schemas and vocabularies, validation, deploy plans and CI.
Then the note at the bottom, which is the honest version for anyone without an agent: you absorb the middle column. You draft the YAML and run the commands yourself, and the right-hand column does not move an inch — same schemas, same gates, same exit codes. The agent changes who types, not what is checked.`,
  // Divider 01
  `Chapter one: set up. One prompt turns an empty folder into a repository the agent understands.`,
  // Prompt 01
  `Prompt 01, verbatim. Note the details: a pinned version, a name and organisation, one platform, one CI, MCP and skills for your agent, the hook, then generate and validate.
On the right is what the agent runs and what opentide prints, captured from a real run.
One thing to expect: the interactive wizard needs a terminal. An agent has none, so it must pass explicit flags and --yes. opentide fails fast rather than hanging, which is exactly what you want from a tool an agent drives.`,
  // What you get
  `Here is what that one prompt built. Three object folders, in blue, are where your work goes.
The templates and schemas are generated: the agent drafts from the templates, and validation checks against the schemas.
The platform config, the GitHub workflow, the pre-commit hook, the MCP config and the house rules for the agent complete it.
Point out: the engine, CI and the agent all read the same files. That is what keeps them aligned.`,
  // Wire agent
  `Restart your agent inside the repo so it picks up .mcp.json. In Claude Code, /mcp should show opentide connected.
These are the tools it gets: search, chaining, coverage, structured validation, a tenant check, dry-run deploys and deployment status.
Skills: opentide-detection-rule and detection-engineering come by default; add the threat-vector, objective or KQL skills with --install.
Prompt 02 is a sanity check. If the agent cannot name these tools, fix the wiring now, not in lab 2.`,
  // House rules
  `CLAUDE.md, or AGENTS.md for other agents, is read at the start of every session. Write the gates there once instead of repeating them in every prompt.
Prompt 03 asks the agent to add the section on the right: the order, vocabularies from the schemas, UUIDs from uuid4, done means validate strict passes, STAGING first, dry-run only, hands off credentials.
A real gotcha we hit while preparing this: setup skills also writes CLAUDE.md, and without --name and --org the header falls back to the folder name.`,
  // Divider 02
  `Chapter two: spec first. Threat, then objective, then rule. The agent drafts each one; the ontology and taxonomy keep them aligned.`,
  // Object model
  `Three objects, three questions. The threat: what are we defending against. The objective: what must we be able to see. The rule: how a platform sees it.
They link by UUID: the objective covers threats, the rule implements an objective through detection_model.
Make the agent earn each step. A rule with no objective is a query with no reason to exist.`,
  // Prompt 04 threat
  `Prompt 04 turns intel into a threat object. Paste the advisory text or give the URL.
What to expect: it searches first so it does not duplicate a threat, drafts from the generated template, generates a fresh UUID, and validates until clean.
Your job is the mapping, not the syntax. Watch for techniques the advisory never mentions; ask the agent to quote the sentence behind each one.`,
  // Prompt 05 objective
  `Prompt 05 is the most important prompt of the day: ask for the plan before the YAML.
The agent comes back with candidate signals, each with a methodology, entities and data needs. Here it proposes three; we keep two and log the web shell signal as a data gap because there is no web telemetry.
This is where your judgment matters most. The signals decide what gets built.`,
  // Prompt 06 rule
  `Prompt 06 writes the rule: Sentinel, rule::1.1, STAGING, detection_model pointing at the objective, techniques from the threat, a schedule.
Highlighted: the objective UUID that links the chain, and the STAGING status.
Expect good KQL. What the agent cannot tell you is whether the query returns data in your workspace. That check is yours, or CI's with validate query --live.`,
  // Divider 03
  `Chapter three: close the loop. The agent is done when the engine says so, not when the YAML exists.`,
  // Loop
  `The loop. Top band: the agent zone, where nothing deploys. It reads your prompt, searches, checks the chain, drafts YAML, validates, runs the strict gate, previews the deploy and opens a pull request. A failure sends it back to edit.
Bottom band: your gates. Review, STAGING from the pull request, merge, approval, and only then PRODUCTION.`,
  // Failure
  `What failure looks like, captured from a real run with two typical agent mistakes.
One: a vocabulary value that sounds right but is not in the taxonomy. 'Data Leak' is not an impact; the engine suggests 'Data Breach'.
Two: a detection_model pointing at an objective that does not exist.
In JSON, each issue carries a code, the field path, the line and a suggestion, so the agent gets a fix list, not a vague error.
A good agent applies the suggestion and restores the real UUID with search. It never invents an objective to make the reference resolve.`,
  // Coverage
  `Prompt 07: ask the catalogue, not the model. Coverage counts rules per technique; chaining explains why each one exists.
The calls on the right are what the agent makes: coverage, get_chaining, search for objectives with no rule.
The JSON at the bottom is the same coverage answer from the CLI, real output from the tutorial repo.`,
  // Dry run
  `Prompt 08: preview every deploy. On a fresh repo the dry run completes and tells you exactly what is missing: no tenant is configured, so a real deploy would stop.
Through MCP the agent previews one rule at a time with dry_run true.
Tenants and credentials are yours to add, as GitHub secrets, never in the repo or the chat. With the sentinel extra and credentials, validate query --live checks the catalogue queries against your workspace.`,
  // Divider 04
  `Chapter four: ship it. The agent's output is a pull request. CI runs every gate again, and humans promote.`,
  // PR
  `Prompt 09: one chain, one pull request. Ask for a description a reviewer can act on: the intel, the chain with UUIDs, the signals you chose not to build, and the gate output.
The pre-commit hook validates the commit itself, so a broken object never reaches the branch.`,
  // CI
  `This is the workflow opentide setup wrote for GitHub. On a pull request: validate and lint strictly, check queries live when credentials exist, generate, deploy to STAGING, and write inflight preview shards for reviewers.
On merge to main: validate, generate, deploy to PRODUCTION with promotion as deployment.toml configures, and publish the docs.
Same engine and the same version pin as the laptop, with no agent in the loop. Put production behind a protected environment so a human approves it.`,
  // MDR lifecycle
  `Zoom out from CI to the lifecycle a rule actually walks. Trace it with your hand: a signal leaves the backlog, gets a DESIGN, becomes a rule in DEVELOPMENT, then runs in STAGING against real data — that STAGING is exactly the deploy job you just saw. Stop at ACCEPTANCE and make the point of the slide — this is a hand-over gate, not a build step. The alert handling manager decides whether the rule is something their team can actually work at three in the morning: fidelity, severity, the response block. Ready means PRODUCTION; needs rework sends it back through IMPROVING. Then retirement, which is explicit: DISABLED, then REMOVED. No rule leaves silently.
The colours are who owns the merge request, and that part is organisation-specific — this is how the European Commission CSOC splits it between CATCH and CSIRC. Tell the room to swap the team names for their own; the shape holds. Tie it to deployment.toml: every box here is a status, and each status already maps to a deploy strategy.`,
  // Prompt 10 artefacts
  `The last job in that merge lane was Document, so here is what Document actually produces. Make the point first: nobody writes any of this by hand, which is why none of it can drift from what you run.
Four artefacts, all from the objects you validated in lab two. Markdown docs: a page per threat, objective and rule, with Mermaid coverage and chaining diagrams, backlinked both ways, in a GitHub, GitLab or Azure DevOps flavour. The explorer: the whole catalogue as a browsable graph plus a prebuilt search index, a static bundle with no backend to patch. The ATT&CK layer, version 4.5, and read the legend out loud because it is the useful part — green is full coverage, red is a threat you have modelled with no rule behind it, so a real gap, and blue is a rule with no threat, which is a rule nobody can justify yet. Then MISP.
On sharing, be precise about the thing people conflate: sharing is not deployment. A destination is a MISP instance, not a detection platform. Lead with preview, because it makes the same decision as push without sending a request or writing the ledger, so it is safe to hand to an agent and safe to run live in front of a room. And max_tlp is the control: it is a hard ceiling per destination, so a TLP:AMBER object cannot leave.
Prompt 10 is the stretch goal at the end of lab four. If the room is behind, show the slide and move on.`,
  // Guardrails
  `What the agent does, and what you keep. This list comes straight from the agentic setup guide.
Let the agent search, draft, fix what the validator flags, preview deploys and open the pull request.
Keep real deploys and promotion, credentials and deployment plans, the call that a query works, UUID conflicts, and which signals are worth building.`,
  // Divider 05
  `Chapter five: your playbook. Prompts that work, what to expect, and the labs.`,
  // Cookbook
  `Six prompts to keep. Intel to detection, end to end, with a stop for your OK. Coverage gaps ranked by threat criticality. Porting a rule to Splunk. Fixing a red build without touching UUIDs. A review sweep using the rule::1.1 review dates. And migrating a CoreTide repository using the prompt in the docs.`,
  // Patterns
  `Prompt like a spec, not a wish. Name the objects and the order, give the intel and check the mapping, ask for signals first, end with the gate, one chain per pull request.
And the don'ts: no rules without a threat, no vocabulary or UUIDs from memory, no done without the output, no real deploys, no credentials in the chat.`,
  // Labs
  `Four labs, seventy-five minutes. Pair up: one person prompts, the other reviews, and you swap every lab.
Read the clock at the bottom out loud, because it is the only way the room stays together: set up at zero, the first chain at fifteen, break it at forty-five, ship it at fifty-five, and we debrief at one hour fifteen. Announce each switch yourself, and move pairs on even when they are not finished — a pair stuck in lab two will still get value from watching lab four.
The budget is deliberate: the first chain gets thirty minutes because it is the only lab where judgment is the work. Set up and break it are mechanical, so they get fifteen and ten.
Lab one: set up, done when validate strict passes and the agent lists its tools. Lab two: the first chain, prompts four to six. Lab three: break a value and a reference on purpose and let the agent fix the build. Lab four: preview, then a pull request with a green Validate job, and prompt ten for the artefacts if the pair has time.`,
  // Resources
  `To take home: the same five commands, then hand the keyboard to your agent. The tutorial, the agentic setup guide, the MCP tool reference and the skills catalogue are linked here. Scan for opentide.org.`,
  // Close
  `Agents write the queries; the spec keeps them aligned. Threat first, plan before YAML, the gate before done, and a human before production.
Thank you. Let's start lab one.`,
];

export default [
  // 00 · opening
  Cover,
  Bring,
  Agenda,
  LabsPreview,
  Roles,
  // 01 · set up
  DividerSetup,
  PromptSetup,
  WhatYouGet,
  WireAgent,
  HouseRules,
  // 02 · spec first
  DividerSpec,
  ObjectModel,
  PromptThreat,
  PromptObjective,
  PromptRule,
  // 03 · close the loop
  DividerLoop,
  AgentLoop,
  Failure,
  Coverage,
  DryRun,
  // 04 · ship it
  DividerShip,
  PromptPR,
  CI,
  MdrLifecycle,
  PromptArtefacts,
  Guardrails,
  // 05 · your playbook
  DividerPlay,
  Cookbook,
  Patterns,
  Labs,
  Resources,
  Close,
] satisfies Page[];
