import { db } from "@/db";
import { workouts, workoutExercises, exercises, sets } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";

export async function createWorkout(userId: string, name: string) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, startedAt: new Date() })
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

export async function getWorkoutsForUserOnDate(userId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

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
        gte(workouts.createdAt, startOfDay),
        lt(workouts.createdAt, endOfDay)
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
