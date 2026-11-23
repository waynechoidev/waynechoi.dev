# WayneChoi.dev

Personal engineering blog built with Next.js and statically exported to GitHub Pages.

## Local development

Requires Node.js 24 and npm.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Writing a post

Add a Markdown file to `posts/` with validated frontmatter:

```yaml
---
title: "Post title"
date: "2026-11-23"
category: "graphics"
tags: ["webgpu", "graphics"]
excerpt: "A short description used in post cards and search metadata."
featured: false
---
```

Valid categories are `graphics`, `web`, `cs`, and `story`. Dates must use `YYYY-MM-DD`. Set `featured: true` to include a post on the home page.

Images belong in `public/img/` and can be referenced as `/img/example.png`. Fenced code blocks support JavaScript, TypeScript, HTML, C++, and GLSL highlighting. Inline `$...$` and block `$$...$$` expressions are rendered with KaTeX.

## Verification

```bash
npm run check
```

This runs ESLint, content tests, type checking, and the production static export. The same checks run in GitHub Actions before deployment.
