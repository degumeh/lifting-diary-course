"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateWorkoutAction } from "./actions";

const schema = z.object({
  name: z.string().min(1, "Workout name is required"),
  startedAt: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface EditWorkoutFormProps {
  workoutId: string;
  defaultName: string;
  defaultStartedAt: Date | null;
}

export function EditWorkoutForm({
  workoutId,
  defaultName,
  defaultStartedAt,
}: EditWorkoutFormProps) {
  const router = useRouter();

  const defaultStartedAtValue = defaultStartedAt
    ? new Date(defaultStartedAt.getTime() - defaultStartedAt.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    : "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultName,
      startedAt: defaultStartedAtValue,
    },
  });

  async function onSubmit(values: FormValues) {
    await updateWorkoutAction(workoutId, {
      name: values.name,
      startedAt: values.startedAt ? new Date(values.startedAt) : null,
    });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Workout Name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="startedAt">Start Time</Label>
        <Input id="startedAt" type="datetime-local" {...register("startedAt")} />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  );
}
