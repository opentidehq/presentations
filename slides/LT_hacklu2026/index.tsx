import {
  type DesignSystem,
  ImagePlaceholder,
  type Page,
  type SlideMeta,
  type SlideTransition,
  useSlidePageNumber,
} from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';
import azureSentinel from './assets/Azure-Sentinel.png';
import ecLogo from './assets/ec-logo-horiz_en.png';
import flacon from './assets/opentide-flacon.png';
import logo from './assets/opentide-logo.png';
import rulezet from './assets/rulezet.jpg';
import sigmahq from './assets/sigmahq.png';
import socPrime from './assets/soc_prime.jpg';
import splunkEscu from './assets/Splunk_ESCU.png';
import unitedWeCyberdefend from './assets/United_we_cyberdefend.png';
import qrOpentide from './assets/qr-opentide-org.svg';
import workshopAgenda from './assets/workshop_agenda.png';

export const design: DesignSystem = {
  palette: { bg: '#ffffff', text: '#0b1220', accent: '#0b3fa8' },
  fonts: {
    display: '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
    body: '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
  },
  typeScale: { hero: 120, body: 36 },
  radius: 14,
};

const c = {
  panel: '#f4f6fb',
  panelSoft: '#eceff8',
  rule: '#cfd8e8',
  soft: '#27334a',
  muted: '#56688c',
  dim: '#8c9ab4',
  blue: '#1d4ed8',
  green: '#0f7a52',
  red: '#c92a2a',
  yellow: '#a86400',
  ta: '#d32f2f',
  de: '#1d4ed8',
  pt: '#7c3aed',
};

const mono = '"Geist Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace';

export const transition: SlideTransition = {
  duration: 220,
  exit: {
    duration: 150,
    easing: 'cubic-bezier(0.4, 0, 1, 1)',
    keyframes: [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-5px)' },
    ],
  },
  enter: {
    duration: 220,
    easing: 'cubic-bezier(0, 0, 0.2, 1)',
    keyframes: [
      { opacity: 0, transform: 'translateY(6px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
  },
};

const fill: CSSProperties = {
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  background: 'var(--osd-bg)',
  color: 'var(--osd-text)',
  fontFamily: 'var(--osd-font-body)',
  letterSpacing: '-0.01em',
  WebkitFontSmoothing: 'antialiased',
};

const Footer = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute',
        left: 110,
        right: 110,
        bottom: 52,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 22,
        color: c.dim,
        letterSpacing: '0.08em',
      }}
    >
      <span>OPENTIDE · HACK.LU 2026</span>
      <span style={{ fontFamily: mono }}>
        {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
    </div>
  );
};

const Shell = ({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) => (
  <div
    style={{ ...fill, padding: '80px 110px 130px', display: 'flex', flexDirection: 'column' }}
  >
    <div
      style={{ fontSize: 24, lineHeight: 1.2, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--osd-accent)', translate: '0px 1.99px' }}
    >
      {eyebrow}
    </div>
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 52,
        lineHeight: 1.15,
        fontWeight: 800,
        margin: '20px 0 0',
      }}
    >
      {title}
    </h2>
    <div
      style={{
        marginTop: 28,
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
    <Footer />
  </div>
);

const Code = ({
  children,
  size = 26,
  label,
}: {
  children: string;
  size?: number;
  label?: string;
}) => (
  <div
    style={{
      border: `1px solid ${c.rule}`,
      borderRadius: 'var(--osd-radius)',
      background: c.panel,
      overflow: 'hidden',
    }}
  >
    {label ? (
      <div
        style={{
          padding: '14px 26px',
          borderBottom: `1px solid ${c.rule}`,
          fontFamily: mono,
          fontSize: 22,
          lineHeight: 1.2,
          color: c.muted,
        }}
      >
        {label}
      </div>
    ) : null}
    <pre
      style={{ margin: 0, padding: 24, fontFamily: mono, fontSize: size, lineHeight: 1.45, color: c.soft, whiteSpace: 'pre', translate: '-0.99px 0px' }}
    >
      {children}
    </pre>
  </div>
);

const Lede = ({ children }: { children: ReactNode }) => (
  <p
    style={{
      fontSize: 'var(--osd-size-body)',
      lineHeight: 1.55,
      color: c.soft,
      margin: 0,
      maxWidth: 1480,
    }}
  >
    {children}
  </p>
);

const Note = ({ children }: { children: ReactNode }) => (
  <p
    style={{
      fontSize: 28,
      lineHeight: 1.5,
      color: c.muted,
      margin: 0,
      borderLeft: `3px solid ${c.yellow}`,
      paddingLeft: 24,
      maxWidth: 1540,
    }}
  >
    {children}
  </p>
);

const Card = ({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title: string;
  body: string;
}) => (
  <div
    style={{
      flex: 1,
      border: `1px solid ${c.rule}`,
      borderRadius: 'var(--osd-radius)',
      background: c.panel,
      padding: 36,
    }}
  >
    <div
      style={{
        fontFamily: mono,
        fontSize: 22,
        lineHeight: 1.2,
        color: 'var(--osd-accent)',
        letterSpacing: '0.1em',
      }}
    >
      {kicker}
    </div>
    <div style={{ fontSize: 40, lineHeight: 1.2, fontWeight: 700, margin: '18px 0 14px' }}>
      {title}
    </div>
    <div style={{ fontSize: 28, lineHeight: 1.5, color: c.muted }}>{body}</div>
  </div>
);

const PlanRow = ({
  n,
  title,
  body,
  minutes,
}: {
  n: string;
  title: string;
  body: string;
  minutes: string;
}) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 32 }}>
    <span
      style={{
        fontFamily: mono,
        fontSize: 32,
        color: 'var(--osd-accent)',
        width: 60,
        flexShrink: 0,
      }}
    >
      {n}
    </span>
    <span style={{ fontSize: 40, lineHeight: 1.3, fontWeight: 650, width: 360, flexShrink: 0 }}>
      {title}
    </span>
    <span style={{ fontSize: 32, lineHeight: 1.4, color: c.muted, flex: 1 }}>{body}</span>
    <span
      style={{
        fontFamily: mono,
        fontSize: 28,
        color: 'var(--osd-accent)',
        width: 150,
        flexShrink: 0,
        textAlign: 'right',
      }}
    >
      {minutes}
    </span>
  </div>
);

const ObjectRow = ({
  family,
  acronym,
  question,
  dir,
}: {
  family: string;
  acronym: string;
  question: string;
  dir: string;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 36,
      border: `1px solid ${c.rule}`,
      borderRadius: 'var(--osd-radius)',
      background: c.panel,
      padding: '26px 32px',
    }}
  >
    <span style={{ fontSize: 38, lineHeight: 1.2, fontWeight: 700, width: 240, flexShrink: 0 }}>
      {family}
    </span>
    <span
      style={{
        fontFamily: mono,
        fontSize: 26,
        color: 'var(--osd-accent)',
        width: 90,
        flexShrink: 0,
      }}
    >
      {acronym}
    </span>
    <span style={{ fontSize: 30, lineHeight: 1.4, color: c.soft, flex: 1 }}>{question}</span>
    <span style={{ fontFamily: mono, fontSize: 24, color: c.muted, flexShrink: 0 }}>{dir}</span>
  </div>
);

const ChainBox = ({
  title,
  schema,
  tint,
}: {
  title: string;
  schema: string;
  tint: string;
}) => (
  <div
    style={{
      width: 380,
      flexShrink: 0,
      border: `1px solid ${tint}`,
      borderRadius: 'var(--osd-radius)',
      background: c.panel,
      padding: '34px 32px',
      textAlign: 'center',
    }}
  >
    <div style={{ fontSize: 42, lineHeight: 1.2, fontWeight: 700 }}>{title}</div>
    <div style={{ fontFamily: mono, fontSize: 24, color: tint, marginTop: 14 }}>{schema}</div>
  </div>
);

// Reading order is threat → rule (coverage); the YAML reference points back the
// other way, so each connector carries both directions.
const Arrow = ({ coverage, reference }: { coverage: string; reference: string }) => (
  <div style={{ width: 250, textAlign: 'center', flexShrink: 0 }}>
    <div style={{ fontSize: 22, color: c.muted, marginBottom: 12, whiteSpace: 'nowrap' }}>
      {coverage} →
    </div>
    <div style={{ height: 2, background: c.rule }} />
    <div
      style={{
        fontFamily: mono,
        fontSize: 21,
        color: 'var(--osd-accent)',
        marginTop: 12,
        whiteSpace: 'nowrap',
      }}
    >
      ← {reference}
    </div>
  </div>
);

const StatusRow = ({
  status,
  strategy,
  meaning,
}: {
  status: string;
  strategy: string;
  meaning: string;
}) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 32 }}>
    <span
      style={{
        fontFamily: mono,
        fontSize: 28,
        color: 'var(--osd-text)',
        width: 320,
        flexShrink: 0,
      }}
    >
      {status}
    </span>
    <span
      style={{
        fontFamily: mono,
        fontSize: 26,
        color: 'var(--osd-accent)',
        width: 300,
        flexShrink: 0,
      }}
    >
      {strategy}
    </span>
    <span style={{ fontSize: 28, lineHeight: 1.4, color: c.muted }}>{meaning}</span>
  </div>
);

const ToolRow = ({ tool, what }: { tool: string; what: string }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 32 }}>
    <span
      style={{
        fontFamily: mono,
        fontSize: 26,
        color: 'var(--osd-accent)',
        width: 560,
        flexShrink: 0,
      }}
    >
      {tool}
    </span>
    <span style={{ fontSize: 30, lineHeight: 1.4, color: c.soft }}>{what}</span>
  </div>
);

const Bullet = ({ children }: { children: ReactNode }) => (
  <li
    style={{
      display: 'flex',
      gap: 24,
      fontSize: 34,
      lineHeight: 1.45,
      color: c.soft,
      marginBottom: 26,
      listStyle: 'none',
    }}
  >
    <span style={{ color: 'var(--osd-accent)', flexShrink: 0 }}>—</span>
    <span>{children}</span>
  </li>
);

// Shared chart scaffolding for the three knowledge-curve pages.
// The viewBox maps 1:1 onto the 1700px content width, so every number below is
// a real pixel on the 1920×1080 canvas.
const AxisFrame = ({ title, children }: { title: string; children: ReactNode }) => (
  <svg
    viewBox="0 0 1700 470"
    role="img"
    aria-label={title}
    style={{ width: '100%', height: 'auto', display: 'block' }}
  >
    <title>{title}</title>
    <text x={130} y={16} fill={c.dim} fontSize={22} fontFamily={mono}>
      depth of knowledge
    </text>
    <line x1={130} y1={24} x2={130} y2={400} stroke={c.rule} strokeWidth={2} />
    <line x1={130} y1={400} x2={1660} y2={400} stroke={c.rule} strokeWidth={2} />
    <text x={1660} y={436} fill={c.dim} fontSize={22} fontFamily={mono} textAnchor="end">
      time
    </text>
    {children}
  </svg>
);

const Chip = ({ x, label, tone = 'plain' }: { x: number; label: string; tone?: 'plain' | 'accent' }) => (
  <g>
    <rect
      x={x}
      y={140}
      width={118}
      height={42}
      rx={8}
      fill={tone === 'accent' ? '#ffffff' : c.panelSoft}
      stroke={tone === 'accent' ? 'var(--osd-accent)' : c.rule}
      strokeWidth={tone === 'accent' ? 3 : 2}
    />
    <text
      x={x + 59}
      y={168}
      fill={tone === 'accent' ? 'var(--osd-accent)' : c.soft}
      fontSize={24}
      fontFamily={mono}
      fontWeight={tone === 'accent' ? 700 : 400}
      textAnchor="middle"
    >
      {label}
    </text>
  </g>
);

const Divider = ({
  number,
  minutes,
  title,
  subtitle,
}: {
  number: string;
  minutes: string;
  title: string;
  subtitle: string;
}) => (
  <div
    style={{
      ...fill,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 140px',
    }}
  >
    <div style={{ fontFamily: mono, fontSize: 36, color: 'var(--osd-accent)' }}>
      {number} <span style={{ color: c.dim }}>· {minutes}</span>
    </div>
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 116,
        lineHeight: 1.05,
        fontWeight: 900,
        margin: '28px 0 0',
      }}
    >
      {title}
    </h2>
    <p style={{ fontSize: 40, lineHeight: 1.45, color: c.muted, margin: '32px 0 0', maxWidth: 1200 }}>
      {subtitle}
    </p>
    <Footer />
  </div>
);

// ─── Pages ────────────────────────────────────────────────────────────────────

const Cover: Page = () => (
  <div
    style={{
      ...fill,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 140px',
    }}
  >
    <img src={logo} alt="OpenTIDE" style={{ width: 140, height: 140 }} />
    <div
      style={{
        fontSize: 26,
        fontWeight: 700,
        letterSpacing: '0.22em',
        color: 'var(--osd-accent)',
        marginTop: 48,
      }}
    >
      HANDS-ON WORKSHOP · 90 MINUTES
    </div>
    <h1
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 'var(--osd-size-hero)',
        lineHeight: 1.02,
        fontWeight: 900,
        margin: '24px 0 0',
      }}
    >
      OpenTIDE Workshop
    </h1>
    <p style={{ fontSize: 48, lineHeight: 1.35, color: c.soft, margin: '30px 0 0', maxWidth: 1400 }}>
      Build Your Own Operational DetectionOps Platform in 90 Minutes
    </p>
    <div style={{ fontFamily: mono, fontSize: 26, color: c.dim, marginTop: 40 }}>
      python 3.10–3.14 · pip install opentide · opentide.org
    </div>
  </div>
);

// Title page for hack.lu 2026: what OpenTIDE stands for, where it comes from,
// and the licence it ships under.
const TitleLT: Page = () => (
  <div
    style={{
      ...fill,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 140px',
    }}
  >
    <img src={logo} alt="OpenTIDE" style={{ width: 132, height: 132 }} />

    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 20,
        marginTop: 42,
      }}
    >
      <span
        style={{
          fontFamily: mono,
          fontSize: 26,
          color: 'var(--osd-accent)',
          letterSpacing: '0.08em',
        }}
      >
        hack.lu 2026 · lightning talk
      </span>
      <span style={{ fontFamily: mono, fontSize: 26, color: c.dim }}>·</span>
      <span style={{ fontSize: 28, fontWeight: 650, color: c.soft }}>Rémi Séguy</span>
    </div>

    <h1
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 132,
        lineHeight: 1.0,
        fontWeight: 900,
        margin: '18px 0 0',
        letterSpacing: '-0.03em',
      }}
    >
      Open<span style={{ color: 'var(--osd-accent)' }}>TIDE</span>
    </h1>

    <p
      style={{
        fontSize: 54,
        lineHeight: 1.25,
        fontWeight: 650,
        color: c.soft,
        margin: '26px 0 0',
        maxWidth: 1540,
      }}
    >
      <span style={{ color: 'var(--osd-accent)' }}>Open</span>source{' '}
      <span style={{ color: 'var(--osd-accent)' }}>T</span>hreat-
      <span style={{ color: 'var(--osd-accent)' }}>I</span>nformed{' '}
      <span style={{ color: 'var(--osd-accent)' }}>D</span>etection{' '}
      <span style={{ color: 'var(--osd-accent)' }}>E</span>ngineering
    </p>

    <p style={{ fontSize: 34, lineHeight: 1.5, color: c.muted, margin: '30px 0 0', maxWidth: 1420 }}>
      Developed at the <strong style={{ color: c.soft, fontWeight: 650 }}>CSOC of the European
      Commission</strong> — and open sourced since 2024 under the{' '}
      <span style={{ fontFamily: mono, fontSize: 30, color: 'var(--osd-accent)' }}>
        EUPL v1.2
      </span>{' '}
      EU public licence.
    </p>

    {/* provenance strip: the institution, and the campaign it belongs to */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 56,
        marginTop: 64,
        paddingTop: 40,
        borderTop: `1px solid ${c.rule}`,
      }}
    >
      <img
        src={ecLogo}
        alt="European Commission"
        style={{ height: 86, width: 'auto', display: 'block' }}
      />
      <div style={{ width: 1, height: 86, background: c.rule }} />
      <img
        src={unitedWeCyberdefend}
        alt="United we cyberdefend"
        style={{ height: 104, width: 'auto', display: 'block' }}
      />
      <div style={{ marginLeft: 'auto', fontFamily: mono, fontSize: 24, color: c.dim, textAlign: 'right', lineHeight: 1.6 }}>
        opentide.org
        <br />
        github.com/OpenTideHQ
      </div>
    </div>
  </div>
);

