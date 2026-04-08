"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { updateWorkout } from "@/data/workouts";

const UpdateWorkoutSchema = z.object({
  name: z.string().min(1, "Workout name is required"),
  startedAt: z.coerce.date().nullable(),
});

export async function updateWorkoutAction(
  workoutId: string,
  params: { name: string; startedAt: Date | null }
) {
  const parsed = UpdateWorkoutSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error("Invalid arguments");
  }

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  return updateWorkout(userId, workoutId, parsed.data);
}
