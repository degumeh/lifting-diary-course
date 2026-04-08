import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";
import { DatePicker } from "./DatePicker";
import { getWorkoutsForUserOnDate } from "@/data/workouts";
import { WorkoutList } from "./WorkoutList";

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { userId } = await auth();
  const { date: dateParam } = await searchParams;

  const todayIso = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD" in UTC
  const selectedDateIso = dateParam ?? todayIso;

  const workoutList = userId
    ? await getWorkoutsForUserOnDate(userId, selectedDateIso)
    : [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <DatePicker selectedDate={selectedDateIso} />
            <Badge variant="secondary">
              {workoutList.length}{" "}
              {workoutList.length === 1 ? "workout" : "workouts"}
            </Badge>
            <Button asChild className="ml-auto">
              <Link href={`/dashboard/workout/new?date=${selectedDateIso}`}>
                Log New Workout
              </Link>
            </Button>
          </div>

          <WorkoutList initialWorkouts={workoutList} />
        </div>
      </div>
    </div>
  );
}