const WhatIsIt: Page = () => (
  <Shell eyebrow="CONTEXT" title="OpenTide is the DetectionOps engine">
    <Lede>
      One Python package for detection-as-code. Point it at a repository of YAML detection content
      and it becomes the toolchain around that content: schemas, validation, documentation, and
      deployment to seven security platforms.
    </Lede>
    <div style={{ display: 'flex', gap: 36, marginTop: 56 }}>
      <Card
        kicker="VALIDATE"
        title="Content you can trust"
        body="Schema checks, UUID uniqueness, cross-object references, filename and metadata lint."
      />
      <Card
        kicker="GENERATE"
        title="Artifacts, not handwork"
        body="JSON Schemas, templates, IDE snippets, exports, and wiki-style object documentation."
      />
      <Card
        kicker="DEPLOY"
        title="Rules onto platforms"
        body="One rule, many platform blocks. Dry-run first, then push to staging or production."
      />
    </div>
  </Shell>
);

const Plan: Page = () => (
  <Shell eyebrow="THE PLAN" title="Seventy-five minutes, mostly prompting">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <PlanRow
        n="01"
        title="Bootstrap"
        body="install the package, wire the agent into your editor"
        minutes="10 min"
      />
      <PlanRow
        n="02"
        title="Configure"
        body="the agent interviews you, then scaffolds the repository"
        minutes="10 min"
      />
      <PlanRow
        n="03"
        title="TI to rule"
        body="one intel snippet down to a validated threat, objective and rule"
        minutes="20 min"
      />
      <PlanRow
        n="04"
        title="Validate & ship"
        body="strict gates, query check, dry-run deploy, CI"
        minutes="20 min"
      />
      <PlanRow
        n="05"
        title="Document"
        body="wiki pages and coverage diagrams, generated"
        minutes="5 min"
      />
      <PlanRow
        n="06"
        title="Share"
        body="publish to MISP with the key we gave you"
        minutes="5 min"
      />
      <PlanRow n="07" title="Wrap-up" body="guardrails, cheat sheet, where to go next" minutes="5 min" />
    </div>
    <div style={{ marginTop: 40 }}>
      <Note>
        You type one block of commands, in step 01. After that the agent drives and you review. You
        leave with a repository that validates clean and a rule ready to deploy.
      </Note>
    </div>
  </Shell>
);

// Full-bleed image, nothing else — no title, no footer.
const Flacon: Page = () => (
  <div style={{ ...fill }}>
    <img
      src={flacon}
      alt="An OpenTIDE perfume bottle"
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  </div>
);

// Logos feeding the bottle. Cards are absolutely positioned on the 1920×1080
// canvas; the arrow overlay sits between the photo and the cards.
const LogoCard = ({
  src,
  alt,
  left,
  top,
  width,
  height,
}: {
  src: string;
  alt: string;
  left: number;
  top: number;
  width: number;
  height: number;
}) => (
  <div
    style={{
      position: 'absolute',
      left,
      top,
      width,
      height,
      background: '#101a28',
      border: '1px solid rgba(255,255,255,0.16)',
      borderRadius: 18,
      boxShadow: '0 12px 34px rgba(8,16,30,0.32)',
      padding: 18,
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <img
      src={src}
      alt={alt}
      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
    />
  </div>
);

// Each arrow is drawn twice: a white halo for legibility over the photo, then
// the accent stroke on top.
const ArrowIn = ({
  x1,
  y1,
  x2,
  y2,
  head,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  head: string;
}) => (
  <g>
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="#ffffff"
      strokeWidth={14}
      strokeLinecap="round"
      opacity={0.8}
    />
    <polygon points={head} fill="#ffffff" opacity={0.8} stroke="#ffffff" strokeWidth={10} />
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="var(--osd-accent)"
      strokeWidth={6}
      strokeLinecap="round"
    />
    <polygon points={head} fill="var(--osd-accent)" />
  </g>
);

// The bottle stays dead centre; the whole 1920×1080 composition is scaled down
// as one block so the hand-tuned arrow geometry stays intact under the title.
const FlaconSources: Page = () => (
  <div style={{ ...fill }}>
    <div style={{ position: 'absolute', left: 110, right: 110, top: 54 }}>
      <div
        style={{
          fontSize: 24,
          lineHeight: 1.2,
          fontWeight: 700,
          letterSpacing: '0.2em',
          color: 'var(--osd-accent)',
        }}
      >
        POSITIONING
      </div>
      <h2
        style={{
          fontFamily: 'var(--osd-font-display)',
          fontSize: 50,
          lineHeight: 1.15,
          fontWeight: 800,
          margin: '16px 0 0',
        }}
      >
        OpenTIDE is a management and operational framework
      </h2>
    </div>

    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 182,
        width: 1920,
        height: 1080,
        transform: 'scale(0.80)',
        transformOrigin: 'top center',
      }}
    >
      <img
        src={flacon}
        alt="An OpenTIDE perfume bottle"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      <svg
        viewBox="0 0 1920 1080"
        role="img"
        aria-label="SigmaHQ, Microsoft Sentinel, Splunk ESCU, Rulezet and SOC Prime content flowing into OpenTIDE."
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <title>Public detection content flows into OpenTIDE</title>
        <ArrowIn x1={361} y1={279} x2={652} y2={444} head="651.5,444.3 622.5,442.7 635.3,420.1" />
        <ArrowIn x1={308} y1={551} x2={607} y2={583} head="607,582.6 579.7,592.8 582.5,567" />
        <ArrowIn x1={337} y1={829} x2={624} y2={733} head="623.5,733 603,753.6 594.8,729" />
        <ArrowIn
          x1={1424}
          y1={360}
          x2={1279}
          y2={465}
          head="1279.3,464.8 1297,441.7 1308.4,465.1"
        />
        <ArrowIn
          x1={1404}
          y1={700}
          x2={1312}
          y2={670}
          head="1311.5,669.5 1339,660.2 1335.4,686"
        />
      </svg>
      <LogoCard src={sigmahq} alt="SigmaHQ" left={90} top={150} width={300} height={120} />
      <LogoCard
        src={azureSentinel}
        alt="Microsoft Sentinel"
        left={120}
        top={470}
        width={170}
        height={140}
      />
      <LogoCard src={splunkEscu} alt="Splunk ESCU" left={140} top={790} width={180} height={150} />
      {/* Rulezet and SOC Prime / Prime Architect run larger than the other sources */}
      <LogoCard src={rulezet} alt="Rulezet" left={1440} top={115} width={380} height={340} />
      <LogoCard
        src={socPrime}
        alt="SOC Prime — Prime Architect"
        left={1420}
        top={590}
        width={400}
        height={250}
      />
    </div>
  </div>
);

const HandoverGap: Page = () => (
  <Shell eyebrow="WHY THIS EXISTS" title="Knowledge is lost at the hand-over">
    <AxisFrame title="Threat analyst knowledge rises, drops at the hand-over, and the detection engineer has to relearn from a lower starting point.">
      {/* threat analyst */}
      <line x1={130} y1={380} x2={760} y2={105} stroke={c.ta} strokeWidth={5} />
      <circle cx={760} cy={105} r={9} fill={c.ta} />
      {/* label rides the slope so it never crosses the line */}
      <text
        x={260}
        y={306}
        fill={c.ta}
        fontSize={30}
        fontWeight={650}
        transform="rotate(-23.6 260 306)"
      >
        Threat analyst
      </text>

      {/* the level the analyst reached, for comparison */}
      <line
        x1={760}
        y1={105}
        x2={1640}
        y2={105}
        stroke={c.ta}
        strokeWidth={2}
        strokeDasharray="6 10"
        opacity={0.5}
      />
      <text x={1630} y={92} fill={c.ta} fontSize={24} textAnchor="end" opacity={0.85}>
        depth the analyst had
      </text>

      {/* hand-over */}
      <line
        x1={760}
        y1={90}
        x2={760}
        y2={400}
        stroke={c.rule}
        strokeWidth={2}
        strokeDasharray="8 10"
      />
      <text x={760} y={62} fill={c.soft} fontSize={26} textAnchor="middle">
        hand-over: PDF, wiki, slides
      </text>

      {/* the drop */}
      <line x1={800} y1={115} x2={800} y2={280} stroke={c.yellow} strokeWidth={3} />
      <polygon points="800,296 791,276 809,276" fill={c.yellow} />
      <text x={822} y={222} fill={c.yellow} fontSize={28} fontWeight={650}>
        knowledge lost
      </text>

      {/* detection engineer */}
      <line x1={760} y1={320} x2={1640} y2={150} stroke={c.de} strokeWidth={5} />
      <circle cx={760} cy={320} r={9} fill={c.de} />
      <circle cx={1640} cy={150} r={9} fill={c.de} />
      <text x={1120} y={200} fill={c.de} fontSize={30} fontWeight={650} textAnchor="middle">
        Detection engineer
      </text>
      <text x={1085} y={372} fill={c.muted} fontSize={24} textAnchor="middle">
        relearn the threat before writing anything
      </text>
      <text x={1630} y={252} fill={c.soft} fontSize={26} textAnchor="end">
        objectives + rules
      </text>
    </AxisFrame>
    <div style={{ marginTop: 36 }}>
      <Note>
        Two teams, two curves, a cliff between them. The analyst's depth never transfers — it is
        flattened into prose, and the engineer rebuilds it from a lower starting point and rarely
        gets back to the same level.
      </Note>
    </div>
  </Shell>
);

const AttackOnly: Page = () => (
  <Shell eyebrow="WHY THIS EXISTS" title="ATT&CK technique IDs are a weak link">
    <AxisFrame title="With only ATT&CK technique IDs handed over, the detection engineer starts lower, and after six months the procedure detail is forgotten and knowledge declines.">
      {/* threat analyst */}
      <line x1={130} y1={380} x2={760} y2={105} stroke={c.ta} strokeWidth={5} />
      <circle cx={760} cy={105} r={9} fill={c.ta} />
      <text
        x={260}
        y={306}
        fill={c.ta}
        fontSize={30}
        fontWeight={650}
        transform="rotate(-23.6 260 306)"
      >
        Threat analyst
      </text>

      <line
        x1={760}
        y1={105}
        x2={1640}
        y2={105}
        stroke={c.ta}
        strokeWidth={2}
        strokeDasharray="6 10"
        opacity={0.5}
      />
      <text x={1630} y={92} fill={c.ta} fontSize={24} textAnchor="end" opacity={0.85}>
        depth the analyst had
      </text>

      {/* hand-over: a technique list */}
      <line
        x1={760}
        y1={90}
        x2={760}
        y2={400}
        stroke={c.rule}
        strokeWidth={2}
        strokeDasharray="8 10"
      />
      <text x={760} y={62} fill={c.soft} fontSize={26} textAnchor="middle">
        hand-over: a list of ATT&CK techniques
      </text>
      <Chip x={820} label="T1059" />
      <Chip x={958} label="T1003" />
      <Chip x={1096} label="T1078" />
      <Chip x={1234} label="T1190" tone="accent" />

      {/* no real connection between the two curves */}
      <line
        x1={760}
        y1={118}
        x2={760}
        y2={338}
        stroke={c.dim}
        strokeWidth={3}
        strokeDasharray="2 12"
      />
      <text x={700} y={236} fill={c.muted} fontSize={26} textAnchor="end">
        no clear link
      </text>

      {/* detection engineer: up, then decay */}
      <line x1={760} y1={350} x2={1180} y2={255} stroke={c.de} strokeWidth={5} />
      <line x1={1180} y1={255} x2={1640} y2={345} stroke={c.de} strokeWidth={5} />
      <circle cx={760} cy={350} r={9} fill={c.de} />
      <circle cx={1180} cy={255} r={9} fill={c.de} />
      <circle cx={1640} cy={345} r={9} fill={c.de} />
      <text x={950} y={248} fill={c.de} fontSize={30} fontWeight={650} textAnchor="middle">
        Detection engineer
      </text>

      <line
        x1={1180}
        y1={240}
        x2={1180}
        y2={400}
        stroke={c.rule}
        strokeWidth={2}
        strokeDasharray="8 10"
      />
      {/* dropped below the chip row so the T1190 chip has clear air */}
      <text x={1200} y={224} fill={c.yellow} fontSize={26} fontWeight={650}>
        + 6 months
      </text>
      <text x={1200} y={254} fill={c.muted} fontSize={24}>
        procedure detail forgotten
      </text>
      <text x={1630} y={382} fill={c.muted} fontSize={24} textAnchor="end">
        rules drift, nobody remembers why they exist
      </text>
    </AxisFrame>

    {/* The worked example: one technique ID, and everything it fails to say. */}
    <div
      style={{
        marginTop: 28,
        border: `1px solid ${c.rule}`,
        borderLeft: `4px solid var(--osd-accent)`,
        borderRadius: 'var(--osd-radius)',
        background: c.panel,
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 36,
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <div style={{ fontFamily: mono, fontSize: 40, fontWeight: 700, color: 'var(--osd-accent)' }}>
          T1190
        </div>
        <div style={{ fontFamily: mono, fontSize: 20, color: c.dim, marginTop: 6 }}>
          one technique id
        </div>
      </div>
      <div style={{ width: 1, alignSelf: 'stretch', background: c.rule, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 34, lineHeight: 1.3, fontWeight: 650, color: 'var(--osd-text)' }}>
          “Internet-facing application compromised.”
        </div>
        <div style={{ fontSize: 26, lineHeight: 1.45, color: c.muted, marginTop: 10 }}>
          Which application? Which CVE? Which request, which log source, which field? You cannot
          write a query from this, and you cannot tell whether you already cover it — far too vague
          to drive detection engineering.
        </div>
      </div>
    </div>

    <div style={{ marginTop: 24 }}>
      <Note>
        A technique ID says <em>what category</em>, never <em>what the adversary actually did</em>.
        Six months on, the procedure behind the rule is gone and nothing in the repository can tell
        you whether the rule still matters.
      </Note>
    </div>
  </Shell>
);

const WithOpenTide: Page = () => (
  <Shell eyebrow="WHY THIS EXISTS" title="With OpenTide: one curve, one chain">
    <AxisFrame title="With OpenTide a single purple-team curve rises without a break: the threat is documented once and the rule stays linked to the attack vector.">
      <line x1={130} y1={390} x2={1640} y2={70} stroke={c.pt} strokeWidth={6} />
      <circle cx={130} cy={390} r={9} fill={c.pt} />
      <circle cx={1640} cy={70} r={9} fill={c.pt} />

      {/* the purple team, documenting in OpenTide */}
      <circle cx={885} cy={230} r={17} fill="var(--osd-bg)" stroke={c.pt} strokeWidth={6} />
      <circle cx={885} cy={230} r={6} fill={c.pt} />
      <text x={850} y={198} fill="var(--osd-text)" fontSize={28} fontWeight={650} textAnchor="end">
        purple team documents the threat in OpenTide
      </text>
      <text x={870} y={352} fill={c.muted} fontSize={23} fontFamily={mono} textAnchor="middle">
        threat → objective → rule, one UUID chain
      </text>

      <text x={160} y={320} fill={c.soft} fontSize={26}>
        attack vector
      </text>
      <text x={1630} y={160} fill={c.soft} fontSize={26} textAnchor="end">
        detection rules
      </text>
      <text x={1630} y={268} fill={c.yellow} fontSize={26} fontWeight={650} textAnchor="end">
        no hand-over, no relearn
      </text>
      <text x={1630} y={302} fill={c.muted} fontSize={24} textAnchor="end">
        the rule still points at the threat that justified it
      </text>
    </AxisFrame>
    <div style={{ marginTop: 36 }}>
      <Note>
        Same people, same hours — one artefact. The threat is written down once, in a structured
        object, and the rule references it by UUID. Nothing to re-explain, nothing to forget.
      </Note>
    </div>
  </Shell>
);

const Objects: Page = () => (
  <Shell eyebrow="THE MODEL" title="Three object families under objects">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <ObjectRow
        family="Threat"
        acronym="TVM"
        question="What do we defend against?"
        dir="objects/threats/"
      />
      <ObjectRow
        family="Objective"
        acronym="DOM"
        question="What are we trying to detect?"
        dir="objects/objectives/"
      />
      <ObjectRow
        family="Rule"
        acronym="MDR"
        question="How do we detect it, on which platform?"
        dir="objects/rules/"
      />
    </div>
    <div style={{ marginTop: 44 }}>
      <Note>
        Every object is YAML with a top-level <code style={{ fontFamily: mono }}>name</code> and a
        shared <code style={{ fontFamily: mono }}>metadata</code> block. The UUID is the identity —
        rename and move files freely.
      </Note>
    </div>
  </Shell>
);

const Chain: Page = () => (
  <Shell eyebrow="THE MODEL" title="Turn TI in actionable objects down to rules">
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
      }}
    >
      <ChainBox title="Threat" schema="threat::1.0" tint={c.green} />
      <Arrow coverage="is covered by" reference="objective.threats" />
      <ChainBox title="Objective" schema="objective::1.0" tint={c.blue} />
      <Arrow coverage="is implemented by" reference="detection_model" />
      <ChainBox title="Rule" schema="rule::1.0" tint={c.pt} />
    </div>
    <div style={{ marginTop: 60, display: 'flex', flexDirection: 'column', gap: 26 }}>
      <Note>
        Coverage reads left to right; the YAML reference points back the other way, in blue. Keep
        the graph a DAG — the validator rejects duplicate UUIDs, dangling references, and loops.
      </Note>
      <Code size={26}>{`opentide info                                      # objects and their links
opentide --json info --technique T1059 coverage    # coverage for one technique`}</Code>
    </div>
  </Shell>
);

