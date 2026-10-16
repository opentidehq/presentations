#!/usr/bin/env node
// Export a deck to a vector PDF, one 1920×1080 page per slide page.
// The ASCII tide prints as its still frame, like thumbnails do.
//
//   pnpm export:pdf <deck-id>                 → exports/<deck-id>.pdf
//
// Needs `pnpm dev` running. The in-app export (Cmd/Ctrl+K → Export as PDF)
// gives the same result interactively.
import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const deck = process.argv[2];
if (!deck) {
  console.error('usage: pnpm export:pdf <deck-id>');
  process.exit(2);
}
const serverFile = join('node_modules', '.open-slide', 'server.json');
if (!existsSync(serverFile)) {
  console.error('dev server is not running: start it with `pnpm dev` first');
  process.exit(1);
}
const base = JSON.parse(readFileSync(serverFile, 'utf8')).url.replace(/\/$/, '');

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
await page.emulateMedia({ reducedMotion: 'reduce' });
const merged = await PDFDocument.create();
for (let p = 1; ; p++) {
  await page.goto(`${base}/s/${deck}/preview?p=${p}`);
  await page.waitForSelector('[data-osd-preview="ready"],[data-osd-preview="error"]', { timeout: 30_000 });
  if ((await page.getAttribute('[data-osd-preview]', 'data-osd-preview')) === 'error') {
    const msg = (await page.textContent('[data-osd-preview-error]').catch(() => '')) ?? '';
    if (p > 1 && /out of range/i.test(msg)) break;
    console.error(`p${p}: ${msg}`);
    process.exit(1);
  }
  const bytes = await page.pdf({ width: '1920px', height: '1080px', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  const doc = await PDFDocument.load(bytes);
  const [copied] = await merged.copyPages(doc, [0]);
  merged.addPage(copied);
  process.stdout.write(`\rp${p}`);
}
await browser.close();
mkdirSync('exports', { recursive: true });
const out = join('exports', `${deck}.pdf`);
writeFileSync(out, await merged.save());
console.log(`\n${out} (${merged.getPageCount()} pages)`);
