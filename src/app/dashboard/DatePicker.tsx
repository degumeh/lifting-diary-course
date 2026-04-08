"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface DatePickerProps {
  selectedDate: string; // ISO date string like "2026-04-15"
}

export function DatePicker({ selectedDate }: DatePickerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

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
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CalendarIcon className="size-4" />
          {format(localDate, "do MMM yyyy")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto">
        <Calendar
          mode="single"
          selected={localDate}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
