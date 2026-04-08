# Data Fetching

## CRITICAL: Server Components Only

**ALL data fetching in this app MUST be done exclusively via React Server Components.**

Do NOT fetch data via:
- Route handlers (`app/api/`)
- Client components (`"use client"`)
- `useEffect` + `fetch`
- SWR, React Query, or any client-side fetching library
- Any other mechanism

The only correct pattern is: **Server Component → data helper function → database.**

## Data Helper Functions

All database queries MUST go through helper functions located in the `src/data/` directory.

Rules:
- Every query must use **Drizzle ORM**. Raw SQL (`db.execute`, template literals, etc.) is forbidden.
- Helper functions must accept a `userId` parameter and always filter queries by that `userId`.
- A logged-in user must ONLY be able to access their own data. Never query without a `userId` filter — this is a hard security requirement.

### Example pattern

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

```tsx
// src/app/dashboard/page.tsx  ← Server Component (no "use client")
import { getWorkoutsForUser } from "@/data/workouts";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  const workouts = await getWorkoutsForUser(session.user.id);
  // render...
}
```

## Summary

| Requirement | Rule |
|---|---|
| Where to fetch data | Server Components only |
| How to query the DB | Drizzle ORM via `src/data/` helpers |
| Raw SQL | Never |
| User data isolation | Always filter by `userId` — no exceptions |
