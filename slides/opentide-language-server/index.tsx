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
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import InterUrl from '@assets/fonts/Inter-Variable-latin.woff2';
import MonoUrl from '@assets/fonts/JetBrainsMono-Variable-latin.woff2';
import logoNormal from '@assets/brand/logo-normal.svg';

// ─────────────────────────────────────────────────────────────────────────────
// opentide language server — how the Rust engine reads a detection query:
// tokens, a syntax tree, then analyzers. For a mixed, mostly non-engineering
// audience. Theme: themes/opentide-coastal.md. Shared chrome, code blocks,
// icons and the ASCII tide are copied from slides/opentide-workshop.
// Facts: opentidehq/language-server 0.10.0 (crates, grammars, catalogs,
// CHANGELOG) and opentidehq/opentide analysis/Cargo.toml.
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
const FONT_STYLE_ID = 'osd-fonts-opentide-language-server';
const FONT_CSS = `
@font-face{font-family:'Inter';src:url(${InterUrl}) format('woff2');font-weight:100 900;font-style:normal;font-display:block;}
@font-face{font-family:'JetBrains Mono';src:url(${MonoUrl}) format('woff2');font-weight:100 800;font-style:normal;font-display:block;}
`;
const MOTION_STYLE_ID = 'osd-motion-opentide-language-server';
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
  'DeviceProcessEvents | where FileName =~ "lsass.exe" | project Timestamp, DeviceName',
  'index=main sourcetype=sysmon | stats count by host   FROM logs-* | WHERE process.name == "lsass.exe"',
  'source_file query tabular_expression tabular_primary tabular_operator where_operator comparison_expression',
  'kql_unknown_column  kql_table_not_declared  spl_unknown_command  esql_metadata_id  ecs_unknown_field',
  'opentide-core opentide-syntax opentide-kql opentide-spl opentide-esql opentide-eql opentide-analysis opentide-lsp',
].join('   ') + '   ';
const Q_TOK = [
  'identifier "|" "where" identifier "=~" string "|" "project" identifier "," identifier',
  '@type @operator.pipe @keyword @variable @operator @string @punctuation.delimiter',
  '0..19 20..21 22..27 28..36 37..39 40..51 52..53 54..61 62..71 71..72 73..83',
].join('   ') + '   ';
const Q_TREE = [
  'source_file query tabular_expression tabular_primary identifier tabular_operator where_operator',
  'comparison_expression string project_operator project_item ERROR MISSING',
  'parser.parse(source, None)  first_error()  walk_with_ancestors  ByteSpan::new(start, end)',
].join('   ') + '   ';
const Q_ANA = [
  'kql_parse_error kql_unknown_table kql_table_not_declared kql_unknown_column kql_where_not_first',
  'kql_control_command_unsupported invalid_ref duplicate_id spl_unknown_command ecs_type_mismatch',
  'catalogs/kql/defender/columns.toml visibility.toml Declared Undeclared Unchecked',
].join('   ') + '   ';
const Q_CLOSE = [Q_COVER, Q_TREE, Q_ANA].join('   ');

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
        <span style={{ color: C.dim }}>/ 03</span>
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
// Language-server patterns: a clock for scripted motion, the sample query,
// its tokens and its tree (node kinds from grammars/tree-sitter-opentide-kql,
// captures from highlights/queries/kql/highlights.scm).
// ─────────────────────────────────────────────────────────────────────────────

// Milliseconds since this page became active. Inactive instances (thumbnails,
// overview, presenter preview, PDF, automated screenshots) and reduced motion
// get the settled end state, so a still frame always shows the finished picture.
const settledHere = () =>
  typeof window === 'undefined' ||
  (typeof navigator !== 'undefined' && navigator.webdriver && !new URLSearchParams(window.location.search).has('motion')) ||
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const useClock = (total: number, loop = false) => {
  const active = useIsActivePage();
  const [t, setT] = useState(total);
  useEffect(() => {
    if (!active || settledHere()) {
      setT(total);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    setT(0);
    const tick = (now: number) => {
      const e = now - t0;
      if (loop) {
        setT(e % total);
        raf = requestAnimationFrame(tick);
      } else {
        setT(Math.min(e, total));
        if (e < total) raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, total, loop]);
  return t;
};
const ease = (x: number) => 1 - Math.pow(1 - clampN(x, 0, 1), 3);
const prog = (t: number, start: number, dur: number) => ease((t - start) / dur);

const QUERY = 'DeviceProcessEvents\n| where FileName =~ "lsass.exe"\n| project Timestamp, DeviceName';

type Cap = 'type' | 'operator.pipe' | 'keyword' | 'variable' | 'operator' | 'string' | 'punctuation.delimiter';
const CAP: Record<Cap, { fg: string; bg: string; line: string; say: string }> = {
  type: { fg: '#FFFFFF', bg: BLUE, line: BLUE, say: 'A table: where the rows come from.' },
  'operator.pipe': { fg: C.muted, bg: C.paper2, line: C.dim, say: 'A pipe: hand the rows to the next step.' },
  keyword: { fg: BLUE, bg: '#E6EBF7', line: BLUE, say: 'An instruction KQL knows: filter, keep columns.' },
  variable: { fg: '#0A0F24', bg: '#FFFFFF', line: C.blueMid, say: 'A column name. Whether it exists is checked later.' },
  operator: { fg: C.blueMid, bg: '#EEF1FA', line: C.blueMid, say: 'A comparison: equal, ignoring case.' },
  string: { fg: '#8A4B00', bg: '#FBF3E8', line: '#B26A00', say: 'A literal value, kept exactly as written.' },
  'punctuation.delimiter': { fg: C.dim, bg: C.paper2, line: C.dim, say: 'A separator between two items.' },
};

type Tok = { text: string; start: number; end: number; kind: string; cap: Cap };
const TOKENS: Tok[] = (() => {
  const out: Tok[] = [];
  const rx = /"[^"]*"|=~|\||,|[A-Za-z_][A-Za-z0-9_]*/g;
  let m: RegExpExecArray | null;
  const KEYWORDS = new Set(['where', 'project']);
  while ((m = rx.exec(QUERY)) !== null) {
    const text = m[0];
    const start = m.index;
    let kind = 'identifier';
    let cap: Cap = 'variable';
    if (text.startsWith('"')) [kind, cap] = ['string', 'string'];
    else if (text === '|') [kind, cap] = ['"|"', 'operator.pipe'];
    else if (text === '=~') [kind, cap] = ['"=~"', 'operator'];
    else if (text === ',') [kind, cap] = ['","', 'punctuation.delimiter'];
    else if (KEYWORDS.has(text)) [kind, cap] = [`"${text}"`, 'keyword'];
    else if (start === 0) cap = 'type';
    out.push({ text, start, end: start + text.length, kind, cap });
  }
  return out;
})();

// The query, rendered character-true, with a per-token style hook.
const QueryText = ({ size, style, tokStyle, plainColor = C.dim }: { size: number; style?: CSSProperties; tokStyle: (t: Tok, i: number) => CSSProperties | undefined; plainColor?: string }) => {
  const parts: ReactNode[] = [];
  let at = 0;
  TOKENS.forEach((t, i) => {
    if (t.start > at) parts.push(<span key={`g${i}`} style={{ color: plainColor }}>{QUERY.slice(at, t.start)}</span>);
    parts.push(
      <span key={`t${i}`} data-tok={i} style={{ borderRadius: 6, transition: 'background 220ms, color 220ms, box-shadow 220ms', ...tokStyle(t, i) }}>
        {t.text}
      </span>,
    );
    at = t.end;
  });
  return <div style={{ fontFamily: MONO, fontSize: size, lineHeight: 1.75, whiteSpace: 'pre', fontVariantLigatures: 'none', color: INK, ...style }}>{parts}</div>;
};

const Kicker = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div style={{ fontFamily: MONO, fontSize: 18, color: C.dim, letterSpacing: '0.01em', ...style }}>{children}</div>
);

const Card = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div style={{ background: '#FFFFFF', border: `1px solid ${C.line}`, borderRadius: 18, boxShadow: '0 1px 0 rgba(0,20,137,0.04), 0 18px 40px -28px rgba(0,20,137,0.28)', ...style }}>{children}</div>
);

