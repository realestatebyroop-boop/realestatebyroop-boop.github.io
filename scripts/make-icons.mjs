// Generates favicons, app icons and the social share image from the supplied logo files.
import sharp from 'sharp';
import fs from 'node:fs/promises';

const icon = await fs.readFile('public/brand/aksh-icon.svg');
await fs.copyFile('public/brand/aksh-icon.svg', 'public/favicon.svg');

const make = async (size, name, pad = 0.08, bg = '#ffffff') => {
  const inner = Math.round(size * (1 - pad * 2));
  const art = await sharp(icon, { density: 600 })
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: art, gravity: 'center' }])
    .png().toFile(`public/${name}`);
};
await make(16, 'favicon-16.png', 0.03);
await make(32, 'favicon-32.png', 0.04);
await make(180, 'apple-touch-icon.png');
await make(192, 'icon-192.png');
await make(512, 'icon-512.png');

await fs.writeFile('public/site.webmanifest', JSON.stringify({
  name: 'Aksh Construction', short_name: 'Aksh', start_url: '/', display: 'browser',
  background_color: '#ffffff', theme_color: '#1A2F3A',
  icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }],
}));

// 1200x630 share image: navy panel, white logo, a project photo.
const logo = await sharp(await fs.readFile('public/brand/aksh-logo-full-white.svg'), { density: 300 }).resize({ width: 460 }).png().toBuffer();
const photo = await sharp('src/content/projects/surrey-spec-home-6795/01.jpg').resize(600, 630, { fit: 'cover' }).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#1A2F3A' } })
  .composite([{ input: photo, left: 600, top: 0 }, { input: logo, left: 70, top: 245 }])
  .jpeg({ quality: 86 }).toFile('public/og-image.jpg');
