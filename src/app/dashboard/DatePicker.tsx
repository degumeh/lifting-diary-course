"use client";

import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DatePickerProps {
  selectedDate: Date;
}

export function DatePicker({ selectedDate }: DatePickerProps) {
  const router = useRouter();

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
          selected={selectedDate}
          onSelect={handleSelect}
        />
      </CardContent>
    </Card>
  );
}
