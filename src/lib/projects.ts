import { getCollection, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';

export type Project = CollectionEntry<'projects'>;

const files = import.meta.glob<{ default: ImageMetadata }>(
  '/src/content/projects/*/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
  { eager: true },
);

export async function getProjects(): Promise<Project[]> {
  const all = await getCollection('projects', ({ data }) => !data.draft);
  return all.sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id));
}

export function getPhotos(p: Project) {
  const prefix = `/src/content/projects/${p.id}/`;
  return Object.keys(files)
    .filter((k) => k.startsWith(prefix))
    .sort()
    .map((k, i) => ({ name: k.slice(prefix.length), src: files[k].default, alt: photoAlt(p, i) }));
}

export function getHero(p: Project) {
  const photos = getPhotos(p);
  const hero = photos.find((x) => x.name === p.data.hero) ?? photos[0];
  if (!hero) throw new Error(`Project ${p.id} has no photos`);
  return hero;
}

export const city = (p: Project) => p.data.location.split(',')[0];
export const sqft = (p: Project) => (p.data.sqft ? `${p.data.sqft.toLocaleString('en-CA')} sq ft` : '');

function photoAlt(p: Project, i: number) {
  const label = p.data.alts?.[i];
  if (p.data.category === 'commercial') {
    return label ?? `${p.data.title}, ${p.data.type.toLowerCase()} by Aksh Construction`;
  }
  const kind = /custom/i.test(p.data.type) ? 'custom' : 'spec';
  return `${label ?? 'Photo'} of a ${kind} home in ${city(p)} built by Aksh Construction`;
}

/** "8 bed · 8 bath · 6,714 sq ft" for homes, the scope list for commercial work. */
export function cardDetail(p: Project) {
  const d = p.data;
  if (d.category === 'residential') {
    return [d.bedrooms && `${d.bedrooms} bed`, d.bathrooms && `${d.bathrooms} bath`, sqft(p)].filter(Boolean).join(' · ');
  }
  return d.scope.join(', ');
}
