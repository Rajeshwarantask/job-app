
import { useState } from "react";
import { Job } from "@/types/Job";
import { StatusBoard } from "@/components/StatusBoard";
import { StatsOverview } from "@/components/StatsOverview";
import { JobList } from "@/components/JobList";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardProps {
  jobs: Job[];
  onUpdateJobStatus: (jobId: string, status: Job['status']) => void;
  onDeleteJob: (jobId: string) => void;
}

export const Dashboard = ({ jobs, onUpdateJobStatus, onDeleteJob }: DashboardProps) => {
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  return (
    <div className="space-y-8">
      <StatsOverview jobs={jobs} />
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Your Applications</h2>
        
        <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-1">
          <Button
            variant={viewMode === 'board' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('board')}
            className={viewMode === 'board' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Board
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      {viewMode === 'board' ? (
        <StatusBoard 
          jobs={jobs}
          onUpdateJobStatus={onUpdateJobStatus}
          onDeleteJob={onDeleteJob}
        />
      ) : (
        <JobList 
          jobs={jobs}
          onUpdateJobStatus={onUpdateJobStatus}
          onDeleteJob={onDeleteJob}
        />
      )}
    </div>
  );
};
