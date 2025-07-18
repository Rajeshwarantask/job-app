import React from 'react';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar'; // Make sure this is customizable or tailwind-friendly
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

interface Props {
  date: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
  placeholder?: string;
  icon?: React.ReactNode;
}

export const DateRangePicker: React.FC<Props> = ({
  date,
  onChange,
  className,
  placeholder = 'Pick a date range',
  icon = <CalendarIcon className="h-4 w-4 mr-2" />,
}) => {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              "bg-[hsl(273.33,30%,35.29%)/10]",
              "border-[hsl(273.33,30%,35.29%)/20]",
              "text-[hsl(273.33,30%,85%)] hover:bg-[hsl(273.33,30%,35.29%)/20]"
            )}
          >
            {icon}
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'dd MMM yyyy')} - {format(date.to, 'dd MMM yyyy')}
                </>
              ) : (
                format(date.from, 'dd MMM yyyy')
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            "w-auto p-0 rounded-md shadow-md border",
            "bg-[hsl(273.33,30%,35.29%)] text-white",
            "border-[hsl(273.33,30%,45%)]"
          )}
          align="start"
        >
          <Calendar
            mode="range"
            selected={date}
            onSelect={onChange}
            numberOfMonths={2}
            className="bg-[hsl(273.33,30%,35.29%)] text-white"
            classNames={{
              day: 'hover:bg-[hsl(273.33,30%,55%)] hover:text-white',
              day_selected: 'bg-white text-[hsl(273.33,30%,35.29%)]',
              day_today: 'border border-white',
              day_range_start: 'rounded-l-md',
              day_range_end: 'rounded-r-md',
              caption: 'text-white',
              nav: 'text-white',
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
