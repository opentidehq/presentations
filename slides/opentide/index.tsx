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
import qrOpentide from './assets/qr-opentide-org.svg';

// ─────────────────────────────────────────────────────────────────────────────
// opentide — the engine behind agentic detection engineering.
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
const FONT_STYLE_ID = 'osd-fonts-opentide';
const FONT_CSS = `
@font-face{font-family:'Inter';src:url(${InterUrl}) format('woff2');font-weight:100 900;font-style:normal;font-display:block;}
@font-face{font-family:'JetBrains Mono';src:url(${MonoUrl}) format('woff2');font-weight:100 800;font-style:normal;font-display:block;}
`;
const MOTION_STYLE_ID = 'osd-motion-opentide';
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
  <span style={{ fontFamily: MONO, fontSize: size ? size : '0.86em', color, letterSpacing: 0, fontVariantLigatures: 'none' }}>{children}</span>
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
  'DeviceProcessEvents | where ActionType == "ProcessAccess" | where FileName =~ "lsass.exe"',
  '| where InitiatingProcessFileName !in~ ("csrss.exe", "services.exe")',
  'detection_model: f8817f95-c43e-402b-83a1-5157ce46e670',
  '`sysmon` EventCode=10 TargetImage="*\\lsass.exe" | stats count by host, user, SourceImage',
  'SigninLogs | where AuthenticationProtocol == "deviceCode" | where ResultType == 0',
  'status: STAGING  severity: High  techniques: [T1003.001]  mitre_attack: [T1190]',
  'opentide validate --strict && opentide deploy --plan STAGING --dry-run',
  'surface: [Windows::Server]  schema: rule::1.1  tlp: clear',
].join('   ') + '   ';
const Q_WHY = [
  'SOC Prime Threat of the Month  StopRansomware: Gunra  CISA AA26-222A  Critical',
  'T1190 Exploit Public-Facing Application  T1003 OS Credential Dumping  T1003.001 LSASS Memory',
  'misp::5b4ee3ea-eee3-4c8e-8323-85ae32658754  sighting 2026-10-02  TLP:CLEAR',
  'T1078.004 Cloud Accounts  device code phishing  T1195.002 supply chain worm',
  'advisory  campaign  zero-day  OSINT  ISAC  vendor bulletin  intrusion set',
].join('   ') + '   ';
const Q_WHAT = [
  'name: metadata: uuid: schema: threat::1.0 version: tlp: clear',
  'threat: severity: impact: leverage: viability: terrain: surface: mitre_attack: actors:',
  'objective: priority: composition: strategy: synergetic threats: signals: methodology:',
  'entities: data: availability: requirements: schema: objective::1.0',
  'rule: status: STAGING severity: techniques: detection_model: configurations:',
  'sentinel: splunk: defender_for_endpoint: response: alert_severity: schema: rule::1.1',
].join('   ') + '   ';
const Q_WHYNOW = [
  "pip install 'opentide==0.11.0'  opentide setup --yes --platform sentinel --ci github",
  'opentide generate  opentide validate --strict  opentide lint --strict',
  'opentide deploy --plan STAGING  from opentide import OpenTide  OpenTide.initialise()',
  'OpenTide.Rules[uuid].deploy("sentinel")  git submodule deinit -f CoreTide',
].join('   ') + '   ';
const Q_AGENTS = [
  'search(query="T1190")  get_chaining(uuid="f8817f95")  coverage(technique="T1003")',
  'validation_report()  validate_rule(uuid)  deploy_rule(uuid, platform="sentinel", dry_run=true)',
  'deployment_status(uuid)  opentide://index  opentide://vocabularies/surface  opentide setup mcp --claude-code',
].join('   ') + '   ';
const Q_NEXT = [
  'elastic  sysdig  falco  opentide[lsp]  KQL  SPL  tide-yaml  tree-sitter  vscode-extension',
  'rule::2.0  agent plugins  deployment state shards  RFC 0007  RFC 0004  1.0',
].join('   ') + '   ';
const Q_CLOSE = [Q_COVER, Q_WHAT, Q_AGENTS].join('   ');

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

// ─────────────────────────────────────────────────────────────────────────────
// 01 · COVER
// ─────────────────────────────────────────────────────────────────────────────
const Cover: Page = () => (
  <Stage>
    <TideCanvas text={Q_COVER} fill={0.22} seed={0.17} maskTop={0.29} ink={BLUE} bg="#FFFFFF" />
    <img src={logoNormal} alt="opentide" style={{ position: 'absolute', left: 120, top: 92, height: 62, display: 'block' }} />
    <div style={{ position: 'absolute', right: 120, top: 92, height: 62, display: 'flex', alignItems: 'center', gap: 14, fontFamily: MONO, fontSize: 20, color: C.muted }}>
      <span>opentide.org</span>
      <span style={{ color: C.dim }}>·</span>
      <span>october 2026</span>
    </div>
    <h1 style={{ position: 'absolute', left: 120, top: 208, margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 'var(--osd-size-hero)', lineHeight: 0.98, letterSpacing: '-0.05em', color: INK }}>
      The engine behind
      <br />
      <span style={{ color: ACC }}>agentic</span> detection
      <br />
      engineering.
    </h1>
    <p style={{ position: 'absolute', left: 120, top: 640, width: 1240, margin: 0, fontSize: 32, lineHeight: 1.45, color: C.muted, letterSpacing: '-0.01em' }}>
      Spec-driven development for detection engineering: an ontology and a taxonomy, an engine you pin, and threat-aligned
      detections that ship fast.
    </p>
  </Stage>
);

// ─────────────────────────────────────────────────────────────────────────────
// 02 · IN ONE SENTENCE + AGENDA
// ─────────────────────────────────────────────────────────────────────────────
const AgendaRow = ({ n, title, sub, last }: { n: string; title: string; sub: string; last?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 28, padding: '26px 0', borderTop: `1px solid ${C.line}`, borderBottom: last ? `1px solid ${C.line}` : undefined }}>
    <span style={{ fontFamily: MONO, fontSize: 22, color: ACC, width: 40 }}>{n}</span>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ fontSize: 38, fontWeight: 650, letterSpacing: '-0.025em', color: INK, lineHeight: 1.1 }}>{title}</span>
      <span style={{ fontFamily: MONO, fontSize: 19, color: C.subtle }}>{sub}</span>
    </div>
  </div>
);

const Thesis: Page = () => (
  <Frame chapter={['00', 'overview']} source="opentide.org">
    <div style={{ display: 'flex', gap: 110, height: '100%', alignItems: 'center' }}>
      <div style={{ width: 860 }}>
        <Label>opentide, in one sentence</Label>
        <p style={{ margin: '28px 0 0', fontSize: 52, fontWeight: 620, lineHeight: 1.16, letterSpacing: '-0.032em', color: INK }}>
          opentide is <A>spec-driven development for detection engineering</A>: an <A>ontology</A> and a <A>taxonomy</A> that keep every
          detection <A>threat-aligned</A>, maintainable and fast to ship, with or without agents.
        </p>
        <p style={{ margin: '40px 0 0', fontSize: 28, lineHeight: 1.5, color: C.muted, maxWidth: 820 }}>
          Strict validation, a deployment pipeline, modern DevOps workflows and agent-native constructs, on an object graph that scales
          with you.
        </p>
      </div>
      <div style={{ flex: 1 }}>
        <AgendaRow n="01" title="Why it matters" sub="the gap · five failure modes · new economics" />
        <AgendaRow n="02" title="What opentide is" sub="spec · object graph · engine · platforms" />
        <AgendaRow n="03" title="Why we re-released it" sub="from submodule to CLI, built for agents" />
        <AgendaRow n="04" title="Agentic detection engineering" sub="the loop · a worked example · guardrails" />
        <AgendaRow n="05" title="What comes next" sub="velocity · roadmap · north star" last />
      </div>
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// 03 · DIVIDER — WHY IT MATTERS
// ─────────────────────────────────────────────────────────────────────────────
const DividerWhy: Page = () => (
  <Divider
    n="01"
    chapter="why it matters"
    title="Why it matters"
    sub="Intelligence moves faster than detection engineering can. And agents just changed what is scarce."
    fill={0.32}
    seed={0.31}
    text={Q_WHY}
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// 04 · THE GAP
// ─────────────────────────────────────────────────────────────────────────────
const INTEL = 'M70 452 C 360 440, 620 330, 930 64';
const THROUGHPUT = 'M70 455 C 380 446, 660 420, 930 386';
const GAP_AREA = 'M70 452 C 360 440, 620 330, 930 64 L930 386 C 660 420, 380 446, 70 455 Z';

const Stat = ({ value, label, accent }: { value: string; label: string; accent?: boolean }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '26px 0', borderTop: `1px solid ${C.line}` }}>
    <span style={{ fontSize: 76, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 0.95, color: accent ? ACC : INK }}>{value}</span>
    <span style={{ fontSize: 25, lineHeight: 1.4, color: C.muted }}>{label}</span>
  </div>
);

const Gap: Page = () => (
  <Frame chapter={['01', 'why it matters']} source="opentide @ FIRST CTI 2026 · European Commission CSOC">
    <H>Intelligence outruns detection engineering.</H>
    <Lead>The bottleneck was never the strategy. It was the capacity to execute it: read, model, write, tune, deploy, repeat.</Lead>
    <div style={{ display: 'flex', gap: 80, marginTop: 40, flex: 1 }}>
      <div style={{ position: 'relative', width: 960, height: 520 }}>
        <svg width={960} height={520} viewBox="0 0 960 520" aria-hidden style={{ display: 'block' }}>
          <defs>
            <pattern id="ot-gap-hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="12" stroke="rgba(198,47,63,0.32)" strokeWidth="3" />
            </pattern>
          </defs>
          <line x1="70" y1="24" x2="70" y2="470" stroke={C.line2} strokeWidth={2} />
          <line x1="70" y1="470" x2="940" y2="470" stroke={C.line2} strokeWidth={2} />
          <path className="ot ot-fade" style={{ animationDelay: '1.1s' }} d={GAP_AREA} fill="url(#ot-gap-hatch)" />
          <path className="ot ot-draw" pathLength={1} d={INTEL} fill="none" stroke={BLUE} strokeWidth={6} strokeLinecap="round" />
          <path className="ot ot-fade" style={{ animationDelay: '0.5s' }} d={THROUGHPUT} fill="none" stroke={C.inkHex} strokeWidth={5} strokeLinecap="round" strokeDasharray="2 13" />
          <text x="505" y="505" fill={C.dim} fontFamily={MONO} fontSize="18" textAnchor="middle">
            time
          </text>
          <path d="M548 499 h26 M566 492 l8 7 -8 7" stroke={C.dim} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="ot ot-fade" style={{ position: 'absolute', left: 600, top: 40, animationDelay: '0.9s' }}>
          <Chip tone="accent">intel volume</Chip>
        </div>
        <div className="ot ot-fade" style={{ position: 'absolute', left: 650, top: 424, animationDelay: '0.7s' }}>
          <Chip>engineering throughput</Chip>
        </div>
        <div className="ot ot-fade" style={{ position: 'absolute', left: 772, top: 262, animationDelay: '1.3s' }}>
          <Chip tone="warn">the gap</Chip>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Stat value="1,000s" label="intel items a month: advisories, CVEs, campaigns" accent />
        <Stat value="hours" label="per TTP to read, model, write, tune and deploy" />
        <Stat value="tens" label="production-ready detection rules a month" />
      </div>
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// 05 · FIVE FAILURE MODES
// ─────────────────────────────────────────────────────────────────────────────
const FailRow = ({ n, title, body, icon }: { n: string; title: string; body: string; icon: IconName }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 34, padding: '22px 0', borderTop: `1px solid ${C.line}` }}>
    <span style={{ fontFamily: MONO, fontSize: 22, color: ACC, width: 36 }}>{n}</span>
    <Icon name={icon} size={36} color={BLUE} />
    <span style={{ width: 540, fontSize: 36, fontWeight: 650, letterSpacing: '-0.025em', color: INK }}>{title}</span>
    <span style={{ flex: 1, fontSize: 26, lineHeight: 1.42, color: C.muted }}>{body}</span>
  </div>
);

const FailureModes: Page = () => (
  <Frame chapter={['01', 'why it matters']} source="opentide.org/docs/usage/why-opentide">
    <H>Five ways detection engineering breaks at scale.</H>
    <div style={{ marginTop: 50 }}>
      <Steps>
        <Step>
          <FailRow n="01" icon="layers" title="Content drift" body="Two engineers describe the same rule two ways. Reviews catch style, not correctness." />
        </Step>
        <Step>
          <FailRow n="02" icon="link" title="No thread from threat to rule" body="A rule exists, but why? Which threat, which objective, what breaks if it is deleted?" />
        </Step>
        <Step>
          <FailRow n="03" icon="plug" title="Multi-platform sprawl" body="One idea, re-implemented per SIEM and EDR. Cross-platform coverage is guesswork." />
        </Step>
        <Step>
          <FailRow n="04" icon="branch" title="Copy-paste reuse" body="Submodules and forks couple repositories. Upgrades spread breaking changes silently." />
        </Step>
        <Step>
          <FailRow n="05" icon="warn" title="Unsafe automation" body="Scripts and agents edit YAML with no schema and no quality gate." />
        </Step>
      </Steps>
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// 06 · COVERAGE IS A GRAPH, NOT A HEATMAP
// ─────────────────────────────────────────────────────────────────────────────
const HEAT_COLS = 12;
const HEAT_ROWS = 7;
const heatCell = (i: number) => {
  const r = hash2(i, i * 7 + 3, 0.42);
  if (r < 0.15) return '#ECEFF6';
  if (r < 0.45) return 'rgba(0,20,137,0.2)';
  if (r < 0.75) return 'rgba(0,20,137,0.48)';
  return 'rgba(0,20,137,0.86)';
};
const Heatmap = () => (
  <svg width={HEAT_COLS * 50} height={HEAT_ROWS * 50} viewBox={`0 0 ${HEAT_COLS * 50} ${HEAT_ROWS * 50}`} aria-hidden style={{ display: 'block' }}>
    {Array.from({ length: HEAT_COLS * HEAT_ROWS }, (_, i) => (
      <rect key={i} x={(i % HEAT_COLS) * 50} y={Math.floor(i / HEAT_COLS) * 50} width={42} height={42} rx={6} fill={heatCell(i)} />
    ))}
  </svg>
);

const CmpRow = ({ dim, before, after, head }: { dim: string; before: string; after: string; head?: boolean }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '210px 230px 1fr',
      gap: 24,
      alignItems: 'center',
      padding: head ? '0 0 16px' : '17px 0',
      borderTop: head ? undefined : `1px solid ${C.line}`,
      fontFamily: head ? MONO : SANS,
      fontSize: head ? 18 : 25,
    }}
  >
    <span style={{ color: head ? C.dim : C.muted }}>{dim}</span>
    <span style={{ color: head ? C.dim : C.subtle }}>{before}</span>
    <span style={{ color: head ? ACC : INK, fontWeight: head ? 400 : 560 }}>{after}</span>
  </div>
);

const Heatmaps: Page = () => (
  <Frame chapter={['01', 'why it matters']} source="opentide @ FIRST CTI 2026 · opentide.org/docs/specifications">
    <H>Coverage is a graph, not a heatmap.</H>
    <Lead>A technique heatmap flatters. A threat-informed graph says which threat, which signal, which rule, on which platform.</Lead>
    <div style={{ display: 'flex', gap: 90, marginTop: 48 }}>
      <div style={{ width: 600, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em', color: INK }}>“We cover 85% of ATT&amp;CK.”</span>
        <Heatmap />
        <span style={{ fontFamily: MONO, fontSize: 19, color: C.subtle, lineHeight: 1.6 }}>
          for which threats? with which signals?
          <br />
          on which platforms? deployed where?
        </span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <CmpRow head dim="dimension" before="att&ck heatmap" after="opentide graph" />
        <CmpRow dim="Granularity" before="technique" after="atomic threat vector" />
        <CmpRow dim="Context" before="generic" after="surface and terrain" />
        <CmpRow dim="Impact" before="implicit" after="severity · impact · leverage · viability" />
        <CmpRow dim="Chaining" before="none" after="threat → threat attack paths" />
        <CmpRow dim="Intel link" before="manual" after="actors, sightings, references" />
        <CmpRow dim="Detection" before="separate" after="objective → signals → rules" />
      </div>
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// 07 · THE QUERY IS A COMMODITY
// ─────────────────────────────────────────────────────────────────────────────
const Meter = ({ label, before, after, afterWidth, afterLabel, accent }: { label: string; before: string; after: string; afterWidth: number; afterLabel: string; accent?: boolean }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <span style={{ fontSize: 32, fontWeight: 650, letterSpacing: '-0.02em', color: INK }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <span style={{ width: 150, fontFamily: MONO, fontSize: 18, color: C.dim }}>{before}</span>
      <div style={{ flex: 1, height: 22, borderRadius: 999, background: C.tint }} />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <span style={{ width: 150, fontFamily: MONO, fontSize: 18, color: accent ? ACC : C.muted }}>{after}</span>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div className="ot ot-grow" style={{ width: afterWidth, height: 22, borderRadius: 999, background: accent ? BLUE : C.inkHex, animationDelay: '0.4s' }} />
        <span style={{ fontFamily: MONO, fontSize: 19, color: accent ? ACC : C.muted, whiteSpace: 'nowrap' }}>{afterLabel}</span>
      </div>
    </div>
  </div>
);

const Scarce = ({ icon, title, body }: { icon: IconName; title: string; body: string }) => (
  <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', padding: '20px 0', borderTop: `1px solid ${C.line}` }}>
    <Icon name={icon} size={34} color={BLUE} style={{ marginTop: 2 }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 30, fontWeight: 650, letterSpacing: '-0.02em', color: INK }}>{title}</span>
      <span style={{ fontSize: 24, lineHeight: 1.4, color: C.muted }}>{body}</span>
    </div>
  </div>
);

const Commodity: Page = () => (
  <Frame chapter={['01', 'why it matters']} source="opentide @ CERT-EU AI workshop, June 2026">
    <H>Agents made the query cheap. Not threat-aligned.</H>
    <div style={{ display: 'flex', gap: 100, marginTop: 64, flex: 1 }}>
      <div style={{ width: 820, display: 'flex', flexDirection: 'column', gap: 64 }}>
        <Meter label="Writing a detection query" before="by hand" after="with agents" afterWidth={64} afterLabel="seconds" accent />
        <Meter label="Aligning and maintaining it" before="by hand" after="with agents" afterWidth={500} afterLabel="still hours" />
        <p style={{ margin: 0, fontSize: 28, lineHeight: 1.45, color: C.muted }}>
          Threat alignment, coverage and maintenance did not get cheaper with the text. A spec has to carry that work.
        </p>
      </div>
      <div style={{ flex: 1 }}>
        <Label style={{ marginBottom: 12 }}>what becomes scarce</Label>
        <Scarce icon="doc" title="A spec" body="An ontology and a taxonomy for what a detection is." />
        <Scarce icon="graph" title="Threat alignment" body="Every rule traces to an objective and a threat." />
        <Scarce icon="check" title="Quality gates" body="Strict validation in CI, for humans and agents alike." />
        <Scarce icon="branch" title="Maintainability" body="One model across seven platforms, versioned in git." />
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 26, borderTop: `1px solid ${C.line}` }}>
      <span style={{ fontSize: 40, fontWeight: 720, letterSpacing: '-0.03em', color: ACC }}>That is what opentide is.</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 19, color: C.subtle }}>
        next: what opentide is <Icon name="arrow" size={20} color={C.subtle} />
      </span>
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// 08 · DIVIDER — WHAT OPENTIDE IS
// ─────────────────────────────────────────────────────────────────────────────
const DividerWhat: Page = () => (
  <Divider
    n="02"
    chapter="what opentide is"
    title="What opentide is"
    sub="Spec-driven development for detection engineering: an ontology, a taxonomy, and an engine you pin."
    fill={0.34}
    seed={0.58}
    text={Q_WHAT}
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// 09 · A SPEC AND AN IMPLEMENTATION
// ─────────────────────────────────────────────────────────────────────────────
const Layer = ({ n, name, role, line1, line2, meta, icon, solid }: { n: string; name: string; role: string; line1: ReactNode; line2: ReactNode; meta: string; icon: IconName; solid?: boolean }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 36,
      height: 156,
      padding: '0 40px',
      borderRadius: 18,
      background: solid ? BLUE : '#FFFFFF',
      border: `1.5px solid ${solid ? BLUE : C.line2}`,
      color: solid ? '#FFFFFF' : INK,
    }}
  >
    <Icon name={icon} size={44} color={solid ? '#FFFFFF' : BLUE} />
    <div style={{ width: 400, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontFamily: MONO, fontSize: 17, color: solid ? 'rgba(255,255,255,0.7)' : C.dim }}>{n}</span>
      <span style={{ fontSize: 40, fontWeight: 750, letterSpacing: '-0.03em', lineHeight: 1 }}>{name}</span>
      <span style={{ fontSize: 22, color: solid ? 'rgba(255,255,255,0.82)' : C.muted }}>{role}</span>
    </div>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 24, lineHeight: 1.35, color: solid ? 'rgba(255,255,255,0.92)' : INK }}>
      <span>{line1}</span>
      <span style={{ color: solid ? 'rgba(255,255,255,0.72)' : C.muted }}>{line2}</span>
    </div>
    <span style={{ fontFamily: MONO, fontSize: 17, color: solid ? 'rgba(255,255,255,0.8)' : C.muted, textAlign: 'right', whiteSpace: 'nowrap' }}>{meta}</span>
  </div>
);

