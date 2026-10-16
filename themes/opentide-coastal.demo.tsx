import { type DesignSystem, type Page, useSlidePageNumber } from '@open-slide/core';
import { type ReactNode, useEffect, useRef } from 'react';
import InterUrl from '@assets/fonts/Inter-Variable-latin.woff2';
import MonoUrl from '@assets/fonts/JetBrainsMono-Variable-latin.woff2';

// ── Fonts (self-hosted opentide.org faces), create-or-update ─────────────────
const FONT_STYLE_ID = 'osd-fonts-theme-opentide-coastal';
const FONT_CSS = `
@font-face{font-family:'Inter';src:url(${InterUrl}) format('woff2');font-weight:100 900;font-display:block;}
@font-face{font-family:'JetBrains Mono';src:url(${MonoUrl}) format('woff2');font-weight:100 800;font-display:block;}`;
if (typeof document !== 'undefined') {
  let el = document.getElementById(FONT_STYLE_ID);
  if (!el) {
    el = document.createElement('style');
    el.id = FONT_STYLE_ID;
    document.head.appendChild(el);
  }
  if (el.textContent !== FONT_CSS) el.textContent = FONT_CSS;
}

export const design: DesignSystem = {
  palette: { bg: '#FFFFFF', text: '#0A0F24', accent: '#001489' },
  fonts: {
    display: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
    body: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
  },
  typeScale: { hero: 132, body: 30 },
  radius: 16,
};

const MONO = "'JetBrains Mono', ui-monospace, Menlo, monospace";
const BLUE = '#001489';

const TSUNAMI =
  'M80-120v-80q38 0 68-14.5t65-40.5q30 25 65.5 39.5T347-201q33 0 69-14t65-40q32 28 66 41t68 13q33 0 64.5-13t69.5-41q39 30 69 42.5t62 12.5v80q-35 0-67.5-9.5T749-157q-32 20-66.5 28.5T615-120q-33 0-67.5-8.5T481-157q-29 19-64 28t-70 9q-34 0-68-9t-66-28q-31 18-64.5 27.5T80-120Zm0-180v-80q0-97 37.5-181T220-707q65-62 152.5-97.5T560-840q33 0 65.5 3.5T684-827q-21 32-32.5 67.5T640-693q0 55 39 94t94 39h107v80H773q-89 0-151-62t-62-151q0-14 2-29.5t6-30.5q-74 18-121 76.5T400-540q0 36 11.5 68.5T444-410q8-5 17-11.5t19-13.5q29 26 67 40t68 14q30 0 67-14.5t67-39.5q32 24 63.5 39.5T880-380v80q-35 0-67.5-9.5T749-337q-32 20-65 28.5t-69 8.5q-36 0-72-10t-62-27q-31 19-65 27.5t-69 9.5q-35 1-69-9t-65-28q-31 18-64.5 27.5T80-300Zm265-81h10q5 0 10-1-22-35-33.5-75T320-540q0-81 37-146.5T460-794v44q-62 16-114.5 48.5t-92 78.5Q214-577 190-520.5T161-400q15-9 26-16t26-19q37 27 67 40.5t65 13.5Zm-75-168Z';

const TideMark = ({ size = 34 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden style={{ display: 'block' }}>
    <circle cx="50" cy="50" r="50" fill={BLUE} />
    <svg x="11" y="11" width="78" height="78" viewBox="0 -960 960 960">
      <path fill="#FFFFFF" d={TSUNAMI} />
    </svg>
  </svg>
);

const Title = ({ children }: { children: ReactNode }) => (
  <h2 style={{ margin: 0, fontFamily: 'var(--osd-font-display)', fontWeight: 720, fontSize: 64, lineHeight: 1.06, letterSpacing: '-0.035em', color: 'var(--osd-text)' }}>
    {children}
  </h2>
);

const TopBar = ({ chapter }: { chapter?: [string, string] }) => (
  <>
    <div style={{ position: 'absolute', left: 120, top: 52, display: 'flex', alignItems: 'center', gap: 12 }}>
      <TideMark />
      <span style={{ fontWeight: 650, fontSize: 25, letterSpacing: '-0.02em', color: 'var(--osd-accent)' }}>opentide</span>
    </div>
    {chapter && (
      <div style={{ position: 'absolute', right: 120, top: 52, height: 34, display: 'flex', alignItems: 'center', gap: 14, fontFamily: MONO, fontSize: 19 }}>
        <span style={{ color: 'var(--osd-accent)', fontWeight: 600 }}>{chapter[0]}</span>
        <span style={{ width: 22, height: 1.5, background: 'rgba(0,20,137,0.26)' }} />
        <span style={{ color: '#4C5672' }}>{chapter[1]}</span>
      </div>
    )}
  </>
);

const Footer = ({ source }: { source?: string }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ position: 'absolute', left: 120, right: 120, bottom: 42, display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 17, color: '#8A93AA' }}>
      <span>{source}</span>
      <span>
        <span style={{ color: '#4C5672' }}>{String(current).padStart(2, '0')}</span> / {String(total).padStart(2, '0')}
      </span>
    </div>
  );
};

