# Auth Coding Standards

## Provider

**This app uses [Clerk](https://clerk.com) for all authentication.** Do not implement custom auth, use NextAuth, or introduce any other auth library.

## Setup

`ClerkProvider` wraps the entire app in `src/app/layout.tsx`. It must remain at the root layout level — do not move or re-wrap it in nested layouts.

`clerkMiddleware` is configured in `src/middleware.ts` and runs on all routes (excluding static assets). This is what enforces session validation at the edge.

## Accessing the Current User

### Server Components and Route Handlers

Use `auth()` from `@clerk/nextjs/server`:

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
```

- `userId` is `null` when the user is not signed in. Always handle the `null` case.
- Do not pass `userId` down as a prop from a layout — call `auth()` directly in the Server Component that needs it.

### Client Components

Use the `useUser` or `useAuth` hooks from `@clerk/nextjs`:

```ts
import { useUser } from "@clerk/nextjs";

const { user, isLoaded, isSignedIn } = useUser();
```

## UI Components

Use Clerk's pre-built components for all auth-related UI. Do not build custom sign-in/sign-up forms.

| Use case | Component |
|---|---|
| Sign-in button | `<SignInButton mode="modal">` |
| Sign-up button | `<SignUpButton mode="modal">` |
| User avatar / account menu | `<UserButton />` |
| Conditional rendering by auth state | `<Show when="signed-in">` / `<Show when="signed-out">` |

All imports come from `@clerk/nextjs`:

```ts
import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
```

## Route Protection

- The middleware in `src/middleware.ts` runs on all routes by default but does **not** redirect unauthenticated users on its own when using `clerkMiddleware()` without `auth().protect()`.
- To protect a specific Server Component route, call `auth().protect()` or check `userId` and redirect manually:

```ts
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const { userId } = await auth();
if (!userId) redirect("/");
```

## Environment Variables

Clerk requires these variables in `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

Do not hardcode keys. Do not commit `.env.local`.