// ─── Slides 10 + 11 merged: the stack, in three layers ────────────────────────
// Layer 1 the object chain, layer 2 the status a rule moves through, layer 3
// the platforms it lands on. Each band is compact so all three fit one canvas.

const LayerHead = ({ n, name, sub }: { n: string; name: string; sub: string }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 12 }}>
    <span
      style={{
        fontFamily: mono,
        fontSize: 20,
        fontWeight: 700,
        color: 'var(--osd-accent)',
        letterSpacing: '0.08em',
      }}
    >
      LEVEL {n}
    </span>
    <span style={{ fontSize: 26, fontWeight: 700 }}>{name}</span>
    <span style={{ fontFamily: mono, fontSize: 19, color: c.dim }}>· {sub}</span>
  </div>
);

const ObjBox = ({ title, sub, tint }: { title: string; sub: string; tint: string }) => (
  <div
    style={{
      flex: 1,
      border: `1.5px solid ${tint}`,
      borderRadius: 12,
      background: c.panel,
      padding: '14px 18px',
      textAlign: 'center',
    }}
  >
    <div style={{ fontSize: 27, lineHeight: 1.2, fontWeight: 700 }}>{title}</div>
    <div style={{ fontFamily: mono, fontSize: 17, color: tint, marginTop: 5 }}>{sub}</div>
  </div>
);

const ObjArrow = () => (
  <div
    style={{
      width: 44,
      flexShrink: 0,
      alignSelf: 'center',
      textAlign: 'center',
      fontSize: 26,
      color: c.dim,
    }}
  >
    →
  </div>
);

const StatusChip = ({
  status,
  strategy,
  tone = 'plain',
}: {
  status: string;
  strategy: string;
  tone?: 'plain' | 'live' | 'loop' | 'off';
}) => (
  <div
    style={{
      flex: 1,
      minWidth: 0,
      borderRadius: 10,
      boxSizing: 'border-box',
      padding: '12px 8px',
      textAlign: 'center',
      background: tone === 'live' ? '#0d1526' : tone === 'off' ? c.panelSoft : '#ffffff',
      border:
        tone === 'loop'
          ? `1.5px dashed ${c.pt}`
          : `1.5px solid ${tone === 'live' ? '#0d1526' : c.rule}`,
    }}
  >
    <div
      style={{
        fontFamily: mono,
        fontSize: 18,
        fontWeight: 700,
        color: tone === 'live' ? '#ffffff' : tone === 'loop' ? c.pt : 'var(--osd-text)',
      }}
    >
      {status}
    </div>
    <div
      style={{
        fontFamily: mono,
        fontSize: 16,
        marginTop: 5,
        color:
          tone === 'live'
            ? '#9fb0cc'
            : tone === 'loop'
              ? c.pt
              : tone === 'off'
                ? c.dim
                : 'var(--osd-accent)',
      }}
    >
      {strategy}
    </div>
  </div>
);

const PlatformMini = ({
  name,
  id,
  query,
  planned,
}: {
  name: string;
  id: string;
  query: string;
  planned?: boolean;
}) => (
  <div
    style={{
      border: planned ? `1.5px dashed ${c.dim}` : `1px solid ${c.rule}`,
      borderRadius: 10,
      background: planned ? 'transparent' : c.panel,
      padding: '13px 16px',
    }}
  >
    <div
      style={{
        fontSize: 22,
        lineHeight: 1.25,
        fontWeight: 650,
        color: planned ? c.muted : 'var(--osd-text)',
      }}
    >
      {name}
    </div>
    <div style={{ fontFamily: mono, fontSize: 16, color: c.dim, marginTop: 6 }}>{id}</div>
    <div style={{ fontFamily: mono, fontSize: 16, marginTop: 8 }}>
      {planned ? (
        <span style={{ color: c.dim }}>{query}</span>
      ) : (
        <>
          <span style={{ color: c.green }}>deploy</span>
          <span style={{ color: c.dim }}> · </span>
          <span style={{ color: query === 'no query check' ? c.red : c.green }}>{query}</span>
        </>
      )}
    </div>
  </div>
);

const LayerDown = () => (
  <div style={{ textAlign: 'center', fontSize: 24, color: c.dim, lineHeight: 1, margin: '14px 0' }}>
    ↓
  </div>
);

const ThreeLayers: Page = () => (
  <Shell eyebrow="OPERATIONS" title="The rules implement the Threat Detection ">
    {/* LEVEL 1 · the objects */}
    <div>
      <LayerHead n="1" name="Objects" sub="the threat-informed chain" />
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <ObjBox title="Threats" sub="what we defend against" tint={c.green} />
        <ObjArrow />
        <ObjBox title="Objectives" sub="what we must see" tint={c.blue} />
        <ObjArrow />
        <ObjBox title="Signals" sub="the evidence" tint={c.pt} />
        <ObjArrow />
        <ObjBox title="Rules" sub="how a platform sees it" tint={c.soft} />
      </div>
    </div>

    <LayerDown />

    {/* LEVEL 2 · the status a rule moves through */}
    <div>
      <LayerHead n="2" name="Rule development status" sub="status decides what deploy does" />
      <div style={{ display: 'flex', gap: 12 }}>
        <StatusChip status="DESIGN" strategy="inert" />
        <StatusChip status="DEVELOPMENT" strategy="preview" />
        <StatusChip status="STAGING" strategy="preview" />
        <StatusChip status="ACCEPTANCE" strategy="preview" />
        <StatusChip status="PRODUCTION" strategy="release" tone="live" />
        <StatusChip status="IMPROVING" strategy="loops back" tone="loop" />
        <StatusChip status="DISABLED" strategy="disablement" tone="off" />
        <StatusChip status="REMOVED" strategy="deletion" tone="off" />
      </div>
    </div>

    <LayerDown />

    {/* LEVEL 3 · where the rule lands */}
    <div>
      <LayerHead n="3" name="Platforms" sub="seven in the wheel, three on the roadmap" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        <PlatformMini name="Microsoft Sentinel" id="sentinel" query="KQL check" />
        <PlatformMini name="Defender for Endpoint" id="defender_for_endpoint" query="KQL check" />
        <PlatformMini name="Splunk ES" id="splunk" query="SPL check" />
        <PlatformMini name="SentinelOne" id="sentinel_one" query="S1QL check" />
        <PlatformMini name="Carbon Black Cloud" id="carbon_black_cloud" query="Lucene check" />
        <PlatformMini name="CrowdStrike Falcon" id="crowdstrike" query="no query check" />
        <PlatformMini name="HarfangLab" id="harfanglab" query="no query check" />
        <PlatformMini name="Elastic Security" id="RFC 0007" query="accepted — not shipped" planned />
        <PlatformMini name="Sysdig Secure · Falco" id="RFC 0004" query="draft — not shipped" planned />
        <PlatformMini name="Graylog" id="community ask" query="not planned yet" planned />
      </div>
    </div>
  </Shell>
);

// Nested adoption scopes, after the CoreTIDE "Use cases" diagram. Threat
// vectors sit inside threats-and-objectives, which sits inside OpenTide
// alongside the managed rules that ship. Objectives decompose into signals and
// a rule implements a signal, so each signal gets its own row and the rules it
// covers sit on that row's band. Every coordinate is a real pixel on the
// 1700px content width, same convention as AxisFrame.
const shieldPath = (cx: number, cy: number) =>
  `M ${cx - 11} ${cy - 13} L ${cx + 11} ${cy - 13} L ${cx + 11} ${cy + 2}` +
  ` Q ${cx + 11} ${cy + 11} ${cx} ${cy + 14} Q ${cx - 11} ${cy + 11} ${cx - 11} ${cy + 2} Z`;

const ThreatDot = ({ x, y }: { x: number; y: number }) => (
  <circle cx={x} cy={y} r={12} fill={c.green} />
);

const RuleDot = ({ x, y }: { x: number; y: number }) => (
  <rect x={x - 10} y={y - 10} width={20} height={20} rx={5} fill={c.pt} />
);

// detection_model is optional, so a rule with no signal behind it still
// validates and still deploys. Hollow, because nothing backs it.
const OrphanRuleDot = ({ x, y }: { x: number; y: number }) => (
  <rect
    x={x - 10}
    y={y - 10}
    width={20}
    height={20}
    rx={5}
    fill="var(--osd-bg)"
    stroke={c.pt}
    strokeWidth={2.5}
  />
);

const ScopeLink = ({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c.yellow} strokeWidth={1.4} opacity={0.45} />
);

// Filled, so the signal rows inside read as nested rather than adjacent.
const ObjectiveBox = ({ top }: { top: number }) => (
  <g>
    <rect
      x={470}
      y={top}
      width={330}
      height={150}
      rx={8}
      fill={c.panel}
      stroke={c.blue}
      strokeWidth={2}
    />
    <text
      x={488}
      y={top + 30}
      fill={c.blue}
      fontSize={18}
      fontFamily={mono}
      letterSpacing="0.08em"
    >
      objective
    </text>
  </g>
);

// One signal per row, so its rules can sit on the same band and the link never
// crosses the label text.
const SignalRow = ({ y, name }: { y: number; name: string }) => (
  <g>
    <path d={shieldPath(510, y)} fill={c.blue} />
    <text x={534} y={y + 6} fill={c.soft} fontSize={17} fontFamily={mono}>
      {name}
    </text>
  </g>
);

const UseCases: Page = () => (
  <Shell eyebrow="USE CASES" title="From a threat library to managed rules">
    <svg
      viewBox="0 0 1700 510"
      role="img"
      aria-label="OpenTide wraps three nested scopes: threat vectors on their own, threat vectors with the objectives that cover them, and managed detection rules. Each objective decomposes into named signals and most rules implement one signal, while three hollow rules have no signal behind them and are managed all the same."
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      <title>
        Three adoption scopes inside OpenTide, with rules implementing signals and a few orphans
      </title>

      {/* the engine wraps every scope */}
      <rect
        x={6}
        y={28}
        width={1680}
        height={462}
        rx={10}
        fill="none"
        stroke={c.yellow}
        strokeWidth={3}
      />
      <text x={34} y={66} fill="var(--osd-accent)" fontSize={29} fontWeight={800}>
        OpenTide
      </text>

      {/* scope 2 — threats and the objectives that cover them */}
      <rect
        x={38}
        y={86}
        width={822}
        height={392}
        rx={8}
        fill="none"
        stroke={c.blue}
        strokeWidth={2.5}
        strokeDasharray="10 8"
      />
      <text x={60} y={118} fill={c.blue} fontSize={24} fontWeight={650} letterSpacing="0.04em">
        THREAT VECTORS &amp; DETECTION OBJECTIVES
      </text>

      {/* scope 1 — a threat library on its own */}
      <rect
        x={62}
        y={140}
        width={330}
        height={318}
        rx={8}
        fill="none"
        stroke={c.green}
        strokeWidth={2.5}
        strokeDasharray="10 8"
      />
      <text x={82} y={172} fill={c.green} fontSize={23} fontWeight={650} letterSpacing="0.04em">
        THREAT VECTORS
      </text>

      {/* scope 3 — the rules that actually ship */}
      <rect
        x={902}
        y={86}
        width={756}
        height={392}
        rx={8}
        fill="none"
        stroke={c.pt}
        strokeWidth={2.5}
        strokeDasharray="10 8"
      />
      <text x={924} y={118} fill={c.pt} fontSize={24} fontWeight={650} letterSpacing="0.04em">
        MANAGED DETECTION RULES
      </text>

      {/* objective.threats — a threat is covered by an objective */}
      <ScopeLink x1={200} y1={208} x2={470} y2={225} />
      <ScopeLink x1={120} y1={232} x2={470} y2={225} />
      <ScopeLink x1={260} y1={268} x2={470} y2={225} />
      <ScopeLink x1={348} y1={300} x2={470} y2={225} />
      <ScopeLink x1={104} y1={300} x2={470} y2={395} />
      <ScopeLink x1={180} y1={330} x2={470} y2={395} />
      <ScopeLink x1={330} y1={360} x2={470} y2={395} />
      <ScopeLink x1={150} y1={392} x2={470} y2={395} />
      <ScopeLink x1={240} y1={420} x2={470} y2={395} />

      <ObjectiveBox top={150} />
      <ObjectiveBox top={320} />

      {/* detection_model — each rule implements one signal, on that signal's row */}
      <ScopeLink x1={802} y1={212} x2={980} y2={185} />
      <ScopeLink x1={802} y1={212} x2={1150} y2={205} />
      <ScopeLink x1={802} y1={248} x2={1320} y2={240} />
      <ScopeLink x1={802} y1={248} x2={1480} y2={225} />
      <ScopeLink x1={802} y1={284} x2={1000} y2={300} />
      <ScopeLink x1={802} y1={284} x2={1180} y2={285} />
      <ScopeLink x1={802} y1={382} x2={1350} y2={350} />
      <ScopeLink x1={802} y1={382} x2={1520} y2={330} />
      <ScopeLink x1={802} y1={418} x2={990} y2={400} />
      <ScopeLink x1={802} y1={418} x2={1160} y2={418} />
      <ScopeLink x1={802} y1={454} x2={1010} y2={452} />

      <ThreatDot x={120} y={232} />
      <ThreatDot x={200} y={208} />
      <ThreatDot x={104} y={300} />
      <ThreatDot x={180} y={330} />
      <ThreatDot x={260} y={268} />
      <ThreatDot x={150} y={392} />
      <ThreatDot x={240} y={420} />
      <ThreatDot x={330} y={360} />
      <ThreatDot x={348} y={300} />

      <SignalRow y={212} name="anomalous logon" />
      <SignalRow y={248} name="impossible travel" />
      <SignalRow y={284} name="MFA fatigue" />
      <SignalRow y={382} name="lsass handle" />
      <SignalRow y={418} name="credential dump" />
      <SignalRow y={454} name="dpapi access" />

      <RuleDot x={980} y={185} />
      <RuleDot x={1150} y={205} />
      <RuleDot x={1320} y={240} />
      <RuleDot x={1480} y={225} />
      <RuleDot x={1000} y={300} />
      <RuleDot x={1180} y={285} />
      <RuleDot x={1350} y={350} />
      <RuleDot x={1520} y={330} />
      <RuleDot x={990} y={400} />
      <RuleDot x={1160} y={418} />
      <RuleDot x={1010} y={452} />

      {/* no signal behind them, and OpenTide ships them anyway */}
      <text x={1318} y={430} fill={c.muted} fontSize={17} fontFamily={mono}>
        no signal — still managed
      </text>
      <OrphanRuleDot x={1330} y={455} />
      <OrphanRuleDot x={1450} y={455} />
      <OrphanRuleDot x={1570} y={455} />
    </svg>

    <div style={{ marginTop: 26 }}>
      <Note>
        An objective decomposes into <strong>signals</strong> — the evidence that would satisfy it —
        and a rule's <code style={{ fontFamily: mono }}>detection_model</code> names the signal it
        implements, not the whole objective. That field is optional: the hollow rules validate and
        deploy like any other, they just cannot tell you why they exist.
      </Note>
    </div>
  </Shell>
);

