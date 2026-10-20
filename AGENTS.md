# opentidehq/presentations — Agent Guide

You are authoring **opentide slides** in this repo, with [open-slide](https://open-slide.dev). Every slide is arbitrary React code that you write. Decks live side by side under `slides/`; each one is self-contained.

## Hard rules

- Put your slide under `slides/<kebab-case-id>/`.
- The entry is `slides/<id>/index.tsx`.
- Put slide-specific images/videos/fonts under `slides/<id>/assets/`. For assets reused across decks or themes (logos, avatars), use the global `assets/` folder and import via `@assets/...`.
- Do **not** touch `package.json`, `open-slide.config.ts`, `scripts/`, or decks other than the one you were asked to change.
- Do not add dependencies. Use only `react` and standard web APIs.

## Which skill to use

- **Anything opentide** (every deck here) — read the `opentide-deck` skill first: brand register, messaging, where facts and real CLI output come from, which deck to copy components from, and the review/export loop. It sits on top of the open-slide skills below and wins on brand and content.
- **Drafting a new deck** — use the `create-slide` skill. It walks through scoping questions, structure, and hand-off.
- **Applying inspector comments** (`@slide-comment` markers in a page) — use the `apply-comments` skill.
- **Creating or extracting a theme** — use the `create-theme` skill. Themes live as markdown under `themes/<id>.md` and are read by `create-slide` before authoring.
- **Resolving "this page" / "this element"** — when the user references the current slide or selection without naming it, consult the `current-slide` skill. It reads the dev server's `node_modules/.open-slide/current.json` to find which slide, page, and inspector-picked element they mean.
- **Writing a speech script / speaker notes** — use the framework's built-in feature: the `notes` export in the slide's `index.tsx`, index-aligned with the page array and shown in the presenter view. See the **Speaker notes** section of the `slide-authoring` skill. Never deliver a script as a markdown or text file.
- **Any other slide edit** — read the `slide-authoring` skill before writing. It is the technical reference for everything inside `slides/<id>/`: file contract, the 1920×1080 canvas, type scale, palette, layout, assets, self-review checklist, and anti-patterns. `create-slide` and `apply-comments` both defer to it for the *how*.

Keep this file short: hard rules only. All deeper guidance lives in the skills above.

## Commands

```
pnpm dev                       # http://localhost:5173
pnpm typecheck
pnpm shots <deck-id>           # every page → .shots/<deck-id>/pNN.png (dev server running)
pnpm export:pdf <deck-id>      # → exports/<deck-id>.pdf (dev server running)
pnpm lab                       # throwaway opentide repo in .lab/soc for real CLI output
```

## Updating skills

The open-slide skills above are managed by `@open-slide/core` (`opentide-deck` is ours and is left alone by the sync). Do not edit them in place. To pull the latest versions:

```
pnpm up @open-slide/core
pnpm sync:skills
```

`pnpm dev` will also detect drift on startup and offer to sync. `pnpm sync:skills --dry-run` (via `pnpm exec open-slide sync:skills --dry-run`) previews changes without writing.
