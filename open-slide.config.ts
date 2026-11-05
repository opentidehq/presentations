import type { OpenSlideConfig } from '@open-slide/core';

// GitHub Pages serves this repo under /<repo>/; the Pages workflow sets OPEN_SLIDE_BASE.
// Local dev, Netlify and Vercel keep the root base.
const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};

const openSlideConfig: OpenSlideConfig = {
  base: env.OPEN_SLIDE_BASE || '/',
};

export default openSlideConfig;