// ─────────────────────────────────────────────────────────────────────────────
// 00 · COVER
// ─────────────────────────────────────────────────────────────────────────────
const Cover: Page = () => (
  <Stage>
    <TideCanvas text={Q_COVER} fill={0.22} seed={0.47} maskTop={0.29} ink={BLUE} bg="#FFFFFF" />
    <img src={logoNormal} alt="opentide" style={{ position: 'absolute', left: 120, top: 92, height: 62, display: 'block' }} />
    <div style={{ position: 'absolute', right: 120, top: 92, height: 62, display: 'flex', alignItems: 'center', gap: 14, fontFamily: MONO, fontSize: 20, color: C.muted }}>
      <span>deep dive</span>
      <span style={{ color: C.dim }}>·</span>
      <span>language server 0.10.0</span>
      <span style={{ color: C.dim }}>·</span>
      <span>Rust</span>
    </div>
    <h1 style={{ position: 'absolute', left: 120, top: 208, margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 'var(--osd-size-hero)', lineHeight: 0.98, letterSpacing: '-0.05em', color: INK }}>
      How opentide
      <br />
      <span style={{ color: ACC }}>reads</span> a query.
    </h1>
    <p style={{ position: 'absolute', left: 120, top: 520, width: 1300, margin: 0, fontSize: 32, lineHeight: 1.45, color: C.muted, letterSpacing: '-0.01em' }}>
      Inside the language server: a Rust engine that cuts every detection query into tokens, builds a syntax tree, and runs
      analyzers on it while you type.
    </p>
  </Stage>
);

// ─────────────────────────────────────────────────────────────────────────────
// 00 · AS YOU TYPE — editor mock: the typo is typed, flagged, explained.
// ─────────────────────────────────────────────────────────────────────────────
const ED_TYPED = '| where FileNam =~ "lsass.exe"';
const LANGS = ['KQL', 'SPL', 'ES|QL', 'EQL', 'Kibana KQL', 'Lucene', 'Falco', 'Tide YAML'];

