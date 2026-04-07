# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Docs-First Rule

**Before generating any code, Claude Code MUST first consult the relevant documentation files in the `/docs` directory.** This applies to all code generation, feature implementation, and architectural decisions. Check `/docs` for existing specifications, design decisions, or constraints that apply to the task at hand before writing any code.

- /docs/ui.md

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

No test framework is configured yet.

## Git Workflow

- **Commit regularly** after meaningful changes. Use concise, imperative commit messages (e.g. `feat: add workout list page`, `fix: correct set weight calculation`).
- **Push after each commit** to keep the remote in sync: `git push`
- Remote: `https://github.com/degumeh/lifting-diary-course` (branch: `main`)
- Prefix commit messages with a type: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`

## Architecture

This is a Next.js 16 app using the App Router (`src/app/`), React 19, TypeScript, and Tailwind CSS v4.

- `src/app/layout.tsx` — Root layout with Geist font setup and global CSS
- `src/app/page.tsx` — Home page (currently the default Next.js starter template)
- `src/app/globals.css` — Global styles (Tailwind base)

Tailwind is configured via PostCSS (`postcss.config.mjs`). No custom Tailwind config file — v4 uses CSS-based configuration.