// ─── Ported from slides/opentide-workshop ─────────────────────────────────────
// Pages 10, 04 and 15 of the workshop deck, rebuilt on this deck's Shell,
// Divider and palette so the chrome stays consistent across the talk.

const ObjCardLT = ({
  kind,
  schema,
  question,
  fields,
}: {
  kind: string;
  schema: string;
  question: string;
  fields: string[];
}) => (
  <div
    style={{
      flex: 1,
      border: `1.5px solid ${c.rule}`,
      borderRadius: 18,
      background: '#ffffff',
      padding: '26px 28px',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <span style={{ fontSize: 38, lineHeight: 1.2, fontWeight: 750 }}>{kind}</span>
      <span
        style={{
          marginLeft: 'auto',
          fontFamily: mono,
          fontSize: 20,
          color: 'var(--osd-accent)',
          background: c.panelSoft,
          border: `1px solid ${c.rule}`,
          borderRadius: 999,
          padding: '6px 14px',
        }}
      >
        {schema}
      </span>
    </div>
    <div
      style={{
        fontSize: 30,
        lineHeight: 1.25,
        fontWeight: 700,
        color: 'var(--osd-accent)',
        marginTop: 18,
      }}
    >
      {question}
    </div>
    <div style={{ marginTop: 16 }}>
      {fields.map((f) => (
        <div
          key={f}
          style={{
            fontFamily: mono,
            fontSize: 22,
            color: c.muted,
            padding: '12px 0',
            borderTop: `1px solid ${c.rule}`,
          }}
        >
          {f}
        </div>
      ))}
    </div>
  </div>
);

// Points left: the arrow follows the YAML reference, not the reading order.
const LinkArrowLT = ({ label }: { label: string }) => (
  <div style={{ width: 168, flexShrink: 0, alignSelf: 'center', textAlign: 'center' }}>
    <div style={{ fontFamily: mono, fontSize: 21, color: c.soft }}>{label}</div>
    <svg width={168} height={24} viewBox="0 0 168 24" aria-hidden style={{ display: 'block' }}>
      <line x1={28} y1={12} x2={160} y2={12} stroke="var(--osd-accent)" strokeWidth={2.5} />
      <polygon points="8,12 30,3 30,21" fill="var(--osd-accent)" />
    </svg>
    <div style={{ fontFamily: mono, fontSize: 19, color: c.dim }}>by uuid</div>
  </div>
);

const ObjectModelLT: Page = () => (
  <Shell eyebrow="THE MODEL" title="Turn TI in actionable objects down to rules">
    <Lede>
      A rule without an objective is a query with no reason to exist. Make the agent earn each step.
    </Lede>
    <div style={{ display: 'flex', alignItems: 'stretch', marginTop: 36 }}>
      <ObjCardLT
        kind="threat"
        schema="threat::1.0"
        question="What are we defending against?"
        fields={['severity · impact · leverage', 'surface · mitre_attack', 'actors (vocabulary ids)']}
      />
      <LinkArrowLT label="covers" />
      <ObjCardLT
        kind="objective"
        schema="objective::1.0"
        question="What must we be able to see?"
        fields={['priority · threats[uuid]', 'signals · methodology', 'entities · data requirements']}
      />
      <LinkArrowLT label="implements" />
      <ObjCardLT
        kind="rule"
        schema="rule::1.1"
        question="How does a platform see it?"
        fields={[
          'status · severity · techniques',
          'detection_model[uuid]',
          'configurations.sentinel.query',
        ]}
      />
    </div>
    <div style={{ marginTop: 32 }}>
      <Note>Coverage reads left to right; the YAML reference points back the other way, in blue. The UUID is the identity — rename and move files freely.</Note>
    </div>
  </Shell>
);

// ─── Ported from slides/opentide ──────────────────────────────────────────────
// Pages 17, 04 and 28 of the opentide deck, rebuilt on this deck's Shell and
// Divider so the chrome matches the rest of the talk.

const DividerWhyNowLT: Page = () => (
  <Divider
    number="03"
    minutes="why we re-released it"
    title="Why we re-released it"
    subtitle="Years in production as a git submodule. Now a versioned CLI on PyPI, with the ergonomics humans and agents both need."
  />
);

// Curve geometry lifted verbatim from the opentide deck so the shape matches.
const LT_INTEL = 'M70 452 C 360 440, 620 330, 930 64';
const LT_THROUGHPUT = 'M70 455 C 380 446, 660 420, 930 386';
const LT_GAP_AREA =
  'M70 452 C 360 440, 620 330, 930 64 L930 386 C 660 420, 380 446, 70 455 Z';

const GapPill = ({
  left,
  top,
  tone = 'plain',
  children,
}: {
  left: number;
  top: number;
  tone?: 'plain' | 'accent' | 'warn';
  children: ReactNode;
}) => (
  <div
    style={{
      position: 'absolute',
      left,
      top,
      fontFamily: mono,
      fontSize: 19,
      padding: '7px 15px',
      borderRadius: 999,
      whiteSpace: 'nowrap',
      background: tone === 'accent' ? '#eef2fb' : tone === 'warn' ? '#fdeeee' : c.panelSoft,
      border: `1px solid ${tone === 'accent' ? '#c6d4f0' : tone === 'warn' ? '#f3c9c9' : c.rule}`,
      color: tone === 'accent' ? 'var(--osd-accent)' : tone === 'warn' ? c.red : c.soft,
    }}
  >
    {children}
  </div>
);

const GapStat = ({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: '24px 0',
      borderTop: `1px solid ${c.rule}`,
    }}
  >
    <span
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 72,
        fontWeight: 800,
        letterSpacing: '-0.045em',
        lineHeight: 0.95,
        color: accent ? 'var(--osd-accent)' : 'var(--osd-text)',
      }}
    >
      {value}
    </span>
    <span style={{ fontSize: 24, lineHeight: 1.4, color: c.muted }}>{label}</span>
  </div>
);

const GapLT: Page = () => (
  <Shell eyebrow="WHY IT MATTERS" title="Intelligence outruns detection engineering.">
    <Lede>
      The bottleneck was never the strategy. It was the capacity to execute it: read, model, write,
      tune, deploy, repeat.
    </Lede>

    <div style={{ display: 'flex', gap: 70, marginTop: 28 }}>
      <div style={{ position: 'relative', width: 960, height: 520, flexShrink: 0 }}>
        <svg
          width={960}
          height={520}
          viewBox="0 0 960 520"
          role="img"
          aria-label="Intel volume rises steeply while engineering throughput stays nearly flat; the widening area between them is the gap."
          style={{ display: 'block' }}
        >
          <title>Intel volume outruns engineering throughput</title>
          <defs>
            <pattern
              id="lt-gap-hatch"
              width="12"
              height="12"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="12" stroke="rgba(198,47,63,0.32)" strokeWidth="3" />
            </pattern>
          </defs>
          <line x1="70" y1="24" x2="70" y2="470" stroke={c.rule} strokeWidth={2} />
          <line x1="70" y1="470" x2="940" y2="470" stroke={c.rule} strokeWidth={2} />
          <path d={LT_GAP_AREA} fill="url(#lt-gap-hatch)" />
          <path
            d={LT_INTEL}
            fill="none"
            stroke="var(--osd-accent)"
            strokeWidth={6}
            strokeLinecap="round"
          />
          <path
            d={LT_THROUGHPUT}
            fill="none"
            stroke={c.soft}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray="2 13"
          />
          <text x="505" y="505" fill={c.dim} fontFamily={mono} fontSize="18" textAnchor="middle">
            time
          </text>
          <path
            d="M548 499 h26 M566 492 l8 7 -8 7"
            stroke={c.dim}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <GapPill left={600} top={40} tone="accent">
          intel volume
        </GapPill>
        <GapPill left={650} top={424}>
          engineering throughput
        </GapPill>
        <GapPill left={772} top={262} tone="warn">
          the gap
        </GapPill>
      </div>

      <div
        style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
      >
        <GapStat value="1,000s" label="intel items a month: advisories, CVEs, campaigns" accent />
        <GapStat value="hours" label="per TTP to read, model, write, tune and deploy" />
        <GapStat value="tens" label="production-ready detection rules a month" />
      </div>
    </div>
  </Shell>
);

// ─── The loop diagram (opentide page 28) ──────────────────────────────────────
// One 1700×538 coordinate space: three rows of cards as absolutely positioned
// divs, every connector in a single SVG overlay underneath.
const L_AZ_H = 320;
const L_GATES_Y = 356;
const L_GATES_H = 182;
const L_TOTAL = 538;
const L_CW = 345;
const L_CH = 88;
const L_XS = [58, 471, 884, 1297];
const L_R1 = 60;
const L_R2 = 190;
const L_GW = 296;
const L_GXS = [20, 361, 702, 1043, 1384];
const L_GY = L_GATES_Y + 56;

const LoopCard = ({
  x,
  y,
  w,
  title,
  sub,
  tone = 'plain',
  titleSize = 25,
}: {
  x: number;
  y: number;
  w: number;
  title: string;
  sub: string;
  tone?: 'plain' | 'dashed' | 'tint' | 'dark';
  titleSize?: number;
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: L_CH,
      boxSizing: 'border-box',
      borderRadius: 12,
      padding: '16px 22px',
      background: tone === 'dark' ? '#0d1526' : tone === 'tint' ? '#e8eefb' : '#ffffff',
      border:
        tone === 'dashed'
          ? `2px dashed ${c.dim}`
          : `1.5px solid ${tone === 'dark' ? '#0d1526' : c.rule}`,
    }}
  >
    {/* nowrap: the card height is fixed, so a wrap would push the sub out */}
    <div
      style={{
        fontFamily: mono,
        fontSize: titleSize,
        fontWeight: 650,
        whiteSpace: 'nowrap',
        color: tone === 'dark' ? '#ffffff' : 'var(--osd-text)',
      }}
    >
      {title}
    </div>
    <div
      style={{
        fontFamily: mono,
        fontSize: 20,
        whiteSpace: 'nowrap',
        color: tone === 'dark' ? '#9fb0cc' : c.dim,
        marginTop: 6,
      }}
    >
      {sub}
    </div>
  </div>
);

const LArrow = ({ x1, x2, y, color }: { x1: number; x2: number; y: number; color: string }) => {
  const dir = x2 > x1 ? 1 : -1;
  const base = x2 - dir * 16;
  return (
    <g>
      <line x1={x1} y1={y} x2={base} y2={y} stroke={color} strokeWidth={2.5} />
      <polygon points={`${x2},${y} ${base},${y - 8} ${base},${y + 8}`} fill={color} />
    </g>
  );
};

const ZoneHead = ({
  top,
  name,
  scope,
  note,
  color,
}: {
  top: number;
  name: string;
  scope: string;
  note: string;
  color: string;
}) => (
  <div
    style={{
      position: 'absolute',
      left: 26,
      right: 26,
      top,
      display: 'flex',
      alignItems: 'baseline',
      fontFamily: mono,
      fontSize: 23,
    }}
  >
    <span style={{ fontWeight: 700, color }}>{name}</span>
    <span style={{ color: c.muted, marginLeft: 12 }}>· {scope}</span>
    <span style={{ marginLeft: 'auto', color: c.dim }}>{note}</span>
  </div>
);

const AgentLoopLT: Page = () => (
  <Shell
    eyebrow="AGENTIC DETECTION ENGINEERING"
    title="The loop: agents draft, the engine checks, humans promote."
  >
    <div style={{ position: 'relative', width: 1700, height: L_TOTAL, margin: '8px 0 0' }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1700,
          height: L_AZ_H,
          boxSizing: 'border-box',
          borderRadius: 22,
          background: '#eef2fb',
          border: '1.5px solid #c6d4f0',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: L_GATES_Y,
          width: 1700,
          height: L_GATES_H,
          boxSizing: 'border-box',
          borderRadius: 22,
          background: '#ffffff',
          border: `1.5px solid ${c.soft}`,
        }}
      />

      <svg
        width={1700}
        height={L_TOTAL}
        viewBox={`0 0 1700 ${L_TOTAL}`}
        aria-hidden
        style={{ position: 'absolute', left: 0, top: 0 }}
      >
        {/* row 1 · agents draft, left to right */}
        <LArrow x1={L_XS[0] + L_CW + 5} x2={L_XS[1] - 5} y={L_R1 + 44} color={c.blue} />
        <LArrow x1={L_XS[1] + L_CW + 5} x2={L_XS[2] - 5} y={L_R1 + 44} color={c.blue} />
        <LArrow x1={L_XS[2] + L_CW + 5} x2={L_XS[3] - 5} y={L_R1 + 44} color={c.blue} />

        {/* turn down the right-hand side: draft → check */}
        <polyline
          points={`${L_XS[3] + L_CW},${L_R1 + 44} 1668,${L_R1 + 44} 1668,${L_R2 + 44} ${L_XS[3] + L_CW + 16},${L_R2 + 44}`}
          fill="none"
          stroke={c.blue}
          strokeWidth={2.5}
        />
        <polygon
          points={`${L_XS[3] + L_CW},${L_R2 + 44} ${L_XS[3] + L_CW + 16},${L_R2 + 36} ${L_XS[3] + L_CW + 16},${L_R2 + 52}`}
          fill={c.blue}
        />

        {/* row 2 · the engine checks, right to left */}
        <LArrow x1={L_XS[3] - 5} x2={L_XS[2] + L_CW + 5} y={L_R2 + 44} color={c.blue} />
        <LArrow x1={L_XS[2] - 5} x2={L_XS[1] + L_CW + 5} y={L_R2 + 44} color={c.blue} />
        <LArrow x1={L_XS[1] - 5} x2={L_XS[0] + L_CW + 5} y={L_R2 + 44} color={c.blue} />

        {/* fail loop: check → draft again */}
        <line
          x1={1470}
          y1={L_R2 - 6}
          x2={1470}
          y2={L_R1 + L_CH + 16}
          stroke={c.red}
          strokeWidth={2.5}
          strokeDasharray="6 7"
        />
        <polygon
          points={`1470,${L_R1 + L_CH + 2} 1462,${L_R1 + L_CH + 18} 1478,${L_R1 + L_CH + 18}`}
          fill={c.red}
        />
        <text x={1446} y={L_R2 - 10} fill={c.red} fontSize={23} fontFamily={mono} textAnchor="end">
          fail → edit again
        </text>

        {/* handoff: stops at the gate-zone border so it never crosses the header */}
        <line
          x1={230}
          y1={L_R2 + L_CH}
          x2={230}
          y2={L_GATES_Y - 16}
          stroke={c.soft}
          strokeWidth={2.5}
        />
        <polygon
          points={`230,${L_GATES_Y} 222,${L_GATES_Y - 16} 238,${L_GATES_Y - 16}`}
          fill={c.soft}
        />
        <text x={262} y={L_GATES_Y - 14} fill={c.muted} fontSize={23} fontFamily={mono}>
          handoff · the agent's output is a pull request
        </text>

        {/* row 3 · humans promote */}
        <LArrow x1={L_GXS[0] + L_GW + 4} x2={L_GXS[1] - 4} y={L_GY + 44} color={c.soft} />
        <LArrow x1={L_GXS[1] + L_GW + 4} x2={L_GXS[2] - 4} y={L_GY + 44} color={c.soft} />
        <LArrow x1={L_GXS[2] + L_GW + 4} x2={L_GXS[3] - 4} y={L_GY + 44} color={c.soft} />
        <LArrow x1={L_GXS[3] + L_GW + 4} x2={L_GXS[4] - 4} y={L_GY + 44} color={c.soft} />
      </svg>

      <ZoneHead
        top={22}
        name="agent zone"
        scope="mcp tools, skills, cli"
        note="safe for agents: nothing here deploys"
        color={c.blue}
      />
      <ZoneHead
        top={L_GATES_Y + 20}
        name="human gates"
        scope="review, merge, approve"
        note="every real deploy follows a human decision"
        color={c.soft}
      />

      <LoopCard x={L_XS[0]} y={L_R1} w={L_CW} title="brief" sub="advisory or ask" tone="dashed" />
      <LoopCard x={L_XS[1]} y={L_R1} w={L_CW} title="search()" sub="mcp · what exists" />
      <LoopCard x={L_XS[2]} y={L_R1} w={L_CW} title="get_chaining()" sub="mcp · threat → rule" />
      <LoopCard x={L_XS[3]} y={L_R1} w={L_CW} title="draft YAML" sub="skills · templates" />

      <LoopCard x={L_XS[0]} y={L_R2} w={L_CW} title="pull request" sub="the diff, for review" />
      <LoopCard x={L_XS[1]} y={L_R2} w={L_CW} title="deploy_rule()" sub="mcp · dry_run=true" />
      <LoopCard
        x={L_XS[2]}
        y={L_R2}
        w={L_CW}
        title="validate query --live"
        sub="cli · checks the tenant"
        titleSize={21}
      />
      <LoopCard
        x={L_XS[3]}
        y={L_R2}
        w={L_CW}
        title="validation_report()"
        sub="mcp · concrete errors"
      />

      <LoopCard x={L_GXS[0]} y={L_GY} w={L_GW} title="human review" sub="reads the diff" />
      <LoopCard x={L_GXS[1]} y={L_GY} w={L_GW} title="merge" sub="a maintainer" />
      <LoopCard x={L_GXS[2]} y={L_GY} w={L_GW} title="STAGING" sub="ci · on merge" tone="tint" />
      <LoopCard x={L_GXS[3]} y={L_GY} w={L_GW} title="approval" sub="protected env" />
      <LoopCard
        x={L_GXS[4]}
        y={L_GY}
        w={L_GW}
        title="PRODUCTION"
        sub="live detections"
        tone="dark"
      />
    </div>
  </Shell>
);

