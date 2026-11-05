import { getCollection } from 'astro:content';

export async function getRedirects() {
  const all = await getCollection('projects');
  const list = [
    { from: 'residential-homes', to: '/projects/?type=residential' },
    { from: 'commercial-projects', to: '/projects/?type=commercial' },
    { from: 'projects-1', to: '/projects/' },
    { from: 'cart', to: '/' },
  ];
  for (const p of all) {
    if (!p.data.oldUrl) continue;
    // Hidden projects have no page yet, so their old URL lands on the project list.
    list.push({ from: p.data.oldUrl.replace(/^\//, ''), to: p.data.draft ? '/projects/' : `/projects/${p.id}/` });
  }
  return list;
}