const Connector = ({ label }: { label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, height: 38, paddingLeft: 60, fontFamily: MONO, fontSize: 17, color: C.muted }}>
    <svg width="22" height="30" viewBox="0 0 22 30" aria-hidden>
      <path d="M11 2v24M4 19l7 7 7-7" stroke={BLUE} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    {label}
  </div>
);

const SpecStack: Page = () => (
  <Frame chapter={['02', 'what opentide is']} source="opentide.org/blog/the-next-step-for-opentide · specifications/GOVERNANCE.md">
    <H>Spec-driven development for detection engineering.</H>
    <div style={{ display: 'flex', flexDirection: 'column', marginTop: 44 }}>
      <Layer
        n="the spec · ontology + taxonomy"
        name="specifications"
        role="normative · CC-BY-4.0"
        icon="doc"
        line1={
          <>
            Ontology: <M color={BLUE}>threat::1.0</M> · <M color={BLUE}>objective::1.0</M> · <M color={BLUE}>rule::1.1</M>
          </>
        }
        line2="Taxonomy: 36 versioned vocabularies · fixtures · RFCs"
        meta="OpenTideHQ/specifications"
      />
      <Connector label="spec markdown → Pydantic models → JSON Schema (generated, never edited)" />
      <Layer
        n="the engine you pin"
        name="opentide"
        role="pip install opentide · EUPL-1.2"
        icon="package"
        solid
        line1="One package: CLI, Python SDK, MCP server, 7 platform adapters"
        line2="Types and JSON Schema share one model, so they cannot drift"
        meta="OpenTideHQ/opentide"
      />
      <Connector label="validates · generates · deploys · documents" />
      <Layer
        n="the source of truth"
        name="your detection repo"
        role="yours · in git"
        icon="branch"
        line1={
          <>
            <M color={BLUE}>objects/</M> threats, objectives and rules as YAML
          </>
        }
        line2=".opentide/configurations · your CI · your reviews · your history"
        meta="private or public"
      />
    </div>
    <p style={{ margin: '36px 0 0', fontSize: 28, lineHeight: 1.45, color: C.muted }}>
      The spec does not ship detections. The package does not hold your YAML. <span style={{ color: ACC, fontWeight: 600 }}>Your repo stays the source of truth.</span>
    </p>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// 10 · THREE OBJECTS, THREE QUESTIONS
// ─────────────────────────────────────────────────────────────────────────────
const ObjCard = ({ icon, kind, schema, name, question, fields }: { icon: IconName; kind: string; schema: string; name: string; question: string; fields: string }) => (
  <div style={{ width: 500, height: 432, borderRadius: 20, border: `1.5px solid ${C.line2}`, background: '#FFFFFF', padding: '34px 36px', display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={36} color="#FFFFFF" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, fontFamily: MONO }}>
        <span style={{ fontSize: 19, color: BLUE, fontWeight: 600 }}>{kind}</span>
        <span style={{ fontSize: 17, color: C.dim }}>{schema}</span>
      </div>
    </div>
    <span style={{ marginTop: 30, fontSize: 52, fontWeight: 760, letterSpacing: '-0.035em', lineHeight: 1, color: INK }}>{name}</span>
    <span style={{ marginTop: 14, fontSize: 30, lineHeight: 1.3, color: INK, letterSpacing: '-0.015em' }}>{question}</span>
    <span style={{ marginTop: 'auto', paddingTop: 20, borderTop: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 18, lineHeight: 1.65, color: C.muted }}>{fields}</span>
  </div>
);

const FlowArrow = ({ dir, label, sub, dashed }: { dir: 'left' | 'right'; label: string; sub: string; dashed?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
    <svg width="960" height="24" viewBox="0 0 960 24" aria-hidden style={{ flex: '0 0 auto' }}>
      {dir === 'left' ? (
        <>
          <path d="M14 12 H956" stroke={BLUE} strokeWidth={2.5} strokeDasharray={dashed ? '9 9' : undefined} />
          <path d="M24 3 L12 12 L24 21" stroke={BLUE} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <path d="M4 12 H946" stroke={BLUE} strokeWidth={2.5} strokeDasharray={dashed ? '9 9' : undefined} />
          <path d="M936 3 L948 12 L936 21" stroke={BLUE} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 24, fontWeight: 650, color: INK }}>{label}</span>
      <span style={{ fontFamily: MONO, fontSize: 16, color: C.muted }}>{sub}</span>
    </div>
  </div>
);

const ObjectModel: Page = () => (
  <Frame chapter={['02', 'what opentide is']} source="opentide.org/docs/usage/concepts/object-model">
    <H>Three objects. Three questions.</H>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 44 }}>
      <ObjCard
        icon="threat"
        kind="TVM · threat"
        schema="threat::1.0"
        name="Threat"
        question="What do we defend against?"
        fields="severity · impact · leverage · viability · terrain · surface · mitre_attack · actors · chaining"
      />
      <ObjCard
        icon="objective"
        kind="DOM · objective"
        schema="objective::1.0"
        name="Objective"
        question="What are we trying to detect?"
        fields="priority · type · composition · threats[ ] · signals[ ]: methodology, entities, data"
      />
      <ObjCard
        icon="rule"
        kind="MDR · rule"
        schema="rule::1.1"
        name="Rule"
        question="How do we detect it, on which platform?"
        fields="status · severity · techniques · detection_model · configurations.{sentinel, splunk, …}"
      />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 40 }}>
      <FlowArrow dir="left" label="References point back" sub="rule.detection_model → objective · objective.threats → threat" />
      <FlowArrow dir="right" label="Coverage flows forward" sub="threats covered by objectives, implemented by rules" dashed />
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// 11 · ONE CHAIN IN YAML
// ─────────────────────────────────────────────────────────────────────────────
const U_THREAT = 'aa36f6de-4cc8-…';
const U_OBJ = 'f8817f95-c43e-…';
const MARK_THREAT: CodeMark = { t: U_THREAT, bg: BLUE, fg: '#FFFFFF' };
const MARK_OBJ: CodeMark = { t: U_OBJ, bg: 'rgba(0,20,137,0.08)', fg: BLUE, border: `1.5px solid ${BLUE}` };

const YAML_THREAT = `name: Gunra ransomware intrusion
criticality: High
metadata:
  uuid: ${U_THREAT}
  schema: threat::1.0
  tlp: clear
threat:
  severity: Significant incident
  impact: [Data Breach]
  leverage: [Infrastructure Compromise]
  viability: Likely
  surface:
    - Windows::Server
  mitre_attack: [T1190, T1003]
  killchain: Exploitation`;

const YAML_OBJ = `name: Credential access via LSASS
metadata:
  uuid: ${U_OBJ}
  schema: objective::1.0
objective:
  priority: High
  type: Threat
  composition:
    strategy: synergetic
  threats:
    - ${U_THREAT}
  signals:
    - name: LSASS process access
      methodology: Behavioural
      entities: [Process, Hostname]
      data:
        availability: Complete`;

const YAML_RULE = `name: LSASS memory access
metadata:
  uuid: c8f282eb-0286-…
  schema: rule::1.1
  reviewed: "2026-10-01"
status: STAGING
severity: High
techniques: [T1003.001]
detection_model: ${U_OBJ}
configurations:
  sentinel:
    query: |
      DeviceProcessEvents
      | where FileName =~ "lsass.exe"
  splunk:
    query: |
      \`sysmon\` EventCode=10`;

const YamlChain: Page = () => (
  <Frame chapter={['02', 'what opentide is']} source="specifications/fixtures/valid · opentide.org/docs/usage/concepts/object-model">
    <H>One chain. Three files. Linked by UUID.</H>
    <div style={{ display: 'flex', gap: 18, marginTop: 38 }}>
      <Code
        lang="yaml"
        size={19}
        lh={1.5}
        marks={[MARK_THREAT]}
        title={
          <>
            <Icon name="threat" size={18} color={BLUE} /> objects/threats/gunra-ransomware-intrusion.yaml
          </>
        }
        code={YAML_THREAT}
        style={{ width: 548 }}
      />
      <Code
        lang="yaml"
        size={19}
        lh={1.5}
        marks={[MARK_THREAT, MARK_OBJ]}
        title={
          <>
            <Icon name="objective" size={18} color={BLUE} /> objects/objectives/credential-access.yaml
          </>
        }
        code={YAML_OBJ}
        style={{ width: 548 }}
      />
      <Code
        lang="yaml"
        size={19}
        lh={1.5}
        marks={[MARK_OBJ]}
        title={
          <>
            <Icon name="rule" size={18} color={BLUE} /> objects/rules/lsass-memory-access.yaml
          </>
        }
        code={YAML_RULE}
        style={{ width: 548 }}
      />
    </div>
    <div style={{ display: 'flex', gap: 40, marginTop: 28, fontSize: 24, color: C.muted, alignItems: 'center' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: MONO, fontSize: 18, background: BLUE, color: '#fff', borderRadius: 5, padding: '2px 8px' }}>aa36…</span>
        objective.threats → the threat
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: MONO, fontSize: 18, border: `1.5px solid ${BLUE}`, color: BLUE, borderRadius: 5, padding: '1px 8px' }}>f881…</span>
        rule.detection_model → the objective
      </span>
      <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 18, color: C.dim }}>excerpts · rename or move files freely, links hold</span>
    </div>
  </Frame>
);

const PAGES_A: Page[] = [Cover, Thesis, DividerWhy, Gap, FailureModes, Heatmaps, Commodity, DividerWhat, SpecStack, ObjectModel, YamlChain];
const NOTES_A: string[] = [
  `Welcome. This talk is about opentide: what it is, why it matters, why we re-released it as a CLI for agentic detection engineering, and where it goes next.
The water at the bottom is not decoration. Every character is real detection content, KQL, SPL and opentide YAML, moved by a small fluid simulation. Move the pointer and it moves. That is the talk in one picture: a lot of detection content in motion, and a spec that keeps it aligned.`,
  `If you remember one sentence: opentide is the battle-hardened detection engineering standard for teams adopting detection-as-code and scaling their output, with or without agents.
Five parts. Why it matters. What opentide actually is. Why we re-released it as a CLI. What agentic detection engineering looks like in practice. And what comes next.`,
  `Part one. Why does any of this matter? Because intelligence moves faster than detection engineering can, and agents just changed what is scarce.`,
  `This is the shape every SOC knows. Intel volume keeps climbing: advisories, CVEs, campaigns, OSINT, thousands of items a month. The number of people who can turn a report into a validated, deployed detection does not climb with it.
Each TTP costs hours: read, model, write, tune, deploy. So the output is tens of production-ready rules a month. The bottleneck was never the strategy. It was the capacity to execute it.`,
  `And when teams try to scale by hand, detection engineering breaks in five predictable ways. Content drift: the same rule described two ways. No thread from threat to rule: nobody can say why a rule exists. Multi-platform sprawl: one idea rewritten per SIEM and EDR. Copy-paste reuse through submodules and forks. And unsafe automation: scripts and now agents editing YAML with no schema and no quality gate.
Keep the last one in mind; it is the one that gets worse with agents.`,
  `A quick word on coverage. "We cover 85% of ATT&CK" is the sentence everyone has said and nobody can defend. A technique heatmap is flat: it does not say for which threat, with which signal, on which platform, deployed where.
A threat-informed model adds the missing dimensions: atomic threat vectors instead of techniques, surface and terrain, scored impact, attack-path chaining, links to actors and intel, and detection decomposed into objectives, signals and rules.`,
  `Now the turn. Agents made the query cheap. Writing a KQL or SPL query went from hours to seconds. But trusting that query did not get cheaper at all: is it valid, does it map to a real threat, does it duplicate something, is it deployed where it should be, who reviewed it?
So what becomes scarce is not text. It is a spec that defines what a detection is, threat alignment from threat to rule, quality gates no author can skip, and one model you can maintain across platforms. That is what opentide is.`,
  `Part two. What opentide is, concretely: a normative spec, an engine you pin, and a graph of objects that turns threat intelligence into deployed, documented detections.`,
  `opentide is a spec and an implementation. Three layers. The specifications repository is the contract: normative markdown with MUST and SHOULD, the object specs, 36 vocabularies, fixtures, and an RFC process. The opentide package is the engine you pin: one package with the CLI, the Python SDK, the MCP server and seven platform adapters. The JSON Schema is generated from the same models as the code, so they cannot drift.
And your detection repository stays the source of truth. The spec does not ship detections; the package does not hold your YAML.`,
  `The object model is three objects answering three questions. A threat, or threat vector: what do we defend against? An objective: what are we trying to detect, decomposed into signals? A rule: how do we detect it, on which platform?
References point back: a rule's detection_model points at its objective, an objective lists the threats it covers. Coverage flows forward. That is the graph everything else in this talk stands on.`,
  `Here is one real chain, and we will reuse it later in the agent walkthrough. A threat: a Gunra ransomware intrusion from SOC Prime's Threat of the Month, mapped to T1190 and T1003 with its attack surface. An objective: credential access via LSASS, with a behavioural signal. A rule: LSASS memory access, with a Sentinel KQL and a Splunk SPL configuration, still in STAGING.
The links are UUIDs, highlighted here. Rename or move files freely; the graph holds. And note rule 1.1: it records when a human last reviewed it.`,
];

// ═════════════════════════════════════════════════════════════════════════════
// pages-b · end of chapter 02: signals · lifecycle · platforms · doors · ecosystem
// ═════════════════════════════════════════════════════════════════════════════

// Centre a child on (x, y) inside a positioned box (labels sitting on connectors).
const BAt = ({ x, y, children }: { x: number; y: number; children: ReactNode }) => (
  <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', zIndex: 2 }}>{children}</div>
);

// ─────────────────────────────────────────────────────────────────────────────
// 12 · THE SIGNAL IS THE UNIT OF COVERAGE
// ─────────────────────────────────────────────────────────────────────────────
// Diagram box is 1000 wide: three signal columns of 320 with 20 between
// (x 0 · 340 · 680, centres 160 · 500 · 840). Rows: objective 0–96,
// bus at 124, signals 152–284, implementations from 316.
const BObjNode = ({ x, w, name, uuid }: { x: number; w: number; name: string; uuid: string }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: 0,
      width: w,
      height: 96,
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      padding: '0 24px',
      borderRadius: 18,
      background: '#FFFFFF',
      border: `1.5px solid ${BLUE}`,
    }}
  >
    <div style={{ width: 56, height: 56, borderRadius: 14, background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
      <Icon name="objective" size={32} color="#FFFFFF" />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontFamily: MONO, fontSize: 17, color: C.dim }}>objective · {uuid}</span>
      <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1, color: INK, whiteSpace: 'nowrap' }}>{name}</span>
    </div>
  </div>
);

const BSignal = ({ x, name, missing }: { x: number; name: ReactNode; missing?: boolean }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: 152,
      width: 320,
      height: 132,
      padding: '17px 22px',
      borderRadius: 16,
      background: missing ? '#FDF5F6' : '#FFFFFF',
      border: `1.5px ${missing ? 'dashed' : 'solid'} ${missing ? C.red : C.line2}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}
  >
    <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: MONO, fontSize: 17, color: missing ? C.red : C.dim }}>
      <Icon name="signal" size={22} color={missing ? C.red : BLUE} />
      signal
    </span>
    <span style={{ fontSize: 25, fontWeight: 620, lineHeight: 1.22, letterSpacing: '-0.015em', color: INK }}>{name}</span>
  </div>
);

const BImpl = ({ x, y, label }: { x: number; y: number; label: string }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      height: 44,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0 16px 0 12px',
      borderRadius: 999,
      background: '#EEF1FA',
      border: `1.5px solid ${C.blueLine}`,
      fontFamily: MONO,
      fontSize: 18,
      color: BLUE,
      whiteSpace: 'nowrap',
    }}
  >
    <Icon name="rule" size={20} color={BLUE} />
    {label}
  </div>
);

const BGapNote = ({ x, y }: { x: number; y: number }) => (
  <div
    className="ot ot-fade"
    style={{
      position: 'absolute',
      left: x,
      top: y,
      padding: '11px 16px',
      borderRadius: 14,
      border: `1.5px dashed ${C.red}`,
      background: '#FDF5F6',
      fontFamily: MONO,
      fontSize: 17,
      lineHeight: 1.45,
      color: C.red,
      whiteSpace: 'nowrap',
      animationDelay: '0.9s',
    }}
  >
    gap: no rule
    <br />
    implements this signal
  </div>
);

const BErr = ({ children }: { children: ReactNode }) => (
  <Chip tone="warn">
    <Icon name="x" size={15} color={C.red} stroke={2.4} />
    {children}
  </Chip>
);

const B_COVERAGE = `{
  "technique": "T1003",
  "covered": true,
  "matched_techniques": ["T1003.001"],
  "rules": ["c8f282eb-0286-…",
            "6a1f3f4b-ac54-…"]
}`;

const Signals: Page = () => (
  <Frame chapter={['02', 'what opentide is']} source="opentide.org/docs/usage/concepts/object-model · opentide.org/docs/mcp/tools">
    <H>The signal is the unit of coverage.</H>
    <Lead maxWidth={1480}>
      Objectives decompose into signals, rules implement them, and coverage is a walk of the graph.
      <br />
      Gaps are visible, not guessed.
    </Lead>
    <div style={{ display: 'flex', gap: 80, marginTop: 40 }}>
      <div style={{ position: 'relative', width: 1000, height: 470, flex: '0 0 auto' }}>
        <svg width={1000} height={430} viewBox="0 0 1000 430" aria-hidden style={{ position: 'absolute', left: 0, top: 0 }}>
          <g fill="none" stroke={BLUE} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path className="ot ot-draw" pathLength={1} d="M500 96 V152" />
            <path className="ot ot-draw" pathLength={1} d="M160 152 V138 Q160 124 174 124 H826 Q840 124 840 138 V152" />
            <path className="ot ot-draw" pathLength={1} style={{ animationDelay: '0.5s' }} d="M30 284 V380 Q30 394 44 394 H56" />
            <path className="ot ot-draw" pathLength={1} style={{ animationDelay: '0.5s' }} d="M30 338 H56" />
            <path className="ot ot-draw" pathLength={1} style={{ animationDelay: '0.5s' }} d="M370 284 V324 Q370 338 384 338 H396" />
          </g>
          <path
            className="ot ot-fade"
            style={{ animationDelay: '0.9s' }}
            d="M710 284 V338 Q710 352 724 352 H736"
            fill="none"
            stroke={C.red}
            strokeWidth={2}
            strokeDasharray="5 6"
            strokeLinecap="round"
          />
        </svg>
        <BObjNode x={230} w={540} name="Credential access via LSASS" uuid="f8817f95-c43e-…" />
        <BSignal x={0} name="LSASS process access" />
        <BSignal x={340} name="MiniDump of LSASS written to disk" />
        <BSignal
          x={680}
          missing
          name={
            <>
              <M>comsvcs.dll</M> MiniDump via <M>rundll32</M>
            </>
          }
        />
        <BImpl x={56} y={316} label="Sentinel · KQL" />
        <BImpl x={56} y={372} label="Splunk · SPL" />
        <BImpl x={396} y={316} label="Defender · KQL" />
        <BGapNote x={736} y={316} />
        <div style={{ position: 'absolute', left: 0, top: 446, fontFamily: MONO, fontSize: 17, color: C.subtle }}>
          <span style={{ color: BLUE }}>rule.detection_model</span> → an objective uuid or a signal uuid · since 0.10
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Code
          variant="navy"
          lang="python"
          size={20}
          title={
            <>
              <Icon name="agent" size={18} color={NV.foam} /> MCP · coverage
            </>
          }
          tag="tool call"
          code={`coverage(technique="T1003")`}
          style={{ borderRadius: '14px 14px 0 0', borderBottom: 'none' }}
        />
        <Code variant="navy" lang="json" size={20} code={B_COVERAGE} style={{ borderRadius: '0 0 14px 14px', borderTop: `1px dashed ${NV.line}` }} />
        <Label style={{ marginTop: 28 }}>the same question, from the CLI</Label>
        <Code lang="bash" size={19} code="$ opentide info coverage --technique T1003" style={{ marginTop: 12 }} />
      </div>
    </div>
    <div style={{ marginTop: 'auto', paddingTop: 22, borderTop: `1px solid ${C.line}`, display: 'flex', alignItems: 'flex-end', gap: 56 }}>
      <span style={{ fontFamily: MONO, fontSize: 20, color: INK, paddingBottom: 7 }}>what the graph makes visible</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontFamily: MONO, fontSize: 17, color: C.subtle }}>validation errors</span>
        <div style={{ display: 'flex', gap: 10 }}>
          <BErr>orphan rule</BErr>
          <BErr>dangling reference</BErr>
          <BErr>duplicate UUID</BErr>
          <BErr>circular chain</BErr>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontFamily: MONO, fontSize: 17, color: C.subtle }}>valid, but a visible gap</span>
        <div style={{ display: 'flex' }}>
          <Chip tone="ghost">
            <Icon name="eye" size={16} color={C.dim} />
            coverage island
          </Chip>
        </div>
      </div>
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// 13 · ONE PIPELINE
// ─────────────────────────────────────────────────────────────────────────────
const BStage = ({ n, icon, title, cmd, body, next }: { n: string; icon: IconName; title: string; cmd: string; body: string; next?: boolean }) => (
  <div
    style={{
      position: 'relative',
      flex: '1 1 0',
      minWidth: 0,
      height: 324,
      borderRadius: 18,
      border: `1.5px solid ${C.line2}`,
      background: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div style={{ flex: 1, padding: '24px 24px 0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 34 }}>
        <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 600, color: ACC }}>{n}</span>
        <Icon name={icon} size={34} color={BLUE} />
      </div>
      <span style={{ marginTop: 24, fontSize: 38, fontWeight: 740, letterSpacing: '-0.03em', lineHeight: 1, color: INK }}>{title}</span>
      <span style={{ marginTop: 14, fontSize: 22, lineHeight: 1.42, color: C.muted }}>{body}</span>
    </div>
    <div
      style={{
        height: 52,
        display: 'flex',
        alignItems: 'center',
        padding: '0 14px',
        background: C.paper,
        borderTop: `1px solid ${C.line}`,
        borderRadius: '0 0 17px 17px',
        fontFamily: MONO,
        fontSize: 18,
        color: BLUE,
        whiteSpace: 'nowrap',
      }}
    >
      {cmd}
    </div>
    {next && (
      <div
        style={{
          position: 'absolute',
          right: -22,
          top: 26,
          width: 30,
          height: 30,
          borderRadius: 999,
          background: '#FFFFFF',
          border: `1.5px solid ${C.line2}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}
      >
        <Icon name="arrow" size={16} color={BLUE} stroke={2.2} />
      </div>
    )}
  </div>
);

