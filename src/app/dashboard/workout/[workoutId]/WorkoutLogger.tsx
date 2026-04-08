"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  addExerciseToWorkoutAction,
  removeExerciseFromWorkoutAction,
  addSetAction,
  removeSetAction,
} from "./actions";

type SetData = {
  id: string;
  setNumber: number;
  reps: number | null;
  weight: string | null;
};

type ExerciseData = {
  id: string;
  exerciseId?: string;
  name: string;
  order: number;
  sets: SetData[];
};

interface WorkoutLoggerProps {
  workoutId: string;
  initialExercises: ExerciseData[];
  allExercises: { id: string; name: string }[];
}

export function WorkoutLogger({ workoutId, initialExercises, allExercises }: WorkoutLoggerProps) {
  const [exercises, setExercises] = useState<ExerciseData[]>(initialExercises);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredExercises = allExercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAddExercise(exerciseId: string) {
    const result = await addExerciseToWorkoutAction({ workoutId, exerciseId });
    setExercises((prev) => [...prev, result]);
    setPopoverOpen(false);
    setSearch("");
  }

  async function handleRemoveExercise(workoutExerciseId: string) {
    await removeExerciseFromWorkoutAction({ workoutExerciseId });
    setExercises((prev) => prev.filter((e) => e.id !== workoutExerciseId));
  }

  async function handleAddSet(workoutExerciseId: string, reps: number | undefined, weight: string | undefined) {
    const result = await addSetAction({ workoutExerciseId, reps, weight });
    setExercises((prev) =>
      prev.map((e) =>
        e.id === workoutExerciseId
          ? { ...e, sets: [...e.sets, { id: result.id, setNumber: result.setNumber, reps: result.reps, weight: result.weight }] }
          : e
      )
    );
  }

  async function handleRemoveSet(workoutExerciseId: string, setId: string) {
    await removeSetAction({ setId });
    setExercises((prev) =>
      prev.map((e) =>
        e.id === workoutExerciseId
          ? { ...e, sets: e.sets.filter((s) => s.id !== setId) }
          : e
      )
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">Exercises</h2>

      {exercises.length === 0 && (
        <p className="text-sm text-muted-foreground">No exercises yet — add one below.</p>
      )}

      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          onRemoveExercise={() => handleRemoveExercise(exercise.id)}
          onAddSet={(reps, weight) => handleAddSet(exercise.id, reps, weight)}
          onRemoveSet={(setId) => handleRemoveSet(exercise.id, setId)}
        />
      ))}

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline">+ Add Exercise</Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3 space-y-2">
          <Input
            placeholder="Search exercises…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div className="max-h-60 overflow-y-auto space-y-1">
            {filteredExercises.length === 0 && (
              <p className="text-sm text-muted-foreground px-1">No exercises found.</p>
            )}
            {filteredExercises.map((ex) => (
              <button
                key={ex.id}
                onClick={() => handleAddExercise(ex.id)}
                className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {ex.name}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface ExerciseCardProps {
  exercise: ExerciseData;
  onRemoveExercise: () => void;
  onAddSet: (reps: number | undefined, weight: string | undefined) => Promise<void>;
  onRemoveSet: (setId: string) => Promise<void>;
}

function ExerciseCard({ exercise, onRemoveExercise, onAddSet, onRemoveSet }: ExerciseCardProps) {
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    await onAddSet(reps ? Number(reps) : undefined, weight || undefined);
    setReps("");
    setWeight("");
    setAdding(false);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <CardTitle className="text-base">{exercise.name}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onRemoveExercise} className="text-destructive hover:text-destructive">
          Remove
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {exercise.sets.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-left">
                <th className="pb-1 font-medium">#</th>
                <th className="pb-1 font-medium">Reps</th>
                <th className="pb-1 font-medium">Weight</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {exercise.sets.map((set) => (
                <tr key={set.id}>
                  <td className="py-0.5">{set.setNumber}</td>
                  <td className="py-0.5">{set.reps ?? "—"}</td>
                  <td className="py-0.5">{set.weight ? `${set.weight} kg` : "—"}</td>
                  <td className="py-0.5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-destructive hover:text-destructive"
                      onClick={() => onRemoveSet(set.id)}
                    >
                      ×
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="space-y-1">
            <Label htmlFor={`reps-${exercise.id}`} className="text-xs">Reps</Label>
            <Input
              id={`reps-${exercise.id}`}
              type="number"
              min="1"
              placeholder="10"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-20 h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`weight-${exercise.id}`} className="text-xs">Weight (kg)</Label>
            <Input
              id={`weight-${exercise.id}`}
              type="number"
              min="0"
              step="0.5"
              placeholder="100"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-24 h-8 text-sm"
            />
          </div>
          <Button type="submit" size="sm" className="h-8" disabled={adding}>
            {adding ? "Adding…" : "+ Set"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
