import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Only real content pages go in the sitemap (no thank-you, 404 or old-URL redirects).
const indexable = /^https:\/\/www\.akshconstruction\.com\/(services\/|projects\/([^/]+\/)?|about\/|contact\/)?$/;

// Astro copies every imported photo into the build, even ones no page uses.
// Delete those, so photos from draft projects and full-size originals are never published.
const pruneUnusedImages = () => ({
  name: 'prune-unused-images',
  hooks: {
    'astro:build:done': async ({ dir, logger }) => {
      const root = fileURLToPath(dir);
      const files = await fs.readdir(root, { recursive: true });
      let text = '';
      for (const f of files) {
        if (/\.(html|css|js|xml|webmanifest)$/.test(f)) text += await fs.readFile(path.join(root, f), 'utf8');
      }
      const assets = await fs.readdir(path.join(root, '_astro'));
      let removed = 0;
      for (const f of assets) {
        if (/\.(jpe?g|png|webp|avif)$/i.test(f) && !text.includes(f)) {
          await fs.unlink(path.join(root, '_astro', f));
          removed++;
        }
      }
      logger.info(`Removed ${removed} unreferenced images`);
    },
  },
});

export default defineConfig({
  site: 'https://www.akshconstruction.com',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => indexable.test(page) }), pruneUnusedImages()],
});
