# Data Mutations

## CRITICAL: Server Actions Only

**ALL data mutations in this app MUST be done exclusively via Next.js Server Actions.**

Do NOT mutate data via:
- Route handlers (`app/api/`)
- Client-side `fetch` calls
- Direct database calls from components
- Any other mechanism

The only correct pattern is: **Server Action → data helper function → database.**

## Data Helper Functions

All database mutations MUST go through helper functions located in the `src/data/` directory.

Rules:
- Every mutation must use **Drizzle ORM**. Raw SQL (`db.execute`, template literals, etc.) is forbidden.
- Helper functions must accept a `userId` parameter and always scope mutations to that `userId`.
- A logged-in user must ONLY be able to mutate their own data. Never insert, update, or delete without a `userId` filter — this is a hard security requirement.

### Example pattern

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function createWorkout(userId: string, date: Date) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, date })
    .returning();
  return workout;
}

export async function deleteWorkout(userId: string, workoutId: string) {
  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

## Server Actions

All server actions MUST live in colocated `actions.ts` files next to the route or component that uses them (e.g. `src/app/dashboard/actions.ts`).

Rules:
- Every file containing server actions MUST have `"use server"` at the top.
- Action parameters MUST be explicitly typed — never use `FormData` as a parameter type.
- Every action MUST validate its arguments with **Zod** before doing anything else.
- Actions call `src/data/` helpers for the actual DB work — they do not call Drizzle directly.
- Actions must retrieve the current user from the session and pass `userId` to data helpers. Never trust a `userId` coming from the client.

### Example pattern

```ts
// src/app/dashboard/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { createWorkout } from "@/data/workouts";

const CreateWorkoutSchema = z.object({
  date: z.coerce.date(),
});

export async function createWorkoutAction(params: { date: Date }) {
  const parsed = CreateWorkoutSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error("Invalid arguments");
  }

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return createWorkout(session.user.id, parsed.data.date);
}
```

## Redirects

**Do NOT call `redirect()` inside server actions.** Next.js's `redirect()` throws internally and can cause unexpected behavior when called from a server action.

Instead, return a value from the server action and handle the redirect on the client side after the action resolves:

```ts
// actions.ts
export async function createWorkoutAction(params: { name: string }) {
  // ... validate, auth, mutate ...
  return workout; // return data, not redirect
}
```

```tsx
// ClientComponent.tsx
async function onSubmit(values: FormValues) {
  await createWorkoutAction(values);
  router.push("/dashboard"); // redirect client-side using useRouter
}
```

## Summary

| Requirement | Rule |
|---|---|
| Where to mutate data | Server Actions only |
| Where server actions live | Colocated `actions.ts` files |
| How to write DB mutations | Drizzle ORM via `src/data/` helpers |
| Raw SQL | Never |
| Action parameter types | Explicit TypeScript types — never `FormData` |
| Argument validation | Zod — always, before any other logic |
| User data isolation | Always scope by `userId` from the session — no exceptions |
| Redirects | Never use `redirect()` in server actions — redirect client-side after the action resolves |