const B_PILL: Record<'plain' | 'accent' | 'solid', CSSProperties> = {
  plain: { background: '#FFFFFF', border: `1.5px solid ${C.line2}`, color: INK },
  accent: { background: '#EEF1FA', border: `1.5px solid ${C.blueLine}`, color: BLUE },
  solid: { background: BLUE, border: `1.5px solid ${BLUE}`, color: '#FFFFFF' },
};

const BPill = ({ children, tone = 'plain' }: { children: ReactNode; tone?: 'plain' | 'accent' | 'solid' }) => (
  <span
    style={{
      flex: '0 0 auto',
      display: 'inline-flex',
      alignItems: 'center',
      height: 46,
      padding: '0 18px',
      borderRadius: 999,
      fontFamily: MONO,
      fontSize: 19,
      whiteSpace: 'nowrap',
      ...B_PILL[tone],
    }}
  >
    {children}
  </span>
);

const BArrow = () => (
  <span style={{ flex: '1 1 0', minWidth: 34, display: 'flex', alignItems: 'center', padding: '0 8px' }}>
    <span style={{ flex: 1, height: 2, background: BLUE, borderRadius: 2 }} />
    <svg width={9} height={14} viewBox="0 0 9 14" aria-hidden style={{ display: 'block', marginLeft: -2 }}>
      <path d="M1.5 1.5 L7.5 7 L1.5 12.5" fill="none" stroke={BLUE} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

// Dashed hand-off with a gate chip in the middle (used for the production lane).
const BGate = ({ children }: { children: ReactNode }) => (
  <span style={{ flex: '1 1 0', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 46, marginRight: 8 }}>
    <span style={{ position: 'absolute', left: 0, right: 4, top: 22, borderTop: `2px dashed ${C.blueLine}` }} />
    <svg width={9} height={14} viewBox="0 0 9 14" aria-hidden style={{ position: 'absolute', right: 0, top: 16, display: 'block' }}>
      <path d="M1.5 1.5 L7.5 7 L1.5 12.5" fill="none" stroke={BLUE} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span style={{ position: 'relative', padding: '0 14px', background: C.paper }}>
      <Chip>{children}</Chip>
    </span>
  </span>
);

const BLane = ({ icon, label, children }: { icon: IconName; label: string; children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <span style={{ width: 232, flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 19, color: C.muted }}>
      <Icon name={icon} size={24} color={BLUE} />
      {label}
    </span>
    {children}
  </div>
);

const Lifecycle: Page = () => (
  <Frame chapter={['02', 'what opentide is']} source="opentide.org/docs/usage/how-it-works · opentide.org/docs/cli">
    <H size={60} maxWidth={1680} style={{ whiteSpace: 'nowrap' }}>
      One pipeline: author, generate, validate, deploy, document.
    </H>
    <Lead>The commands you run on a laptop are the commands CI runs.</Lead>
    <div style={{ display: 'flex', gap: 14, marginTop: 44 }}>
      <BStage n="01" icon="editor" title="Author" cmd="objects/*.yaml" body="Threats, objectives and rules as YAML, from generated templates." next />
      <BStage n="02" icon="layers" title="Generate" cmd="opentide generate" body="Deterministic schemas, templates, vocabularies, snippets. Safe to commit." next />
      <BStage n="03" icon="check" title="Validate" cmd="opentide validate --strict" body="Schema, unique UUIDs, references, vocabularies. Exit 1 blocks the merge." next />
      <BStage n="04" icon="rocket" title="Deploy" cmd="opentide deploy" body="Per platform and tenant. Staging first, promotion behind approval." next />
      <BStage n="05" icon="book" title="Document" cmd="opentide generate docs" body="Wiki pages with chaining diagrams and ATT&CK coverage." />
    </div>
    <div
      style={{
        marginTop: 44,
        padding: '24px 30px 28px',
        borderRadius: 18,
        background: C.paper,
        border: `1px solid ${C.line}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 19, color: C.muted }}>
          <Icon name="flow" size={22} color={BLUE} />
          ci, generated by <span style={{ color: BLUE }}>opentide setup ci github|gitlab|azure</span>
        </span>
        <span style={{ fontFamily: MONO, fontSize: 17, color: C.dim }}>pins the opentide version you run</span>
      </div>
      <BLane icon="branch" label="pull request">
        <BPill>validate --strict</BPill>
        <BArrow />
        <BPill>lint --strict</BPill>
        <BArrow />
        <BPill>validate query --live</BPill>
        <BArrow />
        <BPill>generate</BPill>
        <BArrow />
        <BPill tone="accent">deploy --plan STAGING</BPill>
      </BLane>
      <BLane icon="merge" label="default branch">
        <BGate>
          <Icon name="lock" size={16} color={BLUE} />
          protected environment · separate approval
        </BGate>
        <BPill tone="solid">deploy --plan PRODUCTION</BPill>
      </BLane>
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// 14 · SEVEN PLATFORMS, HONEST ABOUT EACH
// ─────────────────────────────────────────────────────────────────────────────
const B_GRID = '470px 410px 250px 150px 1fr';

const BPlatHead = () => (
  <div style={{ display: 'grid', gridTemplateColumns: B_GRID, alignItems: 'center', padding: '0 20px 14px', fontFamily: MONO, fontSize: 18, color: C.dim }}>
    <span>platform</span>
    <span>--platform</span>
    <span>query language</span>
    <span>deploy</span>
    <span>tenant query check</span>
  </div>
);

const BPlatRow = ({ name, k, lang, live, last }: { name: string; k: string; lang: string; live?: boolean; last?: boolean }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: B_GRID,
      alignItems: 'center',
      height: 56,
      padding: '0 20px',
      borderTop: `1px solid ${C.line}`,
      borderBottom: last ? `1px solid ${C.line}` : undefined,
      background: live ? undefined : '#FDF5F6',
    }}
  >
    <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.015em', color: INK }}>{name}</span>
    <span style={{ fontFamily: MONO, fontSize: 21, color: BLUE }}>{k}</span>
    <span style={{ fontSize: 24, color: live ? C.muted : C.dim }}>{lang}</span>
    <Icon name="check" size={28} color={BLUE} stroke={2.2} />
    {live ? (
      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Icon name="check" size={28} color={BLUE} stroke={2.2} />
        <span style={{ fontFamily: MONO, fontSize: 20, color: BLUE }}>--live</span>
      </span>
    ) : (
      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Icon name="x" size={26} color={C.red} stroke={2.2} />
        <span style={{ fontFamily: MONO, fontSize: 20, color: C.red }}>supported: false</span>
      </span>
    )}
  </div>
);

const B_CS_JSON = `{ "platform": "crowdstrike", "valid": null, "supported": false,
  "ok": false, "status": "failed",
  "message": "query validation not supported for crowdstrike" }`;

const B_MARK_HONEST: CodeMark = { t: '"supported": false', bg: 'rgba(255,148,148,0.14)', fg: NV.bad };

const Platforms: Page = () => (
  <Frame chapter={['02', 'what opentide is']} source="opentide.org/docs/usage/concepts/platforms">
    <H>One model. Seven platforms. No rewrites.</H>
    <div style={{ marginTop: 40 }}>
      <BPlatHead />
      <BPlatRow name="Microsoft Sentinel" k="sentinel" lang="KQL" live />
      <BPlatRow name="Defender for Endpoint" k="defender_for_endpoint" lang="KQL" live />
      <BPlatRow name="Splunk Enterprise Security" k="splunk" lang="SPL" live />
      <BPlatRow name="SentinelOne" k="sentinel_one" lang="S1QL" live />
      <BPlatRow name="Carbon Black Cloud" k="carbon_black_cloud" lang="Lucene" live />
      <BPlatRow name="CrowdStrike Falcon" k="crowdstrike" lang="—" />
      <BPlatRow name="HarfangLab" k="harfanglab" lang="—" last />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 56, marginTop: 30 }}>
      <p style={{ margin: 0, width: 720, flex: '0 0 auto', fontSize: 28, lineHeight: 1.42, color: C.muted, letterSpacing: '-0.01em' }}>
        Five platforms get a live query check in CI. CrowdStrike and HarfangLab are <span style={{ color: ACC, fontWeight: 600 }}>deploy-only today</span>,
        and flagged as such.
      </p>
      <Code
        variant="navy"
        lang="json"
        size={19}
        lh={1.5}
        title={
          <>
            <Icon name="terminal" size={18} color={NV.foam} /> validate query --platform crowdstrike
          </>
        }
        tag="--json"
        marks={[B_MARK_HONEST]}
        code={B_CS_JSON}
        style={{ flex: 1, minWidth: 0 }}
      />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 26 }}>
      <Label style={{ marginRight: 8 }}>next</Label>
      <Chip tone="ghost">Elastic Security · RFC 0007, accepted</Chip>
      <Chip tone="ghost">Sysdig Secure + Falco · RFC 0004, draft</Chip>
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// 15 · THREE DOORS, ONE ENGINE
// ─────────────────────────────────────────────────────────────────────────────
// The same rule id, tinted in all three doors.
const B_MARK_RULE: CodeMark = { t: 'c8f282eb-…', bg: C.tint, fg: BLUE };

// Paper code block in the house style, with one extra: an indented `--flag`
// line in bash is a continuation of the command above, not output.
const BCode = ({ code, lang, title, size = 20, lh = 1.55, marks }: { code: string; lang: Lang; title: ReactNode; size?: number; lh?: number; marks?: CodeMark[] }) => {
  const tone = TONE.paper;
  const s = SURF.paper;
  const lines = code.split('\n');
  return (
    <div style={{ flex: 1, background: s.bg, border: `1px solid ${s.line}`, borderRadius: 14, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '11px 18px',
          background: s.head,
          borderBottom: `1px solid ${s.line}`,
          borderRadius: '14px 14px 0 0',
          fontFamily: MONO,
          fontSize: 16,
          color: s.title,
        }}
      >
        {title}
      </div>
      <div style={{ padding: '16px 20px', fontFamily: MONO, fontSize: size, lineHeight: lh, whiteSpace: 'pre', color: tone.fg, letterSpacing: 0 }}>
        {lines.map((l, i) => (
          <div key={i} style={{ minHeight: `${lh}em` }}>
            {lang === 'bash' && /^\s+--/.test(l) ? withMarks(l, 'bash', tone, tone.fg, marks, `c${i}`) : renderLine(l, lang, tone, marks, `l${i}`)}
          </div>
        ))}
      </div>
    </div>
  );
};

const BDoor = ({ icon, name, who, children }: { icon: IconName; name: string; who: string; children: ReactNode }) => (
  <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <div style={{ width: 60, height: 60, borderRadius: 16, background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
        <Icon name={icon} size={34} color="#FFFFFF" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 38, fontWeight: 760, letterSpacing: '-0.03em', lineHeight: 1, color: INK }}>{name}</span>
        <span style={{ fontSize: 22, color: C.muted }}>{who}</span>
      </div>
    </div>
    <div style={{ marginTop: 22, flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</div>
  </div>
);

const ThreeDoors: Page = () => (
  <Frame chapter={['02', 'what opentide is']} source="opentide.org/docs/usage/choosing-an-interface">
    <H>Three doors, one engine.</H>
    <Lead maxWidth={1680}>The CLI, the Python SDK and the MCP server share one object model, one validator, one deployer.</Lead>
    <div style={{ display: 'flex', gap: 36, marginTop: 44 }}>
      <BDoor icon="terminal" name="CLI" who="humans and CI pipelines">
        <BCode
          lang="bash"
          title="terminal"
          marks={[B_MARK_RULE]}
          size={21}
          code={`$ opentide validate \\
    --uuid c8f282eb-… --strict
# exit 0 success · 1 error · 2 usage`}
        />
      </BDoor>
      <BDoor icon="python" name="SDK" who="Python tools and tests">
        <BCode
          lang="python"
          title="python"
          marks={[B_MARK_RULE]}
          size={21}
          code={`from opentide import OpenTide
OpenTide.initialise()
rule = OpenTide.Rules["c8f282eb-…"]
result = rule.validate()
print(result.ok, result.errors)`}
        />
      </BDoor>
      <BDoor icon="agent" name="MCP" who="AI agents in the editor">
        <BCode
          lang="python"
          title="tool call"
          marks={[B_MARK_RULE]}
          size={21}
          code={`validation_report(uuid="c8f282eb-…")
# returns a structured issue list`}
        />
      </BDoor>
    </div>
    <svg width={1680} height={92} viewBox="0 0 1680 92" aria-hidden style={{ display: 'block' }}>
      <g fill="none" stroke={BLUE} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path className="ot ot-draw" pathLength={1} d="M269 0 C269 52 720 38 720 88 M711 78 L720 89 L729 78" />
        <path className="ot ot-draw" pathLength={1} d="M840 0 V88 M831 78 L840 89 L849 78" />
        <path className="ot ot-draw" pathLength={1} d="M1411 0 C1411 52 960 38 960 88 M951 78 L960 89 L969 78" />
      </g>
    </svg>
    <div style={{ marginTop: 2, height: 128, borderRadius: 20, background: BLUE, display: 'flex', alignItems: 'center', gap: 28, padding: '0 44px', color: '#FFFFFF' }}>
      <TideMark size={64} bg="#FFFFFF" fg={BLUE} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span style={{ fontSize: 42, fontWeight: 760, letterSpacing: '-0.03em', lineHeight: 1 }}>opentide engine</span>
        <span style={{ fontFamily: MONO, fontSize: 20, color: 'rgba(255,255,255,0.84)' }}>objects · validate · generate · deploy · document · 7 platform adapters</span>
      </div>
      <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 18, color: 'rgba(255,255,255,0.72)' }}>one package · pip install opentide</span>
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// 16 · EACH REPOSITORY HAS ONE JOB
// ─────────────────────────────────────────────────────────────────────────────
// Map box 1680 × 670. Cards 540 × 170 at x 0 · 570 · 1140, rows y 0 and 500.
// Hub 480 × 150 at (600, 260). Coming pair 430 × 112 flanks the hub.
const BSat = ({ x, y, icon, name, role, line, meta }: { x: number; y: number; icon: IconName; name: string; role: string; line: string; meta: string }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: 540,
      height: 170,
      padding: '22px 26px',
      borderRadius: 18,
      background: '#FFFFFF',
      border: `1.5px solid ${C.line2}`,
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: C.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
        <Icon name={icon} size={28} color={BLUE} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 30, fontWeight: 720, letterSpacing: '-0.025em', lineHeight: 1, color: INK }}>{name}</span>
        <span style={{ fontFamily: MONO, fontSize: 18, color: ACC }}>{role}</span>
      </div>
    </div>
    <span style={{ marginTop: 16, fontSize: 21, lineHeight: 1.3, color: INK, whiteSpace: 'nowrap' }}>{line}</span>
    <span style={{ marginTop: 6, fontFamily: MONO, fontSize: 17, color: C.dim, whiteSpace: 'nowrap' }}>{meta}</span>
  </div>
);

const BSoon = ({ x, name, sub }: { x: number; name: string; sub: string }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: 279,
      width: 430,
      height: 112,
      padding: '0 26px',
      borderRadius: 16,
      border: `1.5px dashed ${C.line2}`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 10,
    }}
  >
    <span style={{ fontSize: 26, fontWeight: 680, letterSpacing: '-0.02em', lineHeight: 1, color: C.muted }}>{name}</span>
    <span style={{ fontFamily: MONO, fontSize: 17, color: C.subtle }}>{sub}</span>
  </div>
);

const BRel = ({ x, y, children }: { x: number; y: number; children: ReactNode }) => (
  <BAt x={x} y={y}>
    <Chip size={17}>{children}</Chip>
  </BAt>
);

