import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewWorkoutForm } from "./NewWorkoutForm";

interface NewWorkoutPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function NewWorkoutPage({ searchParams }: NewWorkoutPageProps) {
  const { date } = await searchParams;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-6">New Workout</h1>
        <Card>
          <CardHeader>
            <CardTitle>Create a Workout</CardTitle>
          </CardHeader>
          <CardContent>
            <NewWorkoutForm returnDate={date} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