const CheckItem = ({ children, tint }: { children: ReactNode; tint: string }) => (
  <li
    style={{
      display: 'flex',
      gap: 18,
      fontSize: 30,
      lineHeight: 1.4,
      color: c.soft,
      marginBottom: 20,
      listStyle: 'none',
    }}
  >
    <span style={{ color: tint, flexShrink: 0, fontWeight: 700 }}>✓</span>
    <span>{children}</span>
  </li>
);

const ReqColumn = ({
  kicker,
  tint,
  children,
}: {
  kicker: string;
  tint: string;
  children: ReactNode;
}) => (
  <div
    style={{
      flex: 1,
      border: `1px solid ${c.rule}`,
      borderRadius: 'var(--osd-radius)',
      background: c.panel,
      padding: '30px 34px',
    }}
  >
    <div
      style={{
        fontFamily: mono,
        fontSize: 22,
        color: tint,
        letterSpacing: '0.1em',
        marginBottom: 24,
      }}
    >
      {kicker}
    </div>
    <ul style={{ margin: 0, padding: 0 }}>{children}</ul>
  </div>
);

const Prerequisites: Page = () => (
  <Shell eyebrow="BEFORE YOU ARRIVE" title="Prerequisites — five minutes, done the night before">
    <div style={{ display: 'flex', gap: 32 }}>
      <ReqColumn kicker="YOU BRING" tint={c.green}>
        <CheckItem tint={c.green}>Python 3.10–3.14, and the rights to install packages</CheckItem>
        <CheckItem tint={c.green}>Git, plus a GitHub account — you will push a repo and let CI run</CheckItem>
        <CheckItem tint={c.green}>
          An agent in your editor: Cursor, Claude Code, VS Code + Copilot, or any MCP host
        </CheckItem>
        <CheckItem tint={c.green}>Network access to PyPI and github.com</CheckItem>
      </ReqColumn>
      <ReqColumn kicker="WE PROVIDE" tint={c.blue}>
        <CheckItem tint={c.blue}>A MISP URL and API key, for the sharing section</CheckItem>
        <CheckItem tint={c.blue}>A Splunk URL and token, for a real deploy target</CheckItem>
        <CheckItem tint={c.blue}>A short intel report — the input for the authoring section</CheckItem>
        <CheckItem tint={c.blue}>Nothing to install for those: keys go in a local .env</CheckItem>
      </ReqColumn>
    </div>
    <div style={{ marginTop: 34 }}>
      <Note>
        No cloud account needed and no Sentinel tenant. If your laptop is locked down, the blocker is
        almost always outbound HTTPS — the agent skills are fetched from{' '}
        <code style={{ fontFamily: mono }}>github.com/OpenTideHQ/skills</code> at setup time.
      </Note>
    </div>
  </Shell>
);

const DividerInstall: Page = () => (
  <Divider
    number="01"
    minutes="10 min"
    title="Bootstrap"
    subtitle="Install the package, wire your agent, then stop typing commands."
  />
);

const Bootstrap: Page = () => (
  <Shell eyebrow="01 · BOOTSTRAP" title="The only block you type by hand">
    <Code label="shell" size={25}>{`python -m venv .venv && source .venv/bin/activate

pip install 'opentide[mcp]==0.12.1'     # CLI + MCP server + all seven platforms
pip install 'opentide[splunk]'          # live Splunk deploy needs splunk-sdk

opentide setup mcp    --cursor --yes    # writes .cursor/mcp.json
opentide setup skills --cursor --yes    # writes .agents/skills/ and mirrors it`}</Code>
    <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Lede>
        Swap <code style={{ fontFamily: mono }}>--cursor</code> for{' '}
        <code style={{ fontFamily: mono }}>--vscode</code>,{' '}
        <code style={{ fontFamily: mono }}>--claude-code</code>, or{' '}
        <code style={{ fontFamily: mono }}>--generic</code>. Then reload the MCP server in your host.
      </Lede>
      <Note>
        This block is manual for one reason: the agent cannot write the config that gives it tools.
        After this slide, everything is a prompt rather than a command.
      </Note>
    </div>
  </Shell>
);

const AgentSurface: Page = () => (
  <Shell eyebrow="01 · BOOTSTRAP" title="What your agent just gained">
    <Code label="9 tools, over stdio" size={22}>{`search               find objects by keyword, UUID, technique, actor
get_chaining         threat → objective → rule graph for a UUID
coverage             ATT&CK coverage and the gaps
validate_rule        one rule against its schema
validation_report    the whole registry, structured
validate_query       tenant check — refuses unless live: true
run_query            stub: never contacts a tenant, never returns rows
deploy_rule          dry_run: true by default
deployment_status    per-platform state for a rule`}</Code>
    <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 22 }}>
      <Lede>
        Plus 12 read-only resources — <code style={{ fontFamily: mono }}>opentide://threats</code>,{' '}
        <code style={{ fontFamily: mono }}>objectives</code>,{' '}
        <code style={{ fontFamily: mono }}>rules</code>,{' '}
        <code style={{ fontFamily: mono }}>schemas</code>,{' '}
        <code style={{ fontFamily: mono }}>templates</code>,{' '}
        <code style={{ fontFamily: mono }}>vocabularies</code> — and four authoring skills.
      </Lede>
      <Note>
        Note what is <em>not</em> there: no tool writes a file, and no tool runs setup. The agent
        edits YAML itself and shells out to the CLI, so every change lands in your diff.
      </Note>
    </div>
  </Shell>
);

const PointAtRepo: Page = () => (
  <Shell eyebrow="01 · BOOTSTRAP" title="Both of you need the same repository root">
    <Code label="your shell, and the MCP server's env block" size={25}>{`export OPENTIDE_REPO_ROOT=/path/to/detection-repo    # your terminal

# .cursor/mcp.json — written by setup mcp
{"mcpServers": {"opentide": {"command": "opentide", "args": ["mcp", "start"],
  "env": {"OPENTIDE_REPO_ROOT": "\${workspaceFolder}"}}}}`}</Code>
    <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Lede>
        Unset, the server walks up from its working directory looking for{' '}
        <code style={{ fontFamily: mono }}>.opentide/</code> or{' '}
        <code style={{ fontFamily: mono }}>objects/</code>.
      </Lede>
      <Note>
        The classic first-hour failure: your shell and your agent pointing at different repositories,
        so the agent reports a clean catalogue you cannot see. Ask it to run{' '}
        <code style={{ fontFamily: mono }}>opentide info</code> and compare.
      </Note>
    </div>
  </Shell>
);

const DividerScaffold: Page = () => (
  <Divider
    number="02"
    minutes="10 min"
    title="Configure"
    subtitle="The agent interviews you, then runs the setup commands for you."
  />
);

const AskRow = ({
  question,
  options,
  flag,
}: {
  question: string;
  options: string;
  flag: string;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 28,
      border: `1px solid ${c.rule}`,
      borderRadius: 'var(--osd-radius)',
      background: c.panel,
      padding: '20px 28px',
    }}
  >
    <span style={{ fontSize: 28, lineHeight: 1.3, fontWeight: 650, width: 360, flexShrink: 0 }}>
      {question}
    </span>
    <span style={{ fontFamily: mono, fontSize: 23, color: c.blue, flex: 1 }}>{options}</span>
    <span style={{ fontFamily: mono, fontSize: 21, color: c.muted, flexShrink: 0 }}>{flag}</span>
  </div>
);

const AgentInterview: Page = () => (
  <Shell eyebrow="02 · CONFIGURE" title="The agent asks, you choose">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <AskRow question="Name and organisation?" options="free text" flag="--name  --org" />
      <AskRow
        question="Which detection platforms?"
        options="sentinel · splunk · crowdstrike · defender_for_endpoint · …"
        flag="setup platforms"
      />
      <AskRow question="Which CI provider?" options="github · gitlab · azure" flag="setup ci" />
      <AskRow
        question="Which editor gets MCP?"
        options="vscode · cursor · claude-code · generic"
        flag="setup mcp"
      />
      <AskRow
        question="Which agent gets the skills?"
        options="cursor · claude-code · generic · github-copilot"
        flag="setup skills"
      />
      <AskRow question="Validate on every commit?" options="yes · no" flag="setup hooks" />
    </div>
    <div style={{ marginTop: 32 }}>
      <Note>
        These are the real option sets, not a wish list — the agent is choosing flags it has to get
        right. Today answer GitHub, Sentinel and Splunk, and your own editor.
      </Note>
    </div>
  </Shell>
);

const AgentRunsSetup: Page = () => (
  <Shell eyebrow="02 · CONFIGURE" title="What it runs once you have answered">
    <Code label="the agent shells out — you watch the diff" size={24}>{`opentide setup repo      --name "SOC Detections" --org "Example Corp" --yes
opentide setup platforms --sentinel --splunk --yes
opentide setup ci        github --yes      # positional: github | gitlab | azure
opentide setup hooks     --yes             # validate-on-commit
opentide setup env       --yes             # .env.example, and .env git-ignored`}</Code>
    <div style={{ marginTop: 34, display: 'flex', flexDirection: 'column', gap: 22 }}>
      <Lede>
        Order is not cosmetic: <code style={{ fontFamily: mono }}>setup ci</code> reads the enabled
        platform files to decide which query-validation jobs to write, so platforms come first.
      </Lede>
      <Note>
        Every command carries <code style={{ fontFamily: mono }}>--yes</code>, because an agent that
        hits an interactive prompt hangs. That also means you, not the prompt, are the confirmation
        step — read the commands before you approve them.
      </Note>
    </div>
  </Shell>
);

const Layout: Page = () => (
  <Shell eyebrow="02 · CONFIGURE" title="What the agent just wrote">
    <div style={{ display: 'flex', gap: 36 }}>
      <div style={{ flex: 1 }}>
        <Code label="repository" size={25}>{`detection-repo/
├── objects/
│   ├── threats/
│   ├── objectives/
│   └── rules/
├── .opentide/
│   ├── configurations/
│   └── states/
├── .agents/skills/
└── .github/workflows/`}</Code>
      </div>
      <div style={{ flex: 1 }}>
        <Code label=".opentide/configurations/" size={25}>{`paths.toml          # layout
deployment.toml     # statuses, promotion
schema.toml         # vocab extensions
sharing.toml        # MISP destinations
documentation.toml  # docs output
platforms/
├── sentinel.toml
└── splunk.toml`}</Code>
      </div>
    </div>
    <div style={{ marginTop: 36 }}>
      <Note>
        Configuration is layered: package defaults → bundled platform configs → your workspace. You
        only ever edit your workspace, and only the keys you care about.
      </Note>
    </div>
  </Shell>
);

const DividerAuthor: Page = () => (
  <Divider
    number="03"
    minutes="20 min"
    title="TI to rule"
    subtitle="One intel snippet becomes a threat, an objective with signals, and a rule."
  />
);

const GenerateFirst: Page = () => (
  <Shell eyebrow="03 · AUTHOR" title="The agent's first move: generate">
    <Code label="opentide generate" size={26}>{`== Object vocabulary generation ==
== Template generation ==
== JSON schema generation ==
OK Full generation pipeline completed`}</Code>
    <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Lede>
        The authoring skills all open the same way: generate, then start from the template. Schemas
        land in <code style={{ fontFamily: mono }}>.opentide/schemas/</code>, templates in{' '}
        <code style={{ fontFamily: mono }}>.opentide/templates/</code>.
      </Lede>
      <Note>
        This is why the agent generates before it writes a line of YAML: validation compares objects
        against those schemas, and the MCP schema resource answers{' '}
        <code style={{ fontFamily: mono }}>run 'opentide generate schemas'</code> until they exist.
      </Note>
    </div>
  </Shell>
);

const TiInput: Page = () => (
  <Shell eyebrow="03 · AUTHOR" title="The input: five sentences of intel">
    <Code label="paste this into your agent" size={25}>{`A finance user forwarded a Teams message linking to a Microsoft
device-code page. Entra sign-in logs show a successful device-code
grant from a hosting ASN, minutes after the message was opened.

The session then consented to an OAuth application and created an
inbox rule forwarding mail externally. Tradecraft overlaps with
public reporting on Midnight Blizzard / APT29.`}</Code>
    <div style={{ marginTop: 34, display: 'flex', flexDirection: 'column', gap: 22 }}>
      <Lede>
        That is the whole input. No IOC list, no STIX bundle, no template to fill in — the shape of a
        real hand-over.
      </Lede>
      <Note>
        There is no TI import command, and that is the honest framing: the agent reads prose and
        drafts objects using the shape rules in its skills. OpenTide checks the result; it does not
        do the reading.
      </Note>
    </div>
  </Shell>
);

const AgentStep = ({
  n,
  skill,
  writes,
  links,
}: {
  n: string;
  skill: string;
  writes: string;
  links: ReactNode;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 30,
      border: `1px solid ${c.rule}`,
      borderRadius: 'var(--osd-radius)',
      background: c.panel,
      padding: '24px 30px',
    }}
  >
    <span
      style={{ fontFamily: mono, fontSize: 30, color: 'var(--osd-accent)', flexShrink: 0, width: 44 }}
    >
      {n}
    </span>
    <div style={{ width: 400, flexShrink: 0 }}>
      <div style={{ fontFamily: mono, fontSize: 23, color: c.pt }}>{skill}</div>
      <div style={{ fontFamily: mono, fontSize: 21, color: c.muted, marginTop: 8 }}>{writes}</div>
    </div>
    <div style={{ fontSize: 27, lineHeight: 1.45, color: c.soft, flex: 1 }}>{links}</div>
  </div>
);

const AgentToChain: Page = () => (
  <Shell eyebrow="03 · AUTHOR" title="Three objects, three skills, one chain">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <AgentStep
        n="01"
        skill="opentide-threat-vector"
        writes="objects/threats/"
        links={
          <>
            Names the tradecraft and the actor, tags{' '}
            <code style={{ fontFamily: mono }}>T1566.002</code> and{' '}
            <code style={{ fontFamily: mono }}>T1078</code>
          </>
        }
      />
      <AgentStep
        n="02"
        skill="opentide-detection-objective"
        writes="objects/objectives/"
        links={
          <>
            Lists the threat UUID under <code style={{ fontFamily: mono }}>objective.threats</code>,
            then decomposes it into signals, each with its own UUID
          </>
        }
      />
      <AgentStep
        n="03"
        skill="opentide-detection-rule"
        writes="objects/rules/"
        links={
          <>
            Points <code style={{ fontFamily: mono }}>detection_model</code> at one signal and writes
            a query per platform under <code style={{ fontFamily: mono }}>configurations</code>
          </>
        }
      />
    </div>
    <div style={{ marginTop: 30 }}>
      <Note>
        The agent mints fresh UUIDs — it never copies the ones on these slides. Each skill is a shape
        contract rather than a prompt: where the file goes, which fields are required, what to run to
        check it.
      </Note>
    </div>
  </Shell>
);

