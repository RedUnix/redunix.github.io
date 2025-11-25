# Technical Overview

## Architecture

This website is built with **Astro**, a static site generator that combines the best of static and dynamic web technologies. The site uses a hybrid approach with Astro components for static content and React components for interactive features.

## Tech Stack

- **Framework**: Astro 5.16.0
- **UI Framework**: React 19.2.0 (for interactive components)
- **Styling**: Tailwind CSS 3.4.18 with custom theme
- **Content**: Markdown/MDX with Astro Content Collections
- **Deployment**: GitHub Pages (static hosting)

## Content Management

The site uses **Astro Content Collections** to manage three types of content:

1. **Blog Posts** (`src/content/blog/`): Markdown/MDX files with frontmatter schema including title, date, category, tags, draft status, cover images, and excerpts
2. **Resources** (`src/content/resources/`): Curated links and media with metadata (type, topic, links, audio/video URLs)
3. **Media** (`src/content/media/`): Video playlists, channels, and favorites with structured data

Content is validated using Zod schemas defined in `content.config.ts`, ensuring type safety and consistent frontmatter structure.

## Routing System

Astro uses file-based routing:

- **Static pages**: Files in `src/pages/` automatically become routes (e.g., `index.astro` → `/`, `about.astro` → `/about`)
- **Dynamic routes**: Catch-all routes like `[...slug].astro` generate pages at build time using `getStaticPaths()`
  - Blog posts: `/blog/[slug]` generated from blog collection entries
  - Resources: `/resources/[slug]` generated from resources collection entries

## Build Process

1. **Content Collection Loading**: Astro scans content directories and validates against schemas
2. **Static Generation**: `getStaticPaths()` pre-generates all routes at build time
3. **Component Rendering**: Astro components render to static HTML; React components are hydrated only where needed (using `client:load` directive)
4. **Output**: Static HTML, CSS, and JavaScript files in `dist/` directory

## Key Features

- **Zero JavaScript by default**: Most pages ship as pure HTML/CSS, with React only for interactive components (terminal header, scanlines effect, media players)
- **Type-safe content**: TypeScript + Zod schemas ensure content integrity
- **MDX support**: Blog posts can include React components directly in markdown
- **RSS feed**: Auto-generated at `/rss.xml` using `@astrojs/rss`
- **Sitemap**: Auto-generated using `@astrojs/sitemap`
- **Terminal aesthetic**: Custom UI theme with terminal-inspired design, scanlines effect, and monospace typography

## Component Architecture

- **Layout Components**: `Layout.astro` provides the base terminal-style shell with header, footer, and navigation
- **Astro Components**: Static, server-rendered components for structure
- **React Components**: Interactive features like `TerminalHeader`, `MediaPlayer`, `Scanlines` (hydrated on client)
- **Styling**: Tailwind CSS with custom color variables and typography plugin for prose content

## Deployment

The site builds to static files and deploys to GitHub Pages via the `gh-pages` package. The build process:
1. Runs `npm run build` (generates `dist/` folder)
2. Deploys `dist/` contents to the `gh-pages` branch
3. GitHub Pages serves the static site from the repository