const Ecosystem: Page = () => (
  <Frame chapter={['02', 'what opentide is']} source="github.com/OpenTideHQ">
    <H>Each repository has one job.</H>
    <div style={{ position: 'relative', width: 1680, height: 670, marginTop: 40 }}>
      <svg width={1680} height={670} viewBox="0 0 1680 670" aria-hidden style={{ position: 'absolute', left: 0, top: 0 }}>
        <g fill="none" stroke={BLUE} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path className="ot ot-draw" pathLength={1} d="M720 260 C720 214 270 216 270 171 M262 180 L270 171 L278 180" />
          <path className="ot ot-draw" pathLength={1} d="M840 260 V171 M832 180 L840 171 L848 180" />
          <path className="ot ot-draw" pathLength={1} d="M960 260 C960 214 1410 216 1410 171 M1402 180 L1410 171 L1418 180" />
          <path className="ot ot-draw" pathLength={1} d="M720 410 C720 456 270 454 270 499 M262 490 L270 499 L278 490" />
          <path className="ot ot-draw" pathLength={1} d="M840 410 V499 M832 490 L840 499 L848 490" />
          <path className="ot ot-draw" pathLength={1} d="M1410 499 C1410 454 960 456 960 411 M952 420 L960 411 L968 420" />
        </g>
        <g fill="none" stroke={C.line2} strokeWidth={2} strokeDasharray="6 7" strokeLinecap="round">
          <path d="M600 335 H430" />
          <path d="M1080 335 H1250" />
        </g>
      </svg>
      <BSat x={0} y={0} icon="archive" name="library" role="the content" line="246 threats · 11 objectives · 8 rules" meta="TLP:CLEAR · CC-BY-SA-4.0" />
      <BSat x={570} y={0} icon="doc" name="specifications" role="the contract" line="Normative specs, 36 vocabularies, RFCs" meta="CC-BY-4.0" />
      <BSat x={1140} y={0} icon="graph" name="explorer" role="the UI" line="Browse threats, objectives, signals, rules, chains" meta="opentidehq.github.io/library" />
      <BSat x={0} y={500} icon="agent" name="skills" role="the agent brain" line="27 agent skills for detection engineering" meta="Claude Code · Cursor · Codex · Copilot · Kiro" />
      <BSat x={570} y={500} icon="branch" name="your detection repo" role="your content" line="Private objects, configurations and CI" meta="the source of truth, in git" />
      <BSat x={1140} y={500} icon="globe" name="opentide.org" role="the docs" line="Usage, CLI, MCP, SDK, specs, blog" meta="OpenTideHQ/website" />
      <BSoon x={0} name="language-server" sub="Rust · KQL, SPL, Tide YAML" />
      <BSoon x={1250} name="vscode-extension" sub="VS Code · editor onboarding" />
      <div
        style={{
          position: 'absolute',
          left: 600,
          top: 260,
          width: 480,
          height: 150,
          borderRadius: 20,
          background: BLUE,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          color: '#FFFFFF',
        }}
      >
        <TideMark size={66} bg="#FFFFFF" fg={BLUE} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontFamily: MONO, fontSize: 17, color: 'rgba(255,255,255,0.72)' }}>the engine</span>
          <span style={{ fontSize: 46, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1 }}>opentide</span>
          <span style={{ fontFamily: MONO, fontSize: 19, color: 'rgba(255,255,255,0.88)' }}>CLI · SDK · MCP</span>
        </div>
      </div>
      <BRel x={495} y={215}>validates</BRel>
      <BRel x={840} y={215}>implements</BRel>
      <BRel x={1185} y={215}>builds</BRel>
      <BRel x={495} y={455}>installs</BRel>
      <BRel x={840} y={455}>runs against</BRel>
      <BRel x={1185} y={455}>documents</BRel>
      <BAt x={515} y={335}>
        <Chip tone="ghost" size={17} style={{ background: '#FFFFFF' }}>
          coming
        </Chip>
      </BAt>
      <BAt x={1165} y={335}>
        <Chip tone="ghost" size={17} style={{ background: '#FFFFFF' }}>
          coming
        </Chip>
      </BAt>
    </div>
  </Frame>
);

const PAGES_B: Page[] = [Signals, Lifecycle, Platforms, ThreeDoors, Ecosystem];

const NOTES_B: string[] = [
  `The unit of coverage is the signal: one objective, credential access via LSASS, breaks down into three observable signals.
The first is implemented in Sentinel and Splunk, the second in Defender, and the third has no rule, so the graph shows a gap instead of hiding it.
Ask the MCP server about T1003 and it answers covered, through T1003.001: true at technique level, and exactly why a heatmap flatters.
The same graph lets validate catch orphan rules, dangling references, duplicate UUIDs and circular chains, while a coverage island, a threat no objective covers, is valid but visible.
Next: how these objects travel from YAML to production.`,
  `Every object goes through the same five stages: author, generate, validate, deploy, document.
generate writes schemas, templates, vocabularies and snippets deterministically, so they are safe to commit, and validate --strict exits 1 on any schema, UUID, reference or vocabulary problem, which blocks the merge.
deploy goes per platform and tenant, staging first, and generate docs writes the wiki with chaining diagrams and ATT&CK coverage.
You do not hand-write the pipeline: opentide setup ci generates it for GitHub, GitLab or Azure, pinned to the version you run, and production deploys from a protected environment with its own approval.
Next: what sits behind deploy.`,
  `One rule object deploys to seven platforms.
For five of them opentide checks the query against your tenant. Since 0.11 that is the only query check: you pass --live, or the command refuses.
CrowdStrike and HarfangLab deploy, but opentide cannot check their queries, so they are flagged as deploy-only, in the JSON and in our agent guardrails.
Elastic Security is next, with RFC 0007 accepted, and Sysdig with Falco is in draft. Next: the three ways in.`,
  `There are three ways into opentide and one engine behind them.
Humans and CI use the CLI, Python tools and tests use the SDK, and agents in the editor use the MCP server.
All three run the same validator on the same rule, and get back an exit code, a typed result or a structured issue list.
So an agent never gets a softer answer than your CI does. Next: the repositories around that engine.`,
  `The project is split so that each repository has one job.
specifications is the contract, under CC-BY-4.0, with 36 vocabularies and an RFC process. library is shared content, 246 threats, 11 objectives and 8 rules at TLP:CLEAR, and explorer is the UI to browse it.
skills ships 27 agent skills for Claude Code, Cursor, Codex, Copilot and Kiro, opentide.org documents it all, and the engine runs against your own detection repo, which stays yours.
Coming next: a Rust language server for KQL, SPL and Tide YAML, and a VS Code extension. That is what opentide is; now, why we re-released it.`,
];

// ═════════════════════════════════════════════════════════════════════════════
// CHAPTER 03 · WHY WE RE-RELEASED IT
// ═════════════════════════════════════════════════════════════════════════════

// Multi-segment terminal window (navy): mixes bash + json bodies in one frame.
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
// DIVIDER — WHY WE RE-RELEASED IT
// ─────────────────────────────────────────────────────────────────────────────
const DividerWhyNow: Page = () => (
  <Divider
    n="03"
    chapter="why we re-released it"
    title="Why we re-released it"
    sub="Years in production as a git submodule. Now a versioned CLI on PyPI, with the ergonomics humans and agents both need."
    fill={0.36}
    seed={0.44}
    text={Q_WHYNOW}
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// HERITAGE — battle-hardened before it was a package
// ─────────────────────────────────────────────────────────────────────────────
const CEvent = ({ date, title, body, last, hot }: { date: string; title: string; body: string; last?: boolean; hot?: boolean }) => (
  <div style={{ display: 'flex', gap: 26 }}>
    <div style={{ width: 22, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ width: 18, height: 18, borderRadius: 999, marginTop: 6, background: hot ? BLUE : '#FFFFFF', border: `3px solid ${BLUE}`, flex: '0 0 auto' }} />
      {!last && <span style={{ flex: 1, width: 2, background: C.line2, marginTop: 6 }} />}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingBottom: last ? 0 : 30 }}>
      <span style={{ fontFamily: MONO, fontSize: 19, color: ACC, fontWeight: 600 }}>{date}</span>
      <span style={{ fontSize: 30, fontWeight: 680, letterSpacing: '-0.02em', color: INK, lineHeight: 1.15 }}>{title}</span>
      <span style={{ fontSize: 23, lineHeight: 1.4, color: C.muted }}>{body}</span>
    </div>
  </div>
);

const Heritage: Page = () => (
  <Frame chapter={['03', 'why we re-released it']} source="CoreTide README · CoreTide#60 · opentide @ FIRST CTI 2026 · pypi.org/project/opentide">
    <H>Battle-hardened before it was a package.</H>
    <div style={{ display: 'flex', gap: 90, marginTop: 46 }}>
      <div style={{ flex: 1 }}>
        <Label style={{ marginBottom: 22 }}>years in production · CoreTide</Label>
        <CEvent date="2023 · Hack.lu" title="TIDeMEC, homegrown at the EC" body="A detection engineering platform built inside the European Commission CSOC." />
        <CEvent date="2024 · FIRST TC Amsterdam" title="The first OpenTIDE project" body="CoreTIDE presented as the backbone of a family of tools." />
        <CEvent date="Feb 2025 · open source" title="CoreTide on GitHub, EUPL-1.2" body="Published after more than two years in production." />
        <CEvent date="Mar 2026 · FIRST CTI" title="AgenTide" body="6 agent pull requests, 30+ objects, about 15 minutes each." last />
      </div>
      <div style={{ flex: 1 }}>
        <Label style={{ marginBottom: 22 }}>the re-release · opentide</Label>
        <CEvent date="13 Apr 2026 · CoreTide#60" title="Project TideKit" body="The plan: turn CoreTide into a versioned Python package with a CLI." />
        <CEvent date="16 Jun 2026 · CERT-EU AI workshop" title="Harness over query" body="The query is a commodity; harness and intent are the differentiator." />
        <CEvent date="22 Jun 2026 · new repository" title="opentide, phases 0 to 9 on day one" body="Executed by an agent fleet, reviewed and merged the same day." hot />
        <CEvent date="9 Sep → 7 Oct 2026 · PyPI" title="0.1.0, then 0.11.0" body="Six repositories archived. 26 releases in four weeks." hot last />
      </div>
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// THE BACKLOG MADE THE CASE — real issues, quoted
// ─────────────────────────────────────────────────────────────────────────────
const CIssue = ({ id, date, title, quote, pain }: { id: string; date: string; title: string; quote: string; pain: string }) => (
  <div style={{ width: 540, height: 262, borderRadius: 16, border: `1.5px solid ${C.line2}`, background: '#FFFFFF', padding: '22px 26px', display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden style={{ flex: '0 0 auto' }}>
        <circle cx="10" cy="10" r="8" fill="none" stroke={BLUE} strokeWidth="2" />
        <circle cx="10" cy="10" r="2.6" fill={BLUE} />
      </svg>
      <span style={{ fontFamily: MONO, fontSize: 19, color: BLUE, fontWeight: 600 }}>{id}</span>
      <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 16, color: C.dim }}>{date}</span>
    </div>
    <span style={{ marginTop: 14, fontSize: 24, fontWeight: 650, letterSpacing: '-0.015em', color: INK, whiteSpace: 'nowrap' }}>{title}</span>
    <span style={{ marginTop: 10, fontSize: 22, lineHeight: 1.4, color: C.muted }}>{quote}</span>
    <span style={{ marginTop: 'auto' }}>
      <Chip tone="warn" size={16}>{pain}</Chip>
    </span>
  </div>
);

const Backlog: Page = () => (
  <Frame chapter={['03', 'why we re-released it']} source="github.com/OpenTideHQ/CoreTide/issues · github.com/OpenTideHQ/InitTide/issues">
    <H>Our own issue tracker made the case.</H>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 540px)', justifyContent: 'space-between', rowGap: 24, marginTop: 40 }}>
      <CIssue id="CoreTide#3" date="2025-04-03" title="Error when running file_name.py" quote="“Looks like commit 9ef7a58 introduced a new bug.” Client CI pulled the engine at run time." pain="upgrades not pinned" />
      <CIssue id="InitTide#5" date="2025-03-14" title="Invalid .gitlab-ci.yml" quote="“Includes tide_remote.yml from CoreTide … which in turn includes some more files.”" pain="fragile CI glue" />
      <CIssue id="InitTide#12" date="2026-01-01" title="Sample Detection Rule does not pass…" quote="Expected behaviour, “but it can be (understandably) confusing for newcomers”." pain="day-one onboarding" />
      <CIssue id="CoreTide#61" date="2026-06-22" title="Phase 0: baseline the engine" quote="“python Orchestration/validate.py fails outside CI.”" pain="scripts only ran in CI" />
      <CIssue id="CoreTide#65" date="2026-04-13" title="Phase 4: Pydantic code-first" quote="A “triple-maintenance data framework”: YAML metaschemas, dataclasses, manual conversion." pain="schema drift" />
      <CIssue id="CoreTide#71" date="2026-04-13" title="Phase 9: testing suite" quote="“Zero unit tests: validation is entirely pipeline-driven.”" pain="no tests" />
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginTop: 'auto', paddingTop: 24, borderTop: `1px solid ${C.line}` }}>
      <span style={{ fontSize: 33, fontWeight: 650, letterSpacing: '-0.02em', color: INK, lineHeight: 1.25 }}>
        “Consumed as a git submodule with <M color={BLUE}>sys.path.append()</M> hacks, a 1,546-line monolith entry point.”
      </span>
      <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 17, color: C.dim, whiteSpace: 'nowrap' }}>CoreTide#60</span>
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// THE SUBMODULE — before / after
// ─────────────────────────────────────────────────────────────────────────────
const C_BEFORE_PY = `import sys, git
sys.path.append(str(git.Repo(".",
    search_parent_directories=True).working_dir))
from Engines.modules.tide import DataTide
from Engines.modules.plugins import DeployTide

rule = DataTide.Models.mdr[uuid]
DeployTide.mdr["sentinel"].deploy(...)`;
const C_BEFORE_SH = `$ git submodule update --init --recursive
$ python Orchestration/validate.py`;
const C_AFTER_PY = `from opentide import OpenTide

OpenTide.initialise()
rule = OpenTide.Rules[uuid]
rule.deploy("sentinel")`;
const C_AFTER_SH = `$ pip install 'opentide==0.11.0'
$ opentide validate --strict
$ opentide deploy --platform sentinel --dry-run`;

const CSideHead = ({ tone, title, sub }: { tone: 'before' | 'after'; title: string; sub: string }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 16 }}>
    <Chip tone={tone === 'before' ? 'warn' : 'solid'}>{tone}</Chip>
    <span style={{ fontSize: 30, fontWeight: 680, letterSpacing: '-0.02em', color: INK }}>{title}</span>
    <span style={{ fontFamily: MONO, fontSize: 18, color: C.dim }}>{sub}</span>
  </div>
);

const CPain = ({ was, now }: { was: ReactNode; now: ReactNode }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: '18px 0', borderTop: `1px solid ${C.line}` }}>
    <span style={{ fontSize: 24, color: C.muted, textDecoration: 'line-through', textDecorationColor: 'rgba(198,47,63,0.6)' }}>{was}</span>
    <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 26, fontWeight: 620, color: INK }}>
      <Icon name="arrow" size={22} color={BLUE} />
      {now}
    </span>
  </div>
);

const Submodule: Page = () => (
  <Frame chapter={['03', 'why we re-released it']} source="CoreTide#3 · CoreTide#60 · CoreTide#61 · InitTide#5 · opentide.org/blog/the-next-step-for-opentide">
    <H>The engine lived inside your repo. That had to change.</H>
    <div style={{ display: 'flex', gap: 40, marginTop: 40 }}>
      <div style={{ flex: 1 }}>
        <CSideHead tone="before" title="CoreTide inside your repo" sub="submodule, or cloned at CI time" />
        <Code lang="python" size={19} lh={1.5} code={C_BEFORE_PY} title="Orchestration/*.py" />
        <Code lang="bash" size={19} lh={1.5} code={C_BEFORE_SH} style={{ marginTop: 12 }} />
      </div>
      <div style={{ flex: 1 }}>
        <CSideHead tone="after" title="opentide as a package" sub="pinned by version" />
        <Code lang="python" size={19} lh={1.5} code={C_AFTER_PY} title="any script, any tool" style={{ minHeight: 0 }} />
        <Code lang="bash" size={19} lh={1.5} code={C_AFTER_SH} style={{ marginTop: 12 }} />
      </div>
    </div>
    <div style={{ display: 'flex', gap: 40, marginTop: 30 }}>
      <CPain was="CI pulled the engine at run time. One upstream commit broke pipelines." now={<>Pin <M color={BLUE}>opentide==0.11.0</M></>} />
      <CPain was="Seven Orchestration scripts, no CLI, and they only ran in CI." now={<>One entry point: <M color={BLUE}>opentide</M></>} />
      <CPain was="CI glue through remote includes, broken by GitLab quirks." now={<><M color={BLUE}>opentide setup ci</M> generates it</>} />
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// THE PLAN — Project TideKit (CoreTide#60), as a decision record
// ─────────────────────────────────────────────────────────────────────────────
const CDecision = ({ n, title, why, refs }: { n: string; title: string; why: ReactNode; refs: string }) => (
  <div style={{ width: 540, height: 196, borderRadius: 16, border: `1.5px solid ${C.line2}`, background: '#FFFFFF', padding: '22px 26px', display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontFamily: MONO, fontSize: 18, color: '#FFFFFF', background: BLUE, borderRadius: 6, padding: '3px 8px' }}>{n}</span>
      <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 16, color: C.dim }}>{refs}</span>
    </div>
    <span style={{ marginTop: 16, fontSize: 27, fontWeight: 700, letterSpacing: '-0.02em', color: INK, lineHeight: 1.15 }}>{title}</span>
    <span style={{ marginTop: 10, fontSize: 22, lineHeight: 1.4, color: C.muted }}>{why}</span>
  </div>
);

const TideKit: Page = () => (
  <Frame chapter={['03', 'why we re-released it']} source="CoreTide#60 · CoreTide#67 · opentide#64 · #28 · #104 · #107">
    <H>The plan, written down in April: Project TideKit.</H>
    <Lead>“A versioned Python package on PyPI with a CLI, MCP server, and clean API surface.”</Lead>
    <Label style={{ marginTop: 10, fontSize: 18, color: C.dim }}>CoreTide#60 · Project TideKit · 13 April 2026</Label>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 540px)', justifyContent: 'space-between', rowGap: 24, marginTop: 30 }}>
      <CDecision n="01" title="New repository, not a rewrite in place" why="Every pinned submodule and clone keeps working while instances migrate." refs="CoreTide#60" />
      <CDecision n="02" title="A registry, not an orchestrator" why="The SDK holds the objects. The CLI owns CI context and exit codes." refs="CoreTide#60" />
      <CDecision n="03" title="One entry point for everything" why="“Every operation … accessible from a single entry point.”" refs="CoreTide#67" />
      <CDecision n="04" title="Platforms are repo config" why="Enabled per repository by setup, not picked at install time." refs="opentide#107" />
      <CDecision n="05" title="Onboarding is a command" why={<><M color={BLUE}>setup</M> replaces the template; CI is generated, not copied.</>} refs="opentide#64 · #28" />
      <CDecision n="06" title="No generic migrate command" why="Migration is an agent prompt and a diff a human reviews." refs="opentide#104" />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 'auto', paddingTop: 22, borderTop: `1px solid ${C.line}`, fontSize: 26, color: C.muted }}>
      <Icon name="agent" size={30} color={BLUE} />
      <span>
        Designed “to be executed by an autonomous agentic fleet”: <span style={{ color: INK, fontWeight: 620 }}>phases 0 to 9 merged on 22 June, the day the repository was created.</span>
      </span>
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// WHY A CLI — ergonomics, row by row (refined with the backlog research)
// ─────────────────────────────────────────────────────────────────────────────
const ERGO_COLS = '270px 520px 1fr 190px';
const CErgo = ({ icon, dim, before, after, refs }: { icon: IconName; dim: string; before: ReactNode; after: ReactNode; refs: string }) => (
  <div style={{ display: 'grid', gridTemplateColumns: ERGO_COLS, gap: 26, alignItems: 'center', padding: '13px 0', borderTop: `1px solid ${C.line}` }}>
    <span style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 25, fontWeight: 650, color: INK }}>
      <Icon name={icon} size={27} color={BLUE} />
      {dim}
    </span>
    <span style={{ fontSize: 22, color: C.subtle, lineHeight: 1.35 }}>{before}</span>
    <span style={{ fontSize: 22, color: INK, lineHeight: 1.35 }}>{after}</span>
    <span style={{ fontFamily: MONO, fontSize: 16, color: C.dim, textAlign: 'right' }}>{refs}</span>
  </div>
);

