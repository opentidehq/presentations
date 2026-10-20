import {
  type DesignSystem,
  type Page,
  type SlideMeta,
  type SlideTransition,
  useSlidePageNumber,
} from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';
import azureSentinel from './assets/Azure-Sentinel.png';
import ecLogo from './assets/ec-logo-horiz_en.png';
import hackLuBadge from './assets/hack-round-dark.png';
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


// Title page for hack.lu 2026: what opentide stands for, where it comes from,
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
    {/* logo row: hack.lu left, OpenTIDE centre, CSOC right. All three boxes are
        200×200 and equal width, so space-between puts the OpenTIDE mark dead centre. */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <img
        src={hackLuBadge}
        alt="hack.lu 2026, 20th edition, Luxembourg"
        style={{ width: 200, height: 200, objectFit: 'contain', display: 'block', borderRadius: '50%' }}
      />
      <img
        src={logo}
        alt="OpenTIDE"
        style={{ width: 200, height: 200, objectFit: 'contain', display: 'block' }}
      />
      <img
        src={unitedWeCyberdefend}
        alt="United we cyberdefend, European Commission Cybersecurity Operations Centre"
        style={{ width: 200, height: 200, objectFit: 'contain', display: 'block' }}
      />
    </div>

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
        20th edition hack.lu 2026 · lightning talk
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
      Developed at the <strong style={{ color: c.soft, fontWeight: 650 }}>CSOC of the European<br />{''}</strong>and open sourced since 2024 under the{' '}
      <span style={{ fontFamily: mono, fontSize: 30, color: 'var(--osd-accent)' }}>
        EUPL v1.2
      </span>{' '}
      EU public licence.
    </p>

    {/* bottom-left corner: the institution behind OpenTIDE */}
    <img
      src={ecLogo}
      alt="European Commission"
      style={{
        position: 'absolute',
        left: 140,
        bottom: 56,
        height: 56,
        width: 'auto',
        display: 'block',
      }}
    />

    {/* bottom-right corner: where to find it */}
    <div
      style={{
        position: 'absolute',
        right: 110,
        bottom: 56,
        fontFamily: mono,
        fontSize: 24,
        color: c.dim,
        textAlign: 'right',
        lineHeight: 1.6,
      }}
    >
      opentide.org
      <br />
      github.com/OpenTideHQ
    </div>
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
        opentide is a management and operational framework
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
        alt="An opentide perfume bottle"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      <svg
        viewBox="0 0 1920 1080"
        role="img"
        aria-label="SigmaHQ, Microsoft Sentinel, Splunk ESCU, Rulezet and SOC Prime content flowing into opentide."
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <title>Public detection content flows into opentide</title>
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

const WithOpentide: Page = () => (
  <Shell eyebrow="WHY THIS EXISTS" title="With opentide: one curve, one chain">
    <AxisFrame title="With opentide a single purple-team curve rises without a break: the threat is documented once and the rule stays linked to the attack vector.">
      <line x1={130} y1={390} x2={1640} y2={70} stroke={c.pt} strokeWidth={6} />
      <circle cx={130} cy={390} r={9} fill={c.pt} />
      <circle cx={1640} cy={70} r={9} fill={c.pt} />

      {/* the purple team, documenting in opentide */}
      <circle cx={885} cy={230} r={17} fill="var(--osd-bg)" stroke={c.pt} strokeWidth={6} />
      <circle cx={885} cy={230} r={6} fill={c.pt} />
      <text x={850} y={198} fill="var(--osd-text)" fontSize={28} fontWeight={650} textAnchor="end">
        purple team documents the threat in opentide
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
      <LayerHead n="3" name="Platforms" sub="eight in the wheel, two on the roadmap" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        <PlatformMini name="Microsoft Sentinel" id="sentinel" query="KQL check" />
        <PlatformMini name="Defender for Endpoint" id="defender_for_endpoint" query="KQL check" />
        <PlatformMini name="Splunk ES" id="splunk" query="SPL check" />
        <PlatformMini name="SentinelOne" id="sentinel_one" query="S1QL check" />
        <PlatformMini name="Carbon Black Cloud" id="carbon_black_cloud" query="Lucene check" />
        <PlatformMini name="Elastic Security" id="elastic" query="ES|QL · EQL check" />
        <PlatformMini name="CrowdStrike Falcon" id="crowdstrike" query="no query check" />
        <PlatformMini name="HarfangLab" id="harfanglab" query="no query check" />
        <PlatformMini name="Sysdig Secure · Falco" id="RFC 0004" query="draft — not shipped" planned />
        <PlatformMini name="Graylog" id="community ask" query="not planned yet" planned />
      </div>
    </div>
  </Shell>
);

// Nested adoption scopes, after the CoreTIDE "Use cases" diagram. Threat
// vectors sit inside threats-and-objectives, which sits inside opentide
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
      aria-label="opentide wraps three nested scopes: threat vectors on their own, threat vectors with the objectives that cover them, and managed detection rules. Each objective decomposes into named signals and most rules implement one signal, while three hollow rules have no signal behind them and are managed all the same."
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      <title>
        Three adoption scopes inside opentide, with rules implementing signals and a few orphans
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
        opentide
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

      {/* no signal behind them, and opentide ships them anyway */}
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












































// ─── Generated artefacts ──────────────────────────────────────────────────────
// Docs, exports and MISP sharing, condensed from the five document/share pages
// of the long deck. Every command here is one the CLI actually ships.

const Cmd = ({ children }: { children: string }) => (
  <pre
    style={{
      margin: '16px 0 0',
      padding: '14px 16px',
      border: `1px solid ${c.rule}`,
      borderRadius: 10,
      background: c.panel,
      fontFamily: mono,
      fontSize: 18,
      lineHeight: 1.5,
      color: c.soft,
      whiteSpace: 'pre',
      overflow: 'hidden',
    }}
  >
    {children}
  </pre>
);

const PromoPoint = ({ children }: { children: ReactNode }) => (
  <li
    style={{
      display: 'flex',
      gap: 12,
      fontSize: 23,
      lineHeight: 1.4,
      color: c.muted,
      marginTop: 14,
      listStyle: 'none',
    }}
  >
    <span style={{ color: 'var(--osd-accent)', flexShrink: 0 }}>—</span>
    <span>{children}</span>
  </li>
);

const PromoCol = ({
  kicker,
  title,
  cmd,
  children,
}: {
  kicker: string;
  title: string;
  cmd: string;
  children: ReactNode;
}) => (
  <div
    style={{
      flex: 1,
      minWidth: 0,
      border: `1px solid ${c.rule}`,
      borderRadius: 'var(--osd-radius)',
      background: '#ffffff',
      padding: '26px 28px',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div
      style={{
        fontFamily: mono,
        fontSize: 20,
        color: 'var(--osd-accent)',
        letterSpacing: '0.1em',
      }}
    >
      {kicker}
    </div>
    <div style={{ fontSize: 31, lineHeight: 1.2, fontWeight: 700, marginTop: 12 }}>{title}</div>
    <Cmd>{cmd}</Cmd>
    <ul style={{ margin: '6px 0 0', padding: 0 }}>{children}</ul>
  </div>
);

const GeneratedArtefacts: Page = () => (
  <Shell eyebrow="GENERATED ARTEFACTS" title="Write the objects once, get the rest for free">
    <Lede>
      Documentation, coverage exports and sharing are not side projects — they fall out of the
      validated objects, so they cannot drift from what you actually run.
    </Lede>

    <div style={{ display: 'flex', alignItems: 'stretch', gap: 28, marginTop: 30 }}>
      <PromoCol
        kicker="DOCS"
        title="A wiki that cannot go stale"
        cmd={'opentide generate docs\nopentide generate docs --changed'}
      >
        <PromoPoint>
          A markdown page per threat, objective and rule, with Mermaid chain diagrams
        </PromoPoint>
        <PromoPoint>
          Backlinked both ways: rule → signal → objective → threat, and back down
        </PromoPoint>
        <PromoPoint>Flavours for GitHub, GitLab and Azure DevOps</PromoPoint>
      </PromoCol>

      <PromoCol
        kicker="EXPORTS"
        title="Coverage you can show a board"
        cmd={'opentide generate exports navigator\nopentide generate explorer'}
      >
        <PromoPoint>
          ATT&CK Navigator layer 4.5 —{' '}
          <span style={{ color: c.green }}>covered</span>,{' '}
          <span style={{ color: c.red }}>a real gap</span>,{' '}
          <span style={{ color: c.blue }}>a rule with no threat behind it</span>
        </PromoPoint>
        <PromoPoint>
          Graph explorer: the whole catalogue as a static site, with a prebuilt search index and no
          backend to patch
        </PromoPoint>
      </PromoCol>

      <PromoCol
        kicker="SHARE"
        title="Publish objects to MISP"
        cmd={'opentide share preview\nopentide share push --changed'}
      >
        <PromoPoint>One MISP Event per object — preview first, which makes no request</PromoPoint>
        <PromoPoint>
          <code style={{ fontFamily: mono }}>max_tlp</code> is a hard ceiling per destination, so a
          TLP:AMBER object cannot leave
        </PromoPoint>
        <PromoPoint>
          Sharing is not deployment: a destination is a MISP instance, not a platform
        </PromoPoint>
      </PromoCol>
    </div>

    <div style={{ marginTop: 28 }}>
      <Note>
        Nobody writes these by hand, so nobody can forget to update them. On the Navigator layer the
        red squares are your real gaps — and the blue ones are the rules nobody can justify yet.
      </Note>
    </div>
  </Shell>
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
              github.com/opentidehq
              <br />
              pypi.org/project/opentide
              <br />
              opentidehq/library
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
          alt="hack.lu schedule entry: opentide Workshop, 23 October 2026, 13:45–15:15, Vianden & Wiltz"
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
        >Come to the workshop with your agent!</div>
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


export const meta: SlideMeta = {
  title: 'opentide — Open Threat-Informed Detection Engineering (hack.lu 2026)',
  createdAt: '2026-10-10T13:58:08.841Z',
};

export const notes: (string | undefined)[] = [
  'Open on what the acronym actually stands for, then the provenance, because it is the credibility line: this is not a side project. opentide is built and run by the CSOC of the European Commission, and it has been open source since 2024 under the EUPL v1.2 — the EU public licence, GPL-compatible. Point at the two marks at the bottom: the institution, and the "united we cyberdefend" campaign it belongs to. Then set expectations for a lightning talk: no live demo, one idea, and a pile of backup slides if anyone wants depth.',
  'Now the point behind the joke: opentide is where public detection content lands and becomes yours. Name each source as you point at it — SigmaHQ, the Microsoft Sentinel repo, Splunk ESCU, Rulezet, SOC Prime — then say the quiet part: importing rules is easy, keeping them tied to a threat you actually care about is the hard part, and that is what the next hour is about.',
  'Same picture as the classic hand-over problem, but now the hand-over is a list of technique IDs. Walk the chips, then stop on T1190 and read the callout out loud. "Internet-facing application compromised" is a category, not a procedure: it does not say which application, which CVE, which request, which log source or which field. You cannot write a query from it, and you cannot tell whether you already cover it. Then the six-month mark: the engineer who wrote the rule has moved on, the procedure is forgotten, and the curve turns down. Ask whether anyone has inherited a rule nobody could explain. Every room has that story.',
  'Now the payoff. One line, no break. The shift is organisational as much as technical: a purple team documents the threat once, as a structured object, and the rule carries the UUID of the objective that justified it. The knowledge lives in the repository, not in a person. Six months later the chain still answers "why does this rule exist?" — which is the question the previous two slides could not answer.',
  'The same three objects, now as the order you ask in. The point to land is the dependency: the objective needs the threat UUID, and the rule needs the objective signal. Ask for the rule first and the agent invents a parent, which is exactly the drift we just spent two slides complaining about. The schema pills matter for one reason only — rules are at 1.1 while threats and objectives are at 1.0, so pin the version you talk about.',
  'Draw the rings from the inside out with your hand. Start with the smallest: a team that only documents threat vectors already gets something useful — a structured library instead of a wiki page. Add objectives and coverage becomes measurable. Only the outer ring manages the rules that ship. The point to land is that you do not have to reach the outer ring to get value, which is the honest answer to "this looks like a lot of process for my team". Then zoom into one objective box and spend your time there: the objective is not the unit a rule implements. It decomposes into signals — the pieces of evidence that would satisfy it — and each rule points at one signal. That is why a gap here is actionable: you are not told "this objective is weak", you are told which signal nobody has implemented yet. Mention that detection_model will also accept an objective UUID, and that naming the signal is the better habit. Then point at the three hollow squares on the lower right and be honest about them: detection_model is optional, so a rule with nothing behind it still validates and still deploys. Most rooms are importing a few hundred of these from a vendor pack, and the answer is not that OpenTide refuses them — it manages them and makes them visible, which is the first step to giving them a parent. This is the same rule that shows up blue on the Navigator layer later.',
  'The whole stack on one slide — walk it top to bottom, one level at a time, and do not rush it. Level 1 is the chain we have been building all talk: threats, objectives, signals, rules. Level 2 is what that buys you operationally: because every rule arrives with a reason, its deployment can carry a status, and the status decides what deploy actually does — DESIGN inert, the middle band previewing, PRODUCTION releasing, DISABLED and REMOVED tearing down. IMPROVING is the dashed one: it is the rework loop back into PRODUCTION from the lifecycle diagram, not a forward step, and it is not in the default strategy table. Level 3 is where the rule lands: eight platforms, all in the base install since 0.16.0 — one pip install, no extras — and six of them opentide can query-check against a tenant. CrowdStrike and HarfangLab are deploy-only, and it says so rather than faking a pass. Elastic Security is the newest: deploy arrived in 0.15.0 and setup platforms --elastic in 0.16.0, with ES|QL and EQL rules. The two dashed boxes on the end are roadmap, not shipped: Sysdig with Falco is a draft RFC 0004, and Graylog is a community ask with nothing planned. Be explicit about that line so nobody leaves thinking they can target Sysdig or Graylog today.',
  'Chapter break, and a change of subject: from the model to why any of this is packaged the way it is. One line is enough — OpenTIDE ran in production for years as a git submodule, and it is now a versioned CLI on PyPI. The reason matters for the next two slides: a submodule cannot be pinned, cannot be installed by an agent, and cannot be checked in CI without copying glue around.',
  'The number slide, and the reason the project exists. Trace the blue curve with your hand: intel volume compounds — advisories, CVEs, campaigns, thousands a month. Then the dotted line: engineering throughput, almost flat, because every TTP costs hours of human work to read, model, write, tune and deploy. The hatched area between them is the gap, and it widens on its own. Land the honest framing: the bottleneck was never the strategy, it was capacity. Tens of production-ready rules a month against thousands of intel items is not a discipline problem, it is an arithmetic problem — which is why agents matter, and why the spec has to keep them aligned.',
  'And this is the answer to "so do you let the agent deploy?". Two zones, and the boundary is the whole argument. Everything in the blue zone is drafting and checking — MCP tools, skills, the CLI — and nothing in it deploys. The dashed box is the brief, then search for what exists, get_chaining for the graph, draft the YAML, and on the way back validation_report, validate query --live against the tenant, and a dry-run deploy. Fail goes straight back to editing, in red. The agent\'s output is a pull request and nothing more. Below the line every step is a human decision: review the diff, merge, STAGING on merge, approval, PRODUCTION. Close the talk\'s argument here — agents write the queries, the engine checks them, and a person still signs off.',
  'The payoff slide for everything before it, and the one that tends to win over managers rather than engineers. Three columns, left to right. Docs: generate docs writes a markdown page for every threat, objective and rule, with Mermaid chain diagrams and backlinks in both directions — ask the room how long a hand-drawn diagram stays accurate in their wiki, because this one is derived, not drawn. Exports: the ATT&CK Navigator layer is the one to spend time on. Green is what everyone wants to screenshot, red is the honest gap — a threat you documented and never detected — and blue is the uncomfortable one, a rule running with no threat behind it. Nobody builds that blue view by hand, which is why nobody has it. The graph explorer is the same catalogue as a static site: a JSON bundle plus a prebuilt search index, no backend, no database to patch. Share: one MISP Event per object, and lead with preview because it makes the decision without sending a request, so it is safe to show live. Flag max_tlp as the control that stops a TLP:AMBER object leaving, and be precise about the distinction people conflate — sharing publishes to MISP, deploying pushes to a detection platform. Land the closing line: none of this is written by hand, so none of it can drift from what you actually run.',
  'Close here. Two things to leave them with. Left: opentide.org — hold the slide long enough for the room to actually scan the QR, and mention the library, because reusable objects are the fastest way to get value without authoring from scratch. Right: the workshop, Friday 23 October, 13:45 to 15:15, Vianden & Wiltz — ninety minutes, hands on, and the only prerequisite is a laptop with a coding agent already working. Say the invitation out loud: come with your agent. Then thank them and take questions.',
];

export default [
  // ── the talk ──
  TitleLT, // 01 · new: what opentide is, who builds it, the licence
  FlaconSources, // 02 · was 03 · now titled, Rulezet + Prime Architect enlarged
  AttackOnly, // 03 · was 07 · now carries the T1190 example
  WithOpentide, // 04 · moved from backup (was 19): one curve, one chain
  ObjectModelLT, // 05 · opentide-workshop p10
  UseCases, // 06 · moved from 09
  ThreeLayers, // 07 · objects + status + platforms, three layers
  DividerWhyNowLT, // 08 · opentide p17
  GapLT, // 09 · opentide p04
  AgentLoopLT, // 10 · opentide p28
  GeneratedArtefacts, // 11 · new: docs, navigator + explorer exports, MISP sharing
  ConclusionLT, // 12 · new: opentide.org + QR, workshop invite, thank you
] satisfies Page[];
