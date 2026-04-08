"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { deleteWorkout } from "@/data/workouts";

const DeleteWorkoutSchema = z.object({ workoutId: z.string().min(1) });

export async function deleteWorkoutAction(params: { workoutId: string }) {
  const parsed = DeleteWorkoutSchema.safeParse(params);
  if (!parsed.success) throw new Error("Invalid arguments");
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  await deleteWorkout(userId, parsed.data.workoutId);
}
