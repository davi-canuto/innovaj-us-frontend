"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface DatePickerProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
}

export function DatePicker({ selected, onSelect }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!selected}
          className="data-[empty=true]:text-muted-foreground justify-start text-left font-normal"
        >
          <CalendarIcon />
          {selected ? format(selected,  "dd/MM/yyyy") : <span>Selecione a data</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Calendar mode="single" required selected={selected} onSelect={onSelect} />
      </PopoverContent>
    </Popover>
  );
}
