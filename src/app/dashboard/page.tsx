import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "./DatePicker";
import { getWorkoutsForUserOnDate } from "@/data/workouts";

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { userId } = await auth();
  const { date: dateParam } = await searchParams;

  const todayIso = new Date().toLocaleDateString("en-CA"); // "YYYY-MM-DD" in local time
  const selectedDateIso = dateParam ?? todayIso;
  const selectedDate = new Date(selectedDateIso + "T00:00:00");
  selectedDate.setHours(0, 0, 0, 0);

  const workoutList = userId
    ? await getWorkoutsForUserOnDate(userId, selectedDate)
    : [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">
          <DatePicker selectedDate={selectedDateIso} />

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">
                {format(selectedDate, "do MMM yyyy")}
              </h2>
              <Badge variant="secondary">
                {workoutList.length}{" "}
                {workoutList.length === 1 ? "workout" : "workouts"}
              </Badge>
            </div>

            {workoutList.length === 0 ? (
              <Card>
                <CardContent className="py-12 flex flex-col items-center gap-4 text-center text-muted-foreground">
                  <p>No workouts logged for this date.</p>
                  <Button asChild>
                    <Link href={`/dashboard/workout/new?date=${selectedDateIso}`}>
                      Log New Workout
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              workoutList.map((workout) => (
                <Link key={workout.id} href={`/dashboard/workout/${workout.id}`}>
                  <Card className="hover:bg-accent transition-colors cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-base">{workout.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="divide-y">
                        {workout.exercises.map((exercise) => (
                          <div
                            key={exercise.id}
                            className="py-2 text-sm space-y-1"
                          >
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
