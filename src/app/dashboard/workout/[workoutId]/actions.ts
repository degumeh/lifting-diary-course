"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { updateWorkout, addExerciseToWorkout, removeExerciseFromWorkout, addSet, removeSet } from "@/data/workouts";

const UpdateWorkoutSchema = z.object({
  workoutId: z.string().min(1),
  name: z.string().min(1, "Workout name is required"),
  startedAt: z.coerce.date().optional(),
});

export async function updateWorkoutAction(params: { workoutId: string; name: string; startedAt?: Date }) {
  const parsed = UpdateWorkoutSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error("Invalid arguments");
  }

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const updated = await updateWorkout(userId, parsed.data.workoutId, { name: parsed.data.name, startedAt: parsed.data.startedAt ?? null });
  if (!updated) {
    throw new Error("Workout not found");
  }

  return updated;
}

const AddExerciseSchema = z.object({
  workoutId: z.string().min(1),
  exerciseId: z.string().min(1),
});

export async function addExerciseToWorkoutAction(params: { workoutId: string; exerciseId: string }) {
  const parsed = AddExerciseSchema.safeParse(params);
  if (!parsed.success) throw new Error("Invalid arguments");
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return addExerciseToWorkout(userId, parsed.data.workoutId, parsed.data.exerciseId);
}

const RemoveExerciseSchema = z.object({
  workoutExerciseId: z.string().min(1),
});

export async function removeExerciseFromWorkoutAction(params: { workoutExerciseId: string }) {
  const parsed = RemoveExerciseSchema.safeParse(params);
  if (!parsed.success) throw new Error("Invalid arguments");
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  await removeExerciseFromWorkout(userId, parsed.data.workoutExerciseId);
}

const AddSetSchema = z.object({
  workoutExerciseId: z.string().min(1),
  reps: z.number().int().positive().optional(),
  weight: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
});

export async function addSetAction(params: { workoutExerciseId: string; reps?: number; weight?: string }) {
  const parsed = AddSetSchema.safeParse(params);
  if (!parsed.success) throw new Error("Invalid arguments");
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return addSet(userId, parsed.data.workoutExerciseId, parsed.data.reps ?? null, parsed.data.weight ?? null);
}

const RemoveSetSchema = z.object({
  setId: z.string().min(1),
});

export async function removeSetAction(params: { setId: string }) {
  const parsed = RemoveSetSchema.safeParse(params);
  if (!parsed.success) throw new Error("Invalid arguments");
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  await removeSet(userId, parsed.data.setId);
}
