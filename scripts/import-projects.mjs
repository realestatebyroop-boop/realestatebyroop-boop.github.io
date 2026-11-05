// One-time import: reads projects-import.json, downloads every photo at the
// largest size, strips metadata, renames to 01.jpg, 02.jpg, and writes index.md.
// Safe to re-run: photos already on disk are skipped and index.md is left alone.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const data = JSON.parse(await fs.readFile('projects-import.json', 'utf8'));
const extraImages = JSON.parse(await fs.readFile('scripts/extra-images.json', 'utf8'));
const FEATURED = new Set(['f45-new-westminster', 'surrey-spec-home-6714', 'surrey-custom-home-5894', 'surrey-spec-home-6795']);
const DRAFT = new Set(['surrey-custom-home-6279']);
const failures = [];

async function download(url, dest) {
  try { await fs.access(dest); return 'skip'; } catch {}
  const clean = url.replace(/^http:/, 'https:');
  const res = await fetch(`${clean}?format=2500w`, { headers: { 'User-Agent': 'Mozilla/5.0 aksh-site-import' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  // rotate() applies EXIF orientation; sharp drops all metadata (GPS included) by default.
  await sharp(buf).rotate().jpeg({ quality: 88, mozjpeg: true }).toFile(dest);
  return 'ok';
}

const pad = (n) => String(n).padStart(2, '0');
let order = 10;
for (const p of data.projects) {
  const dir = path.join('src/content/projects', p.slug);
  await fs.mkdir(dir, { recursive: true });
  const images = extraImages[p.slug] ?? p.images;
  let ok = 0;
  for (const [i, url] of images.entries()) {
    try { await download(url, path.join(dir, `${pad(i + 1)}.jpg`)); ok++; }
    catch (e) { failures.push(`${p.slug} image ${i + 1}: ${e.message}`); }
  }
  console.log(`${p.slug}: ${ok}/${images.length}`);
  const md = path.join(dir, 'index.md');
  const y = ['---', `title: ${JSON.stringify(p.title)}`, `category: ${p.category}`, `type: ${p.type}`, `location: ${p.location}`];
  if (p.bedrooms) y.push(`bedrooms: ${p.bedrooms}`);
  if (p.bathrooms) y.push(`bathrooms: ${p.bathrooms}`);
  if (p.sqft) y.push(`sqft: ${p.sqft}`);
  if (p.year) y.push(`year: ${p.year}`);
  y.push(`scope: ${JSON.stringify(p.scope)}`);
  if (FEATURED.has(p.slug)) y.push('featured: true');
  y.push(`order: ${order}`, 'hero: 01.jpg', `draft: ${DRAFT.has(p.slug)}`, `oldUrl: ${p.oldUrl}`, '---', '');
  order += 10;
  try { await fs.access(md); } catch { await fs.writeFile(md, y.join('\n')); }
}

const siteDir = 'src/assets/site';
for (const [name, url] of Object.entries(data.siteImages)) {
  if (name.startsWith('_')) continue;
  try { await download(url, path.join(siteDir, `${name}.jpg`)); console.log(`site/${name}: ok`); }
  catch (e) { failures.push(`site/${name}: ${e.message}`); }
}
console.log(failures.length ? `\nFAILED:\n${failures.join('\n')}` : '\nNo failures.');
