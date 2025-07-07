
import { Job } from "@/types/Job";
import { JobCard } from "@/components/JobCard";

interface StatusBoardProps {
  jobs: Job[];
  onUpdateJobStatus: (jobId: string, status: Job['status']) => void;
  onDeleteJob: (jobId: string) => void;
}

const statusColumns = [
  { key: 'applied' as const, title: 'Applied', color: 'bg-blue-100 text-blue-800' },
  { key: 'interview' as const, title: 'Interview', color: 'bg-purple-100 text-purple-800' },
  { key: 'offer' as const, title: 'Offer', color: 'bg-green-100 text-green-800' },
  { key: 'rejected' as const, title: 'Rejected', color: 'bg-red-100 text-red-800' }
];

export const StatusBoard = ({ jobs, onUpdateJobStatus, onDeleteJob }: StatusBoardProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statusColumns.map((column) => {
        const columnJobs = jobs.filter(job => job.status === column.key);
        
        return (
          <div
  key={column.key}
  className="rounded-lg border border-white/30 text-card-foreground shadow-sm bg-white/0 backdrop-blur-sm hover:bg-white/2 transition-all duration-300 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[cornflowerblue]">{column.title}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${column.color}`}>
                {columnJobs.length}
              </span>
            </div>
            
            <div className="space-y-3 min-h-[200px]">
              {columnJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onUpdateStatus={onUpdateJobStatus}
                  onDelete={onDeleteJob}
                />
              ))}
              
              {columnJobs.length === 0 && (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-gray-500 text-sm">No applications in this stage</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