const WhyCLI: Page = () => (
  <Frame chapter={['03', 'why we re-released it']} source="issue and PR backlogs: OpenTideHQ/CoreTide, InitTide, opentide (#n = opentide)">
    <H>One tool on your PATH, not scripts in your tree.</H>
    <Lead>Why a CLI and not just a library: ergonomics is where adoption lives, for people and for agents.</Lead>
    <div style={{ marginTop: 30 }}>
      <div style={{ display: 'grid', gridTemplateColumns: ERGO_COLS, gap: 26, paddingBottom: 10, fontFamily: MONO, fontSize: 18 }}>
        <span style={{ color: C.dim }}>ergonomics</span>
        <span style={{ color: C.dim }}>submodule era</span>
        <span style={{ color: ACC }}>opentide CLI</span>
        <span style={{ color: C.dim, textAlign: 'right' }}>evidence</span>
      </div>
      <CErgo icon="package" dim="Install" before="Clone, init the submodule, patch sys.path" after={<><M color={BLUE}>pip install opentide</M>, Python 3.10–3.14</>} refs="CoreTide#60" />
      <CErgo icon="branch" dim="Upgrade" before="CI pulled whatever the engine was today" after="Pin a version, read the CHANGELOG" refs="CoreTide#3" />
      <CErgo icon="flow" dim="Onboard" before="Copy a template; the sample rule failed" after={<><M color={BLUE}>opentide setup</M>: wizard or scripted flags</>} refs="InitTide#12 · #64" />
      <CErgo icon="terminal" dim="Operate" before="Seven scripts that only ran in CI" after={<>One command tree, <M color={BLUE}>--help</M> in 0.2 s, completion</>} refs="CoreTide#61 · #142" />
      <CErgo icon="engine" dim="Automate" before="Remote CI includes, GitLab quirks" after={<><M color={BLUE}>setup ci</M> for GitHub, GitLab, Azure</>} refs="InitTide#5 · #28" />
      <CErgo icon="check" dim="Read results" before="Logs, plus a legacy exit code 19" after={<><M color={BLUE}>--json</M>, exit codes 0 · 1 · 2, file:line</>} refs="#135 · #139" />
      <CErgo icon="globe" dim="Run anywhere" before="Assumed a CI runner" after="Smoke-tested on Linux, macOS, Windows" refs="#140 · #141" />
      <CErgo icon="agent" dim="Work with agents" before="Agents shell out and guess" after={<>MCP server and skills, wired by <M color={BLUE}>setup</M></>} refs="CoreTide#68 · #59" />
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// SIX REPOSITORIES ARCHIVED → ONE STACK
// ─────────────────────────────────────────────────────────────────────────────
const COld = ({ name, role }: { name: string; role: string }) => (
  <div style={{ width: 560, height: 82, display: 'flex', alignItems: 'center', gap: 18, padding: '0 24px', borderRadius: 14, border: `1px dashed ${C.line2}`, background: C.paper }}>
    <Icon name="archive" size={26} color={C.dim} />
    <span style={{ fontFamily: MONO, fontSize: 22, color: C.subtle, textDecoration: 'line-through', textDecorationColor: C.dim }}>{name}</span>
    <span style={{ marginLeft: 'auto', fontSize: 21, color: C.dim }}>{role}</span>
  </div>
);
const CNew = ({ name, role, coming }: { name: string; role: string; coming?: boolean }) => (
  <div style={{ flex: 1, height: 82, display: 'flex', alignItems: 'center', gap: 18, padding: '0 24px', borderRadius: 14, border: `1.5px ${coming ? 'dashed' : 'solid'} ${coming ? C.blueLine : BLUE}`, background: coming ? '#FFFFFF' : '#F2F4FB' }}>
    <span style={{ fontFamily: MONO, fontSize: 23, color: BLUE, fontWeight: 600 }}>{name}</span>
    <span style={{ marginLeft: 'auto', fontSize: 21, color: C.muted }}>{role}</span>
    {coming && <Chip tone="ghost" size={16}>coming</Chip>}
  </div>
);
const CMove = ({ from, fromRole, to, toRole, coming }: { from: string; fromRole: string; to: string; toRole: string; coming?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
    <COld name={from} role={fromRole} />
    <svg width="64" height="24" viewBox="0 0 64 24" aria-hidden style={{ flex: '0 0 auto' }}>
      <path d="M2 12 H58 M50 4 L60 12 L50 20" stroke={BLUE} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <CNew name={to} role={toRole} coming={coming} />
  </div>
);

const Archived: Page = () => (
  <Frame chapter={['03', 'why we re-released it']} source="github.com/OpenTideHQ · archived 9 September 2026">
    <H>Six repositories archived. One coherent stack.</H>
    <Lead>History stays. Pinned submodule SHAs keep resolving. New work goes into the package.</Lead>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 36 }}>
      <CMove from="CoreTide" fromRole="engine as a submodule" to="opentide" toRole="CLI · SDK · MCP on PyPI" />
      <CMove from="InitTide" fromRole="template repository" to="opentide setup" toRole="repo, CI, MCP, skills" />
      <CMove from="ShareTide" fromRole="shared public objects" to="library" toRole="246 threats · 11 objectives · 8 rules" />
      <CMove from="WikiTide" fromRole="generated wiki dump" to="generate docs + explorer" toRole="docs and an object UI" />
      <CMove from="AgentTide" fromRole="agent skills" to="skills" toRole="27 skills, multi-harness" />
      <CMove from="SyntaxTide" fromRole="LSP experiment" to="language-server" toRole="KQL · SPL · Tide YAML" coming />
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// WHAT AN AGENT NEEDS
// ─────────────────────────────────────────────────────────────────────────────
const CNeed = ({ n, icon, need, before, now }: { n: string; icon: IconName; need: string; before: string; now: ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '56px 430px 420px 1fr', gap: 24, alignItems: 'center', padding: '24px 0', borderTop: `1px solid ${C.line}` }}>
    <span style={{ fontFamily: MONO, fontSize: 20, color: ACC }}>{n}</span>
    <span style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 28, fontWeight: 680, letterSpacing: '-0.02em', color: INK }}>
      <Icon name={icon} size={30} color={BLUE} />
      {need}
    </span>
    <span style={{ fontSize: 22, color: C.subtle, lineHeight: 1.35 }}>{before}</span>
    <span style={{ fontSize: 22, color: INK, lineHeight: 1.35 }}>{now}</span>
  </div>
);

const AgentNeeds: Page = () => (
  <Frame chapter={['03', 'why we re-released it']} source="opentide.org/docs/usage/workflows/agentic-setup · opentide.org/docs/mcp">
    <H>An agent is only as good as the spec it is held to.</H>
    <div style={{ marginTop: 44 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '56px 430px 420px 1fr', gap: 24, paddingBottom: 12, fontFamily: MONO, fontSize: 18 }}>
        <span />
        <span style={{ color: C.dim }}>what an agent needs</span>
        <span style={{ color: C.dim }}>submodule era</span>
        <span style={{ color: ACC }}>opentide 0.11</span>
      </div>
      <Steps>
        <Step>
          <CNeed n="01" icon="doc" need="A contract it can read" before="JSON Schemas generated in-tree; no separate spec" now="Normative specs, generated JSON Schema, 36 versioned vocabularies" />
        </Step>
        <Step>
          <CNeed n="02" icon="check" need="Feedback it can act on" before="Scripts and logs to interpret" now={<><M color={BLUE}>--json</M> results, exit codes, <M color={BLUE}>file:line</M> findings</>} />
        </Step>
        <Step>
          <CNeed n="03" icon="plug" need="Tools it can call" before="None: shell out to scripts" now="MCP: search, chaining, coverage, validation, dry-run deploy" />
        </Step>
        <Step>
          <CNeed n="04" icon="book" need="Knowledge it can load" before="One AGENTS.md in a separate repo" now={<>27 skills + AGENTS.md via <M color={BLUE}>opentide setup skills</M></>} />
        </Step>
        <Step>
          <CNeed n="05" icon="lock" need="Gates it cannot skip" before="CI glue rewritten per instance" now={<><M color={BLUE}>setup ci</M>: strict validate and lint, staging first, approved promotion</>} />
        </Step>
      </Steps>
    </div>
    <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: `1px solid ${C.line}`, fontSize: 34, fontWeight: 680, letterSpacing: '-0.025em', color: ACC }}>
      A submodule gave agents scripts to run. A package gives them a spec to follow.
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// THE CLI IS THE AGENT'S API
// ─────────────────────────────────────────────────────────────────────────────
const C_JSON = `{
  "platform": "crowdstrike",
  "valid": null,
  "supported": false,
  "ok": false,
  "status": "failed",
  "message": "query validation not supported for crowdstrike"
}`;

const CRule = ({ icon, title, body }: { icon: IconName; title: ReactNode; body: string }) => (
  <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', padding: '18px 0', borderTop: `1px solid ${C.line}` }}>
    <Icon name={icon} size={30} color={BLUE} style={{ marginTop: 2 }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 28, fontWeight: 650, letterSpacing: '-0.02em', color: INK }}>{title}</span>
      <span style={{ fontSize: 22, lineHeight: 1.4, color: C.muted }}>{body}</span>
    </div>
  </div>
);

const CliContract: Page = () => (
  <Frame chapter={['03', 'why we re-released it']} source="opentide.org/docs/cli · opentide.org/docs/cli/validate">
    <H>The CLI is the agent’s API.</H>
    <Lead>Every command answers the same way, so pipelines and agents act on results, not prose.</Lead>
    <div style={{ display: 'flex', gap: 70, marginTop: 40 }}>
      <CTerm
        title="zsh · detection-repo"
        size={20}
        style={{ width: 860 }}
        parts={[
          { lang: 'bash', code: '$ opentide --json validate query --platform crowdstrike' },
          { lang: 'json', code: C_JSON },
          { lang: 'bash', code: '$ echo $?\n1' },
        ]}
      />
      <div style={{ flex: 1 }}>
        <CRule icon="doc" title={<>One JSON document on stdout</>} body={'"ok": true or false, a status, a message. Nothing else.'} />
        <CRule icon="terminal" title="Diagnostics on stderr" body="Logs never prefix or corrupt the document." />
        <CRule icon="lock" title="Exit codes gate CI" body="0 success · 1 error · 2 usage. No parsing needed." />
        <CRule icon="check" title="Explicit by design" body="Unsupported checks fail with a reason CI can gate on." />
      </div>
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// ONE SETUP WIRES THE REPO
// ─────────────────────────────────────────────────────────────────────────────
const C_SETUP = `$ pip install 'opentide[mcp]==0.11.0'
$ opentide setup --yes --platform sentinel --ci github
$ opentide setup mcp --claude-code --yes
$ opentide setup skills --yes --claude-code \\
    --install opentide-detection-rule`;

const C_TREE = `detection-repo/
├── objects/
│   ├── threats/  objectives/  rules/
├── .opentide/configurations/platforms/
│   └── sentinel.toml
├── .github/workflows/      # validate · lint · deploy
├── .mcp.json               # the opentide MCP server
├── CLAUDE.md               # the agent's entry point
└── .claude/skills/
    └── opentide-detection-rule/`;

const CTarget = ({ label, items }: { label: string; items: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <span style={{ fontFamily: MONO, fontSize: 17, color: C.dim }}>{label}</span>
    <span style={{ fontSize: 23, color: INK }}>{items}</span>
  </div>
);

const SetupWires: Page = () => (
  <Frame chapter={['03', 'why we re-released it']} source="opentide.org/docs/usage/repository-setup · opentide.org/docs/cli/setup">
    <H>One setup wires the repo for humans, CI and agents.</H>
    <div style={{ display: 'flex', gap: 40, marginTop: 44 }}>
      <div style={{ width: 860, display: 'flex', flexDirection: 'column', gap: 30 }}>
        <Code lang="bash" variant="navy" size={22} lh={1.65} code={C_SETUP} title={<><Icon name="terminal" size={18} color={NV.foam} /> zsh · detection-repo</>} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px 30px', padding: '28px 30px', borderRadius: 14, border: `1px solid ${C.line}` }}>
          <CTarget label="ci" items="GitHub · GitLab · Azure DevOps" />
          <CTarget label="platforms" items="seven adapters, enabled per repo" />
          <CTarget label="mcp hosts" items="VS Code · Cursor · Claude Code" />
          <CTarget label="skills targets" items="Claude · Cursor · Copilot · .agents" />
        </div>
      </div>
      <Code lang="yaml" size={21} lh={1.75} code={C_TREE} title={<><Icon name="branch" size={18} color={BLUE} /> what you get</>} style={{ flex: 1 }} />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 'auto', paddingTop: 22, borderTop: `1px solid ${C.line}`, fontSize: 26, color: C.muted }}>
      <Icon name="lock" size={26} color={BLUE} />
      <span>
        Generated pipelines install the exact version you ran setup with: <M color={BLUE}>opentide==0.11.0</M>. Upgrades arrive as a reviewed diff.
      </span>
    </div>
  </Frame>
);

const PAGES_C: Page[] = [DividerWhyNow, Heritage, Backlog, Submodule, TideKit, WhyCLI, Archived, AgentNeeds, CliContract, SetupWires];
const NOTES_C: string[] = [
  `Chapter three, and the reason for this talk: why we moved the engine from a git submodule to a CLI. Short version: the shape that worked inside one team did not scale to many teams, and it could not serve agents.`,
  `None of this was written for a launch. TIDeMEC, then CoreTIDE, ran inside the European Commission CSOC for years: Hack.lu in 2023, FIRST TC Amsterdam in 2024, open source in February 2025, and AgenTide at FIRST CTI in March.
The re-release has its own timeline. In April we wrote the plan down as Project TideKit, CoreTide issue 60. In June we argued, at the CERT-EU workshop, that the query is becoming a commodity. On 22 June the new repository was created and phases zero to nine landed the same day. 0.1.0 shipped on 9 September; 0.11.0 four weeks later.`,
  `We did not have to guess what was wrong. Our own issue trackers made the case.
Client CI pulled whatever the engine was that day, so one upstream commit broke pipelines: CoreTide issue 3. The CI template pulled remote includes that pulled more includes: InitTide 5. The template's own sample rule failed validation on day one: InitTide 12. The orchestration scripts only ran inside CI. Schemas were maintained in three places, and there were zero unit tests.
And the epic that started it all says it plainly: a submodule with sys.path hacks and a 1,546-line monolith entry point.`,
  `So this is the before and after. Before: the engine lived in your repository, found by walking git and patching sys.path, run through scripts under Orchestration. After: pip install a pinned version and use a stable API or a stable command.
Three pains, three fixes. Unpinned upgrades become a version pin. Seven CI-only scripts become one entry point. Copied CI glue becomes a generated pipeline.`,
  `The plan was written down in April as Project TideKit: a versioned Python package on PyPI with a CLI, an MCP server and a clean API.
Six decisions shaped it. A new repository, so every pinned instance keeps working. A registry, not an orchestrator: the CLI owns CI context and exit codes. One entry point for every operation. Platforms as repository configuration, not install-time choices. Onboarding as a command, with generated CI. And no generic migrate command: an agent prompt plus a human-reviewed diff.
And it was planned to be built by an agent fleet. Phases zero to nine merged the day the repository was created.`,
  `Why a CLI, and not just a library? Because ergonomics is where adoption lives, and every row here has an issue or a pull request behind it.
Install is one pip command. Upgrades are a pinned version and a changelog. Onboarding is opentide setup. Seven CI-only scripts became one command tree whose help answers in two tenths of a second. CI is generated for GitHub, GitLab and Azure. Results come back as one JSON document with exit codes. It is smoke-tested on Linux, macOS and Windows. And agents get an MCP server and skills, wired by the same setup.`,
  `On launch day we archived six repositories and replaced each with one part of a coherent stack. CoreTide became the package; InitTide became opentide setup; ShareTide became the library; WikiTide became generated docs and the explorer; AgentTide became the skills repository; the SyntaxTide experiment becomes a real language server.
Nothing was deleted: history stays, pinned SHAs keep working, and instances migrate when they next touch CI.`,
  `Here is the agentic argument in one table. An agent is only as good as the contract it is held to. It needs a contract it can read, feedback it can act on, tools it can call, knowledge it can load, and gates it cannot skip.
The submodule gave agents scripts to run. The package gives them a contract to keep: normative specs and generated schemas, a JSON contract CI can gate on, an MCP server, 27 skills, and generated CI with staged promotion.`,
  `A CLI is the most universal tool interface an agent has, so the contract matters. With --json every command writes exactly one JSON document to stdout; diagnostics go to stderr; exit codes are 0, 1 or 2. The backlog is explicit about why: a headless JSON report for agents, no rich console output in the core path.
Look at the example: CrowdStrike queries cannot be checked, so the result says so explicitly, with a reason. CI and agents can branch on that.`,
  `And all of it is wired by one command family: pip install, opentide setup with your platform and CI provider, setup mcp for your editor, setup skills for your agent harness.
You get object folders, platform configuration, a generated pipeline pinned to the exact version you ran, an MCP config, and the agent's entry point and skills. That is the starting line for agentic detection engineering, which is the next chapter.`,
];

