"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Placeholder workout data — replace with real data fetching later
const MOCK_WORKOUTS = [
  {
    id: "1",
    name: "Morning Push",
    date: new Date(2026, 3, 6),
    exercises: [
      { name: "Bench Press", sets: 4, reps: 8, weight: 80 },
      { name: "Overhead Press", sets: 3, reps: 10, weight: 50 },
      { name: "Tricep Dips", sets: 3, reps: 12, weight: 0 },
    ],
  },
  {
    id: "2",
    name: "Evening Accessory",
    date: new Date(2026, 3, 6),
    exercises: [
      { name: "Lateral Raises", sets: 4, reps: 15, weight: 12 },
      { name: "Cable Flyes", sets: 3, reps: 12, weight: 20 },
    ],
  },
];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const workoutsForDate = MOCK_WORKOUTS.filter((w) =>
    isSameDay(w.date, selectedDate)
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">
          {/* Date Picker */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Date</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-4 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
              />
            </CardContent>
          </Card>

          {/* Workout List */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">
                {format(selectedDate, "do MMM yyyy")}
              </h2>
              <Badge variant="secondary">
                {workoutsForDate.length}{" "}
                {workoutsForDate.length === 1 ? "workout" : "workouts"}
              </Badge>
            </div>

            {workoutsForDate.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No workouts logged for this date.
                </CardContent>
              </Card>
            ) : (
              workoutsForDate.map((workout) => (
                <Card key={workout.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{workout.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y">
                      {workout.exercises.map((exercise, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-2 text-sm"
                        >
                          <span className="font-medium">{exercise.name}</span>
                          <span className="text-muted-foreground">
                            {exercise.sets} × {exercise.reps}
                            {exercise.weight > 0 ? ` @ ${exercise.weight}kg` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
