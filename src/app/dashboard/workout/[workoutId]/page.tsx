import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkoutById } from "@/data/workouts";
import { getAllExercises } from "@/data/exercises";
import { EditWorkoutForm } from "./EditWorkoutForm";
import { WorkoutLogger } from "./WorkoutLogger";

interface EditWorkoutPageProps {
  params: Promise<{ workoutId: string }>;
}

export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { workoutId } = await params;
  const [workout, allExercises] = await Promise.all([
    getWorkoutById(userId, workoutId),
    getAllExercises(),
  ]);

  if (!workout) notFound();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Workout</h1>
        <Card>
          <CardHeader>
            <CardTitle>Update Workout</CardTitle>
          </CardHeader>
          <CardContent>
            <EditWorkoutForm workoutId={workout.id} defaultName={workout.name} defaultStartedAt={workout.startedAt} />
          </CardContent>
        </Card>
        <WorkoutLogger
          workoutId={workout.id}
          initialExercises={workout.exercises}
          allExercises={allExercises}
        />
      </div>
    </div>
  );
}
