---
name: opentide-deck
description: House rules for opentide decks in this repo — brand register, messaging, how to source facts and real CLI output, which deck to copy components from, and how to review and export. Use whenever you create or edit any deck under slides/ in opentidehq/presentations, together with create-slide (new decks) and slide-authoring (the technical how). Triggers on "opentide deck", "workshop", "talk", "slides about opentide", or any edit to slides/opentide*.
---

# opentide decks

`create-slide` owns the workflow and `slide-authoring` owns the technical how. This skill adds what is specific to opentide decks. Where they disagree on brand or content, this skill wins.

## 1. Start from the theme and a sibling deck

- Theme: `themes/opentide-coastal.md`. Pick it in `create-slide` (it settles the aesthetic question) and set `theme: 'opentide-coastal'` in `meta`.
- Components: copy the infrastructure block (design, fonts, motion CSS, transitions, `TideMark`, `Icon`, `TopBar`, `Footer`, `Stage`, `Frame`, `H`, `Lead`, `M`, `Label`, `Chip`, `Code`, the ASCII tide, `Divider`, `CTerm`, the `D*` loop-diagram helpers) from **`slides/opentide-workshop/index.tsx`**, everything above the `Workshop patterns` banner. It is the smaller, newer copy of `slides/opentide/index.tsx`.
- Rename the style ids (`osd-fonts-<deck-id>`, `osd-motion-<deck-id>`) so decks never fight over one `<style>` tag.
- Replace the `Q_*` glyph strings with material from the new deck: the tide is made of real KQL, SPL, YAML and commands from that chapter.
- Workshop decks can reuse `Prompt` (a verbatim prompt card, "you → agent"), `Expect` (what the agent does + the call behind it), `ColHead` and `Note`.
- Shared brand files live in `assets/brand/` and `assets/fonts/`; import via `@assets/...`.

## 2. Brand

- Light register only: white pages, Pantone Reflex Blue `#001489` as the single accent, Inter + JetBrains Mono. Never yellow on white; no dark page backgrounds. Navy is allowed only inside terminal windows.
- Red and green only for a failed or passed result.
- Lowercase mono eyebrows, hairline tables, real artefacts (YAML, commands, JSON) instead of illustrations. No gradients, glass, emoji, icon-card grids, or uppercase tracked eyebrows.
- The ASCII tide appears on the cover, chapter dividers and the close only.

## 3. Messaging

- Position opentide as **spec-driven development for detection engineering**: an **ontology and a taxonomy** (threat → objective → rule, versioned vocabularies) behind an engine you pin.
- Lead with **threat alignment, maintainability, speed and quality**. The house close: "Agents write the queries. The spec keeps them aligned."
- Never use an "honesty" angle ("tools that never lie", "keeps them honest", "never fakes a pass").
- Do not pitch capability limits (deploy-only badges, "supported: false", stub tools) as values. Mention one only when an audience will hit it in practice, as a plain fact.

## 4. Facts

- Every content page names its source in the `Footer` (`opentide.org/docs/...`, a repo path, an issue, or "run against opentide X.Y.Z").
- Pin the opentide version the deck talks about and say it on the cover or footer. Check the latest with `curl -s https://pypi.org/pypi/opentide/json | jq -r .info.version`.
- Terminal output, JSON and file trees must come from a real run: `pnpm lab` builds a throwaway detection repo in `.lab/soc` with that pinned version (`OPENTIDE_VERSION=… pnpm lab` to change it). Trim output, never invent it; label invented examples "illustrative".
- Docs live at opentide.org and in the `opentidehq/opentide` repo under `docs/`; skills in `opentidehq/skills`; specs and RFCs in `opentidehq/specifications`.

## 5. Review and export

1. `pnpm dev`, then `pnpm shots <deck-id>` writes every page to `.shots/<deck-id>/pNN.png` at 1920×1080. Look at each one: overflow, wrapped mono tokens, empty halves of a page.
2. `pnpm typecheck` must pass.
3. Speaker notes for every page in `export const notes`.
4. `pnpm export:pdf <deck-id>` writes `exports/<deck-id>.pdf`. Commit the PDF when the deck is ready to share; PPTX exports stay out of git.
