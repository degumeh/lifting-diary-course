# UI Coding Standards

## Component Library

**Only shadcn/ui components may be used for UI in this project.**

- Do not create custom components. If a UI element is needed, find the appropriate shadcn/ui component and use it.
- Do not use raw HTML elements (e.g. `<button>`, `<input>`, `<dialog>`) where a shadcn/ui equivalent exists.
- Do not install or use any other component library (e.g. Radix primitives directly, Material UI, Headless UI, etc.).
- If a shadcn/ui component does not exist for a use case, compose existing shadcn/ui components together — do not build a custom one from scratch.

All shadcn/ui components live in `src/components/ui/`. Add new ones via the CLI:

```bash
npx shadcn@latest add <component-name>
```

## Date Formatting

All dates must be formatted using [date-fns](https://date-fns.org/). Do not use `Date.toLocaleDateString()`, `Intl.DateTimeFormat`, or any other date formatting method.

Dates must follow this format:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

Use `format` from `date-fns` with the `do MMM yyyy` format token:

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy"); // e.g. "1st Sep 2025"
```