const ChainYaml: Page = () => (
  <Shell eyebrow="03 · AUTHOR" title="What came back, and how it is wired">
    <div style={{ display: 'flex', gap: 22 }}>
      <div style={{ flex: 1 }}>
        <Code label="objects/threats/" size={20}>{`name: Device Code Phishing
metadata:
  uuid: 1f0a…8001
  schema: threat::1.0
  tlp: amber
threat:
  severity: Substantial incident
  impact: [Data Breach]
  att&ck: [T1566.002, T1078]
  actors:
    - name: att&ck::G0016`}</Code>
      </div>
      <div style={{ flex: 1 }}>
        <Code label="objects/objectives/" size={20}>{`name: Illicit Device Code Grant
metadata:
  uuid: 1f0a…8002
  schema: objective::1.0
objective:
  priority: High
  threats:
    - 1f0a…8001      # the threat
  signals:
    - name: Device code grant
      uuid: 1f0a…8099`}</Code>
      </div>
      <div style={{ flex: 1 }}>
        <Code label="objects/rules/" size={20}>{`name: Entra Device Code Auth
metadata:
  uuid: 1f0a…8003
  schema: rule::1.0
status: STAGING
techniques: [T1078]
detection_model: 1f0a…8099
                 # the signal
configurations:
  sentinel: {…}
  splunk:   {…}`}</Code>
      </div>
    </div>
    <div style={{ marginTop: 32 }}>
      <Note>
        Two references carry the whole model: an objective naming its threats, and a rule naming the
        one signal it implements. Everything else on these three files is description.
      </Note>
    </div>
  </Shell>
);

const RuleConfig: Page = () => (
  <Shell eyebrow="03 · AUTHOR" title="One rule, one block per platform">
    <div style={{ display: 'flex', gap: 26 }}>
      <div style={{ flex: 1 }}>
        <Code label="configurations.sentinel" size={22}>{`enabled: true
name: Entra Device Code Auth
status: STAGING
query: |
  SigninLogs
  | where AuthenticationProtocol
      == "deviceCode"
  | where ResultType == 0
scheduling:
  frequency: PT1H
  lookback: PT2H`}</Code>
      </div>
      <div style={{ flex: 1 }}>
        <Code label="configurations.splunk" size={22}>{`enabled: true
name: Entra Device Code Auth
status: STAGING
query: |
  index=azuread
    authProtocol=deviceCode
    resultType=0
  | stats count by user, srcIp
correlation_search: true
enterprise_security: true`}</Code>
      </div>
    </div>
    <div style={{ marginTop: 32 }}>
      <Note>
        Same objective, same signal, two tenants. Ask the agent for the Splunk block and it writes
        SPL beside the KQL — the model does not change, only the dialect.
      </Note>
    </div>
  </Shell>
);

const ReviewGate: Page = () => (
  <Shell eyebrow="03 · AUTHOR" title="You review, the validator decides">
    <ul style={{ margin: 0, paddingLeft: 44, marginTop: 4 }}>
      <Bullet>A vocabulary value that reads well and does not exist — the commonest invention</Bullet>
      <Bullet>
        A <code style={{ fontFamily: mono }}>detection_model</code> pointing at a UUID it never wrote
      </Bullet>
      <Bullet>
        A <code style={{ fontFamily: mono }}>status</code> that is not in the merged{' '}
        <code style={{ fontFamily: mono }}>deployment.toml</code>
      </Bullet>
      <Bullet>A query that parses perfectly and detects the wrong thing</Bullet>
    </ul>
    <div style={{ marginTop: 26 }}>
      <Code size={25}>{`opentide validate --strict && opentide lint --strict`}</Code>
    </div>
    <div style={{ marginTop: 26 }}>
      <Note>
        Three of those four are caught mechanically, in about a second. The fourth is yours, and it
        is the same hand-over gate the lifecycle diagram calls ACCEPTANCE.
      </Note>
    </div>
  </Shell>
);

const DividerShip: Page = () => (
  <Divider
    number="04"
    minutes="20 min"
    title="Validate & ship"
    subtitle="The loop you will run a hundred times: validate, lint, dry-run, deploy."
  />
);

// The diagram carries its own title and legend, so this page gives it the whole
// canvas rather than repeating the heading in a Shell. One caption names the
// review gate, because the drawing shows ACCEPTANCE without saying who signs it.
const DividerDocument: Page = () => (
  <Divider
    number="05"
    minutes="5 min"
    title="Document"
    subtitle="Wiki pages and coverage diagrams, generated from the objects you just wrote."
  />
);

const DividerShare: Page = () => (
  <Divider
    number="06"
    minutes="5 min"
    title="Share"
    subtitle="Publish objects to a MISP destination — one Event per object."
  />
);

const DividerWrapUp: Page = () => (
  <Divider
    number="07"
    minutes="5 min"
    title="Wrap-up"
    subtitle="What bites, what to take home, and where to go next."
  />
);

const Validate: Page = () => (
  <Shell eyebrow="04 · SHIP" title="Validate and lint — strict in CI">
    <Code label="shell" size={26}>{`opentide validate            # schema, UUID uniqueness, cross-object references
opentide validate --strict   # warnings fail too — this is the CI gate
opentide lint                # filenames and metadata
opentide lint --fix          # rename files to slugify(name)
opentide --json validate     # machine-readable report`}</Code>
    <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Lede>
        Exit 0 on success, 1 on failure. Filenames must equal{' '}
        <code style={{ fontFamily: mono }}>slugify(name)</code>;{' '}
        <code style={{ fontFamily: mono }}>metadata.author</code> and{' '}
        <code style={{ fontFamily: mono }}>metadata.organisation</code> are lint warnings, not schema
        errors.
      </Lede>
      <Note>
        <code style={{ fontFamily: mono }}>opentide setup hooks</code> wires the same strict
        validation into a pre-commit hook, pinned to this workspace.
      </Note>
    </div>
  </Shell>
);

const BreakIt: Page = () => (
  <Shell eyebrow="04 · SHIP" title="Break it on purpose">
    <Code label="detection_model: 00000000-0000-4000-8002-DEADBEEF0000" size={25}>{`## objects/rules/sentinel-kql-rule.yaml
  [error] detection_model: Unknown objective reference
          '00000000-0000-4000-8002-DEADBEEF0000'

$ echo $?
1`}</Code>
    <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Lede>
        Issues print grouped by file. This one is a dangling reference, caught by the cross-object
        check — understanding the output is half the job.
      </Lede>
      <Note>
        The other anti-patterns to recognise: duplicate UUID, circular objective chain, and the
        coverage island — a threat no objective covers.
      </Note>
    </div>
  </Shell>
);

const QueryAndDeploy: Page = () => (
  <Shell eyebrow="04 · SHIP" title="Check the query, then dry-run the deploy">
    <Code label="shell" size={26}>{`$ opentide validate query --platform sentinel
OK Offline KQL syntax validation passed for sentinel (1 query across 1 rule)

$ opentide deploy --platform sentinel --dry-run
== MDR Deployment ==
OK Deployment completed`}</Code>
    <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Lede>
        The query check is offline and structural: unbalanced delimiters, broken pipelines, dangling
        operators. It cannot tell you whether a table exists — add{' '}
        <code style={{ fontFamily: mono }}>--live</code> for a real round-trip.
      </Lede>
      <Note>
        A dry-run plans without touching the platform. With{' '}
        <code style={{ fontFamily: mono }}>[[tenants]]</code> still commented out, it warns instead
        of pretending.
      </Note>
    </div>
  </Shell>
);

const Statuses: Page = () => (
  <Shell eyebrow="04 · SHIP" title="Status decides what deploy does">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <StatusRow status="DESIGN" strategy="INERT" meaning="functional design only, never deployed" />
      <StatusRow status="DEVELOPMENT" strategy="PREVIEW" meaning="under technical implementation" />
      <StatusRow status="STAGING" strategy="PREVIEW" meaning="deployed for operational testing" />
      <StatusRow status="ACCEPTANCE" strategy="PREVIEW" meaning="analyst validating alert + playbook" />
      <StatusRow status="PRODUCTION" strategy="RELEASE" meaning="live production deployment" />
      <StatusRow status="DISABLED" strategy="DISABLEMENT" meaning="present but inactive" />
      <StatusRow status="REMOVED" strategy="DELETION" meaning="torn down from platforms" />
    </div>
    <div style={{ marginTop: 40 }}>
      <Note>
        Statuses are a configurable set in{' '}
        <code style={{ fontFamily: mono }}>deployment.toml</code>, not a fixed lifecycle. There is no
        promote command — edit the rule, run deploy.
      </Note>
    </div>
  </Shell>
);

const Credentials: Page = () => (
  <Shell eyebrow="04 · SHIP" title="The agent writes the config, never the secret">
    <div style={{ display: 'flex', gap: 24 }}>
      <div style={{ flex: 1 }}>
        <Code label="platforms/splunk.toml — agent uncomments and fills" size={19}>{`[platform]
enabled = true

[[tenants]]
name = "Default"
deployment = "ALWAYS"

[tenants.setup]
url   = "$SPLUNK_URL"
port  = "$SPLUNK_PORT"
token = "$SPLUNK_TOKEN"
app   = "$SPLUNK_APP"
enterprise_security = true`}</Code>
      </div>
      <div style={{ flex: 1 }}>
        <Code label="sharing.toml — agent writes it from scratch" size={19}>{`[[misp]]
name = "workshop-misp"
url = "https://misp.example.org"
api_key = "\${MISP_API_KEY}"
max_tlp = "amber"
enabled = true
object_types = ["threat", "objective"]
publish = false`}</Code>
      </div>
    </div>
    <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Lede>
        <code style={{ fontFamily: mono }}>setup platforms --splunk</code> enables the platform but
        leaves <code style={{ fontFamily: mono }}>[[tenants]]</code> commented out, and no setup
        subcommand writes <code style={{ fontFamily: mono }}>sharing.toml</code> at all. Both gaps
        are the agent's job.
      </Lede>
      <Note>
        Watch the braces, because the two formats differ:{' '}
        <code style={{ fontFamily: mono }}>$SPLUNK_TOKEN</code> in a platform file,{' '}
        <code style={{ fontFamily: mono }}>{'${MISP_API_KEY}'}</code> in sharing. Neither file ever
        holds the value — a literal MISP key is a warning and gets redacted.
      </Note>
    </div>
  </Shell>
);

const EnvHandoff: Page = () => (
  <Shell eyebrow="04 · SHIP" title="Your half: the tokens, in one git-ignored file">
    <Code label=".env — git-ignored by setup env, never committed" size={22}>{`OPENTIDE_REPO_ROOT=.
SPLUNK_URL=https://splunk.example.org
SPLUNK_PORT=8089
SPLUNK_TOKEN=eyJraWQiOiJzcGx1…
SPLUNK_APP=SplunkEnterpriseSecuritySuite
MISP_API_KEY=9f3cb21e…`}</Code>
    <div style={{ marginTop: 24 }}>
      <Code label="then hand it to the environment and check" size={22}>{`set -a; source .env; set +a

opentide info --platform splunk     # the variables this platform expects
opentide share targets              # the destinations that are enabled`}</Code>
    </div>
    <div style={{ marginTop: 24 }}>
      <Note>
        OpenTide reads the <em>environment</em>, not the file — nothing in the package loads{' '}
        <code style={{ fontFamily: mono }}>.env</code> for you, so source it in the shell the agent
        is using. In CI the same names come from pipeline secrets.
      </Note>
    </div>
  </Shell>
);

const DocsAndCoverage: Page = () => (
  <Shell eyebrow="05 · DOCUMENT" title="Documentation and coverage come for free">
    <Code label="shell" size={26}>{`opentide generate docs     # wiki markdown for every object, with Mermaid chains
opentide info rules        # the catalogue, tabulated
opentide --json info --technique T1059 coverage`}</Code>
    <div style={{ marginTop: 36 }}>
      <Code label="output" size={25}>{`{ "coverage": { "technique": "T1059",
                "rules": ["00000000-0000-4000-8003-000000000001"],
                "count": 1 } }`}</Code>
    </div>
    <div style={{ marginTop: 36 }}>
      <Note>
        Coverage counts rules only. The objective and threat behind them are not listed — use the
        generated Mermaid diagram to see the chain.
      </Note>
    </div>
  </Shell>
);

const DocsOutput: Page = () => (
  <Shell eyebrow="05 · DOCUMENT" title="What a generated page actually contains">
    <Code size={26}>{`opentide generate docs --changed    # only objects the diff touched, plus their referrers
opentide generate docs --flavor github --output docs`}</Code>
    <div style={{ display: 'flex', gap: 36, marginTop: 36 }}>
      <Card
        kicker="RULES"
        title="Status to platform block"
        body="ATT&CK techniques, a backlink to the detection model, response, every platform configuration, coverage."
      />
      <Card
        kicker="OBJECTIVES"
        title="Signals and their rules"
        body="Objective metadata, each signal, and the rules that cover it — backlinked in both directions."
      />
      <Card
        kicker="THREATS"
        title="Assessment and chaining"
        body="Criticality, terrain, assessment, actors, CVE links to Vulnerability-Lookup, Mermaid chaining."
      />
    </div>
    <div style={{ marginTop: 36 }}>
      <Note>
        Every family also gets a Metadata table and a References section. Flavours for GitHub,
        GitLab, and Azure DevOps differ only in how the Mermaid and permalinks are written.
      </Note>
    </div>
  </Shell>
);

// Swatches match the colours the Navigator layer actually writes.
const LegendRow = ({
  swatch,
  label,
  meaning,
}: {
  swatch: string;
  label: string;
  meaning: string;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 30,
      border: `1px solid ${c.rule}`,
      borderRadius: 'var(--osd-radius)',
      background: c.panel,
      padding: '22px 30px',
    }}
  >
    <span
      style={{
        width: 56,
        height: 56,
        borderRadius: 10,
        background: swatch,
        border: `1px solid ${c.rule}`,
        flexShrink: 0,
      }}
    />
    <span
      style={{
        fontFamily: mono,
        fontSize: 28,
        fontWeight: 650,
        width: 440,
        flexShrink: 0,
      }}
    >
      {label}
    </span>
    <span style={{ fontSize: 29, lineHeight: 1.4, color: c.muted }}>{meaning}</span>
  </div>
);

const NavigatorLayerPage: Page = () => (
  <Shell eyebrow="05 · DOCUMENT" title="Coverage as an ATT&CK Navigator layer">
    <Code size={26}>{`opentide generate exports navigator   # layer 4.5, enterprise-attack, into .opentide/exports/`}</Code>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 36 }}>
      <LegendRow
        swatch="#74c476"
        label="Full Coverage"
        meaning="a threat names the technique and a rule covers it"
      />
      <LegendRow
        swatch="#fc6b6b"
        label="TVM Only"
        meaning="a threat names it, nothing detects it — your real gap"
      />
      <LegendRow
        swatch="#6baed6"
        label="MDR Only — needs checking"
        meaning="a rule covers it with no threat behind it — why do we run this?"
      />
    </div>
    <div style={{ marginTop: 36 }}>
      <Note>
        Each technique carries a comment listing the objects that put it there, prefixed{' '}
        <code style={{ fontFamily: mono }}>[THREAT]</code> or{' '}
        <code style={{ fontFamily: mono }}>[RULE]</code>. Drop the JSON into the Navigator and the
        blue squares are the conversation worth having.
      </Note>
    </div>
  </Shell>
);

