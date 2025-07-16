import React from 'react';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar'; // Ensure you have a Calendar UI
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
            className={cn("w-full justify-start text-left font-normal")}
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
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={date}
            onSelect={onChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
