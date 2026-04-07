import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewWorkoutForm } from "./NewWorkoutForm";

export default function NewWorkoutPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-6">New Workout</h1>
        <Card>
          <CardHeader>
            <CardTitle>Create a Workout</CardTitle>
          </CardHeader>
          <CardContent>
            <NewWorkoutForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