const Explorer: Page = () => (
  <Shell eyebrow="05 · DOCUMENT" title="The explorer: your catalogue as a static site">
    <Code label="shell" size={25}>{`opentide generate explorer                        # not part of the default pipeline
opentide setup ci github --explorer-pages --yes   # build it on GitHub Pages`}</Code>
    <div style={{ marginTop: 32 }}>
      <Code label=".opentide/exports/explorer.bundle.json" size={24}>{`models        threat · objective · signal · rule
flatIndex     every object, keyed by UUID
chaining      the threat-to-threat graph
summaries     status · tlp · techniques · actors · platforms · relatedCount
stagingIndex  what is deployed where`}</Code>
    </div>
    <div style={{ marginTop: 32 }}>
      <Note>
        A sibling <code style={{ fontFamily: mono }}>explorer.search.json</code> ships a prebuilt
        search index, so the site needs no backend. Pages jobs are written for GitHub only — GitLab
        and Azure exit 0 and warn.
      </Note>
    </div>
  </Shell>
);

const WikiRulePage: Page = () => (
  <Shell eyebrow="05 · DOCUMENT" title="A rule page, straight out of the repository">
    <ImagePlaceholder
      hint="Screenshot: generated rule wiki page — metadata table, status, ATT&CK techniques, detection-model backlink, platform configurations"
      width={1700}
      height={660}
    />
  </Shell>
);

const WikiThreatPage: Page = () => (
  <Shell eyebrow="05 · DOCUMENT" title="A threat page, with the chain drawn for you">
    <ImagePlaceholder
      hint="Screenshot: generated threat wiki page — criticality, terrain, assessment, actors, and the Mermaid coverage or chaining diagram"
      width={1700}
      height={660}
    />
  </Shell>
);

const Share: Page = () => (
  <Shell eyebrow="06 · SHARE" title="Publish to MISP, one Event per object">
    <Code label="shell" size={25}>{`opentide share targets          # which destinations are enabled
opentide share preview          # the push decision, no request, no ledger write
opentide share push             # create or update one MISP Event per object
opentide share push --changed   # only what the default-branch CI diff touched
opentide share status           # local ledger vs the current object
opentide share retract          # unpublish; --delete --yes removes it`}</Code>
    <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Lede>
        Sharing is not deployment. A destination is a MISP instance, not a detection platform, and
        what was published is recorded in a ledger under{' '}
        <code style={{ fontFamily: mono }}>.opentide/states/</code>.
      </Lede>
      <Note>
        <code style={{ fontFamily: mono }}>max_tlp</code> on each block is a hard ceiling. API keys
        are never printed, and a literal key in the config is a warning.{' '}
        <code style={{ fontFamily: mono }}>--changed</code> only runs on a push to the default
        branch in CI.
      </Note>
    </div>
  </Shell>
);

const AgentGuardrails: Page = () => (
  <Shell eyebrow="FIELD NOTES" title="The guardrails — leave them on">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <ToolRow tool="deploy_rule → dry_run: true" what="a real deploy needs you to say so" />
      <ToolRow tool="run_query → stub: true, rows: null" what="never contacts a tenant" />
      <ToolRow tool="validate_query → live: false" what="refuses, and does not read your query" />
      <ToolRow tool="crowdstrike · harfanglab" what="supported: false — never infer a pass" />
      <ToolRow tool="no tool writes files" what="the agent edits YAML, so git shows everything" />
    </div>
    <div style={{ marginTop: 36 }}>
      <Note>
        An agent that could deploy quietly would be a liability, so the defaults all fail safe and
        say why. The one to watch is{' '}
        <code style={{ fontFamily: mono }}>dry_run: false</code> — if your agent reaches for it
        without asking, that is the moment to stop and read.
      </Note>
    </div>
  </Shell>
);

const Ci: Page = () => (
  <Shell eyebrow="04 · SHIP" title="The generated pipeline is the same loop">
    <ul style={{ margin: 0, paddingLeft: 44, marginTop: 10 }}>
      <Bullet>
        Validate job: <code style={{ fontFamily: mono }}>validate --strict</code> and{' '}
        <code style={{ fontFamily: mono }}>lint --strict</code>
      </Bullet>
      <Bullet>One query-validation job per enabled, query-capable platform</Bullet>
      <Bullet>Generate, then staging and production deploys on the default branch</Bullet>
      <Bullet>
        <code style={{ fontFamily: mono }}>OPENTIDE_REPO_ROOT</code> set at workflow scope; secrets
        mapped by name
      </Bullet>
      <Bullet>GitHub, GitLab, and Azure pipelines from one command</Bullet>
    </ul>
    <div style={{ marginTop: 20 }}>
      <Code size={26}>{`opentide setup platforms --sentinel --yes && opentide setup ci github --yes`}</Code>
    </div>
  </Shell>
);

const Gotchas: Page = () => (
  <Shell eyebrow="FIELD NOTES" title="Five things that will bite you">
    <ul style={{ margin: 0, paddingLeft: 44, marginTop: 10 }}>
      <Bullet>
        Prompting the agent before <code style={{ fontFamily: mono }}>setup mcp</code> — it has no
        tools yet, so it guesses
      </Bullet>
      <Bullet>
        Offline laptops: <code style={{ fontFamily: mono }}>setup skills</code> fetches the
        catalogue from GitHub, even for bundled skills
      </Bullet>
      <Bullet>
        Your shell and your agent on different{' '}
        <code style={{ fontFamily: mono }}>OPENTIDE_REPO_ROOT</code> values
      </Bullet>
      <Bullet>
        Braces differ: <code style={{ fontFamily: mono }}>{'${MISP_API_KEY}'}</code> in sharing.toml,{' '}
        <code style={{ fontFamily: mono }}>$SPLUNK_TOKEN</code> in the platform TOML
      </Bullet>
      <Bullet>
        <code style={{ fontFamily: mono }}>setup ci sentinel</code> — the positional is the CI
        provider, not a platform
      </Bullet>
    </ul>
  </Shell>
);

const CheatSheet: Page = () => (
  <Shell eyebrow="TAKE THIS HOME" title="One block, then four prompts">
    <Code label="you type this once" size={24}>{`pip install 'opentide[mcp]==0.12.1'
opentide setup mcp --cursor --yes && opentide setup skills --cursor --yes`}</Code>
    <div style={{ marginTop: 28 }}>
      <Code label="then stop typing — this is the rest of the workshop" size={24}>{`"Scaffold a detection repo here: Sentinel and Splunk, CI on GitHub,
 hooks on. Show me the commands before you run them."

"Here is an intel report. Draft the threat, the objective with its
 signals, and a Sentinel rule — then validate strict and fix what fails."

"Add a Splunk block to that rule and dry-run the deploy."

"Preview sharing the threat to MISP. Do not push yet."`}</Code>
    </div>
    <div style={{ marginTop: 28 }}>
      <Note>
        Keep <code style={{ fontFamily: mono }}>opentide validate --strict</code> in your own hands
        between prompts. It is the one command that tells you whether the last answer was true.
      </Note>
    </div>
  </Shell>
);

const Close: Page = () => (
  <div
    style={{
      ...fill,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 140px',
    }}
  >
    <img src={logo} alt="OpenTide" style={{ width: 110, height: 110 }} />
    <h2
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 104,
        lineHeight: 1.05,
        fontWeight: 900,
        margin: '44px 0 0',
      }}
    >
      Your turn
    </h2>
    <p style={{ fontSize: 40, lineHeight: 1.5, color: c.soft, margin: '32px 0 0', maxWidth: 1300 }}>
      Scaffold a repository, author one chain, and get a green validate. Everything after that is
      the same loop at a larger scale.
    </p>
    <div style={{ fontFamily: mono, fontSize: 28, color: c.muted, marginTop: 52, lineHeight: 1.7 }}>
      opentide.org/docs/usage/ · tutorial + quickstart
      <br />
      github.com/OpenTideHQ/opentide · pypi.org/project/opentide<br />github.com/OpenTideHQ/library - opentide objects thta can be reused / shared
    </div>
    <Footer />
  </div>
);

const ConclusionBox = ({
  kicker,
  children,
}: {
  kicker: string;
  children: ReactNode;
}) => (
  <div
    style={{
      flex: 1,
      border: `1px solid ${c.rule}`,
      borderRadius: 'var(--osd-radius)',
      background: c.panel,
      padding: '32px 36px',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div
      style={{
        fontFamily: mono,
        fontSize: 22,
        lineHeight: 1.2,
        color: 'var(--osd-accent)',
        letterSpacing: '0.1em',
      }}
    >
      {kicker}
    </div>
    {children}
  </div>
);

const ConclusionLT: Page = () => (
  <Shell eyebrow="WRAP UP" title="Where to go next">
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 36 }}>
      <ConclusionBox kicker="DOCS, CODE, LIBRARY">
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginTop: 22 }}>
          <img
            src={qrOpentide}
            alt="QR code linking to opentide.org"
            style={{ width: 230, height: 230, display: 'block', flexShrink: 0 }}
          />
          <div>
            <div
              style={{
                fontFamily: 'var(--osd-font-display)',
                fontSize: 50,
                lineHeight: 1.1,
                fontWeight: 800,
              }}
            >
              opentide.org
            </div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 23,
                lineHeight: 1.7,
                color: c.muted,
                marginTop: 18,
              }}
            >
              github.com/OpenTideHQ
              <br />
              pypi.org/project/opentide
              <br />
              OpenTideHQ/library
            </div>
          </div>
        </div>
        <div style={{ fontSize: 27, lineHeight: 1.45, color: c.soft, marginTop: 'auto', paddingTop: 26 }}>
          Docs, the engine, the specifications, and a library of objects you can reuse.
        </div>
      </ConclusionBox>

      <ConclusionBox kicker="WORKSHOP · HACK.LU 2026">
        <img
          src={workshopAgenda}
          alt="hack.lu schedule entry: OpenTIDE Workshop, 23 October 2026, 13:45–15:15, Vianden & Wiltz"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            marginTop: 22,
            border: `1px solid ${c.rule}`,
            borderRadius: 10,
            background: '#ffffff',
          }}
        />
        <div
          style={{
            fontSize: 36,
            lineHeight: 1.35,
            fontWeight: 700,
            color: 'var(--osd-accent)',
            marginTop: 'auto',
            paddingTop: 26,
          }}
        >
          Come to the workshop with your agent.
        </div>
      </ConclusionBox>
    </div>

    <div
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontSize: 72,
        lineHeight: 1.1,
        fontWeight: 900,
        textAlign: 'center',
        marginTop: 40,
      }}
    >
      Thank you!
    </div>
  </Shell>
);

const DividerBackup: Page = () => (
  <Divider
    number="—"
    minutes="backup"
    title="Backup."
    subtitle="Everything below is held back for questions: the full workshop material, unchanged."
  />
);

export const meta: SlideMeta = {
  title: 'OpenTIDE — Open Threat-Informed Detection Engineering (hack.lu 2026)',
  createdAt: '2026-10-10T13:58:08.841Z',
};

