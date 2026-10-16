---
name: opentide Coastal
description: opentide.org's light register on a 1920×1080 canvas — white + Pantone Reflex Blue, Inter + JetBrains Mono, mono path labels, and the ASCII tide (a fluid made of real detection content) as the one signature motion.
mode: light
---

# opentide Coastal

The opentide.org brand ("coastal precision") in its light register: white pages, one committed accent
(Pantone Reflex Blue `#001489`), engineering credibility without corporate sterility. Copy is short and
declarative; every content page cites its source in the footer, the way docs cite specs. The only
signature motion is the **ASCII tide** — a FLIP fluid whose glyphs are real KQL / SPL / YAML — on covers
and chapter dividers, rising chapter by chapter. Light = white + blue; **never put yellow on white**.

## Palette

| Role       | Value                    | Notes                                                     |
| ---------- | ------------------------ | --------------------------------------------------------- |
| bg         | `#FFFFFF`                | every page                                                |
| text       | `#0A0F24`                | headings and body (near-black, blue-leaning)              |
| accent     | `#001489`                | Pantone Reflex Blue: accents, links, key numbers, marks   |
| muted      | `#4C5672`                | lead paragraphs, secondary copy                           |
| subtle     | `#6B7490`                | "before" columns, de-emphasised values                    |
| dim        | `#8A93AA`                | chrome: footer source, captions                           |
| line       | `rgba(0,20,137,0.13)`    | hairlines between rows                                    |
| line2      | `rgba(0,20,137,0.26)`    | card borders, axes                                        |
| paper      | `#F5F7FC`                | code panels, quiet surfaces                               |
| paper2     | `#EDF1F9`                | code panel headers                                        |
| tint       | `#E6EBF7`                | tracks, inactive fills                                    |
| red        | `#C62F3F`                | failure / "not supported" only                            |
| green      | `#0F7B4B`                | pass / ok only                                            |
| navy (term)| `#000B1F` / `#001028`    | terminal windows only (docs "deep tide" tokens), as content, never as a page |
| foam       | `#7EC8E3`                | keys and flags inside navy terminals                      |

Discipline: blue is the only accent. Red and green appear only where a result is a failure or a pass.

## Typography

- Display + body: **Inter** (`'Inter', ui-sans-serif, system-ui, sans-serif`) — headings 700–800 with tight tracking (`-0.035em` at 64 px, `-0.05em` at hero size); body 420–500.
- Mono: **JetBrains Mono** (`'JetBrains Mono', ui-monospace, Menlo, monospace`) — commands, paths, schema ids (`rule::1.1`), labels, chrome. Always `fontVariantLigatures: 'none'` (no `==` ligatures in code).
- Fonts are the exact files opentide.org serves (variable woff2, latin subset) under `@assets/fonts/`. Inject once at module top level, create-or-update, slide-keyed id:

```tsx
import InterUrl from '@assets/fonts/Inter-Variable-latin.woff2';
import MonoUrl from '@assets/fonts/JetBrainsMono-Variable-latin.woff2';

const FONT_STYLE_ID = 'osd-fonts-<slide-id>';
const FONT_CSS = `
@font-face{font-family:'Inter';src:url(${InterUrl}) format('woff2');font-weight:100 900;font-display:block;}
@font-face{font-family:'JetBrains Mono';src:url(${MonoUrl}) format('woff2');font-weight:100 800;font-display:block;}`;
if (typeof document !== 'undefined') {
  let el = document.getElementById(FONT_STYLE_ID);
  if (!el) { el = document.createElement('style'); el.id = FONT_STYLE_ID; document.head.appendChild(el); }
  if (el.textContent !== FONT_CSS) el.textContent = FONT_CSS;
}
```

- Type scale: hero 132 px (cover) · divider title 132 px · page heading 64 px · big statement 40–52 px · lead 30 px · body 23–28 px · mono labels 18–22 px · code 19–22 px · chrome 17–19 px.

## Layout

- Canvas 1920 × 1080. Side padding 120 px.
- Chrome: top bar at `top: 52` (tide mark + **opentide** wordmark left, `NN — chapter` mono label right); footer at `bottom: 42` (link icon + source path left, `07 / 36` right).
- Content box: `left 120, top 150, 1680 × 820`, flex column. Heading first (one line where possible), optional lead, then one idea.
- Left-aligned, editorial. Tables are hairline rows, not boxes. Repeated items are explicit component instances.

## Fixed components

Paste-ready (the slide defines `MONO = "'JetBrains Mono', ui-monospace, Menlo, monospace"` and `BLUE = '#001489'`).

### Title

```tsx
const Title = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ margin: 0, fontFamily: 'var(--osd-font-display)', fontWeight: 720, fontSize: 64, lineHeight: 1.06, letterSpacing: '-0.035em', color: 'var(--osd-text)' }}>
    {children}
  </h2>
);
```

