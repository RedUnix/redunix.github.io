import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: "./src/content/blog" }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
        category: z.string().default('Uncategorized'),
        tags: z.array(z.string()).optional(),
        draft: z.boolean().default(false),
        coverImage: z.string().optional(),
        readTime: z.string().optional(),
        excerpt: z.string().optional(),
	}),
});

const resources = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: "./src/content/resources" }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
        topic: z.string(),
        type: z.enum(['Article', 'Resource', 'Audio', 'Video', 'Note']),
        link: z.string().url().optional(),
        audioUrl: z.string().url().optional(),
        comment: z.string().optional(),
        duration: z.string().optional(),
        domain: z.string().optional(),
        'quick-access': z.enum(['yes', 'no']).optional(),
	}),
});

const media = defineCollection({
    loader: glob({ pattern: '**/*.md', base: "./src/content/media" }),
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        videos: z.array(z.object({
            title: z.string(),
            url: z.string().url(),
            channel: z.string().optional(),
            platform: z.string().optional(),
            added: z.coerce.date().optional(),
            note: z.string().optional(),
        })).optional(),
        channels: z.array(z.object({
            name: z.string(),
            channelId: z.string(),
            url: z.string().url(),
            note: z.string().optional(),
        })).optional(),
        playlists: z.array(z.object({
            name: z.string(),
            playlistId: z.string().optional(),
            url: z.string().url(),
            note: z.string().optional(),
        })).optional(),
    }),
});

export const collections = { blog, resources, media };