// Original workshop notes, kept index-aligned with the old running order; the
// exported `notes` below re-points them at the new one.
const N: (string | undefined)[] = [
  'Welcome. Housekeeping first: everyone needs Python 3.10 or newer and a terminal. By the end of the session you will have a detection repository that validates clean and a rule that is ready to deploy. Ask questions as we go — this is a workshop, not a talk.',
  'Let this one sit in silence for a beat, then land the joke and move on — it buys you the attention you need for the three slides that follow.',
  'Now the point behind the joke: OpenTIDE is where public detection content lands and becomes yours. Name each source as you point at it — SigmaHQ, the Microsoft Sentinel repo, Splunk ESCU, Rulezet, SOC Prime — then say the quiet part: importing rules is easy, keeping them tied to a threat you actually care about is the hard part, and that is what the next hour is about.',
  'Frame OpenTide as a toolchain, not a platform. It does not store your detections — your Git repository does. OpenTide is what turns that repository into something you can validate, document, and ship. Three jobs: validate, generate, deploy.',
  'Read out the new time budget so nobody is surprised: 10 to bootstrap, 10 to configure, 20 on TI to rule, 20 to validate and ship, then 5 each for document, share and wrap-up. Say the shape of the day out loud — they type commands once, in step 01, and after that they prompt and review. The deliverable is still theirs: a repository that validates clean, a rule ready to deploy, and a pipeline that enforces both.',
  'Draw the red curve with your hand as you talk: the analyst spends weeks on a campaign and their understanding goes deep. Then the hand-over: a PDF, a wiki page, a deck. Ask the detection engineers in the room how much of that depth survives the document. The blue curve starts low and climbs slower, because relearning from prose is harder than learning from the source. Most teams never get back to the red level — and nobody notices, because the loss is invisible.',
  'Same picture, but now the hand-over is a list of technique IDs. Point at the chips: T1059 tells you "command interpreter". It does not tell you which interpreter, which parent process, which flags, or why this actor is worth detecting. Then walk to the six-month mark: the engineer who wrote the rule has moved on, the procedure is forgotten, and the curve turns down. Ask whether anyone has inherited a rule nobody could explain. Every room has that story.',
  'Now the payoff. One line, no break. The shift is organisational as much as technical: a purple team documents the threat once, as a structured object, and the rule carries the UUID of the objective that justified it. The knowledge lives in the repository, not in a person. Six months later the chain still answers "why does this rule exist?" — which is the question the previous two slides could not answer.',
  'Three questions, three object families. Insist on the acronyms only lightly — the questions are what matter. Mention that the UUID, not the filename, is the identity, which is why renaming is safe.',
  'This is the slide to spend time on. Read it left to right first — a threat is covered by an objective, which is implemented by a rule — then point at the blue labels underneath and explain that the YAML reference runs the opposite way: the rule names the objective, the objective names the threat. People who grasp this one picture stop guessing which field goes where. Then show the two commands live if the room has a repo with content.',
  'Seven platforms, one wheel. The honest bit is worth calling out: CrowdStrike and HarfangLab cannot validate queries, and OpenTide reports that rather than faking a pass. Ask which platforms are in the room.',
  'Draw the rings from the inside out with your hand. Start with the smallest: a team that only documents threat vectors already gets something useful — a structured library instead of a wiki page. Add objectives and coverage becomes measurable. Only the outer ring manages the rules that ship. The point to land is that you do not have to reach the outer ring to get value, which is the honest answer to "this looks like a lot of process for my team". Then zoom into one objective box and spend your time there: the objective is not the unit a rule implements. It decomposes into signals — the pieces of evidence that would satisfy it — and each rule points at one signal. That is why a gap here is actionable: you are not told "this objective is weak", you are told which signal nobody has implemented yet. Mention that detection_model will also accept an objective UUID, and that naming the signal is the better habit. Then point at the three hollow squares on the lower right and be honest about them: detection_model is optional, so a rule with nothing behind it still validates and still deploys. Most rooms are importing a few hundred of these from a vendor pack, and the answer is not that OpenTide refuses them — it manages them and makes them visible, which is the first step to giving them a parent. This is the same rule that shows up blue on the Navigator layer later.',
  'Housekeeping, and do not rush it: everything today assumes a working agent, so read the left column out loud and ask for hands on each line. Python 3.10 or newer, git, a GitHub account, and an agent in their editor — Cursor, Claude Code, Copilot, any MCP host. The right column is on us: MISP URL and key, Splunk URL and token, and the intel report we will author from. Nobody needs a cloud subscription or a Sentinel tenant. The one failure mode worth pre-empting is a locked-down laptop: setup skills pulls the catalogue from github.com, so if outbound HTTPS is blocked the skills step fails and the rest of the day is manual. Ask now whether anyone is on a managed device.',
  'Section break. Everyone opens a terminal now. This is the only section where they type commands, so nobody moves on until install works — pair up the stragglers rather than letting them fall behind.',
  'Walk the block line by line. Virtual environment first, then the mcp extra — that is what makes opentide mcp start work at all. The splunk extra is only for the live deploy later; validate, generate and dry-run need nothing. Then the two setup commands, and have them swap --cursor for their own editor. The last step is the one people forget: reload the MCP server in the host, or the agent starts with no tools. Land the point in the note: this block is manual because the agent cannot write the config that gives it tools. That is the bootstrap paradox, and after this slide they stop typing commands and start writing prompts.',
  'Have the room ask their agent what OpenTide tools it can see, and compare against this list — that is the fastest proof the handshake worked. Read a few tools out, then spend your time on the note, because it is the honest part: no tool writes a file, and no tool runs setup. The agent authors YAML with its own editor and shells out to the CLI. That is deliberate — it means every single thing the agent does today shows up in git diff, and they can review it like a colleague\\\\\\\'s pull request rather than trusting a black box.',
  'The two-roots failure costs people twenty minutes and it always looks like a bug in OpenTide. Their shell has one OPENTIDE_REPO_ROOT and the MCP server\\\\\\\'s env block has another, so the agent cheerfully reports a clean catalogue they cannot find. Have everyone ask the agent to run opentide info, then run it themselves, and compare the object counts. If the numbers differ, fix it now.',
  'Section break, and a change of mode: from here the agent drives and they review. Say that explicitly, because the instinct is to keep typing.',
  'This is the slide the workshop turns on. The agent should interview them before it writes anything, and these are the real option sets — the values the flags actually accept, not a wish list. Go round the room on the CI question so people hear the three choices. For today: GitHub, Sentinel plus Splunk, and whichever editor they bootstrapped. Worth saying why the interview matters: an agent that guesses here writes a pipeline for the wrong provider and a platform file nobody asked for, and they will not notice until CI goes red.',
  'Make them read the commands before approving. Two things to point at. First, order: setup ci reads the enabled platform files to decide which query-validation jobs to write, so platforms must come first — get this wrong and the pipeline silently skips the query check. Second, --yes is on every line because an agent that hits an interactive prompt just hangs. That means the prompt is no longer the safety net; they are. This is the habit to take home.',
  'Orient people in the tree the agent just created. Everything OpenTide owns lives under .opentide, the skills live under .agents/skills, and the content is plain YAML under objects. Then the configuration point: layered defaults mean they only ever edit their own workspace, and only the keys they care about.',
  'Section break, and the part people came for. Twenty minutes, and the only input is a paragraph of prose.',
  'Explain why generate comes first: validation compares objects against generated schemas, so without this step there is nothing to validate against. All four authoring skills open this way, which is why the agent does it unprompted. If anyone\\\\\\\'s agent skipped it, the schema resource literally answers back run \\\\\\\'opentide generate schemas\\\\\\\'.',
  'Read the snippet out loud — it is deliberately ordinary. No IOC table, no STIX, just the kind of paragraph that lands in a SOC inbox. Then be straight with the room about what is happening, because it is the most common misunderstanding of the day: there is no TI import command in OpenTide. Nothing parses this. The agent reads prose and drafts objects using the shape rules in its skills, and OpenTide\\\\\\\'s job is to check the result. If you oversell this as a feature, the first person who tries it on a 40-page report will be disappointed.',
  'Three skills, three objects, in this order, because each one needs the UUID of the one before it. Point at the skill names — these are the files setup skills installed, and each is a shape contract rather than a prompt: where the file goes, which fields are required, what command proves it worked. Stress that the agent mints fresh UUIDs; if you see the ones from these slides in their repo, the agent copied the deck instead of generating.',
  'Give them a moment to find the two references, then say it plainly: an objective naming its threats, and a rule naming the one signal it implements. Everything else on these three files is description. If they remember one picture from today, this is the one — and it is the same chain from the model section, now written by an agent in about a minute.',
  'Same objective, same signal, two dialects. Ask the agent for the Splunk block and it writes SPL beside the KQL without touching the model. This is also where their Splunk token becomes useful, so flag that the deploy section will come back to it.',
  'Slow down here — this is the slide that keeps them safe. Four failure modes. The invented vocabulary value is by far the commonest, and it reads beautifully, which is exactly why it is dangerous. Three of the four are caught mechanically in about a second by validate --strict and lint --strict. The fourth — a query that parses perfectly and detects the wrong thing — no tool will ever catch, and that is their job. Tie it forward: this is the same ACCEPTANCE gate the lifecycle diagram shows in a few slides.',
  'Section break. Everyone should now have three files. Quick show of hands before moving on.',
  'Run validate live. Then explain the strict flag as the CI contract: warnings are errors when a pipeline is the reviewer.',
  'This is the most valuable five minutes of the workshop. Have everyone corrupt the UUID and read the error together, then fix it. People who have seen the failure output once debug ten times faster.',
  'Offline versus live is an important distinction — structural check, not a semantic one. Then dry-run the deploy and read the warning about commented-out tenants.',
  'Statuses are configurable; do not let anyone leave thinking this is a fixed lifecycle. The no-promote-command point surprises people: you edit YAML, then deploy.',
  'They have just read the status table, so introduce this as the same eight boxes drawn as a flow. Trace the path with your finger: a signal leaves the backlog, gets a DESIGN, becomes a rule in DEVELOPMENT, runs in STAGING against real data. Then stop at ACCEPTANCE and make the point of the slide: this is a hand-over gate, not a build step. The alert handling manager reviews the rule and decides whether it is something their team can actually work at three in the morning — fidelity, severity, the response block. Ready means PRODUCTION; needs rework sends it back through IMPROVING. Tie it to the previous slide: every box here is a status that ships in deployment.toml, and each one already maps to a deploy strategy — DESIGN inert, the middle band previewing, PRODUCTION releasing, DISABLED and REMOVED tearing down. What is organisation-specific is the colour, not the boxes: which team develops, which team operates, and who owns the ACCEPTANCE review. Swap those names for your own and the shape holds.',
  'Two files, and the agent writes both — but for different reasons, so say both. setup platforms --splunk turns the platform on and then leaves the whole [[tenants]] block commented out, so somebody has to uncomment it and fill the four placeholders. sharing.toml is worse: there is no setup subcommand for it at all, so the agent writes that file from nothing. That is a genuinely good use of an agent — tedious, shape-driven, and easy to verify. Then the detail that costs people the most time today: the two formats disagree about braces. A platform file wants $SPLUNK_TOKEN, sharing wants ${MISP_API_KEY}. Ask the room to read both blocks and spot it. Last point: neither file ever contains a secret, and if the agent inlines a literal MISP key, OpenTide warns and redacts it rather than trusting you to notice.',
  'This is the one moment in the whole section where they type something, so make it feel small: four values and a token, into a file git already ignores. Walk the second block carefully, because it is the honest caveat — nothing in OpenTide loads .env. There is no dotenv dependency; the config reads the process environment, so an unsourced .env looks exactly like a missing credential. Have them run set -a; source .env; set +a in the same shell the agent is driving, then opentide info --platform splunk and opentide share targets to prove both halves landed. Mention that unset placeholders fail loudly rather than deploying with a literal $SPLUNK_TOKEN, and that in CI these same names come from pipeline secrets instead.',
  'Close the loop: the CI pipeline runs exactly the commands we just ran by hand. That is the whole promise of detection-as-code. This is the end of the 20-minute block — check the room before moving on.',
  'Section break, and a short one: five minutes. Nobody types here, they just watch, because the documentation is already written — it falls out of the objects they authored twenty minutes ago.',
  'Documentation is a side effect of validated content, which is the whole argument for detection-as-code. Run generate docs and open one page if you have a projector.',
  'Scroll one rule page and one threat page so people see the backlinks and the Mermaid diagram. The line to land: nobody wrote this page, and nobody can forget to update it.',
  'Walk the rule page top to bottom: metadata, status, techniques, then the backlink to the objective. Point out that the platform configuration block on the page is the same YAML they wrote twenty minutes ago — rendered, not retyped.',
  'The threat page is the one that sells it to a manager. The chaining diagram was never drawn by hand; it comes from the UUID references. Ask the room how long a diagram like this normally stays accurate in their wiki.',
  'Spend your time on the legend, not the command. Green is what everyone wants to show a board. Red is the honest gap — a threat you documented and never detected. Blue is the uncomfortable one: a rule running in production with no threat behind it. Nobody builds that view by hand, which is why nobody has it.',
  'Flag that explorer is not in the default generate pipeline — you call it explicitly, or let the Pages job call it. Then the point: one JSON bundle plus a prebuilt search index is enough for a browsable catalogue with no backend, no database, and no server to patch. Mention the GitHub-only caveat so the GitLab shops in the room are not surprised.',
  'Section break. Five minutes, and mostly a demo — few rooms have a MISP instance to hand. Ask who is already sharing detection content and how.',
  'Lead with the distinction, because people conflate the two: sharing publishes to MISP, deploying pushes to a detection platform. Then show preview rather than push — it makes the decision without a request, so it is safe on stage. Flag max_tlp as the control that keeps a TLP:AMBER object from leaving.',
  'Last section. Five minutes, so keep it moving: the gotchas, the cheat sheet, and the hand-off.',
  'Not bonus material any more — this is the slide that decides whether they can trust what they built today. Walk the defaults: deploy_rule is dry-run unless someone says otherwise, run_query is an explicit stub that never contacts a tenant and never returns rows, validate_query refuses by default and does not even read the query string you hand it, and CrowdStrike and HarfangLab answer supported: false rather than faking a pass. The line to land: the defaults fail safe and say why. Then the warning — if their agent reaches for dry_run: false without asking, that is the moment to stop and read.',
  'Read these out as war stories, not warnings — most of the room will have hit at least one in the last hour. The brace difference between ${MISP_API_KEY} in sharing.toml and $SPLUNK_TOKEN in the platform TOML is the one that wastes the most time, so say it twice.',
  'Tell people to screenshot this page. One block they type, four prompts they paste, and the whole session is reproducible on Monday. The last line is the one that matters: keep validate --strict in their own hands between prompts, because it is the only command that tells them whether the last answer was true.',
  'Hand over to practice time. Point at the docs for the tutorial and quickstart, and stay in the room for questions.',
];

// Index-aligned with the running order below. Reused pages keep their original
// note via N[...]; new and reworked pages get fresh ones.
export const notes: (string | undefined)[] = [
  // ── the talk ──
  'Open on what the acronym actually stands for, then the provenance, because it is the credibility line: this is not a side project. OpenTIDE is built and run by the CSOC of the European Commission, and it has been open source since 2024 under the EUPL v1.2 — the EU public licence, GPL-compatible. Point at the two marks at the bottom: the institution, and the "united we cyberdefend" campaign it belongs to. Then set expectations for a lightning talk: no live demo, one idea, and a pile of backup slides if anyone wants depth.',
  N[2],
  'Same picture as the classic hand-over problem, but now the hand-over is a list of technique IDs. Walk the chips, then stop on T1190 and read the callout out loud. "Internet-facing application compromised" is a category, not a procedure: it does not say which application, which CVE, which request, which log source or which field. You cannot write a query from it, and you cannot tell whether you already cover it. Then the six-month mark: the engineer who wrote the rule has moved on, the procedure is forgotten, and the curve turns down. Ask whether anyone has inherited a rule nobody could explain. Every room has that story.',
  N[7],
  'The same three objects, now as the order you ask in. The point to land is the dependency: the objective needs the threat UUID, and the rule needs the objective signal. Ask for the rule first and the agent invents a parent, which is exactly the drift we just spent two slides complaining about. The schema pills matter for one reason only — rules are at 1.1 while threats and objectives are at 1.0, so pin the version you talk about.',
  N[11],
  'The whole stack on one slide — walk it top to bottom, one level at a time, and do not rush it. Level 1 is the chain we have been building all talk: threats, objectives, signals, rules. Level 2 is what that buys you operationally: because every rule arrives with a reason, its deployment can carry a status, and the status decides what deploy actually does — DESIGN inert, the middle band previewing, PRODUCTION releasing, DISABLED and REMOVED tearing down. IMPROVING is the dashed one: it is the rework loop back into PRODUCTION from the lifecycle diagram, not a forward step, and it is not in the default strategy table. Level 3 is where the rule lands: seven platforms bundled in the wheel, five of which opentide can query-check, with CrowdStrike and HarfangLab deploy-only — it says so rather than faking a pass. The three dashed boxes on the end are roadmap, not shipped: Elastic Security has an accepted RFC 0007, Sysdig with Falco is still draft RFC 0004, and Graylog is a community ask with nothing planned. Be explicit about that line so nobody leaves thinking they can target Elastic today.',
  'Chapter break, and a change of subject: from the model to why any of this is packaged the way it is. One line is enough — OpenTIDE ran in production for years as a git submodule, and it is now a versioned CLI on PyPI. The reason matters for the next two slides: a submodule cannot be pinned, cannot be installed by an agent, and cannot be checked in CI without copying glue around.',
  'The number slide, and the reason the project exists. Trace the blue curve with your hand: intel volume compounds — advisories, CVEs, campaigns, thousands a month. Then the dotted line: engineering throughput, almost flat, because every TTP costs hours of human work to read, model, write, tune and deploy. The hatched area between them is the gap, and it widens on its own. Land the honest framing: the bottleneck was never the strategy, it was capacity. Tens of production-ready rules a month against thousands of intel items is not a discipline problem, it is an arithmetic problem — which is why agents matter, and why the spec has to keep them aligned.',
  'And this is the answer to "so do you let the agent deploy?". Two zones, and the boundary is the whole argument. Everything in the blue zone is drafting and checking — MCP tools, skills, the CLI — and nothing in it deploys. The dashed box is the brief, then search for what exists, get_chaining for the graph, draft the YAML, and on the way back validation_report, validate query --live against the tenant, and a dry-run deploy. Fail goes straight back to editing, in red. The agent\'s output is a pull request and nothing more. Below the line every step is a human decision: review the diff, merge, STAGING on merge, approval, PRODUCTION. Close the talk\'s argument here — agents write the queries, the engine checks them, and a person still signs off.',
  'Close here. Two things to leave them with. Left: opentide.org — hold the slide long enough for the room to actually scan the QR, and mention the library, because reusable objects are the fastest way to get value without authoring from scratch. Right: the workshop, Friday 23 October, 13:45 to 15:15, Vianden & Wiltz — ninety minutes, hands on, and the only prerequisite is a laptop with a coding agent already working. Say the invitation out loud: come with your agent. Then thank them and take questions.',
  'Everything from here is backup. Jump to a slide if the question needs it, otherwise stop and take questions.',

  // ── backup: the full workshop deck, unchanged ──
  N[0],
  N[1],
  N[3],
  N[4],
  N[5],
  N[12],
  N[13],
  N[14],
  N[15],
  N[16],
  N[17],
  N[18],
  N[19],
  N[20],
  N[21],
  N[22],
  N[23],
  N[24],
  N[25],
  N[26],
  N[27],
  N[28],
  N[29],
  N[30],
  N[31],
  N[32],
  N[34],
  N[35],
  N[36],
  N[37],
  N[38],
  N[39],
  N[40],
  N[41],
  N[42],
  N[43],
  N[44],
  N[45],
  N[46],
  N[47],
  N[48],
  N[49],
  N[50],
];

export default [
  // ── the talk ──
  TitleLT, // 01 · new: what OpenTIDE is, who builds it, the licence
  FlaconSources, // 02 · was 03 · now titled, Rulezet + Prime Architect enlarged
  AttackOnly, // 03 · was 07 · now carries the T1190 example
  WithOpenTide, // 04 · moved from backup (was 19): one curve, one chain
  ObjectModelLT, // 05 · opentide-workshop p10
  UseCases, // 06 · moved from 09
  ThreeLayers, // 07 · objects + status + platforms, three layers
  DividerWhyNowLT, // 08 · opentide p17
  GapLT, // 09 · opentide p04
  AgentLoopLT, // 10 · opentide p28
  ConclusionLT, // 11 · new: opentide.org + QR, workshop invite, thank you

  // ── backup ──
  DividerBackup,
  Cover,
  Flacon,
  WhatIsIt,
  Plan,
  HandoverGap,
  Prerequisites,
  DividerInstall,
  Bootstrap,
  AgentSurface,
  PointAtRepo,
  DividerScaffold,
  AgentInterview,
  AgentRunsSetup,
  Layout,
  DividerAuthor,
  GenerateFirst,
  TiInput,
  AgentToChain,
  ChainYaml,
  RuleConfig,
  ReviewGate,
  DividerShip,
  Validate,
  BreakIt,
  QueryAndDeploy,
  Statuses,
  Credentials,
  EnvHandoff,
  Ci,
  DividerDocument,
  DocsAndCoverage,
  DocsOutput,
  WikiRulePage,
  WikiThreatPage,
  NavigatorLayerPage,
  Explorer,
  DividerShare,
  Share,
  DividerWrapUp,
  AgentGuardrails,
  Gotchas,
  CheatSheet,
  Close,
] satisfies Page[];
