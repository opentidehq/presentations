#!/usr/bin/env node
// Screenshot every page of a deck at 1920×1080 through the dev server's
// chrome-less preview route, for visual review (by you or an agent).
//
//   pnpm shots <deck-id> [first] [last]      → .shots/<deck-id>/pNN.png
//
// Needs `pnpm dev` running (reads node_modules/.open-slide/server.json).
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const [deck, first, last] = process.argv.slice(2);
if (!deck) {
  console.error('usage: pnpm shots <deck-id> [first-page] [last-page]');
  process.exit(2);
}
const serverFile = join('node_modules', '.open-slide', 'server.json');
if (!existsSync(serverFile)) {
  console.error('dev server is not running: start it with `pnpm dev` first');
  process.exit(1);
}
const base = JSON.parse(readFileSync(serverFile, 'utf8')).url.replace(/\/$/, '');
const out = join('.shots', deck);
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
let failed = 0;
for (let p = Number(first ?? 1); ; p++) {
  if (last && p > Number(last)) break;
  await page.goto(`${base}/s/${deck}/preview?p=${p}`);
  await page.waitForSelector('[data-osd-preview="ready"],[data-osd-preview="error"]', { timeout: 30_000 });
  if ((await page.getAttribute('[data-osd-preview]', 'data-osd-preview')) === 'error') {
    const msg = (await page.textContent('[data-osd-preview-error]').catch(() => '')) ?? '';
    if (!last && /out of range/i.test(msg)) break; // ran past the last page
    console.error(`p${p}: ${msg}`);
    failed++;
    continue;
  }
  const file = join(out, `p${String(p).padStart(2, '0')}.png`);
  await page.screenshot({ path: file });
  console.log(file);
}
await browser.close();
process.exit(failed ? 1 : 0);
