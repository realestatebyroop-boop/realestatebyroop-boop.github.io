import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: './src/content/projects',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: z.object({
    title: z.string(),
    category: z.enum(['residential', 'commercial']),
    type: z.string(),
    location: z.string(),
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    sqft: z.number().optional(),
    year: z.number().optional(),
    scope: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    order: z.number().default(999),
    hero: z.string().default('01.jpg'),
    heroFit: z.enum(['cover', 'contain']).default('cover'),
    draft: z.boolean().default(false),
    oldUrl: z.string().optional(),
    alts: z.array(z.string()).optional(),
  }),
});

export const collections = { projects };
