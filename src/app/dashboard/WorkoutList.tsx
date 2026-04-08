"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { WorkoutCard } from "./WorkoutCard";

type Workout = {
  id: string;
  name: string;
  startedAt: Date | null;
  exercises: {
    id: string;
    name: string;
    order: number;
    sets: { id: string; setNumber: number; reps: number | null; weight: string | null }[];
  }[];
};

export function WorkoutList({ initialWorkouts }: { initialWorkouts: Workout[] }) {
  const [workouts, setWorkouts] = useState(initialWorkouts);

  function handleDelete(workoutId: string) {
    setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
  }

  if (workouts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 flex flex-col items-center gap-4 text-center text-muted-foreground">
          <p>No workouts logged for this date.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {workouts.map((workout) => (
        <WorkoutCard key={workout.id} workout={workout} onDelete={handleDelete} />
      ))}
    </div>
  );
}
