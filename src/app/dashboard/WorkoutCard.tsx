"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteWorkoutAction } from "./actions";

type WorkoutCardProps = {
  workout: {
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
  onDelete: (workoutId: string) => void;
};

export function WorkoutCard({ workout, onDelete }: WorkoutCardProps) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDeleteClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => {
      await deleteWorkoutAction({ workoutId: workout.id });
      onDelete(workout.id);
    });
  }

  function handleCancelClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setConfirming(false);
  }

  return (
    <Link href={`/dashboard/workout/${workout.id}`}>
      <Card className="hover:bg-accent transition-colors cursor-pointer">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <CardTitle className="text-base">{workout.name}</CardTitle>
          <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
            {confirming ? (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                  onClick={handleDeleteClick}
                >
                  {isPending ? "Deleting…" : "Confirm"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancelClick}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" onClick={handleDeleteClick}>
                Delete
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {workout.exercises.map((exercise) => (
              <div key={exercise.id} className="py-2 text-sm space-y-1">
                <span className="font-medium">{exercise.name}</span>
                {exercise.sets.length > 0 && (
                  <div className="text-muted-foreground space-y-0.5">
                    {exercise.sets.map((set) => (
                      <div key={set.id} className="flex justify-between">
                        <span>Set {set.setNumber}</span>
                        <span>
                          {set.reps != null ? `${set.reps} reps` : "—"}
                          {set.weight ? ` @ ${set.weight}kg` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
