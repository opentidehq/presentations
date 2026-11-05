# opentide presentations

Private decks and workshops for [opentide](https://opentide.org), built with [open-slide](https://open-slide.dev)
(React pages on a 1920×1080 canvas). Every deck shares one theme, `opentide-coastal`: the opentide.org light
register, white and Pantone Reflex Blue, Inter and JetBrains Mono, with the ASCII tide on covers and dividers.

## Decks

| Deck | Pages | What it is |
| --- | --- | --- |
| [`slides/opentide`](slides/opentide/index.tsx) | 39 | **The founding deck** (8 October 2026, opentide 0.11.0): what opentide is, why it matters, why the engine was re-released as a CLI for agentic detection engineering, and what comes next. Export: [`exports/opentide.pdf`](exports/opentide.pdf). |
| [`slides/opentide-workshop`](slides/opentide-workshop/index.tsx) | 32 | **Workshop: detection engineering with a coding agent** (opentide 0.16.0). From an empty folder to a threat → objective → rule chain in a pull request: the prompts to type, what the agent does, what to expect, and four labs. Export: [`exports/opentide-workshop.pdf`](exports/opentide-workshop.pdf). |
| [`slides/opentide-language-server`](slides/opentide-language-server/index.tsx) | 15 | **How opentide reads a query** (language server 0.10.0): the Rust engine behind the editor, for a mixed audience. Tokens, the syntax tree, error recovery, analyzers and catalogs, YAML injection, measured speed-ups, and the hosts it ships in. Animated and hoverable. Export: [`exports/opentide-language-server.pdf`](exports/opentide-language-server.pdf). |

Every terminal window, JSON envelope and file tree in the workshop comes from a real run of the pinned
version (`pnpm lab`). Speaker notes are on every page.

## Run

```bash
pnpm install
pnpm dev            # http://localhost:5173 — pick a deck
```

## Present

- `F` fullscreen, `Enter` play mode, `P` presenter view (speaker notes and a timer in a second window).
- `→` / `Space` next, `←` previous.
- The tide is live only on the page being shown; move the pointer over it to stir the water.

## Make or change a deck

Open the repo in Claude Code (or any agent that reads `AGENTS.md`) and ask for it. The agent guide and skills
are set up:

- [`AGENTS.md`](AGENTS.md) (`CLAUDE.md` links to it): hard rules and which skill to use.
- [`.agents/skills/opentide-deck`](.agents/skills/opentide-deck/SKILL.md): our house rules — brand, messaging,
  facts from real runs, which deck to copy components from, review and export.
- `create-slide`, `slide-authoring`, `apply-comments`, `create-theme`, `current-slide`: the open-slide skills,
  synced from `@open-slide/core` with `pnpm sync:skills`.
- [`themes/opentide-coastal.md`](themes/opentide-coastal.md): the theme `create-slide` offers first.

Useful commands:

```bash
pnpm typecheck
pnpm shots <deck-id>          # 1920×1080 PNG per page in .shots/<deck-id>/ (needs pnpm dev)
pnpm export:pdf <deck-id>     # exports/<deck-id>.pdf (needs pnpm dev)
pnpm lab                      # opentide 0.16.0 detection repo in .lab/soc, for real CLI output
pnpm build                    # static site in dist/
```

## Deploy (GitHub Pages)

`.github/workflows/pages.yml` builds the site and publishes it to GitHub Pages on every push to `main` (or by hand from
Actions → Deploy to GitHub Pages → Run workflow). It sets `OPEN_SLIDE_BASE` to the Pages base path
(`/presentations/`), which `open-slide.config.ts` passes to `base`, and adds a `404.html` so deep links such as
`/presentations/s/opentide` load. One-time setup: Settings → Pages → Source: **GitHub Actions**.

The inspector in `pnpm dev` lets you comment on an element; the `apply-comments` skill turns those comments
into edits.

## Access

`opentidehq/presentations` is private to the two opentidehq owners. Exports in `exports/` are what we share
outside; PPTX exports stay out of git.
