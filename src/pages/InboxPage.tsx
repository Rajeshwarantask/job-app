import React, { useState } from 'react';
import { InboxViewer } from '@/components/InboxViewer';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { DateRangePicker } from '@/components/DateRangePicker'; // if you have one

const InboxPage = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilter = () => {
    // Optional filter logic based on searchQuery & dateRange
    console.log({ searchQuery, dateRange });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </div>
      </div>

      {/* Inbox Viewer */}
      <InboxViewer searchQuery={searchQuery} dateRange={dateRange} />
    </div>
  );
};

export default InboxPage;