// ═════════════════════════════════════════════════════════════════════════════
// CHAPTER 04 · AGENTIC DETECTION ENGINEERING  (writer d)
// ═════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// 04 · DIVIDER — AGENTIC DETECTION ENGINEERING
// ─────────────────────────────────────────────────────────────────────────────
const DividerAgents: Page = () => (
  <Divider
    n="04"
    chapter="agentic detection engineering"
    title={
      <>
        Agentic detection
        <br />
        engineering
      </>
    }
    sub="Agents draft. The engine checks. Humans decide what reaches production."
    fill={0.37}
    seed={0.77}
    text={Q_AGENTS}
    top={124}
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// 04 · THE LOOP — agent zone (blue) hands a pull request to human gates (ink)
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

const AgentLoop: Page = () => (
  <Frame chapter={['04', 'agentic detection engineering']} source="opentide.org/docs/usage/workflows/agentic-setup">
    <H size={60} maxWidth={1680}>
      The loop: agents draft, the engine checks, humans promote.
    </H>
    <div style={{ position: 'relative', flex: '0 0 auto', width: 1680, height: D_DH, marginTop: 46 }}>
      {/* zones */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1680, height: D_AH, boxSizing: 'border-box', borderRadius: 22, background: C.blueSoft, border: `1.5px solid ${C.blueLine}` }} />
      <div style={{ position: 'absolute', left: 0, top: D_HT, width: 1680, height: D_DH - D_HT, boxSizing: 'border-box', borderRadius: 22, background: '#FFFFFF', border: `1.5px solid ${C.inkHex}` }} />
      <DZoneHead top={26} icon="agent" color={BLUE} name="agent zone" scope="mcp tools, skills, cli" note="safe for agents: nothing here deploys" />
      <DZoneHead top={D_HT + 26} icon="lock" color={C.inkHex} name="human gates" scope="review, merge, approve" note="every real deploy follows a human decision" />

      {/* connectors */}
      <svg width={1680} height={D_DH} viewBox={`0 0 1680 ${D_DH}`} aria-hidden style={{ position: 'absolute', left: 0, top: 0 }}>
        {/* row 1: draft, left to right */}
        <DArrowH x1={410} x2={462} y={D_Y1} color={BLUE} />
        <DArrowH x1={814} x2={866} y={D_Y1} color={BLUE} />
        <DArrowH x1={1218} x2={1270} y={D_Y1} color={BLUE} />
        {/* turn down on the right: draft → check */}
        <path d={`M1616 ${D_Y1} H1630 Q1648 ${D_Y1} 1648 ${D_Y1 + 18} V${D_Y2 - 18} Q1648 ${D_Y2} 1630 ${D_Y2} H1625`} fill="none" stroke={BLUE} strokeWidth={2.25} />
        <DHead x={1622} y={D_Y2} dir="l" color={BLUE} />
        {/* fail loop: check → draft */}
        <path d={`M1446 ${D_R2 - 4} V${D_R1 + D_NH + 10}`} stroke={BLUE} strokeWidth={2.25} strokeDasharray="6 6" />
        <DHead x={1446} y={D_R1 + D_NH + 6} dir="u" color={BLUE} />
        {/* row 2: check, right to left */}
        <DArrowH x1={1270} x2={1218} y={D_Y2} color={BLUE} />
        <DArrowH x1={866} x2={814} y={D_Y2} color={BLUE} />
        <DArrowH x1={462} x2={410} y={D_Y2} color={BLUE} />
        {/* handoff: pull request → human review */}
        <path d={`M64 ${D_Y2} H50 Q32 ${D_Y2} 32 ${D_Y2 + 18} V${D_Y3 - 18} Q32 ${D_Y3} 50 ${D_Y3} H58`} fill="none" stroke={BLUE} strokeWidth={2.25} />
        <DHead x={61} y={D_Y3} dir="r" color={BLUE} />
        {/* row 3: promote, left to right */}
        <DArrowH x1={338} x2={379} y={D_Y3} color={C.inkHex} />
        <DArrowH x1={659} x2={700} y={D_Y3} color={C.inkHex} />
        <DArrowH x1={980} x2={1021} y={D_Y3} color={C.inkHex} />
        <DArrowH x1={1301} x2={1342} y={D_Y3} color={C.inkHex} />
      </svg>

      {/* agents draft */}
      <DNode x={64} y={D_R1} w={340} kind="input" icon="doc" label="brief" sub="advisory or ask" />
      <DNode x={468} y={D_R1} w={340} kind="agent" icon="search" label="search()" sub="mcp · what exists" />
      <DNode x={872} y={D_R1} w={340} kind="agent" icon="graph" label="get_chaining()" sub="mcp · threat → rule" />
      <DNode x={1276} y={D_R1} w={340} kind="agent" icon="editor" label="draft YAML" sub="skills · templates" />
      {/* the engine checks (right to left) */}
      <DNode x={1276} y={D_R2} w={340} kind="agent" icon="check" label="validation_report()" sub="mcp · concrete errors" />
      <DNode x={872} y={D_R2} w={340} kind="agent" icon="terminal" label="validate query --live" sub="cli · checks the tenant" />
      <DNode x={468} y={D_R2} w={340} kind="agent" icon="eye" label="deploy_rule()" sub="mcp · dry_run=true" />
      <DNode x={64} y={D_R2} w={340} kind="agent" icon="branch" label="pull request" sub="the diff, for review" />
      {/* humans promote */}
      <DNode x={64} y={D_R3} w={268} kind="gate" icon="lock" label="human review" sub="reads the diff" />
      <DNode x={385} y={D_R3} w={268} kind="gate" icon="lock" label="merge" sub="a maintainer" />
      <DNode x={706} y={D_R3} w={268} kind="env" icon="layers" label="STAGING" sub="ci · on merge" />
      <DNode x={1027} y={D_R3} w={268} kind="gate" icon="lock" label="approval" sub="protected env" />
      <DNode x={1348} y={D_R3} w={268} kind="prod" icon="signal" label="PRODUCTION" sub="live detections" />

      {/* annotations */}
      <span style={{ position: 'absolute', right: 252, top: (D_R1 + D_NH + D_R2) / 2 - 13, fontFamily: MONO, fontSize: 18, color: C.muted, whiteSpace: 'nowrap' }}>
        <span style={{ color: C.red }}>fail</span> → edit again
      </span>
      <span style={{ position: 'absolute', left: 54, top: (D_AH + D_HT) / 2 - 13, fontFamily: MONO, fontSize: 18, color: C.muted, whiteSpace: 'nowrap' }}>
        handoff · the agent's output is a pull request
      </span>
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// 04 · WALKTHROUGH 1 — the agent session (opentide.org demo)
// ─────────────────────────────────────────────────────────────────────────────
const DFn = ({ children }: { children: ReactNode }) => <span style={{ color: NV.foam }}>{children}</span>;
const DVerb = ({ children }: { children: ReactNode }) => <span style={{ color: NV.subtle }}>{children}</span>;
const DStr = ({ children }: { children: ReactNode }) => <span style={{ color: '#B9EBCB' }}>{children}</span>;

const DTraceLine = ({ mark, children, result, ok, delay = 0 }: { mark: '>' | '+' | '~'; children: ReactNode; result?: string; ok?: boolean; delay?: number }) => (
  <div className="ot ot-fade" style={{ display: 'flex', alignItems: 'baseline', gap: 14, whiteSpace: 'nowrap', animationDelay: `${delay}s` }}>
    <span style={{ width: 14, flex: '0 0 auto', color: mark === '>' ? NV.dim : NV.foam, fontWeight: 600 }}>{mark}</span>
    <span>{children}</span>
    {result && <span style={{ color: NV.dim }}>→</span>}
    {result && <span style={{ color: ok ? NV.ok : NV.muted }}>{result}</span>}
  </div>
);

const DResult = ({ icon, kind, status, tone, name, sub }: { icon: IconName; kind: string; status: string; tone: ChipTone; name: string; sub: string }) => (
  <div style={{ flex: 1, borderRadius: 16, border: `1.5px solid ${C.line2}`, background: '#FFFFFF', padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 11 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={24} color="#FFFFFF" />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 19, color: BLUE, fontWeight: 600 }}>{kind}</span>
      <Chip tone={tone} size={17} style={{ marginLeft: 'auto' }}>
        {status}
      </Chip>
    </div>
    <span style={{ fontSize: 27, fontWeight: 680, letterSpacing: '-0.02em', color: INK, whiteSpace: 'nowrap' }}>{name}</span>
    <span style={{ fontFamily: MONO, fontSize: 17, color: C.muted, whiteSpace: 'nowrap' }}>{sub}</span>
  </div>
);

const DLinkGap = () => (
  <div style={{ width: 56, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Icon name="link" size={26} color={BLUE} />
  </div>
);

const WalkSession: Page = () => (
  <Frame
    chapter={['04', 'agentic detection engineering']}
    source="socprime.com/active-threats · StopRansomware: Gunra (13 Aug 2026) · CISA AA26-222A"
  >
    <H>From a SOC Prime threat report to a linked chain.</H>
    <div style={{ display: 'flex', gap: 48, marginTop: 44 }}>
      <div style={{ width: 440, flex: '0 0 auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 999, border: `1.5px solid ${C.inkHex}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="user" size={24} color={C.inkHex} />
          </div>
          <Label>prompt</Label>
        </div>
        <div style={{ marginTop: 16, borderRadius: '6px 24px 24px 24px', background: C.paper, border: `1px solid ${C.line}`, padding: '26px 30px', fontSize: 31, lineHeight: 1.4, letterSpacing: '-0.015em', color: INK }}>
          Turn SOC Prime’s Threat of the Month, Gunra ransomware, into Sentinel and Splunk detections. Strict validation, staged deploy.
        </div>
        <span style={{ marginTop: 'auto', fontFamily: MONO, fontSize: 18, lineHeight: 1.5, color: C.dim }}>
          intel: SOC Prime Active Threats,
          <br />
          Threat of the Month
        </span>
      </div>
      <div style={{ flex: 1, background: NV.bg, border: `1px solid ${NV.line}`, borderRadius: 14, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 22px', background: NV.head, borderBottom: `1px solid ${NV.line}`, borderRadius: '14px 14px 0 0', fontFamily: MONO, fontSize: 17 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10, color: NV.muted }}>
            <Icon name="terminal" size={19} color={NV.muted} /> agent session
          </span>
          <span style={{ color: NV.dim }}>opentide mcp · skills</span>
        </div>
        <div style={{ padding: '18px 24px', fontFamily: MONO, fontSize: 21, lineHeight: 1.95, color: NV.ink, display: 'flex', flexDirection: 'column' }}>
          <DTraceLine mark=">" result="T1190 · T1003" delay={0.2}>
            <DVerb>open</DVerb> socprime: Gunra
          </DTraceLine>
          <DTraceLine mark=">" result="no threat yet" delay={0.35}>
            <DFn>search</DFn>(query=<DStr>"T1190"</DStr>)
          </DTraceLine>
          <DTraceLine mark="+" delay={0.5}>
            <DVerb>write</DVerb> objects/threats/gunra-ransomware-intrusion.yaml
          </DTraceLine>
          <DTraceLine mark=">" result="objective credential-access exists" delay={0.65}>
            <DFn>search</DFn>(technique=<DStr>"T1003.001"</DStr>)
          </DTraceLine>
          <DTraceLine mark=">" result="no rule implements it" delay={0.8}>
            <DFn>get_chaining</DFn>(uuid=<DStr>"f8817f95-…"</DStr>)
          </DTraceLine>
          <DTraceLine mark="~" result="threats += aa36f6de-…" delay={0.95}>
            <DVerb>edit</DVerb> objects/objectives/credential-access.yaml
          </DTraceLine>
          <DTraceLine mark="+" result="sentinel · splunk" delay={1.1}>
            <DVerb>write</DVerb> objects/rules/lsass-memory-access.yaml
          </DTraceLine>
          <DTraceLine mark=">" result="0 errors" ok delay={1.25}>
            <DFn>validation_report</DFn>()
          </DTraceLine>
          <DTraceLine mark=">" result="action: dry-run" ok delay={1.4}>
            <DFn>deploy_rule</DFn>(uuid=<DStr>"c8f282eb-…"</DStr>, platform=<DStr>"sentinel"</DStr>, dry_run=<DFn>true</DFn>)
          </DTraceLine>
        </div>
      </div>
    </div>
    <div style={{ display: 'flex', marginTop: 32 }}>
      <DResult icon="threat" kind="threat" status="new" tone="solid" name="Gunra ransomware intrusion" sub="T1190 · T1003 · Windows::Server" />
      <DLinkGap />
      <DResult icon="objective" kind="objective" status="updated" tone="accent" name="Credential access via LSASS" sub="+1 threat · aa36f6de-…" />
      <DLinkGap />
      <DResult icon="rule" kind="rule" status="new" tone="solid" name="LSASS memory access" sub="rule::1.1 · KQL + SPL · STAGING" />
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// 04 · WALKTHROUGH 2 — same gates as any human change
// ─────────────────────────────────────────────────────────────────────────────
const DFileRow = ({ mark, path }: { mark: '+' | '~'; path: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 18, color: C.inkHex, whiteSpace: 'nowrap' }}>
    <span style={{ width: 14, color: mark === '+' ? C.green : BLUE, fontWeight: 700 }}>{mark}</span>
    <span>{path}</span>
  </div>
);

const DCmd = ({ children, note }: { children: ReactNode; note?: string }) => (
  <span style={{ fontFamily: MONO, fontSize: 19, color: C.inkHex, whiteSpace: 'nowrap' }}>
    <span style={{ color: C.dim }}>$ </span>
    {children}
    {note && <span style={{ marginLeft: 18, fontFamily: SANS, fontSize: 21, color: C.muted }}>{note}</span>}
  </span>
);

const DTarget = ({ platform, name }: { platform: string; name: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap' }}>
    <Icon name="arrow" size={18} color={C.dim} />
    <span style={{ width: 220, fontSize: 21, color: C.muted }}>{platform}</span>
    <span style={{ fontFamily: MONO, fontSize: 19, color: INK }}>{name}</span>
  </div>
);

const DJob = ({ name, time, children }: { name: string; time: string; children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 18, padding: '16px 28px', borderTop: `1px solid ${C.line}` }}>
    <div style={{ width: 32, height: 32, flex: '0 0 auto', borderRadius: 999, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="check" size={20} color="#FFFFFF" stroke={2.6} />
    </div>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'baseline' }}>
        <span style={{ fontSize: 27, fontWeight: 680, letterSpacing: '-0.02em', color: INK, lineHeight: 1.1 }}>{name}</span>
        <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 19, color: C.muted }}>{time}</span>
      </div>
      {children}
    </div>
  </div>
);

const WalkCI: Page = () => (
  <Frame chapter={['04', 'agentic detection engineering']} source="opentide.org (interactive workflow demo) · opentide.org/docs/usage/workflows/ci-cd">
    <H>Then it meets the same gates as any human change.</H>
    <div style={{ display: 'flex', gap: 48, marginTop: 44 }}>
      {/* merge request */}
      <div style={{ width: 760, flex: '0 0 auto', boxSizing: 'border-box', borderRadius: 20, border: `1.5px solid ${C.line2}`, padding: '26px 32px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="merge" size={28} color={BLUE} />
          <span style={{ fontFamily: MONO, fontSize: 22, fontWeight: 600, color: BLUE }}>!142</span>
          <span style={{ fontFamily: MONO, fontSize: 18, color: C.muted }}>merge request</span>
          <Chip tone="accent" style={{ marginLeft: 'auto' }}>
            merged into main
          </Chip>
        </div>
        <span style={{ marginTop: 18, fontSize: 34, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.025em', color: INK }}>
          Detect LSASS credential dumping in Gunra ransomware intrusions
        </span>
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, fontFamily: MONO, fontSize: 19, color: C.muted, whiteSpace: 'nowrap' }}>
          <Icon name="branch" size={20} color={C.muted} />
          <span style={{ color: INK }}>feat/lsass-credential-access</span>
          <Icon name="arrow" size={18} color={C.dim} />
          <span style={{ color: INK }}>main</span>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
          <Chip tone="accent">detection-content</Chip>
          <Chip>sentinel</Chip>
          <Chip>splunk</Chip>
        </div>
        <p style={{ margin: '22px 0 0', paddingTop: 20, borderTop: `1px solid ${C.line}`, fontSize: 24, lineHeight: 1.45, color: C.muted }}>
          Agent-drafted from SOC Prime’s Gunra report: a new threat, the LSASS objective linked, a new rule for Sentinel and Splunk.
        </p>
        <span style={{ marginTop: 18, fontFamily: MONO, fontSize: 17, color: C.dim }}>3 files changed</span>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <DFileRow mark="+" path="objects/threats/gunra-ransomware-intrusion.yaml" />
          <DFileRow mark="~" path="objects/objectives/credential-access.yaml" />
          <DFileRow mark="+" path="objects/rules/lsass-memory-access.yaml" />
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 18, borderTop: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 999, border: `1.5px solid ${C.inkHex}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="user" size={24} color={C.inkHex} />
          </div>
          <span style={{ fontSize: 25, fontWeight: 600, color: INK }}>SOC lead approved these changes</span>
          <Icon name="check" size={28} color={C.green} stroke={2.4} style={{ marginLeft: 'auto' }} />
        </div>
      </div>
      {/* pipeline */}
      <div style={{ flex: 1, borderRadius: 20, border: `1.5px solid ${C.line2}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 28px', display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 19, color: C.muted, whiteSpace: 'nowrap' }}>
          <Icon name="flow" size={22} color={BLUE} />
          <span style={{ color: INK, fontWeight: 600 }}>pipeline</span>
          <span>· from opentide setup ci</span>
        </div>
        <DJob name="Validate" time="48s">
          <DCmd>opentide validate --strict</DCmd>
          <DCmd>opentide validate query --platform sentinel --live</DCmd>
          <DCmd>opentide validate query --platform splunk --live</DCmd>
        </DJob>
        <DJob name="Generate" time="33s">
          <DCmd note="schemas · exports · docs">opentide generate</DCmd>
        </DJob>
        <DJob name="Deploy Staging" time="1m 12s">
          <DCmd>opentide deploy --plan STAGING</DCmd>
          <DTarget platform="Microsoft Sentinel" name="[STAGING] LSASS memory access" />
          <DTarget platform="Splunk ES" name="[STAGING] LSASS memory access" />
        </DJob>
        <div style={{ marginTop: 'auto', display: 'flex', gap: 18, padding: '16px 28px 18px', borderTop: `1px dashed ${C.line2}`, background: C.paper, borderRadius: '0 0 18px 18px' }}>
          <div style={{ width: 32, height: 32, flex: '0 0 auto', borderRadius: 999, border: `1.5px solid ${C.inkHex}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="lock" size={18} color={C.inkHex} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 27, fontWeight: 680, letterSpacing: '-0.02em', color: C.muted, lineHeight: 1.1 }}>Deploy Production</span>
              <Chip tone="ghost" size={17} style={{ marginLeft: 'auto' }}>
                not run
              </Chip>
            </div>
            <span style={{ fontSize: 22, lineHeight: 1.4, color: C.muted }}>
              Protected environment, separate approval.
              <br />
              This merge only reaches STAGING.
            </span>
          </div>
        </div>
      </div>
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// 04 · HONEST TOOLS
// ─────────────────────────────────────────────────────────────────────────────
const DCapRow = ({ tools, note, status, tone }: { tools: ReactNode; note?: ReactNode; status: string; tone: ChipTone }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '15px 0', borderTop: `1px solid ${C.line}` }}>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, whiteSpace: 'nowrap' }}>
      <span style={{ fontFamily: MONO, fontSize: 20, color: INK }}>{tools}</span>
      {note && <span style={{ fontFamily: MONO, fontSize: 17, color: C.muted }}>{note}</span>}
    </div>
    <div style={{ width: 250, flex: '0 0 auto' }}>
      <Chip tone={tone} size={18}>
        {status}
      </Chip>
    </div>
  </div>
);

const DIssue = ({ id, date, title, detail }: { id: string; date: string; title: ReactNode; detail: ReactNode }) => (
  <div style={{ display: 'flex', gap: 18, padding: '11px 0', borderTop: `1px solid ${C.line}` }}>
    <div style={{ width: 96, flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 3, fontFamily: MONO }}>
      <span style={{ fontSize: 19, color: BLUE, fontWeight: 600 }}>{id}</span>
      <span style={{ fontSize: 17, color: C.dim }}>{date}</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 22, lineHeight: 1.3, color: INK, fontWeight: 560 }}>{title}</span>
      <span style={{ fontSize: 19, lineHeight: 1.35, color: C.muted }}>{detail}</span>
    </div>
  </div>
);

const D_JSON_REFUSE = `{
  "platform": "sentinel",
  "supported": true,
  "ok": false,
  "status": "failed",
  "message": "Query validation checks the tenant. Re-run with --live."
}`;

const Honesty: Page = () => (
  <Frame chapter={['04', 'agentic detection engineering']} source="opentide.org/docs/mcp · opentide.org/docs/cli/validate · OpenTideHQ/opentide #245, #456">
    <H>Agents build on what the gates return.</H>
    <div style={{ display: 'flex', gap: 48, marginTop: 36 }}>
      {/* what each tool reports */}
      <div style={{ width: 752, flex: '0 0 auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: 20, paddingBottom: 12, fontFamily: MONO, fontSize: 18, color: C.dim }}>
          <span style={{ flex: 1 }}>mcp tool</span>
          <span style={{ width: 250 }}>status</span>
        </div>
        <DCapRow tools="search · get_chaining · coverage" status="supported" tone="ok" />
        <DCapRow tools="validate_rule · validation_report" status="supported" tone="ok" />
        <DCapRow tools="deploy_rule" note="returns action: dry-run" status="dry-run by default" tone="accent" />
        <DCapRow tools="validate_query" note="refuses otherwise · then checks the tenant" status="only with live: true" tone="accent" />
        <DCapRow tools="run_query" note="stub: true · rows: null" status="not implemented" tone="warn" />
        <DCapRow tools="crowdstrike · harfanglab" note="query checks: deploy-only" status="supported: false" tone="warn" />
      </div>
      {/* the incident, and the fix */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ borderRadius: 16, border: `1.5px solid ${C.line2}`, padding: '14px 24px 2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 11, fontFamily: MONO, fontSize: 18, color: C.muted }}>
            <Icon name="warn" size={20} color={C.red} />
            found by a first-user simulation · fixed in days
          </div>
          <DIssue
            id="#245"
            date="sep 22"
            title={
              <>
                MCP <M>validate_query</M> returns <M>valid=true</M> for garbage queries
              </>
            }
            detail="“Agents that trust the tool … will treat invalid KQL/SPL as valid.”"
          />
          <DIssue
            id="PR #275"
            date="sep 22"
            title={
              <>
                Stubs said <M>rows: 0</M>. Now: <M>stub: true</M>, <M>rows: null</M>
              </>
            }
            detail="rows: 0 is what “an agent reads as ‘the query ran and matched nothing’”"
          />
          <DIssue
            id="#456"
            date="oct 7"
            title="“That offline result is not a tenant check.”"
            detail={
              <>
                0.11.0: bare <M>validate query</M> refuses and names <M>--live</M>
              </>
            }
          />
        </div>
        <Code
          variant="navy"
          lang="json"
          size={19}
          lh={1.4}
          title={
            <>
              <Icon name="terminal" size={18} color={NV.muted} /> opentide --json validate query --platform sentinel
            </>
          }
          tag="exit 1"
          code={D_JSON_REFUSE}
        />
      </div>
    </div>
    <div style={{ marginTop: 'auto', paddingTop: 22, borderTop: `1px solid ${C.line}` }}>
      <span style={{ fontSize: 46, fontWeight: 720, letterSpacing: '-0.03em', color: INK }}>
        Strict gates keep agent output <A>threat-aligned and shippable.</A>
      </span>
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// 04 · GUARDRAILS
// ─────────────────────────────────────────────────────────────────────────────
const DGuardHead = ({ icon, color, title }: { icon: IconName; color: string; title: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 18, borderBottom: `3px solid ${color}` }}>
    <div style={{ width: 46, height: 46, borderRadius: 12, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={26} color="#FFFFFF" stroke={2.2} />
    </div>
    <span style={{ fontSize: 36, fontWeight: 720, letterSpacing: '-0.03em', color }}>{title}</span>
  </div>
);

const DGuard = ({ icon, color, children }: { icon: IconName; color: string; children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 18, height: 66, borderBottom: `1px solid ${C.line}`, fontSize: 26, color: INK, whiteSpace: 'nowrap' }}>
    <Icon name={icon} size={26} color={color} stroke={2} />
    <span>{children}</span>
  </div>
);

// AGENTS.md rendered line by line (markdown bullets, inline code in blue).
const DMdLine = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 14, whiteSpace: 'nowrap' }}>
    <span style={{ color: C.dim }}>-</span>
    <span>{children}</span>
  </div>
);
const DTick = ({ children }: { children: ReactNode }) => (
  <span style={{ color: BLUE }}>
    <span style={{ color: C.dim }}>`</span>
    {children}
    <span style={{ color: C.dim }}>`</span>
  </span>
);

const Guardrails: Page = () => (
  <Frame chapter={['04', 'agentic detection engineering']} source="opentide.org/docs/usage/workflows/agentic-setup">
    <H>What agents may do, and what stays human.</H>
    <div style={{ display: 'flex', gap: 72, marginTop: 52 }}>
      <div style={{ width: 700, flex: '0 0 auto' }}>
        <DGuardHead icon="check" color={BLUE} title="Let agents" />
        <DGuard icon="check" color={BLUE}>
          Search, read and summarise objects and coverage
        </DGuard>
        <DGuard icon="check" color={BLUE}>
          Draft objects from templates
        </DGuard>
        <DGuard icon="check" color={BLUE}>
          Run <M color={BLUE}>validation_report</M> and surface concrete errors
        </DGuard>
        <DGuard icon="check" color={BLUE}>
          Fix dangling references and vocabulary violations
        </DGuard>
        <DGuard icon="check" color={BLUE}>
          Preview deploys with <M color={BLUE}>dry_run=true</M>
        </DGuard>
      </div>
      <div style={{ flex: 1 }}>
        <DGuardHead icon="lock" color={C.inkHex} title="Keep a human in the loop" />
        <DGuard icon="lock" color={C.inkHex}>
          Real (non-dry-run) deploys to production
        </DGuard>
        <DGuard icon="lock" color={C.inkHex}>
          Bulk promotion to <M>PRODUCTION</M>
        </DGuard>
        <DGuard icon="lock" color={C.inkHex}>
          Editing <M>.opentide/configurations/</M> credentials or deployment plans
        </DGuard>
        <DGuard icon="lock" color={C.inkHex}>
          Trusting a query check that was not run against the tenant
        </DGuard>
        <DGuard icon="lock" color={C.inkHex}>
          Regenerating or hand-editing UUIDs
        </DGuard>
      </div>
    </div>
    <div style={{ marginTop: 44, background: C.paper, border: `1px solid ${C.line}`, borderRadius: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 20px', background: C.paper2, borderBottom: `1px solid ${C.line}`, borderRadius: '14px 14px 0 0', fontFamily: MONO, fontSize: 17, color: C.dim }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.muted }}>
          <Icon name="doc" size={18} color={BLUE} /> AGENTS.md
        </span>
        <span>guardrails, from the docs</span>
      </div>
      <div style={{ padding: '16px 22px', fontFamily: MONO, fontSize: 21, lineHeight: 1.7, color: C.inkHex }}>
        <DMdLine>
          Always run <DTick>validation_report</DTick> before proposing a rule as done.
        </DMdLine>
        <DMdLine>Never claim query validation for CrowdStrike or HarfangLab — they are deploy-only.</DMdLine>
        <DMdLine>
          Deploys are <DTick>dry_run=true</DTick> unless a human explicitly approves a real deploy.
        </DMdLine>
      </div>
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// 04 · DOGFOOD — the project runs on the same loop
// ─────────────────────────────────────────────────────────────────────────────
const DBig = ({ value, label, sub, accent, children }: { value: ReactNode; label: string; sub: string; accent?: boolean; children?: ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', paddingTop: 22, borderTop: `1px solid ${C.line2}` }}>
    <span style={{ fontSize: 116, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.9, color: accent ? ACC : INK, whiteSpace: 'nowrap' }}>{value}</span>
    <span style={{ marginTop: 16, fontSize: 26, lineHeight: 1.3, fontWeight: 560, color: INK, whiteSpace: 'nowrap' }}>{label}</span>
    <span style={{ marginTop: 8, fontFamily: MONO, fontSize: 18, color: C.subtle, whiteSpace: 'nowrap' }}>{sub}</span>
    {children}
  </div>
);

const Dogfood: Page = () => (
  <Frame chapter={['04', 'agentic detection engineering']} source="github.com/OpenTideHQ/opentide · pypi.org/project/opentide">
    <H>We build opentide the way we want detections built.</H>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', columnGap: 56, rowGap: 52, marginTop: 64 }}>
      <DBig value="163" label="issues closed since 0.1.0" sub="sep 9 → oct 8 · bugs, docs, setup, migration" />
      <DBig value="150" label="pull requests merged since 0.1.0" sub="each one merged by a maintainer" />
      <DBig value="133" label="of them drafted on cloud-agent branches" sub="cursor/… branches" accent>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1, height: 10, borderRadius: 999, background: C.tint }}>
            <div className="ot ot-grow" style={{ width: '88.7%', height: 10, borderRadius: 999, background: BLUE, animationDelay: '0.3s' }} />
          </div>
          <span style={{ fontFamily: MONO, fontSize: 18, color: BLUE }}>133 / 150</span>
        </div>
      </DBig>
      <DBig
        value={
          <>
            3.10<span style={{ margin: '0 0.07em' }}>–</span>3.14
          </>
        }
        label="Python versions in the CI matrix"
        sub="tests on each · lint: ruff + ty"
      />
      <DBig value="85%" label="coverage gate" sub="CodeQL on every push and PR" />
      <DBig value="20" label="bugs from a first-user simulation" sub="#239–#258 on 0.3.0 · fixed in 0.4.0 next day" />
    </div>
    <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: `1px solid ${C.line}` }}>
      <span style={{ fontSize: 50, fontWeight: 720, letterSpacing: '-0.035em', color: ACC }}>Agents draft. Gates decide. A maintainer merges.</span>
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
const PAGES_D: Page[] = [DividerAgents, AgentLoop, WalkSession, WalkCI, Honesty, Guardrails, Dogfood];

const NOTES_D: string[] = [
  `Chapter four: agentic detection engineering.
We have seen why the engine exists and why we re-released it with agent-native surfaces: the MCP server, the skills, the JSON contract.
Now let's watch it work, and look at the guardrails that keep it safe.
One line for the whole chapter: agents draft, the engine checks, humans decide what reaches production.`,

  `This is the safe workflow from the agentic setup docs.
In the blue zone the agent works from a brief: it searches the graph, reads the lineage with get_chaining, and drafts YAML with the skills.
Then the engine checks the draft: validation_report until it is clean, a live query check against the tenant from the CLI, and a dry-run deploy.
Nothing in that zone deploys: the agent's output is a pull request.
From there humans own every gate: review, merge, an automatic deploy to STAGING, and a separate approval before PRODUCTION.
Let's run one real example through it.`,

  `Here is a worked example on real intel: SOC Prime's Threat of the Month.
The prompt asks for deployable Sentinel and Splunk detections from SOC Prime's Threat of the Month: Gunra ransomware, CISA advisory AA26-222A. Gunra actors exploit internet-facing services and stolen credentials, move laterally with Impacket, and dump credentials before double-extortion encryption.
The agent finds no threat for it and writes one, finds the existing LSASS credential-access objective, and learns from get_chaining that no rule implements it.
It links the threat, writes the rule for both platforms, gets zero errors from validation_report, and previews the Sentinel deploy as a dry run.
One new threat, one updated objective, one new rule, linked by UUID. And then it goes where every change goes.`,

  `It lands as an ordinary merge request: 142, labelled detection-content, sentinel and splunk, approved by the SOC lead.
The pipeline from opentide setup ci validates in 48 seconds, strict validation plus the live query check on both platforms, regenerates schemas, exports and docs in 33 seconds, and deploys to STAGING in a minute twelve.
Production is not part of this merge: promotion runs from a protected environment and needs its own approval.
The gates did not change because an agent wrote the YAML.
But gates are only as good as the tools behind them.`,

  `Agents build on what the gates return, so the gates have to be strict.
Deploys are dry runs by default, validate_query refuses unless you ask for the live tenant check, run_query says it is a stub with rows null, and CrowdStrike and HarfangLab answer supported false.
We learned this on our own code: on September 22nd a first-user simulation caught validate_query returning valid true for garbage queries, and a stub answering rows zero, which an agent reads as "the query ran and matched nothing".
Both were fixed within days, and since 0.11.0 the bare query check refuses and tells you to re-run with --live.
Strict gates are what keep agent output threat-aligned and shippable.`,

  `So where is the line?
Let agents search, read and summarise, draft from templates, run validation_report and fix what it finds, like dangling references and vocabulary violations, and preview deploys as dry runs.
Keep a human on real production deploys, bulk promotion to PRODUCTION, the credentials and deployment plans in .opentide/configurations, any query check that did not run against the tenant, and UUIDs.
Write the three guardrails into your AGENTS.md, so the agent reads them every time it starts.`,

  `We hold ourselves to the same loop: TideKit planned the rebuild for an agentic fleet, and that is still how the project runs.
Since 0.1.0 on September 9th: 163 issues closed and 150 merged pull requests, 133 of them drafted on cloud-agent branches, each one merged by a maintainer.
The gates are the same for every author: tests on Python 3.10 to 3.14, an 85 percent coverage gate, CodeQL on every push and pull request. When a first-user simulation of 0.3.0 filed twenty bugs, 0.4.0 fixed them the next day.
Agents draft, gates decide, a maintainer merges, which brings us to what comes next.`,
];

// ─────────────────────────────────────────────────────────────────────────────
// 05 · WHAT COMES NEXT (+ closing pages) — writer e
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// DIVIDER — WHAT COMES NEXT
// ─────────────────────────────────────────────────────────────────────────────
const DividerNext: Page = () => (
  <Divider
    n="05"
    chapter="what comes next"
    title="What comes next"
    sub="Four weeks of stabilization are done. Next: more platforms, editor tooling, and the road to 1.0."
    fill={0.4}
    seed={0.91}
    text={Q_NEXT}
    top={170}
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// VELOCITY — 26 releases in four weeks (PyPI dates, day 0 = 2026-09-09)
// ─────────────────────────────────────────────────────────────────────────────
const E_X0 = 250; // window opens: sep 9, 00:00
const E_X29 = 1620; // window closes: oct 7, 24:00
const E_AX = 604; // axis = zero releases
const E_DY = 19.7; // px per release
const E_BAND_TOP = 14;
const E_T = (t: number) => E_X0 + (t * (E_X29 - E_X0)) / 29; // t = days since sep 9, 00:00
const E_X = (d: number) => E_T(d + 0.5); // centre of day d
const E_Y = (n: number) => E_AX - n * E_DY;
const E_DAYS = [0, 2, 2, 2, 4, 4, 6, 7, 7, 9, 9, 12, 14, 14, 14, 14, 15, 15, 19, 20, 21, 22, 23, 26, 27, 28];
const E_STEP = E_DAYS.map((d, i) => (i === 0 ? `M${E_X(d).toFixed(1)} ${E_Y(1).toFixed(1)}` : `H${E_X(d).toFixed(1)} V${E_Y(i + 1).toFixed(1)}`)).join(' ');
const E_TICKS_DAY = Array.from({ length: 29 }, (_, d) => (d % 7 ? `M${E_X(d).toFixed(1)} ${E_AX} v7` : '')).join(' ');
const E_TICKS_WEEK = [0, 7, 14, 21, 28].map((d) => `M${E_X(d).toFixed(1)} ${E_AX} v13`).join(' ');

// One release on PyPI: filled = minor, hollow = patch. Same-day releases stack.
const ERel = ({ v, d, n, minor }: { v: string; d: number; n: number; minor?: boolean }) => (
  <circle cx={E_X(d)} cy={E_Y(n)} r={minor ? 7.6 : 5.6} fill={minor ? BLUE : '#FFFFFF'} stroke={BLUE} strokeWidth={minor ? 0 : 2.4}>
    <title>{v}</title>
  </circle>
);

const EDate = ({ d, label }: { d: number; label: string }) => (
  <text x={E_X(d)} y={E_AX + 42} textAnchor="middle" fontFamily={MONO} fontSize={19} fill={C.muted}>
    {label}
  </text>
);

// Milestone flag: a hairline pole from the dot to a two-line mono label.
// dir: where the label sits relative to the dot; side: which side of the pole the text hangs.
const EMile = ({ v, d, n, note, tag, dir, side = 'l', y = 0 }: { v: string; d: number; n: number; note: string; tag?: string; dir: 'up' | 'down' | 'left'; side?: 'l' | 'r'; y?: number }) => {
  const x = E_X(d);
  const cy = E_Y(n);
  if (dir === 'left') {
    const tx = x - 36;
    return (
      <g className="ot ot-fade" style={{ animationDelay: '0.5s' }}>
        <line x1={x - 11} y1={cy} x2={x - 28} y2={cy} stroke={C.blueLine} strokeWidth={1.6} />
        <text x={tx} y={cy - 19} textAnchor="end" fontFamily={MONO} fontSize={20} fontWeight={650} fill={BLUE}>
          {v}
        </text>
        <text x={tx} y={cy + 7} textAnchor="end" fontFamily={MONO} fontSize={20} fill={C.inkHex}>
          {note}
        </text>
      </g>
    );
  }
  const tx = side === 'l' ? x - 14 : x + 14;
  const anchor = side === 'l' ? 'end' : 'start';
  const p1 = dir === 'down' ? cy + 11 : cy - 11;
  const p2 = dir === 'down' ? y + 32 : y - 17;
  return (
    <g className="ot ot-fade" style={{ animationDelay: `${0.5 + d * 0.04}s` }}>
      <line x1={x} y1={p1} x2={x} y2={p2} stroke={C.blueLine} strokeWidth={1.6} />
      <text x={tx} y={y} textAnchor={anchor} fontFamily={MONO} fontSize={20}>
        <tspan fill={BLUE} fontWeight={650}>
          {v}
        </tspan>
        {tag && <tspan fill={C.dim}>{`  ${tag}`}</tspan>}
      </text>
      <text x={tx} y={y + 26} textAnchor={anchor} fontFamily={MONO} fontSize={20} fill={C.inkHex}>
        {note}
      </text>
    </g>
  );
};

const ELegendDot = ({ minor, label }: { minor?: boolean; label: string }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden style={{ display: 'block' }}>
      <circle cx="9" cy="9" r={minor ? 7.6 : 5.6} fill={minor ? BLUE : '#FFFFFF'} stroke={BLUE} strokeWidth={minor ? 0 : 2.4} />
    </svg>
    {label}
  </span>
);

const Velocity: Page = () => (
  <Frame chapter={['05', 'what comes next']} source="pypi.org/project/opentide · github.com/OpenTideHQ/opentide/blob/development/CHANGELOG.md">
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <H>26 releases in four weeks.</H>
      <div style={{ display: 'flex', gap: 30, paddingBottom: 10, fontFamily: MONO, fontSize: 19, color: C.muted }}>
        <ELegendDot minor label="11 minor" />
        <ELegendDot label="15 patch" />
      </div>
    </div>
    <Lead>The stabilization window: bugs, docs, deployers, agent setup and migration. No new platforms.</Lead>
    <svg width={1680} height={652} viewBox="0 0 1680 652" aria-hidden style={{ display: 'block', marginTop: 22 }}>
      {/* the four-week stabilization window */}
      <rect x={E_X0} y={E_BAND_TOP} width={E_X29 - E_X0} height={E_AX - E_BAND_TOP} fill={C.paper} />
      <line x1={E_X0} y1={E_BAND_TOP} x2={E_X0} y2={E_AX} stroke={C.line2} strokeWidth={1.5} strokeDasharray="5 6" />
      <line x1={E_X29} y1={E_BAND_TOP} x2={E_X29} y2={E_AX} stroke={C.line2} strokeWidth={1.5} strokeDasharray="5 6" />
      <text x={E_X0 + 18} y={E_BAND_TOP + 32} fontFamily={MONO} fontSize={19} fill={BLUE}>
        stabilization window · sep 9 → oct 7
      </text>
      {/* time axis */}
      <line x1={E_T(-0.25)} y1={E_AX} x2={E_T(29.25)} y2={E_AX} stroke={C.line2} strokeWidth={2} />
      <path d={E_TICKS_DAY} stroke={C.line2} strokeWidth={1.4} />
      <path d={E_TICKS_WEEK} stroke={C.subtle} strokeWidth={2} />
      <EDate d={0} label="sep 9" />
      <EDate d={7} label="sep 16" />
      <EDate d={14} label="sep 23" />
      <EDate d={21} label="sep 30" />
      <EDate d={28} label="oct 7" />
      {/* cumulative releases, 1 → 26 */}
      <path className="ot ot-draw" pathLength={1} d={E_STEP} fill="none" stroke={BLUE} strokeWidth={3} strokeLinejoin="round" />
      {/* milestones */}
      <EMile v="0.1.0" d={0} n={1} dir="left" note="first public beta" />
      <EMile v="0.1.5" d={4} n={6} dir="up" side="r" y={330} note="weekly ATT&CK + MISP ingest" />
      <EMile v="0.4.0" d={14} n={13} dir="down" y={452} note="first-user bug sweep" />
      <EMile v="0.7.0" d={20} n={20} dir="down" y={290} note="share to MISP" />
      <EMile v="0.8.0" d={21} n={21} dir="down" y={360} note="strict CI gates" />
      <EMile v="0.9.0" d={26} n={24} dir="down" y={228} tag="rule::1.1" note="rule review dates" />
      <EMile v="0.11.0" d={28} n={26} dir="up" y={52} note="tenant query check" />
      {/* one marker per release */}
      <ERel v="0.1.0" d={0} n={1} minor />
      <ERel v="0.1.1" d={2} n={2} />
      <ERel v="0.1.2" d={2} n={3} />
      <ERel v="0.1.3" d={2} n={4} />
      <ERel v="0.1.4" d={4} n={5} />
      <ERel v="0.1.5" d={4} n={6} />
      <ERel v="0.1.6" d={6} n={7} />
      <ERel v="0.1.7" d={7} n={8} />
      <ERel v="0.1.8" d={7} n={9} />
      <ERel v="0.2.0" d={9} n={10} minor />
      <ERel v="0.2.1" d={9} n={11} />
      <ERel v="0.3.0" d={12} n={12} minor />
      <ERel v="0.4.0" d={14} n={13} minor />
      <ERel v="0.5.0" d={14} n={14} minor />
      <ERel v="0.6.0" d={14} n={15} minor />
      <ERel v="0.6.1" d={14} n={16} />
      <ERel v="0.6.2" d={15} n={17} />
      <ERel v="0.6.3" d={15} n={18} />
      <ERel v="0.6.4" d={19} n={19} />
      <ERel v="0.7.0" d={20} n={20} minor />
      <ERel v="0.8.0" d={21} n={21} minor />
      <ERel v="0.8.1" d={22} n={22} />
      <ERel v="0.8.2" d={23} n={23} />
      <ERel v="0.9.0" d={26} n={24} minor />
      <ERel v="0.10.0" d={27} n={25} minor />
      <ERel v="0.11.0" d={28} n={26} minor />
      <text x={E_X29 + 14} y={E_Y(26) + 11} style={{ fontFamily: DISPLAY }} fontSize={32} fontWeight={760} fill={BLUE}>
        26
      </text>
    </svg>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// ROADMAP — four themes, honest statuses
// ─────────────────────────────────────────────────────────────────────────────
type EStatus = 'accepted' | 'draft' | 'in progress' | 'planned';
const E_TONE: Record<EStatus, ChipTone> = { accepted: 'accent', draft: 'plain', 'in progress': 'solid', planned: 'ghost' };

const ERoadCol = ({ icon, name, children }: { icon: IconName; name: string; children: ReactNode }) => (
  <div style={{ width: 390, display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 18, borderBottom: `2.5px solid ${BLUE}` }}>
      <Icon name={icon} size={34} color={BLUE} />
      <span style={{ fontSize: 31, fontWeight: 720, letterSpacing: '-0.025em', color: INK }}>{name}</span>
    </div>
    {children}
  </div>
);

const ERoadItem = ({ title, detail, status, rfc }: { title: ReactNode; detail?: ReactNode; status: EStatus; rfc?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: '16px 0 18px', borderBottom: `1px solid ${C.line}` }}>
    <span style={{ fontSize: 25, fontWeight: 620, lineHeight: 1.25, letterSpacing: '-0.015em', color: INK }}>{title}</span>
    {detail && <span style={{ fontFamily: MONO, fontSize: 18, lineHeight: 1.45, color: C.muted }}>{detail}</span>}
    <span style={{ marginTop: 5 }}>
      <Chip tone={E_TONE[status]} size={17} style={status === 'planned' ? { color: C.subtle } : undefined}>
        {rfc ? `RFC ${rfc} · ${status}` : status}
      </Chip>
    </span>
  </div>
);

const ERoadRefs = ({ children }: { children: ReactNode }) => (
  <span style={{ width: 390, display: 'flex', alignItems: 'center', gap: 10, fontFamily: MONO, fontSize: 18, color: C.subtle }}>
    <Icon name="link" size={17} color={C.dim} />
    <span style={{ color: C.dim }}>issues</span>
    {children}
  </span>
);

const Roadmap: Page = () => (
  <Frame chapter={['05', 'what comes next']} source="github.com/OpenTideHQ/opentide/issues · github.com/OpenTideHQ/specifications/tree/main/rfcs">
    <H>Where opentide goes next.</H>
    <div style={{ display: 'flex', gap: 40, marginTop: 46 }}>
      <ERoadCol icon="plug" name="Platforms">
        <ERoadItem title="Elastic Security" detail="deploy via the detection engine" status="accepted" rfc="0007" />
        <ERoadItem title="Sysdig Secure" detail="Falco-native rule schema" status="draft" rfc="0004" />
        <div style={{ marginTop: 26, padding: '18px 22px 20px', background: C.paper, borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Label style={{ fontSize: 18 }}>today</Label>
          <span style={{ fontSize: 25, fontWeight: 620, letterSpacing: '-0.015em', color: INK }}>7 platforms</span>
          <span style={{ fontFamily: MONO, fontSize: 18, lineHeight: 1.45, color: C.muted }}>
            5 with a tenant query check
            <br />2 deploy-only
          </span>
        </div>
      </ERoadCol>
      <ERoadCol icon="editor" name="In the editor">
        <ERoadItem
          title="Native language server"
          detail={
            <>
              KQL · SPL · Tide YAML
              <br />
              Rust + tree-sitter
              <br />
              ships inside <span style={{ color: BLUE }}>opentide[lsp]</span>
            </>
          }
          status="in progress"
        />
        <ERoadItem title="VS Code extension" detail="replaces opentide setup vscode" status="planned" />
        <ERoadItem title="One-click agent plugins" detail="skills + MCP in one install" status="planned" />
      </ERoadCol>
      <ERoadCol icon="layers" name="A stronger model">
        <ERoadItem
          title={
            <>
              <M color={BLUE}>rule::2.0</M> alongside <M color={BLUE}>rule::1.x</M>
            </>
          }
          detail="both shapes in one workspace"
          status="planned"
        />
        <ERoadItem title="Portable rule validation" detail="a disabled platform warns, not fails" status="planned" />
        <ERoadItem title="Deployment state out of YAML" detail="vendor rule ids in state shards" status="planned" />
        <ERoadItem title="Schemas for config TOML" detail="Pydantic models + JSON Schema" status="planned" />
      </ERoadCol>
      <ERoadCol icon="rocket" name="Toward 1.0">
        <ERoadItem title="CoreTide shims removed" detail="legacy import paths end at 1.0" status="planned" />
        <ERoadItem title={<M>--logs json|verbose|debug</M>} detail="replaces --json, adds --version" status="planned" />
        <ERoadItem title="Per-platform skill packs" detail="sentinel-ops, splunk-ops, …" status="planned" />
        <ERoadItem title="RFC-driven specs" detail="issue → RFC → spec → PR" status="accepted" rfc="0001" />
      </ERoadCol>
    </div>
    <div style={{ display: 'flex', gap: 40, marginTop: 'auto' }}>
      <ERoadRefs>#386 · #143</ERoadRefs>
      <ERoadRefs>#332 · #431</ERoadRefs>
      <ERoadRefs>#394 · #410 · #396 · #374</ERoadRefs>
      <ERoadRefs>#187 · #50</ERoadRefs>
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// NORTH STAR — intel to reviewed, deployed detection in under an hour
// ─────────────────────────────────────────────────────────────────────────────
const E_TRACK = 236; // track centre line inside the flow box
const E_S = [100, 311, 523, 734, 946, 1157, 1369, 1580]; // stop centres: intel → PRODUCTION

type EStopKind = 'intel' | 'agent' | 'engine' | 'gate';
const E_STOP_STYLE: Record<EStopKind, { bg: string; line: string; fg: string; size: number; radius: number }> = {
  intel: { bg: C.paper, line: C.line2, fg: C.muted, size: 72, radius: 999 },
  agent: { bg: BLUE, line: BLUE, fg: '#FFFFFF', size: 72, radius: 999 },
  engine: { bg: '#FFFFFF', line: BLUE, fg: BLUE, size: 72, radius: 999 },
  gate: { bg: C.inkHex, line: C.inkHex, fg: '#FFFFFF', size: 88, radius: 22 },
};

// One stop on the intel → production line. Gates are human; everything else is machine time.
const EStop = ({ x, kind, icon, title, detail }: { x: number; kind: EStopKind; icon: IconName; title: string; detail: ReactNode }) => {
  const s = E_STOP_STYLE[kind];
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: x - s.size / 2,
          top: E_TRACK - s.size / 2,
          width: s.size,
          height: s.size,
          boxSizing: 'border-box',
          borderRadius: s.radius,
          background: s.bg,
          border: `2px solid ${s.line}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={kind === 'gate' ? 40 : 32} color={s.fg} stroke={2} />
      </div>
      <div style={{ position: 'absolute', left: x - 115, top: E_TRACK + 62, width: 230, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <span style={{ fontSize: 25, fontWeight: 680, letterSpacing: '-0.02em', color: INK, whiteSpace: 'nowrap' }}>{title}</span>
        <span style={{ marginTop: 8, fontFamily: MONO, fontSize: 17, lineHeight: 1.5, color: C.muted, whiteSpace: 'nowrap' }}>{detail}</span>
      </div>
    </>
  );
};

// Labelled span above the track: a measured fact or a target.
const ESpan = ({ x1, x2, y, tag, text, sub, accent }: { x1: number; x2: number; y: number; tag: string; text: string; sub?: string; accent?: boolean }) => (
  <>
    <svg width={1680} height={20} viewBox="0 0 1680 20" aria-hidden style={{ position: 'absolute', left: 0, top: y, display: 'block' }}>
      <path d={`M${x1} 18 V4 H${x2} V18`} fill="none" stroke={accent ? BLUE : C.inkHex} strokeWidth={2} strokeLinejoin="round" />
    </svg>
    <div style={{ position: 'absolute', left: x1, top: y - (sub ? 58 : 34), display: 'flex', flexDirection: 'column', gap: 4, fontFamily: MONO, fontSize: 19, whiteSpace: 'nowrap' }}>
      <span>
        <span style={{ color: accent ? BLUE : C.inkHex, fontWeight: 650 }}>{tag}</span>
        <span style={{ color: INK }}>{`  ${text}`}</span>
      </span>
      {sub && <span style={{ color: C.dim, fontSize: 17 }}>{sub}</span>}
    </div>
  </>
);

const ELegendLine = ({ human, label }: { human?: boolean; label: string }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
    <svg width="48" height="12" viewBox="0 0 48 12" aria-hidden style={{ display: 'block' }}>
      {human ? (
        <path d="M3 6 H45" stroke={C.inkHex} strokeWidth={4} strokeDasharray="2 9" strokeLinecap="round" />
      ) : (
        <path d="M3 6 H45" stroke={BLUE} strokeWidth={6} strokeLinecap="round" />
      )}
    </svg>
    {label}
  </span>
);

const NorthStar: Page = () => (
  <Frame chapter={['05', 'what comes next']} source="opentide @ FIRST CTI 2026 · opentide @ CERT-EU AI workshop, June 2026">
    <H>
      The north star: intel to reviewed,
      <br />
      deployed detection in <A>under an hour</A>.
    </H>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ position: 'relative', height: 392 }}>
        <ESpan x1={E_S[0]} x2={E_S[5]} y={40} tag="target" text="sub-hour from intel to STAGING, a human approving every promotion" accent />
        <ESpan x1={E_S[1]} x2={E_S[3]} y={140} tag="today" text="~15 min per agent-authored PR" sub="AgenTide trials, FIRST CTI 2026" />
        <div style={{ position: 'absolute', right: 0, top: 4, display: 'flex', flexDirection: 'column', gap: 14, fontFamily: MONO, fontSize: 18, color: C.muted }}>
          <ELegendLine label="agents + engine" />
          <ELegendLine human label="waiting on a human" />
        </div>
        <svg width={1680} height={392} viewBox="0 0 1680 392" aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'block' }}>
          <path d={`M${E_S[0]} ${E_TRACK} H${E_S[3]}`} stroke={BLUE} strokeWidth={6} strokeLinecap="round" />
          <path d={`M${E_S[3]} ${E_TRACK} H${E_S[4]}`} stroke={C.inkHex} strokeWidth={4} strokeDasharray="2 10" strokeLinecap="round" />
          <path d={`M${E_S[4]} ${E_TRACK} H${E_S[5]}`} stroke={BLUE} strokeWidth={6} />
          <path d={`M${E_S[5]} ${E_TRACK} H${E_S[6]}`} stroke={C.inkHex} strokeWidth={4} strokeDasharray="2 10" strokeLinecap="round" />
          <path d={`M${E_S[6]} ${E_TRACK} H${E_S[7]}`} stroke={BLUE} strokeWidth={6} strokeLinecap="round" />
        </svg>
        <EStop x={E_S[0]} kind="intel" icon="intel" title="Intel lands" detail={<>SOC Prime report<br />Threat of the Month</>} />
        <EStop x={E_S[1]} kind="agent" icon="agent" title="Agent drafts" detail={<>the chain, in YAML<br />skills + MCP</>} />
        <EStop x={E_S[2]} kind="engine" icon="check" title="Engine validates" detail={<>validate --strict<br />validate query --live</>} />
        <EStop x={E_S[3]} kind="agent" icon="merge" title="PR opened" detail={<>branch + diff<br />CI gates run</>} />
        <EStop x={E_S[4]} kind="gate" icon="lock" title="Human review" detail={<>a reviewer<br />approves the merge</>} />
        <EStop x={E_S[5]} kind="engine" icon="rocket" title="STAGING" detail={<>on merge<br />--plan STAGING</>} />
        <EStop x={E_S[6]} kind="gate" icon="lock" title="Human approves" detail={<>promotion needs<br />its own approval</>} />
        <EStop x={E_S[7]} kind="engine" icon="rule" title="PRODUCTION" detail={<>protected env<br />--plan PRODUCTION</>} />
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, padding: '26px 36px', background: C.paper, borderRadius: 18 }}>
      <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.028em', color: ACC }}>“You choose how much runs with you — and how much runs on its own.”</span>
      <span style={{ fontFamily: MONO, fontSize: 19, color: C.subtle, whiteSpace: 'nowrap' }}>opentide.org</span>
    </div>
  </Frame>
);

// ─────────────────────────────────────────────────────────────────────────────
// GET STARTED — five commands
// ─────────────────────────────────────────────────────────────────────────────
const E_START = `# pin the engine, with the MCP server extra
$ pip install 'opentide[mcp]==0.11.0'

# scaffold a detection repo: Sentinel + GitHub CI
$ opentide setup --yes --platform sentinel --ci github

# wire your agent in: writes .mcp.json
$ opentide setup mcp --claude-code --yes

# schemas, templates, vocabularies, snippets
$ opentide generate

# the same strict gate your CI runs
$ opentide validate --strict`;

const ELink = ({ icon, label, value }: { icon: IconName; label: string; value: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '15px 0', borderTop: `1px solid ${C.line}` }}>
    <Icon name={icon} size={28} color={BLUE} />
    <span style={{ width: 150, fontFamily: MONO, fontSize: 18, color: C.dim }}>{label}</span>
    <span style={{ fontFamily: MONO, fontSize: 21, color: INK }}>{value}</span>
  </div>
);

const GetStarted: Page = () => (
  <Frame chapter={['05', 'what comes next']} source="opentide.org/docs/usage/quickstart">
    <H>Start in five commands.</H>
    <Lead>From an empty folder to a validated detection repo, with your agent wired in.</Lead>
    <div style={{ display: 'flex', gap: 64, marginTop: 40 }}>
      <Code
        lang="bash"
        variant="navy"
        size={23}
        lh={1.6}
        title={
          <>
            <Icon name="terminal" size={18} color={NV.muted} /> a new detection repo
          </>
        }
        tag="python 3.10 – 3.14"
        code={E_START}
        style={{ width: 940 }}
        bodyStyle={{ padding: '20px 26px' }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ELink icon="globe" label="home" value="opentide.org" />
        <ELink icon="book" label="docs" value="opentide.org/docs/usage" />
        <ELink icon="branch" label="source" value="github.com/OpenTideHQ" />
        <ELink icon="package" label="package" value="pypi.org/project/opentide" />
        <ELink icon="archive" label="from CoreTide" value="opentide.org/docs/usage/migration" />
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 28, marginTop: 26, paddingTop: 26, borderTop: `1px solid ${C.line}` }}>
          <div style={{ padding: 16, background: '#FFFFFF', border: `1px solid ${C.line2}`, borderRadius: 16 }}>
            <img src={qrOpentide} alt="QR code: opentide.org" style={{ width: 216, height: 216, display: 'block' }} />
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

// ─────────────────────────────────────────────────────────────────────────────
// CLOSE — high tide
// ─────────────────────────────────────────────────────────────────────────────
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
        Ontology, taxonomy, engine and gates. Open source, EUPL-1.2, forever free.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginTop: 30, fontFamily: MONO, fontSize: 23, color: INK }}>
        <ECloseLink icon="globe">opentide.org</ECloseLink>
        <ECloseLink icon="branch">github.com/OpenTideHQ</ECloseLink>
        <ECloseLink icon="terminal">pip install opentide</ECloseLink>
      </div>
    </div>
    <Footer onTide />
  </Stage>
);

// ─────────────────────────────────────────────────────────────────────────────
const PAGES_E: Page[] = [DividerNext, Velocity, Roadmap, NorthStar, GetStarted, Close];
const NOTES_E: string[] = [
  `Last chapter: what comes next.
The four-week stabilization window that opened with 0.1.0 on September 9 closed on October 7 with 0.11.0.
From here the work points three ways: more platforms, tooling inside the editor, and the road to 1.0.
First, a quick look at how those four weeks went.`,
  `Twenty-six releases in four weeks, all on PyPI: 0.1.0, the first public beta, on September 9, through 0.11.0 on October 7.
Filled dots are minors, hollow dots are patches; the window allowed bugs, docs, deployers, agent setup and migration, and no new platforms.
The milestones: weekly ATT&CK and MISP ingest in 0.1.5, the first-user bug sweep in 0.4.0, sharing to MISP in 0.7.0, strict CI gates in 0.8.0, review dates in rule::1.1 with 0.9.0, and in 0.11.0 the query check became a check against the tenant.
Behind the curve: 150 merged pull requests since 0.1.0, 133 of them from cloud-agent branches, every one merged by a maintainer.
So where does it go from here?`,
  `Four directions, all tracked in public issues and RFCs, with clear statuses: planned means planned.
Platforms: Elastic Security has an accepted RFC; Sysdig Secure with Falco-native rules is still a draft.
In the editor: a native language server for KQL, SPL and Tide YAML, in Rust on tree-sitter, shipping inside opentide[lsp], then a VS Code extension and one-click agent plugins for skills plus MCP.
A stronger model: rule::2.0 next to rule::1.x, portable validation, deployment state out of the YAML, and schemas for configuration.
Toward 1.0: the legacy CoreTide shims go, a --logs flag replaces --json, skills come as per-platform packs, and every spec change keeps going through an RFC.
All of it serves one north star.`,
  `The north star, stated at the CERT-EU AI workshop in June: intel to a reviewed, deployed detection in under an hour.
Read the line left to right: blue is agents and the engine, and it is short; the ink locks are human gates, and they stay.
Today we measure about fifteen minutes per agent-authored pull request: six agent PRs and thirty-plus objects in the AgenTide trials we showed at FIRST CTI.
The target is sub-hour from intel to staging, with a human approving every promotion to production.
As opentide.org puts it: you choose how much runs with you, and how much runs on its own.`,
  `You can start today, in five commands, from an empty folder.
Pin the engine with the MCP extra, scaffold a repo with a platform and CI, wire your agent to the MCP server, generate schemas and templates, then run the same strict gate your CI runs.
The docs, the quickstart and the CoreTide migration guide are on opentide.org; the code is under OpenTideHQ on GitHub and the package is on PyPI.
Scan the code for opentide.org.`,
  `Agents write the queries; that part is now cheap.
What opentide adds is spec-driven detection engineering: an ontology and a taxonomy, threat alignment, quality gates, and speed you can maintain.
It is open source under EUPL-1.2, and forever free.
So: pip install opentide, point your agent at it, and open your first pull request this week.
Issues, RFCs and pull requests are open at github.com/OpenTideHQ. Thank you.`,
];

Cover.transition = tideReveal;
DividerWhy.transition = tideReveal;
DividerWhat.transition = tideReveal;
DividerWhyNow.transition = tideReveal;
DividerAgents.transition = tideReveal;
DividerNext.transition = tideReveal;
Close.transition = tideReveal;

// ─────────────────────────────────────────────────────────────────────────────
// Deck
// ─────────────────────────────────────────────────────────────────────────────
export const meta: SlideMeta = {
  title: 'opentide — the engine behind agentic detection engineering',
  createdAt: '2026-10-08T13:43:24.053Z',
  theme: 'opentide-coastal',
};

// Speaker notes, index-aligned with the page list below (one array per chapter).
export const notes: (string | undefined)[] = [...NOTES_A, ...NOTES_B, ...NOTES_C, ...NOTES_D, ...NOTES_E];

export default [
  // 00 · opening
  Cover,
  Thesis,
  // 01 · why it matters
  DividerWhy,
  Gap,
  FailureModes,
  Heatmaps,
  Commodity,
  // 02 · what opentide is
  DividerWhat,
  SpecStack,
  ObjectModel,
  YamlChain,
  Signals,
  Lifecycle,
  Platforms,
  ThreeDoors,
  Ecosystem,
  // 03 · why we re-released it
  DividerWhyNow,
  Heritage,
  Backlog,
  Submodule,
  TideKit,
  WhyCLI,
  Archived,
  AgentNeeds,
  CliContract,
  SetupWires,
  // 04 · agentic detection engineering
  DividerAgents,
  AgentLoop,
  WalkSession,
  WalkCI,
  Honesty,
  Guardrails,
  Dogfood,
  // 05 · what comes next
  DividerNext,
  Velocity,
  Roadmap,
  NorthStar,
  GetStarted,
  Close,
] satisfies Page[];
