// content.config.ts — root project
// Konfigurasi @nuxt/content untuk JuruTani
// Docs: https://content.nuxt.com/docs/getting-started/installation

import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    // Koleksi artikel/berita
    articles: defineCollection({
      type: 'page',
      source: 'articles/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.string().optional(),
        category: z.string().optional(),
        image: z.string().optional(),
        published: z.boolean().default(true),
      }),
    }),

    // Koleksi halaman statis (about, privacy, dll.)
    pages: defineCollection({
      type: 'page',
      source: 'pages/**/*.md',
    }),
  },
})
