import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getWorkoutById } from "@/data/workouts";
import { EditWorkoutForm } from "./EditWorkoutForm";

interface WorkoutPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkoutPage({ params }: WorkoutPageProps) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  const workout = await getWorkoutById(userId, id);

  if (!workout) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">← Back</Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{workout.name}</h1>
            {workout.startedAt && (
              <p className="text-sm text-muted-foreground mt-1">
                Started: {format(workout.startedAt, "PPp")}
              </p>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Edit Workout</CardTitle>
          </CardHeader>
          <CardContent>
            <EditWorkoutForm
              workoutId={workout.id}
              defaultName={workout.name}
              defaultStartedAt={workout.startedAt}
            />
          </CardContent>
        </Card>

        {workout.exercises.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No exercises logged for this workout.
            </CardContent>
          </Card>
        ) : (
          workout.exercises.map((exercise) => (
            <Card key={exercise.id}>
              <CardHeader>
                <CardTitle className="text-base">{exercise.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {exercise.sets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sets logged.</p>
                ) : (
                  <div className="divide-y">
                    {exercise.sets.map((set) => (
                      <div key={set.id} className="py-2 flex justify-between text-sm">
                        <span>Set {set.setNumber}</span>
                        <span className="text-muted-foreground">
                          {set.reps != null ? `${set.reps} reps` : "—"}
                          {set.weight ? ` @ ${set.weight}kg` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
