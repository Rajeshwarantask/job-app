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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="min-h-screen bg-black/20 backdrop-blur-sm">
        {/* Top Controls */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                onClick={() => navigate(-1)}
                className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/20"
              >
                ← Back
              </Button>
            </div>
          </div>

          {/* Inbox Viewer */}
          <InboxViewer searchQuery={searchQuery} dateRange={dateRange} />
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