const AsYouType: Page = () => {
  const t = useClock(5200);
  const [hover, setHover] = useState(false);
  const typed = Math.round(clampN((t - 500) / 1900, 0, 1) * ED_TYPED.length);
  const done = typed >= ED_TYPED.length;
  const squig = prog(t, 2700, 600);
  const pop = hover || t > 3300;
  const line = ED_TYPED.slice(0, typed);
  const typoAt = ED_TYPED.indexOf('FileNam');
  const rows: [string, ReactNode][] = [
    ['1', <><span style={{ color: BLUE }}>name</span><span style={{ color: C.dim }}>:</span> LSASS process access</>],
    ['2', <><span style={{ color: BLUE }}>configurations</span><span style={{ color: C.dim }}>:</span></>],
    ['3', <>  <span style={{ color: BLUE }}>defender_for_endpoint</span><span style={{ color: C.dim }}>:</span></>],
    ['4', <>    <span style={{ color: BLUE }}>query</span><span style={{ color: C.dim }}>: |</span></>],
    ['5', <>      <span style={{ color: '#FFFFFF', background: BLUE, borderRadius: 5, padding: '0 4px' }}>DeviceProcessEvents</span></>],
    [
      '6',
      <>
        {'      '}
        {line.length <= typoAt ? (
          <span>{line}</span>
        ) : (
          <>
            <span>{line.slice(0, typoAt)}</span>
            <span
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              style={{ position: 'relative', cursor: 'help', background: done ? 'rgba(198,47,63,0.08)' : undefined, borderRadius: 4 }}
            >
              {line.slice(typoAt, typoAt + 7)}
              {done && (
                <svg width="100%" height="10" viewBox="0 0 100 10" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, bottom: -6, overflow: 'visible' }}>
                  <path d="M0 5 Q 3 0 6 5 T 12 5 T 18 5 T 24 5 T 30 5 T 36 5 T 42 5 T 48 5 T 54 5 T 60 5 T 66 5 T 72 5 T 78 5 T 84 5 T 90 5 T 96 5 T 100 5" fill="none" stroke={C.red} strokeWidth={2} vectorEffect="non-scaling-stroke" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - squig} />
                </svg>
              )}
            </span>
            <span>{line.slice(typoAt + 7)}</span>
          </>
        )}
        {!done && <span className="ot-caret" style={{ display: 'inline-block', width: 3, height: 34, background: BLUE, verticalAlign: -6, marginLeft: 2 }} />}
      </>,
    ],
    ['7', <>      | <span style={{ color: BLUE }}>project</span> Timestamp, DeviceName</>],
  ];
  return (
    <Frame chapter={['00', 'why it matters']} source="opentidehq/language-server · crates/opentide-kql/src/schema.rs · kql_unknown_column">
      <div style={{ display: 'flex', gap: 64, height: '100%' }}>
        <div style={{ width: 600, flex: '0 0 auto', paddingTop: 10 }}>
          <H size={68}>Every keystroke, checked.</H>
          <Lead maxWidth={600}>
            Between your editor and your detections sits a small, fast program: the language server. It reads the query the way the
            platform will, and tells you what is wrong before anything runs.
          </Lead>
          <Kicker style={{ marginTop: 44 }}>eight languages, one engine</Kicker>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
            {LANGS.map((l, i) => (
              <Chip key={l} tone={i === 0 ? 'solid' : 'accent'} size={20} style={{ opacity: prog(t, 200 + i * 90, 400), transform: `translateY(${(1 - prog(t, 200 + i * 90, 400)) * 10}px)` }}>
                {l}
              </Chip>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <Card style={{ position: 'absolute', inset: '20px 0 70px 0', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 22px', borderBottom: `1px solid ${C.line}`, background: C.paper, fontFamily: MONO, fontSize: 17, color: C.muted }}>
              <span style={{ width: 12, height: 12, borderRadius: 99, background: C.line2 }} />
              <span style={{ width: 12, height: 12, borderRadius: 99, background: C.line2 }} />
              <span style={{ width: 12, height: 12, borderRadius: 99, background: C.line2, marginRight: 10 }} />
              objects/rules/lsass-process-access.yaml
              <span style={{ marginLeft: 'auto', color: C.dim }}>opentide-lsp · stdio</span>
            </div>
            <div style={{ padding: '26px 0', fontFamily: MONO, fontSize: 28, lineHeight: 1.85, whiteSpace: 'pre', fontVariantLigatures: 'none', color: INK }}>
              {rows.map(([n, r]) => (
                <div key={n} style={{ display: 'flex', background: n === '6' ? 'rgba(0,20,137,0.035)' : undefined }}>
                  <span style={{ width: 70, textAlign: 'right', paddingRight: 26, color: C.dim, flex: '0 0 auto' }}>{n}</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
            {/* hover card */}
            <div
              style={{
                position: 'absolute',
                left: 200,
                top: 470,
                width: 720,
                background: '#FFFFFF',
                border: `1px solid ${C.redLine}`,
                borderRadius: 14,
                boxShadow: '0 24px 60px -24px rgba(10,15,36,0.35)',
                padding: '20px 24px',
                opacity: pop ? 1 : 0,
                transform: `translateY(${pop ? 0 : 12}px) scale(${pop ? 1 : 0.98})`,
                transition: 'opacity 320ms cubic-bezier(0.16,1,0.3,1), transform 320ms cubic-bezier(0.16,1,0.3,1)',
                pointerEvents: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Chip tone="warn" size={17}>error</Chip>
                <M size={20} color={C.red}>kql_unknown_column</M>
              </div>
              <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 22, color: INK, whiteSpace: 'nowrap' }}>'FileNam' is not a column of DeviceProcessEvents</div>
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12, fontSize: 21, color: C.muted }}>
                <Icon name="spark" size={20} color={BLUE} />
                Near miss of a catalog column: <M color={BLUE} size={21}>FileName</M>
              </div>
            </div>
          </Card>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', gap: 28, fontFamily: MONO, fontSize: 19, color: C.muted }}>
            {[
              ['check', 'diagnostics'],
              ['eye', 'hover'],
              ['spark', 'completion'],
              ['layers', 'semantic tokens'],
              ['link', 'go to definition'],
            ].map(([ic, l], i) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 9, opacity: 0.35 + 0.65 * prog(t, 3600 + i * 120, 400) }}>
                <Icon name={ic as IconName} size={20} color={BLUE} />
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 00 · PIPELINE — four stages, a pulse runs through, hover explains.
// ─────────────────────────────────────────────────────────────────────────────
const STAGES: { icon: IconName; title: string; mono: string; say: string; detail: string }[] = [
  { icon: 'editor', title: 'Text', mono: 'edits from the editor', say: 'You type. The editor sends only what changed.', detail: 'Incremental sync: each keystroke arrives as a small edit, positions counted in UTF-16 the way editors count them.' },
  { icon: 'layers', title: 'Tokens', mono: 'kind + byte span', say: 'The text is cut into words the language knows.', detail: 'A lexer generated from the grammar tags every piece: identifier, keyword, string, pipe. Each keeps its exact start and end byte.' },
  { icon: 'branch', title: 'Syntax tree', mono: 'tree-sitter', say: 'Words are grouped by what belongs to what.', detail: 'The parser nests the tokens into a tree: this filter belongs to that step of that query. Half-typed text still makes a tree.' },
  { icon: 'search', title: 'Analyzers', mono: 'catalogs + checks', say: 'Checks ask questions of the tree.', detail: 'Does the table exist on this platform? Is this column real? Is the filter in the right place? Each answer is a named diagnostic.' },
  { icon: 'eye', title: 'Answers', mono: 'diagnostics · hover', say: 'Red lines, hovers and suggestions in your editor.', detail: 'Every finding carries a code, a severity and the exact range, so the editor underlines the right characters.' },
];

const Pipeline: Page = () => {
  const t = useClock(10000, true);
  const [hover, setHover] = useState<number | null>(null);
  const auto = Math.floor(t / 2000) % STAGES.length;
  const cur = hover ?? auto;
  const W = 300;
  const GAP = (1680 - W * 5) / 4;
  const pulseX = ((t % 2000) / 2000) * (W + GAP);
  return (
    <Frame chapter={['00', 'the pipeline']} source="opentidehq/language-server · docs/ARCHITECTURE.md">
      <H>From keystroke to red line.</H>
      <Lead>The same pipeline runs for every language. Hover a step.</Lead>
      <div style={{ position: 'relative', height: 330, marginTop: 64 }}>
        <div style={{ position: 'absolute', left: W / 2, right: W / 2, top: 150, height: 2, background: C.line2 }} />
        <div style={{ position: 'absolute', left: W / 2, top: 150, height: 2, width: cur * (W + GAP), background: BLUE, transition: 'width 500ms cubic-bezier(0.16,1,0.3,1)' }} />
        {hover === null && auto < STAGES.length - 1 && (
          <div style={{ position: 'absolute', left: W / 2 + auto * (W + GAP) + pulseX - 9, top: 142, width: 18, height: 18, borderRadius: 99, background: BLUE, boxShadow: '0 0 0 8px rgba(0,20,137,0.12)' }} />
        )}
        {STAGES.map((s, i) => {
          const on = i === cur;
          const past = i <= cur;
          return (
            <div
              key={s.title}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{
                position: 'absolute',
                left: i * (W + GAP),
                top: 0,
                width: W,
                height: 300,
                borderRadius: 20,
                background: on ? BLUE : '#FFFFFF',
                border: `1.5px solid ${past ? BLUE : C.line2}`,
                color: on ? '#FFFFFF' : INK,
                padding: '26px 26px',
                boxSizing: 'border-box',
                cursor: 'pointer',
                transform: `translateY(${on ? -10 : 0}px)`,
                boxShadow: on ? '0 30px 60px -30px rgba(0,20,137,0.55)' : 'none',
                transition: 'all 360ms cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Icon name={s.icon} size={40} color={on ? '#FFFFFF' : BLUE} stroke={1.6} />
                <span style={{ fontFamily: MONO, fontSize: 20, color: on ? 'rgba(255,255,255,0.7)' : C.dim }}>{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div style={{ marginTop: 22, fontSize: 34, fontWeight: 720, letterSpacing: '-0.025em' }}>{s.title}</div>
              <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 18, color: on ? 'rgba(255,255,255,0.78)' : C.muted }}>{s.mono}</div>
              <div style={{ marginTop: 14, fontSize: 21, lineHeight: 1.35, color: on ? 'rgba(255,255,255,0.92)' : C.muted }}>{s.say}</div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'flex-start', gap: 28, paddingTop: 30, borderTop: `1px solid ${C.line}` }}>
        <span style={{ fontFamily: MONO, fontSize: 22, color: ACC, paddingTop: 6 }}>{String(cur + 1).padStart(2, '0')} · {STAGES[cur].title.toLowerCase()}</span>
        <p key={cur} className="ot ot-rise" style={{ margin: 0, fontSize: 32, lineHeight: 1.45, color: INK, maxWidth: 1300, letterSpacing: '-0.01em' }}>
          {STAGES[cur].detail}
        </p>
      </div>
    </Frame>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 01 · TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const DividerTokens: Page = () => (
  <Divider n="01" chapter="tokens" title={<>Cut the text<br />into <span style={{ color: ACC }}>tokens</span>.</>} sub="Before it can understand anything, the engine has to know where each word starts, where it ends, and what kind of word it is." fill={0.2} text={Q_TOK} seed={0.62} />
);

const TOK_MS = 260;
const Lexer: Page = () => {
  const t = useClock(600 + TOKENS.length * TOK_MS + 600);
  const [hover, setHover] = useState<number | null>(null);
  const scanned = Math.floor((t - 600) / TOK_MS) + 1;
  const sel = hover ?? (scanned >= TOKENS.length ? 5 : Math.max(0, Math.min(scanned - 1, TOKENS.length - 1)));
  const tok = TOKENS[sel];
  const cap = CAP[tok.cap];
  return (
    <Frame chapter={['01', 'tokens']} source="grammars/tree-sitter-opentide-kql/grammar.js · highlights/queries/kql/highlights.scm">
      <H>One pass, left to right.</H>
      <Lead>The lexer reads the query once and tags every piece with a kind and its exact position. Spaces and line breaks are skipped. Hover a token.</Lead>
      <div style={{ display: 'flex', gap: 48, marginTop: 44, flex: 1 }}>
        <div style={{ width: 1060, flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
          <Card style={{ padding: '30px 40px', position: 'relative' }}>
            <Kicker style={{ marginBottom: 10 }}>query · 83 bytes</Kicker>
            <QueryText
              size={40}
              tokStyle={(tk, i) => {
                const seen = i < scanned;
                const c = CAP[tk.cap];
                const isSel = i === sel;
                return {
                  color: seen ? c.fg : C.dim,
                  background: seen ? c.bg : 'transparent',
                  boxShadow: isSel ? `0 0 0 3px ${c.line}` : seen ? `inset 0 -3px 0 ${c.line}` : 'none',
                  padding: '2px 0',
                  cursor: 'pointer',
                };
              }}
            />
            {/* invisible hover targets via event delegation */}
            <div
              style={{ position: 'absolute', inset: 0 }}
              onMouseMove={(e) => {
                const el = document.elementsFromPoint(e.clientX, e.clientY).find((n) => (n as HTMLElement).dataset?.tok !== undefined) as HTMLElement | undefined;
                setHover(el ? Number(el.dataset.tok) : null);
              }}
              onMouseLeave={() => setHover(null)}
            />
          </Card>
          <div>
            <Kicker style={{ marginBottom: 14 }}>token stream · {Math.min(scanned, TOKENS.length)} / {TOKENS.length}</Kicker>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {TOKENS.map((tk, i) => {
                const c = CAP[tk.cap];
                const seen = i < scanned;
                const isSel = i === sel;
                return (
                  <div
                    key={i}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      padding: '10px 14px',
                      borderRadius: 12,
                      border: `1.5px solid ${isSel ? c.line : C.line}`,
                      background: isSel ? c.bg : '#FFFFFF',
                      opacity: seen ? 1 : 0,
                      transform: `translateY(${seen ? 0 : 14}px) scale(${seen ? 1 : 0.9})`,
                      transition: 'all 300ms cubic-bezier(0.16,1,0.3,1)',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontFamily: MONO, fontSize: 15, color: C.dim }}>{tk.kind}</span>
                    <span style={{ fontFamily: MONO, fontSize: 21, color: c.fg === '#FFFFFF' ? BLUE : c.fg, fontWeight: 600 }}>{tk.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <Card key={sel} style={{ flex: 1, padding: '32px 36px', alignSelf: 'flex-start' }}>
          <Kicker>token {String(sel + 1).padStart(2, '0')}</Kicker>
          <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 40, fontWeight: 650, color: cap.fg === '#FFFFFF' ? BLUE : cap.fg, whiteSpace: 'nowrap' }}>{tok.text}</div>
          <div style={{ marginTop: 26, display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: 14, fontFamily: MONO, fontSize: 21 }}>
            <span style={{ color: C.dim }}>kind</span>
            <span style={{ color: INK }}>{tok.kind}</span>
            <span style={{ color: C.dim }}>bytes</span>
            <span style={{ color: INK }}>
              {tok.start}..{tok.end}
            </span>
            <span style={{ color: C.dim }}>colour</span>
            <span style={{ color: BLUE }}>@{tok.cap}</span>
          </div>
          <p style={{ margin: '28px 0 0', fontSize: 26, lineHeight: 1.45, color: C.muted }}>{cap.say}</p>
        </Card>
      </div>
    </Frame>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 02 · TREE
// ─────────────────────────────────────────────────────────────────────────────
const DividerTree: Page = () => (
  <Divider n="02" chapter="syntax tree" title={<>Group the tokens<br />into a <span style={{ color: ACC }}>tree</span>.</>} sub="Words alone are not meaning. The parser works out which word belongs to which step, the way you parse a sentence into subject and verb." fill={0.26} text={Q_TREE} seed={0.18} />
);

type TNode = { kind: string; depth: number; span: [number, number]; leaf?: string; cap?: Cap; say: string };
const tokSpan = (a: number, b = a): [number, number] => [TOKENS[a].start, TOKENS[b].end];
const TREE: TNode[] = [
  { kind: 'source_file', depth: 0, span: tokSpan(0, 10), say: 'The whole file.' },
  { kind: 'query', depth: 1, span: tokSpan(0, 10), say: 'One query, as opposed to a let statement or a control command.' },
  { kind: 'tabular_expression', depth: 2, span: tokSpan(0, 10), say: 'A source of rows, then a chain of steps joined by pipes.' },
  { kind: 'tabular_primary', depth: 3, span: tokSpan(0), say: 'Where the rows come from.' },
  { kind: 'identifier', depth: 4, span: tokSpan(0), leaf: 'DeviceProcessEvents', cap: 'type', say: 'Named as a table, so the catalog can check it.' },
  { kind: 'tabular_operator', depth: 3, span: tokSpan(2, 5), say: 'Step one.' },
  { kind: 'where_operator', depth: 4, span: tokSpan(2, 5), say: 'A filter: keep only the rows that match.' },
  { kind: 'comparison_expression', depth: 5, span: tokSpan(3, 5), say: 'Left side, operator, right side.' },
  { kind: 'identifier', depth: 6, span: tokSpan(3), leaf: 'FileName', cap: 'variable', say: 'A column read by the filter.' },
  { kind: 'string', depth: 6, span: tokSpan(5), leaf: '"lsass.exe"', cap: 'string', say: 'The value it is compared with.' },
  { kind: 'tabular_operator', depth: 3, span: tokSpan(7, 10), say: 'Step two.' },
  { kind: 'project_operator', depth: 4, span: tokSpan(7, 10), say: 'Keep only these columns.' },
  { kind: 'project_item', depth: 5, span: tokSpan(8), leaf: 'Timestamp', cap: 'variable', say: 'A column the result keeps.' },
  { kind: 'project_item', depth: 5, span: tokSpan(10), leaf: 'DeviceName', cap: 'variable', say: 'A column the result keeps.' },
];
const ROW_H = 44;
const IND = 46;

// The rows of a tree, drawn as an outline with elbow connectors.
const TreeView = ({ nodes, shown, sel, onHover, bad }: { nodes: TNode[]; shown: number; sel: number | null; onHover?: (i: number | null) => void; bad?: Set<number> }) => (
  <div style={{ position: 'relative', height: nodes.length * ROW_H }}>
    <svg width="100%" height={nodes.length * ROW_H} style={{ position: 'absolute', inset: 0, overflow: 'visible' }} aria-hidden>
      {nodes.map((n, i) => {
        if (n.depth === 0 || i >= shown) return null;
        let p = i - 1;
        while (p >= 0 && nodes[p].depth >= n.depth) p--;
        const x = (n.depth - 1) * IND + 14;
        const y0 = p * ROW_H + ROW_H / 2 + 12;
        const y1 = i * ROW_H + ROW_H / 2;
        const isBad = bad?.has(i);
        return <path key={i} d={`M${x} ${y0} V${y1} H${x + IND - 20}`} fill="none" stroke={isBad ? C.red : C.line2} strokeWidth={1.6} strokeDasharray={isBad ? '5 5' : undefined} />;
      })}
    </svg>
    {nodes.map((n, i) => {
      const on = i < shown;
      const isSel = sel === i;
      const isBad = bad?.has(i);
      const c = n.cap ? CAP[n.cap] : null;
      return (
        <div
          key={i}
          onMouseEnter={() => onHover?.(i)}
          onMouseLeave={() => onHover?.(null)}
          style={{
            position: 'absolute',
            left: n.depth * IND,
            top: i * ROW_H + 3,
            height: ROW_H - 6,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '0 14px',
            borderRadius: 10,
            background: isBad ? C.redSoft : isSel ? BLUE : '#FFFFFF',
            border: `1.5px solid ${isBad ? C.redLine : isSel ? BLUE : n.leaf ? C.blueLine : C.line2}`,
            borderStyle: isBad ? 'dashed' : 'solid',
            fontFamily: MONO,
            fontSize: 20,
            color: isBad ? C.red : isSel ? '#FFFFFF' : n.leaf ? INK : C.muted,
            opacity: on ? 1 : 0,
            transform: `translateX(${on ? 0 : -16}px)`,
            transition: 'opacity 300ms, transform 360ms cubic-bezier(0.16,1,0.3,1), background 200ms, color 200ms',
            cursor: onHover ? 'pointer' : 'default',
            whiteSpace: 'nowrap',
          }}
        >
          <span>{n.kind}</span>
          {n.leaf && c && (
            <span style={{ color: isSel ? '#FFFFFF' : c.fg === '#FFFFFF' ? BLUE : c.fg, fontWeight: 600 }}>{n.leaf}</span>
          )}
          <span style={{ color: isSel ? 'rgba(255,255,255,0.65)' : C.dim, fontSize: 16 }}>
            {n.span[0]}..{n.span[1]}
          </span>
        </div>
      );
    })}
  </div>
);

const TreeBuild: Page = () => {
  const t = useClock(500 + TREE.length * 170 + 400);
  const [hover, setHover] = useState<number | null>(null);
  const shown = Math.floor((t - 500) / 170) + 1;
  const sel = hover ?? (shown >= TREE.length ? 6 : null);
  const span = sel !== null ? TREE[sel].span : null;
  return (
    <Frame chapter={['02', 'syntax tree']} source="grammars/tree-sitter-opentide-kql/grammar.js · crates/opentide-syntax · tree-sitter 0.25">
      <div style={{ display: 'flex', gap: 60, height: '100%' }}>
        <div style={{ width: 720, flex: '0 0 auto' }}>
          <H size={60}>Every token finds its parent.</H>
          <Lead maxWidth={700}>The parser follows the KQL grammar and nests each token inside the step it belongs to. Hover a node: the characters it covers light up.</Lead>
          <Card style={{ marginTop: 40, padding: '24px 30px' }}>
            <QueryText
              size={27}
              tokStyle={(tk) => {
                const inside = span && tk.start >= span[0] && tk.end <= span[1];
                return { background: inside ? 'rgba(0,20,137,0.12)' : 'transparent', color: inside ? BLUE : INK, boxShadow: inside ? `inset 0 -2px 0 ${BLUE}` : 'none' };
              }}
            />
          </Card>
          <div key={sel ?? -1} className="ot ot-rise" style={{ marginTop: 28, minHeight: 100 }}>
            {sel !== null && (
              <>
                <M size={22} color={BLUE}>{TREE[sel].kind}</M>
                <p style={{ margin: '10px 0 0', fontSize: 27, lineHeight: 1.45, color: C.muted }}>{TREE[sel].say}</p>
              </>
            )}
          </div>
        </div>
        <div style={{ flex: 1, paddingTop: 6 }}>
          <Kicker style={{ marginBottom: 14 }}>concrete syntax tree · named nodes · wrapper chains folded</Kicker>
          <TreeView nodes={TREE} shown={shown} sel={sel} onHover={setHover} />
        </div>
      </div>
    </Frame>
  );
};

// Recovery: the tree survives a half-typed query (loop: type, then erase).
const RECOVER_FULL = 'DeviceProcessEvents\n| where FileName =~ "lsass.exe"';
const RECOVER_CUT = RECOVER_FULL.indexOf('"lsass.exe"');
const Recovery: Page = () => {
  const t = useClock(7000, true);
  // 0–1.6s broken, 1.6–3.2 typing, 3.2–5.4 complete, 5.4–6.4 erasing
  const typedN =
    t < 1600 ? 0 : t < 3200 ? Math.round(((t - 1600) / 1600) * 11) : t < 5400 ? 11 : t < 6400 ? Math.round((1 - (t - 5400) / 1000) * 11) : 0;
  const text = RECOVER_FULL.slice(0, RECOVER_CUT + typedN);
  const complete = typedN >= 11;
  const nodes: TNode[] = [
    { kind: 'tabular_expression', depth: 0, span: [0, text.length], say: '' },
    { kind: 'tabular_primary', depth: 1, span: [0, 19], leaf: 'DeviceProcessEvents', cap: 'type', say: '' },
    { kind: 'where_operator', depth: 1, span: [22, text.length], say: '' },
    { kind: 'comparison_expression', depth: 2, span: [28, text.length], say: '' },
    { kind: 'identifier', depth: 3, span: [28, 36], leaf: 'FileName', cap: 'variable', say: '' },
    complete
      ? { kind: 'string', depth: 3, span: [40, 51], leaf: '"lsass.exe"', cap: 'string', say: '' }
      : { kind: 'MISSING', depth: 3, span: [text.length, text.length], leaf: 'a value', cap: 'variable', say: '' },
  ];
  return (
    <Frame chapter={['02', 'syntax tree']} source="crates/opentide-syntax/src/lib.rs · fuzz/fuzz_targets · CHANGELOG 0.10.0 (#178, #179)">
      <H>Half-typed is still a tree.</H>
      <Lead>Most of the time you are mid-sentence. The parser marks what is missing and keeps everything else, so the checks never stop.</Lead>
      <div style={{ display: 'flex', gap: 48, marginTop: 44 }}>
        <div style={{ width: 900, flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 26 }}>
          <Card style={{ padding: '24px 30px', height: 150, boxSizing: 'border-box' }}>
            <Kicker style={{ marginBottom: 6 }}>you are typing… <span style={{ color: complete ? C.green : C.red }}>{complete ? 'complete' : 'incomplete'}</span></Kicker>
            <div style={{ fontFamily: MONO, fontSize: 30, lineHeight: 1.55, whiteSpace: 'pre', color: INK }}>
              {text}
              <span className="ot-caret" style={{ display: 'inline-block', width: 3, height: 32, background: BLUE, verticalAlign: -5, marginLeft: 3 }} />
            </div>
          </Card>
          <Card style={{ padding: '24px 30px' }}>
            <Kicker style={{ marginBottom: 12 }}>illustrative · the tree the parser keeps</Kicker>
            <TreeView nodes={nodes} shown={nodes.length} sel={null} bad={complete ? undefined : new Set([5])} />
          </Card>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 22 }}>
          {[
            ['branch', 'ERROR and MISSING nodes', 'tree-sitter marks the gap and keeps the rest of the tree intact.'],
            ['layers', 'No stack to blow', 'The tree walk is iterative: a query thousands of levels deep cannot exhaust the stack.'],
            ['warn', 'Fuzzed, all nine inputs', 'kql, spl, esql, eql, kuery, lucene, falco, tide and the protocol. Saved crashes replay in every test run.'],
          ].map(([ic, h, b], i) => (
            <div key={h} style={{ display: 'flex', gap: 20, padding: '22px 0', borderTop: i ? `1px solid ${C.line}` : 'none' }}>
              <Icon name={ic as IconName} size={34} color={BLUE} />
              <div>
                <div style={{ fontSize: 28, fontWeight: 680, letterSpacing: '-0.02em' }}>{h}</div>
                <div style={{ marginTop: 8, fontSize: 23, lineHeight: 1.45, color: C.muted }}>{b}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 03 · ANALYZERS
// ─────────────────────────────────────────────────────────────────────────────
const DividerAnalyzers: Page = () => (
  <Divider n="03" chapter="analyzers" title={<>Ask the tree<br /><span style={{ color: ACC }}>questions</span>.</>} sub="With the structure known, analyzers walk the tree and check it against what your platform really has. Each finding is a named code with an exact range." fill={0.32} text={Q_ANA} seed={0.77} />
);

const ANALYZERS: { icon: IconName; name: string; q: string; code: string; sev: 'error' | 'warning'; msg: string }[] = [
  { icon: 'branch', name: 'Syntax', q: 'Is the query well formed?', code: 'kql_parse_error', sev: 'error', msg: 'KQL syntax error' },
  { icon: 'archive', name: 'Tables', q: 'Is the table real, and collected here?', code: 'kql_table_not_declared', sev: 'error', msg: "'{table}' is not a table the workspace declares for {platform} in visibility.toml" },
  { icon: 'search', name: 'Columns', q: 'Is every column real at this step?', code: 'kql_unknown_column', sev: 'error', msg: "'FileNam' is not a column of DeviceProcessEvents" },
  { icon: 'clock', name: 'Performance', q: 'Does the query filter early?', code: 'kql_where_not_first', sev: 'warning', msg: '`where` is not the first operator after the table reference; filter before later operators' },
  { icon: 'engine', name: 'Platform', q: 'Is this allowed in a detection?', code: 'kql_control_command_unsupported', sev: 'error', msg: 'Control commands (.show, .create) are parsed so the engine can reject them.' },
  { icon: 'link', name: 'Tide objects', q: 'Does the rule point at a real objective?', code: 'invalid_ref', sev: 'error', msg: 'The rule names a UUID that no object in the workspace has.' },
];

const Analyzers: Page = () => {
  const t = useClock(800 + ANALYZERS.length * 420 + 600);
  const [hover, setHover] = useState<number | null>(null);
  const lit = Math.floor((t - 800) / 420) + 1;
  const sel = hover ?? (lit >= ANALYZERS.length ? 2 : Math.max(0, lit - 1));
  const ROW = 96;
  const TOP = 0;
  const X0 = 470;
  const X1 = 640;
  return (
    <Frame chapter={['03', 'analyzers']} source="crates/opentide-core/src/lib.rs (codes::ALL, 132 codes) · crates/opentide-kql/src/{schema,perf}.rs">
      <H>One tree, many questions.</H>
      <Lead>Each analyzer asks the same tree one question. Every answer is a named code. Hover one.</Lead>
      <div style={{ position: 'relative', marginTop: 40, height: ANALYZERS.length * ROW }}>
        {/* the tree */}
        <Card style={{ position: 'absolute', left: 0, top: 0, width: X0, height: ANALYZERS.length * ROW - 14, padding: '24px 28px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Kicker>the syntax tree</Kicker>
          {TREE.slice(2, 12).map((n, i) => (
            <div key={i} style={{ marginLeft: (n.depth - 2) * 22, fontFamily: MONO, fontSize: 16, color: n.leaf ? INK : C.muted, whiteSpace: 'nowrap' }}>
              {n.kind} {n.leaf && <span style={{ color: BLUE }}>{n.leaf}</span>}
            </div>
          ))}
          <div key={sel} className="ot ot-fade" style={{ marginTop: 'auto', paddingTop: 16, borderTop: `1px solid ${C.line}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Chip tone={ANALYZERS[sel].sev === 'warning' ? 'accent' : 'warn'} size={15}>{ANALYZERS[sel].sev}</Chip>
              <M size={16} color={BLUE}>{ANALYZERS[sel].code}</M>
            </div>
            <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 17, lineHeight: 1.45, color: INK }}>{ANALYZERS[sel].msg}</div>
          </div>
        </Card>
        <svg width={X1} height={ANALYZERS.length * ROW} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} aria-hidden>
          {ANALYZERS.map((_, i) => {
            const y = TOP + i * ROW + ROW / 2 - 6;
            const yc = (ANALYZERS.length * ROW) / 2;
            const on = i < lit;
            const d = `M${X0} ${yc} C ${X0 + 90} ${yc}, ${X1 - 90} ${y}, ${X1} ${y}`;
            return (
              <g key={i}>
                <path d={d} fill="none" stroke={C.line2} strokeWidth={1.5} />
                <path d={d} fill="none" stroke={BLUE} strokeWidth={i === sel ? 3 : 2} pathLength={1} strokeDasharray={1} strokeDashoffset={on ? 0 : 1} style={{ transition: 'stroke-dashoffset 420ms cubic-bezier(0.16,1,0.3,1), stroke-width 200ms' }} />
              </g>
            );
          })}
        </svg>
        {ANALYZERS.map((a, i) => {
          const on = i < lit;
          const isSel = i === sel;
          return (
            <div
              key={a.code}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{
                position: 'absolute',
                left: X1,
                right: 0,
                top: TOP + i * ROW,
                height: ROW - 14,
                display: 'flex',
                alignItems: 'center',
                gap: 22,
                padding: '0 26px',
                borderRadius: 16,
                border: `1.5px solid ${isSel ? BLUE : on ? C.blueLine : C.line}`,
                background: isSel ? '#EEF1FA' : '#FFFFFF',
                opacity: on ? 1 : 0.35,
                transform: `translateX(${isSel ? 8 : 0}px)`,
                transition: 'all 320ms cubic-bezier(0.16,1,0.3,1)',
                cursor: 'pointer',
              }}
            >
              <Icon name={a.icon} size={32} color={BLUE} />
              <div style={{ width: 190, fontSize: 27, fontWeight: 700, letterSpacing: '-0.02em' }}>{a.name}</div>
              <div style={{ flex: 1, fontSize: 23, color: C.muted }}>{a.q}</div>
              <span style={{ opacity: on ? 1 : 0, transform: `scale(${on ? 1 : 0.7})`, transition: 'all 300ms cubic-bezier(0.16,1,0.3,1) 120ms' }}>
                <Chip tone={a.sev === 'warning' ? 'accent' : 'warn'} size={18}>{a.code}</Chip>
              </span>
            </div>
          );
        })}
      </div>
    </Frame>
  );
};

// Catalog lookups: tables against the catalog and visibility.toml; a column
// typo against the documented columns (edit distance ≤ 2, case-insensitive).
const DPE_COLUMNS = [
  'Timestamp', 'DeviceId', 'DeviceName', 'ActionType', 'FileName', 'FolderPath', 'ProcessId', 'ProcessCommandLine',
  'AccountName', 'AccountDomain', 'InitiatingProcessFileName', 'SHA256', 'MD5', 'FileSize',
];
const TYPOS = ['FileNam', 'filename', 'AccountNme', 'ProcesId', 'Hostname'];
const lev = (a: string, b: string) => {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  const d: number[] = Array.from({ length: y.length + 1 }, (_, j) => j);
  for (let i = 1; i <= x.length; i++) {
    let prev = d[0];
    d[0] = i;
    for (let j = 1; j <= y.length; j++) {
      const tmp = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (x[i - 1] === y[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return d[y.length];
};

const Catalog: Page = () => {
  const t = useClock(14000, true);
  const [pick, setPick] = useState<number | null>(null);
  const auto = Math.floor(t / 2800) % TYPOS.length;
  const typo = TYPOS[pick ?? auto];
  const scored = DPE_COLUMNS.map((c) => ({ c, d: lev(typo, c) }));
  const exact = scored.find((s) => s.c === typo);
  const near = scored.filter((s) => s.d <= 2 && s.d * 2 < typo.length).sort((a, b) => a.d - b.d)[0];
  return (
    <Frame chapter={['03', 'analyzers']} source="catalogs/kql/defender/{tables,columns}.toml · crates/opentide-kql/src/schema.rs · CHANGELOG (943 Azure Monitor tables)">
      <H>Checked against what the platform really has.</H>
      <Lead>Table and column catalogs are compiled into the engine. Sentinel alone knows 943 Azure Monitor tables. Pick a typo and see the column check work.</Lead>
      <div style={{ display: 'flex', gap: 48, marginTop: 40 }}>
        <Card style={{ width: 640, flex: '0 0 auto', padding: '30px 34px' }}>
          <Kicker>a table name, three outcomes</Kicker>
          {[
            ['check', 'In the catalog and declared in visibility.toml', 'ok', C.green],
            ['warn', 'In the catalog, but not collected here', 'kql_table_not_declared', C.red],
            ['x', 'Not a table opentide knows', 'kql_unknown_table', C.red],
          ].map(([ic, l, code, col], i) => (
            <div key={code} style={{ display: 'flex', gap: 18, alignItems: 'flex-start', marginTop: 26, opacity: prog(t, i * 200, 500) || 1 }}>
              <span style={{ width: 44, height: 44, borderRadius: 99, display: 'grid', placeItems: 'center', background: i === 0 ? C.greenSoft : C.redSoft, flex: '0 0 auto' }}>
                <Icon name={ic as IconName} size={24} color={col} />
              </span>
              <div>
                <div style={{ fontSize: 25, lineHeight: 1.35 }}>{l}</div>
                <div style={{ marginTop: 6 }}>
                  <M size={19} color={i === 0 ? C.green : C.red}>{code}</M>
                </div>
              </div>
            </div>
          ))}
          <p style={{ margin: '30px 0 0', fontSize: 22, lineHeight: 1.45, color: C.muted }}>
            Under Sentinel an unknown table is a warning, since a workspace may hold custom tables. Under Defender it is an error.
          </p>
        </Card>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Kicker style={{ marginRight: 8 }}>try</Kicker>
            {TYPOS.map((ty, i) => (
              <button
                key={ty}
                onClick={() => setPick(i)}
                onMouseEnter={() => setPick(i)}
                style={{ all: 'unset', cursor: 'pointer', fontFamily: MONO, fontSize: 20, padding: '8px 14px', borderRadius: 999, border: `1.5px solid ${typo === ty ? BLUE : C.line2}`, background: typo === ty ? BLUE : '#FFFFFF', color: typo === ty ? '#FFFFFF' : C.muted, transition: 'all 220ms' }}
              >
                {ty}
              </button>
            ))}
          </div>
          <Card style={{ marginTop: 22, padding: '22px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 17, color: C.dim, marginBottom: 10 }}>
              <span>DeviceProcessEvents · 14 of 46 catalog columns</span>
              <span>edit distance to “{typo}”</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 30, rowGap: 6 }}>
              {scored.map(({ c, d }) => {
                const win = near?.c === c;
                const max = 12;
                return (
                  <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 12, height: 34, fontFamily: MONO, fontSize: 18 }}>
                    <span style={{ width: 290, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: win ? BLUE : INK, fontWeight: win ? 700 : 400 }}>{c}</span>
                    <span style={{ flex: 1, height: 8, background: C.paper2, borderRadius: 99, overflow: 'hidden' }}>
                      <span style={{ display: 'block', height: '100%', width: `${(Math.min(d, max) / max) * 100}%`, background: d <= 2 ? BLUE : C.line2, borderRadius: 99, transition: 'width 500ms cubic-bezier(0.16,1,0.3,1)' }} />
                    </span>
                    <span style={{ width: 26, textAlign: 'right', color: d <= 2 ? BLUE : C.dim }}>{d}</span>
                  </div>
                );
              })}
            </div>
          </Card>
          <div key={typo} className="ot ot-rise" style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 16, fontSize: 25 }}>
            {exact ? (
              <><Chip tone="ok">ok</Chip> a documented column</>
            ) : near ? (
              <><Chip tone="warn">kql_unknown_column</Chip> near miss of <M color={BLUE}>{near.c}</M>, offered as the fix</>
            ) : (
              <><Chip tone="plain">no report</Chip> not close to any column, so the engine does not guess</>
            )}
          </div>
        </div>
      </div>
    </Frame>
  );
};

// YAML injection: the query is lifted out, analysed, mapped back.
const Injection: Page = () => {
  const t = useClock(5200);
  const lift = prog(t, 600, 1100);
  const back = prog(t, 2600, 900);
  const at = QUERY.indexOf('FileName');
  const yamlLine = 6;
  const yamlCol = 6 + (at - QUERY.indexOf('\n') - 1) + 1;
  return (
    <Frame chapter={['03', 'analyzers']} source="docs/ARCHITECTURE.md (injection table) · crates/opentide-tide/src/injection.rs">
      <H>Queries live inside YAML. So does the engine.</H>
      <Lead>A rule’s query is a block of text in a YAML file. The engine lifts it out, strips the indent, analyses it, and maps every byte back, so the red line lands on the right character.</Lead>
      <div style={{ position: 'relative', marginTop: 44, height: 520 }}>
        <Card style={{ position: 'absolute', left: 0, top: 0, width: 760, padding: '22px 0' }}>
          <div style={{ fontFamily: MONO, fontSize: 23, lineHeight: 1.8, whiteSpace: 'pre', color: INK }}>
            {[
              <><span style={{ color: BLUE }}>name</span>: LSASS process access</>,
              <><span style={{ color: BLUE }}>configurations</span>:</>,
              <>  <span style={{ color: BLUE }}>defender_for_endpoint</span>:</>,
              <>    <span style={{ color: BLUE }}>query</span>: |</>,
              <>      DeviceProcessEvents</>,
              <>      | where <span style={{ position: 'relative', background: back > 0.5 ? C.redSoft : undefined, boxShadow: back > 0.5 ? `inset 0 -3px 0 ${C.red}` : undefined, transition: 'all 300ms' }}>FileName</span> =~ "lsass.exe"</>,
              <>      | project Timestamp, DeviceName</>,
            ].map((l, i) => (
              <div key={i} style={{ display: 'flex', background: i >= 4 ? `rgba(0,20,137,${0.06 * (1 - lift * 0.4)})` : undefined }}>
                <span style={{ width: 56, textAlign: 'right', paddingRight: 22, color: C.dim }}>{i + 1}</span>
                <span>{l}</span>
              </div>
            ))}
          </div>
        </Card>
        {/* lifted query */}
        <Card style={{ position: 'absolute', left: 900, top: 20, width: 780, padding: '22px 28px', opacity: lift, transform: `translateX(${(1 - lift) * -160}px)` }}>
          <Kicker style={{ marginBottom: 8 }}>defender_for_endpoint.query · KQL, Defender profile</Kicker>
          <QueryText size={23} plainColor={C.dim} tokStyle={(tk) => (tk.text === 'FileName' ? { boxShadow: back > 0 ? `inset 0 -3px 0 ${C.red}` : undefined, color: back > 0 ? C.red : INK } : { color: tk.cap === 'keyword' ? BLUE : INK })} />
        </Card>
        <svg width="1680" height="520" style={{ position: 'absolute', inset: 0, overflow: 'visible' }} aria-hidden>
          <path d="M770 250 C 830 250, 840 120, 895 120" fill="none" stroke={BLUE} strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - lift} />
        </svg>
        <div style={{ position: 'absolute', left: 900, top: 290, width: 780, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, opacity: back }}>
          <Card style={{ padding: '18px 22px' }}>
            <Kicker>in the query</Kicker>
            <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 24 }}>bytes {at}..{at + 8}</div>
          </Card>
          <Card style={{ padding: '18px 22px', borderColor: C.blueLine }}>
            <Kicker>in the file</Kicker>
            <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 24, color: BLUE }}>line {yamlLine}, col {yamlCol}</div>
          </Card>
          <div style={{ gridColumn: '1 / 3', fontSize: 21, lineHeight: 1.5, color: C.muted }}>
            The same works for SPL in <M>splunk.query</M>, ES|QL and EQL in <M>elastic.query</M>, Falco in <M>sysdig.condition</M>, folded or quoted scalars included.
          </div>
        </div>
      </div>
    </Frame>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RUST · SPEED
// ─────────────────────────────────────────────────────────────────────────────
const SPEED: { what: string; before: number; after: number; label: [string, string]; x: string }[] = [
  { what: 'Hover, 1,000-object workspace (median)', before: 73, after: 1, label: ['73 ms', '< 1 ms'], x: '> 70×' },
  { what: 'SPL analysis per query', before: 9.6, after: 0.14, label: ['9.6 ms', '0.14 ms'], x: '68×' },
  { what: 'KQL analysis per query', before: 16, after: 4, label: ['16 ms', '4 ms'], x: '4×' },
];
const RELEASE = `[profile.release]
lto = true           # optimise across every crate
codegen-units = 1    # one unit: best machine code
strip = "symbols"    # smaller binary`;

const Speed: Page = () => {
  const t = useClock(3600);
  return (
    <Frame chapter={['··', 'under the hood']} source="opentidehq/language-server CHANGELOG 0.10.0 (#181) · Cargo.toml [profile.release] · README hard rules">
      <H>Rust, and measured.</H>
      <Lead>Compiled to native code, no garbage collector, no runtime to start. Where it was slow, the team measured and fixed it.</Lead>
      <div style={{ display: 'flex', gap: 64, marginTop: 50 }}>
        <div style={{ width: 900, flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>
          {SPEED.map((s, i) => {
            const p = prog(t, 300 + i * 350, 1400);
            const w = 760;
            return (
              <div key={s.what}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.015em' }}>{s.what}</span>
                  <span style={{ fontFamily: MONO, fontSize: 30, fontWeight: 700, color: BLUE, opacity: p }}>{s.x}</span>
                </div>
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ height: 22, width: w, background: C.paper2, borderRadius: 6 }} />
                    <M size={19} color={C.dim}>{s.label[0]}</M>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ height: 22, width: Math.max(6, w * (1 - p * (1 - s.after / s.before))), background: BLUE, borderRadius: 6 }} />
                    <M size={19} color={BLUE}>{p > 0.98 ? s.label[1] : 'now'}</M>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ fontSize: 21, color: C.muted, lineHeight: 1.5 }}>
            How: highlight queries compiled once per process, not on every analysis; the workspace read and indexed once, re-read only when a file changes.
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Code code={RELEASE} lang="yaml" title="Cargo.toml" size={20} />
          {[
            ['lock', 'I/O-free engine', 'Engine crates never touch the disk. The host hands them text, so the same code runs in a terminal or a browser.'],
            ['package', 'Everything compiled in', 'Grammars (vendored parser.c) and catalogs (include_str!) ship inside the binary. No downloads at run time.'],
            ['editor', 'Only the change', 'The editor sends each edit, not the whole file.'],
          ].map(([ic, h, b]) => (
            <div key={h} style={{ display: 'flex', gap: 18 }}>
              <Icon name={ic as IconName} size={30} color={BLUE} />
              <div>
                <div style={{ fontSize: 25, fontWeight: 680 }}>{h}</div>
                <div style={{ marginTop: 4, fontSize: 21, lineHeight: 1.45, color: C.muted }}>{b}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
};

// One engine, every host.
const HOSTS: { icon: IconName; name: string; how: string; x: number; y: number }[] = [
  { icon: 'terminal', name: 'opentide CLI', how: 'pip install opentide → opentide lsp start (PyO3, abi3 wheel)', x: 0, y: 0 },
  { icon: 'editor', name: 'Editors', how: 'opentide-lsp --stdio: VS Code, Neovim, Helix, Zed', x: 1, y: 0 },
  { icon: 'globe', name: 'Browser', how: 'opentide-wasm in a Web Worker, no server at all', x: 0, y: 1 },
  { icon: 'flow', name: 'CI and agents', how: 'opentide-lsp analyze <file> → plain JSON diagnostics', x: 1, y: 1 },
];
const CRATES = ['core', 'syntax', 'highlight', 'kql', 'spl', 'esql', 'eql', 'kuery', 'lucene', 'falco', 'ecs', 'tide', 'analysis', 'lsp', 'wasm'];

const Hosts: Page = () => {
  const t = useClock(4000);
  const [hover, setHover] = useState<number | null>(null);
  const CX = 840;
  const CY = 330;
  const pos = (h: (typeof HOSTS)[number]) => ({ x: h.x ? 1680 - 520 : 0, y: h.y ? 470 : 40 });
  return (
    <Frame chapter={['··', 'under the hood']} source="opentidehq/language-server README (crates, hosts) · opentidehq/opentide analysis/Cargo.toml">
      <H>One engine, everywhere you write detections.</H>
      <Lead>Fifteen crates, one entry point. The same compiled engine answers in the terminal, the editor, the browser and CI.</Lead>
      <div style={{ position: 'relative', height: 640, marginTop: 20 }}>
        <svg width="1680" height="640" style={{ position: 'absolute', inset: 0, overflow: 'visible' }} aria-hidden>
          {HOSTS.map((h, i) => {
            const p = pos(h);
            const hx = h.x ? p.x : p.x + 520;
            const hy = p.y + 60;
            const d = `M${CX + (h.x ? 220 : -220)} ${CY} C ${(CX + hx) / 2} ${CY}, ${(CX + hx) / 2} ${hy}, ${hx} ${hy}`;
            return (
              <g key={i}>
                <path d={d} fill="none" stroke={hover === i ? BLUE : C.line2} strokeWidth={hover === i ? 3 : 1.6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(t, 900 + i * 200, 900)} style={{ transition: 'stroke 200ms, stroke-width 200ms' }} />
              </g>
            );
          })}
        </svg>
        <div style={{ position: 'absolute', left: CX - 220, top: CY - 150, width: 440, height: 300, borderRadius: 28, background: BLUE, color: '#FFFFFF', padding: '30px 32px', boxSizing: 'border-box', boxShadow: '0 40px 80px -40px rgba(0,20,137,0.6)', transform: `scale(${0.9 + 0.1 * prog(t, 0, 700)})`, opacity: prog(t, 0, 500) }}>
          <div style={{ fontFamily: MONO, fontSize: 18, color: 'rgba(255,255,255,0.7)' }}>entry point</div>
          <div style={{ fontFamily: MONO, fontSize: 32, fontWeight: 700, marginTop: 6 }}>opentide-analysis</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 22 }}>
            {CRATES.map((c, i) => (
              <span key={c} style={{ fontFamily: MONO, fontSize: 15, padding: '5px 9px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.35)', background: c === 'analysis' ? '#FFFFFF' : 'transparent', color: c === 'analysis' ? BLUE : '#FFFFFF', opacity: prog(t, 300 + i * 50, 300) }}>
                {c}
              </span>
            ))}
          </div>
        </div>
        {HOSTS.map((h, i) => {
          const p = pos(h);
          const on = hover === i;
          return (
            <div
              key={h.name}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{
                position: 'absolute',
                left: p.x,
                top: p.y,
                width: 520,
                padding: '24px 28px',
                boxSizing: 'border-box',
                borderRadius: 18,
                background: on ? '#EEF1FA' : '#FFFFFF',
                border: `1.5px solid ${on ? BLUE : C.line2}`,
                opacity: prog(t, 1400 + i * 200, 500),
                transform: `translateY(${on ? -6 : 0}px)`,
                transition: 'background 220ms, border 220ms, transform 300ms cubic-bezier(0.16,1,0.3,1)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Icon name={h.icon} size={32} color={BLUE} />
                <span style={{ fontSize: 29, fontWeight: 700, letterSpacing: '-0.02em' }}>{h.name}</span>
              </div>
              <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 18, lineHeight: 1.5, color: C.muted }}>{h.how}</div>
            </div>
          );
        })}
      </div>
    </Frame>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CLOSE
// ─────────────────────────────────────────────────────────────────────────────
const CloseLink = ({ icon, children }: { icon: IconName; children: ReactNode }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#FFFFFF', padding: '8px 16px 8px 12px', borderRadius: 999, border: `1px solid ${C.line}` }}>
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
        Tokens, a tree, analyzers: the language server checks every query as it is written, by a person or by an agent.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginTop: 30, fontFamily: MONO, fontSize: 23, color: INK }}>
        <CloseLink icon="globe">opentide.org</CloseLink>
        <CloseLink icon="branch">github.com/opentidehq/language-server</CloseLink>
        <CloseLink icon="terminal">opentide lsp start</CloseLink>
      </div>
    </div>
    <Footer onTide />
  </Stage>
);

Cover.transition = tideReveal;
DividerTokens.transition = tideReveal;
DividerTree.transition = tideReveal;
DividerAnalyzers.transition = tideReveal;
Close.transition = tideReveal;

// ─────────────────────────────────────────────────────────────────────────────
// Deck
// ─────────────────────────────────────────────────────────────────────────────
export const meta: SlideMeta = {
  title: 'opentide language server — how opentide reads a query',
  createdAt: '2026-11-05T07:52:59.431Z',
  theme: 'opentide-coastal',
};

export const notes: (string | undefined)[] = [
  // Cover
  `Fifteen minutes on the part of opentide nobody sees: the language server.
It is the program that reads every detection query, KQL, SPL, Elastic, Falco, and the YAML around them, and tells you what is wrong before anything runs.
Three ideas: tokens, a tree, analyzers. Then why it is fast.`,
  // AsYouType
  `Watch the editor. I type a filter and make a typo: FileNam instead of FileName.
Before I even finish, the line is underlined. Hover it: kql_unknown_column, and the engine offers FileName as the fix.
Nothing was sent to Defender. The engine knows the table's columns itself.
It does this for eight languages with one engine.`,
  // Pipeline
  `This is the whole story on one slide. Text comes in from the editor. It is cut into tokens. Tokens are grouped into a tree. Analyzers ask questions of that tree. Answers go back to the editor as red lines and hovers.
Hover each step if you want to dwell on it. The next three chapters zoom into steps two, three and four.`,
  // DividerTokens
  `Chapter one: tokens. Think of it as finding the words in a sentence before you try to understand it.`,
  // Lexer
  `The lexer reads the query once, left to right. Each piece gets a kind: identifier, the keyword where, a string, a pipe.
And each piece keeps its exact position in bytes. DeviceProcessEvents is bytes 0 to 19. That position is what lets a red line land on the right characters later.
The colours you see in your editor come straight from these kinds. Hover any token to show its kind, its position and its colour.`,
  // DividerTree
  `Chapter two: the tree. Words alone do not tell you what the query means. Grouping them does.`,
  // TreeBuild
  `The parser follows the KQL grammar. The table goes under tabular_primary. The filter goes under where_operator, and inside it a comparison: FileName, equals ignoring case, lsass.exe.
Hover a node: the characters it covers light up on the left. That is how the engine knows FileName is read by the filter, not kept by project.
The parser is tree-sitter, generated from a grammar the team maintains for each language and compiled to C inside the Rust binary.`,
  // Recovery
  `In real life you are always mid-sentence. Here the value is missing. The parser does not give up: it marks a MISSING node and keeps the rest.
So the table check and the column check still run while you type.
It is also hardened. The tree walk is iterative, so a pathological query cannot blow the stack, and every language is fuzzed, with saved crashes replayed in the test suite.`,
  // DividerAnalyzers
  `Chapter three: analyzers. Now that the structure is known, we can ask it questions.`,
  // Analyzers
  `One tree, many questions. Is it well formed? Does the table exist on this platform, and do we actually collect it? Is every column real at this point of the pipeline? Does the query filter early, which is a Microsoft best practice? Is it something a detection may contain at all? And for the YAML around it: does the rule point at a real objective?
Every answer is a named code. 132 of them across all languages. Same codes the opentide CLI reports, with exact ranges.`,
  // Catalog
  `The catalogs are compiled into the engine. Sentinel knows 943 Azure Monitor tables. Your workspace's visibility.toml says which ones you really collect, so a rule on a table you do not ingest is caught before it ships.
On the right, the column check. Pick a typo. The engine measures how far it is from each documented column. Within two edits, it reports the error and offers the closest column as the fix. Too far, and it does not guess.`,
  // Injection
  `Detections are YAML files, with the query inside. The engine finds the query by its path, lifts it out, removes the indentation, analyses it as KQL, and maps every byte back.
FileName is at bytes 28 to 36 in the query, which is line 6 in the file. That is why the red line is in the right place in the YAML.
Same for SPL, ES|QL, EQL and Falco blocks.`,
  // Speed
  `Why Rust: native code, no garbage collector, nothing to warm up. The release build optimises across all crates, in a single unit.
But the bigger wins came from measuring. In 0.10.0 the team stopped recompiling highlight queries on every analysis: SPL went from 9.6 to 0.14 milliseconds per query, KQL from 16 to 4. And the workspace is now indexed once: hover on a thousand objects went from 73 milliseconds to under one.
The engine never touches the disk itself, and grammars and catalogs are built in.`,
  // Hosts
  `Fifteen crates, one entry point, opentide-analysis. The same compiled engine runs inside the opentide Python package as opentide lsp start, as a standalone binary for VS Code, Neovim, Helix and Zed, as WebAssembly in a browser tab, and as a plain JSON command for CI and coding agents.
Hover each host if there is a question about one.`,
  // Close
  `That is the language server: tokens, a tree, analyzers, in Rust, everywhere.
It is what lets agents write the queries while the spec keeps them aligned: every query, from a person or an agent, is checked as it is written.
Questions.`,
];

export default [
  Cover,
  AsYouType,
  Pipeline,
  DividerTokens,
  Lexer,
  DividerTree,
  TreeBuild,
  Recovery,
  DividerAnalyzers,
  Analyzers,
  Catalog,
  Injection,
  Speed,
  Hosts,
  Close,
] satisfies Page[];
