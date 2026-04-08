"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkout } from "@/data/workouts";

const CreateWorkoutSchema = z.object({
  name: z.string().min(1, "Workout name is required"),
  startedAt: z.coerce.date().optional(),
});

export async function createWorkoutAction(params: { name: string; startedAt?: Date }) {
  const parsed = CreateWorkoutSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error("Invalid arguments");
  }

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  return createWorkout(userId, parsed.data.name, parsed.data.startedAt);
}
