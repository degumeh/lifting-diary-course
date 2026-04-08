import { db } from "@/db";
import { workouts, workoutExercises, exercises, sets } from "@/db/schema";
import { eq, and, gte, lt, count, max } from "drizzle-orm";

export async function createWorkout(userId: string, name: string, startedAt?: Date) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, startedAt: startedAt ?? new Date() })
    .returning();
  return workout;
}

export async function getWorkoutById(userId: string, workoutId: string) {
  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutName: workouts.name,
      workoutStartedAt: workouts.startedAt,
      workoutExerciseId: workoutExercises.id,
      exerciseName: exercises.name,
      exerciseOrder: workoutExercises.order,
      setId: sets.id,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weight: sets.weight,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .orderBy(workoutExercises.order, sets.setNumber);

  if (rows.length === 0) return null;

  const exerciseMap = new Map<
    string,
    {
      id: string;
      name: string;
      order: number;
      sets: { id: string; setNumber: number; reps: number | null; weight: string | null }[];
    }
  >();

  for (const row of rows) {
    if (row.workoutExerciseId && row.exerciseName) {
      if (!exerciseMap.has(row.workoutExerciseId)) {
        exerciseMap.set(row.workoutExerciseId, {
          id: row.workoutExerciseId,
          name: row.exerciseName,
          order: row.exerciseOrder ?? 0,
          sets: [],
        });
      }
      const exercise = exerciseMap.get(row.workoutExerciseId)!;
      if (row.setId) {
        exercise.sets.push({
          id: row.setId,
          setNumber: row.setNumber!,
          reps: row.reps,
          weight: row.weight,
        });
      }
    }
  }

  const first = rows[0];
  return {
    id: first.workoutId,
    name: first.workoutName,
    startedAt: first.workoutStartedAt,
    exercises: Array.from(exerciseMap.values()),
  };
}

export async function updateWorkout(
  userId: string,
  workoutId: string,
  data: { name: string; startedAt: Date | null }
) {
  const [workout] = await db
    .update(workouts)
    .set({ name: data.name, startedAt: data.startedAt })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();
  return workout;
}

export async function addExerciseToWorkout(userId: string, workoutId: string, exerciseId: string) {
  // Verify ownership
  const workout = await db.select({ id: workouts.id }).from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .limit(1);
  if (workout.length === 0) throw new Error("Workout not found");

  // Get next order
  const [{ maxOrder }] = await db
    .select({ maxOrder: max(workoutExercises.order) })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));
  const nextOrder = (maxOrder ?? -1) + 1;

  const [newWE] = await db
    .insert(workoutExercises)
    .values({ workoutId, exerciseId, order: nextOrder })
    .returning();

  const [exercise] = await db
    .select({ id: exercises.id, name: exercises.name })
    .from(exercises)
    .where(eq(exercises.id, exerciseId));

  return { id: newWE.id, exerciseId: newWE.exerciseId, order: newWE.order, name: exercise.name, sets: [] as { id: string; setNumber: number; reps: number | null; weight: string | null }[] };
}

export async function removeExerciseFromWorkout(userId: string, workoutExerciseId: string) {
  // Only delete if the parent workout belongs to userId
  const owned = await db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(and(eq(workoutExercises.id, workoutExerciseId), eq(workouts.userId, userId)))
    .limit(1);
  if (owned.length === 0) throw new Error("Not found");

  await db.delete(workoutExercises).where(eq(workoutExercises.id, workoutExerciseId));
}

export async function addSet(
  userId: string,
  workoutExerciseId: string,
  reps: number | null,
  weight: string | null
) {
  // Verify ownership
  const owned = await db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(and(eq(workoutExercises.id, workoutExerciseId), eq(workouts.userId, userId)))
    .limit(1);
  if (owned.length === 0) throw new Error("Not found");

  const [{ setCount }] = await db
    .select({ setCount: count() })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId));
  const setNumber = setCount + 1;

  const [newSet] = await db
    .insert(sets)
    .values({ workoutExerciseId, setNumber, reps, weight })
    .returning();
  return newSet;
}

export async function removeSet(userId: string, setId: string) {
  // Verify ownership through workout_exercises → workouts
  const owned = await db
    .select({ id: sets.id })
    .from(sets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(and(eq(sets.id, setId), eq(workouts.userId, userId)))
    .limit(1);
  if (owned.length === 0) throw new Error("Not found");

  await db.delete(sets).where(eq(sets.id, setId));
}

export async function getWorkoutsForUserOnDate(userId: string, dateIso: string) {
  // Parse as UTC so server timezone never affects the day boundary
  const startOfDay = new Date(`${dateIso}T00:00:00.000Z`);
  const endOfDay = new Date(`${dateIso}T23:59:59.999Z`);

  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutName: workouts.name,
      workoutStartedAt: workouts.startedAt,
      workoutExerciseId: workoutExercises.id,
      exerciseName: exercises.name,
      exerciseOrder: workoutExercises.order,
      setId: sets.id,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weight: sets.weight,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, startOfDay),
        lt(workouts.startedAt, endOfDay)
      )
    )
    .orderBy(workoutExercises.order, sets.setNumber);

  // Group flat rows into nested structure
  const workoutMap = new Map<
    string,
    {
      id: string;
      name: string;
      startedAt: Date | null;
      exercises: Map<
        string,
        {
          id: string;
          name: string;
          order: number;
          sets: { id: string; setNumber: number; reps: number | null; weight: string | null }[];
        }
      >;
    }
  >();

  for (const row of rows) {
    if (!workoutMap.has(row.workoutId)) {
      workoutMap.set(row.workoutId, {
        id: row.workoutId,
        name: row.workoutName,
        startedAt: row.workoutStartedAt,
        exercises: new Map(),
      });
    }

    const workout = workoutMap.get(row.workoutId)!;

    if (row.workoutExerciseId && row.exerciseName) {
      if (!workout.exercises.has(row.workoutExerciseId)) {
        workout.exercises.set(row.workoutExerciseId, {
          id: row.workoutExerciseId,
          name: row.exerciseName,
          order: row.exerciseOrder ?? 0,
          sets: [],
        });
      }

      const exercise = workout.exercises.get(row.workoutExerciseId)!;

      if (row.setId) {
        exercise.sets.push({
          id: row.setId,
          setNumber: row.setNumber!,
          reps: row.reps,
          weight: row.weight,
        });
      }
    }
  }

  return Array.from(workoutMap.values()).map((w) => ({
    ...w,
    exercises: Array.from(w.exercises.values()),
  }));
}
