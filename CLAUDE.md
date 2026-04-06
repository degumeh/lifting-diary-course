# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

No test framework is configured yet.

## Architecture

This is a Next.js 16 app using the App Router (`src/app/`), React 19, TypeScript, and Tailwind CSS v4.

- `src/app/layout.tsx` — Root layout with Geist font setup and global CSS
- `src/app/page.tsx` — Home page (currently the default Next.js starter template)
- `src/app/globals.css` — Global styles (Tailwind base)

Tailwind is configured via PostCSS (`postcss.config.mjs`). No custom Tailwind config file — v4 uses CSS-based configuration.