### TopBar (tide mark + wordmark + chapter)

```tsx
const TSUNAMI = 'M80-120v-80q38 0 68-14.5t65-40.5q30 25 65.5 39.5T347-201q33 0 69-14t65-40q32 28 66 41t68 13q33 0 64.5-13t69.5-41q39 30 69 42.5t62 12.5v80q-35 0-67.5-9.5T749-157q-32 20-66.5 28.5T615-120q-33 0-67.5-8.5T481-157q-29 19-64 28t-70 9q-34 0-68-9t-66-28q-31 18-64.5 27.5T80-120Zm0-180v-80q0-97 37.5-181T220-707q65-62 152.5-97.5T560-840q33 0 65.5 3.5T684-827q-21 32-32.5 67.5T640-693q0 55 39 94t94 39h107v80H773q-89 0-151-62t-62-151q0-14 2-29.5t6-30.5q-74 18-121 76.5T400-540q0 36 11.5 68.5T444-410q8-5 17-11.5t19-13.5q29 26 67 40t68 14q30 0 67-14.5t67-39.5q32 24 63.5 39.5T880-380v80q-35 0-67.5-9.5T749-337q-32 20-65 28.5t-69 8.5q-36 0-72-10t-62-27q-31 19-65 27.5t-69 9.5q-35 1-69-9t-65-28q-31 18-64.5 27.5T80-300Zm265-81h10q5 0 10-1-22-35-33.5-75T320-540q0-81 37-146.5T460-794v44q-62 16-114.5 48.5t-92 78.5Q214-577 190-520.5T161-400q15-9 26-16t26-19q37 27 67 40.5t65 13.5Zm-75-168Z';

const TideMark = ({ size = 34 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
    <circle cx="50" cy="50" r="50" fill={BLUE} />
    <svg x="11" y="11" width="78" height="78" viewBox="0 -960 960 960"><path fill="#FFFFFF" d={TSUNAMI} /></svg>
  </svg>
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
```

### Footer

```tsx
import { useSlidePageNumber } from '@open-slide/core';

const Footer = ({ source }: { source?: string }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ position: 'absolute', left: 120, right: 120, bottom: 42, display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 17, color: '#8A93AA' }}>
      <span>{source}</span>
      <span><span style={{ color: '#4C5672' }}>{String(current).padStart(2, '0')}</span> / {String(total).padStart(2, '0')}</span>
    </div>
  );
};
```

### Eyebrow / label

Lowercase mono, never uppercase-tracked eyebrows (an opentide.org anti-reference).

```tsx
const Label = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontFamily: MONO, fontSize: 20, color: '#4C5672', letterSpacing: '0.01em' }}>{children}</div>
);
```

## Motion

**Subtle.** One house transition for the deck (hold the outgoing page, fade + 6 px rise on the incoming, 260 ms), `dissolve` for chapter dividers, `settle` for the cover; `<Steps>` only where order is the point. The single signature motion is the **ASCII tide**: copy `FlipFluid`, `paintTide`, `stillDensity` and `TideCanvas` from `slides/opentide/index.tsx`. It runs live only when `useIsActivePage()` is true and paints a deterministic still frame everywhere else (thumbnails, presenter preview, PDF), so it never costs CPU off-screen and always prints.

```tsx
<TideCanvas text={QUERY_TEXT} fill={0.34} seed={0.58} maskTop={0.34 + 0.065} ink="#001489" bg="#FFFFFF" />
```

## Aesthetic

Coastal precision, light register: an editorial engineering document rather than a marketing deck. White
space, one blue, hairline tables, mono for anything a machine would read, and real artefacts (YAML,
commands, JSON envelopes) instead of illustrations. Terminal windows may be deep-tide navy as content.
Avoid: gradients, glassmorphism, drop-shadow stacks (PDF export strips them anyway), identical icon-card
grids, uppercase tracked eyebrows, gradient text, navy-and-gold, emoji, and any claim a platform cannot back.

## Example usage

```tsx
const Content: Page = () => (
  <div style={{ width: '100%', height: '100%', position: 'relative', background: 'var(--osd-bg)', color: 'var(--osd-text)', fontFamily: 'var(--osd-font-body)' }}>
    <TopBar chapter={['02', 'what opentide is']} />
    <div style={{ position: 'absolute', left: 120, top: 150, width: 1680, height: 820 }}>
      <Title>Three objects. Three questions.</Title>
      <p style={{ margin: '22px 0 0', fontSize: 30, lineHeight: 1.45, color: '#4C5672' }}>Threats, objectives and rules, linked by UUID.</p>
    </div>
    <Footer source="opentide.org/docs/usage/concepts/object-model" />
  </div>
);
```
