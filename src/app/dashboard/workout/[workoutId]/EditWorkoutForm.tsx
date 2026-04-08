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
  defaultStartedAt?: Date | null;
}

function toDatetimeLocalValue(date: Date | null | undefined): string {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function EditWorkoutForm({ workoutId, defaultName, defaultStartedAt }: EditWorkoutFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultName,
      startedAt: toDatetimeLocalValue(defaultStartedAt),
    },
  });

  async function onSubmit(values: FormValues) {
    await updateWorkoutAction({
      workoutId,
      name: values.name,
      startedAt: values.startedAt ? new Date(values.startedAt) : undefined,
    });
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Workout Name</Label>
        <Input
          id="name"
          placeholder="e.g. Push Day, Leg Day…"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="startedAt">Start Time</Label>
        <Input
          id="startedAt"
          type="datetime-local"
          {...register("startedAt")}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
