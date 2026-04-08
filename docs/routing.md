# Routing Coding Standards

## Route Structure

**All application routes must be nested under `/dashboard`.** There are no top-level app routes beyond the home page (`/`) and auth-related pages.

Example structure:
```
/                        → public home page
/dashboard               → main dashboard (protected)
/dashboard/workout       → workout list (protected)
/dashboard/workout/new   → new workout form (protected)
/dashboard/workout/[id]  → workout detail (protected)
```

## Route Protection

**All `/dashboard` routes are protected and require the user to be signed in.**

Route protection is implemented via Next.js middleware in `src/middleware.ts`. Do not replicate auth checks inside individual page components — the middleware is the single enforcement point for `/dashboard` access.

### Middleware Pattern

Use Clerk's `clerkMiddleware` with `createRouteMatcher` to protect all dashboard routes:

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jte?2|tff?|woff2?|ico|png|jpg|jpeg|gif|webp|svg)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

- `auth.protect()` automatically redirects unauthenticated users to the Clerk sign-in page.
- Do not use manual `if (!userId) redirect("/")` checks inside `/dashboard` page components — the middleware handles this.
- Do not call `auth().protect()` inside individual Server Components under `/dashboard` — it is redundant and should be avoided.

## Adding New Routes

- New pages that are part of the application (not marketing/public) go under `src/app/dashboard/`.
- New routes do not need any additional auth logic — the `/dashboard(.*)` middleware matcher covers them automatically.
- Public routes (e.g., a landing page or blog) live outside `/dashboard` and require no auth.
