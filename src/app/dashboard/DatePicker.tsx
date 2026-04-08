"use client";

import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DatePickerProps {
  selectedDate: string; // ISO date string like "2026-04-15"
}

export function DatePicker({ selectedDate }: DatePickerProps) {
  const router = useRouter();

  // Construct date in the browser's local timezone to avoid UTC offset issues
  const [year, month, day] = selectedDate.split("-").map(Number);
  const localDate = new Date(year, month - 1, day);

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    const iso = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
    router.push(`/dashboard?date=${iso}`);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Select Date</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-4 flex justify-center">
        <Calendar
          mode="single"
          selected={localDate}
          onSelect={handleSelect}
        />
      </CardContent>
    </Card>
  );
}