const Label = ({ children }: { children: ReactNode }) => (
  <div style={{ fontFamily: MONO, fontSize: 20, color: '#4C5672', letterSpacing: '0.01em' }}>{children}</div>
);

// A still frame of the ASCII tide (the live FLIP version lives in slides/opentide).
const TIDE_TEXT =
  'DeviceProcessEvents | where FileName =~ "lsass.exe"   detection_model: f8817f95-c43e   `sysmon` EventCode=10 | stats count by host   opentide validate --strict   schema: rule::1.1   ';
const StillTide = ({ fill = 0.3 }: { fill?: number }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    c.width = 1920;
    c.height = 1080;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 1920, 1080);
    const font = 15;
    const cw = font * 0.6;
    const ch = font * 1.28;
    const cols = Math.ceil(1920 / cw);
    const rows = Math.ceil(1080 / ch);
    ctx.font = `500 ${font}px 'JetBrains Mono', monospace`;
    ctx.textBaseline = 'top';
    for (let r = 0; r < rows; r++) {
      const ny = 1 - (r + 0.5) / rows;
      for (let col = 0; col < cols; col++) {
        const nx = (col + 0.5) / cols;
        const s = fill + 0.034 * Math.sin(Math.PI * 2 * nx * 1.15 + 1.1) + 0.019 * Math.sin(Math.PI * 2 * nx * 2.6 + 3.4);
        if (ny > s) continue;
        const ch2 = TIDE_TEXT[(r * (cols + 7) + col) % TIDE_TEXT.length];
        if (ch2 === ' ') continue;
        const a = 0.3 + 0.6 * Math.min(1, (s - ny) / 0.03);
        ctx.fillStyle = `rgba(0,20,137,${a.toFixed(2)})`;
        ctx.fillText(ch2, col * cw, r * ch + 2);
      }
    }
  }, [fill]);
  return <canvas ref={ref} aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
};

const page = { width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: 'var(--osd-bg)', color: 'var(--osd-text)', fontFamily: 'var(--osd-font-body)' } as const;

const Cover: Page = () => (
  <div style={page}>
    <StillTide fill={0.26} />
    <TopBar />
    <div style={{ position: 'absolute', left: 120, top: 220 }}>
      <Label>opentide coastal · light register</Label>
      <h1 style={{ margin: '26px 0 0', fontFamily: 'var(--osd-font-display)', fontWeight: 800, fontSize: 'var(--osd-size-hero)', lineHeight: 0.98, letterSpacing: '-0.05em' }}>
        The engine behind
        <br />
        <span style={{ color: 'var(--osd-accent)' }}>agentic</span> detection.
      </h1>
    </div>
  </div>
);

const Row = ({ n, title, body }: { n: string; title: string; body: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 34, padding: '22px 0', borderTop: '1px solid rgba(0,20,137,0.13)' }}>
    <span style={{ fontFamily: MONO, fontSize: 22, color: 'var(--osd-accent)', width: 36 }}>{n}</span>
    <span style={{ width: 520, fontSize: 36, fontWeight: 650, letterSpacing: '-0.025em' }}>{title}</span>
    <span style={{ flex: 1, fontSize: 26, lineHeight: 1.42, color: '#4C5672' }}>{body}</span>
  </div>
);

const Content: Page = () => (
  <div style={page}>
    <TopBar chapter={['02', 'what opentide is']} />
    <div style={{ position: 'absolute', left: 120, top: 150, width: 1680 }}>
      <Title>Three objects. Three questions.</Title>
      <p style={{ margin: '22px 0 0', fontSize: 30, lineHeight: 1.45, color: '#4C5672' }}>Blue is the only accent. Mono is for anything a machine would read.</p>
      <div style={{ marginTop: 48 }}>
        <Row n="01" title="Threat" body="What do we defend against? threat::1.0" />
        <Row n="02" title="Objective" body="What are we trying to detect? objective::1.0" />
        <Row n="03" title="Rule" body="How do we detect it, on which platform? rule::1.1" />
      </div>
    </div>
    <Footer source="opentide.org/docs/usage/concepts/object-model" />
  </div>
);

const Closer: Page = () => (
  <div style={page}>
    <StillTide fill={0.32} />
    <TopBar />
    <div style={{ position: 'absolute', left: 120, top: 250 }}>
      <h2 style={{ margin: 0, fontWeight: 800, fontSize: 112, lineHeight: 1, letterSpacing: '-0.045em' }}>
        Agents write the queries.
        <br />
        <span style={{ color: 'var(--osd-accent)' }}>The spec keeps them aligned.</span>
      </h2>
    </div>
    <Footer />
  </div>
);

export default [Cover, Content, Closer] satisfies Page[];
